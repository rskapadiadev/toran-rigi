import { type Art, ContactShadow, Sparkle } from './kit';

// A bhandara's meal on a steel thali: three katoris of dal, sabzi and kheer at the back, then rice,
// a stack of golden puris and halwa in front, with pickle and a green chilli on the rim.

interface KatoriProps {
    id: string;
    x: number;
    y: number;
    fill: string;
    // Small pieces in the bowl: paneer in the sabzi, a cashew in the kheer.
    pieces?: string;
}

function Katori({ id, x, y, fill, pieces }: KatoriProps) {
    return (
        <g transform={`translate(${String(x)} ${String(y)})`}>
            <ellipse cx="0" cy="7" rx="12" ry="3" fill="#1c1c1c" opacity="0.28" />
            <path d="M-12 0 C-11 8 11 8 12 0 Z" fill={`url(#${id}-steel)`} />
            <ellipse cx="0" cy="0" rx="12" ry="4" fill={`url(#${id}-steel)`} />
            <ellipse cx="0" cy="0.3" rx="10.2" ry="3.1" fill={fill} />
            <ellipse cx="-3" cy="-0.6" rx="4.5" ry="1" fill="#ffffff" opacity="0.28" />
            {pieces && (
                <g fill={pieces}>
                    <rect x="-5" y="-1" width="2.6" height="2.2" rx="0.5" />
                    <rect x="1" y="-0.4" width="2.6" height="2.2" rx="0.5" />
                    <rect x="4.6" y="-1.4" width="2.2" height="1.9" rx="0.5" />
                </g>
            )}
        </g>
    );
}

interface PuriProps {
    x: number;
    y: number;
    r: number;
}

// One puffed puri, its blisters darker where the oil caught it.
function Puri({ x, y, r }: PuriProps) {
    return (
        <g>
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.42} fill="#c9842c" />
            <ellipse cx={x} cy={y - 1} rx={r * 0.94} ry={r * 0.38} fill="#e9b45a" />
            <ellipse
                cx={x - r * 0.3}
                cy={y - 1.6}
                rx={r * 0.32}
                ry={r * 0.1}
                fill="#fff0c4"
                opacity="0.55"
            />
            <circle cx={x + r * 0.35} cy={y - 0.8} r={r * 0.09} fill="#b86e1e" />
            <circle cx={x - r * 0.1} cy={y + 0.4} r={r * 0.07} fill="#b86e1e" />
        </g>
    );
}

export function Bhojan({ id }: Art) {
    const grains = Array.from({ length: 16 }, (_, i) => ({
        x: 33 + ((i * 7) % 15) - 2,
        y: 95 + ((i * 5) % 7) - 3,
        a: (i * 37) % 180,
    }));
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-steel`} x1="0" x2="1">
                    <stop offset="0" stopColor="#6d7378" />
                    <stop offset="0.3" stopColor="#d9dde0" />
                    <stop offset="0.5" stopColor="#ffffff" />
                    <stop offset="0.7" stopColor="#b9bec2" />
                    <stop offset="1" stopColor="#5d6267" />
                </linearGradient>
                <radialGradient id={`${id}-plate`} cx="0.4" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#f4f6f7" />
                    <stop offset="0.55" stopColor="#c3c8cc" />
                    <stop offset="1" stopColor="#80868b" />
                </radialGradient>
                <radialGradient id={`${id}-rice`} cx="0.4" cy="0.3" r="0.7">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#e6dfcc" />
                </radialGradient>
                <radialGradient id={`${id}-halwa`} cx="0.4" cy="0.3" r="0.75">
                    <stop offset="0" stopColor="#f3a64a" />
                    <stop offset="1" stopColor="#b5601c" />
                </radialGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={121} rx={56} ry={5} />

            {/* The steel thali: underside, raised rim and the polished floor */}
            <ellipse cx="60" cy="98" rx="57" ry="23" fill="#4f5458" />
            <ellipse cx="60" cy="95" rx="57" ry="23" fill={`url(#${id}-steel)`} />
            <ellipse cx="60" cy="95.6" rx="51" ry="19.6" fill={`url(#${id}-plate)`} />
            <ellipse cx="42" cy="86" rx="20" ry="4" fill="#ffffff" opacity="0.35" />

            {/* Back row: dal, paneer sabzi, kheer */}
            <Katori id={id} x={33} y={83} fill="#e7b52c" />
            <Katori id={id} x={60} y={79} fill="#c9471a" pieces="#fbeedd" />
            <Katori id={id} x={87} y={83} fill="#f3e4c0" pieces="#e3b878" />
            <circle cx="60" cy="78.6" r="0.9" fill="#3f7a2c" />
            <circle cx="62.5" cy="79.4" r="0.8" fill="#3f7a2c" />
            <circle cx="85" cy="82.6" r="0.6" fill="#e07a12" />
            <circle cx="89" cy="83.4" r="0.6" fill="#e07a12" />

            {/* Front: rice, a stack of puris, halwa */}
            <path d="M22 99 C22 89 44 89 44 99 C40 102 26 102 22 99 Z" fill={`url(#${id}-rice)`} />
            {grains.map((g, i) => (
                <ellipse
                    key={i}
                    cx={g.x}
                    cy={g.y}
                    rx="1.3"
                    ry="0.45"
                    fill="#d8cfb6"
                    transform={`rotate(${String(g.a)} ${String(g.x)} ${String(g.y)})`}
                />
            ))}
            <Puri x={60} y={104} r={13} />
            <Puri x={58} y={100} r={12.5} />
            <Puri x={61} y={96} r={12} />
            <path
                d="M76 100 C76 89 98 89 98 100 C94 103 80 103 76 100 Z"
                fill={`url(#${id}-halwa)`}
            />
            <path
                d="M82 93 l3 -1.4 M88 92 l2.6 1 M85 96 l3 -0.6"
                stroke="#fbe7c2"
                strokeWidth="1.1"
                strokeLinecap="round"
            />

            {/* Pickle and a green chilli on the rim */}
            <ellipse cx="101" cy="106" rx="5" ry="2.2" fill="#a8261a" />
            <path
                d="M96 105.4 q2 -1.6 4 -0.4 q2 1 4 -0.2"
                fill="none"
                stroke="#e6661c"
                strokeWidth="0.9"
            />
            <path
                d="M14 104 C18 108 26 109 31 106"
                fill="none"
                stroke="#3f8a2c"
                strokeWidth="2.4"
                strokeLinecap="round"
            />
            <path d="M31 106 l2.2 -1.4" stroke="#2c5e1f" strokeWidth="1.4" strokeLinecap="round" />

            <Sparkle x={21} y={84} size={2.6} />
            <Sparkle x={103} y={89} size={2.2} />
        </g>
    );
}
