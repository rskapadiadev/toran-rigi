// "Desk calendar": the countdown as a tear-off calendar on a leather stand. When it comes into view
// the months before the day are torn off one by one, flipping up over the rings, until the page for
// the month of the wedding lies open and the day itself is circled in gold ink, as if by hand.
// Beneath it, the days still to go, ticking.
import { mixHex } from '@shared/materials';
import { formatEventDate, formatEventTime, zonedToUtc } from '@shared/time';
import { weekStart } from '@shared/week';
import { m } from 'motion/react';
import type { CSSProperties } from 'react';

import { useNow } from '../../../motion/hooks';
import { useInvite } from '../../context';
import { usePrint } from '../../print';
import { s, type StringKey } from '../../strings';
import { foilInk, grain, paperGrain } from '../materials';
import { SectionTitle, useScriptTitles } from '../typography/SectionTitle';

const units: [StringKey, number][] = [
    ['days', 86_400_000],
    ['hours', 3_600_000],
    ['minutes', 60_000],
    ['seconds', 1000],
];

function split(ms: number) {
    let rest = Math.max(0, ms);
    return units.map(([key, size]) => {
        const value = Math.floor(rest / size);
        rest -= value * size;
        return {
            key,
            value,
        };
    });
}

interface Month {
    year: number;
    // 0-based, like Date.
    month: number;
}

const shift = ({ year, month }: Month, by: number): Month => {
    const at = new Date(Date.UTC(year, month + by, 1));
    return {
        year: at.getUTCFullYear(),
        month: at.getUTCMonth(),
    };
};

const silk = [0.6, 0, 0.2, 1] as const;
const ink = '#2b1f18';

interface LeafProps {
    page: Month;
    // The day of the month to circle, on the wedding page only.
    day?: number;
}

// One calendar page: the month in display type, weekday initials, the grid of days.
function Leaf({ page, day }: LeafProps) {
    const { data, locale } = useInvite();
    const { palette } = data.invitation.design;
    const utc = 'UTC';
    const mid = new Date(Date.UTC(page.year, page.month, 15));
    const monthName = new Intl.DateTimeFormat(locale, {
        month: 'long',
        timeZone: utc,
    }).format(mid);
    const yearText = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        timeZone: utc,
    }).format(mid);
    const weekday = new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        timeZone: utc,
    });
    const digits = new Intl.NumberFormat(locale);
    // Weeks start the way they do where the wedding is: Sunday, Monday or Saturday.
    const start = weekStart(data.events[0]?.timezone);
    // 4 January 2026 was a Sunday: count on from there to the local first day.
    const heads = Array.from({ length: 7 }, (_, i) =>
        weekday.format(new Date(Date.UTC(2026, 0, 4 + start + i))),
    );
    const lead = (new Date(Date.UTC(page.year, page.month, 1)).getUTCDay() - start + 7) % 7;
    // The weekly day of rest is printed in red: Friday where weeks start on Saturday, else Sunday.
    const rest = start === 6 ? 6 : (7 - start) % 7;
    const length = new Date(Date.UTC(page.year, page.month + 1, 0)).getUTCDate();
    const cells = [
        ...Array.from({ length: lead }, () => 0),
        ...Array.from({ length }, (_, i) => i + 1),
    ];
    const sheet: CSSProperties = {
        backgroundImage: `${paperGrain}, linear-gradient(175deg, #fdf9f1 0%, ${mixHex('#f3ead8', palette.surface, 0.15)} 100%)`,
        color: ink,
    };
    const restInk = mixHex(palette.primary, '#000000', 0.1);
    const red = { color: restInk };
    const gold = mixHex(palette.gold, '#000000', 0.18);
    const goldText = { color: gold };
    // A pen circle: starts at the top right, goes round once and runs on past where it began.
    const circle =
        'M71 9 C52 1 17 6 8 25 C0 42 21 61 53 59 C84 57 98 41 90 24 C84 11 63 5 35 12 C29 14 25 16 22 19';
    const drawn = {
        hidden: { pathLength: 0 },
        shown: {
            pathLength: 1,
            transition: {
                duration: 1.1,
                delay: 1.55,
                ease: [0.5, 0, 0.3, 1] as const,
            },
        },
    };
    return (
        <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-[3px] px-[7%] pt-[11%] pb-[7%]"
            style={sheet}
        >
            {/* Where the page tears from the pad. */}
            <span
                aria-hidden
                className="absolute inset-x-0 top-[5.5%] border-t border-dashed border-black/15"
            />
            <div className="flex items-baseline justify-between gap-3">
                <span className="inv-display text-[clamp(2rem,10cqw,2.9rem)] leading-none font-semibold tracking-tight">
                    {monthName}
                </span>
                <span
                    className="text-[11px] tracking-[0.35em] tabular-nums"
                    style={goldText}
                    dir="ltr"
                >
                    {yearText}
                </span>
            </div>
            <span className="mt-3 mb-4 block h-px bg-black/15" aria-hidden />
            <div className="grid flex-1 auto-rows-fr grid-cols-7 gap-y-1 text-center">
                {heads.map((head, i) => (
                    <span
                        key={head}
                        className="self-center text-[clamp(0.52rem,2.2cqw,0.66rem)] tracking-[0.18em] uppercase opacity-70"
                        style={i === rest ? red : undefined}
                    >
                        {head}
                    </span>
                ))}
                {cells.map((n, i) => (
                    <span
                        key={i}
                        className={`relative flex items-center justify-center text-[clamp(0.82rem,3.6cqw,1.05rem)] tabular-nums ${n === day ? 'font-semibold' : ''}`}
                        style={i % 7 === rest && n !== day ? red : undefined}
                    >
                        {n > 0 && digits.format(n)}
                        {n === day && day > 0 && (
                            <svg
                                viewBox="0 0 100 70"
                                className="pointer-events-none absolute inset-x-[-38%] inset-y-[-24%] h-[148%] w-[176%] -rotate-6 overflow-visible"
                                aria-hidden
                            >
                                <m.path
                                    d={circle}
                                    fill="none"
                                    stroke={gold}
                                    strokeWidth={2.6}
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                    variants={drawn}
                                />
                            </svg>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
}

interface DeskProps {
    page: Month;
    day: number;
    still: boolean;
}

// The pad on its leather stand, with the earlier months still on top until they are torn away.
function Desk({ page, day, still }: DeskProps) {
    const { data } = useInvite();
    const { palette } = data.invitation.design;
    const leather = mixHex(palette.primary, '#0b0706', 0.55);
    const board: CSSProperties = {
        backgroundImage: `${grain}, linear-gradient(160deg, ${mixHex(leather, '#ffffff', 0.08)}, ${mixHex(leather, '#000000', 0.35)})`,
        boxShadow: `0 40px 60px -30px rgba(0,0,0,0.6), inset 0 0 0 1px ${palette.gold}55, inset 0 0 0 5px ${mixHex(leather, '#000000', 0.2)}, inset 0 0 0 6px ${palette.gold}33`,
    };
    const ring: CSSProperties = {
        background: `linear-gradient(90deg, ${mixHex(palette.gold, '#000000', 0.5)}, ${mixHex(palette.gold, '#ffffff', 0.6)} 45%, ${mixHex(palette.gold, '#000000', 0.35)})`,
        boxShadow: '0 2px 3px rgba(0,0,0,0.35)',
    };
    const stage: CSSProperties = { perspective: '1400px' };
    const lift: CSSProperties = {
        transformOrigin: '50% 0%',
        backfaceVisibility: 'hidden',
    };
    // Torn off one after the other, each flipping up and over the rings.
    const tear = (delay: number) => ({
        hidden: { rotateX: 0 },
        shown: {
            rotateX: 180,
            transition: {
                duration: 0.75,
                delay,
                ease: [0.55, 0, 0.35, 1] as const,
            },
        },
    });
    const shade = (delay: number) => ({
        hidden: { opacity: 0 },
        shown: {
            opacity: 0.4,
            transition: {
                duration: 0.4,
                delay: delay + 0.1,
            },
        },
    });
    const earlier = [shift(page, -1), shift(page, -2)];
    const once = {
        once: true,
        amount: 0.6,
    };
    return (
        <m.div
            className="relative mx-auto w-[min(84cqw,22rem)]"
            style={stage}
            initial={still ? 'shown' : 'hidden'}
            whileInView="shown"
            viewport={once}
        >
            <div className="relative rounded-[14px] px-[4.5%] pt-[9%] pb-[5%]" style={board}>
                {/* Two pages beneath, peeking out: the pad has more months to come. */}
                <div className="relative aspect-[5/6]">
                    <span
                        aria-hidden
                        className="absolute inset-x-[1.5%] top-[2%] -bottom-[2.6%] rounded-[3px] bg-[#e9dfcb] shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                    />
                    <span
                        aria-hidden
                        className="absolute inset-x-[0.8%] top-[1%] -bottom-[1.4%] rounded-[3px] bg-[#f1e8d6] shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                    />
                    <div className="absolute inset-0 shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
                        <Leaf page={page} day={day} />
                    </div>
                    {!still &&
                        earlier.map((leaf, i) => (
                            <m.div
                                key={`${String(leaf.year)}-${String(leaf.month)}`}
                                aria-hidden
                                className="absolute inset-0 shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
                                style={lift}
                                variants={tear(0.35 + (earlier.length - 1 - i) * 0.5)}
                            >
                                <Leaf page={leaf} />
                                <m.span
                                    className="absolute inset-0 rounded-[3px] bg-black"
                                    variants={shade(0.35 + (earlier.length - 1 - i) * 0.5)}
                                />
                            </m.div>
                        ))}
                </div>
                {/* The binding: gold rings through the top of the pad. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-[3.2%] flex justify-center gap-[34%]"
                >
                    {[0, 1].map((i) => (
                        <span key={i} className="relative h-[1.9rem] w-2 rounded-full" style={ring}>
                            <span className="absolute start-1/2 -bottom-1 -ms-[5px] size-2.5 rounded-full bg-black/45" />
                        </span>
                    ))}
                </div>
            </div>
        </m.div>
    );
}

export function CalendarCountdown() {
    const { data, locale, copy, t, tier } = useInvite();
    const print = usePrint();
    const script = useScriptTitles();
    const now = useNow(1000);
    const first = data.events[0];
    const target = first ? zonedToUtc(first.startsAt, first.timezone).getTime() : 0;
    if (!first || (now !== null && now > target)) return null;

    // The wall-clock date where the wedding is: the page and the day guests will circle.
    const [y = 0, mo = 1, d = 1] = (first.startsAt.split('T')[0] ?? '').split('-').map(Number);
    const page = {
        year: y,
        month: mo - 1,
    };
    const at = new Date(target);
    const parts = split(now === null ? 0 : target - now);
    const [days, ...clock] = parts;
    const ready = now !== null;
    const still = print || tier === 'static';
    const gold = data.invitation.design.palette.gold;
    const pad = (n: number) => String(n).padStart(2, '0');
    const hidden = {
        opacity: 0,
        y: 24,
    };
    const shown = {
        opacity: 1,
        y: 0,
    };
    const rise = {
        duration: 1,
        delay: 0.4,
        ease: silk,
    };
    const once = { once: true };
    return (
        <section className="px-6 py-20 text-center" data-print-page={print || undefined}>
            {script ? (
                <SectionTitle className="mb-2">{copy('saveTheDate')}</SectionTitle>
            ) : (
                <p className="mb-3 text-[11px] tracking-[0.5em] text-(--inv-gold) uppercase">
                    {copy('saveTheDate')}
                </p>
            )}
            <p className="mx-auto mb-10 max-w-[32ch] text-[clamp(0.8rem,3.4cqw,0.95rem)] tracking-[0.12em] opacity-90">
                <bdi className="whitespace-nowrap">{t(first.title)}</bdi>
                <span className="mx-2 text-(--inv-gold)" aria-hidden>
                    ·
                </span>
                <bdi className="whitespace-nowrap">
                    {formatEventDate(at, first.timezone, locale)}
                </bdi>
                <span className="mx-2 text-(--inv-gold)" aria-hidden>
                    ·
                </span>
                <bdi className="whitespace-nowrap">
                    {formatEventTime(at, first.timezone, locale)}
                </bdi>
            </p>
            <Desk page={page} day={d} still={still} />
            <m.div
                className="mt-12"
                initial={still ? shown : hidden}
                whileInView={shown}
                viewport={once}
                transition={rise}
            >
                <div className="flex items-baseline justify-center gap-4">
                    <span
                        className="inv-display text-[clamp(3.6rem,20cqw,7rem)] leading-none font-semibold tabular-nums"
                        style={foilInk(gold)}
                        dir="ltr"
                    >
                        {ready && days ? days.value : '··'}
                    </span>
                    <span className="inv-script text-[clamp(1.5rem,7cqw,2.6rem)] text-(--inv-primary)">
                        {copy('daysToGo')}
                    </span>
                </div>
                <p
                    className="mx-auto mt-4 flex w-fit justify-center gap-5 rounded-full bg-(--inv-bg)/75 px-6 py-2.5 text-[10px] tracking-[0.32em] uppercase shadow-[0_8px_24px_-14px_rgba(0,0,0,0.5)] ring-1 ring-(--inv-gold)/30"
                    aria-live="off"
                >
                    {clock.map((part) => (
                        <span key={part.key} className="flex flex-col items-center gap-1">
                            <span
                                className="inv-display text-[1.35rem] tracking-normal tabular-nums"
                                dir="ltr"
                            >
                                {ready ? pad(part.value) : '··'}
                            </span>
                            {s(part.key, locale)}
                        </span>
                    ))}
                </p>
            </m.div>
        </section>
    );
}
