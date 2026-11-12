import { useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// Editorial: rows of giant serif letters slide apart like a theatre curtain.
export function CurtainOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, names } = useInvite();
    const word = `${[names.one, names.two].filter(Boolean).join(' · ')} · `.toUpperCase();
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
        const rows = root.querySelectorAll('[data-row]');
        gsap.timeline({ onComplete: onOpened })
            .to(
                rows,
                {
                    xPercent: (i: number) => (i % 2 ? 60 : -60),
                    opacity: 0,
                    duration: 1.4,
                    ease: 'power4.inOut',
                    stagger: 0.06,
                },
                0,
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.5,
                },
                1.3,
            );
    };

    return (
        <OpeningShell onTap={() => void open()} busy={busy}>
            <div
                ref={stage}
                className="absolute inset-0 flex flex-col justify-center overflow-hidden"
                aria-hidden
            >
                {Array.from({ length: 7 }, (_, i) => (
                    <div
                        key={i}
                        data-row
                        className="inv-display text-[18vh] leading-[0.95] font-light whitespace-nowrap opacity-90"
                        style={{
                            color: i % 3 === 1 ? 'var(--inv-primary)' : 'var(--inv-ink)',
                            marginInlineStart: `${-((i * 37) % 60)}vw`,
                        }}
                    >
                        {word.repeat(4)}
                    </div>
                ))}
            </div>
        </OpeningShell>
    );
}
