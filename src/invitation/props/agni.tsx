import { type Art, ContactShadow, CopperStops } from './kit';

// One tongue of fire with several licking tips; drawn three times, smaller and brighter each time.
const fire =
    'M27 80 C22 68 29 58 31 46 C35 54 38 59 41 57 C39 44 45 31 51 22 C51 33 55 40 57 38 C57 26 61 15 63 5 C68 18 73 29 71 40 C75 36 77 30 79 25 C84 37 81 49 85 54 C87 50 88 46 91 43 C96 57 98 70 93 80 Z';

// The stepped kund, top to bottom: [face top y, face bottom y, half-width at top, at bottom].
const tiers = [
    [82, 95, 47, 43],
    [98, 108, 39, 35],
    [111, 121, 31, 27],
] as const;

// Samidha sticks stacked inside the kund: [x1, y1, x2, y2].
const sticks = [
    [30, 80, 62, 58],
    [90, 80, 58, 58],
    [36, 74, 84, 74],
    [42, 66, 78, 68],
] as const;

const embers = [
    [36, 81, 2.4],
    [46, 82, 2],
    [74, 82, 2.2],
    [84, 81, 2.6],
    [58, 83, 1.8],
] as const;

const sparks = [
    [30, 30, 1.2],
    [94, 22, 1],
    [44, 12, 0.9],
    [80, 8, 1.1],
    [24, 46, 0.8],
    [98, 40, 0.9],
] as const;

function scaled(k: number, flip: boolean) {
    return `translate(60 81) scale(${String(flip ? -k : k)} ${String(k)}) translate(-60 -81)`;
}

export function Agni({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-copper`} x1="0" x2="1">
                    <CopperStops />
                </linearGradient>
                <linearGradient id={`${id}-ledge`} x1="0" x2="1">
                    <stop offset="0" stopColor="#7a3417" />
                    <stop offset="0.5" stopColor="#ffc9a0" />
                    <stop offset="1" stopColor="#6b2a10" />
                </linearGradient>
                <linearGradient id={`${id}-dark`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#ff8a3d" stopOpacity="0.35" />
                    <stop offset="0.4" stopColor="#1a0602" stopOpacity="0" />
                    <stop offset="1" stopColor="#1a0602" stopOpacity="0.45" />
                </linearGradient>
                <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.75" />
                    <stop offset="0.4" stopColor="#ff9a1f" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#ff5a00" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`${id}-f1`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0" stopColor="#ff7a00" />
                    <stop offset="0.55" stopColor="#e8380e" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#b71c1c" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id={`${id}-f2`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0" stopColor="#ffd34d" />
                    <stop offset="0.6" stopColor="#ff9800" />
                    <stop offset="1" stopColor="#ff6d00" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id={`${id}-f3`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.5" stopColor="#fff4b8" />
                    <stop offset="1" stopColor="#ffd54f" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id={`${id}-wood`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#a8703f" />
                    <stop offset="0.5" stopColor="#6b3d1a" />
                    <stop offset="1" stopColor="#2e1606" />
                </linearGradient>
                <radialGradient id={`${id}-ember`} cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#fff3b0" />
                    <stop offset="0.45" stopColor="#ff7b1a" />
                    <stop offset="1" stopColor="#8a1c06" />
                </radialGradient>
                <pattern id={`${id}-hammer`} width="4.6" height="4" patternUnits="userSpaceOnUse">
                    <circle cx="1.2" cy="1.1" r="0.8" fill="#ffd2b0" opacity="0.14" />
                    <circle cx="3.5" cy="3.1" r="0.8" fill="#200803" opacity="0.14" />
                </pattern>
            </defs>
            <circle cx="60" cy="56" r="58" fill={`url(#${id}-glow)`} />
            <ContactShadow id={id} cx={60} cy={123} rx={44} ry={4} />

            {/* The kund: rim seen from above, then three copper steps narrowing to the floor */}
            <path d="M24 72 L96 72 L107 82 L13 82 Z" fill="#2a0c04" />
            <path d="M28 74 L92 74 L101 81 L19 81 Z" fill="#5a1606" />
            {embers.map(([x, y, r]) => (
                <ellipse key={x} cx={x} cy={y - 1} rx={r * 1.6} ry={r} fill={`url(#${id}-ember)`} />
            ))}
            {tiers.map(([top, bottom, w1, w2], i) => {
                const face = `M${String(60 - w1)} ${String(top)} L${String(60 + w1)} ${String(top)} L${String(60 + w2)} ${String(bottom)} L${String(60 - w2)} ${String(bottom)} Z`;
                const next = tiers[i + 1];
                return (
                    <g key={top}>
                        <path d={face} fill={`url(#${id}-copper)`} />
                        <path d={face} fill={`url(#${id}-hammer)`} />
                        <path d={face} fill={`url(#${id}-dark)`} />
                        <path
                            d={`M${String(60 - w1 + 3)} ${String(top + 3)} L${String(60 + w1 - 3)} ${String(top + 3)}`}
                            stroke="#3d1606"
                            strokeWidth="0.5"
                            strokeDasharray="0.6 1.6"
                        />
                        <path
                            d={`M${String(60 - w2 - 1)} ${String(bottom - 3)} L${String(60 + w2 + 1)} ${String(bottom - 3)}`}
                            stroke="#f2a57a"
                            strokeWidth="0.4"
                            opacity="0.7"
                        />
                        {next ? (
                            <path
                                d={`M${String(60 - w2)} ${String(bottom)} L${String(60 + w2)} ${String(bottom)} L${String(60 + next[2])} ${String(next[0])} L${String(60 - next[2])} ${String(next[0])} Z`}
                                fill={`url(#${id}-ledge)`}
                            />
                        ) : null}
                    </g>
                );
            })}
            <path d="M13 82 L107 82 L106 83.4 L14 83.4 Z" fill="#ffd2a8" />
            <path
                d="M24 72 L96 72 L107 82 L13 82 Z"
                fill="none"
                stroke="#b5602f"
                strokeWidth="1.4"
            />

            {/* Samidha: bark-shaded sticks with pale cut ends and charred, glowing tips */}
            {sticks.map(([x1, y1, x2, y2]) => (
                <g key={`${String(x1)}-${String(y1)}`}>
                    <path
                        d={`M${String(x1)} ${String(y1)} L${String(x2)} ${String(y2)}`}
                        stroke="#2a1306"
                        strokeWidth="5.4"
                        strokeLinecap="round"
                    />
                    <path
                        d={`M${String(x1)} ${String(y1)} L${String(x2)} ${String(y2)}`}
                        stroke="#7a4a22"
                        strokeWidth="3.6"
                        strokeLinecap="round"
                    />
                    <path
                        d={`M${String(x1)} ${String(y1 - 1)} L${String(x2)} ${String(y2 - 1)}`}
                        stroke="#c48a55"
                        strokeWidth="0.9"
                        strokeLinecap="round"
                        opacity="0.7"
                    />
                    <circle
                        cx={x1}
                        cy={y1}
                        r="2.6"
                        fill="#e6c08a"
                        stroke="#5a3214"
                        strokeWidth="0.6"
                    />
                    <circle cx={x2} cy={y2} r="2.2" fill="#ff7b1a" opacity="0.9" />
                </g>
            ))}

            {/* Fire: deep red outer flame, orange body, white-hot heart */}
            <path d={fire} fill={`url(#${id}-f1)`} />
            <path d={fire} fill={`url(#${id}-f2)`} transform={scaled(0.74, true)} />
            <path d={fire} fill={`url(#${id}-f3)`} transform={scaled(0.44, false)} />
            <ellipse cx="60" cy="78" rx="22" ry="5" fill="#fff3c4" opacity="0.45" />
            {sparks.map(([x, y, r]) => (
                <g key={x}>
                    <circle cx={x} cy={y} r={r * 2.4} fill="#ffb300" opacity="0.25" />
                    <circle cx={x} cy={y} r={r} fill="#fff1b0" />
                </g>
            ))}
        </g>
    );
}
