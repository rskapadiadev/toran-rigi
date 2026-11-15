import { useState } from 'react';

import { useInvite } from '../context';
import { useFinish } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

const RINGS = 3;

// A temple ghanti hangs from its chain: each tap swings it and sends out rings of sound; on the
// third ring a golden wave fills the screen.
export function BellOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier } = useInvite();
    const [rings, setRings] = useState(0);
    const finish = useFinish(onOpened);
    const done = rings >= RINGS;

    const ring = () => {
        if (done) return;
        if (rings === 0) onBegin();
        if (tier === 'static') {
            onOpened();
            return;
        }
        const next = rings + 1;
        setRings(next);
        if (next >= RINGS) finish(2200);
    };

    return (
        <OpeningShell prompt="ringBell" onTap={ring} busy={done} hideTitle={done}>
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 35%, color-mix(in oklab, var(--inv-primary) 45%, var(--inv-bg)), color-mix(in oklab, var(--inv-primary) 75%, black))',
                }}
            />
            {/* Rings of sound: one set per ring, keyed so each tap starts a fresh ripple. */}
            {Array.from({ length: rings }, (_, i) => (
                <div
                    key={i}
                    aria-hidden
                    className="pointer-events-none absolute top-[calc(26svh+100px)] -translate-y-1/2"
                    style={{ left: '50%' }}
                >
                    {[0, 1, 2].map((k) => (
                        <span
                            key={k}
                            className="absolute size-24 animate-[bell-ripple_1.6s_ease-out_both] rounded-full border-2 border-(--inv-gold)"
                            style={{ animationDelay: `${String(k * 180)}ms` }}
                        />
                    ))}
                </div>
            ))}
            {/* The golden wave on the last ring. */}
            <div
                aria-hidden
                className="pointer-events-none absolute top-[calc(26svh+100px)] size-[24svh] rounded-full transition-[transform,opacity] duration-[1400ms] ease-[cubic-bezier(0.5,0,0.2,1)]"
                style={{
                    left: '50%',
                    background:
                        'radial-gradient(circle, #fff3c8, var(--inv-gold) 45%, transparent 70%)',
                    transform: `translate(-50%, -50%) scale(${done ? 12 : 0})`,
                    opacity: done ? 1 : 0,
                }}
            />
            <div
                aria-hidden
                className={`absolute top-0 z-10 flex -translate-x-1/2 flex-col items-center transition-opacity duration-700 ${done ? 'opacity-0 delay-700' : ''}`}
                style={{ left: '50%' }}
            >
                <div className="h-[26svh] w-1 bg-[repeating-linear-gradient(180deg,#e9c46a_0_6px,#9c7424_6px_8px)]" />
                {/* key restarts the swing on every ring. */}
                <svg
                    key={rings}
                    viewBox="0 0 120 150"
                    className={`w-[min(34cqw,170px)] origin-top drop-shadow-[0_14px_20px_rgba(0,0,0,0.45)] ${rings > 0 ? 'animate-[bell-swing_1.4s_ease-out_both]' : ''}`}
                >
                    <defs>
                        <linearGradient id="bell-brass" x1="0" x2="1">
                            <stop offset="0" stopColor="#6b4a14" />
                            <stop offset="0.42" stopColor="#f0cf78" />
                            <stop offset="0.6" stopColor="#c3952f" />
                            <stop offset="1" stopColor="#5a3d10" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx="60"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke="url(#bell-brass)"
                        strokeWidth="4"
                    />
                    <path d="M52 18 H68 V30 H52 Z" fill="url(#bell-brass)" />
                    <path
                        d="M60 30 C36 30 26 50 26 76 C26 96 20 110 10 120 L110 120 C100 110 94 96 94 76 C94 50 84 30 60 30 Z"
                        fill="url(#bell-brass)"
                    />
                    <path d="M24 100 H96" stroke="#5a3d10" strokeWidth="2" opacity="0.6" />
                    <path d="M28 86 H92" stroke="#f6dc92" strokeWidth="1.2" opacity="0.7" />
                    <path d="M4 120 H116 V128 H4 Z" fill="url(#bell-brass)" />
                    <circle cx="60" cy="140" r="9" fill="url(#bell-brass)" />
                </svg>
                {/* One dot per ring still to go. */}
                <div className="mt-4 flex gap-2">
                    {Array.from({ length: RINGS }, (_, i) => (
                        <span
                            key={i}
                            className={`size-2 rounded-full border border-(--inv-gold) transition-colors ${i < rings ? 'bg-(--inv-gold)' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </OpeningShell>
    );
}
