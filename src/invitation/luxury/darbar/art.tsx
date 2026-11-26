// The darbar's painted pieces, shared by the jyot opening and the darbar cover: a marigold toran
// with mango leaves, a brass temple bell on its chain, a row of diyas that catch one after another,
// and the chunri the curtains are cut from. Flat SVG and CSS only, so budget phones stay smooth.
import { type CSSProperties, useId } from 'react';

import { DiyaLamp } from '../typography/DiyaGarland';

const MARIGOLD = ['#f08a1c', '#f6b51e', '#e86a14'];
const LEAF = '#3f7a2c';
const LEAF_LIGHT = '#6aa043';

interface Point {
    x: number;
    y: number;
}

// A point on the quadratic swag from (0, top) through its dip to (100, top).
function swagAt(t: number, top: number, dip: number): Point {
    const u = 1 - t;
    return {
        x: 2 * u * t * 50 + t * t * 100,
        y: u * u * top + 2 * u * t * dip + t * t * top,
    };
}

interface FlowerProps {
    at: Point;
    r: number;
    tone: number;
}

// One marigold: a ruffled ball, darker at its heart.
function Flower({ at, r, tone }: FlowerProps) {
    const colour = MARIGOLD[tone % MARIGOLD.length] ?? '#f08a1c';
    return (
        <g>
            <circle cx={at.x} cy={at.y} r={r} fill={colour} />
            <circle
                cx={at.x - r * 0.25}
                cy={at.y - r * 0.3}
                r={r * 0.45}
                fill="#ffd25c"
                opacity={0.55}
            />
            <circle cx={at.x} cy={at.y} r={r * 0.34} fill="#b8470d" opacity={0.6} />
        </g>
    );
}

interface LeafProps {
    x: number;
    // Seconds into the sway, so neighbouring leaves never move in step.
    phase: number;
    live: boolean;
}

// A mango leaf hanging from the cord, swaying from where it is tied.
function Leaf({ x, phase, live }: LeafProps) {
    const sway: CSSProperties = {
        transformOrigin: `${String(x)}px 4px`,
        transformBox: 'view-box',
        animation: live
            ? `toran-sway ${String(3.4 + (phase % 3) * 0.4)}s ease-in-out ${String(-phase)}s infinite`
            : undefined,
    };
    return (
        <g style={sway}>
            <path
                d={`M${String(x)} 4 C${String(x - 7)} 14 ${String(x - 6)} 30 ${String(x)} 40 C${String(x + 6)} 30 ${String(x + 7)} 14 ${String(x)} 4 Z`}
                fill={LEAF}
            />
            <path d={`M${String(x)} 6 L${String(x)} 37`} stroke={LEAF_LIGHT} strokeWidth={0.9} />
        </g>
    );
}

interface SwagProps {
    live: boolean;
    index: number;
}

// One loop of the toran: a cord with mango leaves, a swag of marigolds and a hanging strand.
function Swag({ live, index }: SwagProps) {
    const flowers = Array.from({ length: 12 }, (_, i) => swagAt((i + 0.5) / 12, 6, 64));
    const strand = [12, 22, 32].map((y) => ({
        x: 0,
        y,
    }));
    const hang: CSSProperties = {
        transformOrigin: '0px 4px',
        transformBox: 'view-box',
        animation: live
            ? `toran-sway ${String(4 + (index % 3) * 0.5)}s ease-in-out ${String(-index * 0.7)}s infinite`
            : undefined,
    };
    return (
        <svg viewBox="0 0 100 64" className="h-full w-auto shrink-0 overflow-visible" aria-hidden>
            <path d="M0 4 H100" stroke="#d9a13a" strokeWidth={1.6} />
            <Leaf x={25} phase={index * 1.3} live={live} />
            <Leaf x={75} phase={index * 1.3 + 0.8} live={live} />
            {flowers.map((at, i) => (
                <Flower key={i} at={at} r={5.4} tone={i + index} />
            ))}
            <g style={hang}>
                <path d="M0 4 V36" stroke="#d9a13a" strokeWidth={1} />
                {strand.map((at, i) => (
                    <Flower key={i} at={at} r={4.6} tone={i + 1} />
                ))}
                <path d="M-3 38 L0 50 L3 38 Z" fill="#d9a13a" />
            </g>
        </svg>
    );
}

interface ToranProps {
    live: boolean;
    className?: string;
}

// The toran across the top of the stage: as many loops as the width holds, never stretched.
export function MarigoldToran({ live, className = '' }: ToranProps) {
    return (
        <div
            aria-hidden
            className={`pointer-events-none flex h-[clamp(56px,17cqw,104px)] justify-center overflow-hidden drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)] ${className}`}
        >
            {Array.from({ length: 14 }, (_, i) => (
                <Swag key={i} live={live} index={i} />
            ))}
        </div>
    );
}

interface BellProps {
    live: boolean;
    // Seconds into the sway, so a pair of bells never swing together.
    phase?: number;
    className?: string;
}

// A brass ghanti hanging on its chain, swaying gently from the hook.
export function TempleBell({ live, phase = 0, className = '' }: BellProps) {
    const brass = useId();
    const sway: CSSProperties = {
        transformOrigin: '20px 0px',
        transformBox: 'view-box',
        animation: live
            ? `toran-sway ${String(3.2 + phase * 0.4)}s ease-in-out ${String(-phase)}s infinite`
            : undefined,
    };
    const links = Array.from({ length: 9 }, (_, i) => i * 8 + 4);
    return (
        <svg viewBox="0 0 40 124" className={`overflow-visible ${className}`} aria-hidden>
            <defs>
                <linearGradient id={brass} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#7a4b12" />
                    <stop offset="0.35" stopColor="#f3cf72" />
                    <stop offset="0.6" stopColor="#c98f2b" />
                    <stop offset="1" stopColor="#6b3f0e" />
                </linearGradient>
            </defs>
            <g style={sway}>
                {links.map((y) => (
                    <ellipse
                        key={y}
                        cx={20}
                        cy={y}
                        rx={2.2}
                        ry={4}
                        fill="none"
                        stroke="#c99a3e"
                        strokeWidth={1.3}
                    />
                ))}
                <circle cx={20} cy={76} r={3.4} fill={`url(#${brass})`} />
                <path
                    d="M20 78 C11 78 9 88 9 98 C9 106 5 110 3 113 H37 C35 110 31 106 31 98 C31 88 29 78 20 78 Z"
                    fill={`url(#${brass})`}
                />
                <path d="M3 113 H37 V116 H3 Z" fill="#8a5716" />
                <circle cx={20} cy={119} r={3.6} fill="#b07a22" />
            </g>
        </svg>
    );
}

interface RowProps {
    count: number;
    lit: boolean;
    // Milliseconds between one lamp catching and the next, outward from the middle.
    stagger?: number;
    className?: string;
}

// A row of clay diyas lit from the middle outwards, like a pujari carrying the flame along.
export function DiyaRow({ count, lit, stagger = 140, className = '' }: RowProps) {
    const middle = (count - 1) / 2;
    return (
        <svg viewBox={`0 0 ${String(count * 40)} 40`} className={className} aria-hidden>
            {Array.from({ length: count }, (_, i) => (
                <DiyaLamp
                    key={i}
                    x={20 + i * 40}
                    y={28}
                    lit={lit}
                    phase={i}
                    delay={Math.abs(i - middle) * stagger}
                />
            ))}
        </svg>
    );
}

// Chunri: red bandhani dots on deep red, folds of shadow, and a gold gota border on one edge.
export function chunri(edge: 'start' | 'end'): CSSProperties {
    // The gradient runs towards the bordered edge, so the gold lands where the curtains meet.
    const side = edge === 'end' ? 'to right' : 'to left';
    return {
        backgroundColor: '#a3122a',
        backgroundImage: [
            `linear-gradient(${side}, transparent calc(100% - 22px), #e9b949 calc(100% - 22px), #f7dc8c calc(100% - 14px), #c9922c calc(100% - 6px), transparent calc(100% - 6px))`,
            'repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0 6%, rgba(255,255,255,0.06) 9%, rgba(0,0,0,0.22) 14%)',
            'radial-gradient(circle, #ffd76a 1.6px, transparent 2.2px)',
            'radial-gradient(circle, #fff3d6 1.2px, transparent 1.8px)',
        ].join(', '),
        backgroundSize: 'auto, auto, 22px 22px, 22px 22px',
        backgroundPosition: '0 0, 0 0, 0 0, 11px 11px',
    };
}

interface RingProps {
    className?: string;
}

// A garland of marigolds laid in a circle, as around a portrait on the stage.
export function MarigoldRing({ className = '' }: RingProps) {
    const count = 28;
    const flowers = Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        return {
            x: 50 + Math.cos(a) * 46,
            y: 50 + Math.sin(a) * 46,
        };
    });
    return (
        <svg viewBox="0 0 100 100" className={`overflow-visible ${className}`} aria-hidden>
            {flowers.map((at, i) => (
                <Flower key={i} at={at} r={4.1} tone={i} />
            ))}
        </svg>
    );
}
