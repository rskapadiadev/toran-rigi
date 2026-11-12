import { emailInput, verifyInput } from '@shared/schemas/admin';
import { Hono } from 'hono';

import { randomCode, randomToken, sha256, timingSafeEqual } from '../lib/crypto';
import { clientIp, fail } from '../lib/http';
import {
    type AdminEnv,
    clearSessionCookie,
    readSessionToken,
    requireAdmin,
    sessionExpiry,
    setSessionCookie,
} from '../middleware/auth';
import {
    bumpCodeAttempts,
    consumeCode,
    createSession,
    deleteSession,
    findActiveUserByEmail,
    latestValidCode,
    storeCode,
} from '../repos/auth';
import { sendMail } from '../services/mailer';

const CODE_TTL_MS = 10 * 60_000;
const MAX_ATTEMPTS = 5;

export const authApi = new Hono<AdminEnv>();

authApi.post('/request-code', async (c) => {
    const parsed = emailInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return fail(c, 422, 'Enter a valid email');
    const email = parsed.data.email.toLowerCase();
    if (!(await c.env.rateLimit.limit(`otp:${email}:${clientIp(c)}`)).success)
        return fail(c, 429, 'Too many attempts');
    const user = await findActiveUserByEmail(email);
    // Same response whether or not the user exists, so emails can't be enumerated.
    if (user) {
        const code = randomCode();
        await storeCode(
            email,
            await sha256(`${email}:${code}`),
            new Date(Date.now() + CODE_TTL_MS).toISOString(),
        );
        await sendMail({
            to: email,
            subject: `${code} is your Toran admin code`,
            text: `Your Toran sign-in code is ${code}. It expires in 10 minutes.`,
            html: `<p>Your Toran sign-in code is</p><p style="font-size:28px;letter-spacing:6px"><b>${code}</b></p><p>It expires in 10 minutes. If you didn’t request it, ignore this email.</p>`,
        });
    }
    return c.json({ ok: true });
});

authApi.post('/verify', async (c) => {
    const parsed = verifyInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return fail(c, 422, 'Enter the 6-digit code');
    const email = parsed.data.email.toLowerCase();
    const record = await latestValidCode(email);
    if (!record || record.attempts >= MAX_ATTEMPTS)
        return fail(c, 401, 'Code expired — request a new one');
    const ok = timingSafeEqual(record.codeHash, await sha256(`${email}:${parsed.data.code}`));
    if (!ok) {
        await bumpCodeAttempts(record.id, record.attempts + 1);
        return fail(c, 401, 'Incorrect code');
    }
    const user = await findActiveUserByEmail(email);
    if (!user) return fail(c, 401, 'Incorrect code');
    await consumeCode(record.id);
    const token = randomToken();
    await createSession(await sha256(token), user.id, sessionExpiry());
    setSessionCookie(c, token);
    return c.json({ ok: true });
});

authApi.post('/logout', async (c) => {
    const token = readSessionToken(c);
    if (token) await deleteSession(await sha256(token));
    clearSessionCookie(c);
    return c.json({ ok: true });
});

authApi.get('/me', requireAdmin, (c) =>
    c.json({
        ok: true,
        user: c.get('user'),
    }),
);
