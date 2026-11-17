import { type Art, BrassStops, ContactShadow, type FlowerProps, Sparkle } from './kit';

interface Bloom extends FlowerProps {
    id: string;
}

// Rings of ruffled petals, deepest orange outside, shaded as a ball so it sits up off the paste.
const rings: [number, number, number, string][] = [
    [0.72, 0.34, 14, '#d9480f'],
    [0.5, 0.3, 11, '#f76707'],
    [0.28, 0.26, 8, '#fd9a10'],
    [0.08, 0.22, 4, '#ffb31a'],
];

function Marigold({ id, cx, cy, r }: Bloom) {
    return (
        <g>
            {rings.map(([dist, size, count, colour], k) =>
                Array.from({ length: count }, (_, i) => {
                    const a = ((i + k * 0.5) / count) * Math.PI * 2;
                    return (
                        <circle
                            key={`${String(k)}-${String(i)}`}
                            cx={cx + Math.cos(a) * dist * r}
                            cy={cy + Math.sin(a) * dist * r}
                            r={size * r}
                            fill={colour}
                            stroke="#8f2d00"
                            strokeOpacity="0.45"
                            strokeWidth={r * 0.03}
                        />
                    );
                }),
            )}
            <circle cx={cx} cy={cy} r={r * 1.05} fill={`url(#${id}-ball)`} />
        </g>
    );
}

interface LeafAt {
    id: string;
    x: number;
    y: number;
    angle: number;
    len: number;
}

// A long mango leaf with a lit half, a shaded half and a pale midrib.
function MangoLeaf({ id, x, y, angle, len }: LeafAt) {
    const l = len;
    const top = `M0 0 C${String(l * 0.25)} ${String(-l * 0.17)} ${String(l * 0.7)} ${String(-l * 0.15)} ${String(l)} 0`;
    return (
        <g transform={`translate(${String(x)} ${String(y)}) rotate(${String(angle)})`}>
            <path
                d={`${top} C${String(l * 0.7)} ${String(l * 0.11)} ${String(l * 0.25)} ${String(l * 0.14)} 0 0 Z`}
                fill={`url(#${id}-leaf)`}
            />
            <path
                d={`${top} Q${String(l / 2)} ${String(-l * 0.01)} 0 0 Z`}
                fill="#0b2e0f"
                opacity="0.28"
            />
            <path
                d={`M0 0 Q${String(l / 2)} ${String(-l * 0.01)} ${String(l)} 0`}
                fill="none"
                stroke="#b9dd9a"
                strokeWidth="0.6"
                opacity="0.75"
            />
        </g>
    );
}

const petals: [number, number, number][] = [
    [27, 67, -20],
    [77, 69, 30],
    [99, 66, 70],
    [72, 59, -50],
    [48, 70, 110],
];

export function Haldi({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-brass`} x1="0" x2="1">
                    <BrassStops />
                </linearGradient>
                <linearGradient id={`${id}-depth`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0.35" stopColor="#2a1800" stopOpacity="0" />
                    <stop offset="1" stopColor="#2a1800" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id={`${id}-inner`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#3d2805" />
                    <stop offset="1" stopColor="#c08f34" />
                </linearGradient>
                <radialGradient id={`${id}-paste`} cx="0.38" cy="0.25" r="0.8">
                    <stop offset="0" stopColor="#fff6b0" />
                    <stop offset="0.25" stopColor="#ffd84a" />
                    <stop offset="0.62" stopColor="#f5a800" />
                    <stop offset="1" stopColor="#b85f00" />
                </radialGradient>
                <radialGradient id={`${id}-ball`} cx="0.35" cy="0.3" r="0.7">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
                    <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#4a1200" stopOpacity="0.5" />
                </radialGradient>
                <linearGradient id={`${id}-leaf`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#5fae45" />
                    <stop offset="1" stopColor="#1d4d1a" />
                </linearGradient>
                <radialGradient id={`${id}-petal`} cx="0.4" cy="0.35" r="0.7">
                    <stop offset="0" stopColor="#ff6b7d" />
                    <stop offset="0.6" stopColor="#d01a3c" />
                    <stop offset="1" stopColor="#7a0620" />
                </radialGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={121} rx={42} ry={5} />
            {/* Mango leaves fanned behind the urli */}
            <MangoLeaf id={id} x={30} y={64} angle={-158} len={28} />
            <MangoLeaf id={id} x={34} y={60} angle={-128} len={30} />
            <MangoLeaf id={id} x={88} y={60} angle={-50} len={30} />
            <MangoLeaf id={id} x={92} y={64} angle={-20} len={28} />
            {/* Foot and body */}
            <path
                d="M42 106 C42 112 38 115 35 118 Q60 124 85 118 C82 115 78 112 78 106 Z"
                fill={`url(#${id}-brass)`}
            />
            <ellipse cx="60" cy="118.5" rx="25" ry="3.2" fill={`url(#${id}-brass)`} />
            <path
                d="M8 70 C9 92 32 110 60 110 C88 110 111 92 112 70 Z"
                fill={`url(#${id}-brass)`}
            />
            <path
                d="M8 70 C9 92 32 110 60 110 C88 110 111 92 112 70 Z"
                fill={`url(#${id}-depth)`}
            />
            <path d="M15 86 C32 99 88 99 105 86" fill="none" stroke="#5c3c08" strokeWidth="0.8" />
            <path
                d="M15 87.4 C32 100.4 88 100.4 105 87.4"
                fill="none"
                stroke="#fff1c2"
                strokeWidth="0.5"
                opacity="0.5"
            />
            {Array.from({ length: 13 }, (_, i) => {
                const t = (i + 0.5) / 13;
                const x = 20 + t * 80;
                const y = 92 + Math.sin(t * Math.PI) * 8;
                return (
                    <path
                        key={i}
                        d={`M${String(x - 2.6)} ${String(y)} Q${String(x)} ${String(y - 6)} ${String(x + 2.6)} ${String(y)}`}
                        fill="none"
                        stroke="#5c3c08"
                        strokeWidth="0.6"
                        opacity="0.7"
                    />
                );
            })}
            <path
                d="M22 80 C25 92 34 101 46 106"
                fill="none"
                stroke="#fffbe8"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.45"
            />
            <path
                d="M92 100 C99 95 104 88 106 80"
                fill="none"
                stroke="#ffe39a"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.5"
            />
            {/* Rim, inner wall, then the paste brimming over it */}
            <ellipse cx="60" cy="70" rx="52" ry="12" fill={`url(#${id}-brass)`} />
            <ellipse cx="60" cy="70" rx="47.5" ry="9.5" fill={`url(#${id}-inner)`} />
            <path
                d="M13 71 C16 62 30 55 46 54 C54 50 70 50 78 54 C94 55 106 63 107 71 C90 79 30 79 13 71 Z"
                fill={`url(#${id}-paste)`}
            />
            <path
                d="M28 66 C40 60 56 62 66 58 C76 55 88 60 97 65"
                fill="none"
                stroke="#c46f00"
                strokeWidth="1.3"
                opacity="0.45"
            />
            <path
                d="M28 65 C40 59 56 61 66 57 C76 54 88 59 97 64"
                fill="none"
                stroke="#fff3a0"
                strokeWidth="0.9"
                opacity="0.8"
            />
            <path
                d="M20 71 C34 68 46 72 58 69 C70 66 84 70 100 70"
                fill="none"
                stroke="#fff3a0"
                strokeWidth="0.8"
                opacity="0.6"
            />
            <ellipse
                cx="38"
                cy="59"
                rx="7"
                ry="1.8"
                fill="#fff"
                opacity="0.6"
                transform="rotate(-14 38 59)"
            />
            <path
                d="M8 70 A52 12 0 0 0 112 70 L107.5 70 A47.5 9.5 0 0 1 12.5 70 Z"
                fill={`url(#${id}-brass)`}
            />
            <path d="M68 79 C68 84 70 87 72 87 C74 87 75 84 75 79 Z" fill={`url(#${id}-paste)`} />
            <path
                d="M10 73 A52 12 0 0 0 60 82"
                fill="none"
                stroke="#fff6d8"
                strokeWidth="0.9"
                opacity="0.85"
            />
            {/* Rose petals and marigolds afloat */}
            {petals.map(([x, y, a]) => (
                <path
                    key={`${String(x)}-${String(y)}`}
                    d="M0 -2.6 C1.6 -4.4 4.6 -3.4 4.2 0 C3.8 2.8 1.4 3.8 0 3.8 C-1.4 3.8 -3.8 2.8 -4.2 0 C-4.6 -3.4 -1.6 -4.4 0 -2.6 Z"
                    fill={`url(#${id}-petal)`}
                    stroke="#ff9aa8"
                    strokeWidth="0.3"
                    transform={`translate(${String(x)} ${String(y)}) rotate(${String(a)}) scale(1.05 0.62)`}
                />
            ))}
            <Marigold id={id} cx={56} cy={67} r={6} />
            <Marigold id={id} cx={39} cy={58} r={8.5} />
            <Marigold id={id} cx={86} cy={60} r={7.5} />
            <Marigold id={id} cx={64} cy={52} r={9.5} />
            <Sparkle x={24} y={77} size={2.6} />
            <Sparkle x={98} y={79} size={1.8} />
        </g>
    );
}
