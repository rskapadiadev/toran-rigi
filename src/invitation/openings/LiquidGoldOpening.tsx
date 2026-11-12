import { rng } from '@shared/generative';
import { useMemo, useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

interface Drop {
    cx: number;
    cy: number;
    r: number;
    delay: number;
}

// Molten gold: drops wobble around a pool (an SVG "goo" filter fuses them), then flood the screen.
export function LiquidGoldOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, names, data, copy } = useInvite();
    const seed = data.invitation.seed;
    const stage = useRef<SVGSVGElement>(null);
    const reveal = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState(false);
    const id = `goo-${String(seed)}`;
    const drops = useMemo<Drop[]>(() => {
        const r = rng(seed + 77);
        return Array.from({ length: 7 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 7 + r.range(-0.3, 0.3);
            const d = r.range(22, 34);
            return {
                cx: 50 + Math.cos(a) * d * 0.8,
                cy: 100 + Math.sin(a) * d,
                r: r.range(3.5, 7),
                delay: r.range(0, 2),
            };
        });
    }, [seed]);

    const open = async () => {
        if (busy) return;
        setBusy(true);
        onBegin();
        const svg = stage.current;
        if (!svg || tier === 'static') {
            onOpened();
            return;
        }
        const gsap = await loadGsap();
        const shell = svg.closest('[data-opening]');
        gsap.timeline({ onComplete: onOpened })
            .to(svg.querySelectorAll('[data-drop]'), {
                attr: {
                    cx: 50,
                    cy: 100,
                },
                duration: 0.7,
                ease: 'power3.in',
                stagger: 0.05,
            })
            .to(
                svg.querySelector('[data-pool]'),
                {
                    attr: { r: 150 },
                    duration: 1.4,
                    ease: 'power3.inOut',
                },
                0.55,
            )
            .to(
                svg.querySelector('[data-shine]'),
                {
                    attr: { x: 140 },
                    duration: 1.2,
                    ease: 'power2.inOut',
                },
                1.4,
            )
            .fromTo(
                reveal.current,
                {
                    opacity: 0,
                    scale: 0.92,
                    filter: 'blur(10px)',
                },
                {
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1,
                    ease: 'power2.out',
                },
                1.5,
            )
            .to(
                shell ?? [],
                {
                    opacity: 0,
                    duration: 0.7,
                },
                3.1,
            );
    };

    return (
        <OpeningShell onTap={() => void open()} busy={busy} hideTitle={busy}>
            <div className="absolute inset-0 bg-(--inv-bg)" />
            <svg
                ref={stage}
                viewBox="0 0 100 200"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 size-full"
                aria-hidden
            >
                <defs>
                    <filter id={id}>
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
                        <feColorMatrix
                            in="blur"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
                            result="goo"
                        />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                    <linearGradient
                        id={`${id}-gold`}
                        gradientUnits="userSpaceOnUse"
                        x1="0"
                        y1="0"
                        x2="100"
                        y2="200"
                    >
                        <stop offset="0" stopColor="#fff1c2" />
                        <stop offset="0.35" stopColor="var(--inv-gold)" />
                        <stop offset="0.7" stopColor="#8f6a1f" />
                        <stop offset="1" stopColor="var(--inv-gold)" />
                    </linearGradient>
                    <linearGradient id={`${id}-shine`} x1="0" x2="1">
                        <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
                        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <g filter={`url(#${id})`} fill={`url(#${id}-gold)`}>
                    <circle data-pool cx="50" cy="100" r="15" />
                    {drops.map((d, i) => (
                        <circle
                            key={i}
                            data-drop
                            cx={d.cx}
                            cy={d.cy}
                            r={d.r}
                            className={
                                tier === 'full' ? 'animate-[goo-bob_3.2s_ease-in-out_infinite]' : ''
                            }
                            style={{
                                animationDelay: `${String(d.delay)}s`,
                                transformBox: 'fill-box',
                            }}
                        />
                    ))}
                </g>
                <rect
                    data-shine
                    x="-60"
                    y="0"
                    width="40"
                    height="200"
                    fill={`url(#${id}-shine)`}
                    transform="skewX(-18)"
                />
            </svg>
            <div
                ref={reveal}
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center opacity-0"
                style={{ color: '#2a1d05' }}
            >
                <p className="text-[10px] tracking-[0.45em] uppercase">{copy('saveTheDate')}</p>
                <h1 className="inv-display mt-5 text-[clamp(2.4rem,11cqw,4.4rem)] leading-none break-normal">
                    {names.title}
                </h1>
                {names.lifeSpan && <p className="mt-3 tracking-[0.2em]">{names.lifeSpan}</p>}
            </div>
        </OpeningShell>
    );
}
