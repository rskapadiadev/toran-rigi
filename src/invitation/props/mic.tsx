import { type Art, ContactShadow, gilt, GoldStops, SilverStops, Sparkle } from './kit';

// Leaves along one laurel branch, bottom to top: position, angle and size.
const LAUREL = [
    [40, 108, -150, 1],
    [32, 102, -130, 1.05],
    [26, 94, -115, 1.05],
    [21, 84, -105, 1],
    [18, 73, -95, 0.95],
    [17, 62, -85, 0.9],
    [18, 51, -75, 0.85],
    [21, 41, -60, 0.8],
];

interface BranchProps {
    id: string;
    mirror: boolean;
}

// One side of the laurel wreath; the other side is its mirror image.
function Branch({ id, mirror }: BranchProps) {
    return (
        <g transform={mirror ? 'matrix(-1 0 0 1 120 0)' : undefined}>
            <path
                d="M50 114 C30 106 16 88 16 66 C16 54 19 44 24 36"
                fill="none"
                stroke="#8a6420"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
            {LAUREL.map(([x = 0, y = 0, a = 0, s = 1], i) => (
                <g key={y}>
                    {[-1, 1].map((side) => (
                        <g
                            key={side}
                            transform={`translate(${String(x)} ${String(y)}) rotate(${String(a + side * 32)}) scale(${String(s)})`}
                        >
                            <path
                                d="M0 0 C3 -3.2 9 -3.4 12 0 C9 3.2 3 3.2 0 0 Z"
                                fill={`url(#${id}-${(i + side) % 2 ? 'leaf' : 'leafb'})`}
                            />
                            <path
                                d="M0.8 0 Q6 -0.4 11 0"
                                fill="none"
                                stroke="#fff1c2"
                                strokeWidth="0.35"
                                opacity="0.8"
                            />
                        </g>
                    ))}
                </g>
            ))}
        </g>
    );
}

export function Mic({ id }: Art) {
    const slots = Array.from({ length: 13 }, (_, i) => 16 + i * 3.6);
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-gold`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="0" y2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-leafb`} x1="0" y1="1" x2="0" y2="0">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-chrome`} x1="0" x2="1">
                    <SilverStops />
                </linearGradient>
                <radialGradient id={`${id}-dome`} cx="0.36" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.35" stopColor="#d3d8df" />
                    <stop offset="0.75" stopColor="#7d838c" />
                    <stop offset="1" stopColor="#383c42" />
                </radialGradient>
                <clipPath id={`${id}-head`}>
                    <ellipse cx="60" cy="37" rx="17" ry="26" />
                </clipPath>
                <linearGradient id={`${id}-ribbon`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#c2264a" />
                    <stop offset="1" stopColor="#5e0a20" />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={123} rx={36} ry={4} />
            <Branch id={id} mirror={false} />
            <Branch id={id} mirror />
            {/* Ribbon binding the wreath */}
            <path d="M48 110 Q60 118 72 110 L74 116 Q60 124 46 116 Z" fill={`url(#${id}-ribbon)`} />
            <path d="M48 111.5 Q60 119 72 111.5" fill="none" stroke="#f07a95" strokeWidth="0.6" />
            {/* Stand: weighted base and column */}
            <ellipse cx="60" cy="119" rx="20" ry="5" fill={`url(#${id}-gold)`} />
            <ellipse cx="60" cy="116.6" rx="16" ry="3.8" fill={`url(#${id}-chrome)`} />
            <ellipse cx="60" cy="115.6" rx="12" ry="2.4" fill="#f4f6f9" opacity="0.6" />
            <path d="M57.6 80 L62.4 80 L63 115 L57 115 Z" fill={`url(#${id}-chrome)`} />
            <path d="M56 96 L64 96 L64 100 L56 100 Z" fill={`url(#${id}-gold)`} />
            <path d="M55 110 L65 110 L66 114 L54 114 Z" fill={`url(#${id}-gold)`} />
            {/* Yoke and swivel knobs */}
            <path
                d="M41 40 C40 64 48 74 60 76 C72 74 80 64 79 40"
                fill="none"
                stroke="#5a3a0c"
                strokeWidth="4.6"
                strokeLinecap="round"
            />
            <path
                d="M41 40 C40 64 48 74 60 76 C72 74 80 64 79 40"
                fill="none"
                stroke={`url(#${id}-gold)`}
                strokeWidth="3.2"
                strokeLinecap="round"
            />
            <rect x="55" y="74" width="10" height="7" rx="2" fill={`url(#${id}-gold)`} />
            {/* Capsule: chrome dome cut with horizontal slots, a gold spine and gold rim */}
            <ellipse cx="60" cy="37" rx="17" ry="26" fill={`url(#${id}-dome)`} />
            <g clipPath={`url(#${id}-head)`}>
                {slots.map((y) => {
                    const bow = String(y + (y - 37) * 0.08);
                    return (
                        <path
                            key={y}
                            d={`M42 ${String(y)} Q51 ${bow} 57.6 ${bow} M62.4 ${bow} Q69 ${bow} 78 ${String(y)}`}
                            fill="none"
                            stroke="#2b2e33"
                            strokeWidth="1.5"
                            opacity="0.75"
                        />
                    );
                })}
                <path
                    d="M50 14 C44 22 43 34 45 46"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.35"
                />
                <rect x="56.6" y="10" width="6.8" height="56" fill={`url(#${id}-gold)`} />
                <path d="M58.4 12 L58.4 62" stroke="#fff6d6" strokeWidth="0.6" opacity="0.8" />
            </g>
            <ellipse
                cx="60"
                cy="37"
                rx="17"
                ry="26"
                fill="none"
                stroke={`url(#${id}-gold)`}
                strokeWidth="2.6"
            />
            <ellipse
                cx="60"
                cy="37"
                rx="15.6"
                ry="24.6"
                fill="none"
                stroke="#5a3a0c"
                strokeWidth="0.5"
                opacity="0.7"
            />
            {[
                [41, 40],
                [79, 40],
            ].map(([kx = 0, ky = 0]) => (
                <g key={kx}>
                    <circle cx={kx} cy={ky} r="4" fill={`url(#${id}-gold)`} />
                    <circle cx={kx} cy={ky} r="2.2" fill={`url(#${id}-chrome)`} />
                    <circle cx={kx - 0.8} cy={ky - 0.8} r="0.7" fill="#ffffff" />
                </g>
            ))}
            <path d="M60 80 V82" stroke={gilt} strokeWidth="1" />
            <Sparkle x={49} y={18} size={3.2} />
            <Sparkle x={24} y={36} size={1.8} />
        </g>
    );
}
