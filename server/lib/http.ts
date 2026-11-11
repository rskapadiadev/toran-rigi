import type { Context } from 'hono';

export const clientIp = (c: Context) =>
    c.req.header('cf-connecting-ip') ??
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

export const fail = (c: Context, status: 400 | 401 | 403 | 404 | 409 | 422 | 429, error: string) =>
    c.json(
        {
            ok: false,
            error,
        },
        status,
    );
