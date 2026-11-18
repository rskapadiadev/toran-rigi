import { eventLabel } from '@shared/cultures';
import { formatEventDate, zonedToUtc } from '@shared/time';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import { useNow } from '../../motion/hooks';
import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';
import { CalendarCountdown } from '../luxury/events/CalendarCountdown';
import { DiyaLamp } from '../luxury/typography/DiyaGarland';
import { SectionTitle } from '../luxury/typography/SectionTitle';
import { s, type StringKey } from '../strings';

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

// Each digit flips like a hotel split-flap board when it changes.
function Flip({ value }: { value: number }) {
    const text = String(value).padStart(2, '0');
    return (
        <span className="inline-flex gap-1" dir="ltr">
            {Array.from(text).map((digit, i) => (
                <span
                    key={`${i}-${digit}`}
                    className="inv-card inv-display relative inline-flex h-[1.4em] w-[1em] animate-[flip-in_0.5s_var(--ease-silk)] items-center justify-center overflow-hidden rounded-md text-[clamp(2rem,9cqw,4rem)] leading-none [transform-style:preserve-3d]"
                >
                    {digit}
                    <span className="absolute inset-x-0 top-1/2 h-px bg-(--inv-ink) opacity-10" />
                </span>
            ))}
        </span>
    );
}

export function Countdown({ variant }: { variant: string }) {
    const { data, locale, copy } = useInvite();
    const first = data.events[0];
    const target = first ? zonedToUtc(first.startsAt, first.timezone).getTime() : 0;
    const now = useNow(1000);

    if (!first || (now !== null && now > target)) return null;
    const parts = split(now === null ? 0 : target - now);
    if (variant === 'rings') return <Rings parts={parts} ready={now !== null} />;
    if (variant === 'line') return <Line days={parts[0]?.value ?? 0} ready={now !== null} />;
    if (variant === 'calendar') return <CalendarCountdown />;
    if (variant === 'diyas') return <Diyas parts={parts} ready={now !== null} />;

    return (
        <section className="px-6 py-20 text-center">
            <SectionTitle className="mb-8">{copy('countdown')}</SectionTitle>
            <Reveal
                className="mx-auto flex max-w-3xl flex-wrap items-start justify-center gap-5 @2xl:gap-8"
                delay={120}
            >
                {parts.map((p) => (
                    <div key={p.key} className="flex flex-col items-center gap-3">
                        {now === null ? (
                            <span className="inv-display text-5xl opacity-30">··</span>
                        ) : (
                            <Flip value={p.value} />
                        )}
                        <span className="text-[11px] tracking-[0.3em] uppercase opacity-70">
                            {s(p.key, locale)}
                        </span>
                    </div>
                ))}
            </Reveal>
        </section>
    );
}

interface Part {
    key: StringKey;
    value: number;
}

const ringMax: Partial<Record<StringKey, number>> = {
    days: 365,
    hours: 24,
    minutes: 60,
    seconds: 60,
};

// Gold rings that empty as the day approaches.
interface RingsProps {
    parts: Part[];
    ready: boolean;
}

function Rings({ parts, ready }: RingsProps) {
    const { locale, copy } = useInvite();
    const c = 2 * Math.PI * 42;
    return (
        <section className="px-6 py-20 text-center">
            <SectionTitle className="mb-10">{copy('countdown')}</SectionTitle>
            <Reveal delay={120} className="mx-auto grid max-w-2xl grid-cols-4 gap-3 @2xl:gap-6">
                {parts.map((p) => {
                    const max = ringMax[p.key] ?? 60;
                    const fill = Math.min(1, p.value / max);
                    return (
                        <div key={p.key} className="relative aspect-square">
                            <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeOpacity="0.15"
                                    strokeWidth="3"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="var(--inv-gold)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray={c}
                                    strokeDashoffset={c * (1 - fill)}
                                    className="transition-[stroke-dashoffset] duration-700"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span
                                    className="inv-display text-[clamp(1.4rem,7cqw,2.6rem)] leading-none"
                                    dir="ltr"
                                >
                                    {ready ? String(p.value).padStart(2, '0') : '··'}
                                </span>
                                <span className="mt-1 text-[9px] tracking-[0.25em] uppercase opacity-70">
                                    {s(p.key, locale)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </Reveal>
        </section>
    );
}

interface LineProps {
    days: number;
    ready: boolean;
}

function Line({ days, ready }: LineProps) {
    const { copy } = useInvite();
    return (
        <section className="px-6 py-16 text-center">
            <Reveal className="flex items-baseline justify-center gap-4">
                <span
                    className="inv-display foil-text text-[clamp(4rem,24cqw,9rem)] leading-none"
                    dir="ltr"
                >
                    {ready ? days : '··'}
                </span>
                <span className="inv-script text-[clamp(1.6rem,7cqw,3rem)] text-(--inv-primary)">
                    {copy('daysToGo')}
                </span>
            </Reveal>
            <Reveal delay={150}>
                <p className="mt-4 text-[11px] tracking-[0.4em] uppercase opacity-70">
                    {copy('countdown')}
                </p>
            </Reveal>
        </section>
    );
}

const LAMPS = 9;

interface DiyasProps {
    parts: Part[];
    ready: boolean;
}

// Plain gold numerals over a row of diyas that are lit one by one as the row comes into view.
function Diyas({ parts, ready }: DiyasProps) {
    const { data, locale, copy, t } = useInvite();
    const row = useRef<SVGSVGElement>(null);
    const seen = useInView(row, {
        once: true,
        margin: '-60px',
    });
    const first = data.events[0];
    const until = first
        ? `${t(first.title) || eventLabel(data.invitation.culture, first.kind, locale)} · ${formatEventDate(zonedToUtc(first.startsAt, first.timezone), first.timezone, locale)}`
        : '';
    return (
        <section className="px-5 py-20 text-center">
            <SectionTitle className="mb-8">{copy('countdown')}</SectionTitle>
            <Reveal delay={120}>
                <div className="mx-auto flex max-w-xl items-start justify-center" dir="ltr">
                    {parts.map((p, i) => (
                        <div key={p.key} className="flex items-start">
                            {i > 0 && (
                                <span className="inv-display px-[1.5cqw] pt-[0.15em] text-[clamp(1.4rem,7cqw,2.6rem)] text-(--inv-gold) opacity-60">
                                    :
                                </span>
                            )}
                            <div className="flex w-[17cqw] max-w-28 flex-col items-center">
                                <span className="inv-display text-[clamp(2.4rem,12cqw,4.4rem)] leading-none text-(--inv-gold) [font-variant-numeric:lining-nums_tabular-nums]">
                                    {ready ? String(p.value).padStart(2, '0') : '··'}
                                </span>
                                <span className="mt-2 text-[clamp(0.7rem,3cqw,0.9rem)] tracking-[0.08em] opacity-75">
                                    {s(p.key, locale)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Reveal>
            {until && (
                <Reveal delay={200}>
                    <p className="mt-6 text-[clamp(0.95rem,3.6cqw,1.15rem)] italic opacity-75">
                        {until}
                    </p>
                </Reveal>
            )}
            <svg
                ref={row}
                viewBox={`0 0 ${String(LAMPS * 30)} 40`}
                className="mx-auto mt-12 w-full max-w-xl overflow-visible"
                aria-hidden
            >
                {Array.from({ length: LAMPS }, (_, i) => (
                    <DiyaLamp
                        key={i}
                        x={15 + i * 30}
                        y={30}
                        size={1.05}
                        lit={seen}
                        phase={i}
                        delay={i * 140}
                    />
                ))}
            </svg>
        </section>
    );
}
