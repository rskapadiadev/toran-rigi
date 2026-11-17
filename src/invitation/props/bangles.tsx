import { type Art, ContactShadow, GoldStops, Sparkle } from './kit';

const cx = 60;
const rx = 36;
const ry = 10.5;

interface Band {
    h: number;
    kind: 'kundan' | 'red' | 'maroon' | 'ivory' | 'gold';
}

// The chooda from the top down: kundan at each end, lacquer reds and ivory between.
const stack: Band[] = [
    {
        h: 11,
        kind: 'kundan',
    },
    {
        h: 3.4,
        kind: 'gold',
    },
    {
        h: 6,
        kind: 'red',
    },
    {
        h: 5,
        kind: 'ivory',
    },
    {
        h: 6,
        kind: 'maroon',
    },
    {
        h: 6,
        kind: 'red',
    },
    {
        h: 5,
        kind: 'ivory',
    },
    {
        h: 3.4,
        kind: 'gold',
    },
    {
        h: 6,
        kind: 'red',
    },
    {
        h: 5,
        kind: 'ivory',
    },
    {
        h: 6,
        kind: 'maroon',
    },
    {
        h: 6,
        kind: 'red',
    },
    {
        h: 3.4,
        kind: 'gold',
    },
    {
        h: 11,
        kind: 'kundan',
    },
];

const top = 25;

// The visible front half of one bangle: between its upper and lower rims.
function bandPath(y: number, h: number) {
    const l = String(cx - rx);
    const r = String(cx + rx);
    const a = `${String(rx)} ${String(ry)} 0 0`;
    return `M${l} ${String(y)} A${a} 0 ${r} ${String(y)} L${r} ${String(y + h)} A${a} 1 ${l} ${String(y + h)} Z`;
}

function rimArc(y: number, from: number, to: number) {
    const p = (t: number) => `${String(cx + rx * Math.cos(t))} ${String(y + ry * Math.sin(t))}`;
    return `M${p(from)} A${String(rx)} ${String(ry)} 0 0 0 ${p(to)}`;
}

const gems = ['#c1121f', '#0f7a4a', '#e4f4ff', '#c1121f', '#0f7a4a', '#e4f4ff', '#c1121f'];

interface KundanProps {
    id: string;
    y: number;
    h: number;
}

// Stones set in gold bezels around the band, foreshortened toward the sides.
function Kundan({ id, y, h }: KundanProps) {
    const n = 11;
    return (
        <g>
            {Array.from({ length: n }, (_, i) => {
                const t = (Math.PI * (i + 0.5)) / n;
                const s = Math.sin(t);
                const gx = cx + rx * Math.cos(t);
                const gy = y + h / 2 + ry * s;
                const color = gems[i % gems.length] ?? '#c1121f';
                return (
                    <g key={i} transform={`translate(${String(gx)} ${String(gy)})`}>
                        <ellipse rx={3.4 * s} ry="3.4" fill="#7a4f12" />
                        <ellipse rx={2.8 * s} ry="2.8" fill={`url(#${id}-gold)`} />
                        <ellipse rx={2 * s} ry="2" fill={color} />
                        <ellipse
                            cx={-0.6 * s}
                            cy="-0.7"
                            rx={0.8 * s}
                            ry="0.6"
                            fill="#ffffff"
                            opacity="0.85"
                        />
                    </g>
                );
            })}
        </g>
    );
}

export function Bangles({ id }: Art) {
    const ys = stack.reduce<number[]>((acc, _band, i) => {
        const prev = stack[i - 1];
        acc.push(i === 0 ? top : (acc[i - 1] ?? top) + (prev?.h ?? 0));
        return acc;
    }, []);
    const fill = (k: Band['kind']) => `url(#${id}-${k})`;
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-gold`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-kundan`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-red`} x1="0" x2="1">
                    <stop offset="0" stopColor="#4a0610" />
                    <stop offset="0.25" stopColor="#c8102e" />
                    <stop offset="0.4" stopColor="#ff5a6e" />
                    <stop offset="0.55" stopColor="#d01434" />
                    <stop offset="0.85" stopColor="#7c0a1c" />
                    <stop offset="1" stopColor="#3a050c" />
                </linearGradient>
                <linearGradient id={`${id}-maroon`} x1="0" x2="1">
                    <stop offset="0" stopColor="#2a030a" />
                    <stop offset="0.3" stopColor="#7a0c24" />
                    <stop offset="0.42" stopColor="#c84466" />
                    <stop offset="0.6" stopColor="#6e0a20" />
                    <stop offset="1" stopColor="#22030a" />
                </linearGradient>
                <linearGradient id={`${id}-ivory`} x1="0" x2="1">
                    <stop offset="0" stopColor="#8a7a60" />
                    <stop offset="0.28" stopColor="#f3e9d2" />
                    <stop offset="0.42" stopColor="#ffffff" />
                    <stop offset="0.62" stopColor="#e9dcc0" />
                    <stop offset="1" stopColor="#6e5f46" />
                </linearGradient>
                <radialGradient id={`${id}-hole`} cx="0.5" cy="0.2" r="0.9">
                    <stop offset="0" stopColor="#1a0206" />
                    <stop offset="0.7" stopColor="#4a0814" />
                    <stop offset="1" stopColor="#8a1428" />
                </radialGradient>
            </defs>
            <ContactShadow id={id} cx={cx} cy={119} rx={46} ry={6} />

            {/* The top opening: gold rim and the shadowed inside of the stack */}
            <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill={`url(#${id}-gold)`} />
            <ellipse cx={cx} cy={top + 0.6} rx={rx - 3.4} ry={ry - 2.6} fill={`url(#${id}-hole)`} />
            {[3, 6, 9].map((d) => (
                <path
                    key={d}
                    d={`M${String(cx - rx + 4)} ${String(top + d * 0.3)} A${String(rx - 4)} ${String(ry - 3)} 0 0 1 ${String(cx + rx - 4)} ${String(top + d * 0.3)}`}
                    fill="none"
                    stroke={d === 6 ? '#e6d6b8' : '#b3173c'}
                    strokeWidth="0.7"
                    opacity="0.55"
                />
            ))}

            {/* Bottom to top, so each bangle sits on the one beneath */}
            {stack
                .map((b, i) => ({
                    b,
                    y: ys[i] ?? top,
                    i,
                }))
                .reverse()
                .map(({ b, y, i }) => (
                    <g key={i}>
                        <path d={bandPath(y, b.h)} fill={fill(b.kind)} />
                        {/* Glossy lacquer catches the light along the upper rim */}
                        <path
                            d={rimArc(y + b.h * 0.32, Math.PI * 0.82, Math.PI * 0.42)}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth={b.kind === 'gold' ? 0.7 : 1.1}
                            strokeLinecap="round"
                            opacity={b.kind === 'ivory' ? 0.9 : 0.6}
                        />
                        {b.kind === 'red' || b.kind === 'maroon' ? (
                            <path
                                d={rimArc(y + b.h * 0.62, Math.PI * 0.97, Math.PI * 0.03)}
                                fill="none"
                                stroke="#f0c766"
                                strokeWidth="0.55"
                                strokeDasharray="0.6 1.4"
                                opacity="0.9"
                            />
                        ) : null}
                        {b.kind === 'kundan' ? (
                            <>
                                <path
                                    d={rimArc(y + 1, Math.PI, 0)}
                                    fill="none"
                                    stroke="#fff1c2"
                                    strokeWidth="0.6"
                                />
                                <path
                                    d={rimArc(y + b.h - 1, Math.PI, 0)}
                                    fill="none"
                                    stroke="#fff1c2"
                                    strokeWidth="0.5"
                                    strokeDasharray="0.7 0.9"
                                />
                                <Kundan id={id} y={y} h={b.h} />
                            </>
                        ) : null}
                        <path
                            d={rimArc(y + b.h, Math.PI, 0)}
                            fill="none"
                            stroke="#1a0206"
                            strokeWidth="0.4"
                            opacity="0.45"
                        />
                    </g>
                ))}
            <Sparkle x={44} y={36} size={3.4} />
            <Sparkle x={74} y={108} size={2.6} />
        </g>
    );
}
