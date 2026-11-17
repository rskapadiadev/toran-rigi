// A burst of confetti in the invitation's own colours when a guest says yes. Never on remembrance
// days, never on the still tier, and nothing at all for reduced motion.
import { type Easing, m, useReducedMotion } from 'motion/react';
import { useState } from 'react';

import { useInvite } from './context';

const COLORS = ['var(--inv-gold)', 'var(--inv-primary)', 'var(--inv-accent)', 'var(--inv-surface)'];
const PIECES = 44;
// Thrown up fast, then falling under gravity.
const easing: Easing[] = ['easeOut', 'easeIn'];

interface Piece {
    x: number;
    rise: number;
    fall: number;
    spin: number;
    delay: number;
    duration: number;
    width: number;
    height: number;
    round: boolean;
    color: string;
}

// Seeded so the burst is the same shape on every render, and no Math.random in render.
function makePieces(seed: number): Piece[] {
    let s = seed % 2147483647 || 1;
    const rand = () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
    return Array.from({ length: PIECES }, (_, i) => {
        const round = rand() > 0.7;
        const size = 6 + rand() * 6;
        return {
            x: (rand() - 0.5) * 340,
            rise: -(140 + rand() * 220),
            fall: 260 + rand() * 260,
            spin: (rand() - 0.5) * 900,
            delay: rand() * 0.15,
            duration: 1.6 + rand() * 0.9,
            width: round ? size : size * 0.6,
            height: round ? size : size * 1.6,
            round,
            color: COLORS[i % COLORS.length] ?? 'var(--inv-gold)',
        };
    });
}

export function Confetti() {
    const { occasion, tier, data } = useInvite();
    const reduce = useReducedMotion();
    const [pieces] = useState(() => makePieces(data.invitation.seed));
    if (reduce || tier === 'static' || occasion.tone === 'solemn') return null;
    return (
        <div
            className="pointer-events-none fixed inset-x-0 top-[45%] z-50 flex justify-center"
            aria-hidden
        >
            {pieces.map((p, i) => {
                const shape = {
                    width: p.width,
                    height: p.height,
                    background: p.color,
                    borderRadius: p.round ? '50%' : 2,
                };
                const flight = {
                    x: [0, p.x * 0.6, p.x],
                    y: [0, p.rise, p.fall],
                    rotate: [0, p.spin * 0.5, p.spin],
                    opacity: [1, 1, 0],
                };
                const timing = {
                    duration: p.duration,
                    delay: p.delay,
                    times: [0, 0.3, 1],
                    ease: easing,
                };
                return (
                    <m.span
                        key={i}
                        className="absolute shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                        style={shape}
                        initial={{ opacity: 0 }}
                        animate={flight}
                        transition={timing}
                    />
                );
            })}
        </div>
    );
}
