import { eventLabel } from '@shared/cultures';
import { buildIcs, googleCalendarUrl } from '@shared/ics';
import { formatEventDate, formatEventTime, sameOffset, zonedToUtc, zoneLabel } from '@shared/time';
import { m, useScroll, useSpring } from 'motion/react';
import { useRef, useState } from 'react';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { useGuestTimeZone, useNow } from '../../motion/hooks';
import { Reveal } from '../../motion/Reveal';
import { useScrollProgress } from '../../motion/useScrollProgress';
import { useInvite } from '../context';
import { Editable, eventPath } from '../editing';
import { CeremonyProp, propFor } from '../props';
import type { PublicInvitationEvent } from '../types';
import { WardrobeEvents } from './phoolwari';

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

export function EventActions({ event }: { event: PublicInvitationEvent }) {
    const { data, copy } = useInvite();
    const facts = useEventFacts(event);
    const [picking, setPicking] = useState(false);
    const pill = 'rounded-full border border-(--inv-gold) px-4 py-2 tracking-[0.18em]';
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
            {/* One button; the calendar app is chosen after, so guests see a single clear action. */}
            {picking ? (
                <span className="flex flex-wrap justify-center gap-2">
                    <a
                        href={googleCalendarUrl(facts.calendarEvent)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={pill}
                    >
                        Google Calendar
                    </a>
                    <a
                        href={facts.icsHref}
                        download={`${data.invitation.slug}-${event.kind}.ics`}
                        className={pill}
                    >
                        Apple · Outlook
                    </a>
                </span>
            ) : (
                <button
                    type="button"
                    onClick={() => {
                        setPicking(true);
                    }}
                    className={pill}
                >
                    {copy('addToCalendar')}
                </button>
            )}
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
        <div
            ref={ref}
            data-event-index={index}
            className="diorama relative mx-auto w-full max-w-sm"
        >
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
                        <Editable path={eventPath(index, 'title')}>{facts.title}</Editable>
                    </h3>
                    <p className="mt-3 text-sm font-medium">{facts.date}</p>
                    <p className="text-sm opacity-80">{facts.time}</p>
                    {facts.guestTime && <p className="text-xs opacity-60">{facts.guestTime}</p>}
                    <p className="mt-3 text-base font-semibold">
                        <Editable path={eventPath(index, 'venue')}>{event.venue}</Editable>
                    </p>
                    {event.address && (
                        <p className="text-xs opacity-70">
                            <Editable path={eventPath(index, 'address')}>{event.address}</Editable>
                        </p>
                    )}
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
        <li
            data-event-index={index}
            className="relative grid grid-cols-[3rem_1fr] @2xl:grid-cols-2 @2xl:gap-14"
        >
            <span className="absolute start-6 top-2 size-4 -translate-x-1/2 rotate-45 border-2 border-(--inv-gold) bg-(--inv-bg) @2xl:start-1/2 rtl:translate-x-1/2" />
            <Reveal
                className={`col-start-2 ${flip ? '@2xl:col-start-2 @2xl:text-start' : '@2xl:col-start-1 @2xl:row-start-1 @2xl:text-end'}`}
            >
                <p className="text-[11px] tracking-[0.35em] text-(--inv-gold) uppercase">
                    {facts.date}
                </p>
                <h3 className="inv-display mt-2 text-3xl leading-tight text-(--inv-primary)">
                    <Editable path={eventPath(index, 'title')}>{facts.title}</Editable>
                </h3>
                {facts.live && <LiveBadge />}
                <p className="mt-2 text-sm opacity-80">{facts.time}</p>
                {facts.guestTime && <p className="text-xs opacity-60">{facts.guestTime}</p>}
                <p className="mt-2 font-semibold">
                    <Editable path={eventPath(index, 'venue')}>{event.venue}</Editable>
                </p>
                {event.address && (
                    <p className="text-xs opacity-70">
                        <Editable path={eventPath(index, 'address')}>{event.address}</Editable>
                    </p>
                )}
                <div className={flip ? '@2xl:[&>div]:justify-start' : '@2xl:[&>div]:justify-end'}>
                    <EventActions event={event} />
                </div>
            </Reveal>
        </li>
    );
}

// Admit-with-love tickets: a swipeable row on phones, a centred wrap once there is room.
// Onion-dome (Mughal) arch, normalised to the card's box.
const DOME =
    'M0 1 V0.36 C0 0.26 0.14 0.21 0.27 0.16 C0.39 0.12 0.46 0.07 0.5 0 C0.54 0.07 0.61 0.12 0.73 0.16 C0.86 0.21 1 0.26 1 0.36 V1 Z';

// Card colours cycle through the palette; dark fills switch the text to the light ink.
interface ArchTone {
    fill: string;
    dark: boolean;
}

function archTone(i: number): ArchTone {
    const tones = [
        {
            fill: 'var(--inv-surface)',
            dark: false,
        },
        {
            fill: 'var(--inv-primary)',
            dark: true,
        },
        {
            fill: 'color-mix(in oklab, var(--inv-primary) 22%, var(--inv-bg))',
            dark: false,
        },
        {
            fill: 'color-mix(in oklab, var(--inv-primary) 70%, black)',
            dark: true,
        },
    ];
    return (
        tones[i % tones.length] ?? {
            fill: 'var(--inv-surface)',
            dark: false,
        }
    );
}

// Stacked arches: every ceremony is a domed card that sticks as you scroll, so the next one
// slides up over it like a deck being dealt. Each carries the prop guests associate with it.
function StackedArches() {
    const { data } = useInvite();
    const id = `dome-${String(data.invitation.seed)}`;
    return (
        <div className="relative mx-auto max-w-md pb-[14svh]">
            <svg width="0" height="0" className="absolute" aria-hidden>
                <clipPath id={id} clipPathUnits="objectBoundingBox">
                    <path d={DOME} />
                </clipPath>
            </svg>
            {data.events.map((event, i) => (
                <StackedArch key={event.id} event={event} index={i} clipId={id} />
            ))}
        </div>
    );
}

interface StackedArchProps extends EventCardProps {
    clipId: string;
}

function StackedArch({ event, index, clipId }: StackedArchProps) {
    const facts = useEventFacts(event);
    const tone = archTone(index);
    return (
        <div
            data-event-index={index}
            className="sticky mb-[22svh] last:mb-0"
            // Each card stops a little lower than the last, so the stack's edges stay visible.
            style={{ top: `calc(9svh + ${String(index * 14)}px)` }}
        >
            <div
                className="relative"
                style={{ filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.28))' }}
            >
                <div
                    className="relative flex aspect-[4/5] flex-col items-center px-[12%] pt-[40%] pb-[10%] text-center"
                    style={{
                        clipPath: `url(#${clipId})`,
                        background: tone.fill,
                        color: tone.dark ? 'var(--inv-bg)' : 'var(--inv-ink)',
                    }}
                >
                    {/* Hairline gold arch inside the edge. */}
                    <svg
                        viewBox="0 0 1 1"
                        preserveAspectRatio="none"
                        className="pointer-events-none absolute inset-[4%] size-[92%]"
                        aria-hidden
                    >
                        <path
                            d={DOME}
                            fill="none"
                            stroke="var(--inv-gold)"
                            strokeWidth="0.006"
                            vectorEffect="non-scaling-stroke"
                            style={{ strokeWidth: 1.2 }}
                        />
                    </svg>
                    <h3 className="inv-script text-[clamp(2.2rem,10cqw,3.2rem)] leading-tight text-(--inv-gold)">
                        <Editable path={eventPath(index, 'title')}>{facts.title}</Editable>
                    </h3>
                    {facts.live && <LiveBadge />}
                    <p className="mt-4 text-[11px] tracking-[0.3em] uppercase">{facts.date}</p>
                    <p className="text-[11px] tracking-[0.3em] uppercase opacity-80">
                        {facts.time}
                    </p>
                    <p className="mt-3 text-[15px]">
                        <Editable path={eventPath(index, 'venue')}>{event.venue}</Editable>
                    </p>
                    <DressCode event={event} />
                    <div className="mt-auto">
                        <EventActions event={event} />
                    </div>
                </div>
                <CeremonyProp
                    kind={propFor(event.kind)}
                    className={`absolute bottom-[4%] w-[26%] ${index % 2 ? 'start-[-6%]' : 'end-[-6%]'}`}
                />
            </div>
        </div>
    );
}

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
            <div data-event-index={index}>
                <article className="relative overflow-hidden rounded-2xl bg-(--inv-surface) text-center shadow-[0_24px_50px_-24px_rgba(0,0,0,0.5)] ring-1 ring-(--inv-gold)/50">
                    <div className="px-6 pt-7 pb-6">
                        <p className="text-[10px] tracking-[0.45em] text-(--inv-gold) uppercase">
                            {copy('admitOne')}
                        </p>
                        {facts.live && <LiveBadge />}
                        <h3 className="inv-display mt-3 text-[2.2rem] leading-none text-(--inv-primary)">
                            <Editable path={eventPath(index, 'title')}>{facts.title}</Editable>
                        </h3>
                        <p className="mt-4 text-sm font-medium">{facts.date}</p>
                        <p className="text-sm opacity-80">{facts.time}</p>
                        <p className="mt-3 font-semibold">
                            <Editable path={eventPath(index, 'venue')}>{event.venue}</Editable>
                        </p>
                        {event.address && (
                            <p className="text-xs opacity-70">
                                <Editable path={eventPath(index, 'address')}>
                                    {event.address}
                                </Editable>
                            </p>
                        )}
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
            </div>
        </Reveal>
    );
}

export function Events({ variant }: { variant: string }) {
    const { data, copy } = useInvite();
    if (data.events.length === 0) return null;
    // Illustrated kit: each ceremony is a full printed page of its own, no shared heading.
    if (variant === 'wardrobe') return <WardrobeEvents />;
    return (
        <section className="px-5 py-24">
            <Reveal className="mb-14 text-center">
                <p className="text-xs tracking-[0.4em] text-(--inv-gold) uppercase">
                    {copy('celebrations')}
                </p>
            </Reveal>
            {variant === 'timeline' && <Timeline />}
            {variant === 'tickets' && <Tickets />}
            {variant === 'stack' && <StackedArches />}
            {variant !== 'timeline' && variant !== 'tickets' && variant !== 'stack' && (
                <div className="mx-auto grid max-w-5xl gap-20 @3xl:grid-cols-2">
                    {data.events.map((event, i) => (
                        <EventCard key={event.id} event={event} index={i} />
                    ))}
                </div>
            )}
        </section>
    );
}
