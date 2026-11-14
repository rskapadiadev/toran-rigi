import type { CultureId } from '@shared/cultures';

// Which traditions the login crown leads with, from where the visitor is. Only a hint for ordering:
// every tradition still appears, nothing is hidden.

const INDIC = new Set(['IN', 'NP']);
const JEWISH = new Set(['IL']);
// Muslim-majority countries.
const ISLAMIC = new Set(
    (
        'AE SA QA KW BH OM YE IQ JO SY PS EG LY TN DZ MA SD MR PK BD AF IR TR AZ ID MY BN MV ' +
        'SN ML NE GM GN SO DJ KM UZ TJ TM KG KZ AL XK TD SL'
    ).split(' '),
);
// Christian-majority countries.
const CHRISTIAN = new Set(
    (
        'US CA GB IE AU NZ FR DE IT ES PT NL BE LU CH AT DK NO SE FI IS PL CZ SK HU RO BG GR HR ' +
        'SI RS BA ME MK UA BY MD LT LV EE RU CY MT MX GT HN SV NI CR PA CU DO HT PR JM TT BS BB ' +
        'CO VE EC PE BO PY UY AR CL BR PH KE ZA GH UG ZM ZW PG FJ TL'
    ).split(' '),
);

export function culturesForCountry(country: string | null | undefined): CultureId[] {
    const c = country?.toUpperCase();
    if (!c) return [];
    if (INDIC.has(c)) return ['hindu', 'sikh', 'jain'];
    if (ISLAMIC.has(c)) return ['islamic'];
    if (JEWISH.has(c)) return ['jewish'];
    if (CHRISTIAN.has(c)) return ['christian'];
    return [];
}

// "en-IN" → "IN". Bare languages carry no country.
export const countryFromLanguage = (tag: string | null | undefined) =>
    tag?.match(/^[a-z]{2,3}[-_]([A-Z]{2})\b/i)?.[1]?.toUpperCase();

// Device time zone → country, for when the request carried no country (local dev, privacy proxies).
const ZONES: Record<string, string> = {
    'Asia/Kolkata': 'IN',
    'Asia/Calcutta': 'IN',
    'Asia/Kathmandu': 'NP',
    'Asia/Jerusalem': 'IL',
    'Asia/Tel_Aviv': 'IL',
    'Asia/Dubai': 'AE',
    'Asia/Riyadh': 'SA',
    'Asia/Qatar': 'QA',
    'Asia/Kuwait': 'KW',
    'Asia/Bahrain': 'BH',
    'Asia/Muscat': 'OM',
    'Asia/Baghdad': 'IQ',
    'Asia/Amman': 'JO',
    'Asia/Karachi': 'PK',
    'Asia/Dhaka': 'BD',
    'Asia/Kabul': 'AF',
    'Asia/Tehran': 'IR',
    'Asia/Baku': 'AZ',
    'Asia/Jakarta': 'ID',
    'Asia/Kuala_Lumpur': 'MY',
    'Asia/Brunei': 'BN',
    'Asia/Tashkent': 'UZ',
    'Europe/Istanbul': 'TR',
    'Africa/Cairo': 'EG',
    'Africa/Casablanca': 'MA',
    'Africa/Algiers': 'DZ',
    'Africa/Tunis': 'TN',
    'Africa/Tripoli': 'LY',
    'Africa/Khartoum': 'SD',
    'Africa/Dakar': 'SN',
    'Asia/Manila': 'PH',
    'Pacific/Auckland': 'NZ',
};

export function countryFromTimeZone(zone: string | undefined): string | undefined {
    if (!zone) return undefined;
    if (zone in ZONES) return ZONES[zone];
    // The Americas, Europe and Australia lead with Christian traditions.
    if (/^(America|Europe|Australia)\//.test(zone)) return 'US';
    return undefined;
}

export function browserCultures(): CultureId[] {
    try {
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const fromZone = culturesForCountry(countryFromTimeZone(zone));
        if (fromZone.length) return fromZone;
        for (const tag of navigator.languages) {
            const found = culturesForCountry(countryFromLanguage(tag));
            if (found.length) return found;
        }
    } catch {
        // No Intl or navigator: keep the default order.
    }
    return [];
}
