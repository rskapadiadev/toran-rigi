import { useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

const LANTERNS = [
    {
        x: 18,
        drop: 26,
        scale: 0.8,
    },
    {
        x: 50,
        drop: 38,
        scale: 1,
    },
    {
        x: 82,
        drop: 22,
        scale: 0.75,
    },
];

function Fanoos({ lit }: { lit: boolean }) {
    return (
        <svg viewBox="0 0 60 120" className="w-full overflow-visible" aria-hidden>
            <defs>
                <radialGradient id="fanoos-glow">
                    <stop offset="0" stopColor="#fff3c4" />
                    <stop offset="0.5" stopColor="var(--inv-gold)" />
                    <stop offset="1" stopColor="transparent" />
                </radialGradient>
            </defs>
            <circle
                cx="30"
                cy="68"
                r="46"
                fill="url(#fanoos-glow)"
                className="transition-opacity duration-700"
                opacity={lit ? 0.75 : 0}
            />
            <path d="M30 0 V18" stroke="var(--inv-gold)" strokeWidth="1.2" />
            <path d="M22 18 h16 l4 8 h-24 z" fill="var(--inv-gold)" />
            <path
                d="M18 26 h24 l8 40 l-8 30 h-24 l-8 -30 z"
                fill={
                    lit
                        ? 'color-mix(in oklab, var(--inv-gold) 60%, #fff6d0)'
                        : 'color-mix(in oklab, var(--inv-surface) 70%, black)'
                }
                stroke="var(--inv-gold)"
                strokeWidth="1.5"
                className="transition-[fill] duration-700"
            />
            <path
                d="M30 26 V96 M18 26 L10 66 L18 96 M42 26 L50 66 L42 96 M10 66 H50"
                stroke="var(--inv-gold)"
                strokeWidth="0.8"
                fill="none"
            />
            <path d="M22 96 h16 l-3 8 h-10 z" fill="var(--inv-gold)" />
            <path d="M30 104 v10" stroke="var(--inv-gold)" strokeWidth="1" />
        </svg>
    );
}

// Noor: the guest lights each fanoos lantern, then a crescent rises and the night lifts.
export function LanternOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier } = useInvite();
    const stage = useRef<HTMLDivElement>(null);
    const [lit, setLit] = useState<boolean[]>(LANTERNS.map(() => false));
    const [started, setStarted] = useState(false);

    const finish = async () => {
        const root = stage.current;
        if (!root || tier === 'static') {
            onOpened();
            return;
        }
        const gsap = await loadGsap();
        gsap.timeline({ onComplete: onOpened })
            .to(
                root.querySelector('[data-crescent]'),
                {
                    yPercent: -140,
                    opacity: 1,
                    duration: 1.4,
                    ease: 'power2.out',
                },
                0,
            )
            .to(
                root.querySelectorAll('[data-lantern]'),
                {
                    y: -40,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.1,
                    ease: 'power2.in',
                },
                0.9,
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.6,
                },
                1.6,
            );
    };

    const light = (i: number) => {
        if (!started) {
            setStarted(true);
            onBegin();
        }
        const next = lit.map((v, k) => v || k === i);
        setLit(next);
        if (next.every(Boolean)) void finish();
    };

    return (
        <OpeningShell
            prompt="lightLanterns"
            onTap={() => {
                light(lit.findIndex((v) => !v));
            }}
            busy={lit.every(Boolean)}
        >
            <div ref={stage} className="absolute inset-0">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse at 50% 120%, color-mix(in oklab, var(--inv-primary) 35%, transparent), transparent 60%)',
                    }}
                />
                <svg
                    data-crescent
                    viewBox="0 0 100 100"
                    className="absolute inset-x-0 bottom-0 mx-auto w-40 opacity-0"
                    aria-hidden
                >
                    <path
                        d="M62 10 A40 40 0 1 0 62 90 A32 32 0 1 1 62 10 Z"
                        fill="var(--inv-gold)"
                    />
                </svg>
                {LANTERNS.map((l, i) => (
                    <button
                        key={i}
                        type="button"
                        data-lantern
                        aria-label={`Lantern ${i + 1}`}
                        aria-pressed={lit[i]}
                        onClick={() => {
                            light(i);
                        }}
                        className="absolute top-0 w-[18vmin] max-w-28 -translate-x-1/2 animate-(--animate-float) rtl:translate-x-1/2"
                        style={{
                            insetInlineStart: `${l.x}%`,
                            transform: `translateY(${l.drop}vh) scale(${l.scale})`,
                            animationDelay: `${i * 0.8}s`,
                        }}
                    >
                        <Fanoos lit={Boolean(lit[i])} />
                    </button>
                ))}
            </div>
        </OpeningShell>
    );
}
