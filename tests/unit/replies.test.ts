import { afterEach, describe, expect, it, vi } from 'vitest';

import { verifyTurnstile } from '../../server/lib/turnstile';

interface Setting {
    ENVIRONMENT: string;
}

const config: Setting = vi.hoisted(() => ({ ENVIRONMENT: 'production' }));
vi.mock('../../server/platform/context', () => ({ getPlatform: () => ({ config }) }));

const answer = (success: boolean) =>
    vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(Response.json({ success }))),
    );

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('guest replies on the live site', () => {
    it('are not turned away for lacking a bot check the page never shows', async () => {
        expect(await verifyTurnstile(undefined, '1.2.3.4')).toBe(true);
    });

    it('still need any check they do send to be genuine', async () => {
        answer(false);
        expect(await verifyTurnstile('forged', '1.2.3.4')).toBe(false);
        answer(true);
        expect(await verifyTurnstile('genuine', '1.2.3.4')).toBe(true);
    });
});
