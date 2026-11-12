import { useEffect, useMemo, useState } from 'react';

import { useInvite } from '../context';

function Diya({ lantern }: { lantern: boolean }) {
    return lantern ? (
        <svg viewBox="0 0 20 30" className="w-full" aria-hidden>
            <path
                d="M6 4 h8 l3 10 l-3 12 h-8 l-3 -12 z"
                fill="#ffd77a"
                stroke="var(--inv-gold)"
                strokeWidth="1"
            />
            <circle cx="10" cy="15" r="9" fill="#ffcf5c" opacity="0.35" />
        </svg>
    ) : (
        <svg viewBox="0 0 20 20" className="w-full" aria-hidden>
            <circle cx="10" cy="8" r="8" fill="#ffcf5c" opacity="0.35" />
            <path d="M10 2 C12 6 13 8 10 10 C7 8 8 6 10 2 Z" fill="#ffb21e" />
            <path d="M3 12 Q10 10 17 12 Q15 18 10 18 Q5 18 3 12 Z" fill="var(--inv-gold)" />
        </svg>
    );
}

// A shared night sky: every "attending" RSVP releases a light that floats up and stays.
interface LightSkyProps {
    count: number;
    highlight: boolean;
}

export function LightSky({ count, highlight }: LightSkyProps) {
    const { culture, copy, names } = useInvite();
    const lantern = culture.id === 'islamic';
    const lights = useMemo(
        () =>
            Array.from({ length: Math.min(count, 80) }, (_, i) => ({
                left: (i * 37) % 100,
                delay: (i % 12) * 0.7,
                size: 14 + ((i * 7) % 12),
                duration: 9 + ((i * 3) % 7),
            })),
        [count],
    );
    return (
        <div
            className="relative h-80 overflow-hidden rounded-3xl"
            style={{
                background:
                    'radial-gradient(ellipse at 50% 120%, color-mix(in oklab, var(--inv-gold) 30%, transparent), color-mix(in oklab, #0b0716 82%, var(--inv-primary)))',
            }}
        >
            {lights.map((l, i) => (
                <span
                    key={i}
                    className="absolute bottom-0 animate-[sky-rise_var(--d)_ease-in-out_infinite]"
                    style={
                        {
                            insetInlineStart: `${l.left}%`,
                            width: l.size,
                            animationDelay: `${l.delay}s`,
                            '--d': `${l.duration}s`,
                        } as React.CSSProperties
                    }
                >
                    <Diya lantern={lantern} />
                </span>
            ))}
            {highlight && (
                <span className="absolute inset-x-0 bottom-0 mx-auto w-8 animate-[sky-rise_8s_ease-out_forwards]">
                    <Diya lantern={lantern} />
                </span>
            )}
            <p className="absolute inset-x-0 bottom-6 px-6 text-center text-sm text-white/90">
                <span className="inv-display block text-4xl text-(--inv-gold)">{count}</span>
                {copy('lightsLit')} {names.title}
            </p>
        </div>
    );
}

// Jewish weddings end with breaking the glass: tap the glass, it shatters, "Mazel Tov!" showers down.
export function BreakTheGlass() {
    const [broken, setBroken] = useState(false);
    const shards = useMemo(
        () =>
            Array.from({ length: 18 }, (_, i) => ({
                angle: (360 / 18) * i,
                dist: 60 + ((i * 29) % 70),
            })),
        [],
    );
    useEffect(() => {
        if (broken && 'vibrate' in navigator) navigator.vibrate([30, 40, 60]);
    }, [broken]);
    return (
        <div className="flex flex-col items-center gap-4 py-6">
            <button
                type="button"
                onClick={() => {
                    setBroken(true);
                }}
                aria-label="Break the glass"
                className="relative size-28"
            >
                {!broken ? (
                    <svg viewBox="0 0 60 80" className="size-full" aria-hidden>
                        <path
                            d="M14 4 h32 l-6 40 q-10 8 -20 0 z"
                            fill="color-mix(in oklab, white 70%, var(--inv-primary))"
                            stroke="var(--inv-gold)"
                            strokeWidth="1.5"
                            opacity="0.85"
                        />
                        <path d="M30 48 v20 M18 72 h24" stroke="var(--inv-gold)" strokeWidth="2" />
                    </svg>
                ) : (
                    shards.map((sh, i) => (
                        <span
                            key={i}
                            className="absolute inset-0 m-auto h-3 w-1.5 animate-[shard_0.9s_ease-out_forwards] bg-white/80"
                            style={
                                {
                                    '--a': `${sh.angle}deg`,
                                    '--r': `${sh.dist}px`,
                                } as React.CSSProperties
                            }
                        />
                    ))
                )}
            </button>
            {broken && (
                <p className="inv-display animate-[flip-in_0.6s_var(--ease-silk)] text-5xl text-(--inv-gold)">
                    Mazel Tov!
                </p>
            )}
        </div>
    );
}
