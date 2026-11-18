// The first day of the week where the wedding is, from the venue's time zone (CLDR conventions).
// A fixed table, not Intl weekInfo: some browsers lack it, and server and client must agree.

export type WeekStart = 0 | 1 | 6;

const SUNDAY = new Set(
    (
        'Asia/Kolkata Asia/Calcutta Asia/Jerusalem Asia/Tel_Aviv Asia/Karachi Asia/Riyadh ' +
        'Asia/Dhaka Asia/Singapore Asia/Manila Asia/Jakarta Asia/Tokyo Asia/Seoul Asia/Hong_Kong ' +
        'Asia/Taipei Asia/Bangkok Asia/Kathmandu Asia/Katmandu Asia/Thimphu Asia/Yangon ' +
        'Asia/Phnom_Penh Asia/Vientiane Asia/Macau Asia/Aden Africa/Johannesburg Africa/Nairobi ' +
        'Africa/Addis_Ababa Africa/Maputo Africa/Harare Europe/Lisbon Europe/Malta'
    ).split(' '),
);
const SATURDAY = new Set(
    (
        'Asia/Kabul Asia/Bahrain Asia/Baghdad Asia/Tehran Asia/Kuwait Asia/Muscat Asia/Qatar ' +
        'Asia/Amman Asia/Damascus Africa/Cairo Africa/Algiers Africa/Tripoli Africa/Khartoum ' +
        'Africa/Djibouti'
    ).split(' '),
);
// The parts of the Americas that start on Monday; the rest of the Americas start on Sunday.
const AMERICAS_MONDAY =
    /^America\/(Argentina|Buenos_Aires|Santiago|Montevideo|La_Paz|Guayaquil|Costa_Rica|Havana)/;

export function weekStart(timeZone: string | undefined): WeekStart {
    if (!timeZone) return 0;
    if (SUNDAY.has(timeZone)) return 0;
    if (SATURDAY.has(timeZone)) return 6;
    if (timeZone.startsWith('America/')) return AMERICAS_MONDAY.test(timeZone) ? 1 : 0;
    if (timeZone.startsWith('US/') || timeZone.startsWith('Canada/')) return 0;
    return 1;
}
