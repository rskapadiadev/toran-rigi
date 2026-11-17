import { type Art, ContactShadow, gilt, GoldStops, Sparkle } from './kit';

type Pt = [number, number];

// Points along a quadratic curve, for strings of pearls.
function beads(a: Pt, c: Pt, b: Pt, n: number): Pt[] {
    return Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        const u = 1 - t;
        return [
            u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
            u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
        ];
    });
}

const body =
    'M14 100 C10 72 18 44 44 32 C66 22 98 28 106 56 C111 74 108 92 106 102 C80 112 40 112 14 100 Z';
const cross = 'M74 108 C66 86 46 62 22 48 L32 37 C56 52 80 78 94 106 Z';
const tail = 'M96 66 C110 80 114 102 110 118 L93 116 C97 100 95 86 86 74 Z';
const fan = 'M88 38 C90 28 96 20 103 15 C106 21 110 25 115 27 C109 33 103 39 97 44 Z';
const folds = [92, 78, 64, 50, 38];
const strands: [Pt, Pt, Pt, number][] = [
    [[20, 60], [60, 98], [102, 56], 34],
    [[22, 66], [60, 106], [100, 62], 34],
];

interface Cloth {
    id: string;
    d: string;
}

// Bandhani silk: crimson ground, tie-dye dots, then shading so the dots turn with the cloth.
function Silk({ id, d }: Cloth) {
    return (
        <>
            <path d={d} fill={`url(#${id}-cloth)`} />
            <path d={d} fill={`url(#${id}-dots)`} opacity="0.8" />
            <path d={d} fill={`url(#${id}-shade)`} />
        </>
    );
}

export function Safa({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-gold`} x1="0" x2="1" y1="0" y2="0.4">
                    <GoldStops />
                </linearGradient>
                <radialGradient id={`${id}-cloth`} cx="0.35" cy="0.3" r="0.85">
                    <stop offset="0" stopColor="#ff6a3d" />
                    <stop offset="0.45" stopColor="#d81e3a" />
                    <stop offset="1" stopColor="#6e0a1e" />
                </radialGradient>
                <radialGradient id={`${id}-shade`} cx="0.35" cy="0.3" r="0.85">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
                    <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#1f0007" stopOpacity="0.5" />
                </radialGradient>
                <pattern id={`${id}-dots`} width="5" height="5" patternUnits="userSpaceOnUse">
                    <circle cx="1.25" cy="1.25" r="0.55" fill="#fff0c8" />
                    <circle cx="3.75" cy="3.75" r="0.55" fill="#ffd36b" />
                </pattern>
                <pattern id={`${id}-zari`} width="4" height="4" patternUnits="userSpaceOnUse">
                    <path d="M2 0.4 L3.6 2 L2 3.6 L0.4 2 Z" fill="#7a4f12" opacity="0.55" />
                </pattern>
                <radialGradient id={`${id}-emerald`} cx="0.38" cy="0.3" r="0.75">
                    <stop offset="0" stopColor="#b6f5d2" />
                    <stop offset="0.3" stopColor="#22a86c" />
                    <stop offset="0.8" stopColor="#0a5a36" />
                    <stop offset="1" stopColor="#03321d" />
                </radialGradient>
                <radialGradient id={`${id}-pearl`} cx="0.35" cy="0.3" r="0.7">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.6" stopColor="#efe8dc" />
                    <stop offset="1" stopColor="#9d968c" />
                </radialGradient>
                <linearGradient id={`${id}-plume`} x1="0" x2="1" y1="0" y2="0.3">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.55" stopColor="#f4efe4" />
                    <stop offset="1" stopColor="#bdb4a3" />
                </linearGradient>
                <linearGradient id={`${id}-pleats`} x1="0" x2="1">
                    <stop offset="0" stopColor="#1f0007" stopOpacity="0.45" />
                    <stop offset="0.3" stopColor="#fff" stopOpacity="0.12" />
                    <stop offset="0.55" stopColor="#1f0007" stopOpacity="0.3" />
                    <stop offset="0.8" stopColor="#fff" stopOpacity="0.1" />
                    <stop offset="1" stopColor="#1f0007" stopOpacity="0.45" />
                </linearGradient>
                <clipPath id={`${id}-clip`}>
                    <path d={body} />
                </clipPath>
            </defs>
            <ContactShadow id={id} cx={60} cy={121} rx={46} ry={4.5} />
            <g transform="translate(0 8)">
                {/* The turra fan and trailing tail, behind the wraps */}
                <Silk id={id} d={fan} />
                <path d={fan} fill={`url(#${id}-pleats)`} />
                <path
                    d="M103 15 C106 21 110 25 115 27"
                    fill="none"
                    stroke={gilt}
                    strokeWidth="1.4"
                />
                <Silk id={id} d={tail} />
                <path d={tail} fill={`url(#${id}-pleats)`} />
                <path d="M93 112 L110 114 L110 118 L93 116 Z" fill={`url(#${id}-gold)`} />
                {[94, 97, 100, 103, 106, 109].map((x) => (
                    <path
                        key={x}
                        d={`M${String(x)} ${String(116 + (x - 93) * 0.12)} l0.3 3.2`}
                        stroke={gilt}
                        strokeWidth="0.7"
                        strokeLinecap="round"
                    />
                ))}
                {/* The wrapped crown, each wrap edged with zari */}
                <Silk id={id} d={body} />
                <g clipPath={`url(#${id}-clip)`}>
                    {folds.map((y) => (
                        <g key={y}>
                            <path
                                d={`M6 ${String(y + 1.5)} Q60 ${String(y + 13)} 114 ${String(y - 14)}`}
                                fill="none"
                                stroke="#3d0410"
                                strokeWidth="3.2"
                                opacity="0.45"
                            />
                            <path
                                d={`M6 ${String(y)} Q60 ${String(y + 11)} 114 ${String(y - 16)}`}
                                fill="none"
                                stroke={gilt}
                                strokeWidth="0.7"
                            />
                            <path
                                d={`M6 ${String(y - 1.4)} Q60 ${String(y + 9.6)} 114 ${String(y - 17.4)}`}
                                fill="none"
                                stroke="#ffb08a"
                                strokeWidth="1.4"
                                opacity="0.35"
                            />
                        </g>
                    ))}
                </g>
                <path
                    d="M14 100 C40 110 80 110 106 102 L106.5 93 C80 102 40 102 13 91 Z"
                    fill={`url(#${id}-gold)`}
                />
                <path
                    d="M14 100 C40 110 80 110 106 102 L106.5 93 C80 102 40 102 13 91 Z"
                    fill={`url(#${id}-zari)`}
                />
                <path
                    d="M13.5 95.5 C40 105 80 105 106.3 97.5"
                    fill="none"
                    stroke="#fff3c9"
                    strokeWidth="0.5"
                    opacity="0.8"
                />
                {/* The front wrap crossing over */}
                <Silk id={id} d={cross} />
                <path d="M32 37 C56 52 80 78 94 106" fill="none" stroke={gilt} strokeWidth="1.2" />
                <path
                    d="M22 48 C46 62 66 86 74 108"
                    fill="none"
                    stroke="#3d0410"
                    strokeWidth="1.6"
                    opacity="0.5"
                />
                <path
                    d="M29 42 C52 56 72 80 84 106"
                    fill="none"
                    stroke="#ffb08a"
                    strokeWidth="1.2"
                    opacity="0.3"
                />
                {/* Pearl strings draped across the front */}
                {strands.map(([a, c, b, n]) =>
                    beads(a, c, b, n).map(([x, y]) => (
                        <circle
                            key={`${String(x)}-${String(y)}`}
                            cx={x}
                            cy={y}
                            r="1.25"
                            fill={`url(#${id}-pearl)`}
                        />
                    )),
                )}
                {/* Plume: a white feather with fine barbs */}
                <path
                    d="M60 46 C50 34 40 18 42 -2 C52 8 60 22 64 34 C65 40 63 44 60 46 Z"
                    fill={`url(#${id}-plume)`}
                />
                <path d="M60 46 C54 34 46 20 43 2" fill="none" stroke="#c8bfae" strokeWidth="0.6" />
                {Array.from({ length: 9 }, (_, i) => {
                    const y = 6 + i * 4.4;
                    const x = 44 + i * 1.7;
                    return (
                        <g key={i}>
                            <path
                                d={`M${String(x)} ${String(y)} q${String(-1.6 + i * 0.1)} 0.6 ${String(-2.6 + i * 0.15)} 3.6`}
                                fill="none"
                                stroke="#d9d2c3"
                                strokeWidth="0.45"
                            />
                            <path
                                d={`M${String(x)} ${String(y)} q3.5 0.6 ${String(6 - i * 0.3)} 3`}
                                fill="none"
                                stroke="#d2c9b8"
                                strokeWidth="0.45"
                            />
                        </g>
                    );
                })}
                <rect x="57.6" y="38" width="4.8" height="10" rx="1.6" fill={`url(#${id}-gold)`} />
                {/* Kalgi brooch: gold pear setting, diamond halo, emerald and a pearl drop */}
                <path
                    d="M60 45 C67.5 45 71 51 71 56 C71 62 65 66 60 73 C55 66 49 62 49 56 C49 51 52.5 45 60 45 Z"
                    fill={`url(#${id}-gold)`}
                    stroke="#6e4510"
                    strokeWidth="0.5"
                />
                {Array.from({ length: 14 }, (_, i) => {
                    const a = (i / 14) * Math.PI * 2;
                    return (
                        <circle
                            key={i}
                            cx={60 + Math.cos(a) * 8}
                            cy={57 + Math.sin(a) * 9}
                            r="0.95"
                            fill="#fdfcf7"
                            stroke="#8d8a80"
                            strokeWidth="0.25"
                        />
                    );
                })}
                <ellipse
                    cx="60"
                    cy="57"
                    rx="5.6"
                    ry="6.6"
                    fill={`url(#${id}-emerald)`}
                    stroke="#6e4510"
                    strokeWidth="0.5"
                />
                <path
                    d="M57 54 L60 51.5 L63 54 L62 59 L58 59 Z"
                    fill="none"
                    stroke="#c9ffe2"
                    strokeWidth="0.35"
                    opacity="0.6"
                />
                <ellipse
                    cx="58"
                    cy="54"
                    rx="1.6"
                    ry="1"
                    fill="#fff"
                    opacity="0.75"
                    transform="rotate(-30 58 54)"
                />
                <circle cx="60" cy="76.5" r="2.7" fill={`url(#${id}-pearl)`} />
                <Sparkle x={62.5} y={53} size={2.6} />
                <Sparkle x={24} y={86} size={2} />
            </g>
        </g>
    );
}
