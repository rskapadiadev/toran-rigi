import { type Art, ContactShadow, gilt, GoldStops, SheenStops, Sparkle } from './kit';

interface Band {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

// A woven zari strip: foil gold under a fine lattice, with a bright thread along the top.
function Zari({ id, x, y, w, h }: Band) {
    return (
        <g>
            <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-gold)`} />
            <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-zari)`} />
            <rect x={x} y={y} width={w} height="0.35" fill="#fff3c9" opacity="0.8" />
        </g>
    );
}

// A satin bow: two shaded loops with dark hollows, a knot and two cut tails.
function Bow({ id }: Art) {
    return (
        <g>
            <path d="M59 32 L50 47 L53.5 46 L55 49 L61 33 Z" fill={`url(#${id}-satin)`} />
            <path d="M61 32 L71 46 L67.5 45.5 L66.5 48.5 L59 33 Z" fill={`url(#${id}-satin)`} />
            <path d="M60 31 C52 18 38 18 40 27 C41 33 51 34 60 31 Z" fill={`url(#${id}-satin)`} />
            <path d="M60 31 C68 18 82 18 80 27 C79 33 69 34 60 31 Z" fill={`url(#${id}-satin)`} />
            <path
                d="M58 30 C52 24 45 23 44.5 27 C45 30 51 31 58 30 Z"
                fill="#6e4510"
                opacity="0.55"
            />
            <path
                d="M62 30 C68 24 75 23 75.5 27 C75 30 69 31 62 30 Z"
                fill="#6e4510"
                opacity="0.55"
            />
            <path
                d="M44 22.5 C49 20.5 54 23 57 27"
                fill="none"
                stroke="#fff8e0"
                strokeWidth="0.8"
                opacity="0.8"
            />
            <ellipse
                cx="60"
                cy="31"
                rx="3.4"
                ry="3"
                fill={`url(#${id}-satin)`}
                stroke="#8a5a14"
                strokeWidth="0.4"
            />
        </g>
    );
}

export function Gifts({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-gold`} x1="0" x2="1" y1="0" y2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-satin`} x1="0" x2="1" y1="0" y2="0.3">
                    <stop offset="0" stopColor="#8a5a14" />
                    <stop offset="0.35" stopColor="#f2d58a" />
                    <stop offset="0.5" stopColor="#fff7dc" />
                    <stop offset="0.7" stopColor="#d6a446" />
                    <stop offset="1" stopColor="#7a4f12" />
                </linearGradient>
                <linearGradient id={`${id}-sheen`} x1="0" x2="1">
                    <SheenStops />
                </linearGradient>
                <pattern id={`${id}-zari`} width="3.2" height="3.2" patternUnits="userSpaceOnUse">
                    <path
                        d="M1.6 0.3 L2.9 1.6 L1.6 2.9 L0.3 1.6 Z"
                        fill="none"
                        stroke="#6e4510"
                        strokeWidth="0.35"
                        opacity="0.7"
                    />
                    <circle cx="1.6" cy="1.6" r="0.35" fill="#fff6d0" />
                </pattern>
                <linearGradient id={`${id}-maroon`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#9e1a3a" />
                    <stop offset="0.5" stopColor="#6d0b24" />
                    <stop offset="1" stopColor="#36030f" />
                </linearGradient>
                <linearGradient id={`${id}-maroonTop`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#7d0f2b" />
                    <stop offset="1" stopColor="#c0294d" />
                </linearGradient>
                <linearGradient id={`${id}-emerald`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#23906a" />
                    <stop offset="0.5" stopColor="#0e5a3d" />
                    <stop offset="1" stopColor="#042a1c" />
                </linearGradient>
                <linearGradient id={`${id}-emeraldTop`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#0d4f36" />
                    <stop offset="1" stopColor="#2aa37a" />
                </linearGradient>
                <linearGradient id={`${id}-edge`} x1="0" x2="1">
                    <stop offset="0" stopColor="#12000a" stopOpacity="0.45" />
                    <stop offset="0.18" stopColor="#12000a" stopOpacity="0" />
                    <stop offset="0.45" stopColor="#fff" stopOpacity="0.1" />
                    <stop offset="0.82" stopColor="#12000a" stopOpacity="0" />
                    <stop offset="1" stopColor="#12000a" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id={`${id}-silk`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#ff6aa8" />
                    <stop offset="0.45" stopColor="#d81b6a" />
                    <stop offset="1" stopColor="#6e0835" />
                </linearGradient>
                <linearGradient id={`${id}-drape`} x1="0" x2="1">
                    <stop offset="0" stopColor="#6e0835" />
                    <stop offset="0.3" stopColor="#e83a84" />
                    <stop offset="0.55" stopColor="#a8124f" />
                    <stop offset="0.8" stopColor="#ff6aa8" />
                    <stop offset="1" stopColor="#8a0c44" />
                </linearGradient>
                <radialGradient id={`${id}-ruby`} cx="0.35" cy="0.3" r="0.7">
                    <stop offset="0" stopColor="#ffb3be" />
                    <stop offset="0.4" stopColor="#d4102f" />
                    <stop offset="1" stopColor="#5a0011" />
                </radialGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={122} rx={52} ry={4.5} />
            {/* Bottom box: maroon velvet with a zari-edged lid */}
            <rect x="14" y="94" width="92" height="27" rx="1.5" fill={`url(#${id}-maroon)`} />
            <rect x="14" y="94" width="92" height="27" rx="1.5" fill={`url(#${id}-edge)`} />
            <Zari id={id} x={14} y={114} w={92} h={3.2} />
            <path d="M18 76 L102 76 L109 84 L11 84 Z" fill={`url(#${id}-maroonTop)`} />
            <rect x="11" y="84" width="98" height="12" rx="1" fill={`url(#${id}-maroon)`} />
            <rect x="11" y="84" width="98" height="12" rx="1" fill={`url(#${id}-edge)`} />
            <Zari id={id} x={11} y={84} w={98} h={2.4} />
            <Zari id={id} x={11} y={93.4} w={98} h={2.4} />
            <rect x="11" y="96" width="98" height="1.4" fill="#1a0006" opacity="0.5" />
            {/* Satin ribbon down the front with a kundan medallion */}
            <path d="M55 76 L65 76 L65.6 84 L54.4 84 Z" fill={`url(#${id}-satin)`} />
            <rect x="54.4" y="84" width="11.2" height="37" fill={`url(#${id}-satin)`} />
            <circle
                cx="60"
                cy="104"
                r="4.6"
                fill={`url(#${id}-gold)`}
                stroke="#6e4510"
                strokeWidth="0.4"
            />
            <circle cx="60" cy="104" r="2.6" fill={`url(#${id}-ruby)`} />
            {/* Folded silk saree resting on the lid */}
            <path
                d="M26 64 L94 64 L100 80 C100 82 99 83 97 83 L23 83 C21 83 20 82 20 80 Z"
                fill={`url(#${id}-silk)`}
            />
            <path d="M30 58 L90 58 L94 64 L26 64 Z" fill="#e8508f" />
            <path d="M30 58 L90 58 L94 64 L26 64 Z" fill={`url(#${id}-sheen)`} opacity="0.6" />
            <path d="M23.5 72 L96.5 72" stroke="#5a0629" strokeWidth="0.9" opacity="0.55" />
            <path d="M23.4 72.9 L96.6 72.9" stroke="#ff8fbf" strokeWidth="0.5" opacity="0.6" />
            <path d="M22 76 L98 76 L99.2 80.6 L20.8 80.6 Z" fill={`url(#${id}-gold)`} />
            <path d="M22 76 L98 76 L99.2 80.6 L20.8 80.6 Z" fill={`url(#${id}-zari)`} />
            {[30, 42, 54, 66, 78, 90].map((x) => (
                <path
                    key={x}
                    d={`M${String(x)} 69 c1.6 -2.4 3.4 -0.8 2 0.8 c-0.8 1 -2 1.2 -2 -0.8 Z`}
                    fill={gilt}
                />
            ))}
            {/* The pallu falling over the side, ending in a heavy zari border and fringe */}
            <path
                d="M24 64 C18 74 15 88 12 102 L9 113 L27 115.5 C27 104 28 90 32 78 Z"
                fill={`url(#${id}-drape)`}
            />
            <path d="M9.8 105 L27.4 107.4 L27 115.5 L9 113 Z" fill={`url(#${id}-gold)`} />
            <path d="M9.8 105 L27.4 107.4 L27 115.5 L9 113 Z" fill={`url(#${id}-zari)`} />
            <path d="M10.4 101.5 L27.6 104" stroke={gilt} strokeWidth="0.8" />
            {[10, 13, 16, 19, 22, 25].map((x) => (
                <path
                    key={x}
                    d={`M${String(x)} ${String(113.4 + (x - 9) * 0.14)} l-0.3 3.6`}
                    stroke={gilt}
                    strokeWidth="0.7"
                    strokeLinecap="round"
                />
            ))}
            {/* Top box: emerald velvet tied with a satin bow */}
            <rect x="36" y="44" width="48" height="15" fill={`url(#${id}-emerald)`} />
            <rect x="36" y="44" width="48" height="15" fill={`url(#${id}-edge)`} />
            <path d="M38 30 L82 30 L86 36 L34 36 Z" fill={`url(#${id}-emeraldTop)`} />
            <rect x="34" y="36" width="52" height="9" rx="0.8" fill={`url(#${id}-emerald)`} />
            <rect x="34" y="36" width="52" height="9" rx="0.8" fill={`url(#${id}-edge)`} />
            <Zari id={id} x={34} y={36} w={52} h={1.8} />
            <Zari id={id} x={34} y={43.2} w={52} h={1.8} />
            <rect x="36" y="45" width="48" height="1" fill="#011a10" opacity="0.5" />
            <path d="M57 30 L63 30 L63.6 36 L56.4 36 Z" fill={`url(#${id}-satin)`} />
            <rect x="56.4" y="36" width="7.2" height="23" fill={`url(#${id}-satin)`} />
            <Bow id={id} />
            <Sparkle x={70} y={23} size={2.6} />
            <Sparkle x={96} y={86} size={2} />
            <Sparkle x={18} y={110} size={1.8} />
        </g>
    );
}
