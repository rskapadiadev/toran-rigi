import { useRef, useState } from 'react';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// The chuppah canopy unfolds over the couple's names, framed by their generated ketubah border.
export function ChuppahOpening({ onBegin, onOpened }: OpeningProps) {
    const { data, tier } = useInvite();
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
        gsap.timeline({ onComplete: onOpened })
            .fromTo(
                root.querySelector('[data-canopy]'),
                { scaleY: 0.05 },
                {
                    scaleY: 1,
                    duration: 1.2,
                    ease: 'elastic.out(1, 0.6)',
                },
                0,
            )
            .fromTo(
                root.querySelectorAll('[data-pole]'),
                { scaleY: 0 },
                {
                    scaleY: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                },
                0,
            )
            .to(
                root.querySelector('[data-ketubah]'),
                {
                    scale: 4,
                    opacity: 0,
                    duration: 1.4,
                    ease: 'power3.in',
                },
                1.1,
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.6,
                },
                1.9,
            );
    };

    return (
        <OpeningShell onTap={() => void open()} busy={busy}>
            <div
                ref={stage}
                className="texture-paper absolute inset-0 flex items-end justify-center pb-[22svh]"
            >
                <div className="relative h-[46svh] w-[min(84vw,520px)]">
                    <div
                        data-canopy
                        className="absolute inset-x-[-4%] top-0 h-[22%] origin-top rounded-b-[40%] shadow-xl"
                        style={{
                            background:
                                'linear-gradient(180deg, var(--inv-surface), color-mix(in oklab, var(--inv-surface) 70%, var(--inv-primary)))',
                            borderBottom: '3px solid var(--inv-gold)',
                        }}
                    />
                    <span
                        data-pole
                        className="absolute start-0 top-0 h-full w-1.5 origin-bottom rounded-full bg-(--inv-gold)"
                    />
                    <span
                        data-pole
                        className="absolute end-0 top-0 h-full w-1.5 origin-bottom rounded-full bg-(--inv-gold)"
                    />
                    <div data-ketubah className="absolute inset-x-[10%] top-[26%] aspect-square">
                        <GenerativeOrnament
                            kind="ketubah"
                            seed={data.invitation.seed}
                            duration={2400}
                        />
                    </div>
                </div>
            </div>
        </OpeningShell>
    );
}
