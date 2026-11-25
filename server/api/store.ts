// The self-serve shop. Public: the catalogue and a template to try. Signed-in customers: buy, pay,
// and edit / publish their own invitations. Customers sign in with an emailed code.
import { PHOTO_MAX_BYTES, type PhotoMime, photoMimes, photoUrl } from '@shared/photos';
import { emailInput, verifyInput } from '@shared/schemas/admin';
import { type CheckoutStart, razorpayProof } from '@shared/schemas/checkout';
import { customerInput, slugInput, wishModerationInput } from '@shared/schemas/composer';
import type { Context, MiddlewareHandler } from 'hono';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

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
import {
    checkoutPaid,
    checkoutState,
    ownedCheckout,
    setProviderOrder,
    startDesignCheckout,
    startOrderCheckout,
} from '../repos/checkouts';
import { refreshIfLive, setSlug } from '../repos/composer';
import { listWishes, moderateWish } from '../repos/guests';
import { listTracks } from '../repos/music';
import { OrderError } from '../repos/orders';
import { storePhoto } from '../repos/photos';
import { noteDownload, refundIsOpen } from '../repos/refunds';
import {
    createCustomerSession,
    customerByEmail,
    customerForSession,
    listStoreTemplates,
    myInvitation,
    myInvitations,
    myOrders,
    ownsInvitation,
    publishMine,
    saveMyContent,
    shopCurrency,
    type StoreCustomer,
    storeTemplate,
} from '../repos/store';
import { sendMail } from '../services/mailer';
import { paymentMode, takePayment } from '../services/payments';
import {
    checkoutIsGenuine,
    createRazorpayOrder,
    PaymentError,
    razorpayKeyId,
} from '../services/razorpay';
import { cardsApi } from './cards';
import { guestListApi } from './guest-list';
import { uploadInvitationMusic } from './music';

interface Open {
    id: string;
    amount: number;
    currency: string;
}

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

// While trying, only words, photos and ceremonies; the rest comes once the invitation is theirs.
const contentInput = customerInput.pick({
    content: true,
    events: true,
});

const isPhotoMime = (type: string): type is PhotoMime =>
    (photoMimes as readonly string[]).includes(type);

const json = async (c: Context<StoreEnv>): Promise<unknown> =>
    c.req.json<unknown>().catch(() => null);

export const storeApi = new Hono<StoreEnv>();

storeApi.onError((error, c) => {
    if (error instanceof OrderError || error instanceof PaymentError)
        return fail(c, 409, error.message);
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
    try {
        await sendMail({
            to: email,
            subject: `${code} is your Toran code`,
            text: `Your Toran code is ${code}. It expires in 10 minutes.`,
            html: `<p>Your Toran code is</p><p style="font-size:28px;letter-spacing:6px"><b>${code}</b></p><p>It expires in 10 minutes. If you didn’t ask for it, ignore this email.</p>`,
        });
    } catch (error) {
        // Until the sending domain is verified, the mail service delivers to the studio's own inbox only.
        console.error('[store] sign-in email', error);
        return fail(
            c,
            409,
            'We couldn’t email a code to that address just yet. Message us on WhatsApp and we’ll set up your invitation.',
        );
    }
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
        payments: paymentMode(c.env.config),
    });
});

// ── Paying ──────────────────────────────────────────────────────────────────

// Starts a payment. Nothing is added to the account yet: that happens once the money has arrived.
async function start(c: Context<StoreEnv>, make: (provider: 'razorpay' | 'fake') => Promise<Open>) {
    const mode = paymentMode(c.env.config);
    if (mode === 'off')
        return fail(c, 409, 'Online payment opens soon. Your words stay on this device for a day');
    if (!(await c.env.rateLimit.limit(`checkout:${c.get('customer').id}`)).success)
        return fail(c, 429, 'Too many attempts. Try again in a minute');
    const checkout = await make(mode);
    const { id, amount, currency } = checkout;
    const answer: CheckoutStart = {
        id,
        provider: mode,
        amount,
        currency,
    };
    if (mode === 'razorpay') {
        const order = await createRazorpayOrder({
            amount,
            currency,
            reference: id,
        });
        await setProviderOrder(id, order.id);
        answer.keyId = razorpayKeyId();
        answer.providerOrderId = order.id;
    }
    return c.json(answer, 201);
}

storeApi.post('/me/checkout/:slug', async (c) => {
    const parsed = contentInput.safeParse(await json(c));
    if (!parsed.success)
        return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check your details');
    const where = await shopWhere(c);
    return start(c, (provider) =>
        startDesignCheckout(
            c.get('customer').id,
            c.req.param('slug'),
            parsed.data,
            where,
            provider,
        ),
    );
});

// Paying what is left on an order that already exists.
storeApi.post('/me/orders/:id/checkout', async (c) =>
    start(c, (provider) => startOrderCheckout(c.get('customer').id, c.req.param('id'), provider)),
);

storeApi.get('/me/checkouts/:id', async (c) =>
    c.json(checkoutState(await ownedCheckout(c.get('customer').id, c.req.param('id')))),
);

storeApi.post('/me/checkouts/:id/confirm', async (c) => {
    const checkout = await ownedCheckout(c.get('customer').id, c.req.param('id'));
    if (checkout.provider === 'fake') {
        // Test checkout: development only. Anywhere else it would hand out invitations for free.
        if (paymentMode(c.env.config) !== 'fake') return fail(c, 409, 'Payment not found');
        return c.json(await checkoutPaid(checkout.id, `test_${checkout.id}`));
    }
    const parsed = razorpayProof.safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, 'The payment could not be confirmed');
    const proof = parsed.data;
    const genuine =
        proof.razorpay_order_id === checkout.providerOrderId &&
        (await checkoutIsGenuine({
            orderId: proof.razorpay_order_id,
            paymentId: proof.razorpay_payment_id,
            signature: proof.razorpay_signature,
        }));
    if (!genuine) return fail(c, 422, 'The payment could not be confirmed');
    return c.json(await takePayment(proof.razorpay_payment_id));
});

storeApi.get('/me/orders', async (c) => c.json(await myOrders(c.get('customer').id)));

// The couple's guest list: families, links, groups, who sees what, and the replies.
storeApi.route(
    '/me/invitations',
    guestListApi<StoreEnv>((c, id) => ownsInvitation(c.get('customer').id, id)),
);

// Its matching cards and PDF, part of every invitation once it's paid for.
storeApi.route(
    '/me/invitations',
    cardsApi<StoreEnv>({
        see: (c, id) => ownsInvitation(c.get('customer').id, id),
        download: async (c, id) => {
            const { balance } = await myInvitation(c.get('customer').id, id);
            if (balance > 0) throw new OrderError('Complete payment to download your cards');
        },
        downloaded: noteDownload,
        refundable: refundIsOpen,
    }),
);

storeApi.get('/me/invitations/:id', async (c) =>
    c.json(await myInvitation(c.get('customer').id, c.req.param('id'))),
);

storeApi.put('/me/invitations/:id', async (c) => {
    const parsed = customerInput.safeParse(await json(c));
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

// The studio's licensed tracks, to choose from.
storeApi.get('/me/music', async (c) => c.json(await listTracks(true)));

// Their own song, once they confirm they may use it.
storeApi.post('/me/invitations/:id/music', async (c) => {
    const id = c.req.param('id');
    await ownsInvitation(c.get('customer').id, id);
    if (!(await c.env.rateLimit.limit(`song:${id}`)).success)
        return fail(c, 429, 'Too many uploads. Try again in a minute');
    return uploadInvitationMusic(c, id);
});

// Wishes guests left: nothing appears on the invitation until the family approves it.
storeApi.get('/me/invitations/:id/wishes', async (c) => {
    await ownsInvitation(c.get('customer').id, c.req.param('id'));
    return c.json(await listWishes(c.req.param('id')));
});

storeApi.patch('/me/invitations/:id/wishes/:wishId', async (c) => {
    const { id, wishId } = c.req.param();
    await ownsInvitation(c.get('customer').id, id);
    const parsed = wishModerationInput.safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, 'Invalid status');
    await moderateWish(id, wishId, parsed.data.status);
    await refreshIfLive(id);
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
