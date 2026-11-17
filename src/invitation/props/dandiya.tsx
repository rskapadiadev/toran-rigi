import { type Art, ContactShadow, GoldStops, SilverStops, Sparkle } from './kit';

interface StickProps {
    id: string;
    angle: number;
    tone: 'a' | 'b';
}

// One lacquered stick: spiral stripes, a turned gold cap and mirror-work set into the wood.
function Stick({ id, angle, tone }: StickProps) {
    const shaft = 'M-5.2 -48 L5.2 -48 L5.2 48 L-5.2 48 Z';
    return (
        <g transform={`rotate(${String(angle)} 60 58) translate(60 58) scale(0.8)`}>
            <path d={shaft} fill={`url(#${id}-base-${tone})`} />
            <path d={shaft} fill={`url(#${id}-spiral-${tone})`} />
            <path d={shaft} fill={`url(#${id}-round)`} />
            {/* Specular streak down the lacquer */}
            <path
                d="M-2.4 -44 L-2.4 44"
                stroke="#ffffff"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.75"
            />
            {/* Mirror-work rounds in gold thread */}
            {[-28, -8, 26].map((m) => (
                <g key={m}>
                    <ellipse cx="0" cy={m} rx="4.6" ry="4.8" fill={`url(#${id}-gold)`} />
                    <ellipse cx="0" cy={m} rx="3.3" ry="3.5" fill={`url(#${id}-mirror)`} />
                    <circle cx="-1" cy={m - 1.2} r="0.9" fill="#ffffff" />
                </g>
            ))}
            {/* Turned gold caps and bead collars at both ends */}
            {[-1, 1].map((s) => (
                <g key={s} transform={`scale(1 ${String(s)})`}>
                    <path
                        d="M-6 -48 L6 -48 L5.4 -52 Q6 -56 2.6 -57 L-2.6 -57 Q-6 -56 -5.4 -52 Z"
                        fill={`url(#${id}-gold)`}
                    />
                    <ellipse cx="0" cy="-58" rx="3.4" ry="2.8" fill={`url(#${id}-gold)`} />
                    <path d="M-6 -48 L6 -48" stroke="#7a4f12" strokeWidth="0.6" />
                    {[-44.5, -41.5].map((b) => (
                        <path
                            key={b}
                            d={`M-5.4 ${String(b)} L5.4 ${String(b)}`}
                            stroke="#fff1c2"
                            strokeWidth="1.6"
                            strokeDasharray="1.1 0.5"
                        />
                    ))}
                </g>
            ))}
        </g>
    );
}

interface TasselProps {
    id: string;
    x: number;
    y: number;
    color: string;
    deep: string;
}

// Silk tassel and ghungroo bells: they hang straight down, whatever angle the stick is held at.
function Tassel({ id, x, y, color, deep }: TasselProps) {
    const strands = [-4, -2.6, -1.2, 0, 1.2, 2.6, 4];
    return (
        <g transform={`translate(${String(x)} ${String(y)}) scale(1.35)`}>
            <path d="M0 -2 L0 3" stroke={`#b4802a`} strokeWidth="1" />
            {strands.map((s, i) => (
                <path
                    key={s}
                    d={`M${String(s * 0.35)} 6 Q${String(s * 0.8)} 13 ${String(s * 1.15)} 20`}
                    stroke={i % 2 ? color : deep}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    fill="none"
                />
            ))}
            <path d="M-1.4 8 Q-1.6 13 -1.9 19" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
            <path d="M-2.6 5 Q0 3 2.6 5 L2.2 7.6 Q0 8.6 -2.2 7.6 Z" fill={`url(#${id}-gold)`} />
            <circle cx="0" cy="3" r="2" fill={`url(#${id}-gold)`} />
            {[-4.6, 4.6].map((b) => (
                <g key={b} transform={`translate(${String(b)} ${String(Math.abs(b) + 2)})`}>
                    <path d="M0 -3 L0 0" stroke="#b4802a" strokeWidth="0.5" />
                    <circle r="2.3" fill={`url(#${id}-bell)`} />
                    <path d="M-1.6 0.9 L1.6 0.9" stroke="#3f2a06" strokeWidth="0.6" />
                    <circle cx="-0.8" cy="-0.8" r="0.6" fill="#fff6d8" />
                </g>
            ))}
        </g>
    );
}

export function Dandiya({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-gold`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <radialGradient id={`${id}-bell`} cx="0.35" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#fff6d8" />
                    <stop offset="0.35" stopColor="#e2b55a" />
                    <stop offset="1" stopColor="#5a3a0a" />
                </radialGradient>
                <linearGradient id={`${id}-mirror`} x1="0" y1="0" x2="1" y2="1">
                    <SilverStops />
                </linearGradient>
                <linearGradient id={`${id}-base-a`} x1="0" x2="1">
                    <stop offset="0" stopColor="#c8102e" />
                    <stop offset="1" stopColor="#c8102e" />
                </linearGradient>
                <linearGradient id={`${id}-base-b`} x1="0" x2="1">
                    <stop offset="0" stopColor="#0f6b5a" />
                    <stop offset="1" stopColor="#0f6b5a" />
                </linearGradient>
                <pattern
                    id={`${id}-spiral-a`}
                    width="8"
                    height="12"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(-34)"
                >
                    <rect width="8" height="4" fill="#ffc31a" />
                    <rect y="4" width="8" height="1.4" fill="#1b7a3a" />
                    <rect y="7.6" width="8" height="2.2" fill="#ffffff" opacity="0.9" />
                </pattern>
                <pattern
                    id={`${id}-spiral-b`}
                    width="8"
                    height="12"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(34)"
                >
                    <rect width="8" height="4" fill="#ff7a1a" />
                    <rect y="4" width="8" height="1.4" fill="#e9145a" />
                    <rect y="7.6" width="8" height="2.2" fill="#ffd54f" />
                </pattern>
                {/* Rounds the flat stripes into a cylinder: dark edges, bright core, rim light */}
                <linearGradient id={`${id}-round`} x1="0" x2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
                    <stop offset="0.12" stopColor="#000000" stopOpacity="0.15" />
                    <stop offset="0.32" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="0.85" stopColor="#1a0206" stopOpacity="0.5" />
                    <stop offset="1" stopColor="#1a0206" stopOpacity="0.7" />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={123} rx={44} ry={5} />
            <Stick id={id} angle={-30} tone="a" />
            <Stick id={id} angle={30} tone="b" />
            {/* A silk tie binding the pair where they cross */}
            <path
                d="M53 54 C56 58 64 58 67 54 L67 60 C64 64 56 64 53 60 Z"
                fill="#9c0f3a"
                stroke="#e2b55a"
                strokeWidth="0.6"
            />
            <circle cx="60" cy="58" r="3" fill={`url(#${id}-gold)`} />
            <circle cx="59.2" cy="57.2" r="0.9" fill="#fff6d8" />
            <Tassel id={id} x={36} y={100} color="#ff4f8b" deep="#c2185b" />
            <Tassel id={id} x={84} y={100} color="#ffb300" deep="#e65100" />
            <Sparkle x={38} y={22} size={3.6} />
            <Sparkle x={84} y={30} size={2.6} />
        </g>
    );
}
