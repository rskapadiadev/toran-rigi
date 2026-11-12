import { useRef, useState } from 'react';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

const glowStyle = { background: 'radial-gradient(circle, var(--inv-gold), transparent 70%)' };

// Bandhani dots, lotus petals, phulkari stitches, resham threads: the couple's own generative
// medallion stitches itself in, then the guest dives through its centre into the invitation.
export function BloomOpening({ onBegin, onOpened }: OpeningProps) {
    const { data, tier } = useInvite();
    const { design, seed } = data.invitation;
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
            .to(
                root.querySelector('[data-medallion]'),
                {
                    rotate: 90,
                    scale: 7,
                    opacity: 0,
                    duration: 1.8,
                    ease: 'power3.in',
                },
                0,
            )
            .to(
                root.querySelector('[data-glow]'),
                {
                    scale: 3,
                    opacity: 0.9,
                    duration: 1.2,
                    ease: 'power2.out',
                },
                0.2,
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.6,
                },
                1.5,
            );
    };

    return (
        <OpeningShell onTap={() => void open()} busy={busy}>
            <div
                ref={stage}
                className={`absolute inset-0 flex items-center justify-center texture-${design.texture}`}
            >
                <div
                    data-glow
                    className="absolute size-[40vmin] rounded-full opacity-40 blur-3xl"
                    style={glowStyle}
                />
                <div data-medallion className="relative w-[min(88cqw,560px)]">
                    <GenerativeOrnament
                        kind={design.generative.kind}
                        seed={seed}
                        duration={tier === 'static' ? 1 : 3200}
                        spin={tier === 'full'}
                    />
                </div>
            </div>
        </OpeningShell>
    );
}
