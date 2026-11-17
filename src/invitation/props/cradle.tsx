import {
    type Art,
    ContactShadow,
    GoldStops,
    Leaf,
    Marigold,
    Rose,
    SheenStops,
    Sparkle,
} from './kit';

interface PostProps {
    id: string;
    x: number;
}

// A lathe-turned, gilded post: bulbs and rings stacked on a slim shaft, a kalash finial on top.
function Post({ id, x }: PostProps) {
    const g = `url(#${id}-turned)`;
    return (
        <g transform={`translate(${String(x)} 0)`}>
            <rect x="-2.4" y="20" width="4.8" height="94" fill={g} />
            {[
                [108, 5, 3.4],
                [96, 4.2, 2.4],
                [78, 4.6, 5],
                [58, 3.6, 2],
                [44, 4.2, 3.6],
                [30, 3.6, 1.8],
            ].map(([y, w, h]) => (
                <ellipse key={y} cx="0" cy={y} rx={w} ry={h} fill={g} />
            ))}
            {[104, 92, 72, 84, 50, 38].map((y) => (
                <rect key={y} x="-3.4" y={y} width="6.8" height="1.4" rx="0.7" fill={g} />
            ))}
            <path d="M-4 22 Q-5 16 0 12 Q5 16 4 22 Z" fill={g} />
            <path d="M0 12 Q-2 8 0 4 Q2 8 0 12 Z" fill={g} />
            <circle cx="0" cy="3.6" r="1.4" fill="#fff1c2" />
            <path d="M-1.1 24 L-1.1 112" stroke="#fff6d8" strokeWidth="0.6" opacity="0.6" />
        </g>
    );
}

interface ChainProps {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}

// Linked gold chain, one link at a time, between the top bar and the cradle's prow.
function Chain({ x1, x2, y1, y2 }: ChainProps) {
    const n = 10;
    return (
        <g>
            {Array.from({ length: n }, (_, i) => {
                const t = (i + 0.5) / n;
                const lx = x1 + (x2 - x1) * t;
                const ly = y1 + (y2 - y1) * t;
                return i % 2 ? (
                    <rect
                        key={i}
                        x={lx - 0.4}
                        y={ly - 1.8}
                        width="0.8"
                        height="3.6"
                        fill="#8a5a14"
                    />
                ) : (
                    <ellipse
                        key={i}
                        cx={lx}
                        cy={ly}
                        rx="1.2"
                        ry="1.9"
                        fill="none"
                        stroke="#e7bd62"
                        strokeWidth="0.8"
                    />
                );
            })}
        </g>
    );
}

export function Cradle({ id }: Art) {
    const body =
        'M18 52 C16 60 22 66 28 67 C32 88 46 95 60 95 C74 95 88 88 92 67 C98 66 104 60 102 52 C98 57 92 60 86 61 L34 61 C28 60 22 57 18 52 Z';
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-turned`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
                    <GoldStops />
                </linearGradient>
                <radialGradient id={`${id}-hull`} cx="0.38" cy="0.3" r="0.85">
                    <stop offset="0" stopColor="#fff1c2" />
                    <stop offset="0.3" stopColor="#e0ad4c" />
                    <stop offset="0.7" stopColor="#a8701e" />
                    <stop offset="1" stopColor="#5e3a0c" />
                </radialGradient>
                <linearGradient id={`${id}-panel`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3d0612" />
                    <stop offset="0.5" stopColor="#8c1230" />
                    <stop offset="1" stopColor="#4a0716" />
                </linearGradient>
                <radialGradient id={`${id}-silk`} cx="0.4" cy="0.2" r="0.9">
                    <stop offset="0" stopColor="#ffe3ec" />
                    <stop offset="0.45" stopColor="#f48fb1" />
                    <stop offset="1" stopColor="#ad1457" />
                </radialGradient>
                <radialGradient id={`${id}-pillow`} cx="0.4" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#e6d6bf" />
                </radialGradient>
                <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0.4">
                    <SheenStops />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={123} rx={52} ry={5} />

            {/* Stand: a carved beam on scrolled feet */}
            <path
                d="M10 124 Q12 116 20 116 L100 116 Q108 116 110 124 Q104 121 98 121 L22 121 Q16 121 10 124 Z"
                fill={`url(#${id}-beam)`}
            />
            <rect x="12" y="111" width="96" height="6" rx="2" fill={`url(#${id}-beam)`} />
            <path d="M14 113 L106 113" stroke="#fff1c2" strokeWidth="0.5" strokeDasharray="1 1.4" />
            <Post id={id} x={16} />
            <Post id={id} x={104} />

            {/* Top bar with a carved crest */}
            <path
                d="M48 22 Q50 12 60 9 Q70 12 72 22 Z"
                fill={`url(#${id}-beam)`}
                stroke="#7a4f12"
                strokeWidth="0.5"
            />
            <path d="M54 20 Q60 12 66 20" fill="none" stroke="#fff1c2" strokeWidth="0.6" />
            <circle cx="60" cy="16" r="1.8" fill="#c1121f" stroke="#fff1c2" strokeWidth="0.5" />
            <rect x="12" y="21" width="96" height="6" rx="3" fill={`url(#${id}-beam)`} />
            <path d="M16 24 L104 24" stroke="#7a4f12" strokeWidth="0.5" strokeDasharray="0.8 1.2" />

            {/* Moon and stars mobile */}
            <path d="M46 34 Q60 30 74 34" fill="none" stroke="#b4802a" strokeWidth="0.8" />
            <path
                d="M60 27 L60 32 M47 34 L47 40 M73 34 L73 37 M60 32 L60 37"
                stroke="#c8a05a"
                strokeWidth="0.4"
            />
            <path
                d="M64 38 A7 7 0 1 0 64 50 A5.4 5.4 0 1 1 64 38 Z"
                fill={`url(#${id}-turned)`}
                stroke="#7a4f12"
                strokeWidth="0.4"
            />
            {[
                [47, 43, 3.6],
                [73, 40, 3],
            ].map(([sx = 0, sy = 0, r = 0]) => (
                <path
                    key={sx}
                    d={`M${String(sx)} ${String(sy - r)} L${String(sx + r * 0.3)} ${String(sy - r * 0.3)} L${String(sx + r)} ${String(sy - r * 0.2)} L${String(sx + r * 0.45)} ${String(sy + r * 0.25)} L${String(sx + r * 0.6)} ${String(sy + r)} L${String(sx)} ${String(sy + r * 0.55)} L${String(sx - r * 0.6)} ${String(sy + r)} L${String(sx - r * 0.45)} ${String(sy + r * 0.25)} L${String(sx - r)} ${String(sy - r * 0.2)} L${String(sx - r * 0.3)} ${String(sy - r * 0.3)} Z`}
                    fill="#f6d77e"
                    stroke="#a8761f"
                    strokeWidth="0.4"
                />
            ))}

            <Chain x1={26} x2={22} y1={27} y2={54} />
            <Chain x1={94} x2={98} y1={27} y2={54} />

            {/* Silk cushion and a little lace pillow */}
            <path d="M30 62 C30 52 42 49 60 50 C78 49 90 52 90 62 Z" fill={`url(#${id}-silk)`} />
            <path
                d="M38 54 Q60 49 82 54"
                fill="none"
                stroke="#fff"
                strokeWidth="1.2"
                opacity="0.5"
            />
            <path d="M32 60 C30 51 38 47 46 49 C50 52 50 58 48 61 Z" fill={`url(#${id}-pillow)`} />

            {/* The gilded hull with a lacquered panel */}
            <path d={body} fill={`url(#${id}-hull)`} stroke="#6e4510" strokeWidth="0.6" />
            <path d={body} fill={`url(#${id}-sheen)`} opacity="0.5" />
            <path
                d="M34 69 C38 84 50 89 60 89 C70 89 82 84 86 69 Z"
                fill={`url(#${id}-panel)`}
                stroke="#fff1c2"
                strokeWidth="0.8"
            />
            <path
                d="M38 72 C42 82 50 85 60 85 C70 85 78 82 82 72"
                fill="none"
                stroke="#e2b55a"
                strokeWidth="0.5"
                strokeDasharray="0.8 1"
            />
            <path
                d="M60 74 C56 74 54 80 60 82 C66 80 64 74 60 74 Z M44 76 C48 74 52 78 50 81 M76 76 C72 74 68 78 70 81"
                fill="none"
                stroke="#f6d77e"
                strokeWidth="0.8"
                strokeLinecap="round"
            />
            <circle cx="60" cy="78" r="1.2" fill="#f6d77e" />
            {/* Scrolled prows */}
            {[
                [18, 52, 1],
                [102, 52, -1],
            ].map(([px, py, s]) => (
                <g
                    key={px}
                    transform={`translate(${String(px)} ${String(py)}) scale(${String(s)} 1)`}
                >
                    <path
                        d="M0 0 C-3 -4 1 -8 4 -6 C6 -4 4 -2 2 -3"
                        fill="none"
                        stroke="#e7bd62"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                    <circle cx="2" cy="-3" r="0.9" fill="#fff1c2" />
                </g>
            ))}
            {/* Lace frill falling over the rim */}
            <path
                d={`M28 61 ${Array.from({ length: 16 }, () => `a2 2.4 0 0 0 4 0`).join(' ')} Z`}
                fill="#fffaf2"
                stroke="#e6d6bf"
                strokeWidth="0.4"
            />
            {Array.from({ length: 16 }, (_, i) => (
                <circle key={i} cx={30 + i * 4} cy="62.4" r="0.5" fill="#d9c7aa" />
            ))}
            <rect x="26" y="59.6" width="68" height="1.6" rx="0.8" fill={`url(#${id}-beam)`} />

            {/* Flowers at the foot of the cradle */}
            <Leaf x={48} y={112} angle={160} size={0.6} />
            <Leaf x={72} y={112} angle={20} size={0.6} />
            <Marigold cx={51} cy={113} r={4.2} />
            <Marigold cx={69} cy={113} r={4.2} />
            <Rose cx={60} cy={112} r={4.6} color="#c2185b" light="#f48fb1" />
            <Sparkle x={38} y={42} size={2.4} />
            <Sparkle x={86} y={46} size={2.8} />
        </g>
    );
}
