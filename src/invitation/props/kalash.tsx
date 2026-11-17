import { type Art, ContactShadow, gilt, GoldStops, Sparkle } from './kit';

// The pot's outline: narrow neck, full round belly, tucked in above the foot.
const body =
    'M48 62 C47 68 28 72 25 90 C23 106 36 117 50 119 L70 119 C84 117 97 106 95 90 C92 72 73 68 72 62 Z';

// Mango leaves fanned out from under the coconut: [angle, scale]. Back ones first.
const backLeaves = [
    [-150, 1],
    [-118, 1.12],
    [-62, 1.12],
    [-30, 1],
] as const;
const frontLeaves = [
    [-172, 0.95],
    [-8, 0.95],
    [158, 0.8],
    [22, 0.8],
] as const;

// A point on the shoulder band, so painted marks follow the pot's curve.
function onBand(t: number, cy: number, rx: number, ry: number): [number, number] {
    return [60 + rx * Math.cos(t), cy + ry * Math.sin(t)];
}

interface LeafProps {
    id: string;
    angle: number;
    k: number;
}

function MangoLeaf({ id, angle, k }: LeafProps) {
    return (
        <g transform={`translate(60 55) rotate(${String(angle)}) scale(${String(k)})`}>
            <path d="M2 0 C10 -7 26 -7 38 0 C26 6 10 6 2 0 Z" fill={`url(#${id}-leaf)`} />
            <path d="M2 0 C10 -7 26 -7 38 0 Z" fill="#7fb85a" opacity="0.35" />
            <path d="M2 0 Q20 -0.8 37 0" fill="none" stroke="#d8eab0" strokeWidth="0.6" />
            <path
                d="M10 -0.5 l4 -3 M17 -0.6 l4 -3.2 M24 -0.5 l4 -2.6 M12 0.4 l4 2.6 M20 0.4 l4 2.4"
                fill="none"
                stroke="#1d4413"
                strokeWidth="0.35"
                opacity="0.6"
            />
        </g>
    );
}

export function Kalash({ id }: Art) {
    const dots = [0.35, 0.75, 1.15, 1.57, 1.99, 2.39, 2.79].map((t) => onBand(t, 80, 33, 7));
    const petals = [0.3, 0.62, 0.94, 1.26, 1.57, 1.88, 2.2, 2.52, 2.84].map((t) =>
        onBand(t, 90, 36, 8),
    );
    return (
        <g>
            <defs>
                <radialGradient id={`${id}-brass`} cx="0.36" cy="0.42" r="0.72">
                    <stop offset="0" stopColor="#fff4cf" />
                    <stop offset="0.18" stopColor="#f0c862" />
                    <stop offset="0.52" stopColor="#b98424" />
                    <stop offset="0.85" stopColor="#6a460c" />
                    <stop offset="1" stopColor="#8f6418" />
                </radialGradient>
                <linearGradient id={`${id}-gold`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-leaf`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#4f8d32" />
                    <stop offset="0.5" stopColor="#2f6b20" />
                    <stop offset="1" stopColor="#173d0f" />
                </linearGradient>
                <radialGradient id={`${id}-coco`} cx="0.38" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#c98f55" />
                    <stop offset="0.55" stopColor="#8a5626" />
                    <stop offset="1" stopColor="#3e220c" />
                </radialGradient>
                <radialGradient id={`${id}-cloth`} cx="0.35" cy="0.25" r="0.9">
                    <stop offset="0" stopColor="#ef4b4b" />
                    <stop offset="0.5" stopColor="#b3141b" />
                    <stop offset="1" stopColor="#5e060b" />
                </radialGradient>
                <radialGradient id={`${id}-hi`} cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
                <pattern id={`${id}-hammer`} width="5" height="4.4" patternUnits="userSpaceOnUse">
                    <circle cx="1.3" cy="1.2" r="0.9" fill="#fff6d8" opacity="0.1" />
                    <circle cx="3.8" cy="3.4" r="0.9" fill="#3b2504" opacity="0.09" />
                </pattern>
                <clipPath id={`${id}-pot`}>
                    <path d={body} />
                </clipPath>
            </defs>
            <ContactShadow id={id} cx={60} cy={124} rx={34} ry={4} />

            {backLeaves.map(([a, k]) => (
                <MangoLeaf key={a} id={id} angle={a} k={k} />
            ))}

            {/* The coconut, husk fibres showing above its red wrap */}
            <path
                d="M60 13 C71 15 78 29 78 40 C78 50 71 56 60 56 C49 56 42 50 42 40 C42 29 49 15 60 13 Z"
                fill={`url(#${id}-coco)`}
            />
            <path
                d="M54 18 Q50 26 49 34 M58 16 Q56 26 56 34 M63 16 Q65 25 66 33 M67 19 Q71 27 72 34 M51 24 Q47 30 46 36"
                fill="none"
                stroke="#3a1f0a"
                strokeWidth="0.6"
                opacity="0.7"
            />
            <path
                d="M56 21 Q54 27 53 32 M61 19 Q62 25 62 30"
                fill="none"
                stroke="#e8b47a"
                strokeWidth="0.6"
                opacity="0.6"
            />
            <path
                d="M60 14 l-3 -6 M60 14 l1 -7 M60 14 l4 -5"
                stroke="#6b4220"
                strokeWidth="0.9"
                strokeLinecap="round"
            />

            {/* Red chunri wrapped round the coconut, gathered in folds with a zari edge */}
            <path
                d="M42 38 C48 33 72 33 78 38 C80 46 79 52 76 56 L44 56 C41 52 40 46 42 38 Z"
                fill={`url(#${id}-cloth)`}
            />
            <path
                d="M47 38 Q49 47 47 55 M54 36 Q55 46 54 56 M61 36 Q62 46 61 56 M68 36 Q69 46 68 55 M74 38 Q75 47 74 55"
                fill="none"
                stroke="#5e060b"
                strokeWidth="1.1"
                opacity="0.55"
            />
            <path
                d="M49 38 Q51 47 49 55 M57 36 Q58 46 57 56 M64 36 Q65 46 64 56"
                fill="none"
                stroke="#ff8a80"
                strokeWidth="0.7"
                opacity="0.45"
            />
            <path
                d="M42 38 C48 33 72 33 78 38"
                fill="none"
                stroke={`url(#${id}-gold)`}
                strokeWidth="2.2"
            />
            <path
                d="M43 39.5 C49 35 71 35 77 39.5"
                fill="none"
                stroke="#fff1c2"
                strokeWidth="0.6"
                strokeDasharray="0.8 1.6"
            />

            {frontLeaves.map(([a, k]) => (
                <MangoLeaf key={a} id={id} angle={a} k={k} />
            ))}

            {/* The brass pot: belly, hammered texture, shoulder engraving */}
            <path d={body} fill={`url(#${id}-brass)`} />
            <g clipPath={`url(#${id}-pot)`}>
                <rect x="20" y="60" width="80" height="62" fill={`url(#${id}-hammer)`} />
                <path
                    d="M92 76 C99 90 97 108 80 118"
                    fill="none"
                    stroke="#ffe6a3"
                    strokeWidth="2.4"
                    opacity="0.45"
                />
                <ellipse cx="60" cy="122" rx="40" ry="10" fill="#2e1c03" opacity="0.35" />
                <ellipse cx="42" cy="86" rx="9" ry="15" fill={`url(#${id}-hi)`} opacity="0.85" />
                <ellipse
                    cx="39"
                    cy="84"
                    rx="2.2"
                    ry="9"
                    fill="#ffffff"
                    opacity="0.55"
                    transform="rotate(14 39 84)"
                />
                <path d="M27 80 Q60 94 93 80" fill="none" stroke="#5e3d08" strokeWidth="0.8" />
                <path d="M25 84 Q60 99 95 84" fill="none" stroke="#fff0bf" strokeWidth="0.6" />
                <path d="M24 98 Q60 113 96 98" fill="none" stroke="#5e3d08" strokeWidth="0.8" />
                {petals.map(([x, y]) => (
                    <path
                        key={x}
                        d={`M${String(x - 3)} ${String(y + 4)} Q${String(x)} ${String(y - 5)} ${String(x + 3)} ${String(y + 4)}`}
                        fill="none"
                        stroke="#5e3d08"
                        strokeWidth="0.7"
                        opacity="0.8"
                    />
                ))}
                {dots.map(([x, y], i) => (
                    <circle
                        key={x}
                        cx={x}
                        cy={y + 4}
                        r={i === 3 ? 2.6 : 1.3}
                        fill={i % 2 ? '#f4b400' : '#c62828'}
                    />
                ))}
            </g>

            {/* Foot */}
            <path d="M47 118 L73 118 L78 123 L42 123 Z" fill={`url(#${id}-gold)`} />
            <ellipse cx="60" cy="123" rx="18" ry="2" fill="#5a3a08" />

            {/* Neck wound with red and yellow mauli thread, then the flared lip */}
            <path d="M47 60 L73 60 L72 68 L48 68 Z" fill="#8a5c12" />
            {[61, 62.8, 64.6, 66.4].map((y, i) => (
                <path
                    key={y}
                    d={`M47.5 ${String(y)} Q60 ${String(y + 2.4)} 72.5 ${String(y)}`}
                    fill="none"
                    stroke={i % 2 ? '#f6b300' : '#d32f2f'}
                    strokeWidth="1.7"
                />
            ))}
            <path
                d="M52 67.5 q-2 5 -1 9 M53.5 67.8 q0 5 1.5 8.5"
                fill="none"
                stroke="#d32f2f"
                strokeWidth="0.9"
                strokeLinecap="round"
            />
            <ellipse cx="60" cy="59.5" rx="22" ry="4.6" fill="#5a3a08" />
            <ellipse cx="60" cy="58" rx="22" ry="4.4" fill={`url(#${id}-gold)`} />
            <ellipse cx="60" cy="57.4" rx="17" ry="2.6" fill="#7a4f12" opacity="0.5" />
            <path d="M39 58.5 Q60 65 81 58.5" fill="none" stroke="#5a3a08" strokeWidth="0.9" />
            <path d="M42 57 Q60 54.5 78 57" fill="none" stroke={gilt} strokeWidth="0.5" />
            <Sparkle x={41} y={79} size={3.4} />
            <Sparkle x={72} y={57.5} size={2.2} />
        </g>
    );
}
