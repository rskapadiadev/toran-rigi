import { type Art, Sparkle } from './kit';

interface FanProps {
    fill: string;
    x: number;
    y: number;
    angles: number[];
    lengths: number[];
    width: number;
    edge: string;
    shaft?: boolean;
}

// A row of feathers fanned from one root: tapered vanes with a soft edge and a pale rachis.
function Fan({ fill, x, y, angles, lengths, width, edge, shaft = false }: FanProps) {
    return (
        <g>
            {angles.map((a, i) => {
                const l = lengths[i] ?? 30;
                const w = width / 2;
                const d = `M${String(-w)} 0 C${String(-w * 1.2)} ${String(-l * 0.55)} ${String(-w * 0.7)} ${String(-l * 0.92)} 0 ${String(-l)} C${String(w * 0.8)} ${String(-l * 0.9)} ${String(w * 1.2)} ${String(-l * 0.5)} ${String(w)} 0 Z`;
                return (
                    <g
                        key={a}
                        transform={`translate(${String(x)} ${String(y)}) rotate(${String(a)})`}
                    >
                        <path d={d} fill={fill} stroke={edge} strokeWidth="0.5" />
                        {shaft ? (
                            <path
                                d={`M0 ${String(-l * 0.1)} Q${String(w * 0.25)} ${String(-l * 0.5)} 0 ${String(-l * 0.94)}`}
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="0.6"
                                opacity="0.9"
                            />
                        ) : null}
                    </g>
                );
            })}
        </g>
    );
}

const raysCentre = {
    x: 60,
    y: 56,
};

// Thin wedges of light radiating from behind the bird.
function rayPath(angle: number) {
    const r = 64;
    const d = 3.2;
    const p = (a: number) => {
        const t = (a * Math.PI) / 180;
        return `${String(raysCentre.x + r * Math.cos(t))} ${String(raysCentre.y + r * Math.sin(t))}`;
    };
    return `M${String(raysCentre.x)} ${String(raysCentre.y)} L${p(angle - d)} L${p(angle + d)} Z`;
}

const leaves = [
    [102, 59, 20],
    [104, 62, 150],
    [106, 66, 50],
    [107, 70, 160],
    [109, 74, 70],
    [107, 79, 130],
    [109, 82, 95],
];

export function Dove({ id }: Art) {
    const near = [-46, -34, -22, -10, 2, 14, 26];
    const far = [-82, -70, -58, -46, -34, -22];
    const scale = (ls: number[], k: number) => ls.map((l) => l * k);
    const nearLen = [36, 42, 48, 53, 57, 57, 52];
    return (
        <g>
            <defs>
                <radialGradient id={`${id}-halo`}>
                    <stop offset="0" stopColor="#fff6da" stopOpacity="0.95" />
                    <stop offset="0.5" stopColor="#ffe8a8" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#ffe0a0" stopOpacity="0" />
                </radialGradient>
                <radialGradient
                    id={`${id}-ray`}
                    cx={raysCentre.x}
                    cy={raysCentre.y}
                    r="64"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#f3c86a" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`${id}-primary`} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.6" stopColor="#eef1f5" />
                    <stop offset="1" stopColor="#b7c0cc" />
                </linearGradient>
                <linearGradient id={`${id}-covert`} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.75" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#dce2ea" />
                </linearGradient>
                <linearGradient id={`${id}-farwing`} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor="#dfe4eb" />
                    <stop offset="1" stopColor="#9aa4b3" />
                </linearGradient>
                <radialGradient id={`${id}-body`} cx="0.62" cy="0.25" r="0.85">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.5" stopColor="#f1f3f7" />
                    <stop offset="0.85" stopColor="#c6cdd8" />
                    <stop offset="1" stopColor="#aab3c0" />
                </radialGradient>
                <linearGradient id={`${id}-olive`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#8fa04a" />
                    <stop offset="1" stopColor="#4b5a22" />
                </linearGradient>
            </defs>
            {/* Divine light behind the bird */}
            {Array.from({ length: 16 }, (_, i) => (
                <path key={i} d={rayPath(i * 22.5 + 6)} fill={`url(#${id}-ray)`} />
            ))}
            <circle cx={raysCentre.x} cy={raysCentre.y} r="44" fill={`url(#${id}-halo)`} />

            {/* Far wing and tail, cooler and set back */}
            <Fan
                fill={`url(#${id}-farwing)`}
                x={54}
                y={66}
                angles={far}
                lengths={[30, 36, 41, 45, 45, 41]}
                width={9}
                edge="#a3adbb"
            />
            <Fan
                fill={`url(#${id}-primary)`}
                x={40}
                y={85}
                angles={[-156, -144, -132, -120, -108]}
                lengths={[24, 28, 30, 28, 24]}
                width={8}
                edge="#b7c0cc"
                shaft
            />

            {/* Body, breast catching warm reflected light underneath */}
            <path
                d="M34 87 C40 74 56 66 72 62 C78 56 86 46 94 50 C99 53 99 61 94 67 C86 80 66 91 46 91 C40 91 36 90 34 87 Z"
                fill={`url(#${id}-body)`}
                stroke="#b7c0cc"
                strokeWidth="0.5"
            />
            <path
                d="M48 89 C66 88 84 79 92 68"
                fill="none"
                stroke="#f6e2b8"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.8"
            />
            <circle cx="89" cy="54.5" r="7.6" fill={`url(#${id}-body)`} />
            <path d="M84 50 Q88 46.5 93 48" fill="none" stroke="#ffffff" strokeWidth="1.2" />
            {/* Beak and eye */}
            <path d="M95.5 52.6 Q101 54 104 56.6 Q100.5 58 95.8 57.4 Z" fill="#c9a197" />
            <path
                d="M96 55.4 Q100 55.8 103.6 56.6"
                stroke="#8d6a62"
                strokeWidth="0.4"
                fill="none"
            />
            <ellipse cx="96.6" cy="53.4" rx="1.4" ry="0.9" fill="#f4eeea" />
            <circle cx="91" cy="53.4" r="1.7" fill="#c8ced8" />
            <circle cx="91" cy="53.4" r="1.25" fill="#1f1a1a" />
            <circle cx="91.4" cy="53" r="0.45" fill="#ffffff" />

            {/* Near wing: long primaries, then coverts layered over them */}
            <Fan
                fill={`url(#${id}-primary)`}
                x={62}
                y={66}
                angles={near}
                lengths={nearLen}
                width={9.5}
                edge="#aeb7c4"
                shaft
            />
            <Fan
                fill={`url(#${id}-covert)`}
                x={62}
                y={66}
                angles={near.map((a) => a + 4)}
                lengths={scale(nearLen, 0.62)}
                width={10}
                edge="#c9d0da"
            />
            <Fan
                fill={`url(#${id}-covert)`}
                x={62}
                y={66}
                angles={near.map((a) => a + 2)}
                lengths={scale(nearLen, 0.36)}
                width={10}
                edge="#d6dce4"
            />
            <ellipse cx="63" cy="64" rx="9" ry="6" fill={`url(#${id}-body)`} />

            {/* Olive branch carried in the beak */}
            <path
                d="M101 57 C106 62 110 70 108 84"
                fill="none"
                stroke="#5e4a2a"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
            {leaves.map(([lx, ly, a]) => (
                <g
                    key={`${String(lx)}-${String(ly)}`}
                    transform={`translate(${String(lx)} ${String(ly)}) rotate(${String(a)})`}
                >
                    <path
                        d="M0 0 C3 -2.2 9 -2 12 0 C9 1.8 3 1.8 0 0 Z"
                        fill={`url(#${id}-olive)`}
                    />
                    <path
                        d="M0.6 0 Q6 -0.3 11.4 0"
                        stroke="#d3dcae"
                        strokeWidth="0.35"
                        fill="none"
                    />
                </g>
            ))}
            <ellipse cx="104" cy="77" rx="1.9" ry="2.4" fill="#3d3a1a" />
            <ellipse cx="103.4" cy="76.2" rx="0.6" ry="0.8" fill="#c6c48a" />
            <Sparkle x={28} y={22} size={3.4} />
            <Sparkle x={96} y={28} size={2.6} />
            <Sparkle x={22} y={64} size={2} />
        </g>
    );
}
