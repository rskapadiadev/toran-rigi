import { type Art, BrassStops, ContactShadow, gilt, Marigold, Sparkle } from './kit';

// Engraved petals round the plate's well, placed on the ellipse so they follow the perspective.
const petals = Array.from({ length: 22 }, (_, i) => (i / 22) * Math.PI * 2);

interface BowlProps {
    id: string;
    x: number;
    y: number;
    fill: string;
    grain: string;
}

// A small brass katori heaped with powder or rice.
function Katori({ id, x, y, fill, grain }: BowlProps) {
    return (
        <g transform={`translate(${String(x)} ${String(y)})`}>
            <ellipse cx="0" cy="6.5" rx="11" ry="3" fill="#2e1c03" opacity="0.35" />
            <path d="M-11 0 C-10 7 10 7 11 0 Z" fill={`url(#${id}-bowl)`} />
            <ellipse cx="0" cy="0" rx="11" ry="3.6" fill={`url(#${id}-rim)`} />
            <ellipse cx="0" cy="0.2" rx="9.4" ry="2.8" fill="#3d2705" />
            <path d="M-9 0.3 C-7 -6 7 -6 9 0.3 C6 2.6 -6 2.6 -9 0.3 Z" fill={fill} />
            <path d="M-6 -1.5 C-4 -4.6 2 -4.8 4 -2.8" fill="none" stroke="#ffffff" opacity="0.3" />
            <path
                d="M-5 -0.5 l1.4 -0.4 M-1 -2.4 l1.4 0.3 M3 -1 l1.2 -0.6 M0 0.6 l1.3 0.2 M-3 -3 l1 -0.5 M5.5 0 l1 0.4"
                stroke={grain}
                strokeWidth="0.8"
                strokeLinecap="round"
            />
            <path d="M-9 4 Q-7 6 -3 6.4" fill="none" stroke="#fff3c4" strokeWidth="0.8" />
        </g>
    );
}

export function Thali({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-rim`} x1="0" x2="1">
                    <BrassStops />
                </linearGradient>
                <linearGradient id={`${id}-bowl`} x1="0" x2="1" y1="0" y2="0.4">
                    <BrassStops />
                </linearGradient>
                <radialGradient id={`${id}-well`} cx="0.42" cy="0.3" r="0.75">
                    <stop offset="0" stopColor="#fff2c4" />
                    <stop offset="0.3" stopColor="#e2b452" />
                    <stop offset="0.75" stopColor="#9a6a1a" />
                    <stop offset="1" stopColor="#5e3d08" />
                </radialGradient>
                <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.85" />
                    <stop offset="0.35" stopColor="#ffb547" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#ff8a00" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`${id}-flame`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0" stopColor="#ffb300" />
                    <stop offset="0.5" stopColor="#ff8f00" />
                    <stop offset="1" stopColor="#e64a19" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id={`${id}-core`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.6" stopColor="#fff3b0" />
                    <stop offset="1" stopColor="#ffd54f" />
                </linearGradient>
                <radialGradient id={`${id}-shade`} cx="0.35" cy="0.3" r="0.75">
                    <stop offset="0.5" stopColor="#3a1300" stopOpacity="0" />
                    <stop offset="1" stopColor="#3a1300" stopOpacity="0.45" />
                </radialGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={121} rx={54} ry={5} />

            {/* The plate: underside, rim, polished well */}
            <ellipse cx="60" cy="101" rx="55" ry="20.5" fill="#4a3108" />
            <ellipse cx="60" cy="98" rx="55" ry="20.5" fill={`url(#${id}-rim)`} />
            <path
                d="M8 100 Q60 128 112 100"
                fill="none"
                stroke="#fff3c4"
                strokeWidth="0.7"
                opacity="0.6"
            />
            <ellipse cx="60" cy="98" rx="47" ry="16" fill="#6a460c" />
            <ellipse cx="60" cy="98.8" rx="46" ry="15.2" fill={`url(#${id}-well)`} />
            <ellipse
                cx="60"
                cy="98.8"
                rx="38"
                ry="12"
                fill="none"
                stroke="#7a4f12"
                strokeWidth="0.6"
                opacity="0.7"
            />
            {petals.map((t) => {
                const x = 60 + 42 * Math.cos(t);
                const y = 98.8 + 13.6 * Math.sin(t);
                return (
                    <ellipse
                        key={t}
                        cx={x}
                        cy={y}
                        rx="2.4"
                        ry="1"
                        fill="none"
                        stroke="#6a460c"
                        strokeWidth="0.5"
                        opacity="0.75"
                        transform={`rotate(${String((t * 180) / Math.PI + 90)} ${String(x)} ${String(y)})`}
                    />
                );
            })}
            <ellipse cx="44" cy="92" rx="18" ry="4" fill="#ffffff" opacity="0.22" />

            {/* A small brass bell standing at the back */}
            <g transform="translate(27 80) scale(1.3)">
                <path d="M0 -14 v-4" stroke={gilt} strokeWidth="1.6" />
                <circle cx="0" cy="-19.5" r="2.2" fill={`url(#${id}-rim)`} />
                <path d="M-3 -12 C-3 -15 3 -15 3 -12 Z" fill={`url(#${id}-rim)`} />
                <path
                    d="M-3 -12 C-4 -6 -7 2 -9 6 C-4 8.5 4 8.5 9 6 C7 2 4 -6 3 -12 Z"
                    fill={`url(#${id}-bowl)`}
                />
                <ellipse cx="0" cy="6" rx="9" ry="2.2" fill="#4a3108" />
                <path d="M-1.6 -9 C-2.8 -4 -4.4 0 -5.6 4" stroke="#fff6d8" opacity="0.6" />
                <circle cx="1" cy="7.6" r="1.3" fill="#7a4f12" />
            </g>

            {/* The lit brass diya at the centre */}
            <circle cx="78" cy="52" r="38" fill={`url(#${id}-glow)`} />
            <g transform="translate(56 87) scale(1.3)">
                <ellipse cx="0" cy="4" rx="9" ry="2" fill="#2e1c03" opacity="0.4" />
                <path d="M-5 0 L5 0 L7 4 L-7 4 Z" fill={`url(#${id}-bowl)`} />
                <path d="M-15 -6 C-13 2 13 2 15 -6 L21 -9 L14 -5 Z" fill={`url(#${id}-bowl)`} />
                <path d="M-15 -6 C-13 2 13 2 15 -6 Z" fill={`url(#${id}-bowl)`} />
                <ellipse cx="0" cy="-6" rx="15" ry="3.6" fill={`url(#${id}-rim)`} />
                <ellipse cx="0" cy="-5.8" rx="12.4" ry="2.6" fill="#5a3505" />
                <ellipse cx="2" cy="-6" rx="5" ry="1" fill="#ffd36b" opacity="0.7" />
                <path d="M-10 -2 Q-6 0.5 0 1" fill="none" stroke="#fff6d8" opacity="0.6" />
                <path
                    d="M14 -6 L18 -8.6"
                    stroke="#f5efe0"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                />
            </g>
            <g transform="translate(78 76) scale(1.25)">
                <ellipse cx="0" cy="-10" rx="5" ry="10" fill="#ff9800" opacity="0.35" />
                <path
                    d="M0 -26 C3 -18 6.5 -11 6 -5 C5.5 -1 3 1 0 1 C-3 1 -5.5 -1 -6 -5 C-6.5 -11 -3 -18 0 -26 Z"
                    fill={`url(#${id}-flame)`}
                />
                <path
                    d="M0 -17 C2 -11 3.6 -7 3.4 -3.6 C3.2 -1 1.6 0 0 0 C-1.6 0 -3.2 -1 -3.4 -3.6 C-3.6 -7 -2 -11 0 -17 Z"
                    fill={`url(#${id}-core)`}
                />
                <ellipse cx="0" cy="-0.6" rx="1.8" ry="1.2" fill="#3949ab" opacity="0.5" />
                <path d="M0 0.4 v1.8" stroke="#2b1a0a" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            <Katori id={id} x={31} y={98} fill="#c4161c" grain="#7d0a0e" />
            <Katori id={id} x={89} y={99} fill="#fbf4e2" grain="#d9c9a3" />

            {/* Marigolds and loose petals at the front */}
            {(
                [
                    [44, 108, 7.5],
                    [60, 111, 8],
                    [76, 108, 7],
                ] as const
            ).map(([x, y, r]) => (
                <g key={x}>
                    <ellipse
                        cx={x}
                        cy={y + r * 0.7}
                        rx={r}
                        ry={r * 0.35}
                        fill="#2e1c03"
                        opacity="0.35"
                    />
                    <Marigold cx={x} cy={y} r={r} />
                    <circle cx={x} cy={y} r={r} fill={`url(#${id}-shade)`} />
                </g>
            ))}
            <path
                d="M28 110 l2 -1.2 M94 110 l1.8 1 M34 116 l1.6 -0.8"
                stroke="#ff9800"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <Sparkle x={22} y={92} size={3.2} />
            <Sparkle x={100} y={104} size={2.4} />
        </g>
    );
}
