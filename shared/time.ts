// Event times are stored as local wall-clock ISO ("2027-01-22T10:30") + IANA zone; convert on demand.

function offsetMinutes(utcMs: number, timeZone: string): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).formatToParts(new Date(utcMs));
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    const asUtc = Date.UTC(
        get('year'),
        get('month') - 1,
        get('day'),
        get('hour'),
        get('minute'),
        get('second'),
    );
    return (asUtc - utcMs) / 60000;
}

export function zonedToUtc(localIso: string, timeZone: string): Date {
    const [datePart = '', timePart = '00:00'] = localIso.split('T');
    const [y = 0, m = 1, d = 1] = datePart.split('-').map(Number);
    const [hh = 0, mm = 0] = timePart.split(':').map(Number);
    const guess = Date.UTC(y, m - 1, d, hh, mm);
    // Two passes handle DST transitions correctly.
    const first = guess - offsetMinutes(guess, timeZone) * 60000;
    return new Date(guess - offsetMinutes(first, timeZone) * 60000);
}

const intlLocale = (locale: string, calendar?: string) => {
    const base =
        {
            en: 'en-IN',
            hi: 'hi-IN',
            gu: 'gu-IN',
            ar: 'ar-AE',
            ur: 'ur-PK',
            he: 'he-IL',
            pa: 'pa-IN',
        }[locale] ?? locale;
    return calendar ? `${base}-u-ca-${calendar}` : base;
};

export function formatEventDate(date: Date, timeZone: string, locale: string, calendar?: string) {
    return new Intl.DateTimeFormat(intlLocale(locale, calendar), {
        timeZone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export function formatEventTime(date: Date, timeZone: string, locale: string) {
    return new Intl.DateTimeFormat(intlLocale(locale), {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

const friendlyZones: Record<string, string> = {
    'Asia/Kolkata': 'IST',
    'Asia/Calcutta': 'IST',
    'Asia/Dubai': 'UAE',
    'Asia/Riyadh': 'KSA',
    'Asia/Karachi': 'PKT',
    'Europe/London': 'UK',
    'America/New_York': 'ET',
    'America/Toronto': 'ET',
    'Australia/Sydney': 'AET',
    'Asia/Jerusalem': 'Israel',
};

export function zoneLabel(timeZone: string) {
    return friendlyZones[timeZone] ?? timeZone.split('/').pop()?.replace(/_/g, ' ') ?? timeZone;
}

export function sameOffset(a: string, b: string, at: Date) {
    return offsetMinutes(at.getTime(), a) === offsetMinutes(at.getTime(), b);
}
