// Ceremony props, drawn for Toran: each ceremony card carries the object guests associate with it.
// Shaded with gradients and a soft drop shadow so they read as objects resting on the card.
import { useId } from 'react';

export type PropKind = 'mehndi' | 'kalash' | 'rings' | 'ghungroo' | 'bangles' | 'diya';

const shadow = 'drop-shadow(0 10px 14px rgba(0,0,0,0.28))';

function MehndiCones({ id }: { id: string }) {
    const cone = (rotate: number, dx: number) => (
        <g transform={`translate(${String(60 + dx)} 70) rotate(${String(rotate)})`}>
            <path d="M-11 -56 L11 -56 L2 52 L-2 52 Z" fill={`url(#${id}-cone)`} />
            <path d="M-11 -56 L11 -56 L10 -46 L-10 -46 Z" fill={`url(#${id}-gold)`} />
            {[-30, -12, 6, 24].map((y) => (
                <path
                    key={y}
                    d={`M${String(-8 + (y + 56) / 14)} ${String(y)} q${String(8 - (y + 56) / 14)} -5 ${String(16 - (y + 56) / 7)} 0`}
                    fill="none"
                    stroke="#d9b56a"
                    strokeWidth="1.1"
                    opacity="0.8"
                />
            ))}
            <path d="M-2 52 L2 52 L0 60 Z" fill="#3d2410" />
        </g>
    );
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-cone`} x1="0" x2="1">
                    <stop offset="0" stopColor="#5b3a1c" />
                    <stop offset="0.45" stopColor="#9a6a36" />
                    <stop offset="1" stopColor="#4a2e14" />
                </linearGradient>
                <linearGradient id={`${id}-gold`} x1="0" x2="1">
                    <stop offset="0" stopColor="#a6762a" />
                    <stop offset="0.5" stopColor="#f6dc98" />
                    <stop offset="1" stopColor="#a6762a" />
                </linearGradient>
            </defs>
            {cone(-18, -8)}
            {cone(14, 10)}
            <circle cx="62" cy="22" r="7" fill="#c2185b" />
            <circle cx="62" cy="22" r="3" fill="#f8bbd0" />
        </g>
    );
}

function Kalash({ id }: { id: string }) {
    return (
        <g>
            <defs>
                <radialGradient id={`${id}-brass`} cx="0.35" cy="0.35" r="0.8">
                    <stop offset="0" stopColor="#fff1c2" />
                    <stop offset="0.35" stopColor="#e0a93a" />
                    <stop offset="1" stopColor="#7a4f12" />
                </radialGradient>
                <radialGradient id={`${id}-coco`} cx="0.4" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#c9935a" />
                    <stop offset="1" stopColor="#5e3a1a" />
                </radialGradient>
            </defs>
            {[-60, -35, -12, 12, 35, 60].map((a) => (
                <path
                    key={a}
                    d="M60 50 q-6 -26 0 -46 q6 20 0 46 Z"
                    fill={a % 2 ? '#3f7d2e' : '#2f6b23'}
                    transform={`rotate(${String(a)} 60 50)`}
                />
            ))}
            <ellipse cx="60" cy="36" rx="16" ry="19" fill={`url(#${id}-coco)`} />
            <path d="M38 52 h44 l4 10 h-52 Z" fill="#c62828" />
            <path
                d="M40 62 C14 72 16 116 44 124 L76 124 C104 116 106 72 80 62 Z"
                fill={`url(#${id}-brass)`}
            />
            <path d="M30 90 Q60 100 90 90" fill="none" stroke="#c62828" strokeWidth="3" />
            <circle cx="60" cy="98" r="5" fill="#c62828" />
        </g>
    );
}

function RingBox({ id }: { id: string }) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-velvet`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#c62842" />
                    <stop offset="1" stopColor="#6d0f1f" />
                </linearGradient>
                <linearGradient id={`${id}-ring`} x1="0" x2="1">
                    <stop offset="0" stopColor="#9c6f1e" />
                    <stop offset="0.5" stopColor="#ffe9a8" />
                    <stop offset="1" stopColor="#9c6f1e" />
                </linearGradient>
            </defs>
            <path d="M18 40 Q60 2 102 40 L98 58 L22 58 Z" fill={`url(#${id}-velvet)`} />
            <path d="M14 62 h92 v38 q-46 18 -92 0 Z" fill={`url(#${id}-velvet)`} />
            <ellipse cx="60" cy="64" rx="44" ry="10" fill="#3d0812" />
            <ellipse
                cx="48"
                cy="62"
                rx="13"
                ry="9"
                fill="none"
                stroke={`url(#${id}-ring)`}
                strokeWidth="4"
            />
            <ellipse
                cx="70"
                cy="62"
                rx="13"
                ry="9"
                fill="none"
                stroke={`url(#${id}-ring)`}
                strokeWidth="4"
            />
        </g>
    );
}

function Ghungroo({ id }: { id: string }) {
    const bells = [
        [44, 92],
        [58, 98],
        [72, 92],
        [50, 80],
        [66, 80],
        [58, 108],
    ] as const;
    return (
        <g>
            <defs>
                <radialGradient id={`${id}-bell`} cx="0.35" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#fff4cc" />
                    <stop offset="0.45" stopColor="#d9a441" />
                    <stop offset="1" stopColor="#6e4a10" />
                </radialGradient>
            </defs>
            <path d="M58 6 C50 30 66 46 58 70" fill="none" stroke="#b71c1c" strokeWidth="4" />
            <path d="M52 8 l12 0 l-2 10 l-8 0 Z" fill="#b71c1c" />
            {bells.map(([x, y]) => (
                <g key={`${String(x)}-${String(y)}`}>
                    <circle cx={x} cy={y} r="7.5" fill={`url(#${id}-bell)`} />
                    <path
                        d={`M${String(x - 4)} ${String(y + 2)} h8`}
                        stroke="#5a3a08"
                        strokeWidth="1.2"
                    />
                </g>
            ))}
        </g>
    );
}

function Bangles({ id }: { id: string }) {
    const colors = ['#c2185b', '#d4af37', '#b71c1c', '#d4af37', '#ad1457'];
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-shine`} x1="0" x2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
            </defs>
            {colors.map((c, i) => (
                <g key={i} transform={`translate(${String(4 + i * 5)} ${String(54 + i * 7)})`}>
                    <ellipse
                        cx="56"
                        cy="0"
                        rx="42"
                        ry="14"
                        fill="none"
                        stroke={c}
                        strokeWidth="7"
                    />
                    <ellipse
                        cx="56"
                        cy="0"
                        rx="42"
                        ry="14"
                        fill="none"
                        stroke={`url(#${id}-shine)`}
                        strokeWidth="2"
                    />
                </g>
            ))}
        </g>
    );
}

function Diya({ id }: { id: string }) {
    return (
        <g>
            <defs>
                <radialGradient id={`${id}-flame`} cx="0.5" cy="0.7" r="0.6">
                    <stop offset="0" stopColor="#fffbe6" />
                    <stop offset="0.5" stopColor="#ffc93c" />
                    <stop offset="1" stopColor="#ff7a00" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`${id}-clay`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#c8743a" />
                    <stop offset="1" stopColor="#6e3315" />
                </linearGradient>
            </defs>
            <circle cx="60" cy="40" r="26" fill={`url(#${id}-flame)`} opacity="0.85" />
            <path d="M60 18 C70 34 70 46 60 54 C50 46 50 34 60 18 Z" fill="#ffb300" />
            <path d="M60 32 C64 40 64 46 60 50 C56 46 56 40 60 32 Z" fill="#fff3c4" />
            <path d="M18 60 Q60 104 102 60 L94 58 Q60 86 26 58 Z" fill={`url(#${id}-clay)`} />
            <path d="M14 58 h92" stroke="#e8a15a" strokeWidth="4" strokeLinecap="round" />
        </g>
    );
}

// Ceremony name → prop. Anything unknown gets a diya, which belongs at every gathering.
export function propFor(kind: string): PropKind {
    if (/mehndi|mehendi|henna/.test(kind)) return 'mehndi';
    if (/sangeet|garba|raas|dandiya|music/.test(kind)) return 'ghungroo';
    if (/haldi|pithi|chooda|mameru/.test(kind)) return 'bangles';
    if (/reception|ring|engage|roka|sagai/.test(kind)) return 'rings';
    if (
        /phera|wedding|vivah|hastmilap|ceremony|nikah|anand|laavan|chuppah|kalash|griha|vastu/.test(
            kind,
        )
    )
        return 'kalash';
    return 'diya';
}

interface CeremonyPropProps {
    kind: PropKind;
    className?: string;
}

export function CeremonyProp({ kind, className }: CeremonyPropProps) {
    const id = `prop-${useId().replace(/:/g, '')}`;
    return (
        <svg viewBox="0 0 120 130" className={className} style={{ filter: shadow }} aria-hidden>
            {kind === 'mehndi' && <MehndiCones id={id} />}
            {kind === 'kalash' && <Kalash id={id} />}
            {kind === 'rings' && <RingBox id={id} />}
            {kind === 'ghungroo' && <Ghungroo id={id} />}
            {kind === 'bangles' && <Bangles id={id} />}
            {kind === 'diya' && <Diya id={id} />}
        </svg>
    );
}
