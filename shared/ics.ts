// RFC 5545 calendar file + Google Calendar link for "Add to calendar".
interface CalendarEvent {
    uid: string;
    title: string;
    start: Date;
    end?: Date;
    location: string;
    description?: string;
    url?: string;
}

const stamp = (d: Date) =>
    d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
const escape = (s: string) =>
    s
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/[,;]/g, (m) => `\\${m}`);

// `stampedAt` is injectable so server and browser render identical links (no hydration drift).
export function buildIcs(events: CalendarEvent[], stampedAt: Date = new Date()): string {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Rigi//Toran//EN',
        'CALSCALE:GREGORIAN',
    ];
    for (const e of events) {
        const end = e.end ?? new Date(e.start.getTime() + 3 * 3600_000);
        lines.push(
            'BEGIN:VEVENT',
            `UID:${e.uid}@toran`,
            `DTSTAMP:${stamp(stampedAt)}`,
            `DTSTART:${stamp(e.start)}`,
            `DTEND:${stamp(end)}`,
            `SUMMARY:${escape(e.title)}`,
            `LOCATION:${escape(e.location)}`,
            ...(e.description ? [`DESCRIPTION:${escape(e.description)}`] : []),
            ...(e.url ? [`URL:${e.url}`] : []),
            'END:VEVENT',
        );
    }
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

export function googleCalendarUrl(e: CalendarEvent): string {
    const end = e.end ?? new Date(e.start.getTime() + 3 * 3600_000);
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: e.title,
        dates: `${stamp(e.start)}/${stamp(end)}`,
        location: e.location,
        details: e.description ?? '',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
