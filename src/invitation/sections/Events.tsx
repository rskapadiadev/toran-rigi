import { eventLabel } from '@shared/cultures';
import { buildIcs, googleCalendarUrl } from '@shared/ics';
import { formatEventDate, formatEventTime, sameOffset, zonedToUtc, zoneLabel } from '@shared/time';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { useGuestTimeZone, useNow } from '../../motion/hooks';
import { Reveal } from '../../motion/Reveal';
import { useScrollProgress } from '../../motion/useScrollProgress';
import { useInvite } from '../context';
import { s } from '../strings';
import type { PublicInvitationEvent } from '../types';

const DEFAULT_DURATION = 3 * 3600_000;

function ArchPlane() {
    return (
        <svg
            viewBox="0 0 300 380"
            className="absolute inset-0 size-full"
            preserveAspectRatio="none"
            aria-hidden
        >
            <path
                d="M10 380 V150 Q10 10 150 10 Q290 10 290 150 V380"
                fill="var(--inv-surface)"
                stroke="var(--inv-gold)"
                strokeWidth="2"
            />
            <path
                d="M26 380 V156 Q26 28 150 28 Q274 28 274 156 V380"
                fill="none"
                stroke="var(--inv-gold)"
                strokeWidth="0.8"
                opacity="0.6"
            />
        </svg>
    );
}

interface EventCardProps {
    event: PublicInvitationEvent;
    index: number;
}

function EventCard({ event, index }: EventCardProps) {
    const { data, t, locale, tier } = useInvite();
    const ref = useScrollProgress<HTMLDivElement>(tier !== 'static');
    const guestZone = useGuestTimeZone();
    const start = zonedToUtc(event.startsAt, event.timezone);
    const end = event.endsAt
        ? zonedToUtc(event.endsAt, event.timezone)
        : new Date(start.getTime() + DEFAULT_DURATION);
    const now = useNow(30_000);
    const live = now !== null && now >= start.getTime() && now <= end.getTime();
    const title = t(event.title) || eventLabel(data.invitation.culture, event.kind, locale);
    const calendarEvent = {
        uid: event.id,
        title: `${title} — ${t(data.invitation.content.couple.one.name)} & ${t(data.invitation.content.couple.two.name)}`,
        start,
        end,
        location: [event.venue, event.address].filter(Boolean).join(', '),
    };
    const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs([calendarEvent]))}`;
    const showGuestTime = guestZone !== null && !sameOffset(guestZone, event.timezone, start);

    return (
        <div ref={ref} className="diorama relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[300/380]">
                <div
                    data-plane
                    style={{ '--fold': '70deg' } as React.CSSProperties}
                    className="absolute inset-0"
                >
                    <ArchPlane />
                </div>
                <div
                    data-plane
                    style={
                        {
                            '--fold': '50deg',
                            '--depth': '18px',
                        } as React.CSSProperties
                    }
                    className="pointer-events-none absolute inset-x-[30%] top-[5%] opacity-40"
                >
                    <GenerativeOrnament
                        kind={data.invitation.design.generative.kind}
                        seed={data.invitation.seed + index * 13}
                        draw={false}
                    />
                </div>
                <div
                    data-plane
                    style={
                        {
                            '--fold': '30deg',
                            '--depth': '36px',
                        } as React.CSSProperties
                    }
                    className="absolute inset-x-[9%] top-[36%] bottom-[5%] flex flex-col items-center px-3 text-center"
                >
                    {live && (
                        <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-(--inv-primary) px-3 py-1 text-[10px] tracking-[0.25em] text-(--inv-bg) uppercase">
                            <span className="size-1.5 animate-ping rounded-full bg-(--inv-bg)" />
                            {s('happeningNow', locale)}
                        </span>
                    )}
                    <h3 className="inv-display text-3xl leading-tight text-(--inv-primary)">
                        {title}
                    </h3>
                    <p className="mt-3 text-sm font-medium">
                        {formatEventDate(start, event.timezone, locale)}
                    </p>
                    <p className="text-sm opacity-80">
                        {formatEventTime(start, event.timezone, locale)} ·{' '}
                        {zoneLabel(event.timezone)}
                    </p>
                    {showGuestTime && (
                        <p className="text-xs opacity-60">
                            {formatEventTime(start, guestZone, locale)} {s('yourTime', locale)}
                        </p>
                    )}
                    <p className="mt-3 text-base font-semibold">{event.venue}</p>
                    {event.address && <p className="text-xs opacity-70">{event.address}</p>}
                    {event.dressCode && (
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className="opacity-70">{s('dressCode', locale)}:</span>
                            {event.dressCode.swatches.map((c) => (
                                <span
                                    key={c}
                                    className="size-4 rounded-full ring-1 ring-(--inv-gold)"
                                    style={{ background: c }}
                                />
                            ))}
                            {event.dressCode.note && <span>{t(event.dressCode.note)}</span>}
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] tracking-[0.18em] uppercase">
                {event.mapsUrl && (
                    <a
                        href={event.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-(--inv-gold) px-4 py-2"
                    >
                        {s('directions', locale)}
                    </a>
                )}
                <a
                    href={googleCalendarUrl(calendarEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-(--inv-gold) px-4 py-2"
                >
                    Google
                </a>
                <a
                    href={icsHref}
                    download={`${data.invitation.slug}-${event.kind}.ics`}
                    className="rounded-full border border-(--inv-gold) px-4 py-2"
                >
                    {s('addToCalendar', locale)}
                </a>
            </div>
        </div>
    );
}

export function Events() {
    const { data, locale } = useInvite();
    if (data.events.length === 0) return null;
    return (
        <section className="px-5 py-24">
            <Reveal className="mb-14 text-center">
                <p className="text-xs tracking-[0.4em] text-(--inv-gold) uppercase">
                    {s('celebrations', locale)}
                </p>
            </Reveal>
            <div className="mx-auto grid max-w-5xl gap-20 md:grid-cols-2">
                {data.events.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} />
                ))}
            </div>
        </section>
    );
}
