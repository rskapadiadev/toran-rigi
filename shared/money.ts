import { currencyDigits } from './fx';

// Money is always integer minor units + ISO currency; formatting is locale-aware via Intl.
export const currencies = ['INR', 'AED'] as const;
export type Currency = (typeof currencies)[number];

const gulf = new Set(['AE', 'SA', 'QA', 'KW', 'OM', 'BH']);

// Launch markets are India + UAE; new markets = add a currency + price rows, no code change.
export function currencyForCountry(country: string | undefined): Currency {
    return country && gulf.has(country.toUpperCase()) ? 'AED' : 'INR';
}

const englishTag: Record<string, string> = {
    INR: 'en-IN',
    AED: 'en-AE',
};

// Minor units → "₹799", "AED 185", "£39", "¥7,750". Whole amounts drop the decimals.
export function formatMoney(minor: number, currency: string, locale = 'en'): string {
    const digits = currencyDigits(currency);
    const major = minor / 10 ** digits;
    const tag = locale === 'en' ? (englishTag[currency] ?? 'en-US') : locale;
    return new Intl.NumberFormat(tag, {
        style: 'currency',
        currency,
        minimumFractionDigits: Number.isInteger(major) ? 0 : digits,
        maximumFractionDigits: Number.isInteger(major) ? 0 : digits,
    }).format(major);
}

export const toMinor = (major: number) => Math.round(major * 100);

export function percentOf(minor: number, bps: number): number {
    return Math.round((minor * bps) / 10000);
}
