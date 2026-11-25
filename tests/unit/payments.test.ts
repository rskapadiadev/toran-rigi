import { describe, expect, it } from 'vitest';

import { hmacSha256 } from '../../server/lib/crypto';
import { paymentMode } from '../../server/services/payments';

const keys = {
    RAZORPAY_KEY_ID: 'rzp_test_x',
    RAZORPAY_KEY_SECRET: 'secret',
};

describe('taking money', () => {
    it('never falls back to the test checkout outside development', () => {
        for (const ENVIRONMENT of ['staging', 'production'] as const) {
            const config = {
                ENVIRONMENT,
                PAYMENTS_DRIVER: 'fake' as const,
            };
            expect(
                paymentMode({
                    ...config,
                    ...keys,
                }),
            ).toBe('off');
        }
    });

    it('is off until both Razorpay keys are there', () => {
        const config = {
            ENVIRONMENT: 'production' as const,
            PAYMENTS_DRIVER: 'razorpay' as const,
        };
        expect(
            paymentMode({
                ...config,
                RAZORPAY_KEY_ID: 'rzp_live_x',
                RAZORPAY_KEY_SECRET: undefined,
            }),
        ).toBe('off');
        expect(
            paymentMode({
                ...config,
                ...keys,
            }),
        ).toBe('razorpay');
    });

    it('signs as Razorpay does', async () => {
        // RFC 4231, test case 2.
        expect(await hmacSha256('Jefe', 'what do ya want for nothing?')).toBe(
            '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
        );
    });
});
