import { type Art, ContactShadow, gilt, GoldStops, Sparkle } from './kit';

// The three kaleere hanging from the chooda: [x, dome centre y, scale, chain start y].
const kaleere = [
    [30, 70, 0.9, 30],
    [60, 82, 1.1, 33],
    [90, 70, 0.9, 30],
] as const;

// Five strands under each dome: [x offset, length].
const strands = [
    [-13, 14],
    [-6.5, 22],
    [0, 28],
    [6.5, 22],
    [13, 14],
] as const;

interface DomeProps {
    id: string;
}

// One umbrella dome, drawn at the origin with its rim at y=0.
function Dome({ id }: DomeProps) {
    return (
        <g>
            <ellipse cx="0" cy="0.5" rx="17" ry="4.2" fill="#4a2c06" />
            <path
                d="M-17 0 C-17 -22 17 -22 17 0 C10 3.8 -10 3.8 -17 0 Z"
                fill={`url(#${id}-dome)`}
            />
            <g clipPath={`url(#${id}-domeclip)`}>
                <rect x="-18" y="-20" width="36" height="24" fill={`url(#${id}-lace)`} />
                <path
                    d="M0 -16.5 C-4 -12 -8 -6 -9.5 2.8 M0 -16.5 C4 -12 8 -6 9.5 2.8 M0 -16.5 V3.4 M0 -16.5 C-8 -12 -14 -6 -15.5 1.4 M0 -16.5 C8 -12 14 -6 15.5 1.4"
                    fill="none"
                    stroke="#5e3a06"
                    strokeWidth="0.55"
                />
                <path
                    d="M-15 -4 C-8 0 8 0 15 -4 M-11 -11 C-5 -8.4 5 -8.4 11 -11"
                    fill="none"
                    stroke="#5e3a06"
                    strokeWidth="0.5"
                    strokeDasharray="1.4 0.8"
                />
                <ellipse
                    cx="-6"
                    cy="-10"
                    rx="3.2"
                    ry="5.5"
                    fill="#ffffff"
                    opacity="0.45"
                    transform="rotate(25 -6 -10)"
                />
            </g>
            {[-15, -10, -5, 0, 5, 10, 15].map((x) => (
                <circle
                    key={x}
                    cx={x}
                    cy={2.6 - Math.abs(x) * 0.12}
                    r="1.5"
                    fill={`url(#${id}-bead)`}
                />
            ))}
            <circle
                cx="0"
                cy="-17.4"
                r="2.6"
                fill="#b3141b"
                stroke={`url(#${id}-gold)`}
                strokeWidth="0.9"
            />
            <circle cx="-0.8" cy="-18.2" r="0.8" fill="#ff8a80" />
        </g>
    );
}

export function Kaleere({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-gold`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <radialGradient id={`${id}-dome`} cx="0.35" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#fff6d0" />
                    <stop offset="0.25" stopColor="#f1c65a" />
                    <stop offset="0.6" stopColor="#b9821f" />
                    <stop offset="1" stopColor="#5e3a06" />
                </radialGradient>
                <radialGradient id={`${id}-bead`} cx="0.35" cy="0.3" r="0.7">
                    <stop offset="0" stopColor="#fff8dc" />
                    <stop offset="0.5" stopColor="#e2ae45" />
                    <stop offset="1" stopColor="#6e4510" />
                </radialGradient>
                <radialGradient id={`${id}-pearl`} cx="0.35" cy="0.3" r="0.75">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.55" stopColor="#f4ede0" />
                    <stop offset="1" stopColor="#b8aa94" />
                </radialGradient>
                <linearGradient id={`${id}-red`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#ff6b6b" />
                    <stop offset="0.35" stopColor="#c8141e" />
                    <stop offset="1" stopColor="#5c040a" />
                </linearGradient>
                <pattern id={`${id}-lace`} width="3" height="3" patternUnits="userSpaceOnUse">
                    <circle
                        cx="1.5"
                        cy="1.5"
                        r="0.9"
                        fill="none"
                        stroke="#6e4510"
                        strokeWidth="0.35"
                        opacity="0.6"
                    />
                </pattern>
                <clipPath id={`${id}-domeclip`}>
                    <path d="M-17 0 C-17 -22 17 -22 17 0 C10 3.8 -10 3.8 -17 0 Z" />
                </clipPath>
            </defs>
            <ContactShadow id={id} cx={60} cy={124} rx={40} ry={3} />

            {/* The chooda: two red bangles either side of a gold one, seen slightly from above */}
            <ellipse cx="60" cy="13" rx="42" ry="8" fill="none" stroke="#5c040a" strokeWidth="5" />
            {[
                [11, 'red'],
                [17, 'gold'],
                [23, 'red'],
            ].map(([cy, kind]) => (
                <g key={cy}>
                    <path
                        d={`M18 ${String(cy)} C18 ${String(Number(cy) + 13)} 102 ${String(Number(cy) + 13)} 102 ${String(cy)}`}
                        fill="none"
                        stroke={kind === 'red' ? `url(#${id}-red)` : `url(#${id}-gold)`}
                        strokeWidth="5.6"
                        strokeLinecap="round"
                    />
                    <path
                        d={`M20 ${String(Number(cy) - 1.6)} C24 ${String(Number(cy) + 9)} 96 ${String(Number(cy) + 9)} 100 ${String(Number(cy) - 1.6)}`}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="0.8"
                        opacity="0.45"
                    />
                </g>
            ))}
            {[0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88].map((t) => {
                const x = 18 + 84 * t;
                const y = 17 + 9.75 * 4 * t * (1 - t);
                return (
                    <g key={t}>
                        <circle
                            cx={x}
                            cy={y}
                            r="1.7"
                            fill="#b3141b"
                            stroke="#fff1c2"
                            strokeWidth="0.5"
                        />
                        <circle cx={x - 0.5} cy={y - 0.5} r="0.5" fill="#ffffff" opacity="0.8" />
                    </g>
                );
            })}

            {kaleere.map(([x, y, k, top]) => (
                <g key={x}>
                    {/* Chain of gold links with pearls strung along it */}
                    <path
                        d={`M${String(x)} ${String(top)} V${String(y - 19 * k)}`}
                        stroke={gilt}
                        strokeWidth="1.3"
                        strokeDasharray="2.2 1"
                    />
                    {[0.3, 0.62].map((f) => (
                        <circle
                            key={f}
                            cx={x}
                            cy={top + (y - 19 * k - top) * f}
                            r="1.9"
                            fill={`url(#${id}-pearl)`}
                        />
                    ))}
                    <g transform={`translate(${String(x)} ${String(y)}) scale(${String(k)})`}>
                        {strands.map(([dx, len]) => (
                            <g key={dx}>
                                <path
                                    d={`M${String(dx)} 2 V${String(len)}`}
                                    stroke={gilt}
                                    strokeWidth="0.7"
                                />
                                {[0.35, 0.65].map((f) => (
                                    <circle
                                        key={f}
                                        cx={dx}
                                        cy={2 + (len - 2) * f}
                                        r="1.3"
                                        fill={`url(#${id}-pearl)`}
                                    />
                                ))}
                                <path
                                    d={`M${String(dx)} ${String(len)} C${String(dx + 2.6)} ${String(len + 2)} ${String(dx + 1.8)} ${String(len + 5.5)} ${String(dx)} ${String(len + 7)} C${String(dx - 1.8)} ${String(len + 5.5)} ${String(dx - 2.6)} ${String(len + 2)} ${String(dx)} ${String(len)} Z`}
                                    fill={`url(#${id}-gold)`}
                                    stroke="#6e4510"
                                    strokeWidth="0.3"
                                />
                            </g>
                        ))}
                        <Dome id={id} />
                    </g>
                </g>
            ))}
            <Sparkle x={53} y={70} size={3.4} />
            <Sparkle x={26} y={60} size={2.4} />
            <Sparkle x={74} y={20} size={2.6} />
        </g>
    );
}
