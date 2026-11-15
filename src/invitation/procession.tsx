// Animated edges: a little procession travels along the line where one section meets the next —
// the bride's doli on its bearers' shoulders, the groom's baraat ghodi, or the garlanded vidaai car.
// Pure SVG + CSS keyframes (app.css), so it costs no JS per frame. Reduced motion or the 'static'
// tier parks the figure, still, part-way across.
import type { EdgeKind } from '@shared/types';
import type { CSSProperties, ReactNode } from 'react';

export const processionKinds = ['doli', 'ghodi', 'car'] as const;
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

function Wheel({ cx }: { cx: number }) {
    return (
        <g>
            <circle cx={cx} cy={50} r={10} fill={ink} />
            <circle cx={cx} cy={50} r={6.5} fill="none" stroke={gold} strokeWidth={1.2} />
            <g className="proc-wheel">
                <path
                    d={`M${cx - 6} 50 H${cx + 6} M${cx} 44 V56 M${cx - 4.3} 45.7 L${cx + 4.3} 54.3 M${cx + 4.3} 45.7 L${cx - 4.3} 54.3`}
                    stroke={gold}
                    strokeWidth={1}
                />
            </g>
            <circle cx={cx} cy={50} r={1.8} fill={gold} />
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

const rigs: Record<ProcessionKind, Rig> = {
    doli,
    ghodi,
    car,
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
            {/* A path of marigold petals the procession walks along. */}
            <div
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
