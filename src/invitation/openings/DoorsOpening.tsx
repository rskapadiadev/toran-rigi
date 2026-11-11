import { generateOrnament } from '@shared/generative';
import { useMemo, useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

const glowStyle = { background: 'radial-gradient(circle, var(--inv-gold), transparent 70%)' };

type DoorStyle = 'palace' | 'mashrabiya' | 'garden';

const styleFor = (opening: string): DoorStyle =>
    opening === 'mashrabiya' ? 'mashrabiya' : opening === 'garden-arch' ? 'garden' : 'palace';

function DoorPanel({
    side,
    style,
    seed,
}: {
    side: 'left' | 'right';
    style: DoorStyle;
    seed: number;
}) {
    const ornament = useMemo(
        () =>
            generateOrnament(
                style === 'mashrabiya' ? 'girih' : style === 'garden' ? 'botanical' : 'mandala',
                seed,
            ),
        [style, seed],
    );
    const patternId = `lattice-${side}`;
    return (
        <svg viewBox="0 0 200 600" preserveAspectRatio="none" className="size-full" aria-hidden>
            <defs>
                <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
                    {style === 'mashrabiya' ? (
                        <path
                            d="M20 0 L40 20 L20 40 L0 20 Z M20 8 L32 20 L20 32 L8 20 Z M0 0 L8 8 M40 0 L32 8 M0 40 L8 32 M40 40 L32 32"
                            fill="none"
                            stroke="var(--inv-gold)"
                            strokeWidth="1.4"
                        />
                    ) : style === 'garden' ? (
                        <path
                            d="M0 40 Q20 20 40 40 M0 0 Q20 20 40 0"
                            fill="none"
                            stroke="var(--inv-accent)"
                            strokeWidth="1"
                            opacity="0.6"
                        />
                    ) : (
                        <circle cx="20" cy="20" r="2.2" fill="var(--inv-gold)" />
                    )}
                </pattern>
                <linearGradient
                    id={`wood-${side}`}
                    x1={side === 'left' ? '0' : '1'}
                    x2={side === 'left' ? '1' : '0'}
                >
                    <stop
                        offset="0"
                        stopColor="color-mix(in oklab, var(--inv-primary) 55%, black)"
                    />
                    <stop offset="1" stopColor="var(--inv-primary)" />
                </linearGradient>
            </defs>
            <rect width="200" height="600" fill={`url(#wood-${side})`} />
            <rect
                x="12"
                y="12"
                width="176"
                height="576"
                fill={`url(#${patternId})`}
                opacity={style === 'mashrabiya' ? 0.95 : 0.55}
            />
            {style === 'garden' && (
                <path
                    d={
                        side === 'left'
                            ? 'M200 0 Q30 40 20 220 L20 600'
                            : 'M0 0 Q170 40 180 220 L180 600'
                    }
                    fill="none"
                    stroke="var(--inv-gold)"
                    strokeWidth="3"
                />
            )}
            <rect
                x="12"
                y="12"
                width="176"
                height="576"
                fill="none"
                stroke="var(--inv-gold)"
                strokeWidth="2"
            />
            <rect
                x="26"
                y="26"
                width="148"
                height="548"
                fill="none"
                stroke="var(--inv-gold)"
                strokeWidth="0.8"
                opacity="0.7"
            />
            <g
                transform={`translate(${side === 'left' ? 100 : 100} 300) scale(0.42) translate(-200 -200)`}
            >
                {ornament.paths.map((p, i) => (
                    <path
                        key={i}
                        d={p.d}
                        fill={p.fill ? 'var(--inv-gold)' : 'none'}
                        stroke={p.fill ? 'none' : 'var(--inv-gold)'}
                        strokeWidth={p.width * 1.4}
                        opacity={0.9}
                    />
                ))}
            </g>
            <circle cx={side === 'left' ? 186 : 14} cy="300" r="7" fill="var(--inv-gold)" />
        </svg>
    );
}

// Palace doors (Rajwada), mashrabiya lattice (Islamic) and garden-arch (Christian) share one engine.
export function DoorsOpening({ onBegin, onOpened }: OpeningProps) {
    const { data, tier } = useInvite();
    const { design, seed } = data.invitation;
    const style = styleFor(design.opening);
    const stage = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState(false);

    const open = async () => {
        if (busy) return;
        setBusy(true);
        onBegin();
        const root = stage.current;
        if (!root || tier === 'static') {
            onOpened();
            return;
        }
        const gsap = await loadGsap();
        const tl = gsap.timeline({
            onComplete: onOpened,
            defaults: { ease: 'power3.inOut' },
        });
        const left = root.querySelector('[data-door=left]');
        const right = root.querySelector('[data-door=right]');
        tl.to(
            root.querySelector('[data-light]'),
            {
                opacity: 1,
                scale: 1.2,
                duration: 0.6,
            },
            0,
        );
        if (style === 'mashrabiya') {
            tl.to(
                left,
                {
                    xPercent: -100,
                    duration: 1.6,
                },
                0.3,
            ).to(
                right,
                {
                    xPercent: 100,
                    duration: 1.6,
                },
                0.3,
            );
        } else {
            tl.to(
                left,
                {
                    rotateY: -108,
                    duration: 1.8,
                },
                0.3,
            ).to(
                right,
                {
                    rotateY: 108,
                    duration: 1.8,
                },
                0.3,
            );
        }
        tl.to(
            root.querySelector('[data-light]'),
            {
                scale: 4,
                opacity: 0,
                duration: 1,
            },
            1.2,
        )
            .to(
                root.parentElement?.querySelector('[data-opening-title]') ?? [],
                {
                    y: -40,
                    opacity: 0,
                    duration: 0.6,
                },
                1.1,
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.6,
                },
                1.8,
            );
    };

    return (
        <OpeningShell onTap={() => void open()} busy={busy}>
            <div ref={stage} className="absolute inset-0 flex [perspective:1400px]">
                <div
                    data-light
                    className="absolute inset-0 m-auto size-[60vmin] scale-50 rounded-full opacity-0 blur-3xl"
                    style={glowStyle}
                />
                <div
                    data-door="left"
                    className="relative h-full w-1/2 origin-left shadow-2xl [transform-style:preserve-3d]"
                >
                    <DoorPanel side="left" style={style} seed={seed} />
                </div>
                <div
                    data-door="right"
                    className="relative h-full w-1/2 origin-right shadow-2xl [transform-style:preserve-3d]"
                >
                    <DoorPanel side="right" style={style} seed={seed + 1} />
                </div>
            </div>
        </OpeningShell>
    );
}
