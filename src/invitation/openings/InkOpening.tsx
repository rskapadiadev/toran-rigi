import { rng } from '@shared/generative';
import { useMemo, useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

interface Bloom {
    cx: number;
    cy: number;
    r: number;
    color: string;
    opacity: number;
}

// Watercolour ink: one drop on paper, then layered blooms with noise-torn edges wash over the screen.
// Calm and silent, so it also suits remembrance.
export function InkOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, names, data, copy } = useInvite();
    const seed = data.invitation.seed;
    const stage = useRef<SVGSVGElement>(null);
    const reveal = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState(false);
    const id = `ink-${String(seed)}`;
    const blooms = useMemo<Bloom[]>(() => {
        const r = rng(seed + 31);
        const tones = ['var(--inv-accent)', 'var(--inv-primary)', 'var(--inv-gold)'];
        const scattered = Array.from({ length: 6 }, (_, i) => ({
            cx: r.range(10, 90),
            cy: r.range(25, 175),
            r: r.range(38, 70),
            color: tones[i % tones.length] ?? 'var(--inv-primary)',
            opacity: r.range(0.45, 0.7),
        }));
        // The last wash covers everything in the primary ink.
        return [
            ...scattered,
            {
                cx: 50,
                cy: 100,
                r: 135,
                color: 'var(--inv-primary)',
                opacity: 1,
            },
        ];
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
        const circles = Array.from(svg.querySelectorAll<SVGCircleElement>('[data-bloom]'));
        const tl = gsap.timeline({ onComplete: onOpened });
        tl.to(svg.querySelector('[data-drop]'), {
            attr: { r: 0 },
            duration: 0.35,
            ease: 'power2.in',
        });
        circles.forEach((c, i) => {
            const target = blooms[i]?.r ?? 60;
            tl.to(
                c,
                {
                    attr: { r: target },
                    duration: i === circles.length - 1 ? 1.6 : 1.3,
                    ease: 'power2.out',
                },
                0.25 + i * 0.14,
            );
        });
        tl.to(
            svg.querySelector('feDisplacementMap'),
            {
                attr: { scale: 4 },
                duration: 1.8,
                ease: 'power1.out',
            },
            0.6,
        )
            .fromTo(
                reveal.current,
                {
                    opacity: 0,
                    letterSpacing: '0.3em',
                },
                {
                    opacity: 1,
                    letterSpacing: '0em',
                    duration: 1.1,
                    ease: 'power2.out',
                },
                1.6,
            )
            .to(
                shell ?? [],
                {
                    opacity: 0,
                    duration: 0.8,
                },
                3.2,
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
                    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.045"
                            numOctaves="3"
                            seed={seed % 97}
                            result="noise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="16"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
                <g filter={`url(#${id})`}>
                    {blooms.map((b, i) => (
                        <circle
                            key={i}
                            data-bloom
                            cx={b.cx}
                            cy={b.cy}
                            r="0"
                            fill={b.color}
                            opacity={b.opacity}
                        />
                    ))}
                    <circle
                        data-drop
                        cx="50"
                        cy="100"
                        r="5"
                        fill="var(--inv-primary)"
                        className={
                            tier === 'full' ? 'animate-[ink-breathe_2.6s_ease-in-out_infinite]' : ''
                        }
                        style={{
                            transformBox: 'fill-box',
                            transformOrigin: 'center',
                        }}
                    />
                </g>
            </svg>
            <div
                ref={reveal}
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center opacity-0"
                style={{ color: 'var(--inv-bg)' }}
            >
                {names.honorific && (
                    <p className="text-xs tracking-[0.35em] uppercase opacity-80">
                        {names.honorific}
                    </p>
                )}
                <h1 className="inv-display mt-3 text-[clamp(2.4rem,11cqw,4.4rem)] leading-tight break-normal">
                    {names.title}
                </h1>
                {names.lifeSpan ? (
                    <p className="mt-3 tracking-[0.2em] opacity-85">{names.lifeSpan}</p>
                ) : (
                    <p className="mt-4 text-[10px] tracking-[0.45em] uppercase opacity-80">
                        {copy('saveTheDate')}
                    </p>
                )}
            </div>
        </OpeningShell>
    );
}
