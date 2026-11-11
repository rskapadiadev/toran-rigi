// Money is always integer minor units + ISO currency; formatting is locale-aware via Intl.
export const currencies = ['INR', 'AED'] as const;
export type Currency = (typeof currencies)[number];

const gulf = new Set(['AE', 'SA', 'QA', 'KW', 'OM', 'BH']);

// Launch markets are India + UAE; new markets = add a currency + price rows, no code change.
export function currencyForCountry(country: string | undefined): Currency {
    return country && gulf.has(country.toUpperCase()) ? 'AED' : 'INR';
}

export function formatMoney(minor: number, currency: string, locale = 'en'): string {
    const tag = locale === 'en' ? (currency === 'INR' ? 'en-IN' : 'en-AE') : locale;
    return new Intl.NumberFormat(tag, {
        style: 'currency',
        currency,
        maximumFractionDigits: minor % 100 === 0 ? 0 : 2,
    }).format(minor / 100);
}

export const toMinor = (major: number) => Math.round(major * 100);

export function percentOf(minor: number, bps: number): number {
    return Math.round((minor * bps) / 10000);
}
