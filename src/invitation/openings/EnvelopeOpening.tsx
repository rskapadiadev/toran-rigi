import { useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// Wax-sealed envelope: the seal cracks in two, the flap lifts and the card rises into the invitation.
export function EnvelopeOpening({ onBegin, onOpened }: OpeningProps) {
    const { data, t, tier } = useInvite();
    const { couple } = data.invitation.content;
    const initials = `${t(couple.one.name).charAt(0)}${t(couple.two.name).charAt(0)}`;
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
        const q = (sel: string) => root.querySelector(sel);
        gsap.timeline({ onComplete: onOpened })
            .to(
                q('[data-seal-l]'),
                {
                    x: -26,
                    rotate: -24,
                    opacity: 0,
                    duration: 0.7,
                    ease: 'power2.in',
                },
                0,
            )
            .to(
                q('[data-seal-r]'),
                {
                    x: 26,
                    rotate: 24,
                    opacity: 0,
                    duration: 0.7,
                    ease: 'power2.in',
                },
                0,
            )
            .to(
                q('[data-flap]'),
                {
                    rotateX: 180,
                    duration: 0.9,
                    ease: 'power3.inOut',
                },
                0.35,
            )
            .set(q('[data-flap]'), { zIndex: 0 }, 0.8)
            .to(
                q('[data-card]'),
                {
                    yPercent: -62,
                    duration: 1,
                    ease: 'power3.out',
                },
                1,
            )
            .to(
                q('[data-card]'),
                {
                    scale: 3.2,
                    yPercent: -20,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power2.in',
                },
                2,
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.5,
                },
                2.5,
            );
    };

    return (
        <OpeningShell onTap={() => void open()} busy={busy}>
            <div
                ref={stage}
                className="texture-paper absolute inset-0 flex items-center justify-center [perspective:1200px]"
            >
                <div className="relative aspect-[4/3] w-[min(86vw,520px)] translate-y-8">
                    <div
                        data-card
                        className="inv-card absolute inset-x-[6%] top-[8%] bottom-[6%] z-10 flex flex-col items-center justify-center rounded-md p-6 text-center"
                    >
                        <span className="inv-script text-4xl text-(--inv-primary)">{initials}</span>
                        <span className="mt-2 text-xs tracking-[0.4em] uppercase opacity-70">
                            {data.invitation.content.hashtag ?? ''}
                        </span>
                    </div>
                    <div
                        className="absolute inset-0 z-20 rounded-md shadow-2xl"
                        style={{
                            background:
                                'linear-gradient(160deg, var(--inv-surface), color-mix(in oklab, var(--inv-surface) 80%, var(--inv-primary)))',
                            clipPath: 'polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)',
                        }}
                    />
                    <div
                        data-flap
                        className="absolute inset-x-0 top-0 z-30 h-[56%] origin-top [backface-visibility:hidden]"
                        style={{
                            background:
                                'linear-gradient(180deg, color-mix(in oklab, var(--inv-surface) 85%, var(--inv-primary)), var(--inv-surface))',
                            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                        }}
                    />
                    <div className="absolute inset-x-0 top-[44%] z-40 flex -translate-y-1/2 justify-center">
                        <span
                            data-seal-l
                            className="block h-16 w-8 rounded-s-full shadow-lg"
                            style={{
                                background:
                                    'radial-gradient(circle at 80% 40%, color-mix(in oklab, var(--inv-primary) 70%, white), var(--inv-primary))',
                            }}
                        />
                        <span
                            data-seal-r
                            className="block h-16 w-8 rounded-e-full shadow-lg"
                            style={{
                                background:
                                    'radial-gradient(circle at 20% 40%, color-mix(in oklab, var(--inv-primary) 70%, white), var(--inv-primary))',
                            }}
                        />
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-lg text-(--inv-gold)">
                            {initials}
                        </span>
                    </div>
                </div>
            </div>
        </OpeningShell>
    );
}
