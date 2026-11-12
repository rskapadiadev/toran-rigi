import { can, type Permission } from '@shared/permissions';
import type { Context, MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

import type { AppEnv } from '../app';
import { sha256 } from '../lib/crypto';
import { type AdminUser, userForSession } from '../repos/auth';

export interface AdminEnv extends AppEnv {
    Variables: { user: AdminUser };
}

const SESSION_DAYS = 14;

// __Host- prefix (Secure, Path=/, no Domain) keeps the session bound to toran.<domain> only,
// so other Rigi products and invitation pages can never read it.
const cookieName = <E extends AppEnv>(c: Context<E>) =>
    c.env.config.ENVIRONMENT === 'development' ? 'toran_admin' : '__Host-toran_admin';

export function setSessionCookie<E extends AppEnv>(c: Context<E>, token: string) {
    setCookie(c, cookieName(c), token, {
        httpOnly: true,
        secure: c.env.config.ENVIRONMENT !== 'development',
        sameSite: 'Lax',
        path: '/',
        maxAge: SESSION_DAYS * 86400,
    });
}

export const sessionExpiry = () => new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();

export function clearSessionCookie<E extends AppEnv>(c: Context<E>) {
    deleteCookie(c, cookieName(c), { path: '/' });
}

export const readSessionToken = <E extends AppEnv>(c: Context<E>) => getCookie(c, cookieName(c));

export const requireAdmin: MiddlewareHandler<AdminEnv> = async (c, next) => {
    const token = readSessionToken(c);
    const user = token ? await userForSession(await sha256(token)) : undefined;
    if (!user)
        return c.json(
            {
                ok: false,
                error: 'Unauthorised',
            },
            401,
        );
    c.set('user', user);
    await next();
};

export const requirePermission =
    (permission: Permission): MiddlewareHandler<AdminEnv> =>
    async (c, next) => {
        if (!can(c.get('user').role, permission))
            return c.json(
                {
                    ok: false,
                    error: 'Forbidden',
                },
                403,
            );
        await next();
    };
