import { type Art, ContactShadow, GoldStops } from './kit';

interface TierProps {
    id: string;
    x: number;
    top: number;
    w: number;
    h: number;
}

const RY = 4.5;

// One fondant tier in gentle perspective: a curved front, a lit top, gold leaf and a pearl border.
function Tier({ id, x, top, w, h }: TierProps) {
    const rx = w / 2;
    const cx = x + rx;
    const base = top + h;
    const arc = (y: number) => `A${String(rx)} ${String(RY)} 0 0 0 ${String(x + w)} ${String(y)}`;
    const count = Math.round(w / 4.2);
    const pearls = Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count;
        const px = x + t * w;
        const py = base + Math.sin(Math.PI * t) * RY - 0.6;
        return [px, py];
    });
    return (
        <g>
            <path
                d={`M${String(x)} ${String(top)} L${String(x)} ${String(base)} ${arc(base)} L${String(x + w)} ${String(top)} Z`}
                fill={`url(#${id}-fondant)`}
            />
            {/* Gold leaf band, a third of the way up */}
            <path
                d={`M${String(x)} ${String(base - h * 0.42)} ${arc(base - h * 0.42)} L${String(x + w)} ${String(base - h * 0.3)} A${String(rx)} ${String(RY)} 0 0 1 ${String(x)} ${String(base - h * 0.3)} Z`}
                fill={`url(#${id}-gold)`}
            />
            <path
                d={`M${String(x + 2)} ${String(base - h * 0.42 + 2)} A${String(rx)} ${String(RY)} 0 0 0 ${String(x + w - 2)} ${String(base - h * 0.42 + 2)}`}
                fill="none"
                stroke="#fff1c2"
                strokeWidth="0.4"
                opacity="0.7"
            />
            <ellipse cx={cx} cy={top} rx={rx} ry={RY} fill={`url(#${id}-top)`} />
            <path
                d={`M${String(x + 1)} ${String(top + 0.6)} A${String(rx - 1)} ${String(RY)} 0 0 0 ${String(x + w - 1)} ${String(top + 0.6)}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.8"
                opacity="0.9"
            />
            {pearls.map(([px = 0, py = 0]) => (
                <circle key={px} cx={px} cy={py} r="1.65" fill={`url(#${id}-pearl)`} />
            ))}
        </g>
    );
}

interface SugarRoseProps {
    id: string;
    cx: number;
    cy: number;
    r: number;
    tone: 'blush' | 'ivory';
}

// A sugar rose: five cupped outer petals around a tight, shaded bud.
function SugarRose({ id, cx, cy, r, tone }: SugarRoseProps) {
    const edge = tone === 'blush' ? '#a8445c' : '#ad8f62';
    const s = (n: number) => String(n);
    const petals = [0, 72, 144, 216, 288].map((deg) => {
        const a = ((deg - 54) * Math.PI) / 180;
        return [cx + Math.cos(a) * r * 0.42, cy + Math.sin(a) * r * 0.42];
    });
    return (
        <g>
            <circle cx={cx} cy={cy} r={r} fill={edge} />
            {petals.map(([px = 0, py = 0]) => (
                <circle
                    key={`${s(px)}-${s(py)}`}
                    cx={px}
                    cy={py}
                    r={r * 0.58}
                    fill={`url(#${id}-${tone})`}
                    stroke={edge}
                    strokeWidth={r * 0.05}
                    strokeOpacity="0.6"
                />
            ))}
            <circle cx={cx} cy={cy} r={r * 0.44} fill={`url(#${id}-${tone})`} />
            <path
                d={`M${s(cx - r * 0.3)} ${s(cy + r * 0.05)} Q${s(cx - r * 0.2)} ${s(cy + r * 0.38)} ${s(cx + r * 0.22)} ${s(cy + r * 0.22)} Q${s(cx + r * 0.36)} ${s(cy - r * 0.2)} ${s(cx)} ${s(cy - r * 0.26)} Q${s(cx - r * 0.16)} ${s(cy - r * 0.06)} ${s(cx + r * 0.06)} ${s(cy + r * 0.04)}`}
                fill="none"
                stroke={edge}
                strokeWidth={r * 0.09}
                strokeLinecap="round"
            />
            <path
                d={`M${s(cx - r * 0.82)} ${s(cy - r * 0.2)} Q${s(cx - r * 0.6)} ${s(cy - r * 0.86)} ${s(cx)} ${s(cy - r * 0.9)}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth={r * 0.1}
                strokeLinecap="round"
                opacity="0.7"
            />
        </g>
    );
}

interface LeafProps {
    id: string;
    x: number;
    y: number;
    angle: number;
    size: number;
}

function Greenery({ id, x, y, angle, size }: LeafProps) {
    return (
        <g
            transform={`translate(${String(x)} ${String(y)}) rotate(${String(angle)}) scale(${String(size)})`}
        >
            <path d="M0 0 C5 -6 14 -6 19 0 C14 5 5 5 0 0 Z" fill={`url(#${id}-leaf)`} />
            <path d="M1 0 Q9 -0.8 17 0" fill="none" stroke="#a9c98a" strokeWidth="0.5" />
        </g>
    );
}

export function Cake({ id }: Art) {
    return (
        <g>
            <defs>
                <linearGradient id={`${id}-gold`} x1="0" x2="1">
                    <GoldStops />
                </linearGradient>
                <linearGradient id={`${id}-fondant`} x1="0" x2="1">
                    <stop offset="0" stopColor="#d8c6a6" />
                    <stop offset="0.18" stopColor="#f6eddc" />
                    <stop offset="0.38" stopColor="#fffdf8" />
                    <stop offset="0.7" stopColor="#f1e6d1" />
                    <stop offset="1" stopColor="#bfa983" />
                </linearGradient>
                <radialGradient id={`${id}-top`} cx="0.4" cy="0.4" r="0.7">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#efe3cc" />
                </radialGradient>
                <radialGradient id={`${id}-pearl`} cx="0.35" cy="0.3" r="0.7">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.6" stopColor="#f1e8dc" />
                    <stop offset="1" stopColor="#b9a88f" />
                </radialGradient>
                <radialGradient id={`${id}-blush`} cx="0.38" cy="0.32" r="0.75">
                    <stop offset="0" stopColor="#ffe3e8" />
                    <stop offset="0.55" stopColor="#f2a2b2" />
                    <stop offset="1" stopColor="#b04a63" />
                </radialGradient>
                <radialGradient id={`${id}-ivory`} cx="0.38" cy="0.32" r="0.75">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.6" stopColor="#f4e6cc" />
                    <stop offset="1" stopColor="#b8996a" />
                </radialGradient>
                <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7fa862" />
                    <stop offset="1" stopColor="#2f5a24" />
                </linearGradient>
                <linearGradient id={`${id}-candle`} x1="0" x2="1">
                    <stop offset="0" stopColor="#e9dcc4" />
                    <stop offset="0.4" stopColor="#fffdf6" />
                    <stop offset="1" stopColor="#c9b48f" />
                </linearGradient>
                <radialGradient id={`${id}-halo`}>
                    <stop offset="0" stopColor="#ffd97a" stopOpacity="0.7" />
                    <stop offset="1" stopColor="#ffb300" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`${id}-flame`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ff8f1f" />
                    <stop offset="0.55" stopColor="#ffc93c" />
                    <stop offset="0.85" stopColor="#fff3c4" />
                    <stop offset="1" stopColor="#6aa3ff" />
                </linearGradient>
            </defs>
            <ContactShadow id={id} cx={60} cy={123} rx={54} ry={4.5} />
            {/* Gilded cake board */}
            <ellipse cx="60" cy="119" rx="52" ry="6" fill={`url(#${id}-gold)`} />
            <ellipse cx="60" cy="117.6" rx="50" ry="4.8" fill="#f3e3b8" opacity="0.5" />
            <Tier id={id} x={13} top={88} w={94} h={28} />
            <Tier id={id} x={25} top={63} w={70} h={25} />
            <Tier id={id} x={37} top={40} w={46} h={23} />
            {/* Cascade of sugar roses down the right shoulder */}
            <Greenery id={id} x={76} y={40} angle={-30} size={0.55} />
            <Greenery id={id} x={83} y={60} angle={30} size={0.6} />
            <Greenery id={id} x={62} y={74} angle={160} size={0.6} />
            <Greenery id={id} x={93} y={84} angle={25} size={0.65} />
            <Greenery id={id} x={70} y={99} angle={150} size={0.65} />
            <Greenery id={id} x={100} y={108} angle={50} size={0.6} />
            <SugarRose id={id} cx={79} cy={43} r={6} tone="blush" />
            <SugarRose id={id} cx={86} cy={56} r={5} tone="ivory" />
            <SugarRose id={id} cx={79} cy={68} r={7.2} tone="blush" />
            <SugarRose id={id} cx={68} cy={75} r={4.6} tone="ivory" />
            <SugarRose id={id} cx={92} cy={84} r={5.8} tone="ivory" />
            <SugarRose id={id} cx={84} cy={96} r={7.6} tone="blush" />
            <SugarRose id={id} cx={72} cy={105} r={5} tone="ivory" />
            <SugarRose id={id} cx={98} cy={107} r={5.4} tone="blush" />
            {/* Candles with live flames */}
            {[48, 58, 68].map((x, i) => {
                const y = 40 - (i === 1 ? 2 : 0);
                const t = String(y - 13);
                return (
                    <g key={x}>
                        <circle cx={x} cy={y - 18} r="7" fill={`url(#${id}-halo)`} />
                        <rect
                            x={x - 1.8}
                            y={y - 13}
                            width="3.6"
                            height="14"
                            rx="0.8"
                            fill={`url(#${id}-candle)`}
                        />
                        <path
                            d={`M${String(x - 1.8)} ${String(y - 9)} L${String(x + 1.8)} ${String(y - 11)} M${String(x - 1.8)} ${String(y - 4)} L${String(x + 1.8)} ${String(y - 6)}`}
                            stroke="#d9a441"
                            strokeWidth="0.6"
                        />
                        <path d={`M${String(x)} ${t} v-2`} stroke="#3a2a1a" strokeWidth="0.6" />
                        <path
                            d={`M${String(x)} ${String(y - 24)} C${String(x + 3.4)} ${String(y - 19)} ${String(x + 2.4)} ${String(y - 14.6)} ${String(x)} ${String(y - 14.2)} C${String(x - 2.4)} ${String(y - 14.6)} ${String(x - 3.2)} ${String(y - 19)} ${String(x)} ${String(y - 24)} Z`}
                            fill={`url(#${id}-flame)`}
                        />
                        <ellipse cx={x} cy={y - 17} rx="0.9" ry="2" fill="#ffffff" opacity="0.9" />
                    </g>
                );
            })}
        </g>
    );
}
