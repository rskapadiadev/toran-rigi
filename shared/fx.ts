// Foreign exchange for the shop: outside India a template's USD price is shown and charged in the
// visitor's own currency, converted at a stored rate snapshot (open.er-api.com) and rounded to a
// clean local price, so prices never wobble by a few cents from one day to the next.

// ISO country → ISO currency. Countries not listed pay in US dollars.
const countryCurrency: Record<string, string> = {
    AE: 'AED',
    SA: 'SAR',
    QA: 'QAR',
    KW: 'KWD',
    OM: 'OMR',
    BH: 'BHD',
    IL: 'ILS',
    TR: 'TRY',
    JO: 'JOD',
    EG: 'EGP',
    MA: 'MAD',
    NG: 'NGN',
    KE: 'KES',
    ZA: 'ZAR',
    GH: 'GHS',
    TZ: 'TZS',
    UG: 'UGX',
    MU: 'MUR',
    GB: 'GBP',
    IE: 'EUR',
    FR: 'EUR',
    DE: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    PT: 'EUR',
    NL: 'EUR',
    BE: 'EUR',
    AT: 'EUR',
    FI: 'EUR',
    GR: 'EUR',
    LU: 'EUR',
    MT: 'EUR',
    CY: 'EUR',
    SK: 'EUR',
    SI: 'EUR',
    EE: 'EUR',
    LV: 'EUR',
    LT: 'EUR',
    HR: 'EUR',
    CH: 'CHF',
    NO: 'NOK',
    SE: 'SEK',
    DK: 'DKK',
    PL: 'PLN',
    CZ: 'CZK',
    HU: 'HUF',
    RO: 'RON',
    BG: 'BGN',
    US: 'USD',
    CA: 'CAD',
    MX: 'MXN',
    BR: 'BRL',
    AR: 'ARS',
    CL: 'CLP',
    CO: 'COP',
    PE: 'PEN',
    AU: 'AUD',
    NZ: 'NZD',
    FJ: 'FJD',
    SG: 'SGD',
    MY: 'MYR',
    TH: 'THB',
    ID: 'IDR',
    PH: 'PHP',
    VN: 'VND',
    HK: 'HKD',
    JP: 'JPY',
    KR: 'KRW',
    CN: 'CNY',
    TW: 'TWD',
    PK: 'PKR',
    BD: 'BDT',
    LK: 'LKR',
    NP: 'NPR',
    MV: 'MVR',
    AF: 'AFN',
};

export interface RateSnapshot {
    // When open.er-api.com last updated these rates (ISO).
    updatedAt: string;
    // Units of each currency per 1 US dollar.
    rates: Record<string, number>;
}

// Digits after the decimal point (JPY 0, INR 2, KWD 3), straight from the platform's currency data.
export function currencyDigits(currency: string): number {
    try {
        return (
            new Intl.NumberFormat('en', {
                style: 'currency',
                currency,
            }).resolvedOptions().maximumFractionDigits ?? 2
        );
    } catch {
        return 2;
    }
}

// The currency a visitor from this country sees and pays in. India is always rupees; a currency
// the rate snapshot doesn't know falls back to dollars.
export function shopCurrencyFor(country: string | null | undefined, rates: RateSnapshot | null) {
    const code = country?.toUpperCase();
    if (!code || code === 'IN') return 'INR';
    const local = countryCurrency[code] ?? 'USD';
    return local === 'USD' || rates?.rates[local] ? local : 'USD';
}

// A clean price: whole units under 100, then steps of 5, 50, 500… (183.62 → 185, 39.47 → 39).
export function niceAmount(major: number): number {
    if (major < 100) return Math.max(1, Math.round(major));
    const step = 5 * 10 ** (Math.floor(Math.log10(major)) - 2);
    return Math.round(major / step) * step;
}

// A USD price (cents) in another currency's minor units, rounded clean.
export function convertUsd(usdCents: number, currency: string, rates: RateSnapshot | null) {
    if (currency === 'USD') return usdCents;
    const rate = rates?.rates[currency];
    if (!rate) return null;
    return niceAmount((usdCents / 100) * rate) * 10 ** currencyDigits(currency);
}

// The currencies the shop's switcher offers, alongside whatever the visitor's country gives.
export const featuredCurrencies = ['INR', 'USD', 'AED', 'GBP', 'EUR', 'CAD', 'AUD', 'SGD'] as const;
