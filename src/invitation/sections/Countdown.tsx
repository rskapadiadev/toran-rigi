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
                    className="inv-card inv-display relative inline-flex h-[1.4em] w-[1em] animate-[flip-in_0.5s_var(--ease-silk)] items-center justify-center overflow-hidden rounded-md text-[clamp(2rem,9vw,4rem)] leading-none [transform-style:preserve-3d]"
                >
                    {digit}
                    <span className="absolute inset-x-0 top-1/2 h-px bg-(--inv-ink) opacity-10" />
                </span>
            ))}
        </span>
    );
}

export function Countdown() {
    const { data, locale } = useInvite();
    const first = data.events[0];
    const target = first ? zonedToUtc(first.startsAt, first.timezone).getTime() : 0;
    const now = useNow(1000);

    if (!first || (now !== null && now > target)) return null;
    const parts = split(now === null ? 0 : target - now);

    return (
        <section className="px-6 py-20 text-center">
            <Reveal>
                <p className="mb-8 text-xs tracking-[0.4em] text-(--inv-gold) uppercase">
                    {s('countdown', locale)}
                </p>
            </Reveal>
            <Reveal
                className="mx-auto flex max-w-3xl flex-wrap items-start justify-center gap-5 sm:gap-8"
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
