import { cleanPrices, DEFAULT_TEMPLATE_PRICE, shopPrice } from '@shared/pricing';
import { describe, expect, it } from 'vitest';

describe('shop prices', () => {
    it('sells at the default price until the template has its own', () => {
        expect(shopPrice(null, null, 'INR')).toEqual({
            price: DEFAULT_TEMPLATE_PRICE.INR,
            compare: null,
            off: null,
        });
    });

    it("uses the template's own price, per currency", () => {
        const own = { INR: 99900 };
        expect(shopPrice(own, null, 'INR')?.price).toBe(99900);
        // Never priced in dollars: the default dollar price.
        expect(shopPrice(own, null, 'USD')?.price).toBe(DEFAULT_TEMPLATE_PRICE.USD);
    });

    it('converts the dollar price to a clean local price outside India', () => {
        const rates = {
            updatedAt: '2026-11-15T00:00:00Z',
            rates: {
                AED: 3.6725,
                GBP: 0.7894,
                JPY: 154.83,
            },
        };
        // $50 → AED 183.63 → 185; → £39.47 → £39; → ¥7,741 → ¥7,750 (no decimals in yen).
        expect(shopPrice(null, null, 'AED', rates)?.price).toBe(18500);
        expect(shopPrice(null, null, 'GBP', rates)?.price).toBe(3900);
        expect(shopPrice(null, null, 'JPY', rates)?.price).toBe(7750);
        // A currency the snapshot doesn't have can't be priced.
        expect(shopPrice(null, null, 'EUR', rates)).toBeNull();
    });

    it('shows a was price and saving only when it is higher', () => {
        expect(shopPrice({ INR: 99900 }, { INR: 199900 }, 'INR')).toEqual({
            price: 99900,
            compare: 199900,
            off: 50,
        });
        expect(shopPrice({ INR: 99900 }, { INR: 50000 }, 'INR')?.compare).toBeNull();
    });

    it('has no local price without exchange rates', () => {
        expect(shopPrice(null, null, 'GBP')).toBeNull();
    });

    it('stores an empty map as null', () => {
        expect(cleanPrices({})).toBeNull();
        expect(cleanPrices({ INR: 100 })).toEqual({ INR: 100 });
    });
});
