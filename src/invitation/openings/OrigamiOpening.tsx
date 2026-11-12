import type { CSSProperties } from 'react';
import { useRef, useState } from 'react';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

interface Flap {
    side: 'top' | 'right' | 'bottom' | 'left';
    clip: string;
    origin: string;
    // Unfolding = turning 180° about the outer edge.
    to: {
        rotationX?: number;
        rotationY?: number;
    };
}

const FLAPS: Flap[] = [
    {
        side: 'top',
        clip: 'polygon(0 0, 100% 0, 50% 50%)',
        origin: '50% 0%',
        to: { rotationX: 180 },
    },
    {
        side: 'right',
        clip: 'polygon(100% 0, 100% 100%, 50% 50%)',
        origin: '100% 50%',
        to: { rotationY: 180 },
    },
    {
        side: 'bottom',
        clip: 'polygon(0 100%, 100% 100%, 50% 50%)',
        origin: '50% 100%',
        to: { rotationX: -180 },
    },
    {
        side: 'left',
        clip: 'polygon(0 0, 0 100%, 50% 50%)',
        origin: '0% 50%',
        to: { rotationY: -180 },
    },
];

// Patterned paper: fine gold lattice over the primary colour, shaded towards the crease.
const paper: CSSProperties = {
    backgroundColor: 'var(--inv-primary)',
    backgroundImage: [
        'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.28), transparent 62%)',
        'repeating-linear-gradient(45deg, color-mix(in oklab, var(--inv-gold) 55%, transparent) 0 1px, transparent 1px 14px)',
        'repeating-linear-gradient(-45deg, color-mix(in oklab, var(--inv-gold) 55%, transparent) 0 1px, transparent 1px 14px)',
    ].join(', '),
};

// Origami: a folded square of patterned paper unfolds flap by flap in 3D to reveal the card.
export function OrigamiOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, names, data, copy } = useInvite();
    const card = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState(false);

    const open = async () => {
        if (busy) return;
        setBusy(true);
        onBegin();
        const root = card.current;
        if (!root || tier === 'static') {
            onOpened();
            return;
        }
        const gsap = await loadGsap();
        const shell = root.closest('[data-opening]');
        const tl = gsap.timeline({ onComplete: onOpened });
        tl.to(root, {
            y: 0,
            rotationZ: 0,
            duration: 0.4,
            ease: 'power2.out',
        });
        FLAPS.forEach((flap, i) => {
            const el = root.querySelector(`[data-flap="${flap.side}"]`);
            tl.to(
                el,
                {
                    ...flap.to,
                    duration: 1,
                    ease: 'power2.inOut',
                },
                0.3 + i * 0.28,
            ).to(
                el,
                {
                    filter: 'brightness(1.25)',
                    duration: 0.5,
                    yoyo: true,
                    repeat: 1,
                },
                0.3 + i * 0.28,
            );
        });
        tl.to(
            root,
            {
                scale: 1.5,
                opacity: 0,
                duration: 0.9,
                ease: 'power2.in',
            },
            2.6,
        ).to(
            shell ?? [],
            {
                opacity: 0,
                duration: 0.6,
            },
            3.1,
        );
    };

    return (
        <OpeningShell onTap={() => void open()} busy={busy} hideTitle>
            <div className="absolute inset-0 bg-(--inv-bg)" />
            <div className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
                <div
                    ref={card}
                    className={`relative aspect-square w-[min(74cqw,340px)] [transform-style:preserve-3d] ${tier === 'full' && !busy ? 'animate-[goo-bob_4s_ease-in-out_infinite]' : ''}`}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md bg-(--inv-surface) p-6 text-center shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] ring-1 ring-(--inv-gold)/60">
                        <div
                            className="pointer-events-none absolute inset-6 opacity-25"
                            aria-hidden
                        >
                            <GenerativeOrnament
                                kind={data.invitation.design.generative.kind}
                                seed={data.invitation.seed + 9}
                                draw={false}
                            />
                        </div>
                        <p className="relative text-[10px] tracking-[0.4em] text-(--inv-gold) uppercase">
                            {copy('saveTheDate')}
                        </p>
                        <h1 className="inv-display relative mt-3 text-[clamp(1.8rem,8cqw,3rem)] leading-tight break-normal">
                            <span className="foil-text">{names.title}</span>
                        </h1>
                        {names.lifeSpan && (
                            <p className="relative mt-2 text-sm tracking-[0.2em] opacity-80">
                                {names.lifeSpan}
                            </p>
                        )}
                    </div>
                    {FLAPS.map((flap) => (
                        <div
                            key={flap.side}
                            data-flap={flap.side}
                            className="absolute inset-0 rounded-md"
                            style={{
                                ...paper,
                                clipPath: flap.clip,
                                transformOrigin: flap.origin,
                            }}
                            aria-hidden
                        />
                    ))}
                    <svg
                        viewBox="0 0 100 100"
                        className="pointer-events-none absolute inset-0 size-full"
                        style={{ opacity: busy ? 0 : 1 }}
                        aria-hidden
                    >
                        <path
                            d="M0 0 L100 100 M100 0 L0 100"
                            stroke="var(--inv-gold)"
                            strokeWidth="0.5"
                            opacity="0.9"
                        />
                        <circle cx="50" cy="50" r="5" fill="var(--inv-gold)" />
                        <circle cx="50" cy="50" r="2.4" fill="var(--inv-primary)" />
                    </svg>
                </div>
            </div>
        </OpeningShell>
    );
}
