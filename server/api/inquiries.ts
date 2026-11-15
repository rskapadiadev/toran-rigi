// Public lead capture ("Create your invite" on demos). Rate-limited per visitor like RSVPs.
import { inquiryInput } from '@shared/schemas/inquiry';
import { Hono } from 'hono';

import type { AppEnv } from '../app';
import { clientIp, fail } from '../lib/http';
import { createInquiry } from '../repos/inquiries';

export const inquiriesApi = new Hono<AppEnv>();

inquiriesApi.post('/', async (c) => {
    const ip = clientIp(c);
    if (!(await c.env.rateLimit.limit(`inquiry:${ip}`)).success)
        return fail(c, 429, 'Too many requests. Try again in a minute.');
    const parsed = inquiryInput.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check the form');
    await createInquiry(parsed.data, 'demo', c.req.header('cf-ipcountry') ?? undefined);
    return c.json({ ok: true }, 201);
});
