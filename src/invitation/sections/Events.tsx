import { eventLabel } from '@shared/cultures';
import { buildIcs, googleCalendarUrl } from '@shared/ics';
import { formatEventDate, formatEventTime, sameOffset, zonedToUtc, zoneLabel } from '@shared/time';
import { m, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { useGuestTimeZone, useNow } from '../../motion/hooks';
import { Reveal } from '../../motion/Reveal';
import { useScrollProgress } from '../../motion/useScrollProgress';
import { useInvite } from '../context';
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

function useEventFacts(event: PublicInvitationEvent) {
    const { data, t, locale, copy, names } = useInvite();
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
        title: `${title} — ${names.title}`,
        start,
        end,
        location: [event.venue, event.address].filter(Boolean).join(', '),
    };
    const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs([calendarEvent], start))}`;
    const showGuestTime = guestZone !== null && !sameOffset(guestZone, event.timezone, start);
    return {
        title,
        start,
        live,
        calendarEvent,
        icsHref,
        date: formatEventDate(start, event.timezone, locale),
        time: `${formatEventTime(start, event.timezone, locale)} · ${zoneLabel(event.timezone)}`,
        guestTime: showGuestTime
            ? `${formatEventTime(start, guestZone, locale)} ${copy('yourTime')}`
            : null,
    };
}

function EventActions({ event }: { event: PublicInvitationEvent }) {
    const { data, copy } = useInvite();
    const facts = useEventFacts(event);
    return (
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] tracking-[0.18em] uppercase">
            {event.mapsUrl && (
                <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-(--inv-gold) px-4 py-2"
                >
                    {copy('directions')}
                </a>
            )}
            <a
                href={googleCalendarUrl(facts.calendarEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-(--inv-gold) px-4 py-2"
            >
                Google
            </a>
            <a
                href={facts.icsHref}
                download={`${data.invitation.slug}-${event.kind}.ics`}
                className="rounded-full border border-(--inv-gold) px-4 py-2"
            >
                {copy('addToCalendar')}
            </a>
        </div>
    );
}

function LiveBadge() {
    const { copy } = useInvite();
    return (
        <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-(--inv-primary) px-3 py-1 text-[10px] tracking-[0.25em] text-(--inv-bg) uppercase">
            <span className="size-1.5 animate-ping rounded-full bg-(--inv-bg)" />
            {copy('happeningNow')}
        </span>
    );
}

function DressCode({ event }: { event: PublicInvitationEvent }) {
    const { t, copy } = useInvite();
    if (!event.dressCode) return null;
    return (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs">
            <span className="opacity-70">{copy('dressCode')}:</span>
            {event.dressCode.swatches.map((c) => (
                <span
                    key={c}
                    className="size-4 rounded-full ring-1 ring-(--inv-gold)"
                    style={{ background: c }}
                />
            ))}
            {event.dressCode.note && <span>{t(event.dressCode.note)}</span>}
        </div>
    );
}

function EventCard({ event, index }: EventCardProps) {
    const { data, tier } = useInvite();
    const ref = useScrollProgress<HTMLDivElement>(tier !== 'static');
    const facts = useEventFacts(event);

    return (
        <div ref={ref} className="diorama relative mx-auto w-full max-w-sm">
            <div className="relative">
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
                    className="pointer-events-none absolute inset-x-[30%] top-[4%] opacity-40"
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
                    className="relative flex flex-col items-center px-[12%] pt-[44%] pb-12 text-center"
                >
                    {facts.live && <LiveBadge />}
                    {/* Sized to the card, and never split mid-word: long names shrink instead. */}
                    <h3 className="inv-display text-[clamp(1.5rem,8cqw,2.25rem)] leading-tight text-balance break-normal hyphens-none text-(--inv-primary)">
                        {facts.title}
                    </h3>
                    <p className="mt-3 text-sm font-medium">{facts.date}</p>
                    <p className="text-sm opacity-80">{facts.time}</p>
                    {facts.guestTime && <p className="text-xs opacity-60">{facts.guestTime}</p>}
                    <p className="mt-3 text-base font-semibold">{event.venue}</p>
                    {event.address && <p className="text-xs opacity-70">{event.address}</p>}
                    <DressCode event={event} />
                    <EventActions event={event} />
                </div>
            </div>
        </div>
    );
}

// A golden thread drawn down the page as you scroll, each ceremony stitched onto it.
function Timeline() {
    const { data } = useInvite();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 80%', 'end 60%'],
    });
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 90,
        damping: 24,
    });
    return (
        <div ref={ref} className="relative mx-auto max-w-2xl">
            <div className="absolute inset-y-0 start-6 w-px bg-current opacity-15 @2xl:start-1/2" />
            <m.div
                style={{ scaleY }}
                className="absolute inset-y-0 start-6 w-[2px] origin-top bg-(--inv-gold) @2xl:start-1/2"
            />
            <ol className="space-y-16">
                {data.events.map((event, i) => (
                    <TimelineItem key={event.id} event={event} index={i} />
                ))}
            </ol>
        </div>
    );
}

function TimelineItem({ event, index }: EventCardProps) {
    const facts = useEventFacts(event);
    const flip = index % 2 === 1;
    return (
        <li className="relative grid grid-cols-[3rem_1fr] @2xl:grid-cols-2 @2xl:gap-14">
            <span className="absolute start-6 top-2 size-4 -translate-x-1/2 rotate-45 border-2 border-(--inv-gold) bg-(--inv-bg) @2xl:start-1/2 rtl:translate-x-1/2" />
            <Reveal
                className={`col-start-2 ${flip ? '@2xl:col-start-2 @2xl:text-start' : '@2xl:col-start-1 @2xl:row-start-1 @2xl:text-end'}`}
            >
                <p className="text-[11px] tracking-[0.35em] text-(--inv-gold) uppercase">
                    {facts.date}
                </p>
                <h3 className="inv-display mt-2 text-3xl leading-tight text-(--inv-primary)">
                    {facts.title}
                </h3>
                {facts.live && <LiveBadge />}
                <p className="mt-2 text-sm opacity-80">{facts.time}</p>
                {facts.guestTime && <p className="text-xs opacity-60">{facts.guestTime}</p>}
                <p className="mt-2 font-semibold">{event.venue}</p>
                {event.address && <p className="text-xs opacity-70">{event.address}</p>}
                <div className={flip ? '@2xl:[&>div]:justify-start' : '@2xl:[&>div]:justify-end'}>
                    <EventActions event={event} />
                </div>
            </Reveal>
        </li>
    );
}

// Admit-with-love tickets: a swipeable row on phones, a centred wrap once there is room.
function Tickets() {
    const { data } = useInvite();
    return (
        <div className="-mx-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto px-[10cqw] pb-6 @3xl:mx-auto @3xl:max-w-6xl @3xl:flex-wrap @3xl:justify-center @3xl:overflow-visible @3xl:px-0">
            {data.events.map((event, i) => (
                <Ticket key={event.id} event={event} index={i} />
            ))}
        </div>
    );
}

function Ticket({ event, index }: EventCardProps) {
    const { data, copy } = useInvite();
    const facts = useEventFacts(event);
    const bars = Array.from(
        { length: 28 },
        (_, k) => ((data.invitation.seed + index * 7 + k * 13) % 5) + 1,
    );
    return (
        <Reveal delay={index * 120} className="w-[78cqw] max-w-sm shrink-0 snap-center">
            <article className="relative overflow-hidden rounded-2xl bg-(--inv-surface) text-center shadow-[0_24px_50px_-24px_rgba(0,0,0,0.5)] ring-1 ring-(--inv-gold)/50">
                <div className="px-6 pt-7 pb-6">
                    <p className="text-[10px] tracking-[0.45em] text-(--inv-gold) uppercase">
                        {copy('admitOne')}
                    </p>
                    {facts.live && <LiveBadge />}
                    <h3 className="inv-display mt-3 text-[2.2rem] leading-none text-(--inv-primary)">
                        {facts.title}
                    </h3>
                    <p className="mt-4 text-sm font-medium">{facts.date}</p>
                    <p className="text-sm opacity-80">{facts.time}</p>
                    <p className="mt-3 font-semibold">{event.venue}</p>
                    {event.address && <p className="text-xs opacity-70">{event.address}</p>}
                    <DressCode event={event} />
                </div>
                <div className="relative border-t-2 border-dashed border-(--inv-gold)/60 px-6 pt-4 pb-5">
                    <span className="absolute -start-3 -top-3 size-6 rounded-full bg-(--inv-bg)" />
                    <span className="absolute -end-3 -top-3 size-6 rounded-full bg-(--inv-bg)" />
                    <div
                        className="flex h-8 items-stretch justify-center gap-[2px] opacity-70"
                        aria-hidden
                        dir="ltr"
                    >
                        {bars.map((w, k) => (
                            <span key={k} className="bg-current" style={{ width: `${w}px` }} />
                        ))}
                    </div>
                    <EventActions event={event} />
                </div>
            </article>
        </Reveal>
    );
}

export function Events({ variant }: { variant: string }) {
    const { data, copy } = useInvite();
    if (data.events.length === 0) return null;
    return (
        <section className="px-5 py-24">
            <Reveal className="mb-14 text-center">
                <p className="text-xs tracking-[0.4em] text-(--inv-gold) uppercase">
                    {copy('celebrations')}
                </p>
            </Reveal>
            {variant === 'timeline' && <Timeline />}
            {variant === 'tickets' && <Tickets />}
            {variant !== 'timeline' && variant !== 'tickets' && (
                <div className="mx-auto grid max-w-5xl gap-20 @3xl:grid-cols-2">
                    {data.events.map((event, i) => (
                        <EventCard key={event.id} event={event} index={i} />
                    ))}
                </div>
            )}
        </section>
    );
}
