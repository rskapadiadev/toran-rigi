import { blockKey, type ResolvedBlock, settleEnter } from '@shared/blocks';
import { cultureOf } from '@shared/cultures';
import { rng } from '@shared/generative';
import { isDark, materialBackground, mixHex, svgDataUrl } from '@shared/materials';
import { cultureMotifs, type MotifId } from '@shared/motifs';
import type { EdgeKind, InvitationDesign, SceneKind } from '@shared/types';
import { type CSSProperties, type ReactNode, useMemo } from 'react';

import { EnterContext } from '../motion/Reveal';
import { useInvite } from './context';

interface SceneStyle {
    background: string;
    vars: Record<string, string>;
    dappled: boolean;
    spotlight?: boolean;
    starry?: boolean;
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
function Seam() {
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
            className="relative z-10 h-4 shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
            style={{
                backgroundImage: background,
                backgroundSize: '40px 40px',
            }}
        />
    );
}

interface EdgeShape {
    mask: string;
    size: string;
    height: string;
}

// Torn, scalloped or arched top edge: the scene's own fabric masked into a shape over the previous one.
function edgeShape(kind: EdgeKind, seed: number): EdgeShape | null {
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
            };
        }
        case 'scallop':
            return {
                mask: svgDataUrl(
                    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 20'><path d='M0 20 L0 14 A10 10 0 0 1 20 14 A10 10 0 0 1 40 14 L40 20 Z'/><circle cx='10' cy='8' r='1.6'/><circle cx='30' cy='8' r='1.6'/></svg>`,
                ),
                size: '40px 100%',
                height: '20px',
            };
        case 'arch':
            return {
                mask: svgDataUrl(
                    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='M0 100 C0 40 22 0 50 0 C78 0 100 40 100 100 Z'/></svg>`,
                ),
                size: '100% 100%',
                height: 'min(14cqw, 90px)',
            };
        case 'seam':
        case 'none':
            return null;
    }
}

interface EdgeProps {
    kind: EdgeKind;
    background: string;
    color: string;
    seed: number;
}

function Edge({ kind, background, color, seed }: EdgeProps) {
    const shape = useMemo(() => edgeShape(kind, seed), [kind, seed]);
    if (!shape) return null;
    const style: CSSProperties = {
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
    return (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10" style={style} />
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
    return (
        <div
            className="relative isolate"
            style={style}
            data-scene={block.scene}
            data-block={`${block.type}:${block.variant}`}
            data-block-key={blockKey(block)}
        >
            {index > 0 && block.edge === 'seam' && <Seam />}
            {index > 0 && (
                <Edge
                    kind={block.edge}
                    background={scene.background}
                    color={color}
                    seed={seed + index}
                />
            )}
            {scene.dappled && tier !== 'static' && (
                <Dappled lattice={cultureOf(culture).id === 'islamic'} />
            )}
            {scene.starry && tier !== 'static' && <Twinkle seed={seed} />}
            {scene.spotlight && (
                // Plain silk pooled behind the text: embroidery frames the words instead of crossing them.
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{ background: spotlight }}
                />
            )}
            <EnterContext value={enter}>
                <div className="relative" data-block-body>
                    {children}
                </div>
            </EnterContext>
        </div>
    );
}
