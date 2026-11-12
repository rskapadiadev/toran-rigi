import { zonedToUtc } from '@shared/time';

import { useNow } from '../../motion/hooks';
import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';
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

    return (
        <section className="px-6 py-20 text-center">
            <Reveal>
                <p className="mb-8 text-xs tracking-[0.4em] text-(--inv-gold) uppercase">
                    {copy('countdown')}
                </p>
            </Reveal>
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
            <Reveal>
                <p className="mb-10 text-xs tracking-[0.4em] text-(--inv-gold) uppercase">
                    {copy('countdown')}
                </p>
            </Reveal>
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
