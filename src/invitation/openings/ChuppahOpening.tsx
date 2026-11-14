import { rng } from '@shared/generative';
import { useMemo, useRef, useState } from 'react';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// Scene geometry (viewBox 400×560). Front poles stand wide and tall, back poles narrower and higher,
// so the canopy reads as a roof in perspective rather than a flat banner.
const FRONT = {
    l: 62,
    r: 338,
    top: 150,
};
const BACK = {
    l: 112,
    r: 288,
    top: 112,
};
const FLOOR = 520;
const SWAGS = 5;

function valance(): { path: string;
tips: [number, number][] } {
    const w = (FRONT.r - FRONT.l) / SWAGS;
    const tips: [number, number][] = [];
    let d = `M${String(FRONT.l)} ${String(FRONT.top)}`;
    for (let i = 0; i < SWAGS; i++) {
        const x0 = FRONT.l + i * w;
        const x1 = x0 + w;
        d += ` Q${String(x0 + w / 2)} ${String(FRONT.top + 46)} ${String(x1)} ${String(FRONT.top)}`;
        tips.push([x1, FRONT.top]);
    }
    return {
        path: `${d} L${String(FRONT.r)} ${String(FRONT.top - 18)} L${String(FRONT.l)} ${String(FRONT.top - 18)} Z`,
        tips: [[FRONT.l, FRONT.top], ...tips],
    };
}

// The swag geometry never changes, so it is computed once.
const DRAPE = valance();

interface PoleProps {
    x: number;
    top: number;
    width: number;
    back?: boolean;
}

// A gilded pole wound with a vine of small white blossoms.
function Pole({ x, top, width, back = false }: PoleProps) {
    const blossoms = useMemo(() => {
        const out: [number, number][] = [];
        for (let y = top + 16; y < FLOOR - 10; y += 26)
            out.push([x + Math.sin(y / 18) * (width + 2), y]);
        return out;
    }, [x, top, width]);
    return (
        <g
            data-pole
            opacity={back ? 0.55 : 1}
            style={{
 transformBox: 'fill-box',
transformOrigin: '50% 100%' 
}}
        >
            <rect
                x={x - width / 2}
                y={top}
                width={width}
                height={FLOOR - top}
                rx={width / 2}
                fill="var(--inv-gold)"
            />
            <path
                d={`M${String(x)} ${String(top)} ${blossoms.map(([bx, by]) => `L${bx.toFixed(1)} ${String(by)}`).join(' ')}`}
                fill="none"
                stroke="#6b8a5a"
                strokeWidth="1.6"
            />
            {blossoms.map(([bx, by], i) => (
                <circle
                    key={i}
                    cx={bx}
                    cy={by}
                    r={back ? 2.4 : 3.4}
                    fill={i % 3 === 0 ? '#f3d6d9' : '#fffaf2'}
                    stroke="#d9c4b4"
                    strokeWidth="0.5"
                />
            ))}
        </g>
    );
}

// Roses and olive leaves gathered where the canopy meets a pole.
interface ClusterProps {
    x: number;
    y: number;
    flip?: boolean;
}

function Cluster({ x, y, flip = false }: ClusterProps) {
    const s = flip ? -1 : 1;
    return (
        <g transform={`translate(${String(x)} ${String(y)}) scale(${String(s)} 1)`}>
            <path
                d="M0 0 q-22 -6 -34 8 q16 4 34 -8 Z M0 0 q-10 18 -2 32 q8 -14 2 -32 Z"
                fill="#6b8a5a"
            />
            <circle cx="-6" cy="2" r="10" fill="#f3d6d9" stroke="#d6a4ab" strokeWidth="0.8" />
            <circle cx="-6" cy="2" r="4.5" fill="#e6aeb6" />
            <circle cx="9" cy="-6" r="8" fill="#fffaf2" stroke="#d9c4b4" strokeWidth="0.8" />
            <circle cx="6" cy="12" r="6.5" fill="#fffaf2" stroke="#d9c4b4" strokeWidth="0.8" />
        </g>
    );
}

// The chuppah: a four-pole canopy in perspective, tallit-striped roof, swagged valance with tassels.
// Tapping lifts the canopy, warm light gathers beneath it, and the guest steps underneath.
export function ChuppahOpening({ onBegin, onOpened }: OpeningProps) {
    const { data, tier } = useInvite();
    const seed = data.invitation.seed;
    const stage = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState(false);
    const petals = useMemo(() => {
        const r = rng(seed + 11);
        return Array.from({ length: 14 }, () => ({
            x: r.range(4, 96),
            delay: r.range(0, 9),
            size: r.range(5, 9),
            dur: r.range(9, 15),
        }));
    }, [seed]);

    const open = async () => {
        if (busy) return;
        setBusy(true);
        onBegin();
        const root = stage.current;
        if (!root || tier === 'static') {
            onOpened();
            return;
        }
        const gsap = await loadGsap();
        gsap.timeline({ onComplete: onOpened })
            .to(root.querySelector('[data-canopy]'), {
                y: -14,
                duration: 0.9,
                ease: 'power2.out',
            })
            .to(
                root.querySelector('[data-glow]'),
                {
                    opacity: 1,
                    duration: 0.9,
                },
                0.3,
            )
            .to(
                root.parentElement?.querySelector('[data-opening-title]') ?? [],
                {
                    y: -30,
                    opacity: 0,
                    duration: 0.6,
                },
                0.6,
            )
            .to(
                root.querySelector('[data-scene]'),
                {
                    scale: 2.6,
                    duration: 1.5,
                    ease: 'power2.in',
                },
                1,
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.6,
                },
                1.9,
            );
    };

    const roofId = `roof-${String(seed)}`;
    return (
        <OpeningShell onTap={() => void open()} busy={busy}>
            <div ref={stage} className="texture-paper absolute inset-0 overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse at 50% 70%, color-mix(in oklab, var(--inv-gold) 18%, transparent), transparent 65%)',
                    }}
                />
                {tier === 'full' &&
                    petals.map((p, i) => (
                        <span
                            key={i}
                            aria-hidden
                            className="absolute -top-4 animate-[petal-fall_linear_infinite] rounded-[60%_0_60%_0] bg-[#f3d6d9] opacity-70"
                            style={{
                                insetInlineStart: `${String(p.x)}%`,
                                width: p.size,
                                height: p.size,
                                animationDuration: `${String(p.dur)}s`,
                                animationDelay: `${String(p.delay)}s`,
                            }}
                        />
                    ))}
                <div className="absolute inset-x-0 bottom-0 flex justify-center">
                    <div
                        data-scene
                        className="relative aspect-[400/560] h-[min(80svh,calc(118cqw*560/400))]"
                        style={{ transformOrigin: '50% 62%' }}
                    >
                        <div
                            data-glow
                            className="absolute inset-x-[20%] top-[24%] bottom-[8%] rounded-full opacity-0 blur-3xl"
                            style={{
                                background:
                                    'radial-gradient(ellipse, #fff6dc, color-mix(in oklab, var(--inv-gold) 55%, transparent) 60%, transparent)',
                            }}
                        />
                        <div className="absolute inset-x-[30%] top-[38%] aspect-square opacity-60">
                            <GenerativeOrnament kind="ketubah" seed={seed} duration={2400} />
                        </div>
                        <svg
                            viewBox="0 0 400 560"
                            className="absolute inset-0 size-full overflow-visible"
                            aria-hidden
                        >
                            <defs>
                                <linearGradient id={roofId} x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="0"
                                        stopColor="color-mix(in oklab, var(--inv-surface) 92%, white)"
                                    />
                                    <stop
                                        offset="1"
                                        stopColor="color-mix(in oklab, var(--inv-surface) 80%, var(--inv-primary))"
                                    />
                                </linearGradient>
                            </defs>
                            <ellipse
                                cx="200"
                                cy={FLOOR + 6}
                                rx="170"
                                ry="16"
                                fill="black"
                                opacity="0.08"
                            />
                            <Pole x={BACK.l} top={BACK.top} width={5} back />
                            <Pole x={BACK.r} top={BACK.top} width={5} back />
                            <g data-canopy>
                                {/* Roof in perspective: back edge higher and narrower than the front. */}
                                <path
                                    d={`M${String(BACK.l)} ${String(BACK.top)} L${String(BACK.r)} ${String(BACK.top)} L${String(FRONT.r)} ${String(FRONT.top - 18)} L${String(FRONT.l)} ${String(FRONT.top - 18)} Z`}
                                    fill={`url(#${roofId})`}
                                />
                                {/* Tallit stripes run front to back. */}
                                {[0.12, 0.18, 0.82, 0.88].map((t) => (
                                    <path
                                        key={t}
                                        d={`M${String(BACK.l + (BACK.r - BACK.l) * t)} ${String(BACK.top)} L${String(FRONT.l + (FRONT.r - FRONT.l) * t)} ${String(FRONT.top - 18)}`}
                                        stroke="var(--inv-primary)"
                                        strokeWidth={t < 0.15 || t > 0.85 ? 4 : 2}
                                        opacity="0.75"
                                    />
                                ))}
                                <path
                                    d={`M${String(BACK.l)} ${String(BACK.top)} L${String(BACK.r)} ${String(BACK.top)}`}
                                    stroke="var(--inv-gold)"
                                    strokeWidth="2"
                                />
                                {/* Valance: five soft swags hanging from the front edge, gold-trimmed. */}
                                <g
                                    className={
                                        tier === 'full'
                                            ? 'animate-[valance-sway_5s_ease-in-out_infinite]'
                                            : ''
                                    }
                                    style={{
 transformBox: 'fill-box',
transformOrigin: '50% 0%' 
}}
                                >
                                    <path d={DRAPE.path} fill={`url(#${roofId})`} />
                                    <path
                                        d={DRAPE.path.split(' L')[0]}
                                        fill="none"
                                        stroke="var(--inv-gold)"
                                        strokeWidth="3"
                                    />
                                    {DRAPE.tips.map(([x, y]) => (
                                        <g key={x}>
                                            <path
                                                d={`M${String(x)} ${String(y)} V${String(y + 16)}`}
                                                stroke="var(--inv-gold)"
                                                strokeWidth="1.4"
                                            />
                                            <path
                                                d={`M${String(x - 4)} ${String(y + 16)} h8 l2 14 h-12 Z`}
                                                fill="var(--inv-gold)"
                                            />
                                            <circle
                                                cx={x}
                                                cy={y + 15}
                                                r="3"
                                                fill="var(--inv-gold)"
                                            />
                                        </g>
                                    ))}
                                </g>
                                <Cluster x={FRONT.l} y={FRONT.top - 14} />
                                <Cluster x={FRONT.r} y={FRONT.top - 14} flip />
                            </g>
                            <Pole x={FRONT.l} top={FRONT.top - 20} width={8} />
                            <Pole x={FRONT.r} top={FRONT.top - 20} width={8} />
                        </svg>
                    </div>
                </div>
            </div>
        </OpeningShell>
    );
}
