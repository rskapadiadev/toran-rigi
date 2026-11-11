import { getPlatform } from '../platform/context';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Development skips verification so the app runs fully offline; staging/production always verify.
export async function verifyTurnstile(
    token: string | undefined,
    ip: string | undefined,
): Promise<boolean> {
    const { config } = getPlatform();
    if (config.ENVIRONMENT === 'development') return true;
    if (!token) return false;
    const body = new FormData();
    body.set('secret', config.TURNSTILE_SECRET_KEY);
    body.set('response', token);
    if (ip) body.set('remoteip', ip);
    const res = await fetch(VERIFY_URL, {
        method: 'POST',
        body,
    });
    const result: { success?: boolean } = await res.json();
    return result.success === true;
}
