import { type CSSProperties, type ReactNode, useId } from 'react';

import { cn } from '@/lib/utils';

// One motif per login slide, filling the open space of the dark panel: an emblem for the moment
// (ॐ and swastik, crescent, rings…) or something drifting through the whole panel (balloons,
// rose petals, lights). Sacred marks only glow and settle; nothing breaks, burns or scatters them.

export type SceneId =
    | 'om-swastik'
    | 'crescent'
    | 'balloons'
    | 'rose'
    | 'rings'
    | 'hearts'
    | 'bubbles'
    | 'rangoli'
    | 'diya'
    | 'sun'
    | 'candle'
    | 'handshake'
    | 'motes';

const GOLD = '#e8c477';
const KUMKUM = '#d1352b';

const delay = (s: number): CSSProperties => ({ animationDelay: `${String(s)}s` });
const fillBox: CSSProperties = {
    transformBox: 'fill-box',
    transformOrigin: '50% 50%',
};

// ---- Emblems (centred in the open space) --------------------------------------------------------

function Swastik({ cx, cy, l, at }: { cx: number;
cy: number;
l: number;
at: number }) {
    // Hindu swastik: arms turn clockwise, a dot in each quarter.
    const d = [
        `M${String(cx)} ${String(cy - l)} V${String(cy + l)}`,
        `M${String(cx - l)} ${String(cy)} H${String(cx + l)}`,
        `M${String(cx)} ${String(cy - l)} H${String(cx + l)}`,
        `M${String(cx + l)} ${String(cy)} V${String(cy + l)}`,
        `M${String(cx)} ${String(cy + l)} H${String(cx - l)}`,
        `M${String(cx - l)} ${String(cy)} V${String(cy - l)}`,
    ];
    return (
        <g>
            {d.map((p, k) => (
                <path
                    key={p}
                    d={p}
                    pathLength={1}
                    stroke={KUMKUM}
                    strokeWidth="5"
                    strokeLinecap="square"
                    fill="none"
                    strokeDasharray="1"
                    className="motion-safe:animate-[cord-draw_600ms_ease-out_both]"
                    style={delay(at + (k < 2 ? 0 : 0.5))}
                />
            ))}
            {[
                [-1, -1],
                [1, -1],
                [1, 1],
                [-1, 1],
            ].map(([sx = 0, sy = 0], k) => (
                <circle
                    key={k}
                    cx={cx + (sx * l) / 2}
                    cy={cy + (sy * l) / 2}
                    r="3.4"
                    fill={KUMKUM}
                    className="motion-safe:animate-[bead-pop_400ms_ease-out_both]"
                    style={{
                        ...fillBox,
                        ...delay(at + 1.1 + k * 0.08),
                    }}
                />
            ))}
        </g>
    );
}

function OmSwastik() {
    return (
        <svg viewBox="0 0 300 200" className="size-full overflow-visible">
            <circle
                cx="150"
                cy="100"
                r="78"
                fill="none"
                stroke={GOLD}
                strokeOpacity="0.25"
                strokeDasharray="2 7"
                className="motion-safe:animate-[spin-slow_90s_linear_infinite]"
                style={fillBox}
            />
            <text
                x="150"
                y="138"
                textAnchor="middle"
                fontSize="112"
                lang="hi"
                fill={GOLD}
                className="font-display motion-safe:animate-[scene-in_1.2s_ease-out_both,glow-pulse_4s_ease-in-out_1.2s_infinite]"
                style={fillBox}
            >
                ॐ
            </text>
            <Swastik cx={38} cy={100} l={20} at={0.6} />
            <Swastik cx={262} cy={100} l={20} at={0.8} />
        </svg>
    );
}

function Star({ x, y, r, at }: { x: number;
y: number;
r: number;
at: number }) {
    const pts = Array.from({ length: 10 }, (_, k) => {
        const a = (Math.PI / 5) * k - Math.PI / 2;
        const rr = k % 2 ? r * 0.42 : r;
        return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return (
        <polygon
            points={pts}
            fill="#f6e3ad"
            className="motion-safe:animate-[twinkle_3.2s_ease-in-out_infinite]"
            style={{
                ...fillBox,
                ...delay(at),
            }}
        />
    );
}

function Crescent() {
    const id = useId().replace(/:/g, '');
    return (
        <svg
            viewBox="0 0 300 200"
            className="size-full overflow-visible motion-safe:animate-[glow-pulse_5s_ease-in-out_1.4s_infinite]"
        >
            <defs>
                <mask id={`moon-${id}`}>
                    <rect width="300" height="200" fill="white" />
                    <circle cx="196" cy="84" r="50" fill="black" />
                </mask>
                <linearGradient id={`gold-${id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fff1c9" />
                    <stop offset="1" stopColor="#d9a94a" />
                </linearGradient>
            </defs>
            <g className="motion-safe:animate-[sun-rise_1.4s_ease-out_both]">
                <circle
                    cx="170"
                    cy="100"
                    r="58"
                    fill={`url(#gold-${id})`}
                    mask={`url(#moon-${id})`}
                />
            </g>
            <Star x={222} y={104} r={12} at={0.9} />
            <Star x={70} y={46} r={5} at={0.2} />
            <Star x={100} y={150} r={4} at={1.4} />
            <Star x={262} y={42} r={6} at={0.6} />
            <Star x={40} y={120} r={3.5} at={2} />
            <Star x={280} y={160} r={4.5} at={1.1} />
        </svg>
    );
}

function Rings() {
    return (
        <svg viewBox="0 0 300 200" className="size-full overflow-visible">
            <g fill="none" strokeWidth="7" strokeLinecap="round">
                <circle
                    cx="130"
                    cy="110"
                    r="42"
                    stroke={GOLD}
                    pathLength={1}
                    strokeDasharray="1"
                    className="motion-safe:animate-[cord-draw_1.1s_ease-out_both]"
                    style={delay(0.2)}
                />
                <circle
                    cx="175"
                    cy="110"
                    r="42"
                    stroke="#f1e4c0"
                    pathLength={1}
                    strokeDasharray="1"
                    className="motion-safe:animate-[cord-draw_1.1s_ease-out_both]"
                    style={delay(0.6)}
                />
                {/* The first ring passes back over the second: they interlock. */}
                <path
                    d="M140.9 69.4 A42 42 0 0 1 162.2 83"
                    stroke={GOLD}
                    className="motion-safe:animate-[bead-fade_300ms_ease-out_both]"
                    style={delay(1.6)}
                />
            </g>
            <g
                className="motion-safe:animate-[bead-pop_500ms_ease-out_both]"
                style={{
                    ...fillBox,
                    ...delay(1.5),
                }}
            >
                <path d="M109 60 l9 9 -9 12 -9 -12 Z" fill="#eaf4ff" stroke="#b9cbe0" />
                <path d="M100 69 h18" stroke="#b9cbe0" strokeWidth="0.8" />
            </g>
            <Star x={96} y={52} r={6} at={2} />
            <Star x={214} y={70} r={4} at={2.6} />
        </svg>
    );
}

function Rangoli() {
    const ring = (n: number, r: number, k0: number, el: (k: number) => ReactNode) =>
        Array.from({ length: n }, (_, k) => (
            <g key={k} transform={`rotate(${String((360 / n) * k)}) translate(0 ${String(-r)})`}>
                <g
                    className="motion-safe:animate-[bead-pop_450ms_ease-out_both]"
                    style={{
                        ...fillBox,
                        ...delay(k0 + k * 0.05),
                    }}
                >
                    {el(k)}
                </g>
            </g>
        ));
    return (
        <svg viewBox="-100 -100 200 200" className="size-full overflow-visible">
            <g className="motion-safe:animate-[spin-slow_80s_linear_infinite]" style={fillBox}>
                {ring(16, 86, 1.4, () => (
                    <circle r="2.6" fill="#fbf3e4" />
                ))}
                {ring(12, 60, 0.8, (k) => (
                    <ellipse rx="10" ry="24" fill={k % 2 ? '#e8780c' : '#f6a10a'} />
                ))}
                {ring(8, 34, 0.4, () => (
                    <ellipse rx="8" ry="15" fill="#c8324f" />
                ))}
                <circle
                    r="17"
                    fill="#f6c445"
                    className="motion-safe:animate-[bead-pop_500ms_ease-out_both]"
                    style={fillBox}
                />
                <circle r="6" fill="#2f7d6b" />
            </g>
        </svg>
    );
}

function Flame({ x, y, h, calm }: { x: number;
y: number;
h: number;
calm?: boolean }) {
    return (
        <g
            className={
                calm
                    ? 'motion-safe:animate-[flame-flicker_2.6s_ease-in-out_infinite]'
                    : 'motion-safe:animate-[flame-flicker_1.4s_ease-in-out_infinite]'
            }
            style={{
                transformBox: 'fill-box',
                transformOrigin: '50% 100%',
            }}
        >
            <path
                d={`M${String(x)} ${String(y)} q-${String(h * 0.38)} -${String(h * 0.34)} 0 -${String(h)} q${String(h * 0.38)} ${String(h * 0.66)} 0 ${String(h)} Z`}
                fill="#ffb53d"
            />
            <path
                d={`M${String(x)} ${String(y)} q-${String(h * 0.18)} -${String(h * 0.2)} 0 -${String(h * 0.55)} q${String(h * 0.18)} ${String(h * 0.35)} 0 ${String(h * 0.55)} Z`}
                fill="#fff2c2"
            />
        </g>
    );
}

function Glow({ id, x, y, r }: { id: string;
x: number;
y: number;
r: number }) {
    return (
        <>
            <defs>
                <radialGradient id={id}>
                    <stop offset="0" stopColor="#ffcf6b" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#ffcf6b" stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
        </>
    );
}

function Diya() {
    const id = useId().replace(/:/g, '');
    return (
        <svg
            viewBox="0 0 200 200"
            className="size-full overflow-visible motion-safe:animate-[scene-in_1.2s_ease-out_both]"
        >
            <Glow id={`g-${id}`} x={100} y={110} r={70} />
            {[0, 1, 2].map((k) => (
                <path
                    key={k}
                    d={`M${String(96 + k * 4)} 80 q-8 -10 0 -20 q8 -10 0 -20`}
                    fill="none"
                    stroke="#f1e4c0"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    className="motion-safe:animate-[smoke-rise_3.6s_ease-out_infinite]"
                    style={{
                        ...fillBox,
                        ...delay(k * 1.2),
                        opacity: 0,
                    }}
                />
            ))}
            <Flame x={100} y={130} h={40} />
            <path d="M58 130 Q100 178 142 130 Z" fill="#b5652b" stroke="#7a3f16" />
            <path d="M58 130 H142" stroke="#d9b25f" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M74 146 q26 14 52 0" fill="none" stroke="#d9b25f" strokeOpacity="0.6" />
        </svg>
    );
}

function Candle() {
    const id = useId().replace(/:/g, '');
    return (
        <svg
            viewBox="0 0 200 200"
            className="size-full overflow-visible motion-safe:animate-[scene-in_2s_ease-out_both]"
        >
            <Glow id={`g-${id}`} x={100} y={104} r={60} />
            <rect
                x="78"
                y="92"
                width="44"
                height="76"
                rx="5"
                fill="#ffffff"
                fillOpacity="0.08"
                stroke="#f4efe4"
                strokeOpacity="0.5"
            />
            <rect x="83" y="112" width="34" height="52" rx="2" fill="#f4efe4" />
            <path d="M100 112 V105" stroke="#3b302a" strokeWidth="1.4" />
            <Flame x={100} y={106} h={24} calm />
        </svg>
    );
}

function Rose() {
    return (
        <svg
            viewBox="0 0 200 200"
            className="size-full overflow-visible motion-safe:animate-[scene-in_2s_ease-out_both]"
        >
            <path
                d="M52 178 Q92 136 118 96"
                fill="none"
                stroke="#3d6331"
                strokeWidth="3.2"
                strokeLinecap="round"
            />
            <path d="M84 146 q-26 -6 -34 -24 q24 -2 34 24 Z" fill="#4f7d3f" />
            <path d="M98 128 q22 -2 34 12 q-22 8 -34 -12 Z" fill="#5f8f4e" />
            <g transform="translate(124 84)">
                {[0, 72, 144, 216, 288].map((a) => (
                    <ellipse
                        key={a}
                        rx="17"
                        ry="12"
                        fill="#7d1022"
                        transform={`rotate(${String(a)}) translate(10 0)`}
                    />
                ))}
                {[36, 126, 216, 306].map((a) => (
                    <ellipse
                        key={a}
                        rx="12"
                        ry="9"
                        fill="#a51c33"
                        transform={`rotate(${String(a)}) translate(6 0)`}
                    />
                ))}
                <circle r="8.5" fill="#c22a42" />
                <path
                    d="M-4 0 a4 4 0 1 1 4 4 a2.2 2.2 0 1 1 -1.5 -2.5"
                    fill="none"
                    stroke="#6e0f20"
                    strokeWidth="1.3"
                />
            </g>
        </svg>
    );
}

function Sun() {
    const id = useId().replace(/:/g, '');
    return (
        <svg viewBox="0 0 300 200" className="size-full overflow-visible">
            <defs>
                <clipPath id={`sky-${id}`}>
                    <rect x="0" y="-60" width="300" height="210" />
                </clipPath>
                <linearGradient id={`sun-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffd98a" />
                    <stop offset="1" stopColor="#e8780c" />
                </linearGradient>
            </defs>
            <g clipPath={`url(#sky-${id})`}>
                <g className="motion-safe:animate-[sun-rise_1.8s_ease-out_both]">
                    <g
                        className="motion-safe:animate-[spin-slow_70s_linear_infinite]"
                        style={{
                            transformBox: 'view-box',
                            transformOrigin: '150px 150px',
                        }}
                    >
                        {Array.from({ length: 16 }, (_, k) => (
                            <path
                                key={k}
                                d="M150 84 V58"
                                stroke={GOLD}
                                strokeOpacity="0.55"
                                strokeWidth="2"
                                strokeLinecap="round"
                                transform={`rotate(${String(k * 22.5)} 150 150)`}
                            />
                        ))}
                    </g>
                    <circle cx="150" cy="150" r="52" fill={`url(#sun-${id})`} />
                </g>
            </g>
            <path d="M40 150 H260" stroke={GOLD} strokeOpacity="0.6" />
            <path d="M80 162 H220 M110 172 H190" stroke={GOLD} strokeOpacity="0.3" />
        </svg>
    );
}

// Corporate: gold line-art hands meet from either side, clasp, then shake now and then.
function Handshake() {
    const line = {
        fill: '#1d1416',
        stroke: GOLD,
        strokeWidth: 2.2,
        strokeLinejoin: 'round' as const,
    };
    return (
        <svg viewBox="0 0 300 200" className="size-full overflow-visible">
            <circle
                cx="150"
                cy="108"
                r="70"
                fill="none"
                stroke={GOLD}
                strokeOpacity="0.3"
                pathLength={1}
                strokeDasharray="1"
                className="motion-safe:animate-[cord-draw_1.6s_ease-out_0.9s_both]"
            />
            <g
                className="motion-safe:animate-[shake_4s_ease-in-out_1.1s_infinite]"
                style={{
                    transformBox: 'view-box',
                    transformOrigin: '150px 108px',
                }}
            >
                {/* Left: sleeve rising from below, cuff, and the lower hand (palm in). */}
                <g className="motion-safe:animate-[hand-left_900ms_cubic-bezier(0.2,0.9,0.3,1)_both]">
                    <path d="M8 168 L34 196 L100 134 L78 108 Z" {...line} fill="#5b1424" />
                    <path d="M78 108 L100 134 L109 126 L87 100 Z" {...line} fill="#f4efe4" />
                    <path
                        d="M87 100 Q104 92 126 92 L160 94 Q172 96 174 106 Q172 116 160 119 L128 124 Q116 126 109 126 Z"
                        {...line}
                    />
                </g>
                {/* Right: sleeve, cuff, and the upper hand wrapping over with its fingers. */}
                <g className="motion-safe:animate-[hand-right_900ms_cubic-bezier(0.2,0.9,0.3,1)_both]">
                    <path d="M292 168 L266 196 L200 134 L222 108 Z" {...line} fill="#2b2a3a" />
                    <path d="M222 108 L200 134 L191 126 L213 100 Z" {...line} fill="#f4efe4" />
                    <path
                        d="M213 100 Q196 92 176 92 L150 93 Q134 95 128 104 Q124 114 132 121 Q140 127 152 126 L176 125 Q186 126 191 126 Z"
                        {...line}
                    />
                    {/* Finger creases wrapping round the other hand. */}
                    {[
                        'M140 96 Q133 108 138 124',
                        'M150 94 Q143 108 148 125',
                        'M160 93 Q153 108 158 125',
                    ].map((d) => (
                        <path
                            key={d}
                            d={d}
                            fill="none"
                            stroke={GOLD}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.85"
                        />
                    ))}
                    <path
                        d="M176 92 Q182 100 178 110"
                        fill="none"
                        stroke={GOLD}
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        opacity="0.6"
                    />
                </g>
                {/* The left thumb closes over the clasp last. */}
                <path
                    d="M118 93 Q136 78 160 82 Q172 84 170 91 Q166 96 150 95 L130 96 Z"
                    {...line}
                    className="motion-safe:animate-[bead-fade_450ms_ease-out_0.8s_both]"
                />
            </g>
            <Star x={150} y={60} r={7} at={1.2} />
            <Star x={112} y={70} r={4} at={1.8} />
            <Star x={190} y={68} r={4.5} at={2.3} />
        </svg>
    );
}

// ---- Drifters (through the whole panel) ---------------------------------------------------------

interface Drifter {
    left: number;
    size: number;
    dur: number;
    at: number;
    color: string;
}

const spread = (colors: string[], n: number, sizes: [number, number], durs: [number, number]) =>
    Array.from({ length: n }, (_, k): Drifter => {
        const r = (k * 0.618) % 1;
        return {
            left: 4 + ((k * 37) % 92),
            size: sizes[0] + r * (sizes[1] - sizes[0]),
            dur: durs[0] + ((k * 0.37) % 1) * (durs[1] - durs[0]),
            // Negative delays: some are already mid-flight when the slide arrives.
            at: -((k * 1.7) % durs[0]),
            color: colors[k % colors.length] ?? GOLD,
        };
    });

function Rising({ items, shape }: { items: Drifter[];
shape: (d: Drifter) => ReactNode }) {
    return (
        <>
            {items.map((d, k) => (
                <div
                    key={k}
                    className="absolute -bottom-24 opacity-0 motion-safe:animate-[float-up_12s_linear_infinite] motion-reduce:top-1/2 motion-reduce:bottom-auto motion-reduce:opacity-60"
                    style={{
                        left: `${String(d.left)}%`,
                        width: d.size,
                        animationDuration: `${String(d.dur)}s`,
                        animationDelay: `${String(d.at)}s`,
                    }}
                >
                    {shape(d)}
                </div>
            ))}
        </>
    );
}

const Balloon = ({ color }: { color: string }) => (
    <svg viewBox="0 0 40 92" className="w-full overflow-visible">
        <path d="M20 42 q-5 11 0 22 q5 11 0 24" fill="none" stroke="#f4efe4" strokeOpacity="0.5" />
        <ellipse cx="20" cy="20" rx="16" ry="19.5" fill={color} />
        <ellipse cx="14" cy="12" rx="4" ry="6.5" fill="#fff" opacity="0.35" />
        <path d="M17.5 39 l2.5 3.5 2.5 -3.5 Z" fill={color} />
    </svg>
);

const Heart = ({ color }: { color: string }) => (
    <svg viewBox="0 0 40 36" className="w-full overflow-visible">
        <path d="M20 34 C-6 16 6 -2 20 10 C34 -2 46 16 20 34 Z" fill={color} opacity="0.85" />
    </svg>
);

const Bubble = ({ color }: { color: string }) => (
    <svg viewBox="0 0 40 40" className="w-full overflow-visible">
        <circle cx="20" cy="20" r="18" fill={color} fillOpacity="0.35" stroke={color} />
        <circle cx="13" cy="13" r="4" fill="#fff" opacity="0.5" />
    </svg>
);

const Mote = ({ color }: { color: string }) => (
    <div className="aspect-square w-full rounded-full blur-[1px]" style={{ background: color }} />
);

function Petals() {
    return (
        <>
            {Array.from({ length: 10 }, (_, k) => (
                <svg
                    key={k}
                    viewBox="0 0 20 14"
                    className="absolute -top-6 w-4 opacity-0 motion-safe:animate-[petal-fall_14s_linear_infinite] motion-reduce:hidden"
                    style={{
                        left: `${String(8 + ((k * 41) % 86))}%`,
                        animationDuration: `${String(12 + ((k * 0.53) % 1) * 7)}s`,
                        animationDelay: `${String(-((k * 2.3) % 12))}s`,
                    }}
                >
                    <path d="M1 7 Q8 -2 19 6 Q9 15 1 7 Z" fill={k % 3 ? '#9b1b30' : '#c22a42'} />
                </svg>
            ))}
        </>
    );
}

const BALLOONS = spread(
    ['#a3d14b', '#f28ab2', GOLD, '#c8324f', '#7cc4e8', '#f39a3b'],
    10,
    [30, 52],
    [11, 16],
);
const HEARTS = spread(['#e7a1a8', GOLD, '#f3c4c9'], 9, [14, 28], [12, 18]);
const BUBBLES = spread(['#f6d7de', '#d6e6f3', '#fbf3e4'], 10, [16, 34], [13, 19]);
const MOTES = spread(['#f1e4c0', GOLD, '#fbf3e4'], 14, [3, 6], [16, 24]);

// ---- Scene ---------------------------------------------------------------------------------------

const EMBLEMS: Partial<Record<SceneId, () => ReactNode>> = {
    'om-swastik': OmSwastik,
    crescent: Crescent,
    rings: Rings,
    rangoli: Rangoli,
    diya: Diya,
    candle: Candle,
    rose: Rose,
    sun: Sun,
    handshake: Handshake,
};

export function LoginScene({ id, compact = false }: { id: SceneId;
compact?: boolean }) {
    const Emblem = EMBLEMS[id];
    return (
        <div
            className="pointer-events-none absolute inset-0 overflow-hidden motion-safe:animate-[fade-in_900ms_ease-out_both]"
            aria-hidden
        >
            {id === 'balloons' && (
                <Rising items={BALLOONS} shape={(d) => <Balloon color={d.color} />} />
            )}
            {id === 'hearts' && <Rising items={HEARTS} shape={(d) => <Heart color={d.color} />} />}
            {id === 'bubbles' && (
                <Rising items={BUBBLES} shape={(d) => <Bubble color={d.color} />} />
            )}
            {id === 'motes' && <Rising items={MOTES} shape={(d) => <Mote color={d.color} />} />}
            {id === 'rose' && <Petals />}
            {Emblem && (
                <div
                    className={cn(
                        'absolute',
                        compact
                            ? 'end-3 top-[38%] w-32 opacity-45'
                            : 'end-[5%] top-[36%] w-[42%] max-w-[440px] opacity-90',
                        id === 'rangoli' || id === 'diya' || id === 'candle' || id === 'rose'
                            ? 'aspect-square max-w-[320px]'
                            : 'aspect-[3/2]',
                    )}
                >
                    <Emblem />
                </div>
            )}
        </div>
    );
}
