// Shop prices: every template is priced on its own (packages are never shown to customers), in
// rupees for India and in US dollars for everyone else, shown and charged in the visitor's own
// currency at a stored exchange-rate snapshot (see fx.ts).
import { z } from 'zod';

import { convertUsd, type RateSnapshot } from './fx';

// The two currencies the studio prices templates in.
export const baseCurrencies = ['INR', 'USD'] as const;
export type BaseCurrency = (typeof baseCurrencies)[number];

// What a new template sells for until the studio changes it (minor units): ₹799 / $50.
export const DEFAULT_TEMPLATE_PRICE = {
    INR: 79900,
    USD: 5000,
} as const;

// The "was" price new templates show struck through beside it: ₹999 / $75.
export const DEFAULT_TEMPLATE_WAS_PRICE = {
    INR: 99900,
    USD: 7500,
} as const;

const amount = z.number().int().positive().max(100_000_000);

// Minor units per base currency, either or both.
export const priceMapSchema = z.partialRecord(z.enum(baseCurrencies), amount);
export type PriceMap = z.infer<typeof priceMapSchema>;

export interface ShopPrice {
    price: number;
    // Struck-through "was" price, or null.
    compare: number | null;
    // Whole-number percentage saved, or null.
    off: number | null;
}

// India pays the rupee price; everyone else the dollar price, converted to their currency.
function amountIn(map: PriceMap | null | undefined, currency: string, rates: RateSnapshot | null) {
    if (currency === 'INR') return map?.INR;
    const usd = map?.USD;
    return usd === undefined ? undefined : (convertUsd(usd, currency, rates) ?? undefined);
}

export function shopPrice(
    own: PriceMap | null | undefined,
    compare: PriceMap | null | undefined,
    currency: string,
    rates: RateSnapshot | null = null,
): ShopPrice | null {
    const price =
        amountIn(own, currency, rates) ?? amountIn(DEFAULT_TEMPLATE_PRICE, currency, rates);
    if (price === undefined) return null;
    const was = amountIn(compare, currency, rates);
    const valid = was !== undefined && was > price ? was : null;
    return {
        price,
        compare: valid,
        off: valid ? Math.round((1 - price / valid) * 100) : null,
    };
}

// Drops empty maps so "no own price" is stored as null, not {}.
export const cleanPrices = (map: PriceMap | null | undefined): PriceMap | null =>
    map && Object.keys(map).length > 0 ? map : null;
