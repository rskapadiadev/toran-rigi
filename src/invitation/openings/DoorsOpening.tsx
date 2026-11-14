import { type CultureId, cultureOf } from '@shared/cultures';
import { generateOrnament } from '@shared/generative';
import { useMemo, useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { archPath } from '../sections/covers';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

type DoorStyle = 'palace' | 'mashrabiya' | 'garden';

const styleFor = (opening: string): DoorStyle =>
    opening === 'mashrabiya' ? 'mashrabiya' : opening === 'garden-arch' ? 'garden' : 'palace';

// Facade geometry (viewBox units). The doorway keeps these proportions on every screen, so
// nothing is ever stretched; the wall around it simply fills whatever space is left.
const FACADE_W = 460;
const FACADE_H = 540;
const DOOR = {
    x: 80,
    y: 70,
    w: 300,
    h: 470,
};
const pct = (n: number, of: number) => `${String((n / of) * 100)}%`;

interface LeafProps {
    side: 'left' | 'right';
    style: DoorStyle;
    seed: number;
    kind: 'mandala' | 'girih' | 'botanical';
}

// One carved leaf (150×470): raised panels, brass studs, a medallion and a ring knocker.
function DoorLeaf({ side, style, seed, kind }: LeafProps) {
    const ornament = useMemo(() => generateOrnament(kind, seed), [kind, seed]);
    const id = `leaf-${side}-${String(seed)}`;
    const studs = useMemo(() => {
        const out: [number, number][] = [];
        // The arch hides x<20 and curves above y≈200, so studs live on the rails below it.
        for (const y of [203, 342, 461]) for (let x = 30; x <= 142; x += 12.4) out.push([x, y]);
        for (let y = 224; y <= 448; y += 22.4) out.push([26, y]);
        return out;
    }, []);
    return (
        <svg
            viewBox="0 0 150 470"
            preserveAspectRatio="none"
            className="size-full"
            style={{ transform: side === 'right' ? 'scaleX(-1)' : undefined }}
            aria-hidden
        >
            <defs>
                <linearGradient id={`${id}-wood`} x1="0" x2="1">
                    <stop
                        offset="0"
                        stopColor="color-mix(in oklab, var(--inv-primary) 45%, black)"
                    />
                    <stop
                        offset="0.55"
                        stopColor="color-mix(in oklab, var(--inv-primary) 80%, black)"
                    />
                    <stop offset="1" stopColor="var(--inv-primary)" />
                </linearGradient>
                <radialGradient id={`${id}-stud`} cx="0.35" cy="0.35" r="0.7">
                    <stop offset="0" stopColor="#fff6d6" />
                    <stop offset="0.45" stopColor="var(--inv-gold)" />
                    <stop offset="1" stopColor="color-mix(in oklab, var(--inv-gold) 45%, black)" />
                </radialGradient>
                <pattern id={`${id}-jaali`} width="18" height="18" patternUnits="userSpaceOnUse">
                    <path
                        d="M9 0 L18 9 L9 18 L0 9 Z M9 4 L14 9 L9 14 L4 9 Z"
                        fill="none"
                        stroke="var(--inv-gold)"
                        strokeWidth="1"
                    />
                </pattern>
            </defs>
            <rect width="150" height="470" fill={`url(#${id}-wood)`} />
            {/* Fanlight: the arch's crown is carved jaali, closed off by a gold rail. */}
            <rect x="20" y="0" width="130" height="198" fill={`url(#${id}-jaali)`} opacity="0.55" />
            <rect x="20" y="198" width="130" height="9" fill="var(--inv-gold)" opacity="0.85" />
            {/* Plank grain */}
            {[30, 60, 90, 120].map((x) => (
                <path
                    key={x}
                    d={`M${String(x)} 207 V470`}
                    stroke="black"
                    strokeOpacity="0.18"
                    strokeWidth="0.8"
                />
            ))}
            {style === 'mashrabiya' ? (
                <rect
                    x="26"
                    y="214"
                    width="116"
                    height="240"
                    fill={`url(#${id}-jaali)`}
                    opacity="0.9"
                />
            ) : (
                // Raised panels: lit top-left edge, shadowed bottom-right edge.
                [
                    [34, 214, 104, 120],
                    [34, 352, 104, 100],
                ].map(([x = 0, y = 0, w = 0, h = 0]) => (
                    <g key={y}>
                        <rect x={x} y={y} width={w} height={h} fill="black" opacity="0.18" />
                        <path
                            d={`M${String(x)} ${String(y + h)} V${String(y)} H${String(x + w)}`}
                            fill="none"
                            stroke="white"
                            strokeOpacity="0.18"
                            strokeWidth="2"
                        />
                        <path
                            d={`M${String(x + w)} ${String(y)} V${String(y + h)} H${String(x)}`}
                            fill="none"
                            stroke="black"
                            strokeOpacity="0.35"
                            strokeWidth="2"
                        />
                        <rect
                            x={x + 8}
                            y={y + 8}
                            width={w - 16}
                            height={h - 16}
                            fill="none"
                            stroke="var(--inv-gold)"
                            strokeWidth="1"
                            opacity="0.75"
                        />
                    </g>
                ))
            )}
            {style === 'garden' && (
                <path
                    d="M140 470 C120 380 150 330 110 280 C80 240 120 190 96 140 C80 100 110 60 90 20"
                    fill="none"
                    stroke="var(--inv-accent)"
                    strokeWidth="3"
                    opacity="0.85"
                />
            )}
            <g transform="translate(86 274) scale(0.2) translate(-200 -200)">
                {ornament.paths.map((p, i) => (
                    <path
                        key={i}
                        d={p.d}
                        fill={p.fill ? 'var(--inv-gold)' : 'none'}
                        stroke={p.fill ? 'none' : 'var(--inv-gold)'}
                        strokeWidth={p.width * 2}
                        opacity="0.95"
                    />
                ))}
            </g>
            {studs.map(([x, y]) => (
                <circle
                    key={`${String(x)}-${String(y)}`}
                    cx={x}
                    cy={y}
                    r="3.4"
                    fill={`url(#${id}-stud)`}
                />
            ))}
            {/* Ring knocker on the meeting edge */}
            <circle cx="134" cy="236" r="7" fill={`url(#${id}-stud)`} />
            <circle
                cx="134"
                cy="256"
                r="13"
                fill="none"
                stroke={`url(#${id}-stud)`}
                strokeWidth="3.5"
            />
            <rect
                x="0"
                y="0"
                width="150"
                height="470"
                fill="none"
                stroke="var(--inv-gold)"
                strokeWidth="3"
            />
        </svg>
    );
}

// Garlands follow the tradition: a toran is Hindu/Jain/Sikh; mosques hang lanterns; churches, roses.
export type Garland = 'marigold' | 'lantern' | 'rose';

export const garlandFor = (culture: CultureId): Garland =>
    culture === 'islamic'
        ? 'lantern'
        : culture === 'christian' || culture === 'jewish'
          ? 'rose'
          : 'marigold';

interface StrandProps {
    x: number;
    length: number;
    // Alternate strands carry the accent piece (mango leaf, star, sprig).
    alt: boolean;
    garland: Garland;
    delay: number;
    sway: boolean;
}

function Bead({ x, length, alt, garland }: Omit<StrandProps, 'delay' | 'sway'>) {
    const y = length;
    if (garland === 'lantern')
        return alt ? (
            <path
                d={`M${String(x)} ${String(y - 3)} l2 5 5 0.5 -4 3.4 1.4 5.2 -4.4 -3 -4.4 3 1.4 -5.2 -4 -3.4 5 -0.5 Z`}
                fill="var(--inv-gold)"
            />
        ) : (
            <g>
                <path
                    d={`M${String(x - 3)} ${String(y - 2)} h6 l1.6 3 h-9.2 Z`}
                    fill="var(--inv-gold)"
                />
                <path
                    d={`M${String(x - 4.6)} ${String(y + 1)} h9.2 l2.2 9 -2.2 7 h-9.2 l-2.2 -7 Z`}
                    fill="#ffe6a3"
                    stroke="var(--inv-gold)"
                    strokeWidth="1"
                />
                <circle cx={x} cy={y + 20} r="1.4" fill="var(--inv-gold)" />
            </g>
        );
    if (garland === 'rose')
        return alt ? (
            <path
                d={`M${String(x)} ${String(y - 2)} q-7 6 -2 16 q4 -9 2 -16 Z M${String(x)} ${String(y - 2)} q7 6 2 16 q-4 -9 -2 -16 Z`}
                fill="#5f8f4e"
            />
        ) : (
            <g>
                <circle
                    cx={x}
                    cy={y + 2}
                    r="5.2"
                    fill="#f3c4c9"
                    stroke="#c98a93"
                    strokeWidth="0.6"
                />
                <circle cx={x} cy={y + 2} r="2.4" fill="#e59aa5" />
                <circle
                    cx={x}
                    cy={y + 13}
                    r="4.2"
                    fill="#fbf3ec"
                    stroke="#d8c6b8"
                    strokeWidth="0.6"
                />
            </g>
        );
    return alt ? (
        <path
            d={`M${String(x)} ${String(y - 2)} q-6 9 0 22 q6 -13 0 -22 Z`}
            fill="#3f7d2e"
            stroke="#2b5a1f"
            strokeWidth="0.6"
        />
    ) : (
        <g>
            {[0, 1, 2].map((k) => (
                <circle
                    key={k}
                    cx={x}
                    cy={y - 10 + k * 8}
                    r={k === 2 ? 4.6 : 4}
                    fill={k % 2 ? '#f6a10a' : '#e8780c'}
                    stroke="#b85a06"
                    strokeWidth="0.5"
                />
            ))}
        </g>
    );
}

// One hanging strand, swaying from its knot.
function Strand({ x, length, alt, garland, delay, sway }: StrandProps) {
    return (
        <g
            className={sway ? 'animate-[toran-sway_4.5s_ease-in-out_infinite]' : ''}
            style={{
                transformBox: 'fill-box',
                transformOrigin: '50% 0%',
                animationDelay: `${String(delay)}s`,
            }}
        >
            <path
                d={`M${String(x)} 0 V${String(length)}`}
                stroke={garland === 'lantern' ? 'var(--inv-gold)' : '#7a5a12'}
                strokeWidth="0.8"
            />
            <Bead x={x} length={length} alt={alt} garland={garland} />
        </g>
    );
}

// The facade around the doors: arch frame, carved pillars and a garland fitting the tradition.
interface FacadeProps {
    arch: string;
    garland: Garland;
    sway: boolean;
}

function Facade({ arch, garland, sway }: FacadeProps) {
    const strands = useMemo(
        () =>
            Array.from({ length: 21 }, (_, i) => {
                const x = 70 + i * 16;
                const sag = Math.sin((i / 20) * Math.PI) * 14;
                return {
                    x,
                    top: 58 + sag,
                    length: 18 + ((i * 7) % 3) * 6 + (i % 2 ? 0 : 6),
                    leaf: i % 3 === 1,
                    delay: (i % 5) * 0.35,
                };
            }),
        [],
    );
    return (
        <svg
            viewBox={`0 0 ${String(FACADE_W)} ${String(FACADE_H)}`}
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
            aria-hidden
        >
            <g transform={`translate(${String(DOOR.x)} ${String(DOOR.y)})`}>
                <path d={arch} fill="none" stroke="var(--inv-gold)" strokeWidth="5" />
                <g transform="translate(150 235) scale(1.06) translate(-150 -235)">
                    <path
                        d={arch}
                        fill="none"
                        stroke="var(--inv-gold)"
                        strokeWidth="1.2"
                        opacity="0.7"
                    />
                </g>
            </g>
            {[22, 384].map((x) => (
                <g key={x}>
                    <rect x={x} y="150" width="54" height="16" fill="var(--inv-gold)" />
                    <rect
                        x={x + 6}
                        y="166"
                        width="42"
                        height="344"
                        fill="color-mix(in oklab, var(--inv-primary) 55%, black)"
                    />
                    {[0, 1, 2, 3].map((k) => (
                        <path
                            key={k}
                            d={`M${String(x + 13 + k * 9.5)} 172 V504`}
                            stroke="var(--inv-gold)"
                            strokeWidth="1"
                            opacity="0.55"
                        />
                    ))}
                    <rect x={x - 4} y="510" width="62" height="30" fill="var(--inv-gold)" />
                    <path d={`M${String(x)} 150 l27 -26 l27 26 Z`} fill="var(--inv-gold)" />
                    <circle cx={x + 27} cy="116" r="5" fill="var(--inv-gold)" />
                </g>
            ))}
            <path d="M62 58 Q230 92 398 58" fill="none" stroke="#7a5a12" strokeWidth="1.6" />
            {strands.map((s) => (
                <g key={s.x} transform={`translate(0 ${String(s.top)})`}>
                    <Strand
                        x={s.x}
                        length={s.length}
                        alt={s.leaf}
                        garland={garland}
                        delay={s.delay}
                        sway={sway}
                    />
                </g>
            ))}
        </svg>
    );
}

// Palace (Rajwada), mashrabiya lattice (Islamic) and garden (Christian) gateways share one engine:
// a fixed-proportion doorway set in a wall that fills any screen, from phone to ultra-wide.
export function DoorsOpening({ onBegin, onOpened }: OpeningProps) {
    const { data, tier } = useInvite();
    const { design, seed, culture } = data.invitation;
    const style = styleFor(design.opening);
    const arch = archPath(cultureOf(culture).id);
    const stage = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState(false);
    const clipId = `door-clip-${String(seed)}`;
    const kind = style === 'mashrabiya' ? 'girih' : style === 'garden' ? 'botanical' : 'mandala';

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
        const tl = gsap.timeline({
            onComplete: onOpened,
            defaults: { ease: 'power3.inOut' },
        });
        const left = root.querySelector('[data-door=left]');
        const right = root.querySelector('[data-door=right]');
        const light = root.querySelector('[data-light]');
        tl.to(light, {
            opacity: 1,
            duration: 0.5,
        });
        if (style === 'mashrabiya') {
            tl.to(
                left,
                {
                    xPercent: -100,
                    duration: 1.6,
                },
                0.25,
            ).to(
                right,
                {
                    xPercent: 100,
                    duration: 1.6,
                },
                0.25,
            );
        } else {
            // Doors swing inward, away from the guest, as real palace doors do.
            tl.to(
                left,
                {
                    rotationY: 100,
                    duration: 1.7,
                },
                0.25,
            ).to(
                right,
                {
                    rotationY: -100,
                    duration: 1.7,
                },
                0.25,
            );
        }
        tl.to(
            root.parentElement?.querySelector('[data-opening-title]') ?? [],
            {
                y: -30,
                opacity: 0,
                duration: 0.6,
            },
            0.9,
        )
            // Walk through the doorway.
            .to(
                root.querySelector('[data-facade]'),
                {
                    scale: 3.2,
                    duration: 1.4,
                    ease: 'power2.in',
                },
                1.5,
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.6,
                },
                2.3,
            );
    };

    return (
        <OpeningShell onTap={() => void open()} busy={busy}>
            <div ref={stage} className="absolute inset-0 overflow-hidden">
                {/* The wall: carved jaali in the theme's colours, darker at the edges. */}
                <svg className="absolute inset-0 size-full" aria-hidden>
                    <defs>
                        <pattern
                            id={`${clipId}-wall`}
                            width="56"
                            height="56"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M28 4 L52 28 L28 52 L4 28 Z M28 16 L40 28 L28 40 L16 28 Z"
                                fill="none"
                                stroke="var(--inv-gold)"
                                strokeWidth="0.8"
                                opacity="0.22"
                            />
                        </pattern>
                        <radialGradient id={`${clipId}-vignette`} cx="0.5" cy="0.55" r="0.75">
                            <stop offset="0.35" stopColor="black" stopOpacity="0" />
                            <stop offset="1" stopColor="black" stopOpacity="0.6" />
                        </radialGradient>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="color-mix(in oklab, var(--inv-primary) 40%, var(--inv-bg))"
                    />
                    <rect width="100%" height="100%" fill={`url(#${clipId}-wall)`} />
                    <rect width="100%" height="100%" fill={`url(#${clipId}-vignette)`} />
                </svg>
                <svg width="0" height="0" className="absolute" aria-hidden>
                    <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                        <path d={arch} transform="scale(0.003333 0.002128)" />
                    </clipPath>
                </svg>
                <div className="absolute inset-x-0 bottom-0 flex justify-center">
                    <div
                        data-facade
                        className="relative aspect-[460/540] h-[min(80svh,calc(128cqw*540/460))]"
                        style={{ transformOrigin: '50% 62%' }}
                    >
                        <div
                            className="absolute [perspective:1600px]"
                            style={{
                                left: pct(DOOR.x, FACADE_W),
                                top: pct(DOOR.y, FACADE_H),
                                width: pct(DOOR.w, FACADE_W),
                                height: pct(DOOR.h, FACADE_H),
                                clipPath: `url(#${clipId})`,
                            }}
                        >
                            <div
                                data-light
                                className="absolute inset-0 opacity-0"
                                style={{
                                    background:
                                        'radial-gradient(ellipse at 50% 60%, #fff6dc, var(--inv-gold) 45%, color-mix(in oklab, var(--inv-gold) 40%, black) 100%)',
                                }}
                            />
                            {/* Doors are physical objects: they keep their sides in RTL too. */}
                            <div
                                data-door="left"
                                className="absolute inset-y-0 w-1/2 origin-left"
                                style={{ left: 0 }}
                            >
                                <DoorLeaf side="left" style={style} seed={seed} kind={kind} />
                            </div>
                            <div
                                data-door="right"
                                className="absolute inset-y-0 w-1/2 origin-right"
                                style={{ right: 0 }}
                            >
                                <DoorLeaf side="right" style={style} seed={seed} kind={kind} />
                            </div>
                        </div>
                        <Facade
                            arch={arch}
                            garland={garlandFor(cultureOf(culture).id)}
                            sway={tier === 'full'}
                        />
                    </div>
                </div>
            </div>
        </OpeningShell>
    );
}
