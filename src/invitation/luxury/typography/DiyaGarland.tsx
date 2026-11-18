// A painted divider for night invitations: a lit diya between two butas and marigolds, its vines
// running out into gold. Unlike the engraved dividers it is filled, like a miniature painting, and
// the vines draw in with the same pen while the flame keeps flickering.
import { photoUrl } from '@shared/photos';
import { useId } from 'react';

import { useInvite } from '../../context';
import { Bead, Line } from './ornaments';

const MARIGOLD = '#ef9a2a';
const MARIGOLD_DEEP = '#d9661c';

interface LampProps {
    x: number;
    y: number;
    // Scales the lamp around its own base.
    size?: number;
    lit?: boolean;
    // Desynchronises a row of lamps so the flames don't flicker in step.
    phase?: number;
    // Milliseconds before the flame catches, so a row can be lit one lamp after another.
    delay?: number;
}

// One clay diya with its flame: drawn around (x, y), the centre of the bowl's rim.
export function DiyaLamp({ x, y, size = 1, lit = true, phase = 0, delay = 0 }: LampProps) {
    const id = useId();
    const { tier } = useInvite();
    const flame = {
        transformOrigin: `${String(x)}px ${String(y - 1)}px`,
        transformBox: 'view-box' as const,
        animation:
            tier === 'static' || !lit
                ? undefined
                : `flame-flicker ${String(1.4 + (phase % 3) * 0.23)}s ease-in-out ${String(-phase * 0.37)}s infinite`,
        opacity: lit ? 1 : 0,
        transition: `opacity 0.9s ease ${String(delay)}ms`,
    };
    return (
        <g
            transform={`translate(${String(x)} ${String(y)}) scale(${String(size)}) translate(${String(-x)} ${String(-y)})`}
        >
            <defs>
                <radialGradient id={`${id}-glow`}>
                    <stop offset="0" stopColor="#ffd27a" stopOpacity="0.75" />
                    <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`${id}-flame`} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor="#ff8a1e" />
                    <stop offset="0.55" stopColor="#ffc94a" />
                    <stop offset="1" stopColor="#fff6d6" />
                </linearGradient>
                <linearGradient id={`${id}-clay`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#e0a06a" />
                    <stop offset="1" stopColor="#8a4a26" />
                </linearGradient>
            </defs>
            <g style={flame}>
                <circle cx={x} cy={y - 8} r={13} fill={`url(#${id}-glow)`} />
                <path
                    d={`M${String(x)} ${String(y - 1)} C${String(x - 4)} ${String(y - 6)} ${String(x - 2.4)} ${String(y - 12)} ${String(x)} ${String(y - 18)} C${String(x + 2.4)} ${String(y - 12)} ${String(x + 4)} ${String(y - 6)} ${String(x)} ${String(y - 1)} Z`}
                    fill={`url(#${id}-flame)`}
                />
            </g>
            <path
                d={`M${String(x - 11)} ${String(y)} Q${String(x)} ${String(y + 11)} ${String(x + 11)} ${String(y)} Z`}
                fill={`url(#${id}-clay)`}
            />
            <path
                d={`M${String(x - 11)} ${String(y)} L${String(x + 11)} ${String(y)}`}
                stroke="var(--inv-gold)"
                strokeWidth={1.1}
                strokeLinecap="round"
            />
        </g>
    );
}

// A buta (paisley) leaning in to the lamp: deep red, rimmed in gold, with a gold heart.
function Buta({ mirror }: { mirror: boolean }) {
    return (
        <g transform={mirror ? 'matrix(-1 0 0 1 300 0)' : undefined}>
            <path
                d="M134 39 C134 29 124 22 115 26 C106 30 108 43 119 45 C128 47 134 43 134 39 Z"
                fill="color-mix(in oklab, var(--inv-accent) 85%, black)"
                stroke="var(--inv-gold)"
                strokeWidth={1.3}
            />
            <path
                d="M128.5 38 C128.5 33 123.5 29.5 119 31.5 C114.5 33.5 115.5 40 120.5 41 C125 42 128.5 40.5 128.5 38 Z"
                fill="none"
                stroke="var(--inv-gold)"
                strokeWidth={0.7}
                strokeOpacity={0.8}
            />
            <circle cx={121.5} cy={36.5} r={2} fill="var(--inv-gold)" />
            <path
                d="M115 26 C111 21 113 16 118 15"
                fill="none"
                stroke="var(--inv-gold)"
                strokeWidth={1}
            />
        </g>
    );
}

interface MarigoldProps {
    cx: number;
    cy: number;
    r: number;
}

function Marigold({ cx, cy, r }: MarigoldProps) {
    const petals = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
    return (
        <g>
            {petals.map((a) => (
                <circle
                    key={a}
                    cx={cx + Math.cos(a) * r * 0.62}
                    cy={cy + Math.sin(a) * r * 0.62}
                    r={r * 0.42}
                    fill={MARIGOLD}
                />
            ))}
            <circle cx={cx} cy={cy} r={r * 0.5} fill={MARIGOLD_DEEP} />
            <circle cx={cx} cy={cy} r={r * 0.18} fill="var(--inv-gold)" />
        </g>
    );
}

function Vine({ mirror }: { mirror: boolean }) {
    return (
        <g transform={mirror ? 'matrix(-1 0 0 1 300 0)' : undefined}>
            <Line d="M96 40 C84 46 74 30 62 36 C50 42 40 30 26 34 C18 36 12 34 8 31" width={1} />
            <Line d="M62 36 C60 28 66 24 70 26" delay={0.5} width={0.8} opacity={0.85} />
            <Line d="M40 33 C38 40 44 44 48 42" delay={0.7} width={0.8} opacity={0.85} />
            <ellipse
                cx={72}
                cy={27}
                rx={3.4}
                ry={1.6}
                fill="var(--inv-gold)"
                transform="rotate(-30 72 27)"
            />
            <ellipse
                cx={49}
                cy={42.5}
                rx={3.4}
                ry={1.6}
                fill="var(--inv-gold)"
                transform="rotate(20 49 42.5)"
            />
            <Bead cx={7} cy={30.5} r={1.8} delay={1.8} />
        </g>
    );
}

export function DiyaGarland() {
    const { data } = useInvite();
    const art = data.invitation.design.art?.divider;
    // The studio's painted garland, when the design has one.
    if (art)
        return (
            <img
                src={photoUrl(art)}
                alt=""
                aria-hidden
                className="mx-auto my-6 w-[min(80cqw,320px)]"
            />
        );
    return (
        <svg
            viewBox="0 0 300 56"
            className="mx-auto my-6 w-[min(76cqw,300px)] overflow-visible"
            aria-hidden
        >
            <Vine mirror={false} />
            <Vine mirror />
            <Marigold cx={102} cy={39} r={6.4} />
            <Marigold cx={198} cy={39} r={6.4} />
            <Marigold cx={84} cy={44} r={3.8} />
            <Marigold cx={216} cy={44} r={3.8} />
            <Buta mirror={false} />
            <Buta mirror />
            <DiyaLamp x={150} y={40} />
        </svg>
    );
}
