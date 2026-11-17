import { type Art, ContactShadow, gilt, GoldStops, SheenStops, Sparkle } from './kit';

interface BandProps {
    id: string;
    cx: number;
    cy: number;
}

// One wedding band standing in the cushion slit: a thick ring with a lit top edge and a dark inner wall.
function Band({ id, cx, cy }: BandProps) {
    const rx = 16;
    const ry = 19;
    const outer = `M${String(cx - rx)} ${String(cy)} a${String(rx)} ${String(ry)} 0 1 0 ${String(rx * 2)} 0 a${String(rx)} ${String(ry)} 0 1 0 ${String(-rx * 2)} 0 Z`;
    const inner = `M${String(cx - rx + 3.6)} ${String(cy + 0.6)} a${String(rx - 3.6)} ${String(ry - 3.4)} 0 1 1 ${String((rx - 3.6) * 2)} 0 a${String(rx - 3.6)} ${String(ry - 3.4)} 0 1 1 ${String(-(rx - 3.6) * 2)} 0 Z`;
    return (
        <g>
            <path d={`${outer} ${inner}`} fill={`url(#${id}-band)`} fillRule="evenodd" />
            <path d={inner} fill="none" stroke="#5c3a0c" strokeWidth="0.9" opacity="0.8" />
            <path
                d={`M${String(cx - rx + 1.2)} ${String(cy - 2)} A${String(rx - 1.2)} ${String(ry - 1.2)} 0 0 1 ${String(cx + 4)} ${String(cy - ry + 1.4)}`}
                fill="none"
                stroke="#fff7dc"
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.9"
            />
            <path
                d={`M${String(cx + rx - 1)} ${String(cy + 3)} A${String(rx - 1)} ${String(ry - 1)} 0 0 1 ${String(cx + 2)} ${String(cy + ry - 1)}`}
                fill="none"
                stroke="#ffe7a0"
                strokeWidth="0.7"
                strokeLinecap="round"
                opacity="0.7"
            />
        </g>
    );
}

export function RingBox({ id }: Art) {
    return (
        <g>
            <defs>
                <radialGradient id={`${id}-velvet`} cx="0.4" cy="0.35" r="0.8">
                    <stop offset="0" stopColor="#b3203f" />
                    <stop offset="0.55" stopColor="#7c0f27" />
                    <stop offset="1" stopColor="#3a0612" />
                </radialGradient>
                <linearGradient id={`${id}-front`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#4a0716" />
                    <stop offset="0.3" stopColor="#9c1834" />
                    <stop offset="0.55" stopColor="#8a1430" />
                    <stop offset="1" stopColor="#3a0511" />
                </linearGradient>
                <linearGradient id={`${id}-satin`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fffaf0" />
                    <stop offset="0.45" stopColor="#efe2c8" />
                    <stop offset="0.7" stopColor="#fdf6e6" />
                    <stop offset="1" stopColor="#cdb892" />
                </linearGradient>
                <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0.6">
                    <SheenStops />
                </linearGradient>
                <radialGradient id={`${id}-cushion`} cx="0.5" cy="0.2" r="0.9">
                    <stop offset="0" stopColor="#a81c3a" />
                    <stop offset="1" stopColor="#420818" />
                </radialGradient>
                <linearGradient id={`${id}-band`} x1="0" y1="0" x2="1" y2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-trim`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-ice`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.5" stopColor="#dbeaf7" />
                    <stop offset="1" stopColor="#8fb0cf" />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={122} rx={54} ry={5} />
            {/* Lid, open: velvet shell with its satin lining facing us */}
            <path
                d="M14 66 L19 12 Q20 5 27 5 L93 5 Q100 5 101 12 L106 66 Z"
                fill={`url(#${id}-velvet)`}
            />
            <path
                d="M21 62 L25 16 Q26 11 31 11 L89 11 Q94 11 95 16 L99 62 Z"
                fill={`url(#${id}-satin)`}
            />
            <path
                d="M24 46 L30 12 L52 12 L36 62 L22 62 Z"
                fill={`url(#${id}-sheen)`}
                opacity="0.7"
            />
            <path d="M58 62 L76 12 L84 12 L66 62 Z" fill={`url(#${id}-sheen)`} opacity="0.45" />
            <path
                d="M21 62 L25 16 Q26 11 31 11 L89 11 Q94 11 95 16 L99 62"
                fill="none"
                stroke={`url(#${id}-trim)`}
                strokeWidth="1.2"
            />
            <path
                d="M27 58 L30 19 Q31 16 34 16 L86 16 Q89 16 90 19 L93 58"
                fill="none"
                stroke="#b98a3a"
                strokeWidth="0.5"
                strokeDasharray="1.4 1.2"
                opacity="0.8"
            />
            {/* Box top and the plush cushion */}
            <path d="M12 66 L108 66 L111 82 L9 82 Z" fill="#2d040e" />
            <path d="M16 68 L104 68 L106 80 L14 80 Z" fill={`url(#${id}-cushion)`} />
            <path d="M15 74 Q60 70 105 74" fill="none" stroke="#24030b" strokeWidth="1.6" />
            <Band id={id} cx={46} cy={54} />
            <Band id={id} cx={73} cy={55} />
            {/* Brilliant-cut diamond in a four-prong crown */}
            <g transform="translate(73 37) scale(1.4) translate(-71 -46)">
                <path d="M65.5 44 L76.5 44 L74 47 L68 47 Z" fill={`url(#${id}-band)`} />
                <path d="M64 37 L78 37 L71 46 Z" fill="#7c9cbc" />
                <path d="M64 37 L71 46 L68 37 Z" fill="#dcecfa" />
                <path d="M74 37 L71 46 L78 37 Z" fill="#5c7d9e" />
                <path d="M68 37 L71 46 L74 37 Z" fill="#a9c6e2" />
                <path d="M66.5 32 L75.5 32 L78 37 L64 37 Z" fill={`url(#${id}-ice)`} />
                <path d="M66.5 32 L68 37 L64 37 Z" fill="#ffffff" />
                <path d="M75.5 32 L78 37 L74 37 Z" fill="#7d9fc2" />
                <path d="M68.5 32 L73.5 32 L72 35 L70 35 Z" fill="#f4faff" />
                <path d="M70 35 L72 35 L74 37 L68 37 Z" fill="#c4dbef" />
                <path
                    d="M64 37 L78 37 M66.5 32 L75.5 32 L78 37 L71 46 L64 37 Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.35"
                    opacity="0.9"
                />
                <path d="M65 36 L66 44 M77 36 L76 44" stroke={gilt} strokeWidth="1" />
                <Sparkle x={67} y={33} size={4.5} />
                <Sparkle x={78.5} y={29} size={2} />
            </g>
            {/* Cushion front roll hides the lower half of the bands */}
            <path d="M15 74 Q60 69 105 74 L106 80 L14 80 Z" fill={`url(#${id}-cushion)`} />
            <path
                d="M18 75.5 Q60 71.5 102 75.5"
                fill="none"
                stroke="#d24a66"
                strokeWidth="0.7"
                opacity="0.55"
            />
            {/* Box front */}
            <path
                d="M9 82 L111 82 L111 112 Q111 120 103 120 L17 120 Q9 120 9 112 Z"
                fill={`url(#${id}-front)`}
            />
            <path d="M14 86 Q40 84 60 85 L58 116 Q30 117 16 115 Z" fill="#ffffff" opacity="0.06" />
            <path d="M9 82 H111" stroke={gilt} strokeWidth="1.4" />
            <path d="M12 66 H108" stroke={gilt} strokeWidth="1" />
            <path d="M54 82 L66 82 L65 90 Q60 92 55 90 Z" fill={`url(#${id}-trim)`} />
            <circle cx="60" cy="87" r="1.3" fill="#6e4510" />
            <path
                d="M10.5 84 L10.5 112 Q10.5 118.5 17 118.5 L103 118.5 Q109.5 118.5 109.5 112 L109.5 84"
                fill="none"
                stroke="#d2405e"
                strokeWidth="0.6"
                opacity="0.45"
            />
            <Sparkle x={33} y={40} size={2.2} />
            <Sparkle x={58} y={37} size={1.6} />
        </g>
    );
}
