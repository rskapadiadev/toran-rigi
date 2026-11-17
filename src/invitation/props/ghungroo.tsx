import { type Art, ContactShadow, gilt, Sparkle } from './kit';

// The velvet band droops between its two tied ends.
const band = 'M16 30 C28 86 92 86 104 30';

// A point on the band's curve (same control points as above).
function along(t: number): [number, number] {
    const u = 1 - t;
    const x = u * u * u * 16 + 3 * u * u * t * 28 + 3 * u * t * t * 92 + t * t * t * 104;
    const y = u * u * u * 30 + 3 * u * u * t * 86 + 3 * u * t * t * 86 + t * t * t * 30;
    return [x, y];
}

// Two rows of bells: one sewn on the band, a fuller row hanging just below it.
const upper = Array.from({ length: 9 }, (_, i) => along(0.1 + i * 0.1));
const lower = Array.from({ length: 10 }, (_, i) => along(0.055 + i * 0.1));

interface BellProps {
    id: string;
    x: number;
    y: number;
    r: number;
}

// One ghungroo: a brass sphere with a slit mouth and a ring at the top.
function Bell({ id, x, y, r }: BellProps) {
    return (
        <g transform={`translate(${String(x)} ${String(y)}) scale(${String(r / 6)})`}>
            <ellipse
                cx="0"
                cy="-6"
                rx="2.2"
                ry="1.6"
                fill="none"
                stroke="#7a4f12"
                strokeWidth="1.1"
            />
            <circle cx="0" cy="0" r="6" fill={`url(#${id}-bell)`} />
            <path
                d="M-4.6 1.8 C-2 3.3 2 3.3 4.6 1.8"
                fill="none"
                stroke="#2b1a03"
                strokeWidth="1.3"
                strokeLinecap="round"
            />
            <path
                d="M-4.2 2.9 C-2 4.1 2 4.1 4.2 2.9"
                fill="none"
                stroke="#ffe7a6"
                strokeWidth="0.45"
                opacity="0.7"
            />
            <path d="M0 2.6 V5.8" stroke="#2b1a03" strokeWidth="0.7" />
            <ellipse
                cx="-2.2"
                cy="-2.4"
                rx="1.6"
                ry="1.1"
                fill="#ffffff"
                opacity="0.75"
                transform="rotate(-30 -2.2 -2.4)"
            />
            <path
                d="M3.6 -3.4 A6 6 0 0 1 4.4 3.6"
                fill="none"
                stroke="#ffe7a6"
                strokeWidth="0.6"
                opacity="0.6"
            />
        </g>
    );
}

interface TasselProps {
    id: string;
    x: number;
    flip: boolean;
}

// The tie cord at each end, finished with a gold cap and a red silk tassel.
function Tassel({ id, x, flip }: TasselProps) {
    const s = flip ? -1 : 1;
    return (
        <g transform={`translate(${String(x)} 0) scale(${String(s)} 1)`}>
            <path d="M0 30 C-4 46 4 62 -1 84" fill="none" stroke="#7d0a12" strokeWidth="2.4" />
            <path
                d="M0 30 C-4 46 4 62 -1 84"
                fill="none"
                stroke="#e8505b"
                strokeWidth="0.8"
                strokeDasharray="1.6 1.6"
            />
            <path d="M-5 92 C-6 86 4 86 3 92 Z" fill={`url(#${id}-cap)`} />
            <ellipse cx="-1" cy="85" rx="3" ry="2.2" fill={`url(#${id}-cap)`} />
            <path
                d="M-6 92 C-8 104 -8 114 -9 120 L7 120 C6 114 6 104 4 92 Z"
                fill={`url(#${id}-silk)`}
            />
            <path
                d="M-5 94 L-7 119 M-2.5 94 L-3.4 119.5 M0 94 L0 120 M2.5 94 L3.4 119.5"
                stroke="#5c040a"
                strokeWidth="0.5"
                opacity="0.7"
            />
            <path d="M-3.5 94 L-4.8 118" stroke="#ff8a8a" strokeWidth="0.6" opacity="0.6" />
            <path d="M-6.4 95 C-3 96.4 2 96.4 4.6 95" fill="none" stroke={gilt} strokeWidth="1.4" />
        </g>
    );
}

export function Ghungroo({ id }: Art) {
    return (
        <g>
            <defs>
                <radialGradient id={`${id}-bell`} cx="0.36" cy="0.3" r="0.75">
                    <stop offset="0" stopColor="#fff6d6" />
                    <stop offset="0.25" stopColor="#f0c55c" />
                    <stop offset="0.65" stopColor="#a8741c" />
                    <stop offset="1" stopColor="#4a3108" />
                </radialGradient>
                <radialGradient id={`${id}-cap`} cx="0.35" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#fff1c2" />
                    <stop offset="0.5" stopColor="#d4a24a" />
                    <stop offset="1" stopColor="#6e4510" />
                </radialGradient>
                <linearGradient id={`${id}-silk`} x1="0" x2="1">
                    <stop offset="0" stopColor="#6e0710" />
                    <stop offset="0.35" stopColor="#e0303c" />
                    <stop offset="0.6" stopColor="#b3141b" />
                    <stop offset="1" stopColor="#5c040a" />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={122} rx={50} ry={3.5} />
            <Tassel id={id} x={16} flip={false} />
            <Tassel id={id} x={104} flip />

            {/* Velvet band: dark edges, a soft sheen down the middle, zari borders and stitching */}
            <path d={band} fill="none" stroke={gilt} strokeWidth="15" strokeLinecap="round" />
            <path d={band} fill="none" stroke="#6e4510" strokeWidth="13" strokeLinecap="round" />
            <path d={band} fill="none" stroke="#5c040a" strokeWidth="11.6" strokeLinecap="round" />
            <path d={band} fill="none" stroke="#a3121c" strokeWidth="8.4" strokeLinecap="round" />
            <path
                d={band}
                fill="none"
                stroke="#d42a35"
                strokeWidth="3.6"
                strokeLinecap="round"
                opacity="0.7"
            />
            <path
                d="M16 26.6 C28 82.6 92 82.6 104 26.6"
                fill="none"
                stroke="#ffb3b8"
                strokeWidth="0.8"
                opacity="0.45"
            />
            <path
                d="M16 35 C28 91 92 91 104 35"
                fill="none"
                stroke="#fff1c2"
                strokeWidth="0.5"
                strokeDasharray="1 1.4"
            />

            {upper.map(([x, y]) => (
                <Bell key={x} id={id} x={x} y={y - 1.5} r={4.6} />
            ))}
            {lower.map(([x, y]) => (
                <Bell key={x} id={id} x={x} y={y + 8} r={5.8} />
            ))}
            <Sparkle x={47} y={78} size={3} />
            <Sparkle x={82} y={66} size={2.4} />
        </g>
    );
}
