import { type Art, ContactShadow, Sparkle } from './kit';

// Bowl of a tulip flute in local space: the foot sits at the origin, the rim 100 units up.
const BOWL =
    'M-9.6 -100 C-10.2 -80 -8.2 -58 -4.2 -47 Q0 -40.5 4.2 -47 C8.2 -58 10.2 -80 9.6 -100 Z';

interface FluteProps {
    id: string;
    x: number;
    angle: number;
    bubbles: number[][];
}

function Flute({ id, x, angle, bubbles }: FluteProps) {
    return (
        <g transform={`translate(${String(x)} 121) rotate(${String(angle)})`}>
            {/* Foot and stem */}
            <ellipse cx="0" cy="-2.5" rx="13" ry="3.4" fill={`url(#${id}-foot)`} />
            <path
                d="M-12.6 -2.2 Q0 1.6 12.6 -2.2"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.7"
                opacity="0.9"
            />
            <path d="M-1.6 -42 L-1.1 -4.5 Q0 -3.4 1.1 -4.5 L1.6 -42 Z" fill={`url(#${id}-stem)`} />
            <path d="M-4 -4.6 Q0 -7 4 -4.6 Q0 -3.2 -4 -4.6 Z" fill="#dfe8f0" opacity="0.9" />
            <ellipse cx="0" cy="-41.5" rx="2.4" ry="1.4" fill="#e8f0f7" opacity="0.9" />
            {/* Champagne */}
            <g clipPath={`url(#${id}-bowl)`}>
                <rect x="-11" y="-88" width="22" height="50" fill={`url(#${id}-wine)`} />
                <rect x="-11" y="-88" width="22" height="50" fill={`url(#${id}-depth)`} />
                <ellipse cx="0" cy="-88" rx="10" ry="1.6" fill="#fff6d2" />
                <ellipse cx="0" cy="-88.6" rx="9.6" ry="1" fill="#ffffff" opacity="0.8" />
                {bubbles.map(([bx = 0, by = 0, br = 0.6]) => (
                    <circle
                        key={`${String(bx)}-${String(by)}`}
                        cx={bx}
                        cy={by}
                        r={br}
                        fill="#fffbe8"
                        fillOpacity="0.55"
                        stroke="#ffffff"
                        strokeWidth="0.25"
                    />
                ))}
            </g>
            {/* Glass: tint, edge refraction, highlights, rim */}
            <path d={BOWL} fill={`url(#${id}-glass)`} />
            <path d={BOWL} fill="none" stroke="#5f6e7d" strokeOpacity="0.45" strokeWidth="1.1" />
            <path
                d="M-3.6 -46 Q0 -38 3.6 -46 L2 -41 Q0 -38.6 -2 -41 Z"
                fill="#eef4f9"
                opacity="0.9"
            />
            <path d={BOWL} fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="0.6" />
            <path
                d="M8.2 -96 C8.8 -78 7 -60 3.6 -49"
                fill="none"
                stroke="#6f7f8f"
                strokeWidth="0.6"
                opacity="0.45"
            />
            <path
                d="M-7 -95 C-7.6 -80 -6.4 -64 -3.6 -52"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.75"
            />
            <path
                d="M-4.4 -94 C-4.8 -84 -4.4 -74 -3.6 -68"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.6"
            />
            <path
                d="M6.4 -92 C6.8 -84 6.6 -76 5.8 -70"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.9"
                strokeLinecap="round"
                opacity="0.45"
            />
            <ellipse
                cx="0"
                cy="-100"
                rx="9.6"
                ry="1.7"
                fill="#ffffff"
                fillOpacity="0.15"
                stroke="#ffffff"
                strokeWidth="0.7"
            />
            <path
                d="M-9.4 -99.6 Q0 -97.6 9.4 -99.6"
                fill="none"
                stroke="#9aa7b4"
                strokeWidth="0.4"
                opacity="0.7"
            />
        </g>
    );
}

const LEFT_BUBBLES = [
    [-1, -46, 0.7],
    [-1.4, -52, 0.6],
    [-0.8, -58, 0.8],
    [-1.6, -65, 0.6],
    [-1, -72, 0.9],
    [-1.8, -80, 0.7],
    [3, -55, 0.5],
    [3.6, -64, 0.7],
    [3.2, -74, 0.6],
    [4.2, -83, 0.8],
    [-5, -70, 0.5],
    [-5.6, -84, 0.6],
];
const RIGHT_BUBBLES = [
    [1, -48, 0.6],
    [1.4, -54, 0.8],
    [0.8, -61, 0.6],
    [1.6, -68, 0.9],
    [1, -76, 0.7],
    [1.8, -84, 0.6],
    [-3, -58, 0.6],
    [-3.6, -67, 0.8],
    [-3.2, -78, 0.6],
    [5, -72, 0.5],
    [5.4, -83, 0.7],
];

export function Flutes({ id }: Art) {
    return (
        <g>
            <defs>
                <clipPath id={`${id}-bowl`}>
                    <path d={BOWL} />
                </clipPath>
                <linearGradient id={`${id}-glass`} x1="0" x2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
                    <stop offset="0.25" stopColor="#eaf3fb" stopOpacity="0.12" />
                    <stop offset="0.7" stopColor="#dbe7f2" stopOpacity="0.08" />
                    <stop offset="1" stopColor="#c3d2e0" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient id={`${id}-wine`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fbe7a4" />
                    <stop offset="0.5" stopColor="#eec463" />
                    <stop offset="1" stopColor="#c98f2a" />
                </linearGradient>
                <linearGradient id={`${id}-depth`} x1="0" x2="1">
                    <stop offset="0" stopColor="#fff8dc" stopOpacity="0.55" />
                    <stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="0.75" stopColor="#8a5a10" stopOpacity="0.05" />
                    <stop offset="1" stopColor="#7a4a08" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient id={`${id}-stem`} x1="0" x2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.45" stopColor="#cfdbe6" />
                    <stop offset="1" stopColor="#8796a6" />
                </linearGradient>
                <radialGradient id={`${id}-foot`} cx="0.4" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="0.6" stopColor="#d6e2ec" stopOpacity="0.7" />
                    <stop offset="1" stopColor="#8a9aab" stopOpacity="0.8" />
                </radialGradient>
                <linearGradient id={`${id}-satin`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#e0577a" />
                    <stop offset="0.45" stopColor="#a3123f" />
                    <stop offset="1" stopColor="#5c0721" />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={122} rx={46} ry={4} />
            <Flute id={id} x={33} angle={13} bubbles={LEFT_BUBBLES} />
            <Flute id={id} x={87} angle={-13} bubbles={RIGHT_BUBBLES} />
            {/* Satin bow on the left stem */}
            <path d="M40 92 C32 86 26 88 27 93 C28 98 35 97 40 94 Z" fill={`url(#${id}-satin)`} />
            <path d="M42 93 C49 87 56 89 55 94 C54 99 47 98 42 95 Z" fill={`url(#${id}-satin)`} />
            <path
                d="M40 94 C36 100 33 106 29 110 L33 111 C36 106 39 101 41 96 Z"
                fill={`url(#${id}-satin)`}
            />
            <path
                d="M42 95 C44 101 47 106 52 109 L49 111 C45 107 43 102 41.5 96 Z"
                fill="#7d0b2c"
            />
            <path
                d="M29 91 C31 89 35 89 38 92 M44 91 C47 89 51 89 53 91.5"
                fill="none"
                stroke="#ffd1dc"
                strokeWidth="0.7"
                strokeLinecap="round"
                opacity="0.8"
            />
            <ellipse cx="41" cy="94" rx="2.4" ry="2.1" fill="#8e0f35" />
            <ellipse cx="40.4" cy="93.3" rx="0.9" ry="0.6" fill="#f28aa4" />
            {/* The clink: a burst of fizz where the rims meet */}
            <g transform="translate(0 7)">
                <g fill="#fff1c2">
                    <circle cx="56" cy="8" r="1.1" />
                    <circle cx="64.5" cy="6.5" r="0.9" />
                    <circle cx="52" cy="13" r="0.7" />
                    <circle cx="68" cy="12" r="0.8" />
                    <circle cx="60" cy="3.5" r="0.8" />
                    <circle cx="49" cy="6" r="0.5" />
                    <circle cx="71" cy="5" r="0.6" />
                </g>
                <path
                    d="M57 15 Q54 10 51 9 M63 15 Q66 10 69.5 9 M60 14 Q60 10 60 7"
                    fill="none"
                    stroke="#fff4cf"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                />
                <Sparkle x={60} y={15} size={6} />
                <Sparkle x={47} y={18} size={2} />
                <Sparkle x={74} y={17} size={2.4} />
            </g>
        </g>
    );
}
