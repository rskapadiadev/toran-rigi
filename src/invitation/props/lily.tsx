import { type Art, ContactShadow, SheenStops } from './kit';

interface Head {
    id: string;
    x: number;
    y: number;
    size: number;
    angle: number;
}

function petal(l: number): string {
    return `M0 0 C${String(-l * 0.42)} ${String(-l * 0.25)} ${String(-l * 0.44)} ${String(-l * 0.72)} 0 ${String(-l)} C${String(l * 0.44)} ${String(-l * 0.72)} ${String(l * 0.42)} ${String(-l * 0.25)} 0 0 Z`;
}

// An open lily: three sepals behind three petals, each with a shaded half and a pale midrib,
// a green throat and curving stamens tipped with rust anthers.
function LilyHead({ id, x, y, size: l, angle }: Head) {
    const half = `M0 0 C${String(-l * 0.42)} ${String(-l * 0.25)} ${String(-l * 0.44)} ${String(-l * 0.72)} 0 ${String(-l)} Z`;
    return (
        <g
            transform={`translate(${String(x)} ${String(y)}) rotate(${String(angle)}) scale(1 0.84)`}
        >
            {[0, 1].map((layer) =>
                [0, 1, 2].map((k) => {
                    const a = k * 120 + (layer ? 0 : 60) + 10;
                    return (
                        <g key={`${String(layer)}-${String(k)}`} transform={`rotate(${String(a)})`}>
                            <path
                                d={petal(l * (layer ? 1 : 0.92))}
                                fill={`url(#${id}-petal)`}
                                stroke="#d6d6c8"
                                strokeWidth="0.3"
                            />
                            <path
                                d={half}
                                fill="#5c6b4a"
                                opacity={layer ? 0.1 : 0.2}
                                transform={layer ? undefined : 'scale(0.92)'}
                            />
                            <path
                                d={`M0 ${String(-l * 0.15)} L0 ${String(-l * 0.85)}`}
                                stroke="#e3e8d4"
                                strokeWidth="0.5"
                            />
                        </g>
                    );
                }),
            )}
            <circle r={l * 0.22} fill={`url(#${id}-throat)`} />
            {[0, 1, 2, 3, 4, 5].map((k) => {
                const a = (k * 60 + 30) * (Math.PI / 180);
                const ex = Math.cos(a) * l * 0.55;
                const ey = Math.sin(a) * l * 0.55;
                return (
                    <g key={k}>
                        <path
                            d={`M0 0 Q${String(ex * 0.4)} ${String(ey * 0.4 - 2)} ${String(ex)} ${String(ey)}`}
                            fill="none"
                            stroke="#c7d9a4"
                            strokeWidth="0.5"
                        />
                        <ellipse
                            cx={ex}
                            cy={ey}
                            rx="1.5"
                            ry="0.6"
                            fill="#a84a1c"
                            transform={`rotate(${String(k * 60 + 120)} ${String(ex)} ${String(ey)})`}
                        />
                    </g>
                );
            })}
            <path
                d={`M0 0 Q2 -3 ${String(l * 0.12)} ${String(-l * 0.62)}`}
                fill="none"
                stroke="#9bbf6a"
                strokeWidth="0.8"
            />
            <circle cx={l * 0.12} cy={-l * 0.62} r="1" fill="#7ea84f" />
        </g>
    );
}

// A calla: one rolled trumpet with a pale throat and a golden spadix.
function Calla({ id, x, y, size, angle }: Head) {
    return (
        <g
            transform={`translate(${String(x)} ${String(y)}) rotate(${String(angle)}) scale(${String(size)})`}
        >
            <path
                d="M0 0 C-3 -6 -9 -14 -11 -22 C-12 -27 -7 -30 -1 -29 C5 -30 11 -28 13 -24 C10 -22 8 -20 6 -17 C4 -10 2 -5 0 0 Z"
                fill={`url(#${id}-calla)`}
            />
            <path
                d="M0 0 C-3 -6 -9 -14 -11 -22 C-12 -27 -7 -30 -1 -29 C5 -30 11 -28 13 -24 C10 -22 8 -20 6 -17 C4 -10 2 -5 0 0 Z"
                fill={`url(#${id}-base)`}
            />
            <path
                d="M-10 -23.5 C-8 -28.5 6 -29.5 12 -24.5 C6 -22 -4 -20.5 -10 -23.5 Z"
                fill={`url(#${id}-throat)`}
            />
            <path d="M0 -21 L1.4 -27" stroke="#e9b730" strokeWidth="2" strokeLinecap="round" />
            <path
                d="M12.5 -24.2 C9 -21.5 7 -19 5.6 -16"
                fill="none"
                stroke="#fff"
                strokeWidth="0.9"
                opacity="0.9"
            />
            <path
                d="M-4 -24 C-6 -16 -4 -8 -1 -2"
                fill="none"
                stroke="#fff"
                strokeWidth="1.2"
                opacity="0.6"
            />
        </g>
    );
}

function Bud({ id, x, y, size, angle }: Head) {
    return (
        <g
            transform={`translate(${String(x)} ${String(y)}) rotate(${String(angle)}) scale(${String(size)})`}
        >
            <path d="M0 0 C-3.5 -5 -4 -16 0 -25 C4 -16 3.5 -5 0 0 Z" fill={`url(#${id}-bud)`} />
            <path d="M0 -2 C-1 -10 -0.6 -18 0 -24" fill="none" stroke="#c9d8b0" strokeWidth="0.4" />
            <path
                d="M-2.5 -6 C-3 -12 -2 -18 -0.6 -22"
                fill="none"
                stroke="#fff"
                strokeWidth="0.7"
                opacity="0.7"
            />
        </g>
    );
}

interface Blade {
    id: string;
    x: number;
    y: number;
    angle: number;
    len: number;
}

function Leaf({ id, x, y, angle, len: l }: Blade) {
    const top = `M0 0 C${String(l * 0.3)} ${String(-l * 0.12)} ${String(l * 0.75)} ${String(-l * 0.1)} ${String(l)} 0`;
    return (
        <g transform={`translate(${String(x)} ${String(y)}) rotate(${String(angle)})`}>
            <path
                d={`${top} C${String(l * 0.75)} ${String(l * 0.06)} ${String(l * 0.3)} ${String(l * 0.08)} 0 0 Z`}
                fill={`url(#${id}-leaf)`}
            />
            <path d={`${top} Q${String(l / 2)} 0 0 0 Z`} fill="#0e2e10" opacity="0.25" />
        </g>
    );
}

// Where each flower sits and the point its stem leaves from.
const heads: [number, number][] = [
    [60, 28],
    [31, 46],
    [90, 48],
    [44, 78],
    [78, 80],
    [16, 70],
    [104, 26],
];
const ends = [50, 54, 57, 60, 63, 66, 70];

export function Lily({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-petal`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0" stopColor="#c3d79c" />
                    <stop offset="0.3" stopColor="#f3f6e6" />
                    <stop offset="0.7" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#e6e4da" />
                </linearGradient>
                <radialGradient id={`${id}-throat`}>
                    <stop offset="0" stopColor="#9fbf6a" />
                    <stop offset="1" stopColor="#e7efcf" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`${id}-calla`} x1="0" x2="1">
                    <stop offset="0" stopColor="#cfcabb" />
                    <stop offset="0.35" stopColor="#ffffff" />
                    <stop offset="0.75" stopColor="#f3efe4" />
                    <stop offset="1" stopColor="#c4bfae" />
                </linearGradient>
                <linearGradient id={`${id}-base`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0" stopColor="#6f9a4a" />
                    <stop offset="0.35" stopColor="#a9c98a" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={`${id}-bud`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0" stopColor="#6f9a4a" />
                    <stop offset="0.5" stopColor="#d9e6c0" />
                    <stop offset="1" stopColor="#fbfbf3" />
                </linearGradient>
                <linearGradient id={`${id}-leaf`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#6fae52" />
                    <stop offset="1" stopColor="#21501e" />
                </linearGradient>
                <linearGradient id={`${id}-satin`} x1="0" x2="1" y1="0" y2="0.4">
                    <stop offset="0" stopColor="#a8826a" />
                    <stop offset="0.35" stopColor="#f0dccb" />
                    <stop offset="0.5" stopColor="#fff8f2" />
                    <stop offset="0.7" stopColor="#e6c9b4" />
                    <stop offset="1" stopColor="#9a7660" />
                </linearGradient>
                <linearGradient id={`${id}-sheen`} x1="0" x2="1">
                    <SheenStops />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={122} rx={34} ry={4} />
            <Leaf id={id} x={58} y={92} angle={-118} len={50} />
            <Leaf id={id} x={62} y={92} angle={-62} len={50} />
            <Leaf id={id} x={57} y={96} angle={-158} len={32} />
            <Leaf id={id} x={63} y={96} angle={-24} len={32} />
            {/* Stems gather at the tie and fan out again below it */}
            {heads.map(([x, y]) => (
                <g key={`${String(x)}-${String(y)}`}>
                    <path
                        d={`M${String(x)} ${String(y)} Q${String((x + 60) / 2)} ${String(y + 40)} 60 95`}
                        fill="none"
                        stroke="#3f6e2b"
                        strokeWidth="2"
                    />
                    <path
                        d={`M${String(x - 0.5)} ${String(y)} Q${String((x + 60) / 2 - 0.5)} ${String(y + 40)} 59.5 95`}
                        fill="none"
                        stroke="#9cc77a"
                        strokeWidth="0.5"
                        opacity="0.8"
                    />
                </g>
            ))}
            {ends.map((x) => (
                <g key={x}>
                    <path
                        d={`M60 94 Q${String((x + 60) / 2)} 108 ${String(x)} 119`}
                        fill="none"
                        stroke="#3f6e2b"
                        strokeWidth="2"
                    />
                    <path
                        d={`M59.6 94 Q${String((x + 60) / 2 - 0.4)} 108 ${String(x - 0.4)} 119`}
                        fill="none"
                        stroke="#9cc77a"
                        strokeWidth="0.5"
                        opacity="0.8"
                    />
                    <ellipse cx={x} cy="119.5" rx="1.1" ry="0.6" fill="#cfe5b0" />
                </g>
            ))}
            <Bud id={id} x={16} y={70} size={1.1} angle={-38} />
            <Bud id={id} x={104} y={26} size={0.9} angle={28} />
            <LilyHead id={id} x={60} y={28} size={27} angle={-4} />
            <LilyHead id={id} x={30} y={48} size={22} angle={-32} />
            <LilyHead id={id} x={90} y={50} size={22} angle={30} />
            <Calla id={id} x={44} y={78} size={1.05} angle={-30} />
            <Calla id={id} x={78} y={80} size={1} angle={32} />
            {/* Satin ribbon: a wrapped band, two loops and long tails */}
            <path
                d="M58 97 C54 104 48 112 43 118 L48 117 L49 121 C54 112 58 104 61 98 Z"
                fill={`url(#${id}-satin)`}
            />
            <path
                d="M62 97 C66 104 72 112 77 118 L72 117 L71 121 C66 112 62 104 59 98 Z"
                fill={`url(#${id}-satin)`}
            />
            <path d="M51 90 Q60 93 69 90 L69 97 Q60 100 51 97 Z" fill={`url(#${id}-satin)`} />
            <path
                d="M51 90 Q60 93 69 90 L69 97 Q60 100 51 97 Z"
                fill={`url(#${id}-sheen)`}
                opacity="0.5"
            />
            <path d="M59 94 C49 84 37 86 39 94 C41 100 51 99 59 95 Z" fill={`url(#${id}-satin)`} />
            <path d="M61 94 C71 84 83 86 81 94 C79 100 69 99 61 95 Z" fill={`url(#${id}-satin)`} />
            <path
                d="M57 93.5 C50 89 43 89.5 43.5 93 C45 95.5 51 95.5 57 94.5 Z"
                fill="#7a5a48"
                opacity="0.4"
            />
            <path
                d="M63 93.5 C70 89 77 89.5 76.5 93 C75 95.5 69 95.5 63 94.5 Z"
                fill="#7a5a48"
                opacity="0.4"
            />
            <ellipse
                cx="60"
                cy="94.5"
                rx="3.2"
                ry="2.8"
                fill={`url(#${id}-satin)`}
                stroke="#9a7660"
                strokeWidth="0.4"
            />
        </g>
    );
}
