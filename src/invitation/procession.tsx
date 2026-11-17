// Animated edges: a little procession travels along the line where one section meets the next —
// the bride's doli on its bearers' shoulders, the groom's baraat ghodi, the garlanded vidaai car, a
// palace elephant, a bagghi, the dhol, a just-married auto, and fliers (doves, a stork, lanterns,
// balloons, kites) that drift above the line instead of walking on it.
// Pure SVG + CSS keyframes (app.css), so it costs no JS per frame. Reduced motion or the 'static'
// tier parks the figure, still, part-way across.
import type { EdgeKind } from '@shared/types';
import type { CSSProperties, ReactNode } from 'react';

export const processionKinds = [
    'doli',
    'ghodi',
    'car',
    'elephant',
    'bagghi',
    'dhol',
    'rickshaw',
    'doves',
    'stork',
    'lanterns',
    'balloons',
    'kites',
] as const;
export type ProcessionKind = (typeof processionKinds)[number];

export const isProcession = (kind: EdgeKind): kind is ProcessionKind =>
    (processionKinds as readonly string[]).includes(kind);

interface Rig {
    width: number;
    height: number;
    // Seconds to cross the invitation: bearers walk, the mare trots, the car drives.
    crossing: number;
    // One step (or wheel turn).
    stride: number;
    art: ReactNode;
    // Fliers float above the line, so they skip the path of petals.
    flies?: boolean;
}

const ink = 'var(--inv-ink)';
const gold = 'var(--inv-gold)';
const primary = 'var(--inv-primary)';
const accent = 'var(--inv-accent)';
const surface = 'var(--inv-surface)';

// A leg that swings from the hip; `phase` 0/1 puts the pair out of step.
function Leg({
    x,
    y,
    length,
    phase,
    width = 3.4,
}: {
    x: number;
    y: number;
    length: number;
    phase: 0 | 1;
    width?: number;
}) {
    return (
        <line
            className={phase ? 'proc-leg proc-leg-b' : 'proc-leg'}
            x1={x}
            y1={y}
            x2={x}
            y2={y + length}
            stroke={ink}
            strokeWidth={width}
            strokeLinecap="round"
        />
    );
}

function Bearer({ x }: { x: number }) {
    return (
        <g>
            <Leg x={x} y={50} length={21} phase={0} />
            <Leg x={x} y={50} length={21} phase={1} />
            <path d={`M${x - 5} 32 Q${x} 28 ${x + 5} 32 L${x + 4} 51 L${x - 4} 51 Z`} fill={ink} />
            {/* Turban (pagdi) and head */}
            <circle cx={x} cy={22} r={4.6} fill={ink} />
            <path d={`M${x - 5.5} 20 Q${x} 13 ${x + 5.5} 20 Z`} fill={accent} />
            {/* Hand steadying the pole */}
            <path
                d={`M${x + 3} 33 L${x + 6} 27`}
                stroke={ink}
                strokeWidth={2.4}
                strokeLinecap="round"
            />
        </g>
    );
}

const doli: Rig = {
    width: 172,
    height: 74,
    crossing: 26,
    stride: 0.62,
    art: (
        <>
            <Bearer x={20} />
            <Bearer x={150} />
            <g className="proc-sway">
                {/* Pole on the bearers' shoulders */}
                <line
                    x1={6}
                    y1={29}
                    x2={166}
                    y2={29}
                    stroke={gold}
                    strokeWidth={3.4}
                    strokeLinecap="round"
                />
                {/* Domed canopy with kalash finial */}
                <path
                    d="M58 33 C58 20 70 12 86 12 C102 12 114 20 114 33 Z"
                    fill={primary}
                    stroke={gold}
                    strokeWidth={1.4}
                />
                <path d="M86 12 V6" stroke={gold} strokeWidth={1.6} />
                <circle cx={86} cy={5} r={2.6} fill={gold} />
                {/* Body with curtains and a gold border */}
                <rect
                    x={62}
                    y={33}
                    width={48}
                    height={24}
                    rx={2}
                    fill={primary}
                    stroke={gold}
                    strokeWidth={1.4}
                />
                <path d="M76 36 Q86 33 96 36 V53 H76 Z" fill={surface} opacity={0.85} />
                <path
                    d="M76 36 Q81 44 76 53 M96 36 Q91 44 96 53"
                    stroke={gold}
                    strokeWidth={1}
                    fill="none"
                />
                {/* Scalloped hem and tassels */}
                <path
                    d="M62 57 q4 5 8 0 q4 5 8 0 q4 5 8 0 q4 5 8 0 q4 5 8 0 q4 5 8 0"
                    fill="none"
                    stroke={gold}
                    strokeWidth={1.4}
                />
                {[66, 78, 90, 102].map((x) => (
                    <circle key={x} cx={x} cy={62} r={1.5} fill={gold} />
                ))}
                {/* Garlands looping from the canopy */}
                <path
                    d="M60 33 Q72 40 86 33 Q100 40 112 33"
                    fill="none"
                    stroke={accent}
                    strokeWidth={1.6}
                    strokeDasharray="0.1 3.2"
                    strokeLinecap="round"
                />
            </g>
        </>
    ),
};

const ghodi: Rig = {
    width: 150,
    height: 92,
    crossing: 18,
    stride: 0.46,
    art: (
        <>
            {/* Legs: back pair, then front pair, out of step */}
            <Leg x={44} y={58} length={28} phase={0} width={4} />
            <Leg x={52} y={58} length={28} phase={1} width={4} />
            <Leg x={100} y={58} length={28} phase={1} width={4} />
            <Leg x={108} y={58} length={28} phase={0} width={4} />
            <g className="proc-sway">
                {/* Tail */}
                <path
                    d="M34 46 C24 50 22 62 26 72"
                    fill="none"
                    stroke={ink}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                />
                {/* Mare */}
                <path
                    d="M34 48 C34 38 46 35 62 36 C78 37 92 34 100 38 L110 24 C113 18 119 16 125 18 L134 27 C135 30 132 32 129 31 L119 29 C115 35 112 41 112 49 C112 56 107 60 100 60 L46 60 C38 60 34 55 34 48 Z"
                    fill={ink}
                />
                <path d="M120 18 L123 10 L125 18 Z" fill={ink} />
                {/* Kalgi plume and bridle */}
                <path
                    d="M118 17 C116 10 118 5 122 2"
                    fill="none"
                    stroke={gold}
                    strokeWidth={2}
                    strokeLinecap="round"
                />
                <path d="M113 25 L128 29" stroke={gold} strokeWidth={1.4} />
                {/* Embroidered saddle cloth with fringe */}
                <path
                    d="M54 36 C64 34 78 34 88 36 L90 54 L52 54 Z"
                    fill={primary}
                    stroke={gold}
                    strokeWidth={1.3}
                />
                <path
                    d="M52 54 q2.4 4 4.8 0 q2.4 4 4.8 0 q2.4 4 4.8 0 q2.4 4 4.8 0 q2.4 4 4.8 0 q2.4 4 4.8 0 q2.4 4 4.8 0 q2.4 4 4.8 0"
                    fill="none"
                    stroke={gold}
                    strokeWidth={1.2}
                />
                {/* Groom: sherwani, safa with kalgi, sehra strings */}
                <path
                    d="M66 34 L64 20 C64 16 68 14 72 14 C76 14 79 16 79 20 L77 34 Z"
                    fill={surface}
                    stroke={gold}
                    strokeWidth={1}
                />
                <path d="M72 34 L80 46" stroke={surface} strokeWidth={4} strokeLinecap="round" />
                <path d="M77 22 L96 32" stroke={surface} strokeWidth={2.6} strokeLinecap="round" />
                <circle cx={72} cy={9} r={4.6} fill={ink} />
                <path d="M66 8 C66 1 78 0 79 7 Z" fill={accent} stroke={gold} strokeWidth={0.8} />
                <path
                    d="M77 3 C79 -2 82 -3 84 -2"
                    fill="none"
                    stroke={gold}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                />
                <path d="M74 7 V16 M76 7 V15 M78 7 V14" stroke={gold} strokeWidth={0.9} />
            </g>
        </>
    ),
};

interface WheelProps {
    cx: number;
    cy?: number;
    r?: number;
}

function Wheel({ cx, cy = 50, r = 10 }: WheelProps) {
    const k = r / 10;
    const spokes = `M${String(cx - 6 * k)} ${String(cy)} H${String(cx + 6 * k)} M${String(cx)} ${String(cy - 6 * k)} V${String(cy + 6 * k)} M${String(cx - 4.3 * k)} ${String(cy - 4.3 * k)} L${String(cx + 4.3 * k)} ${String(cy + 4.3 * k)} M${String(cx + 4.3 * k)} ${String(cy - 4.3 * k)} L${String(cx - 4.3 * k)} ${String(cy + 4.3 * k)}`;
    return (
        <g>
            <circle cx={cx} cy={cy} r={r} fill={ink} />
            <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke={gold} strokeWidth={1.2} />
            <g className="proc-wheel">
                <path d={spokes} stroke={gold} strokeWidth={1} />
            </g>
            <circle cx={cx} cy={cy} r={1.8 * k} fill={gold} />
        </g>
    );
}

const car: Rig = {
    width: 156,
    height: 64,
    crossing: 12,
    stride: 0.7,
    art: (
        <>
            <g className="proc-sway">
                {/* Vintage body, flowing fenders */}
                <path
                    d="M8 46 C8 38 14 34 24 33 L52 32 L62 18 C64 15 68 13 72 13 L100 13 C104 13 107 15 109 18 L118 31 L136 33 C143 34 148 38 148 44 L148 48 L8 48 Z"
                    fill={primary}
                    stroke={gold}
                    strokeWidth={1.2}
                />
                {/* Windows */}
                <path
                    d="M66 30 L70 19 C71 17 72 16 74 16 L84 16 L84 30 Z"
                    fill={surface}
                    opacity={0.85}
                />
                <path
                    d="M88 30 L88 16 L99 16 C101 16 103 17 104 19 L110 30 Z"
                    fill={surface}
                    opacity={0.85}
                />
                {/* Marigold strings along the roof and a bouquet on the bonnet */}
                <path
                    d="M62 18 Q86 26 109 18"
                    fill="none"
                    stroke={accent}
                    strokeWidth={2.2}
                    strokeDasharray="0.1 3.4"
                    strokeLinecap="round"
                />
                <path
                    d="M54 33 Q86 42 118 33"
                    fill="none"
                    stroke={gold}
                    strokeWidth={1.6}
                    strokeDasharray="0.1 3"
                    strokeLinecap="round"
                />
                {[
                    [130, 28, accent],
                    [135, 26, gold],
                    [133, 31, primary],
                    [139, 29, accent],
                    [128, 32, gold],
                ].map(([x, y, fill]) => (
                    <circle
                        key={`${String(x)}-${String(y)}`}
                        cx={x}
                        cy={y}
                        r={3}
                        fill={fill as string}
                        stroke={gold}
                        strokeWidth={0.6}
                    />
                ))}
                {/* Headlamp and a ribbon trailing behind */}
                <circle cx={146} cy={40} r={2.4} fill={gold} />
                <path
                    d="M8 40 C2 38 -2 44 -8 42 M8 42 C2 44 0 50 -6 50"
                    fill="none"
                    stroke={accent}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                />
            </g>
            <Wheel cx={36} />
            <Wheel cx={122} />
        </>
    ),
};

// Gold scallops with tassels: the hem of every caparison and canopy.
interface At {
    x: number;
    y: number;
}

interface HemProps extends At {
    count: number;
    step?: number;
}

function Hem({ x, y, count, step = 8 }: HemProps) {
    const half = step / 2;
    const d = `M${String(x)} ${String(y)} ${Array.from({ length: count }, () => `q${String(half)} ${String(step * 0.6)} ${String(step)} 0`).join(' ')}`;
    return (
        <>
            <path d={d} fill="none" stroke={gold} strokeWidth={1.3} />
            {Array.from({ length: count }, (_, i) => (
                <circle key={i} cx={x + half + i * step} cy={y + step * 0.6} r={1.4} fill={gold} />
            ))}
        </>
    );
}

const elephant: Rig = {
    width: 180,
    height: 104,
    crossing: 34,
    stride: 0.9,
    art: (
        <>
            <Leg x={50} y={72} length={28} phase={0} width={10} />
            <Leg x={64} y={72} length={28} phase={1} width={10} />
            <Leg x={122} y={72} length={28} phase={1} width={10} />
            <Leg x={136} y={72} length={28} phase={0} width={10} />
            <g className="proc-sway">
                <path
                    d="M34 58 C28 62 26 72 28 80"
                    fill="none"
                    stroke={ink}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                />
                <path
                    d="M34 70 C30 50 44 36 70 34 L116 34 C138 34 152 44 154 58 L154 74 C150 80 144 80 140 78 L44 80 C38 80 35 76 34 70 Z"
                    fill={ink}
                />
                {/* Head, ear, trunk curling forward, tusk */}
                <ellipse cx={156} cy={44} rx={17} ry={16} fill={ink} />
                <path
                    d="M164 52 C172 62 172 78 178 86 C180 90 176 92 174 89 C166 80 162 66 156 58 Z"
                    fill={ink}
                />
                <path
                    d="M160 60 C166 64 171 64 175 59"
                    fill="none"
                    stroke={surface}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                />
                <path
                    d="M144 34 C132 36 130 56 140 62 C147 64 151 55 149 44 Z"
                    fill={ink}
                    stroke={gold}
                    strokeWidth={0.8}
                />
                <circle cx={162} cy={40} r={1.3} fill={surface} />
                {/* Gold forehead plate (nettipattam) */}
                <path d="M152 27 L164 31 L160 47 L150 40 Z" fill={gold} />
                <path d="M157 31 V44" stroke={primary} strokeWidth={1.2} />
                {/* Embroidered jhool over the back */}
                <path
                    d="M54 36 L120 36 L124 70 L50 70 Z"
                    fill={primary}
                    stroke={gold}
                    strokeWidth={1.4}
                />
                <path
                    d="M60 42 L114 42 L117 64 L57 64 Z"
                    fill="none"
                    stroke={gold}
                    strokeWidth={0.8}
                    strokeDasharray="2 2"
                />
                <circle cx={87} cy={53} r={5} fill="none" stroke={gold} strokeWidth={1.1} />
                <Hem x={50} y={70} count={9} step={8.2} />
                {/* Howdah: gold base, pillars and a domed canopy */}
                <rect x={64} y={24} width={46} height={12} rx={1.5} fill={gold} />
                <path d="M67 24 V11 M107 24 V11 M87 24 V11" stroke={gold} strokeWidth={1.6} />
                <path
                    d="M62 12 C62 -2 112 -2 112 12 Z"
                    fill={primary}
                    stroke={gold}
                    strokeWidth={1.3}
                />
                <path d="M87 -1 V-4" stroke={gold} strokeWidth={1.4} />
                <circle cx={87} cy={-4} r={2.2} fill={gold} />
                <path
                    d="M64 12 Q75 18 87 12 Q99 18 110 12"
                    fill="none"
                    stroke={accent}
                    strokeWidth={1.6}
                    strokeDasharray="0.1 3"
                    strokeLinecap="round"
                />
            </g>
        </>
    ),
};

const bagghi: Rig = {
    width: 214,
    height: 88,
    crossing: 22,
    stride: 0.46,
    art: (
        <>
            {/* The mare, a little smaller than the baraat ghodi */}
            <g transform="translate(100 17) scale(0.82)">
                <Leg x={44} y={58} length={28} phase={0} width={4} />
                <Leg x={52} y={58} length={28} phase={1} width={4} />
                <Leg x={100} y={58} length={28} phase={1} width={4} />
                <Leg x={108} y={58} length={28} phase={0} width={4} />
                <g className="proc-sway">
                    <path
                        d="M34 46 C24 50 22 62 26 72"
                        fill="none"
                        stroke={ink}
                        strokeWidth={4.5}
                        strokeLinecap="round"
                    />
                    <path
                        d="M34 48 C34 38 46 35 62 36 C78 37 92 34 100 38 L110 24 C113 18 119 16 125 18 L134 27 C135 30 132 32 129 31 L119 29 C115 35 112 41 112 49 C112 56 107 60 100 60 L46 60 C38 60 34 55 34 48 Z"
                        fill={ink}
                    />
                    <path d="M120 18 L123 10 L125 18 Z" fill={ink} />
                    <path
                        d="M118 17 C116 10 118 5 122 2"
                        fill="none"
                        stroke={gold}
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                    <path
                        d="M52 38 C64 36 80 36 92 38 L93 50 L51 50 Z"
                        fill={primary}
                        stroke={gold}
                        strokeWidth={1.2}
                    />
                    <path d="M113 25 L128 29" stroke={gold} strokeWidth={1.4} />
                </g>
            </g>
            {/* Shafts to the carriage */}
            <path d="M84 52 L148 48" stroke={gold} strokeWidth={2} strokeLinecap="round" />
            <g className="proc-sway">
                {/* Folded hood, body, the couple inside */}
                <path
                    d="M12 44 C10 20 26 6 50 8 L56 30 L18 32 Z"
                    fill={ink}
                    stroke={gold}
                    strokeWidth={1.2}
                />
                <path
                    d="M18 20 Q34 14 52 18 M15 30 Q34 24 54 28"
                    stroke={gold}
                    strokeWidth={0.8}
                    fill="none"
                />
                <circle cx={60} cy={20} r={4.4} fill={ink} />
                <path d="M55 19 C55 13 65 13 65 19 Z" fill={accent} />
                <circle cx={72} cy={21} r={4.4} fill={ink} />
                <path d="M67 19 Q72 12 77 19 Z" fill={gold} />
                <path
                    d="M10 60 C10 40 18 30 34 30 L84 30 C90 30 94 36 92 44 L88 60 Z"
                    fill={primary}
                    stroke={gold}
                    strokeWidth={1.3}
                />
                <path
                    d="M24 36 L80 36 L78 54 L22 54 Z"
                    fill="none"
                    stroke={gold}
                    strokeWidth={0.8}
                    strokeDasharray="2 2"
                />
                <Hem x={12} y={60} count={9} step={8.4} />
                <path
                    d="M30 30 Q56 38 84 30"
                    fill="none"
                    stroke={accent}
                    strokeWidth={2}
                    strokeDasharray="0.1 3.2"
                    strokeLinecap="round"
                />
                <circle cx={94} cy={38} r={2.4} fill={gold} />
            </g>
            <Wheel cx={28} cy={72} r={16} />
            <Wheel cx={80} cy={77} r={11} />
        </>
    ),
};

const dhol: Rig = {
    width: 126,
    height: 82,
    crossing: 22,
    stride: 0.4,
    art: (
        <>
            {/* The dholi */}
            <Leg x={30} y={56} length={24} phase={0} />
            <Leg x={38} y={56} length={24} phase={1} />
            <g className="proc-sway">
                <path d="M24 30 Q34 26 44 30 L46 58 L22 58 Z" fill={primary} />
                <circle cx={34} cy={20} r={5} fill={ink} />
                <path d="M28 18 Q34 9 40 18 Z" fill={accent} stroke={gold} strokeWidth={0.7} />
                <path d="M40 15 L46 10" stroke={gold} strokeWidth={1.4} strokeLinecap="round" />
                <rect
                    x={22}
                    y={36}
                    width={30}
                    height={15}
                    rx={7.5}
                    fill={gold}
                    stroke={ink}
                    strokeWidth={1}
                />
                <path
                    d="M27 37 L30 50 L33 37 L36 50 L39 37 L42 50 L45 37 L48 50"
                    fill="none"
                    stroke={primary}
                    strokeWidth={0.9}
                />
                <ellipse cx={52} cy={43.5} rx={2.6} ry={7.5} fill={surface} stroke={ink} />
                {/* Arms beating the drum */}
                <g className="proc-wave">
                    <path
                        d="M44 33 L54 26 L60 20"
                        fill="none"
                        stroke={ink}
                        strokeWidth={2.6}
                        strokeLinecap="round"
                    />
                </g>
                <path d="M24 33 L18 42" stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
            </g>
            {/* A dancer, arms up in bhangra */}
            <Leg x={88} y={54} length={26} phase={1} />
            <Leg x={96} y={54} length={26} phase={0} />
            <g className="proc-sway">
                <path d="M82 28 Q92 24 102 28 L105 56 L79 56 Z" fill={accent} />
                <path d="M79 56 L105 56" stroke={gold} strokeWidth={1.4} />
                <circle cx={92} cy={18} r={5} fill={ink} />
                <path d="M86 16 Q92 7 98 16 Z" fill={primary} stroke={gold} strokeWidth={0.7} />
                <path d="M97 10 C100 6 104 6 106 8" fill="none" stroke={gold} strokeWidth={1.4} />
                <g className="proc-wave">
                    <path
                        d="M84 30 L76 18 L74 8"
                        fill="none"
                        stroke={ink}
                        strokeWidth={2.6}
                        strokeLinecap="round"
                    />
                </g>
                <g className="proc-wave proc-wave-b">
                    <path
                        d="M100 30 L108 18 L110 8"
                        fill="none"
                        stroke={ink}
                        strokeWidth={2.6}
                        strokeLinecap="round"
                    />
                </g>
            </g>
        </>
    ),
};

const rickshaw: Rig = {
    width: 128,
    height: 72,
    crossing: 14,
    stride: 0.55,
    art: (
        <>
            <g className="proc-sway">
                {/* Black canopy, coloured body, open side */}
                <path
                    d="M12 30 C12 12 24 6 40 6 L86 6 C92 6 95 10 95 16 L95 30 Z"
                    fill={ink}
                    stroke={gold}
                    strokeWidth={1}
                />
                <path
                    d="M10 30 L96 30 L116 50 L116 60 L10 60 Z"
                    fill={primary}
                    stroke={gold}
                    strokeWidth={1.2}
                />
                <rect x={22} y={14} width={40} height={16} rx={2} fill={surface} opacity={0.85} />
                <path d="M96 30 L108 30 L116 46" fill="none" stroke={gold} strokeWidth={1.2} />
                <circle cx={82} cy={20} r={4.6} fill={ink} />
                <path d="M86 24 L98 32" stroke={ink} strokeWidth={2.2} strokeLinecap="round" />
                {/* Marigold string along the canopy, a garland at the nose */}
                <path
                    d="M14 30 Q54 40 94 30"
                    fill="none"
                    stroke={accent}
                    strokeWidth={2.2}
                    strokeDasharray="0.1 3.4"
                    strokeLinecap="round"
                />
                <path
                    d="M104 46 Q110 56 116 50"
                    fill="none"
                    stroke={gold}
                    strokeWidth={2.4}
                    strokeDasharray="0.1 3"
                    strokeLinecap="round"
                />
                <circle cx={115} cy={42} r={2.2} fill={gold} />
                <path
                    d="M10 40 C4 38 0 44 -6 42 M10 44 C4 46 2 52 -4 52"
                    fill="none"
                    stroke={accent}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                />
            </g>
            <Wheel cx={28} cy={62} r={9} />
            <Wheel cx={106} cy={62} r={9} />
        </>
    ),
};

// Doves and storks are white on every theme, outlined so they still read on pale paper.
const feather = '#fbf8f1';
const outline = 'rgba(43, 30, 30, 0.6)';

// A dove facing right; its wing beats from the shoulder.
interface DoveProps extends At {
    // Beats half a stroke behind the other dove.
    late?: boolean;
}

function Dove({ x, y, late = false }: DoveProps) {
    return (
        <g transform={`translate(${String(x)} ${String(y)})`}>
            <path
                d="M0 20 C6 12 20 10 30 14 C36 10 42 10 44 14 L50 16 L44 18 C40 24 30 28 18 26 L4 30 L8 24 Z"
                fill={feather}
                stroke={outline}
                strokeWidth={0.9}
            />
            <circle cx={41} cy={14} r={0.9} fill={outline} />
            <g className={late ? 'proc-flap proc-flap-b' : 'proc-flap'}>
                <path
                    d="M14 16 C12 4 22 -6 36 -4 C30 2 28 10 26 16 Z"
                    fill={feather}
                    stroke={outline}
                    strokeWidth={0.9}
                />
            </g>
        </g>
    );
}

const doves: Rig = {
    width: 150,
    height: 62,
    crossing: 16,
    stride: 0.32,
    flies: true,
    art: (
        <g className="proc-float">
            {/* A ribbon held between them, a ring hanging from it */}
            <path
                d="M60 42 Q80 58 98 40"
                fill="none"
                stroke={accent}
                strokeWidth={1.6}
                strokeLinecap="round"
            />
            <circle cx={80} cy={53} r={3.6} fill="none" stroke={gold} strokeWidth={1.4} />
            <circle cx={80} cy={49.6} r={1.2} fill={gold} />
            <Dove x={10} y={26} />
            <Dove x={96} y={18} late />
        </g>
    ),
};

const stork: Rig = {
    width: 140,
    height: 96,
    crossing: 20,
    stride: 0.42,
    flies: true,
    art: (
        <g className="proc-float">
            <path
                d="M30 46 L4 52 M30 48 L6 56"
                stroke={gold}
                strokeWidth={1.4}
                strokeLinecap="round"
            />
            <path
                d="M30 40 C40 30 70 30 86 36 L100 30 C104 28 108 30 110 32 C104 40 96 44 88 46 C70 54 44 54 30 48 L12 48 L22 42 Z"
                fill={feather}
                stroke={outline}
                strokeWidth={1}
            />
            <circle cx={104} cy={31} r={5} fill={feather} stroke={outline} strokeWidth={1} />
            <circle cx={106} cy={30} r={0.9} fill={outline} />
            <path d="M108 29 L134 33 L108 35 Z" fill={gold} />
            <g className="proc-flap">
                <path
                    d="M50 38 C46 18 62 2 84 0 C78 12 74 26 70 38 Z"
                    fill={feather}
                    stroke={outline}
                    strokeWidth={1}
                />
                <path d="M66 6 C72 2 78 0 84 0 C80 6 78 10 76 14 Z" fill="#2b1e1e" />
            </g>
            {/* The bundle, swinging from the beak */}
            <g className="proc-swing">
                <path d="M124 33 V54" stroke={outline} strokeWidth={0.8} />
                <path
                    d="M112 56 C112 51 136 51 136 56 L132 74 C128 82 120 82 116 74 Z"
                    fill={accent}
                    stroke={gold}
                    strokeWidth={1}
                />
                <path d="M112 56 C118 60 130 60 136 56" fill="none" stroke={gold} strokeWidth={1} />
                <circle cx={124} cy={63} r={4} fill="#f3d9c4" />
            </g>
        </g>
    ),
};

// A fanoos: a lattice lantern with a dome and a warm glow inside.
interface FloatProps extends At {
    delay: string;
}

function Fanoos({ x, y, delay }: FloatProps) {
    const bob = { animationDelay: delay };
    return (
        <g transform={`translate(${String(x)} ${String(y)})`}>
            <g className="proc-float" style={bob}>
                <circle cx={13} cy={26} r={18} fill="url(#proc-glow)" />
                <circle cx={13} cy={2} r={2} fill="none" stroke={gold} strokeWidth={1} />
                <path d="M4 14 C4 5 22 5 22 14 Z" fill={gold} />
                <path
                    d="M3 14 L23 14 L20 36 L6 36 Z"
                    fill={accent}
                    fillOpacity={0.55}
                    stroke={gold}
                    strokeWidth={1.2}
                />
                <path
                    d="M8 14 L9 36 M13 14 V36 M18 14 L17 36 M4 22 H22 M5 29 H21"
                    stroke={gold}
                    strokeWidth={0.8}
                />
                <path d="M6 36 L20 36 L16 42 L10 42 Z" fill={gold} />
                <circle cx={13} cy={45} r={1.6} fill={gold} />
            </g>
        </g>
    );
}

const lanterns: Rig = {
    width: 180,
    height: 92,
    crossing: 40,
    stride: 0.8,
    flies: true,
    art: (
        <>
            <defs>
                <radialGradient id="proc-glow">
                    <stop offset="0" stopColor="var(--inv-gold)" stopOpacity={0.55} />
                    <stop offset="1" stopColor="var(--inv-gold)" stopOpacity={0} />
                </radialGradient>
            </defs>
            <Fanoos x={10} y={34} delay="0s" />
            <Fanoos x={78} y={4} delay="-1.1s" />
            <Fanoos x={146} y={26} delay="-2.3s" />
        </>
    ),
};

const balloonSet = [
    [30, 30, primary],
    [52, 18, accent],
    [74, 28, gold],
    [42, 48, gold],
    [64, 46, primary],
] as const;

const balloons: Rig = {
    width: 104,
    height: 108,
    crossing: 30,
    stride: 0.7,
    flies: true,
    art: (
        <g className="proc-float">
            {balloonSet.map(([x, y]) => (
                <path
                    key={`s${String(x)}`}
                    d={`M${String(x)} ${String(y + 15)} Q${String((x + 54) / 2 + 4)} ${String((y + 96) / 2)} 54 96`}
                    fill="none"
                    stroke={ink}
                    strokeWidth={0.7}
                    opacity={0.7}
                />
            ))}
            {balloonSet.map(([x, y, fill], i) => (
                <g
                    key={`b${String(x)}`}
                    className="proc-sway"
                    style={{ animationDelay: `${String(-i * 0.4)}s` }}
                >
                    <ellipse cx={x} cy={y} rx={11} ry={14} fill={fill} />
                    <ellipse cx={x - 4} cy={y - 5} rx={2.6} ry={4} fill="white" opacity={0.4} />
                    <path
                        d={`M${String(x - 2)} ${String(y + 16)} L${String(x + 2)} ${String(y + 16)} L${String(x)} ${String(y + 13)} Z`}
                        fill={fill}
                    />
                </g>
            ))}
            <path
                d="M48 94 Q54 90 54 96 Q54 90 60 94 Q54 100 54 96 Q54 100 48 94 Z"
                fill={accent}
            />
        </g>
    ),
};

// A patang: two-tone diamond with spars and a little tail, tugging on its string.
interface PatangProps extends FloatProps {
    a: string;
    b: string;
}

function Patang({ x, y, a, b, delay }: PatangProps) {
    const tug = { animationDelay: delay };
    return (
        <g transform={`translate(${String(x)} ${String(y)}) rotate(14)`}>
            <path
                d="M0 18 C-14 40 -30 60 -48 78"
                fill="none"
                stroke={ink}
                strokeWidth={0.6}
                opacity={0.5}
            />
            <g className="proc-swing" style={tug}>
                <path d="M0 -18 L14 0 L0 18 Z" fill={b} />
                <path d="M0 -18 L-14 0 L0 18 Z" fill={a} />
                <path d="M0 -18 V18 M-14 0 Q0 -6 14 0" fill="none" stroke={ink} strokeWidth={0.7} />
                <path d="M0 18 L-4 25 L4 25 Z" fill={a} />
            </g>
        </g>
    );
}

const kites: Rig = {
    width: 200,
    height: 100,
    crossing: 28,
    stride: 0.7,
    flies: true,
    art: (
        <g className="proc-float">
            <Patang x={48} y={30} a={primary} b={gold} delay="0s" />
            <Patang x={118} y={14} a={accent} b={surface} delay="-0.9s" />
            <Patang x={180} y={38} a={gold} b={primary} delay="-1.7s" />
        </g>
    ),
};

const rigs: Record<ProcessionKind, Rig> = {
    doli,
    ghodi,
    car,
    elephant,
    bagghi,
    dhol,
    rickshaw,
    doves,
    stork,
    lanterns,
    balloons,
    kites,
};

interface ProcessionProps {
    kind: ProcessionKind;
    seed: number;
    /** The section's "Animate edge" switch; off parks the figure part-way across. */
    animated: boolean;
}

export function Procession({ kind, seed, animated }: ProcessionProps) {
    const rig = rigs[kind];
    const scale = 0.82;
    // The viewBox pads 10 left (the car's ribbon) and 4 above (plumes), so size the box to match.
    const width = (rig.width + 10) * scale;
    const height = (rig.height + 4) * scale;
    // Start part-way along, so a visitor never waits for it to walk on.
    const delay = -((seed % 97) / 97) * rig.crossing;
    const still = !animated;
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-20 overflow-hidden rtl:-scale-x-100"
            style={{
                top: `${String(-height + 2)}px`,
                height: `${String(height + 4)}px`,
            }}
        >
            {/* A path of marigold petals the procession walks along (fliers have none). */}
            <div
                hidden={rig.flies}
                className="absolute inset-x-0 bottom-0.5 h-1.5 opacity-60"
                style={{
                    backgroundImage: `radial-gradient(circle, var(--inv-gold) 1.4px, transparent 1.8px), radial-gradient(circle, var(--inv-accent) 1.2px, transparent 1.6px)`,
                    backgroundSize: '22px 6px, 22px 6px',
                    backgroundPosition: '0 0, 11px 0',
                }}
            />
            <div
                className={still ? 'proc-track proc-still' : 'proc-track'}
                style={
                    {
                        '--proc-w': `${String(width)}px`,
                        '--proc-stride': `${String(rig.stride)}s`,
                        animationDuration: `${String(rig.crossing)}s`,
                        animationDelay: `${String(delay)}s`,
                    } as CSSProperties
                }
            >
                <svg
                    viewBox={`-10 -4 ${String(rig.width + 10)} ${String(rig.height + 4)}`}
                    width={width}
                    height={height}
                    className="proc-bob overflow-visible"
                >
                    {rig.art}
                </svg>
            </div>
        </div>
    );
}

// One heartbeat, 200 wide on a baseline at y=26: flat, rounded P-wave, PR segment, a small Q notch,
// the tall R spike, the S dip below the line, the ST segment, a broad T-wave, then rest.
export const BEAT = 'h58 q5 -7 10 0 h8 l3 4 l5 -26 l5 32 l3 -10 h12 q10 -12 20 0 h76';
const BEATS = 14;
const TRACE = `M0 26 ${Array.from({ length: BEATS }, () => BEAT).join(' ')}`;
// Pinned to the physical left, like the section's mask, and glowing like a monitor.
const TRACE_BOX: CSSProperties = {
    left: 0,
    filter: 'drop-shadow(0 0 3px var(--inv-gold))',
};
// A pulse every two beats (~400px), so any width — phone or desktop — always has one sweeping by.
const PERIOD = 2 / BEATS;

// Layers of one sweep, back to front: a long faint tail, a brighter middle, the white-hot head.
const sweep = [
    {
        length: 0.32,
        lead: 0,
        width: 2,
        color: 'var(--inv-gold)',
        opacity: 0.35,
    },
    {
        length: 0.16,
        lead: 0.16,
        width: 2.2,
        color: 'var(--inv-gold)',
        opacity: 0.75,
    },
    {
        length: 0.05,
        lead: 0.27,
        width: 2.4,
        color: '#fff6dc',
        opacity: 1,
    },
];

// A heart-monitor trace along the edge: a thin glowing line. Animated, a bright pulse sweeps along a
// faint trace with a fading tail, as on a bedside monitor; still, the whole trace is drawn crisply.
export function Heartbeat({ animated }: { animated: boolean }) {
    const width = 200 * BEATS;
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-20 h-10 overflow-hidden"
            // Same box as the section's masked fabric (scenes.tsx), so the line rides its boundary.
            // Never mirrored: the mask is not, and an ECG reads left to right in every script.
            style={{ top: '-39px' }}
        >
            <svg
                viewBox={`0 0 ${String(width)} 40`}
                width={width}
                height={40}
                className="absolute bottom-0"
                style={TRACE_BOX}
            >
                <path
                    d={TRACE}
                    fill="none"
                    stroke="var(--inv-gold)"
                    strokeWidth={animated ? 1.2 : 1.8}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={animated ? 0.55 : 0.95}
                />
                {animated &&
                    sweep.map((layer) => (
                        <path
                            key={layer.length}
                            d={TRACE}
                            pathLength={1}
                            className="beat-sweep"
                            fill="none"
                            stroke={layer.color}
                            strokeWidth={layer.width}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeDasharray={`${String(layer.length * PERIOD)} ${String((1 - layer.length) * PERIOD)}`}
                            opacity={layer.opacity}
                            style={
                                {
                                    '--beat-from': String(-layer.lead * PERIOD),
                                    '--beat-to': String(-(layer.lead + 1) * PERIOD),
                                } as CSSProperties
                            }
                        />
                    ))}
            </svg>
        </div>
    );
}
