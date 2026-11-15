// The self-serve shop. Public: the catalogue and a template to try. Signed-in customers: buy, pay,
// and edit / publish their own invitations. Customers sign in with an emailed code.
import { PHOTO_MAX_BYTES, type PhotoMime, photoMimes, photoUrl } from '@shared/photos';
import { emailInput, verifyInput } from '@shared/schemas/admin';
import { eventInput, saveInvitationInput, slugInput } from '@shared/schemas/composer';
import type { Context, MiddlewareHandler } from 'hono';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';

import type { AppEnv } from '../app';
import { randomCode, randomToken, sha256, timingSafeEqual } from '../lib/crypto';
import { clientIp, fail } from '../lib/http';
import {
    bumpCodeAttempts,
    consumeCode,
    deleteSession,
    latestValidCode,
    storeCode,
} from '../repos/auth';
import { setSlug } from '../repos/composer';
import { OrderError } from '../repos/orders';
import { storePhoto } from '../repos/photos';
import {
    buyTemplate,
    createCustomerSession,
    customerByEmail,
    customerForSession,
    listStoreTemplates,
    myInvitation,
    myInvitations,
    ownsInvitation,
    payOrderFake,
    publishMine,
    saveMyContent,
    shopCurrency,
    type StoreCustomer,
    storeTemplate,
} from '../repos/store';
import { sendMail } from '../services/mailer';

interface StoreEnv extends AppEnv {
    Variables: { customer: StoreCustomer };
}

// Set by the shop's currency switcher (readable by the page, no secrets in it).
const CURRENCY_COOKIE = 'toran_currency';
const CODE_TTL_MS = 10 * 60_000;
const MAX_ATTEMPTS = 5;
const SESSION_DAYS = 60;

// Separate from the admin cookie, and from the admin's codes (the "customer:" namespace), so a
// customer sign-in can never open the studio.
const cookieName = (c: Context<StoreEnv>) =>
    c.env.config.ENVIRONMENT === 'development' ? 'toran_customer' : '__Host-toran_customer';
const codeKey = (email: string) => `customer:${email}`;

const readToken = (c: Context<StoreEnv>) => getCookie(c, cookieName(c));

const requireCustomer: MiddlewareHandler<StoreEnv> = async (c, next) => {
    const token = readToken(c);
    const customer = token ? await customerForSession(await sha256(token)) : undefined;
    if (!customer) return fail(c, 401, 'Sign in to continue');
    c.set('customer', customer);
    await next();
};

// Where the visitor is (Cloudflare's country stamp; ?country= in local testing) and the currency
// they see: rupees in India, their own currency elsewhere, or what they picked in the switcher.
async function shopWhere(c: Context<StoreEnv>) {
    const country = c.req.header('cf-ipcountry') ?? c.req.query('country') ?? null;
    const known = country && country !== 'XX' && country !== 'T1' ? country : null;
    const { currency, rates } = await shopCurrency(known, getCookie(c, CURRENCY_COOKIE));
    return {
        currency,
        rates,
        country: known,
    };
}

const contentInput = saveInvitationInput
    .pick({ content: true })
    .extend({ events: z.array(eventInput).max(30) });

const isPhotoMime = (type: string): type is PhotoMime =>
    (photoMimes as readonly string[]).includes(type);

const json = async (c: Context<StoreEnv>): Promise<unknown> =>
    c.req.json<unknown>().catch(() => null);

export const storeApi = new Hono<StoreEnv>();

storeApi.onError((error, c) => {
    if (error instanceof OrderError) return fail(c, 409, error.message);
    console.error('[store]', error);
    return c.json(
        {
            ok: false,
            error: 'Something went wrong',
        },
        500,
    );
});

// ── Public ──────────────────────────────────────────────────────────────────

storeApi.get('/templates', async (c) => {
    const { currency, rates } = await shopWhere(c);
    return c.json({
        currency,
        templates: await listStoreTemplates(currency, rates),
    });
});

storeApi.get('/templates/:slug', async (c) => {
    const { currency, rates } = await shopWhere(c);
    return c.json(await storeTemplate(c.req.param('slug'), currency, rates));
});

// ── Sign in ─────────────────────────────────────────────────────────────────

storeApi.post('/auth/request-code', async (c) => {
    const parsed = emailInput.safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, 'Enter a valid email');
    const email = parsed.data.email.toLowerCase();
    if (!(await c.env.rateLimit.limit(`cotp:${email}:${clientIp(c)}`)).success)
        return fail(c, 429, 'Too many attempts. Try again in a minute');
    const code = randomCode();
    await storeCode(
        codeKey(email),
        await sha256(`${codeKey(email)}:${code}`),
        new Date(Date.now() + CODE_TTL_MS).toISOString(),
    );
    await sendMail({
        to: email,
        subject: `${code} is your Toran code`,
        text: `Your Toran code is ${code}. It expires in 10 minutes.`,
        html: `<p>Your Toran code is</p><p style="font-size:28px;letter-spacing:6px"><b>${code}</b></p><p>It expires in 10 minutes. If you didn’t ask for it, ignore this email.</p>`,
    });
    return c.json({ ok: true });
});

storeApi.post('/auth/verify', async (c) => {
    const parsed = verifyInput.safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, 'Enter the 6-digit code');
    const email = parsed.data.email.toLowerCase();
    const record = await latestValidCode(codeKey(email));
    if (!record || record.attempts >= MAX_ATTEMPTS)
        return fail(c, 401, 'Code expired. Ask for a new one');
    const ok = timingSafeEqual(
        record.codeHash,
        await sha256(`${codeKey(email)}:${parsed.data.code}`),
    );
    if (!ok) {
        await bumpCodeAttempts(record.id, record.attempts + 1);
        return fail(c, 401, 'That code isn’t right');
    }
    await consumeCode(record.id);
    const customer = await customerByEmail(email);
    const token = randomToken();
    await createCustomerSession(
        await sha256(token),
        customer.id,
        new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString(),
    );
    setCookie(c, cookieName(c), token, {
        httpOnly: true,
        secure: c.env.config.ENVIRONMENT !== 'development',
        sameSite: 'Lax',
        path: '/',
        maxAge: SESSION_DAYS * 86400,
    });
    return c.json({ ok: true });
});

storeApi.post('/auth/logout', async (c) => {
    const token = readToken(c);
    if (token) await deleteSession(await sha256(token));
    deleteCookie(c, cookieName(c), { path: '/' });
    return c.json({ ok: true });
});

// ── Signed in ───────────────────────────────────────────────────────────────

storeApi.use('/me/*', requireCustomer);
storeApi.use('/me', requireCustomer);

storeApi.get('/me', async (c) => {
    const customer = c.get('customer');
    return c.json({
        customer,
        invitations: await myInvitations(customer.id),
        payments: c.env.config.PAYMENTS_DRIVER,
    });
});

storeApi.post('/me/buy/:slug', async (c) => {
    const parsed = contentInput.safeParse(await json(c));
    if (!parsed.success)
        return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check your details');
    return c.json(
        await buyTemplate(c.get('customer'), c.req.param('slug'), parsed.data, await shopWhere(c)),
    );
});

storeApi.post('/me/orders/:id/pay', async (c) => {
    // Razorpay checkout replaces this once the account exists; until then payments are simulated.
    if (c.env.config.PAYMENTS_DRIVER !== 'fake')
        return fail(c, 409, 'Online payment is not set up yet');
    await payOrderFake(c.get('customer').id, c.req.param('id'));
    return c.json({ ok: true });
});

storeApi.get('/me/invitations/:id', async (c) =>
    c.json(await myInvitation(c.get('customer').id, c.req.param('id'))),
);

storeApi.put('/me/invitations/:id', async (c) => {
    const parsed = contentInput.safeParse(await json(c));
    if (!parsed.success)
        return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check your details');
    await saveMyContent(c.get('customer').id, c.req.param('id'), parsed.data);
    return c.json({ ok: true });
});

storeApi.post('/me/invitations/:id/publish', async (c) => {
    await publishMine(c.get('customer').id, c.req.param('id'));
    return c.json({ ok: true });
});

storeApi.post('/me/invitations/:id/slug', async (c) => {
    const parsed = slugInput.safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check the link');
    await ownsInvitation(c.get('customer').id, c.req.param('id'));
    await setSlug(c.req.param('id'), parsed.data.slug);
    return c.json({ ok: true });
});

storeApi.post('/me/invitations/:id/photos', async (c) => {
    await ownsInvitation(c.get('customer').id, c.req.param('id'));
    const body = (await c.req.parseBody()) as Record<string, unknown>;
    const file = body.file;
    if (!(file instanceof File)) return fail(c, 422, 'Choose a photo');
    if (!isPhotoMime(file.type)) return fail(c, 422, 'Use a JPG, PNG, WebP or AVIF photo');
    if (file.size > PHOTO_MAX_BYTES) return fail(c, 422, 'Keep each photo under 6 MB');
    const key = await storePhoto(c.req.param('id'), file.type, await file.arrayBuffer());
    return c.json(
        {
            key,
            url: photoUrl(key),
        },
        201,
    );
});
