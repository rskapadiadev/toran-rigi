import { getPlatform } from '../platform/context';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Invitations don't show the bot check yet, so a reply without a token is let through (the rate limit
// still applies): refusing it would turn away every guest. A token that is sent must be genuine.
// Development skips verification so the app runs fully offline.
export async function verifyTurnstile(
    token: string | undefined,
    ip: string | undefined,
): Promise<boolean> {
    if (!token) return true;
    const { config } = getPlatform();
    if (config.ENVIRONMENT === 'development') return true;
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
