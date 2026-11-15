// Phoolwari: a hand-illustrated wildflower garden, staged for the web. The cover is a full-screen
// garden (Ganesha, monogram, names, a meadow that grows as guests scroll), then the couple's letter
// with an index of ceremonies, then one immersive scene per ceremony: its own sky, the stage rising,
// guests stepping in one by one, and a glass card with the details sliding up.
import { photoUrl, slotPhoto } from '@shared/photos';
import { zonedToUtc } from '@shared/time';
import { useMotionValueEvent } from 'motion/react';
import { type CSSProperties, type ReactNode, type RefObject, useEffect, useRef } from 'react';

import { cn } from '../../lib/utils';
import { useInvite } from '../context';
import { Editable, eventPath } from '../editing';
import { type Ambient, coverPage, type Layer, PAGE_RATIO, pageFor } from '../kits/phoolwari';
import { useSectionScroll } from '../scroll';
import type { PublicInvitationEvent } from '../types';
import { EventActions } from './Events';

function ordinal(n: number) {
    if (n % 100 >= 11 && n % 100 <= 13) return 'th';
    return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
}

function dayParts(date: Date, zone: string) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
        timeZone: zone,
    }).formatToParts(date);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((p) => p.type === type)?.value ?? '';
    return {
        day: Number(get('day')),
        month: get('month'),
        year: get('year'),
        weekday: get('weekday'),
    };
}

// "27th–29th January 2027" across the whole celebration.
function CelebrationSpan() {
    const { data } = useInvite();
    const first = data.events[0];
    const last = data.events.at(-1);
    if (!first || !last) return null;
    const a = dayParts(zonedToUtc(first.startsAt, first.timezone), first.timezone);
    const b = dayParts(zonedToUtc(last.startsAt, last.timezone), last.timezone);
    return (
        <>
            {a.day}
            <sup>{ordinal(a.day)}</sup>
            {b.day !== a.day && (
                <>
                    –{b.day}
                    <sup>{ordinal(b.day)}</sup>
                </>
            )}{' '}
            {b.month} {b.year}
        </>
    );
}

// Writes the section's scroll progress (0 → 1 while it is pinned) to --s, without re-rendering.
// Without motion it rests where the section reads best: the cover at its start, scenes complete.
function useStageProgress(ref: RefObject<HTMLElement | null>, enabled: boolean, rest: 0 | 1 = 1) {
    const { scrollYProgress } = useSectionScroll(ref);
    useMotionValueEvent(scrollYProgress, 'change', (v) => {
        if (enabled) ref.current?.style.setProperty('--s', v.toFixed(4));
    });
    useEffect(() => {
        ref.current?.style.setProperty(
            '--s',
            enabled ? String(scrollYProgress.get()) : String(rest),
        );
    }, [enabled, ref, scrollYProgress, rest]);
}

interface MonogramProps {
    className?: string;
    style?: CSSProperties;
}

// The couple's own gold monogram when uploaded (cover.monogram), else an arch drawn from initials.
export function GardenMonogram({ className, style }: MonogramProps) {
    const { data, names } = useInvite();
    const key = slotPhoto(data.invitation.content, 'cover.monogram');
    if (key)
        return (
            <img
                src={photoUrl(key)}
                alt={names.title}
                data-photo
                data-photo-slot="cover.monogram"
                className={className}
                style={style}
                draggable={false}
            />
        );
    const [a = '', b = ''] = names.initials;
    return (
        <svg
            viewBox="0 0 300 330"
            className={className}
            style={style}
            role="img"
            aria-label={names.title}
            data-photo
            data-photo-slot="cover.monogram"
        >
            <defs>
                <linearGradient id="pw-gold" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#f1d27a" />
                    <stop offset="0.5" stopColor="#c8972f" />
                    <stop offset="1" stopColor="#9a6d1d" />
                </linearGradient>
            </defs>
            <path
                d="M40 320 V120 Q40 60 100 46 Q130 40 150 6 Q170 40 200 46 Q260 60 260 120 V320"
                fill="none"
                stroke="url(#pw-gold)"
                strokeWidth="3"
            />
            <path
                d="M58 320 V126 Q58 76 110 62 Q136 56 150 30 Q164 56 190 62 Q242 76 242 126 V320"
                fill="none"
                stroke="url(#pw-gold)"
                strokeWidth="1.4"
            />
            <text
                x="122"
                y="210"
                textAnchor="middle"
                fontSize="120"
                fill="url(#pw-gold)"
                className="inv-display"
            >
                {a}
            </text>
            <text
                x="182"
                y="262"
                textAnchor="middle"
                fontSize="120"
                fill="url(#pw-gold)"
                className="inv-display"
            >
                {b}
            </text>
        </svg>
    );
}

// ── Cover: the garden ───────────────────────────────────────────────────────

interface MeadowProps {
    className?: string;
    style?: CSSProperties;
}

// A strip of wildflowers repeated side by side at its natural size, so wide screens get more
// flowers rather than giant ones.
export function Meadow({ className, style }: MeadowProps) {
    const strip = {
        backgroundImage: `url(${coverPage.meadow})`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center bottom',
        backgroundSize: 'auto 100%',
        ...style,
    };
    return <div className={cn('pw-meadow', className)} style={strip} aria-hidden />;
}

type Fly = 'far' | 'near-left' | 'near-right' | 'near-bottom' | 'side';

interface DepthProps {
    // How the layer moves as the guest flies forward (scroll), and how much it follows the pointer.
    fly: Fly;
    depth: number;
    className: string;
    children: ReactNode;
}

// One plane of the garden. Scroll moves it through the scene; the pointer tilts it by its depth.
function Depth({ fly, depth, className, children }: DepthProps) {
    const tilt = { '--d': String(depth) } as CSSProperties;
    return (
        <div className={cn(`pw-fly-${fly} absolute`, className)}>
            <div className="pw-depth size-full" style={tilt}>
                {children}
            </div>
        </div>
    );
}

interface ArtProps {
    src: string;
    from?: 'left' | 'right' | 'rise';
    delay: string;
    className?: string;
}

const Art = ({ src, from = 'rise', delay, className }: ArtProps) => (
    <img
        src={src}
        alt=""
        className={cn('pw-in pw-sway w-full', from !== 'rise' && `pw-in-far-${from}`, className)}
        style={{ animationDelay: delay }}
        draggable={false}
    />
);

// The pointer's position from the centre (−1…1), for a gentle 3D tilt on desktop.
function useTilt(ref: RefObject<HTMLElement | null>, enabled: boolean) {
    useEffect(() => {
        const el = ref.current;
        if (!el || !enabled || !window.matchMedia('(pointer: fine)').matches) return;
        const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
            el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        };
        el.addEventListener('pointermove', move);
        return () => {
            el.removeEventListener('pointermove', move);
        };
    }, [ref, enabled]);
}

// Fly-through garden: soft-focus flowers in front, names floating mid-air, the meadow behind. As the
// guest scrolls, the camera moves forward: the front flowers part around the screen, the names come
// close and dissolve, and the meadow rises into the letter.
export function GardenCover() {
    const { tier } = useInvite();
    const live = tier === 'full';
    const hero = useRef<HTMLElement>(null);
    const scene = useRef<HTMLDivElement>(null);
    useStageProgress(hero, true, 0);
    useTilt(scene, live);
    return (
        <>
            {/* Same layout on every device (no swap after load); reduced motion just unpins it. */}
            <section ref={hero} className="pw-hero relative h-[220svh] motion-reduce:h-auto">
                <div
                    ref={scene}
                    className={cn(
                        'pw-hero-sky top-0 h-dvh min-h-[560px] overflow-hidden',
                        'sticky motion-reduce:relative',
                    )}
                >
                    <Bokeh />
                    <Depth fly="far" depth={6} className="inset-x-[-10%] bottom-0 h-[34svh]">
                        <Meadow className="size-full opacity-90" />
                    </Depth>
                    <Depth
                        fly="side"
                        depth={10}
                        className="end-[4%] top-[46%] w-[17cqw] max-w-[120px]"
                    >
                        <Art src={coverPage.sprig} from="right" delay="1.2s" />
                    </Depth>
                    <HeroCentre />
                    <Depth
                        fly="near-right"
                        depth={26}
                        className="-end-[34%] -top-[8%] w-[68cqw] max-w-[560px] @5xl:-end-[10%] @5xl:w-[44cqw]"
                    >
                        <Art
                            src={coverPage.floraRight}
                            from="right"
                            delay="0.5s"
                            className="pw-soft"
                        />
                    </Depth>
                    <Depth
                        fly="near-left"
                        depth={30}
                        className="-start-[30%] -bottom-[2%] w-[62cqw] max-w-[500px] @5xl:-start-[8%] @5xl:w-[36cqw]"
                    >
                        <Art
                            src={coverPage.floraLeft}
                            from="left"
                            delay="0.8s"
                            className="pw-soft"
                        />
                    </Depth>
                    <Depth
                        fly="near-bottom"
                        depth={40}
                        className="inset-x-[-30%] -bottom-[4%] h-[22svh]"
                    >
                        <Meadow className="pw-soft size-full" style={{ animationDelay: '0.2s' }} />
                    </Depth>
                    <Ambient kind="butterflies" />
                    {
                        <div className="pw-hero-cue absolute inset-x-0 bottom-[3svh] z-10 flex flex-col items-center gap-2 text-[10px] tracking-[0.4em] text-white uppercase drop-shadow motion-reduce:hidden">
                            Scroll
                            <span className="pw-cue-line h-10 w-px bg-white/80" />
                        </div>
                    }
                </div>
            </section>
        </>
    );
}

function HeroCentre() {
    const { names, guest, copy, data, t } = useInvite();
    const { headline, welcome } = data.invitation.content;
    return (
        <div
            className="pw-hero-centre absolute inset-x-0 top-[9svh] z-[1] flex flex-col items-center px-6 text-center"
            style={{ color: coverPage.ink }}
        >
            {/* Sacred image: only a calm fade and a soft glow, never anything playful. */}
            <img
                src={coverPage.ganesha}
                alt="Shree Ganesh"
                className="pw-in pw-glow w-[min(15cqw,74px)]"
                draggable={false}
            />
            <GardenMonogram
                className="pw-monogram mt-[1.6svh] h-[24svh] max-h-[260px] w-auto"
                style={{ animationDelay: '0.3s' }}
            />
            {guest && (
                <p className="pw-in mt-[2svh] text-[11px] tracking-[0.3em] uppercase opacity-80">
                    {copy('dearGuest')} {guest.name}
                </p>
            )}
            <h1
                className="pw-in inv-display mt-[2.2svh] text-[clamp(2.1rem,9cqw,4.4rem)] leading-none tracking-[0.04em] uppercase"
                style={{ animationDelay: '0.8s' }}
            >
                <Editable path="people.one.name">{names.one}</Editable>
                {names.two && (
                    <>
                        <span className="inv-script mx-[0.25em] text-[0.8em] normal-case">
                            &amp;
                        </span>
                        <Editable path="people.two.name">{names.two}</Editable>
                    </>
                )}
            </h1>
            <p
                className="pw-in inv-display mt-[1.4svh] text-[clamp(0.95rem,3.8cqw,1.35rem)] tracking-[0.12em] uppercase [&_sup]:text-[0.55em]"
                style={{ animationDelay: '1s' }}
            >
                <CelebrationSpan />
            </p>
            {t(headline) && (
                <p
                    className="pw-in mt-[2.6svh] text-[clamp(0.72rem,3cqw,0.95rem)] tracking-[0.42em] uppercase"
                    style={{ animationDelay: '1.2s' }}
                >
                    <Editable path="headline">{t(headline)}</Editable>
                </p>
            )}
            {t(welcome) && (
                <p
                    className="pw-in mt-[1.4svh] max-w-sm text-[clamp(1rem,4cqw,1.25rem)] italic opacity-90"
                    style={{ animationDelay: '1.4s' }}
                >
                    <Editable path="welcome">{t(welcome)}</Editable>
                </p>
            )}
        </div>
    );
}

const bokeh = [
    {
        x: 6,
        y: 14,
        s: 160,
        c: 'rgba(255, 190, 210, 0.55)',
    },
    {
        x: 70,
        y: 26,
        s: 200,
        c: 'rgba(206, 190, 255, 0.5)',
    },
    {
        x: 24,
        y: 58,
        s: 240,
        c: 'rgba(255, 228, 160, 0.55)',
    },
    {
        x: 80,
        y: 66,
        s: 170,
        c: 'rgba(180, 214, 255, 0.5)',
    },
];

function Bokeh() {
    return (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
            {bokeh.map((b, i) => {
                const style = {
                    left: `${String(b.x)}%`,
                    top: `${String(b.y)}%`,
                    width: b.s,
                    height: b.s,
                    background: b.c,
                    animationDelay: `${String(i * -3)}s`,
                };
                return (
                    <span
                        key={i}
                        className="pw-bokeh absolute rounded-full blur-3xl"
                        style={style}
                    />
                );
            })}
        </div>
    );
}

// Day 1, 1, 2, 3: ceremonies on the same date share a day number.
function dayNumbers(events: readonly PublicInvitationEvent[]) {
    const dates: string[] = [];
    return events.map((e) => {
        const date = e.startsAt.slice(0, 10);
        if (!dates.includes(date)) dates.push(date);
        return dates.indexOf(date) + 1;
    });
}

// "The celebrations": every ceremony as a tappable chip that jumps to its scene.
function CeremonyIndex() {
    const { data, t } = useInvite();
    const days = dayNumbers(data.events);
    return (
        <section
            className="pw-letter relative overflow-hidden px-5 py-16"
            style={{ color: coverPage.ink }}
        >
            <img
                src={coverPage.sprig}
                alt=""
                className="pw-sway-soft pointer-events-none absolute -start-6 top-6 w-24 opacity-60"
                draggable={false}
            />
            <div className="relative mx-auto max-w-xl text-center">
                <p className="text-[11px] tracking-[0.4em] uppercase opacity-70">
                    The celebrations
                </p>
                <ol className="mt-6 grid gap-3 text-start @xl:grid-cols-2">
                    {data.events.map((event, i) => {
                        const page = pageFor(event.kind);
                        const when = dayParts(
                            zonedToUtc(event.startsAt, event.timezone),
                            event.timezone,
                        );
                        const chip = { background: page.dark ? '#1d2c5e' : page.tint };
                        return (
                            <li key={event.id}>
                                <a
                                    href={`#pw-${event.id}`}
                                    className="flex items-center gap-4 rounded-2xl border border-current/15 bg-white/55 p-3 pe-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/80"
                                >
                                    <span
                                        className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl text-white"
                                        style={chip}
                                    >
                                        <span className="text-[9px] tracking-[0.2em] uppercase">
                                            Day {days[i]}
                                        </span>
                                        <span className="inv-display text-xl leading-none">
                                            {when.day}
                                        </span>
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[11px] tracking-[0.25em] uppercase opacity-70">
                                            {t(event.title)}
                                        </span>
                                        <span className="inv-display block truncate text-lg">
                                            {event.dressCode?.title
                                                ? t(event.dressCode.title)
                                                : event.venue}
                                        </span>
                                    </span>
                                </a>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}

// ── Ceremony scenes ─────────────────────────────────────────────────────────

export function WardrobeEvents() {
    const { data } = useInvite();
    const days = dayNumbers(data.events);
    return (
        <div>
            <CeremonyIndex />
            {data.events.map((event, i) => (
                <CeremonyScene key={event.id} event={event} index={i} day={days[i] ?? i + 1} />
            ))}
        </div>
    );
}

// The illustration is composed on an 843.75-wide page; the stage starts 38% down it.
const ART_TOP = 38;
const ART_RATIO = PAGE_RATIO / ((100 - ART_TOP) / 100);

interface SceneProps {
    event: PublicInvitationEvent;
    index: number;
    day: number;
}

function CeremonyScene({ event, index, day }: SceneProps) {
    const { t, tier } = useInvite();
    const live = tier === 'full';
    const page = pageFor(event.kind);
    const scene = useRef<HTMLElement>(null);
    useStageProgress(scene, true);
    const when = dayParts(zonedToUtc(event.startsAt, event.timezone), event.timezone);
    const sky = {
        background: page.sky,
        color: page.ink,
    };
    const art = { aspectRatio: String(ART_RATIO) };
    return (
        <section
            ref={scene}
            id={`pw-${event.id}`}
            className={cn(
                'pw-scene relative h-[300svh] motion-reduce:h-auto',
                page.dark && 'pw-dark',
            )}
        >
            <div
                className={cn(
                    'top-0 overflow-hidden',
                    'sticky h-dvh min-h-[600px] motion-reduce:relative motion-reduce:h-auto motion-reduce:pb-6',
                )}
                style={sky}
            >
                {page.dark && <Stars />}
                {page.lights && live && <DjLights dark={page.dark} />}
                {page.lights && <MirrorBall />}
                {/* Title above, details below, in one column so the card never covers the title. */}
                <div className="pointer-events-none absolute inset-0 z-[3] flex flex-col justify-between gap-4 px-3 pt-[6svh] pb-3 motion-reduce:relative motion-reduce:pb-6 @5xl:start-auto @5xl:end-[6%] @5xl:w-[min(32rem,40cqw)] @5xl:justify-center @5xl:gap-6 @5xl:px-0 @5xl:py-[6svh]">
                    <header className="pw-scene-head pointer-events-auto relative shrink-0 px-3 text-center">
                        <p
                            className="text-[11px] font-semibold tracking-[0.4em] uppercase"
                            style={{ color: page.tint }}
                        >
                            Day {day} · {when.weekday} {when.day} {when.month}
                        </p>
                        {event.dressCode?.title && (
                            <h2 className="inv-display mt-3 text-[clamp(2.2rem,10cqw,4.2rem)] leading-[1.02] [@media(max-height:760px)]:mt-2 [@media(max-height:760px)]:text-[clamp(1.8rem,8.5cqw,3rem)]">
                                {t(event.dressCode.title)}
                            </h2>
                        )}
                        <p className="mt-3 flex items-center justify-center gap-3 text-sm font-semibold tracking-[0.3em] uppercase">
                            <span className="h-px w-8 bg-current opacity-40" />
                            <Editable path={eventPath(index, 'title')}>{t(event.title)}</Editable>
                            <span className="h-px w-8 bg-current opacity-40" />
                        </p>
                    </header>
                    <DetailsCard event={event} index={index} />
                </div>
                <div
                    className="pw-art absolute inset-x-0 bottom-0 z-[1] mx-auto w-[min(100%,calc(74svh*0.745))] motion-reduce:relative @5xl:start-[4%] @5xl:end-auto @5xl:mx-0 @5xl:w-[min(52cqw,calc(84svh*0.745))]"
                    style={art}
                >
                    {page.layers.map((layer, i) => (
                        <StageLayer key={i} layer={layer} />
                    ))}
                </div>
                <Ambient kind={page.ambient} />
            </div>
        </section>
    );
}

function StageLayer({ layer }: { layer: Layer }) {
    const style = {
        left: `${String(layer.x)}%`,
        top: `${String(((layer.y - ART_TOP) / (100 - ART_TOP)) * 100)}%`,
        width: `${String(layer.w)}%`,
        '--o': String(0.03 + layer.order * 0.085),
    } as CSSProperties;
    return (
        <img
            src={layer.src}
            alt=""
            loading="lazy"
            draggable={false}
            className={cn(
                'pw-layer absolute',
                `pw-from-${layer.from}`,
                layer.sway && 'pw-sway-soft',
            )}
            style={style}
        />
    );
}

interface DetailsProps {
    event: PublicInvitationEvent;
    index: number;
}

// Everything a guest needs for the day, on frosted glass over the scene.
function DetailsCard({ event, index }: DetailsProps) {
    const { t, copy } = useInvite();
    const page = pageFor(event.kind);
    const dress = event.dressCode;
    const start = zonedToUtc(event.startsAt, event.timezone);
    const time = new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: event.timezone,
    }).format(start);
    const label = 'text-[10px] font-semibold tracking-[0.32em] uppercase opacity-70';
    return (
        <div
            className={cn(
                'pw-card pointer-events-auto min-h-0 w-full overflow-y-auto rounded-[28px] p-6 text-center shadow-[0_30px_60px_-20px_rgba(40,10,30,0.45)] ring-1 @xl:mx-auto @xl:max-w-md @5xl:max-w-none @5xl:backdrop-blur-xl [@media(max-height:760px)]:rounded-3xl [@media(max-height:760px)]:p-4',
                page.dark
                    ? 'bg-[#0d1638]/92 ring-white/15 @5xl:bg-[#0d1638]/70'
                    : 'bg-white/92 ring-white/60 @5xl:bg-white/75',
            )}
        >
            <p className="inv-display text-2xl [@media(max-height:760px)]:text-xl">
                {time} · <Editable path={eventPath(index, 'venue')}>{event.venue}</Editable>
            </p>
            {event.address && (
                <p className="mt-1 text-[15px] opacity-80 [@media(max-height:760px)]:text-[13px]">
                    <Editable path={eventPath(index, 'address')}>{event.address}</Editable>
                </p>
            )}
            <div className="text-[12px] [&_a]:border-current [&_button]:border-current">
                <EventActions event={event} />
            </div>
            {dress?.note && (
                <div className="mt-5 border-t border-current/15 pt-5 [@media(max-height:760px)]:mt-3 [@media(max-height:760px)]:pt-3">
                    <p className={label}>{copy('dressCode')}</p>
                    <p className="mt-1.5 text-[16px] leading-snug [@media(max-height:760px)]:text-[14px]">
                        {t(dress.note)}
                    </p>
                    {dress.swatches.length > 0 && (
                        <div
                            className="mt-3 flex justify-center gap-2 [@media(max-height:760px)]:mt-2"
                            aria-hidden
                        >
                            {dress.swatches.map((c) => (
                                <span
                                    key={c}
                                    className="size-6 rounded-full ring-2 ring-white/70"
                                    style={{ background: c }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
            {(dress?.ladies ?? dress?.gentlemen) && (
                <div className="mt-5 grid gap-3 text-start @xl:grid-cols-2 [@media(max-height:760px)]:mt-3 [@media(max-height:760px)]:grid-cols-2 [@media(max-height:760px)]:gap-2">
                    {dress.ladies && (
                        <div className="rounded-2xl bg-current/[0.06] p-3.5 [@media(max-height:760px)]:p-2.5">
                            <p className={label}>For the ladies</p>
                            <p className="mt-1 text-[15px] leading-snug [@media(max-height:760px)]:text-[13px]">
                                {t(dress.ladies)}
                            </p>
                        </div>
                    )}
                    {dress.gentlemen && (
                        <div className="rounded-2xl bg-current/[0.06] p-3.5 [@media(max-height:760px)]:p-2.5">
                            <p className={label}>For the gentlemen</p>
                            <p className="mt-1 text-[15px] leading-snug [@media(max-height:760px)]:text-[13px]">
                                {t(dress.gentlemen)}
                            </p>
                        </div>
                    )}
                </div>
            )}
            {event.description && (
                <p className="mt-5 text-[15px] leading-relaxed italic opacity-90 [@media(max-height:760px)]:mt-3 [@media(max-height:760px)]:text-[13px] [@media(max-height:760px)]:leading-snug">
                    “{t(event.description)}”
                </p>
            )}
        </div>
    );
}

// Six white stage lights; warm white by day, cool white at night.
const nightBeams = ['#ffffff', '#f4f7ff', '#ffffff', '#f4f7ff'];
const dayBeams = ['#ffffff', '#fffaf0', '#ffffff', '#fffaf0'];

// Party lights in white: beams swing from heads along the top, spots sweep the floor, pulsing to a beat.
function DjLights({ dark }: { dark: boolean }) {
    const colours = dark ? nightBeams : dayBeams;
    return (
        <div
            className={cn(
                'pw-dj pointer-events-none absolute inset-0 z-[1]',
                dark && 'pw-dj-night',
            )}
            aria-hidden
        >
            {colours.map((c, i) => {
                const beam = {
                    left: `${String(12 + i * 25)}%`,
                    '--beam': c,
                    animationDuration: `${String(3.2 + ((i * 7) % 5) * 0.55)}s`,
                    animationDelay: `${String(i * -0.9)}s`,
                } as CSSProperties;
                const head = {
                    left: `${String(12 + i * 25)}%`,
                    background: c,
                    boxShadow: `0 0 14px 5px ${c}`,
                };
                return (
                    <span key={i}>
                        <span className="pw-beam" style={beam} />
                        <span className="pw-beam-head" style={head} />
                    </span>
                );
            })}
            <span className="pw-spot pw-spot-a" style={{ '--beam': colours[0] } as CSSProperties} />
            <span className="pw-spot pw-spot-b" style={{ '--beam': colours[1] } as CSSProperties} />
        </div>
    );
}

// Mirror-ball tiles: rows of squares, drawn twice side by side so sliding them reads as a spin.
const ballRows = Array.from({ length: 12 }, (_, r) => r);
const ballCols = Array.from({ length: 24 }, (_, c) => c);
const tileShade = (r: number, c: number) => {
    const n = (r * 7 + c * 13) % 9;
    return n > 6 ? '#ffffff' : n > 3 ? '#d6dbe4' : n > 1 ? '#aab1bd' : '#7d8593';
};
const glints = [
    {
        x: 34,
        y: 30,
        d: '0s',
    },
    {
        x: 58,
        y: 44,
        d: '0.8s',
    },
    {
        x: 44,
        y: 62,
        d: '1.5s',
    },
    {
        x: 66,
        y: 26,
        d: '2.1s',
    },
];
const specks = Array.from({ length: 12 }, (_, i) => ({
    x: (i * 41 + 9) % 100,
    y: (i * 23 + 5) % 90,
    s: 3 + (i % 3) * 2,
}));

// A disco mirror ball hanging on its rod: it sways, spins, glints, and throws specks of white
// light that wheel slowly around the scene.
function MirrorBall() {
    const { tier } = useInvite();
    const live = tier === 'full';
    return (
        <>
            {live && (
                <div className="pw-specks pointer-events-none absolute inset-0 z-[1]" aria-hidden>
                    {specks.map((s, i) => {
                        const style = {
                            left: `${String(s.x)}%`,
                            top: `${String(s.y)}%`,
                            width: s.s,
                            height: s.s,
                            animationDelay: `${String(i * 0.17)}s`,
                        };
                        return <span key={i} className="pw-speck" style={style} />;
                    })}
                </div>
            )}
            <div
                className="pw-ball pointer-events-none absolute end-[3%] top-0 z-[2] w-[19cqw] max-w-[150px] @5xl:start-[30%] @5xl:end-auto @5xl:w-[11cqw]"
                aria-hidden
            >
                {/* On phones the ball hangs lower, below the title, on a longer rod. */}
                <div className="mx-auto h-[9svh] w-[2.8%] bg-[#c9ced8] @5xl:hidden" />
                <svg viewBox="0 0 100 150" className="-mt-px w-full overflow-visible">
                    <defs>
                        <clipPath id="pw-ball-clip">
                            <circle cx="50" cy="100" r="40" />
                        </clipPath>
                        <radialGradient id="pw-ball-shade" cx="0.38" cy="0.32" r="0.75">
                            <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
                            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
                            <stop offset="1" stopColor="#0b1230" stopOpacity="0.75" />
                        </radialGradient>
                    </defs>
                    <rect x="48.6" y="0" width="2.8" height="61" fill="#c9ced8" />
                    <g clipPath="url(#pw-ball-clip)">
                        <rect x="10" y="60" width="80" height="80" fill="#9aa2b0" />
                        <g className="pw-ball-tiles">
                            {[0, 1].map((copy) =>
                                ballRows.map((r) =>
                                    ballCols.map((c) => (
                                        <rect
                                            key={`${String(copy)}-${String(r)}-${String(c)}`}
                                            x={10 + copy * 80 + c * 3.4}
                                            y={60 + r * 6.8}
                                            width="3"
                                            height="6.2"
                                            fill={tileShade(r, c)}
                                        />
                                    )),
                                ),
                            )}
                        </g>
                        <circle cx="50" cy="100" r="40" fill="url(#pw-ball-shade)" />
                    </g>
                    {glints.map((g) => (
                        <g
                            key={`${String(g.x)}-${String(g.y)}`}
                            className="pw-glint"
                            style={{ animationDelay: g.d }}
                        >
                            <path
                                d={`M${String(g.x)} ${String(g.y + 58)} l1.4 -5 l1.4 5 l5 1.4 l-5 1.4 l-1.4 5 l-1.4 -5 l-5 -1.4 Z`}
                                fill="#ffffff"
                            />
                        </g>
                    ))}
                </svg>
                <div className="pw-ball-pool mx-auto -mt-1 h-3 w-[70%] rounded-[50%] bg-white/40 blur-md" />
            </div>
        </>
    );
}

const starField = Array.from({ length: 24 }, (_, i) => ({
    x: (i * 53 + 7) % 100,
    y: (i * 29 + 3) % 62,
    d: (i * 0.37) % 4,
    s: 1 + (i % 3),
}));

function Stars() {
    return (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
            {starField.map((s, i) => {
                const style = {
                    left: `${String(s.x)}%`,
                    top: `${String(s.y)}%`,
                    width: s.s,
                    height: s.s,
                    animationDelay: `${String(s.d)}s`,
                };
                return (
                    <span
                        key={i}
                        className="pw-star absolute rounded-full bg-white"
                        style={style}
                    />
                );
            })}
        </div>
    );
}

// Small living details per scene: marigold petals, chandelier sparkle, diya glow, lotus petals.
const particles = Array.from({ length: 14 }, (_, i) => ({
    left: (i * 37 + 11) % 100,
    delay: (i * 1.7) % 9,
    duration: 7 + ((i * 3) % 6),
    size: 0.8 + ((i * 7) % 5) / 4,
}));

function Ambient({ kind }: { kind: Ambient }) {
    const { tier } = useInvite();
    if (tier !== 'full') return null;
    return (
        <div
            className={`pw-ambient pw-ambient-${kind} pointer-events-none absolute inset-0 z-[2]`}
            aria-hidden
        >
            {particles.map((p, i) => {
                const style = {
                    left: `${String(p.left)}%`,
                    animationDelay: `${String(p.delay)}s`,
                    animationDuration: `${String(p.duration)}s`,
                    '--ps': String(p.size),
                } as CSSProperties;
                return <span key={i} style={style} />;
            })}
        </div>
    );
}
