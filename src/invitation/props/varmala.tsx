import type { ReactNode } from 'react';

import { type Art, ContactShadow, gilt, GoldStops } from './kit';

type Pt = [number, number];
type Curve = [Pt, Pt, Pt, Pt];
type Kind = 'rose' | 'jasmine' | 'marigold';

interface At {
    id: string;
    x: number;
    y: number;
    r: number;
    turn?: number;
}

function bez([a, b, c, d]: Curve, t: number): Pt {
    const u = 1 - t;
    const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t] as const;
    return [
        w[0] * a[0] + w[1] * b[0] + w[2] * c[0] + w[3] * d[0],
        w[0] * a[1] + w[1] * b[1] + w[2] * c[1] + w[3] * d[1],
    ];
}

// Evenly spaced points along a chain of curves, so the blooms pack like a real strung garland.
function along(curves: Curve[], gap: number): Pt[] {
    const fine = curves.flatMap((c) => Array.from({ length: 120 }, (_, i) => bez(c, i / 119)));
    const out: Pt[] = [];
    let run = gap;
    fine.forEach((p, i) => {
        const prev = fine[i - 1];
        if (prev) run += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
        if (run >= gap) {
            out.push(p);
            run = 0;
        }
    });
    return out;
}

// A rose from above: five cupped outer petals, a tight dark heart and a spiral of inner petals.
function Rose({ id, x, y, r, turn = 0 }: At) {
    return (
        <g>
            {[0, 1, 2, 3, 4].map((i) => {
                const a = (i * 72 + turn) * (Math.PI / 180);
                return (
                    <circle
                        key={i}
                        cx={x + Math.cos(a) * r * 0.42}
                        cy={y + Math.sin(a) * r * 0.42}
                        r={r * 0.6}
                        fill={`url(#${id}-rose)`}
                    />
                );
            })}
            <circle cx={x} cy={y} r={r * 0.55} fill={`url(#${id}-heart)`} />
            {[0.2, 0.32, 0.44].map((k, j) => (
                <circle
                    key={k}
                    cx={x}
                    cy={y}
                    r={r * k}
                    fill="none"
                    stroke={'#ff8a9b'}
                    strokeWidth={r * 0.07}
                    strokeLinecap="round"
                    strokeDasharray={`${String(r * k * 3.4)} ${String(r * k * 6.3)}`}
                    transform={`rotate(${String(turn + j * 130)} ${String(x)} ${String(y)})`}
                />
            ))}
            <circle cx={x} cy={y} r={r * 1.02} fill={`url(#${id}-ball)`} />
        </g>
    );
}

// A collar of jasmine buds radiating from the thread, the white band between the roses.
function Jasmine({ id, x, y, r, turn = 0 }: At) {
    return (
        <g>
            {Array.from({ length: 9 }, (_, i) => {
                const a = i * 40 + turn;
                return (
                    <ellipse
                        key={i}
                        cx={r * 0.5}
                        cy={0}
                        rx={r * 0.52}
                        ry={r * 0.24}
                        fill={`url(#${id}-bud)`}
                        stroke="#b9b39a"
                        strokeWidth={r * 0.04}
                        transform={`translate(${String(x)} ${String(y)}) rotate(${String(a)})`}
                    />
                );
            })}
            <circle cx={x} cy={y} r={r * 0.3} fill="#fffef6" />
            <circle cx={x} cy={y} r={r * 1.02} fill={`url(#${id}-ball)`} />
        </g>
    );
}

const rings: [number, number, number, string][] = [
    [0.68, 0.36, 12, '#e8590c'],
    [0.42, 0.32, 9, '#fb8c00'],
    [0.15, 0.28, 5, '#ffb31a'],
];

function Marigold({ id, x, y, r }: At) {
    return (
        <g>
            {rings.map(([dist, size, count, colour], k) =>
                Array.from({ length: count }, (_, i) => {
                    const a = ((i + k * 0.5) / count) * Math.PI * 2;
                    return (
                        <circle
                            key={`${String(k)}-${String(i)}`}
                            cx={x + Math.cos(a) * dist * r}
                            cy={y + Math.sin(a) * dist * r}
                            r={size * r}
                            fill={colour}
                            stroke="#8f2d00"
                            strokeOpacity="0.4"
                            strokeWidth={r * 0.03}
                        />
                    );
                }),
            )}
            <circle cx={x} cy={y} r={r * 1.02} fill={`url(#${id}-ball)`} />
        </g>
    );
}

const draw: Record<Kind, (p: At) => ReactNode> = {
    rose: Rose,
    jasmine: Jasmine,
    marigold: Marigold,
};

interface Strand {
    id: string;
    curves: Curve[];
    pattern: Kind[];
}

function Garland({ id, curves, pattern }: Strand) {
    const pts = along(curves, 5.2);
    return (
        <g>
            {pts.map(([x, y], i) =>
                i % 3 === 1 ? (
                    <path
                        key={`l${String(i)}`}
                        d="M0 0 C3 -3 9 -3 12 0 C9 2.5 3 2.5 0 0 Z"
                        fill={`url(#${id}-leaf)`}
                        transform={`translate(${String(x)} ${String(y)}) rotate(${String(i % 2 ? 20 : 160)})`}
                    />
                ) : null,
            )}
            {pts.map(([x, y], i) => {
                const Flower = draw[pattern[i % pattern.length] ?? 'rose'];
                return <Flower key={i} id={id} x={x} y={y} r={i % 2 ? 6.4 : 7} turn={i * 37} />;
            })}
        </g>
    );
}

interface Hang {
    id: string;
    x: number;
    y: number;
}

// The pendant: a large rose on leaves with three strings of jasmine buds ending in gold beads.
function Pendant({ id, x, y }: Hang) {
    return (
        <g>
            {[-9, 0, 9].map((dx, s) => {
                const n = s === 1 ? 6 : 4;
                return (
                    <g key={dx}>
                        {Array.from({ length: n }, (_, i) => (
                            <ellipse
                                key={i}
                                cx={x + dx * (0.6 + i * 0.1)}
                                cy={y + 9 + i * 3.4}
                                rx="1.3"
                                ry="1.9"
                                fill={`url(#${id}-bud)`}
                                stroke="#b9b39a"
                                strokeWidth="0.25"
                            />
                        ))}
                        <circle
                            cx={x + dx * (0.6 + n * 0.1)}
                            cy={y + 9 + n * 3.4}
                            r="1.6"
                            fill={`url(#${id}-gold)`}
                        />
                    </g>
                );
            })}
            <path
                d="M0 0 C4 -4 12 -4 16 0 C12 3 4 3 0 0 Z"
                fill={`url(#${id}-leaf)`}
                transform={`translate(${String(x)} ${String(y)}) rotate(25)`}
            />
            <path
                d="M0 0 C4 -4 12 -4 16 0 C12 3 4 3 0 0 Z"
                fill={`url(#${id}-leaf)`}
                transform={`translate(${String(x)} ${String(y)}) rotate(155)`}
            />
            <Rose id={id} x={x} y={y} r={8} turn={12} />
            <circle cx={x} cy={y - 7.5} r="1.4" fill={gilt} />
        </g>
    );
}

const left: Curve[] = [
    [
        [14, 8],
        [8, 52],
        [20, 90],
        [38, 94],
    ],
    [
        [38, 94],
        [58, 90],
        [68, 50],
        [64, 8],
    ],
];
const right: Curve[] = [
    [
        [56, 10],
        [52, 54],
        [62, 94],
        [82, 98],
    ],
    [
        [82, 98],
        [100, 94],
        [112, 54],
        [106, 10],
    ],
];

export function Varmala({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-gold`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <radialGradient id={`${id}-rose`} cx="0.45" cy="0.4" r="0.65">
                    <stop offset="0" stopColor="#ff6b80" />
                    <stop offset="0.55" stopColor="#c8102e" />
                    <stop offset="1" stopColor="#5e0315" />
                </radialGradient>
                <radialGradient id={`${id}-heart`} cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#4a0210" />
                    <stop offset="1" stopColor="#d81b3c" />
                </radialGradient>
                <radialGradient id={`${id}-ball`} cx="0.35" cy="0.3" r="0.7">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
                    <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#2a0505" stopOpacity="0.5" />
                </radialGradient>
                <linearGradient id={`${id}-bud`} x1="0" x2="1">
                    <stop offset="0" stopColor="#d9e4b8" />
                    <stop offset="0.45" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#efe8d2" />
                </linearGradient>
                <linearGradient id={`${id}-leaf`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#5fae45" />
                    <stop offset="1" stopColor="#1d4d1a" />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={124} rx={44} ry={4} />
            <Garland
                id={id}
                curves={right}
                pattern={['marigold', 'marigold', 'jasmine', 'rose', 'jasmine']}
            />
            <Pendant id={id} x={82} y={101} />
            <Garland
                id={id}
                curves={left}
                pattern={['rose', 'rose', 'jasmine', 'rose', 'marigold', 'jasmine']}
            />
            <Pendant id={id} x={38} y={97} />
        </g>
    );
}
