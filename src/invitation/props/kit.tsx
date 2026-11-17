// The shared kit every ceremony prop is drawn with: metals, flowers and leaves, so the whole set
// reads as one family. Each prop lives in its own file beside this one (see index.tsx).

// Solid gold for hairlines: a gradient cannot paint a perfectly straight vertical line.
export const gilt = '#d4a24a';

export interface Art {
    id: string;
}

// Foil gold, used by nearly every prop: deep shadow, bright highlight, warm mid-tones.
export function GoldStops() {
    return (
        <>
            <stop offset="0" stopColor="#7a4f12" />
            <stop offset="0.28" stopColor="#d9a441" />
            <stop offset="0.5" stopColor="#fff1c2" />
            <stop offset="0.72" stopColor="#c8912e" />
            <stop offset="1" stopColor="#6e4510" />
        </>
    );
}

export interface FlowerProps {
    cx: number;
    cy: number;
    r: number;
}

// A marigold: ruffled rings of petals, darker at the heart.
export function Marigold({ cx, cy, r }: FlowerProps) {
    return (
        <g>
            <circle cx={cx} cy={cy} r={r} fill="#e65100" />
            <circle
                cx={cx}
                cy={cy}
                r={r * 0.92}
                fill="none"
                stroke="#ffa000"
                strokeWidth={r * 0.34}
                strokeDasharray={`${String(r * 0.32)} ${String(r * 0.18)}`}
            />
            <circle cx={cx} cy={cy} r={r * 0.58} fill="#ffb300" />
            <circle
                cx={cx}
                cy={cy}
                r={r * 0.5}
                fill="none"
                stroke="#ffd54f"
                strokeWidth={r * 0.22}
                strokeDasharray={`${String(r * 0.2)} ${String(r * 0.14)}`}
            />
            <circle cx={cx} cy={cy} r={r * 0.2} fill="#bf6a00" />
        </g>
    );
}

export interface RoseProps extends FlowerProps {
    color: string;
    light: string;
}

// A rose seen from above: a spiral of petals.
export function Rose({ cx, cy, r, color, light }: RoseProps) {
    return (
        <g>
            <circle cx={cx} cy={cy} r={r} fill={color} />
            <path
                d={`M${String(cx)} ${String(cy)} m${String(-r * 0.15)} 0 a${String(r * 0.2)} ${String(r * 0.2)} 0 1 1 ${String(r * 0.32)} ${String(r * 0.1)} a${String(r * 0.42)} ${String(r * 0.42)} 0 1 1 ${String(-r * 0.7)} ${String(-r * 0.2)} a${String(r * 0.66)} ${String(r * 0.66)} 0 1 1 ${String(r * 1.1)} ${String(r * 0.4)}`}
                fill="none"
                stroke={light}
                strokeWidth={r * 0.14}
                strokeLinecap="round"
            />
        </g>
    );
}

export interface LeafProps {
    x: number;
    y: number;
    angle: number;
    size?: number;
}

export function Leaf({ x, y, angle, size = 1 }: LeafProps) {
    return (
        <path
            d="M0 0 C6 -8 18 -8 24 0 C18 8 6 8 0 0 Z"
            fill="#2f6b23"
            stroke="#3f8a2e"
            strokeWidth="0.8"
            transform={`translate(${String(x)} ${String(y)}) rotate(${String(angle)}) scale(${String(size)})`}
        />
    );
}

// Polished brass: darker and more olive than foil gold, for lamps, urlis and kalash.
export function BrassStops() {
    return (
        <>
            <stop offset="0" stopColor="#4a3108" />
            <stop offset="0.22" stopColor="#a8761f" />
            <stop offset="0.45" stopColor="#f7dc8f" />
            <stop offset="0.55" stopColor="#fff6d8" />
            <stop offset="0.75" stopColor="#b88a2c" />
            <stop offset="1" stopColor="#3f2a06" />
        </>
    );
}

// Hammered copper, for the havan kund and lotas.
export function CopperStops() {
    return (
        <>
            <stop offset="0" stopColor="#3d1606" />
            <stop offset="0.3" stopColor="#a4502a" />
            <stop offset="0.5" stopColor="#f2a57a" />
            <stop offset="0.7" stopColor="#b5602f" />
            <stop offset="1" stopColor="#3d1606" />
        </>
    );
}

// Bright silver and platinum, for ring bands, cake pearls and microphone grilles.
export function SilverStops() {
    return (
        <>
            <stop offset="0" stopColor="#5d6168" />
            <stop offset="0.35" stopColor="#c9ced6" />
            <stop offset="0.5" stopColor="#ffffff" />
            <stop offset="0.65" stopColor="#b3b9c2" />
            <stop offset="1" stopColor="#4b4f56" />
        </>
    );
}

// A soft white band across a curved surface: satin, glass or polished metal catching the light.
export function SheenStops() {
    return (
        <>
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </>
    );
}

interface ShadowProps {
    id: string;
    cx: number;
    cy: number;
    rx: number;
    ry?: number;
}

// The soft pool of shadow an object casts on the card beneath it: it sits the prop on the paper.
export function ContactShadow({ id, cx, cy, rx, ry = 4 }: ShadowProps) {
    return (
        <>
            <defs>
                <radialGradient id={`${id}-contact`}>
                    <stop offset="0" stopColor="#1a0d05" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#1a0d05" stopOpacity="0" />
                </radialGradient>
            </defs>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-contact)`} />
        </>
    );
}

interface SparkleProps {
    x: number;
    y: number;
    size?: number;
}

// A four-point glint where light hits a gem or polished edge.
export function Sparkle({ x, y, size = 4 }: SparkleProps) {
    const s = size;
    return (
        <path
            d={`M${String(x)} ${String(y - s)} Q${String(x + s * 0.15)} ${String(y - s * 0.15)} ${String(x + s)} ${String(y)} Q${String(x + s * 0.15)} ${String(y + s * 0.15)} ${String(x)} ${String(y + s)} Q${String(x - s * 0.15)} ${String(y + s * 0.15)} ${String(x - s)} ${String(y)} Q${String(x - s * 0.15)} ${String(y - s * 0.15)} ${String(x)} ${String(y - s)} Z`}
            fill="#fffdf2"
        />
    );
}
