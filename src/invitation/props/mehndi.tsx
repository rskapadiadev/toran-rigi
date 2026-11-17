import { type Art, ContactShadow, GoldStops, SheenStops, Sparkle } from './kit';

interface ConeProps {
    id: string;
    x: number;
    y: number;
    angle: number;
}

// One rolled cellophane cone: glossy henna seen through clear film, a foil collar and crimped top.
function Cone({ id, x, y, angle }: ConeProps) {
    const body = 'M-11 -46 L11 -46 L1.4 47 Q0 49.5 -1.4 47 Z';
    return (
        <g
            transform={`translate(${String(x)} ${String(y)}) rotate(${String(angle)}) scale(1.3 0.94)`}
        >
            {/* Crimped, twisted cellophane closing the top */}
            <path
                d="M-10.5 -46 C-7 -48 -3 -50 -2 -52.5 L-5.5 -58 C-2 -60.5 3 -60.5 6 -57.5 L2 -52.5 C3 -50 7 -48 10.5 -46 Z"
                fill={`url(#${id}-film)`}
                stroke="#e9eef2"
                strokeWidth="0.5"
            />
            <path
                d="M-4 -57.5 L-0.6 -52.6 M2 -59 L0.8 -52.6 M-6 -47.4 Q-2 -49 -1.4 -52 M5 -47.6 Q1.6 -49.6 1.2 -52.4"
                stroke="#ffffff"
                strokeWidth="0.6"
                opacity="0.7"
            />
            {/* Henna paste, glossy and nearly black-green at the core */}
            <path d={body} fill={`url(#${id}-henna)`} />
            {/* The film: rolled seam spirals and a hard specular stripe */}
            <path d={body} fill={`url(#${id}-gloss)`} />
            {[-30, -12, 6, 24].map((s) => (
                <path
                    key={s}
                    d={`M${String(-10 + (s + 46) / 10)} ${String(s + 6)} Q0 ${String(s - 2)} ${String(10 - (s + 46) / 10)} ${String(s - 6)}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.55"
                    opacity="0.45"
                />
            ))}
            <path
                d="M-7.5 -36 L-1.6 36"
                stroke="#ffffff"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.75"
            />
            <path
                d="M5.5 -36 L1.2 30"
                stroke="#ffffff"
                strokeWidth="0.5"
                strokeLinecap="round"
                opacity="0.4"
            />
            {/* Gold foil collar with embossed beading, then a slim wine foil band */}
            <path d="M-11.2 -46 L11.2 -46 L10.3 -37 L-10.3 -37 Z" fill={`url(#${id}-gold)`} />
            <path
                d="M-10.8 -43 L10.8 -43 M-10.4 -39.5 L10.4 -39.5"
                stroke="#7a4f12"
                strokeWidth="0.5"
                strokeDasharray="0.8 1.1"
            />
            <path d="M-11.2 -46 L11.2 -46" stroke="#fff1c2" strokeWidth="0.6" />
            <path d="M-8.6 -21 L8.6 -21 L8 -15 L-8 -15 Z" fill={`url(#${id}-wine)`} />
            <path d="M-8.6 -21 L8.6 -21 M-8 -15 L8 -15" stroke={`#e2b55a`} strokeWidth="0.7" />
            {[-5, -1.5, 2, 5.5].map((d) => (
                <circle key={d} cx={d} cy={-18} r="0.6" fill="#f6dc98" />
            ))}
            {/* The tip, bright with a fresh bead of henna */}
            <path d="M-1.4 47 Q0 49.5 1.4 47 L0.4 52 Q0 53 -0.4 52 Z" fill="#2a1306" />
        </g>
    );
}

export function MehndiCones({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-henna`} x1="0" x2="1">
                    <stop offset="0" stopColor="#1b0d04" />
                    <stop offset="0.25" stopColor="#4a3412" />
                    <stop offset="0.42" stopColor="#86662e" />
                    <stop offset="0.62" stopColor="#3b2a0b" />
                    <stop offset="0.9" stopColor="#1f1005" />
                    <stop offset="1" stopColor="#3a2410" />
                </linearGradient>
                <linearGradient id={`${id}-gloss`} x1="0" x2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
                    <stop offset="0.12" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="0.8" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="1" stopColor="#dfe8ee" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient id={`${id}-film`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="0.5" stopColor="#c9d6de" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#9aa8b2" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id={`${id}-gold`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-wine`} x1="0" x2="1">
                    <stop offset="0" stopColor="#4a0716" />
                    <stop offset="0.4" stopColor="#b3173c" />
                    <stop offset="1" stopColor="#3d0612" />
                </linearGradient>
                <linearGradient id={`${id}-brass`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <radialGradient id={`${id}-paste`} cx="0.4" cy="0.35" r="0.7">
                    <stop offset="0" stopColor="#8a8a3a" />
                    <stop offset="0.6" stopColor="#5a5a1f" />
                    <stop offset="1" stopColor="#36360f" />
                </radialGradient>
                <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#7fb04a" />
                    <stop offset="0.5" stopColor="#3f7a26" />
                    <stop offset="1" stopColor="#24511a" />
                </linearGradient>
                <linearGradient id={`${id}-sheen`} x1="0" x2="1">
                    <SheenStops />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={62} cy={122} rx={50} ry={5} />

            {/* A brass katori of fresh green henna paste */}
            <path d="M76 110 Q78 124 93 124 Q108 124 110 110 Z" fill={`url(#${id}-brass)`} />
            <ellipse cx="93" cy="110" rx="17" ry="4.6" fill={`url(#${id}-brass)`} />
            <ellipse cx="93" cy="110.4" rx="14.6" ry="3.4" fill={`url(#${id}-paste)`} />
            <path
                d="M84 110 Q90 107.6 96 109.4 Q100 110.6 103 109"
                fill="none"
                stroke="#c7c77a"
                strokeWidth="0.7"
                opacity="0.7"
            />
            <path d="M80 114 Q93 118 106 114" fill="none" stroke="#fff1c2" strokeWidth="0.6" />
            <path
                d="M98 108 C102 100 108 98 112 98 C110 103 105 107 98 108 Z"
                fill={`url(#${id}-leaf)`}
            />
            <path d="M98 108 Q105 102 112 98" stroke="#a8cf7a" strokeWidth="0.5" fill="none" />

            {/* A sprig of henna leaves on the left */}
            {[
                [14, 118, -20, 1],
                [22, 112, -48, 0.85],
                [30, 116, -8, 0.9],
                [18, 122, 14, 0.8],
            ].map(([lx, ly, a, s]) => (
                <g
                    key={`${String(lx)}-${String(ly)}`}
                    transform={`translate(${String(lx)} ${String(ly)}) rotate(${String(a)}) scale(${String(s)})`}
                >
                    <path d="M0 0 C5 -6 15 -6 20 0 C15 6 5 6 0 0 Z" fill={`url(#${id}-leaf)`} />
                    <path d="M1 0 L19 0" stroke="#a8cf7a" strokeWidth="0.5" />
                </g>
            ))}

            <Cone id={id} x={74} y={60} angle={22} />
            <Cone id={id} x={48} y={62} angle={-18} />

            {/* A delicate line of henna piped from the front cone */}
            <path
                d="M63 110 C62 118 54 120 50 117 C46 114 50 110 54 112 C57 114 55 117 52 116"
                fill="none"
                stroke="#3d1c08"
                strokeWidth="1.3"
                strokeLinecap="round"
            />
            <circle cx="63" cy="109.6" r="1.4" fill="#3d1c08" />
            <circle cx="62.6" cy="109.2" r="0.45" fill="#ffffff" opacity="0.8" />
            <Sparkle x={40} y={20} size={3.4} />
            <Sparkle x={91} y={18} size={2.4} />
        </g>
    );
}
