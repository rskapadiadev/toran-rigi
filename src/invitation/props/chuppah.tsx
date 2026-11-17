import { type Art, ContactShadow, gilt, GoldStops, SheenStops, Sparkle } from './kit';

type Pt = [number, number];

interface Bloom {
    id: string;
    x: number;
    y: number;
    r: number;
    tone: 'ivory' | 'blush';
    turn: number;
}

// A garden rose from above: cupped outer petals, a tighter heart and a soft spiral.
function Rose({ id, x, y, r, tone, turn }: Bloom) {
    return (
        <g>
            {[0, 1, 2, 3, 4].map((i) => {
                const a = (i * 72 + turn) * (Math.PI / 180);
                return (
                    <circle
                        key={i}
                        cx={x + Math.cos(a) * r * 0.42}
                        cy={y + Math.sin(a) * r * 0.42}
                        r={r * 0.6}
                        fill={`url(#${id}-${tone})`}
                        stroke="#b89a8a"
                        strokeWidth={r * 0.04}
                        strokeOpacity="0.5"
                    />
                );
            })}
            <circle cx={x} cy={y} r={r * 0.5} fill={`url(#${id}-${tone})`} />
            {[0.2, 0.32, 0.44].map((k, j) => (
                <circle
                    key={k}
                    cx={x}
                    cy={y}
                    r={r * k}
                    fill="none"
                    stroke={tone === 'blush' ? '#c56a78' : '#c4ae90'}
                    strokeWidth={r * 0.07}
                    strokeLinecap="round"
                    strokeDasharray={`${String(r * k * 3.4)} ${String(r * k * 6.3)}`}
                    transform={`rotate(${String(turn + j * 130)} ${String(x)} ${String(y)})`}
                />
            ))}
            <circle cx={x} cy={y} r={r} fill={`url(#${id}-ball)`} />
        </g>
    );
}

// The garland's path: a gentle swag along the front edge, then cascades down both front poles.
const swag: Pt[] = Array.from({ length: 14 }, (_, i) => {
    const t = i / 13;
    return [16 + t * 88, 28 + Math.sin(t * Math.PI) * 3];
});
const cascade: Pt[] = [0, 1, 2, 3, 4].flatMap((i): Pt[] => [
    [23.5 + (i % 2) * 1.5, 35 + i * 6],
    [96.5 - (i % 2) * 1.5, 35 + i * 6],
]);
const blooms = [...swag, ...cascade];
const swags = [12, 36, 60, 84];

interface Post {
    id: string;
    x: number;
    top: number;
    bottom: number;
}

// A gilded pole: turned collars, an orb finial and a stepped foot.
function Pole({ x, top, bottom, id }: Post) {
    return (
        <g>
            <rect x={x - 2.2} y={top} width="4.4" height={bottom - top} fill={`url(#${id}-gold)`} />
            {[top + 10, (top + bottom) / 2 + 6].map((y) => (
                <rect
                    key={y}
                    x={x - 3}
                    y={y}
                    width="6"
                    height="2"
                    rx="0.8"
                    fill={`url(#${id}-gold)`}
                />
            ))}
            <circle cx={x} cy={top - 2.5} r="3.4" fill={`url(#${id}-orb)`} />
            <path
                d={`M${String(x)} ${String(top - 9)} L${String(x + 1)} ${String(top - 5.5)} L${String(x - 1)} ${String(top - 5.5)} Z`}
                fill={gilt}
            />
            <path
                d={`M${String(x - 4)} ${String(bottom)} L${String(x + 4)} ${String(bottom)} L${String(x + 5.5)} ${String(bottom + 3)} L${String(x - 5.5)} ${String(bottom + 3)} Z`}
                fill={`url(#${id}-gold)`}
            />
        </g>
    );
}

export function Chuppah({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-gold`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <radialGradient id={`${id}-orb`} cx="0.35" cy="0.3" r="0.7">
                    <stop offset="0" stopColor="#fff6d6" />
                    <stop offset="0.45" stopColor="#d9a441" />
                    <stop offset="1" stopColor="#5e3b0b" />
                </radialGradient>
                <linearGradient id={`${id}-folds`} x1="0" x2="0.16" spreadMethod="reflect">
                    <stop offset="0" stopColor="#d9d2c6" />
                    <stop offset="0.5" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#efe9df" />
                </linearGradient>
                <linearGradient id={`${id}-top`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#e6dfd2" />
                    <stop offset="1" stopColor="#fffdf8" />
                </linearGradient>
                <linearGradient id={`${id}-valance`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.6" stopColor="#f6f1e8" />
                    <stop offset="1" stopColor="#cfc6b6" />
                </linearGradient>
                <linearGradient id={`${id}-sheen`} x1="0" x2="1">
                    <SheenStops />
                </linearGradient>
                <radialGradient id={`${id}-ivory`} cx="0.45" cy="0.4" r="0.65">
                    <stop offset="0" stopColor="#fffdf6" />
                    <stop offset="0.6" stopColor="#f3e9d8" />
                    <stop offset="1" stopColor="#c9b79c" />
                </radialGradient>
                <radialGradient id={`${id}-blush`} cx="0.45" cy="0.4" r="0.65">
                    <stop offset="0" stopColor="#ffe4e6" />
                    <stop offset="0.6" stopColor="#f4aab4" />
                    <stop offset="1" stopColor="#b8606e" />
                </radialGradient>
                <radialGradient id={`${id}-ball`} cx="0.35" cy="0.3" r="0.7">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
                    <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#3a2418" stopOpacity="0.35" />
                </radialGradient>
                <linearGradient id={`${id}-leaf`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#8fbf7a" />
                    <stop offset="1" stopColor="#2e5e2a" />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={121} rx={54} ry={4} />
            <ContactShadow id={`${id}-b`} cx={60} cy={106} rx={34} ry={2.5} />
            {/* Back poles and a sheer back panel */}
            <Pole id={id} x={34} top={22} bottom={103} />
            <Pole id={id} x={86} top={22} bottom={103} />
            {/* Side drapes, gathered at the front poles */}
            {[0, 1].map((side) => (
                <g key={side} transform={side ? 'translate(120 0) scale(-1 1)' : undefined}>
                    <path
                        d="M11 30 L26 30 C24 46 23 60 22 72 C24 90 28 106 30 120 L5 120 C9 104 15 88 19 72 C15 58 11 44 11 30 Z"
                        fill={`url(#${id}-folds)`}
                    />
                    <path
                        d="M19 72 C17 86 12 102 8 119"
                        fill="none"
                        stroke="#bdb3a3"
                        strokeWidth="0.7"
                        opacity="0.8"
                    />
                    <path
                        d="M22 72 C24 88 26 104 27 119"
                        fill="none"
                        stroke="#bdb3a3"
                        strokeWidth="0.6"
                        opacity="0.7"
                    />
                </g>
            ))}
            {/* The canopy: silk top, swagged valance with fine stripes and a knotted fringe */}
            <path d="M28 18 L92 18 L108 28 L12 28 Z" fill={`url(#${id}-top)`} />
            <path d="M28 18 L92 18 L108 28 L12 28 Z" fill={`url(#${id}-sheen)`} opacity="0.6" />
            <path
                d="M12 28 L108 28 L108 36 Q96 47 84 38 Q72 48 60 38 Q48 48 36 38 Q24 47 12 36 Z"
                fill={`url(#${id}-valance)`}
            />
            <path d="M12 31.2 L108 31.2" stroke="#6f87a8" strokeWidth="0.7" opacity="0.7" />
            <path d="M12 33 L108 33" stroke="#6f87a8" strokeWidth="0.4" opacity="0.6" />
            {swags.map((x0) => (
                <g key={x0}>
                    <path
                        d={`M${String(x0 + 4)} 36 Q${String(x0 + 12)} 42 ${String(x0 + 20)} 36`}
                        fill="none"
                        stroke="#c8bfae"
                        strokeWidth="0.6"
                    />
                    {Array.from({ length: 9 }, (_, i) => {
                        const t = (i + 0.5) / 9;
                        const y0 = x0 === 12 ? 36 : 38;
                        const y1 = x0 === 84 ? 36 : 38;
                        const x = x0 + 24 * t;
                        const y =
                            (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * 47.5 + t * t * y1 - 0.5;
                        return (
                            <path
                                key={i}
                                d={`M${String(x)} ${String(y)} l0 3.2`}
                                stroke="#e4dccd"
                                strokeWidth="0.7"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </g>
            ))}
            {/* Front poles, with a gold cord tying each drape */}
            <Pole id={id} x={21} top={26} bottom={117} />
            <Pole id={id} x={99} top={26} bottom={117} />
            {[21, 99].map((x) => (
                <g key={x}>
                    <ellipse cx={x} cy="73" rx="4.2" ry="1.6" fill={`url(#${id}-gold)`} />
                    <path
                        d={`M${String(x)} 74 q${String(x < 60 ? -2 : 2)} 5 0 9`}
                        fill="none"
                        stroke={gilt}
                        strokeWidth="0.8"
                    />
                    <circle cx={x} cy="83.5" r="1.3" fill={`url(#${id}-orb)`} />
                </g>
            ))}
            {/* Garland of ivory and blush roses with greenery */}
            {blooms.map(([x, y], i) => (
                <g key={`l${String(i)}`}>
                    <path
                        d="M0 0 C2.5 -2.5 7 -2.5 9 0 C7 2 2.5 2 0 0 Z"
                        fill={`url(#${id}-leaf)`}
                        transform={`translate(${String(x)} ${String(y)}) rotate(${String((i * 67) % 360)})`}
                    />
                    <path
                        d="M0 0 C2 -2 6 -2 7.5 0 C6 1.6 2 1.6 0 0 Z"
                        fill={`url(#${id}-leaf)`}
                        transform={`translate(${String(x)} ${String(y)}) rotate(${String((i * 67 + 150) % 360)})`}
                    />
                </g>
            ))}
            {blooms.map(([x, y], i) => (
                <Rose
                    key={i}
                    id={id}
                    x={x}
                    y={y}
                    r={i % 3 === 1 ? 3.4 : 4.2}
                    tone={i % 3 === 1 ? 'blush' : 'ivory'}
                    turn={i * 41}
                />
            ))}
            <Sparkle x={21} y={14} size={2.4} />
            <Sparkle x={86} y={60} size={1.8} />
        </g>
    );
}
