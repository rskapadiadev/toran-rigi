// The stationery suite: the invitation as a boxed set of printed cards, told as guests scroll.
// The main card arrives and its monogram is foil-stamped into the paper; the names write
// themselves in ink, a gold nib at the pen's tip; then the ceremonies card and the reply card slide
// over it one by one, the earlier cards fanning out behind like a real suite on a table.
// Scroll-driven (Motion), so it plays at the guest's pace and runs backwards when they scroll up.
// Still tiers, reduced motion and the PDF get the same three cards laid out flat.
import { eventLabel } from '@shared/cultures';
import { mixHex } from '@shared/materials';
import { formatEventDate, formatEventTime, zonedToUtc, zoneLabel } from '@shared/time';
import { m, type MotionValue, useMotionTemplate, useMotionValue, useTransform } from 'motion/react';
import { type CSSProperties, type ReactNode, useRef } from 'react';

import { useInvite } from '../../context';
import { Editable } from '../../editing';
import { usePrint } from '../../print';
import { useSectionScroll } from '../../scroll';
import { deckled, foil, foilInk, paperGrain } from '../materials';

const INK = '#2b1d18';
const MUTED = '#7b6650';

interface CardProps {
    seed: number;
    children: ReactNode;
    className?: string;
}

// Heavy cotton card: fine grain, a deckled edge, a foil hairline border.
function Card({ seed, children, className = '' }: CardProps) {
    const { data } = useInvite();
    const gold = data.invitation.design.palette.gold;
    const face: CSSProperties = {
        backgroundImage: `${paperGrain}, linear-gradient(165deg, #fffdf8 0%, #f6efe1 60%, #ece1cc 100%)`,
        color: INK,
        ...deckled(seed),
    };
    const border: CSSProperties = { border: `1px solid ${mixHex(gold, '#ffffff', 0.1)}` };
    return (
        <div className={`relative ${className}`} style={face}>
            <div
                className="pointer-events-none absolute inset-[4.5%] rounded-[1px]"
                style={border}
            />
            <div className="relative flex h-full flex-col items-center justify-center px-[10%] py-[11%] text-center">
                {children}
            </div>
        </div>
    );
}

interface Progress {
    // 0 → 1 over the whole suite; held at 1 when still, so everything shows finished.
    p: MotionValue<number>;
}

// The monogram, foil-stamped: blind-debossed ring, then the foil lands with a press and a sheen.
function FoilStamp({ p }: Progress) {
    const { data, names } = useInvite();
    const gold = data.invitation.design.palette.gold;
    const scale = useTransform(p, [0.08, 0.18, 0.22], [1.35, 0.97, 1]);
    const opacity = useTransform(p, [0.08, 0.15], [0, 1]);
    const sheen = useTransform(p, [0.16, 0.34], [-60, 160]);
    const sheenPos = useMotionTemplate`${sheen}% 0`;
    const ring: CSSProperties = {
        boxShadow: `inset 0 1px 2px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.9)`,
        border: `1px solid ${mixHex(gold, '#ffffff', 0.25)}`,
    };
    const ink: CSSProperties = {
        ...foilInk(gold),
        backgroundImage: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.85) 50%, transparent 60%), ${foil(gold)}`,
        backgroundSize: '250% 100%, 100% 100%',
        filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.7)) drop-shadow(0 -1px 0 rgba(90,60,20,0.25))',
    };
    const letters = (
        <span className="inv-display text-[clamp(1.6rem,8cqw,2.4rem)] leading-none">
            {names.initials.join('')}
        </span>
    );
    return (
        <div
            className="flex size-[clamp(4.2rem,20cqw,6rem)] shrink-0 items-center justify-center rounded-full"
            style={ring}
        >
            <m.span
                style={{
                    ...ink,
                    scale,
                    opacity,
                    backgroundPosition: sheenPos,
                }}
            >
                {letters}
            </m.span>
        </div>
    );
}

// Names written in ink: the line is uncovered from the start of the line, a gold nib riding the edge.
interface WrittenProps extends Progress {
    children: ReactNode;
    // The stretch of the suite's scroll over which this line is written.
    from: number;
    to: number;
}

function Handwritten({ p, children, from, to }: WrittenProps) {
    const { dir } = useInvite();
    const hidden = useTransform(p, [from, to], [100, 0]);
    const clip = useTransform(hidden, (h) =>
        dir === 'rtl' ? `inset(-20% 0% -20% ${String(h)}%)` : `inset(-20% ${String(h)}% -20% 0%)`,
    );
    const nib = useTransform(hidden, (h) => `${String(100 - h)}%`);
    const nibOpacity = useTransform(p, [from, from + 0.02, to - 0.02, to], [0, 1, 1, 0]);
    const nibStyle = {
        insetInlineStart: nib,
        opacity: nibOpacity,
    };
    const written = { clipPath: clip };
    return (
        <span className="relative inline-block">
            <m.span className="inline-block" style={written}>
                {children}
            </m.span>
            <m.span
                aria-hidden
                className="absolute top-[22%] -ms-1 size-2 rounded-full bg-(--inv-gold) shadow-[0_0_10px_2px_var(--inv-gold)]"
                style={nibStyle}
            />
        </span>
    );
}

function MainCard({ p }: Progress) {
    const { data, t, locale, copy, names } = useInvite();
    const first = data.events[0];
    const start = first ? zonedToUtc(first.startsAt, first.timezone) : undefined;
    const gold = data.invitation.design.palette.gold;
    const rule: CSSProperties = { background: gold };
    const headline = t(data.invitation.content.headline);
    return (
        <>
            <FoilStamp p={p} />
            {headline && (
                <p
                    className="mt-[7%] max-w-[90%] text-[clamp(0.62rem,2.6cqw,0.8rem)] leading-relaxed tracking-[0.22em] uppercase"
                    style={{ color: MUTED }}
                >
                    <Editable path="headline" multiline>
                        {headline}
                    </Editable>
                </p>
            )}
            <p className="inv-script mt-[6%] text-[clamp(2.4rem,11cqw,3.6rem)] leading-[1.05]">
                <Handwritten p={p} from={0.22} to={0.32}>
                    <Editable path="people.one.name">{names.one}</Editable>
                </Handwritten>
            </p>
            {names.two && (
                <>
                    <p
                        className="inv-script text-[clamp(1.4rem,6cqw,2rem)]"
                        style={{ color: gold }}
                    >
                        {copy('and')}
                    </p>
                    <p className="inv-script text-[clamp(2.4rem,11cqw,3.6rem)] leading-[1.05]">
                        <Handwritten p={p} from={0.31} to={0.41}>
                            <Editable path="people.two.name">{names.two}</Editable>
                        </Handwritten>
                    </p>
                </>
            )}
            <span className="my-[6%] h-px w-1/4" style={rule} />
            {first && start && (
                <div className="space-y-1 text-[clamp(0.62rem,2.6cqw,0.8rem)] tracking-[0.2em] uppercase">
                    <p>{formatEventDate(start, first.timezone, locale)}</p>
                    <p style={{ color: MUTED }}>
                        {formatEventTime(start, first.timezone, locale)} ·{' '}
                        {zoneLabel(first.timezone)}
                    </p>
                    <p className="pt-2 font-semibold">{first.venue}</p>
                </div>
            )}
        </>
    );
}

function CeremoniesCard() {
    const { data, t, locale, copy } = useInvite();
    const gold = data.invitation.design.palette.gold;
    const label: CSSProperties = { color: gold };
    return (
        <>
            <p className="inv-script text-[clamp(2rem,9cqw,3rem)] leading-none">
                {copy('celebrations')}
            </p>
            <ul className="mt-[8%] w-full space-y-[6%]">
                {data.events.map((ev) => {
                    const at = zonedToUtc(ev.startsAt, ev.timezone);
                    return (
                        <li key={ev.id}>
                            <p
                                className="text-[clamp(0.6rem,2.4cqw,0.72rem)] tracking-[0.32em] uppercase"
                                style={label}
                            >
                                {t(ev.title) ||
                                    eventLabel(data.invitation.culture, ev.kind, locale)}
                            </p>
                            <p className="mt-0.5 text-[clamp(0.85rem,3.4cqw,1rem)]">
                                {formatEventDate(at, ev.timezone, locale)} ·{' '}
                                {formatEventTime(at, ev.timezone, locale)}
                            </p>
                            <p
                                className="text-[clamp(0.75rem,3cqw,0.9rem)]"
                                style={{ color: MUTED }}
                            >
                                {ev.venue}
                            </p>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

function ReplyCard() {
    const { data, t, copy } = useInvite();
    const { palette } = data.invitation.design;
    const first = data.events[0];
    const canReply =
        data.invitation.rsvpEnabled &&
        data.invitation.sections.some((x) => x.type === 'rsvp' && x.enabled);
    const button: CSSProperties = { background: mixHex(palette.primary, '#000000', 0.1) };
    const link: CSSProperties = { color: palette.gold };
    return (
        <>
            <p className="inv-script text-[clamp(2rem,9cqw,3rem)] leading-none">
                {copy('rsvpTitle')}
            </p>
            <p
                className="mt-[7%] max-w-[88%] text-[clamp(0.85rem,3.4cqw,1rem)] leading-relaxed"
                style={{ color: MUTED }}
            >
                {t(data.invitation.content.closing)}
            </p>
            {canReply && (
                <a
                    href="#rsvp"
                    className="mt-[9%] rounded-full px-7 py-3 text-[11px] tracking-[0.3em] text-white uppercase"
                    style={button}
                >
                    {copy('rsvpTitle')}
                </a>
            )}
            {first?.mapsUrl && (
                <a
                    href={first.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-[6%] text-[11px] tracking-[0.3em] uppercase underline underline-offset-4"
                    style={link}
                >
                    {copy('directions')}
                </a>
            )}
        </>
    );
}

const cardBox =
    'mx-auto aspect-[5/7] w-[min(80cqw,24rem)] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.12)]';

export function StationerySuite() {
    const { tier, data } = useInvite();
    const print = usePrint();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress: p } = useSectionScroll(ref);
    const done = useMotionValue(1);
    const seed = data.invitation.seed;

    // Main card: arrives, then steps aside as the others land.
    const mainY = useTransform(p, [0, 0.1], ['30%', '0%']);
    const mainOpacity = useTransform(p, [0, 0.08], [0, 1]);
    const mainRotate = useTransform(p, [0.45, 0.6, 0.72, 0.86], [0, -7, -7, -11]);
    const mainX = useTransform(p, [0.45, 0.6, 0.72, 0.86], ['0%', '-6%', '-6%', '-10%']);
    // Ceremonies card: slides up over it, then fans right when the reply card arrives.
    const cerY = useTransform(p, [0.45, 0.6], ['190%', '0%']);
    const cerRotate = useTransform(p, [0.45, 0.6, 0.72, 0.86], [7, 1, 1, 6]);
    const cerX = useTransform(p, [0.72, 0.86], ['0%', '7%']);
    // Reply card: last on top.
    const repY = useTransform(p, [0.72, 0.86], ['190%', '0%']);
    const repRotate = useTransform(p, [0.72, 0.86], [-6, -0.5]);

    // The device tier is already 'static' for reduced motion, and is safe to read while hydrating.
    const still = print || tier === 'static';
    if (still)
        return (
            <section
                ref={ref}
                className="relative space-y-10 py-[calc(var(--inv-screen,100svh)*0.1)]"
                data-print-page
            >
                <Card seed={seed + 1} className={cardBox}>
                    <MainCard p={done} />
                </Card>
                <Card seed={seed + 2} className={cardBox}>
                    <CeremoniesCard />
                </Card>
                <Card seed={seed + 3} className={cardBox}>
                    <ReplyCard />
                </Card>
            </section>
        );

    const stack = (style: object, z: number) => ({
        ...style,
        zIndex: z,
    });
    return (
        // Tall section, sticky stage: the scroll is the timeline.
        <section ref={ref} className="relative h-[calc(var(--inv-screen,100svh)*4.2)]" data-suite>
            <div className="sticky top-0 flex h-[var(--inv-screen,100svh)] items-center justify-center overflow-hidden">
                <m.div
                    className="absolute"
                    style={stack(
                        {
                            y: mainY,
                            x: mainX,
                            rotate: mainRotate,
                            opacity: mainOpacity,
                        },
                        1,
                    )}
                >
                    <Card seed={seed + 1} className={cardBox}>
                        <MainCard p={p} />
                    </Card>
                </m.div>
                <m.div
                    className="absolute"
                    style={stack(
                        {
                            y: cerY,
                            x: cerX,
                            rotate: cerRotate,
                        },
                        2,
                    )}
                >
                    <Card seed={seed + 2} className={cardBox}>
                        <CeremoniesCard />
                    </Card>
                </m.div>
                <m.div
                    className="absolute"
                    style={stack(
                        {
                            y: repY,
                            rotate: repRotate,
                        },
                        3,
                    )}
                >
                    <Card seed={seed + 3} className={cardBox}>
                        <ReplyCard />
                    </Card>
                </m.div>
            </div>
        </section>
    );
}
