import { type Art, BrassStops, ContactShadow, gilt, Sparkle } from './kit';

interface PanelProps {
    id: string;
    d: string;
    glass: string;
}

// A stained-glass pane, lit from within: bright at the heart, jewel colour toward the frame.
function Pane({ id, d, glass }: PanelProps) {
    return (
        <g>
            <path d={d} fill={`url(#${id}-${glass})`} />
            <path d={d} fill={`url(#${id}-core)`} />
        </g>
    );
}

// Pointed-arch windows cut through the brass sheet of each face: left, centre, right.
const ARCH_C = 'M52 92 L52 66 Q52 58 60 54 Q68 58 68 66 L68 92 Z';
const ARCH_L = 'M39.5 90 L38.5 66 Q38.5 60 42.5 57 Q46.5 60 46.5 66 L46 90 Z';
const ARCH_R = 'M80.5 90 L81.5 66 Q81.5 60 77.5 57 Q73.5 60 73.5 66 L74 90 Z';

export function Lantern({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-brass`} x1="0" x2="1">
                    <BrassStops />
                </linearGradient>
                <linearGradient id={`${id}-brassv`} x1="0" y1="0" x2="0" y2="1">
                    <BrassStops />
                </linearGradient>
                <radialGradient id={`${id}-glow`}>
                    <stop offset="0" stopColor="#ffd77a" stopOpacity="0.75" />
                    <stop offset="0.5" stopColor="#ffb347" stopOpacity="0.25" />
                    <stop offset="1" stopColor="#ff9800" stopOpacity="0" />
                </radialGradient>
                <radialGradient id={`${id}-core`} cx="0.5" cy="0.62" r="0.6">
                    <stop offset="0" stopColor="#fff8dc" stopOpacity="0.95" />
                    <stop offset="0.45" stopColor="#ffe08a" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#ffe08a" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`${id}-ruby`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7a0d1e" />
                    <stop offset="0.6" stopColor="#d6283f" />
                    <stop offset="1" stopColor="#8f1022" />
                </linearGradient>
                <linearGradient id={`${id}-emerald`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0b4a37" />
                    <stop offset="0.6" stopColor="#1fa37a" />
                    <stop offset="1" stopColor="#0b5a40" />
                </linearGradient>
                <linearGradient id={`${id}-sapphire`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0c2a6b" />
                    <stop offset="0.6" stopColor="#2f6fd6" />
                    <stop offset="1" stopColor="#123a8a" />
                </linearGradient>
                <linearGradient id={`${id}-body`} x1="0" x2="1">
                    <stop offset="0" stopColor="#3a2406" />
                    <stop offset="0.18" stopColor="#8a5f18" />
                    <stop offset="0.42" stopColor="#d9b25a" />
                    <stop offset="0.58" stopColor="#b8892c" />
                    <stop offset="0.82" stopColor="#7a5212" />
                    <stop offset="1" stopColor="#2e1c04" />
                </linearGradient>
                <radialGradient id={`${id}-domeg`} cx="0.38" cy="0.3" r="0.85">
                    <stop offset="0" stopColor="#fff2c4" />
                    <stop offset="0.35" stopColor="#d1a245" />
                    <stop offset="0.8" stopColor="#6d4710" />
                    <stop offset="1" stopColor="#3a2406" />
                </radialGradient>
            </defs>
            {/* Warm light spilling out around the lantern and onto the card below */}
            <ellipse cx="60" cy="74" rx="58" ry="54" fill={`url(#${id}-glow)`} />
            <ContactShadow id={id} cx={60} cy={124} rx={22} ry={3} />
            {/* Chain, hanging ring and crescent finial */}
            {[1.5, 6.5].map((y) => (
                <ellipse
                    key={y}
                    cx="60"
                    cy={y + 1.5}
                    rx="1.6"
                    ry="2.6"
                    fill="none"
                    stroke={`url(#${id}-brass)`}
                    strokeWidth="1"
                />
            ))}
            <ellipse cx="60" cy="5.5" rx="0.7" ry="2.4" fill="#8a5f18" />
            <circle
                cx="60"
                cy="13.6"
                r="2.6"
                fill="none"
                stroke={`url(#${id}-brass)`}
                strokeWidth="1.2"
            />
            <path d="M64.5 17 a6.2 6.2 0 1 1 -9 0 a5 5 0 1 0 9 0 Z" fill={`url(#${id}-brass)`} />
            <circle cx="60" cy="27" r="2.2" fill={`url(#${id}-domeg)`} />
            <path d="M58.6 29 L61.4 29 L62.6 34 L57.4 34 Z" fill={`url(#${id}-brass)`} />
            <g transform="translate(60 0) scale(1.28 1) translate(-60 0)">
                {/* Onion dome, pierced with stars of light */}
                <path
                    d="M60 33 C66 36 78 40 80 50 L40 50 C42 40 54 36 60 33 Z"
                    fill={`url(#${id}-domeg)`}
                />
                {[
                    [60, 40, 1.3],
                    [53.5, 44, 1.1],
                    [66.5, 44, 1.1],
                    [47, 47.5, 0.9],
                    [73, 47.5, 0.9],
                    [60, 46.5, 1.1],
                ].map(([x = 0, y = 0, r = 1]) => (
                    <path
                        key={`${String(x)}-${String(y)}`}
                        d={`M${String(x)} ${String(y - r * 1.6)} L${String(x + r)} ${String(y)} L${String(x)} ${String(y + r * 1.6)} L${String(x - r)} ${String(y)} Z`}
                        fill="#fff3c4"
                    />
                ))}
                <path d="M37 50 L83 50 L84 55 L36 55 Z" fill={`url(#${id}-brass)`} />
                <path d="M36 55 H84" stroke="#3a2406" strokeWidth="0.6" />
                {/* Body: three faces of a hexagonal lantern */}
                <path d="M37 55 L83 55 L80 94 L40 94 Z" fill={`url(#${id}-body)`} />
                <Pane id={id} d={ARCH_L} glass="emerald" />
                <Pane id={id} d={ARCH_C} glass="ruby" />
                <Pane id={id} d={ARCH_R} glass="sapphire" />
                {/* Arabesque tracery over the glass: an eight-point star and lattice */}
                <g fill="none" stroke={`url(#${id}-brass)`} strokeWidth="1">
                    <path d="M55 68 L65 68 L65 78 L55 78 Z" />
                    <path d="M60 65.9 L67.1 73 L60 80.1 L52.9 73 Z" />
                    <path d="M52 84 Q60 80 68 84 M52 88 Q60 84 68 88 M56 58 Q60 62 64 58" />
                    <path d="M39 76 Q42.5 72 46.3 76 M39.2 82 Q42.5 78 46.2 82 M42.5 62 L42.5 88" />
                    <path d="M81 76 Q77.5 72 73.7 76 M80.8 82 Q77.5 78 73.8 82 M77.5 62 L77.5 88" />
                </g>
                <circle cx="60" cy="73" r="2" fill="#fff6d6" />
                <path
                    d={`${ARCH_L} ${ARCH_C} ${ARCH_R}`}
                    fill="none"
                    stroke="#5a3a0c"
                    strokeWidth="1.2"
                />
                <path
                    d={`${ARCH_L} ${ARCH_C} ${ARCH_R}`}
                    fill="none"
                    stroke="#f3d68a"
                    strokeWidth="0.4"
                />
                {/* Corner posts catch the light */}
                <path d="M48.5 55 L50.5 55 L50 94 L48 94 Z" fill="#f5dc96" opacity="0.7" />
                <path d="M69.5 55 L71.5 55 L72 94 L70 94 Z" fill="#3a2406" opacity="0.5" />
                {/* Lower band, bowl and drop finial */}
                <path d="M38 94 L82 94 L81 99 L39 99 Z" fill={`url(#${id}-brass)`} />
                <path d="M38 94 H82" stroke="#fff1c2" strokeWidth="0.5" />
                <path
                    d="M40 99 L80 99 C78 106 68 110 60 111 C52 110 42 106 40 99 Z"
                    fill={`url(#${id}-domeg)`}
                />
                {[46, 53, 60, 67, 74].map((x) => (
                    <circle key={x} cx={x} cy={102.5 + (x === 60 ? 1 : 0)} r="0.9" fill="#fff3c4" />
                ))}
                <path d="M57.5 111 L62.5 111 L61 116 L59 116 Z" fill={`url(#${id}-brassv)`} />
                <circle cx="60" cy="118.5" r="2.6" fill={`url(#${id}-domeg)`} />
                <path d="M60 121 L58.6 123.5 L61.4 123.5 Z" fill={gilt} />
            </g>
            <Sparkle x={44} y={41} size={2.6} />
            <Sparkle x={60} y={73} size={4} />
            <Sparkle x={93} y={66} size={2} />
        </g>
    );
}
