import { aurora, confetti, leheriya, terrazzo, watercolor } from '@shared/backdrops';
import { blockKey, type ResolvedBlock, settleEnter } from '@shared/blocks';
import { cultureOf } from '@shared/cultures';
import { rng } from '@shared/generative';
import { isDark, materialBackground, mixHex, svgDataUrl } from '@shared/materials';
import { cultureMotifs, type MotifId } from '@shared/motifs';
import type { EdgeKind, InvitationDesign, SceneKind } from '@shared/types';
import { type CSSProperties, type ReactNode, useMemo } from 'react';

import { EnterContext } from '../motion/Reveal';
import { useInvite } from './context';
import { type TextPath, useEditing } from './editing';
import { LightRays } from './luxury/effects/LightRays';
import { Petals } from './luxury/effects/Petals';
import { DividerContext } from './luxury/typography/dividers';
import { BEAT, Heartbeat, isProcession, Procession } from './procession';

interface SceneStyle {
    background: string;
    vars: Record<string, string>;
    dappled: boolean;
    spotlight?: boolean;
    starry?: boolean;
    /** An animated layer painted over the backdrop, behind the words. */
    effect?: 'petals' | 'rays';
}

// A field of tiny stars tiled across night scenes.
const starField = (() => {
    const r = rng(4242);
    const dots = Array.from({ length: 26 }, () => {
        const cx = r.range(0, 220).toFixed(1);
        const cy = r.range(0, 220).toFixed(1);
        const radius = r.range(0.4, 1.5).toFixed(2);
        const alpha = r.range(0.3, 0.9).toFixed(2);
        return `<circle cx='${cx}' cy='${cy}' r='${radius}' fill='#fff6dc' opacity='${alpha}'/>`;
    }).join('');
    return svgDataUrl(
        `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>${dots}</svg>`,
    );
})();

function buildScene(
    kind: SceneKind,
    design: InvitationDesign,
    culture: string,
    seed: number,
    motif?: MotifId,
): SceneStyle {
    const p = design.palette;
    const [cultureA = 'paisley', cultureB = cultureA] = cultureMotifs[cultureOf(culture).id];
    const motifA = motif ?? cultureA;
    const motifB = motif ?? cultureB;
    const light = (base: string) => ({
        '--inv-ink': mixHex(base, '#000000', 0.82),
        '--inv-muted': mixHex(base, '#000000', 0.55),
        '--inv-surface': mixHex(base, '#ffffff', 0.55),
        '--inv-bg': base,
    });
    const dark = (base: string) => ({
        '--inv-ink': mixHex(base, '#ffffff', 0.9),
        '--inv-muted': mixHex(base, '#ffffff', 0.65),
        '--inv-surface': mixHex(base, '#ffffff', 0.1),
        '--inv-bg': base,
        '--inv-primary': mixHex(p.gold, '#ffffff', 0.2),
    });
    switch (kind) {
        case 'silk': {
            const base = isDark(p.bg) ? p.bg : mixHex(p.bg, p.gold, 0.12);
            return {
                background: materialBackground({
                    kind: 'silk',
                    base,
                    motif: motifA,
                    motifColor: mixHex(base, p.gold, 0.5),
                    seed,
                    motifScale: 0.28,
                }),
                vars: isDark(base)
                    ? {
                          ...dark(base),
                          '--inv-primary':
                              p.primary === p.gold ? p.gold : mixHex(p.primary, '#ffffff', 0.35),
                      }
                    : light(base),
                dappled: false,
                spotlight: true,
            };
        }
        case 'jacquard': {
            const base = mixHex(p.primary, '#000000', isDark(p.primary) ? 0.15 : 0.35);
            return {
                background: materialBackground({
                    kind: 'jacquard',
                    base,
                    motif: motifB,
                    motifColor: mixHex(base, '#ffffff', 0.09),
                    seed: seed + 1,
                    motifScale: 0.4,
                }),
                vars: dark(base),
                dappled: false,
            };
        }
        case 'paper': {
            const base = mixHex('#f7f0e3', p.bg, isDark(p.bg) ? 0.04 : 0.25);
            return {
                background: materialBackground({
                    kind: 'paper',
                    base,
                    seed: seed + 2,
                }),
                vars: {
                    ...light(base),
                    '--inv-primary': isDark(p.primary)
                        ? p.primary
                        : mixHex(p.primary, '#000000', 0.3),
                },
                dappled: false,
            };
        }
        case 'blush': {
            const base = mixHex(p.primary, '#ffffff', 0.8);
            return {
                background: materialBackground({
                    kind: 'linen',
                    base,
                    motif: motifA,
                    motifColor: mixHex(base, '#000000', 0.05),
                    seed: seed + 3,
                    motifScale: 0.26,
                }),
                vars: {
                    ...light(base),
                    '--inv-primary': mixHex(p.primary, '#000000', 0.15),
                },
                dappled: true,
            };
        }
        case 'velvet': {
            const base = mixHex(p.primary, '#000000', 0.62);
            return {
                background: materialBackground({
                    kind: 'velvet',
                    base,
                    seed: seed + 4,
                }),
                vars: dark(base),
                dappled: false,
            };
        }
        case 'night': {
            const base = mixHex(p.primary, '#05030c', 0.86);
            return {
                background: `${starField}, ${materialBackground({
                    kind: 'velvet',
                    base,
                    seed: seed + 5,
                })}`,
                vars: dark(base),
                dappled: false,
                starry: true,
            };
        }
        case 'terrazzo': {
            const base = mixHex('#f1ede6', p.bg, isDark(p.bg) ? 0.04 : 0.25);
            const chips = [
                p.primary,
                p.gold,
                p.accent,
                mixHex(p.primary, '#ffffff', 0.5),
                '#9a948c',
            ];
            return {
                background: terrazzo(base, chips, seed + 7),
                vars: {
                    ...light(base),
                    '--inv-primary': mixHex(p.primary, '#000000', 0.2),
                },
                dappled: false,
                spotlight: true,
            };
        }
        case 'watercolor': {
            const base = mixHex('#fbf7f0', p.bg, isDark(p.bg) ? 0.03 : 0.2);
            return {
                background: watercolor(base, [p.primary, p.accent, p.gold], seed + 8),
                vars: {
                    ...light(base),
                    '--inv-primary': mixHex(p.primary, '#000000', 0.2),
                },
                dappled: false,
            };
        }
        case 'leheriya': {
            const base = mixHex(p.bg, '#ffffff', isDark(p.bg) ? 0.85 : 0.4);
            // Four bands, so the colour cycle repeats within one tile (see leheriya()).
            const bands = [
                mixHex(p.primary, '#ffffff', 0.5),
                mixHex(p.gold, '#ffffff', 0.4),
                mixHex(p.accent, '#ffffff', 0.5),
                base,
            ];
            return {
                background: leheriya(base, bands, seed + 10),
                vars: {
                    ...light(base),
                    '--inv-primary': mixHex(p.primary, '#000000', 0.25),
                },
                dappled: false,
                spotlight: true,
            };
        }
        case 'aurora': {
            const base = mixHex(p.primary, '#05030c', 0.86);
            // mixHex normalises every colour to 6-digit hex, so the alpha suffix in aurora() is valid.
            const glows = [p.primary, p.accent, p.gold, mixHex(p.primary, '#6a4cff', 0.4)].map(
                (c) => mixHex(c, c, 0),
            );
            return {
                background: aurora(glows, seed + 12),
                vars: dark(base),
                dappled: false,
            };
        }
        case 'confetti': {
            const base = mixHex('#fffdf8', p.bg, isDark(p.bg) ? 0.03 : 0.3);
            const colors = [p.primary, p.gold, p.accent, mixHex(p.primary, '#ffffff', 0.4)];
            return {
                background: confetti(base, colors, seed + 13),
                vars: {
                    ...light(base),
                    '--inv-primary': mixHex(p.primary, '#000000', 0.15),
                },
                dappled: false,
                spotlight: true,
            };
        }
        case 'petals': {
            // Soft paper with the faintest blush of the palette, so the petals read as fallen on it.
            const base = mixHex(
                mixHex('#f8f1e6', p.bg, isDark(p.bg) ? 0.04 : 0.22),
                p.primary,
                0.035,
            );
            return {
                background: materialBackground({
                    kind: 'paper',
                    base,
                    seed: seed + 2,
                }),
                vars: {
                    ...light(base),
                    '--inv-primary': isDark(p.primary)
                        ? p.primary
                        : mixHex(p.primary, '#000000', 0.3),
                },
                dappled: false,
                effect: 'petals',
            };
        }
        case 'rays': {
            const base = mixHex(p.primary, '#0d0805', 0.84);
            // mixHex normalises to 6-digit hex, so the alpha suffix is valid.
            const glow = mixHex(p.gold, '#ffd9a0', 0.4);
            return {
                background: `radial-gradient(ellipse 75% 40% at 8% -4%, ${glow}55, ${glow}00 70%), radial-gradient(ellipse 90% 60% at 50% 115%, #00000066, #00000000 70%), ${materialBackground(
                    {
                        kind: 'velvet',
                        base,
                        seed: seed + 15,
                    },
                )}`,
                vars: dark(base),
                dappled: false,
                effect: 'rays',
            };
        }
        case 'plain': {
            const vars = isDark(p.bg) ? dark(p.bg) : light(p.bg);
            return {
                background: 'none',
                vars: {
                    ...vars,
                    '--inv-primary': isDark(p.bg) ? mixHex(p.gold, '#ffffff', 0.1) : p.primary,
                },
                dappled: false,
            };
        }
    }
}

// Dappled light: soft leaf (or lattice, for Islamic invites) shadows drifting slowly across the scene.
function Dappled({ lattice }: { lattice: boolean }) {
    return (
        <div
            className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-multiply"
            aria-hidden
        >
            <svg
                className="absolute -inset-[20%] h-[140%] w-[140%] animate-[dapple_22s_ease-in-out_infinite_alternate] opacity-[0.22]"
                viewBox="0 0 400 400"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <filter id="dapple-blur">
                        <feGaussianBlur stdDeviation="5" />
                    </filter>
                </defs>
                <g fill="#2b1a10" filter="url(#dapple-blur)">
                    {lattice
                        ? Array.from({ length: 36 }, (_, i) => (
                              <path
                                  key={i}
                                  d={`M${(i % 6) * 70} ${Math.floor(i / 6) * 70} l35 35 l-35 35 l-35 -35 z`}
                                  opacity={0.55}
                              />
                          ))
                        : Array.from({ length: 26 }, (_, i) => {
                              const x = (i * 97) % 400;
                              const y = (i * 61) % 400;
                              const r = (i * 37) % 180;
                              return (
                                  <path
                                      key={i}
                                      d={`M${x} ${y} c18 -24 52 -20 60 0 c-10 22 -44 26 -60 0z`}
                                      transform={`rotate(${r} ${x} ${y}) scale(${1 + (i % 3) * 0.5})`}
                                  />
                              );
                          })}
                </g>
            </svg>
        </div>
    );
}

// A handful of brighter stars that breathe slowly over the tiled field.
function Twinkle({ seed }: { seed: number }) {
    const stars = useMemo(() => {
        const r = rng(seed + 99);
        return Array.from({ length: 14 }, () => ({
            x: r.range(0, 100).toFixed(1),
            y: r.range(0, 100).toFixed(1),
            delay: r.range(0, 4).toFixed(2),
        }));
    }, [seed]);
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {stars.map((star, i) => (
                <span
                    key={i}
                    className="absolute size-1 animate-[twinkle_4s_ease-in-out_infinite] rounded-full bg-[#fff3cf] shadow-[0_0_8px_2px_rgba(255,236,180,0.6)]"
                    style={{
                        insetInlineStart: `${star.x}%`,
                        top: `${star.y}%`,
                        animationDelay: `${star.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}

const spotlight =
    'radial-gradient(ellipse 62% 48% at 50% 50%, var(--inv-bg) 40%, transparent 100%)';

// Gold brocade ribbon sewn between two different fabrics.
function Seam({ animated }: { animated: boolean }) {
    const { data } = useInvite();
    const p = data.invitation.design.palette;
    const background = useMemo(
        () =>
            materialBackground({
                kind: 'brocade',
                base: mixHex(p.gold, '#7a5418', 0.25),
                motif: 'marigold',
                motifColor: mixHex(p.gold, '#fff3c4', 0.35),
                tile: 40,
                motifScale: 0.42,
            }),
        [p.gold],
    );
    return (
        <div
            aria-hidden
            className={`relative z-10 h-4 shadow-[0_2px_6px_rgba(0,0,0,0.25)] ${animated ? 'seam-flow' : ''}`}
            style={{
                backgroundImage: background,
                backgroundSize: '40px 40px',
            }}
        />
    );
}

// Gold zari lace: a woven band with scalloped borders and a row of pierced holes.
function LaceRibbon() {
    const { data } = useInvite();
    const gold = data.invitation.design.palette.gold;
    const light = mixHex(gold, '#fff3c4', 0.45);
    const dark = mixHex(gold, '#5a3c0c', 0.35);
    const tile = useMemo(() => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="28" viewBox="0 0 24 28">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${gold}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
<path fill="url(#g)" fill-rule="evenodd" d="M0 6 A6 6 0 0 1 12 6 A6 6 0 0 1 24 6 V22 A6 6 0 0 1 12 22 A6 6 0 0 1 0 22 Z M12 14 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 Z M6 5 m-1.4 0 a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0 Z M18 5 m-1.4 0 a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0 Z M6 23 m-1.4 0 a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0 Z M18 23 m-1.4 0 a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0 Z"/>
<path d="M0 10 H24 M0 18 H24" stroke="${dark}" stroke-width="0.6" opacity="0.6"/>
</svg>`;
        return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }, [gold, light, dark]);
    return (
        <div
            aria-hidden
            className="relative z-10 -my-3.5 h-7"
            style={{
                backgroundImage: tile,
                backgroundSize: '24px 28px',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
            }}
        />
    );
}

interface EdgeShape {
    mask: string;
    size: string;
    height: string;
    /** Animated: a repeating edge drifts by one tile (px); a full-width one breathes instead. */
    drift?: number;
}

// Torn, scalloped or arched top edge: the scene's own fabric masked into a shape over the previous one.
export function edgeShape(kind: EdgeKind, seed: number): EdgeShape | null {
    switch (kind) {
        case 'torn': {
            const r = rng(seed * 31 + 7);
            const points = Array.from({ length: 41 }, (_, i) => {
                const y = r.range(6, 24) + (i % 3 === 0 ? r.range(0, 8) : 0);
                return `L${i * 10} ${y.toFixed(1)}`;
            }).join(' ');
            return {
                mask: svgDataUrl(
                    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 40' preserveAspectRatio='none'><path d='M0 40 ${points} L400 40 Z'/></svg>`,
                ),
                size: '400px 100%',
                height: '22px',
                drift: 400,
            };
        }
        case 'scallop':
            return {
                mask: svgDataUrl(
                    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 20'><path d='M0 20 L0 14 A10 10 0 0 1 20 14 A10 10 0 0 1 40 14 L40 20 Z'/><circle cx='10' cy='8' r='1.6'/><circle cx='30' cy='8' r='1.6'/></svg>`,
                ),
                size: '40px 100%',
                height: '20px',
                drift: 40,
            };
        case 'arch':
            return {
                mask: svgDataUrl(
                    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='M0 100 C0 40 22 0 50 0 C78 0 100 40 100 100 Z'/></svg>`,
                ),
                size: '100% 100%',
                height: 'min(14cqw, 90px)',
            };
        case 'cusped':
            return tile(cuspedArcade(), 80, 40, 'evenodd');
        case 'ogee':
            return tile(
                'M0 32 V24 C0 16 14 14 20 8 C23 5 24 2 24 0 C24 2 25 5 28 8 C34 14 48 16 48 24 V32 Z',
                48,
                32,
            );
        case 'lotus':
            return tile(
                // A tall petal between two half-petals: one outline, so overlaps never cut holes.
                'M0 22 V8 C1 12 4 16 7 17 C11 12 14 6 16 0 C18 6 21 12 25 17 C28 16 31 12 32 8 V22 Z',
                32,
                22,
            );
        case 'swag':
            // Each swag sags from a pin; the bead marks the pin.
            return tile(
                'M0 20 V2 Q40 30 80 2 V20 Z M-3 3 a3 3 0 1 1 6 0 a3 3 0 1 1 -6 0 M77 3 a3 3 0 1 1 6 0 a3 3 0 1 1 -6 0',
                80,
                20,
            );
        case 'wave':
            return tile('M0 18 V9 C20 0 40 0 60 9 C80 18 100 18 120 9 V18 Z', 120, 18);
        case 'pinking':
            return tile('M0 9 V8 L8 0 L16 8 V9 Z', 16, 9);
        case 'cloud':
            return tile(clouds(seed), 200, 30);
        case 'deco':
            return tile('M0 16 V12 H8 V8 H16 V4 H32 V8 H40 V12 H48 V16 Z', 48, 16);
        case 'slant':
            return {
                mask: svgDataUrl(
                    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='M0 100 V0 L100 100 Z'/></svg>`,
                ),
                size: '100% 100%',
                height: 'min(7cqw, 56px)',
            };
        case 'heartbeat':
            // The next section's fabric rises to the ECG trace; Heartbeat draws the glowing line on it.
            // No drift: the line's pulse is the motion, and the trace must stay under it.
            return still(tile(`M0 40 V26 ${BEAT} V40 Z`, 200, 40));
        // Processions draw themselves (procession.tsx); no mask.
        case 'doli':
        case 'ghodi':
        case 'car':
        case 'elephant':
        case 'bagghi':
        case 'dhol':
        case 'rickshaw':
        case 'doves':
        case 'stork':
        case 'lanterns':
        case 'balloons':
        case 'kites':
        case 'seam':
        case 'lace':
        case 'none':
            return null;
    }
}

// An edge that never drifts, because something is drawn exactly along it.
function still(shape: EdgeShape): EdgeShape {
    shape.drift = 0;
    return shape;
}

// A repeating edge whose tile is drawn at its natural size, so curves never stretch.
function tile(d: string, width: number, height: number, rule = 'nonzero'): EdgeShape {
    return {
        mask: svgDataUrl(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${String(width)} ${String(height)}'><path fill-rule='${rule}' d='${d}'/></svg>`,
        ),
        size: `${String(width)}px ${String(height)}px`,
        height: `${String(height)}px`,
        drift: width,
    };
}

// Jharokha screen: a band of the section's fabric pierced by cusped windows (cusps point inward,
// as on a real jharokha), so the section above shows through each opening.
function cuspedArcade(): string {
    const cx = 40;
    const cy = 30;
    const rx = 27;
    const ry = 24;
    const lobes = 7;
    const points = Array.from({ length: lobes + 1 }, (_, i) => {
        const a = Math.PI - (Math.PI / lobes) * i;
        return [cx + rx * Math.cos(a), cy - ry * Math.sin(a)] as const;
    });
    const cusps = points
        .slice(1)
        .map(([x, y], i) => {
            const [px, py] = points[i] ?? [x, y];
            const radius = (Math.hypot(x - px, y - py) / 2) * 1.05;
            return `A${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 0 ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');
    const [sx, sy] = points[0] ?? [cx - rx, cy];
    return `M0 0 H80 V40 H0 Z M${sx.toFixed(1)} 40 V${sy.toFixed(1)} ${cusps} V40 Z`;
}

// Billowing clouds: overlapping circles of seeded sizes, so no two invitations share a skyline.
function clouds(seed: number): string {
    const r = rng(seed * 17 + 3);
    const circle = (x: number, cy: number, radius: number) =>
        `M${(x - radius).toFixed(1)} ${cy.toFixed(1)} a${radius.toFixed(1)} ${radius.toFixed(1)} 0 1 1 ${(radius * 2).toFixed(1)} 0 a${radius.toFixed(1)} ${radius.toFixed(1)} 0 1 1 ${(-radius * 2).toFixed(1)} 0`;
    const puffs: string[] = ['M0 30 V22 H200 V30 Z'];
    for (let x = 0; x < 200; x += r.range(18, 30)) {
        const radius = r.range(9, 15);
        // Tops stay inside the strip: cy - radius >= 1.
        const cy = Math.max(radius + 1, 30 - radius * r.range(0.55, 0.85));
        // Drawn again one tile left and right, so puffs crossing the tile edge join seamlessly.
        puffs.push(circle(x, cy, radius), circle(x - 200, cy, radius), circle(x + 200, cy, radius));
    }
    return puffs.join(' ');
}

interface EdgeProps {
    kind: EdgeKind;
    background: string;
    color: string;
    seed: number;
    animated: boolean;
}

function Edge({ kind, background, color, seed, animated }: EdgeProps) {
    const shape = useMemo(() => edgeShape(kind, seed), [kind, seed]);
    if (!shape) return null;
    const style: CSSProperties & Record<'--edge-drift', string> = {
        '--edge-drift': `${String(shape.drift ?? 0)}px`,
        top: `calc(1px - ${shape.height})`,
        height: shape.height,
        backgroundImage: background,
        backgroundColor: color,
        backgroundPositionY: shape.height,
        maskImage: shape.mask,
        maskSize: shape.size,
        maskRepeat: 'repeat-x',
        WebkitMaskImage: shape.mask,
        WebkitMaskSize: shape.size,
        WebkitMaskRepeat: 'repeat-x',
    };
    // Drifting edges slide their mask one tile at a time; full-width ones (arch, slant) breathe.
    const motion =
        !animated || shape.drift === 0 ? '' : shape.drift ? 'edge-drift' : 'edge-breathe';
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 z-10 ${motion}`}
            style={style}
        />
    );
}

interface SceneProps {
    block: ResolvedBlock;
    index: number;
    children: ReactNode;
}

// One section = one block: its own backdrop, edge and entrance, all chosen in the Composer.
export function Scene({ block, index, children }: SceneProps) {
    const { data, tier, dir, motion } = useInvite();
    const edit = useEditing();
    const { design, culture, seed } = data.invitation;
    const scene = useMemo(
        () => buildScene(block.scene, design, culture, seed, block.motif),
        [block.scene, block.motif, design, culture, seed],
    );
    const enter = useMemo(
        () => ({
            preset: settleEnter(block.enter, motion === 'calm'),
            tier,
            rtl: dir === 'rtl',
        }),
        [block.enter, tier, dir, motion],
    );
    const color = scene.vars['--inv-bg'] ?? 'transparent';
    const style = {
        ...scene.vars,
        backgroundImage: scene.background,
        backgroundColor: color,
        color: 'var(--inv-ink)',
    } as CSSProperties;
    const selected = edit?.selected === block.type;
    // The section's one "Animate edge" switch; screenshots and the static tier always hold still.
    const live = block.edgeMotion && tier !== 'static';
    return (
        <div
            className="relative isolate"
            style={style}
            data-scene={block.scene}
            data-block={`${block.type}:${block.variant}`}
            data-block-key={blockKey(block)}
            data-selected={selected || undefined}
            data-empty-hint={edit?.hint(block.type)}
            // In the visual editor a click anywhere in a section selects it (text stays typeable).
            onClickCapture={
                edit
                    ? (e) => {
                          const target = e.target as HTMLElement;
                          const card = target.closest<HTMLElement>('[data-event-index]');
                          const event = card ? Number(card.dataset.eventIndex) : undefined;
                          // Photos (and their empty placeholders) open the photo controls.
                          // Overlays (names over a cover photo) sit above it: look under the pointer too.
                          const pic =
                              target.closest<HTMLElement>('img, [data-photo]') ??
                              document
                                  .elementsFromPoint(e.clientX, e.clientY)
                                  .find(
                                      (el): el is HTMLElement =>
                                          el instanceof HTMLElement &&
                                          el.matches('img, [data-photo]') &&
                                          e.currentTarget.contains(el),
                                  );
                          edit.select(block.type, {
                              event,
                              photo: Boolean(pic),
                              slot: pic?.dataset.photoSlot,
                              text: target.closest<HTMLElement>('[data-editable]')?.dataset
                                  .editable as TextPath | undefined,
                          });
                      }
                    : undefined
            }
        >
            {edit && selected && (
                <span className="pointer-events-none absolute start-3 top-3 z-50 rounded-md bg-[#6366f1] px-2 py-0.5 font-sans text-[11px] font-medium tracking-normal text-white shadow">
                    {edit.label(block.type)}
                </span>
            )}
            {index > 0 && block.edge === 'seam' && <Seam animated={live} />}
            {index > 0 && block.edge === 'lace' && <LaceRibbon />}
            {index > 0 && isProcession(block.edge) && (
                <Procession kind={block.edge} seed={seed + index} animated={live} />
            )}
            {index > 0 && block.edge === 'heartbeat' && <Heartbeat animated={live} />}
            {index > 0 && (
                <Edge
                    kind={block.edge}
                    background={scene.background}
                    color={color}
                    seed={seed + index}
                    animated={live}
                />
            )}
            {scene.dappled && tier !== 'static' && (
                <Dappled lattice={cultureOf(culture).id === 'islamic'} />
            )}
            {scene.starry && tier !== 'static' && <Twinkle seed={seed} />}
            {scene.effect === 'petals' && <Petals />}
            {scene.effect === 'rays' && <LightRays />}
            {scene.spotlight && (
                // Plain silk pooled behind the text: embroidery frames the words instead of crossing them.
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{ background: spotlight }}
                />
            )}
            <EnterContext value={enter}>
                <DividerContext value={block.divider}>
                    <div className="relative" data-block-body>
                        {children}
                    </div>
                </DividerContext>
            </EnterContext>
        </div>
    );
}
