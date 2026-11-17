import { type Art, ContactShadow } from './kit';

// The painted band runs round the outside wall, so its marks are placed on the wall's ellipse.
const band = Array.from({ length: 13 }, (_, i) => 0.18 + (i / 12) * (Math.PI - 0.36));

function wall(t: number, cy: number): [number, number] {
    return [60 + 41 * Math.cos(t), cy + 13 * Math.sin(t)];
}

export function Diya({ id }: Art) {
    return (
        <g>
            <defs>
                <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#fff2b8" stopOpacity="0.9" />
                    <stop offset="0.25" stopColor="#ffc24d" stopOpacity="0.45" />
                    <stop offset="0.6" stopColor="#ff8a00" stopOpacity="0.14" />
                    <stop offset="1" stopColor="#ff6a00" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`${id}-flame`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0" stopColor="#ffcc33" />
                    <stop offset="0.45" stopColor="#ff9a1a" />
                    <stop offset="0.85" stopColor="#f0561c" stopOpacity="0.85" />
                    <stop offset="1" stopColor="#d84315" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id={`${id}-core`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.55" stopColor="#fff8d6" />
                    <stop offset="1" stopColor="#ffe082" />
                </linearGradient>
                <radialGradient id={`${id}-clay`} cx="0.32" cy="0.15" r="0.95">
                    <stop offset="0" stopColor="#e9935a" />
                    <stop offset="0.35" stopColor="#bd5f2c" />
                    <stop offset="0.75" stopColor="#7e3415" />
                    <stop offset="1" stopColor="#4a1d0a" />
                </radialGradient>
                <linearGradient id={`${id}-lip`} x1="0" x2="1">
                    <stop offset="0" stopColor="#8c3c18" />
                    <stop offset="0.35" stopColor="#e8a06a" />
                    <stop offset="0.6" stopColor="#f6c08c" />
                    <stop offset="1" stopColor="#7a3214" />
                </linearGradient>
                <radialGradient id={`${id}-oil`} cx="0.5" cy="0.75" r="0.7">
                    <stop offset="0" stopColor="#ffd56b" />
                    <stop offset="0.3" stopColor="#c27d16" />
                    <stop offset="1" stopColor="#3a1d04" />
                </radialGradient>
                <pattern id={`${id}-grain`} width="4" height="3.4" patternUnits="userSpaceOnUse">
                    <circle cx="0.8" cy="0.9" r="0.35" fill="#2a0e04" opacity="0.35" />
                    <circle cx="2.9" cy="2.4" r="0.3" fill="#ffd2a8" opacity="0.3" />
                </pattern>
                <clipPath id={`${id}-body`}>
                    <path d="M18 80 C18 102 36 114 60 114 C84 114 102 102 102 80 Z" />
                </clipPath>
            </defs>
            <circle cx="60" cy="58" r="56" fill={`url(#${id}-halo)`} />
            <ContactShadow id={id} cx={60} cy={121} rx={36} ry={4.5} />

            {/* Foot ring and the clay bowl */}
            <path d="M44 110 L76 110 L74 120 L46 120 Z" fill="#6a2a10" />
            <ellipse cx="60" cy="120" rx="14" ry="2.4" fill="#3d1606" />
            <path
                d="M18 80 C18 102 36 114 60 114 C84 114 102 102 102 80 Z"
                fill={`url(#${id}-clay)`}
            />
            <g clipPath={`url(#${id}-body)`}>
                <rect x="16" y="78" width="88" height="40" fill={`url(#${id}-grain)`} />
                <path
                    d="M19 84 C24 100 40 110 60 111"
                    fill="none"
                    stroke="#ffc38f"
                    strokeWidth="3"
                    opacity="0.35"
                />
                <path
                    d="M101 84 C98 98 86 108 72 112"
                    fill="none"
                    stroke="#ff9a4a"
                    strokeWidth="1.6"
                    opacity="0.4"
                />
                {/* Painted band: a red stripe edged in white, with white dots and yellow petals */}
                <path
                    d="M18.6 88 C28 101 92 101 101.4 88"
                    fill="none"
                    stroke="#a3161b"
                    strokeWidth="5.5"
                />
                <path
                    d="M18.4 84.8 C28 97.8 92 97.8 101.6 84.8 M19.2 91.4 C28 104.4 92 104.4 100.8 91.4"
                    fill="none"
                    stroke="#fbeedd"
                    strokeWidth="0.9"
                />
                {band.map((t) => {
                    const [x, y] = wall(t, 84.6);
                    return (
                        <g key={t}>
                            <circle cx={x} cy={y} r="1" fill="#fff6e6" />
                            <path
                                d={`M${String(x)} ${String(y + 5)} q2 3 0 6 q-2 -3 0 -6 Z`}
                                fill="#f6b300"
                            />
                        </g>
                    );
                })}
            </g>

            {/* Rim, the pool of ghee and the pinched spout facing us */}
            <ellipse cx="60" cy="80" rx="42" ry="12.5" fill={`url(#${id}-lip)`} />
            <ellipse cx="60" cy="79.5" rx="37.5" ry="9.6" fill="#5a240c" />
            <ellipse cx="60" cy="80.6" rx="36" ry="8.4" fill={`url(#${id}-oil)`} />
            <ellipse cx="60" cy="83" rx="9" ry="2.2" fill="#fff1b0" opacity="0.65" />
            <path
                d="M22 76 C30 70 50 68 60 68"
                fill="none"
                stroke="#fff1c2"
                strokeWidth="0.9"
                opacity="0.55"
            />
            <path
                d="M50 90 C54 92.5 66 92.5 70 90 L63.5 98 C61.5 99.6 58.5 99.6 56.5 98 Z"
                fill={`url(#${id}-lip)`}
            />
            <path d="M53.5 91.6 Q60 94 66.5 91.6 L61.5 96.6 Q60 97.4 58.5 96.6 Z" fill="#5a240c" />
            <path
                d="M60 86 C60 90 60 93 60 95.5"
                stroke="#f6eedb"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <path d="M60 94.5 v1.8" stroke="#1d0f05" strokeWidth="2.2" strokeLinecap="round" />

            {/* The flame: halo, licking outer flame, bright core, a blue root at the wick */}
            <ellipse cx="60" cy="72" rx="12" ry="22" fill="#ffb02e" opacity="0.28" />
            <path
                d="M60 36 C63 45 69 55 69.5 66 C70 76 66 92 60 93.5 C54 92 50 76 50.5 64 C51 53 56 44 58.5 38 C59 36 59.6 33 60 30 Z"
                fill={`url(#${id}-flame)`}
            />
            <path
                d="M60.5 54 C63 61 65.5 66 65 74 C64.5 84 62.5 90 60 91 C57.5 90 55.5 84 55 74 C54.6 66 57.4 57 60.5 48 Z"
                fill={`url(#${id}-core)`}
            />
            <path
                d="M58 70 C58 78 58.6 85 60 88"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.7"
            />
            <ellipse cx="60" cy="91" rx="3" ry="2.6" fill="#3d5afe" opacity="0.45" />
            <ellipse cx="60" cy="92" rx="1.4" ry="1.4" fill="#1a1a2e" opacity="0.6" />
        </g>
    );
}
