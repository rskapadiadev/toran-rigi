import { cultureOf } from '@shared/cultures';
import { rng } from '@shared/generative';
import { materialBackground, mixHex } from '@shared/materials';
import { cultureMotifs, motifs } from '@shared/motifs';
import { type CSSProperties, useMemo, useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// Irregular wax blob: every couple's seal has its own wavy edge.
function sealOutline(seed: number, r = 100, cx = 110, cy = 110) {
    const rand = rng(seed);
    const points = 28;
    const pts = Array.from({ length: points }, (_, i) => {
        const a = (Math.PI * 2 * i) / points;
        const rr = r * (0.93 + rand.next() * 0.1);
        return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as const;
    });
    // Smooth closed curve: quadratic segments through midpoints, control points at the jittered vertices.
    const mids = pts.map((p, i) => {
        const next = pts[(i + 1) % points] ?? p;
        return [(p[0] + next[0]) / 2, (p[1] + next[1]) / 2] as const;
    });
    const f = (n: number) => n.toFixed(1);
    const first = mids[mids.length - 1] ?? [cx, cy];
    const segments = pts.map((p, i) => {
        const end = mids[i] ?? p;
        return `Q${f(p[0])} ${f(p[1])} ${f(end[0])} ${f(end[1])}`;
    });
    return `M${f(first[0])} ${f(first[1])} ${segments.join(' ')} Z`;
}

interface SealProps {
    seed: number;
    initials: string;
    motif: string[];
}

function WaxSeal({ seed, initials, motif }: SealProps) {
    const outline = useMemo(() => sealOutline(seed), [seed]);
    const id = `seal-${String(seed)}`;
    return (
        <svg viewBox="0 0 220 220" className="size-full overflow-visible" aria-hidden>
            <defs>
                <radialGradient id={`${id}-wax`} cx="38%" cy="32%" r="75%">
                    <stop
                        offset="0"
                        stopColor="color-mix(in oklab, var(--inv-primary) 70%, white)"
                    />
                    <stop offset="0.45" stopColor="var(--wax)" />
                    <stop
                        offset="1"
                        stopColor="color-mix(in oklab, var(--inv-primary) 55%, black)"
                    />
                </radialGradient>
                <filter id={`${id}-sheen`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b" />
                    <feSpecularLighting
                        in="b"
                        surfaceScale="5"
                        specularConstant="0.32"
                        specularExponent="34"
                        lightingColor="#ffffff"
                        result="s"
                    >
                        <feDistantLight azimuth="235" elevation="52" />
                    </feSpecularLighting>
                    <feComposite in="s" in2="SourceAlpha" operator="in" result="si" />
                    <feMerge>
                        <feMergeNode in="SourceGraphic" />
                        <feMergeNode in="si" />
                    </feMerge>
                </filter>
                <filter id={`${id}-press`} x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b" />
                    <feSpecularLighting
                        in="b"
                        surfaceScale="-3"
                        specularConstant="1"
                        specularExponent="14"
                        lightingColor="#fff4d6"
                        result="s"
                    >
                        <feDistantLight azimuth="235" elevation="40" />
                    </feSpecularLighting>
                    <feComposite in="s" in2="SourceAlpha" operator="in" result="si" />
                    <feMerge>
                        <feMergeNode in="SourceGraphic" />
                        <feMergeNode in="si" />
                    </feMerge>
                </filter>
            </defs>
            <g>
                <ellipse
                    cx="114"
                    cy="120"
                    rx="98"
                    ry="92"
                    fill="rgba(0,0,0,0.35)"
                    style={{ filter: 'blur(6px)' }}
                />
                <path d={outline} fill={`url(#${id}-wax)`} filter={`url(#${id}-sheen)`} />
                <circle
                    cx="110"
                    cy="110"
                    r="72"
                    fill="none"
                    stroke="color-mix(in oklab, var(--wax) 55%, black)"
                    strokeWidth="3"
                    opacity="0.6"
                />
                <g filter={`url(#${id}-press)`} fill="color-mix(in oklab, var(--wax) 80%, black)">
                    {Array.from({ length: 12 }, (_, i) => (
                        <g
                            key={i}
                            transform={`rotate(${i * 30} 110 110) translate(103 34) scale(0.14)`}
                        >
                            {motif.map((d, k) => (
                                <path key={k} d={d} fillRule="evenodd" />
                            ))}
                        </g>
                    ))}
                    <text
                        x="110"
                        y="126"
                        textAnchor="middle"
                        fontSize="58"
                        className="inv-script"
                        fill="color-mix(in oklab, var(--inv-gold) 70%, white)"
                    >
                        {initials}
                    </text>
                </g>
            </g>
        </svg>
    );
}

const flapBase = 'absolute inset-0 will-change-transform';

// Silk envelope with piped gold edges. The wax seal glows, lifts, and rides the top flap as it
// swings open on its hinge; light pours from the opening and carries guests inside.
export function EnvelopeOpening({ onBegin, onOpened }: OpeningProps) {
    const { data, tier, names } = useInvite();
    const { design, seed, culture } = data.invitation;
    const p = design.palette;
    const [motifId = 'paisley'] = cultureMotifs[cultureOf(culture).id];
    const initials = names.initials.join('');
    const stage = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState(false);

    const silk = useMemo(
        () =>
            materialBackground({
                kind: 'silk',
                base: mixHex(p.bg, p.gold, 0.16),
                motif: motifId,
                motifColor: p.gold,
                seed,
                motifScale: 0.3,
            }),
        [p.bg, p.gold, motifId, seed],
    );
    const flapSilk = useMemo(
        () =>
            materialBackground({
                kind: 'silk',
                base: mixHex(p.bg, p.gold, 0.22),
                motif: motifId,
                motifColor: p.gold,
                seed: seed + 5,
                motifScale: 0.3,
            }),
        [p.bg, p.gold, motifId, seed],
    );
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
        const q = (sel: string) => root.querySelector(sel);
        const tl = gsap.timeline({ onComplete: onOpened });
        // 1. The seal warms: a gold halo breathes out from under the wax.
        tl.to(q('[data-halo]'), {
            opacity: 1,
            scale: 1.25,
            duration: 0.55,
            ease: 'power2.out',
        })
            .call(() => {
                if ('vibrate' in navigator) navigator.vibrate(18);
            })
            // 2. It lifts off the paper: bigger, with a deeper, softer shadow.
            .to(
                q('[data-seal]'),
                {
                    scale: 1.08,
                    y: -6,
                    duration: 0.45,
                    ease: 'power2.out',
                },
                0.25,
            )
            .to(
                q('[data-seal-shadow]'),
                {
                    opacity: 0.55,
                    y: 26,
                    scale: 1.15,
                    duration: 0.45,
                },
                0.25,
            )
            .to(q('[data-halo]'), {
                opacity: 0,
                duration: 0.4,
            })
            // 3. The top flap swings up on its hinge, slowly, carrying the seal with it.
            .to(
                q('[data-top]'),
                {
                    // Negative: the tip travels up towards the hinge, so the seal rises and foreshortens.
                    rotateX: -176,
                    duration: 1.35,
                    ease: 'power2.inOut',
                },
                0.8,
            )
            .to(
                [q('[data-seal-shadow]'), q('[data-flap-lines]')],
                {
                    opacity: 0,
                    duration: 0.35,
                },
                0.8,
            )
            // 4. Light warms the lining inside the open envelope…
            .to(
                q('[data-glow]'),
                {
                    opacity: 1,
                    duration: 0.9,
                    ease: 'power1.in',
                },
                1.3,
            )
            // 5. …then pours out of the opening and fills the screen; the invitation waits behind it.
            .to(
                q('[data-bloom]'),
                {
                    '--r': '190%',
                    duration: 1.1,
                    ease: 'power2.in',
                },
                1.9,
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.75,
                    ease: 'power1.out',
                },
                2.85,
            );
    };

    const pipe = mixHex(p.gold, '#ffffff', 0.2);
    // Real sealing wax is deep and saturated: pull the theme primary towards oxblood.
    const wax = mixHex(p.primary, '#5e0815', 0.72);
    const lining = mixHex(p.primary, p.gold, 0.35);
    const flapStyle = (clip: string): CSSProperties => ({
        backgroundImage: flapSilk,
        clipPath: clip,
        filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.25))',
    });

    return (
        <OpeningShell
            onTap={() => void open()}
            busy={busy}
            hideTitle
            footer={busy ? <SkipButton onSkip={onOpened} /> : null}
        >
            <div
                ref={stage}
                className="absolute inset-0 overflow-hidden [perspective:1800px]"
                style={{ backgroundImage: silk }}
            >
                {/* Inside of the envelope: a warm lining with a fine gold lattice. */}
                <div
                    className="absolute inset-0"
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
                        background: `radial-gradient(ellipse at 50% 0%, ${mixHex(lining, '#ffffff', 0.25)}, ${lining} 70%)`,
                    }}
                />
                <div
                    data-glow
                    className="absolute inset-0 opacity-0"
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
                        background:
                            'radial-gradient(ellipse at 50% 18%, #fffdf6, #ffe7b0 40%, transparent 75%)',
                    }}
                />
                {/* The pocket: side and bottom flaps stay put and hold the card. */}
                <div className={flapBase} style={flapStyle('polygon(0 0, 50% 50%, 0 100%)')} />
                <div
                    className={flapBase}
                    style={flapStyle('polygon(100% 0, 50% 50%, 100% 100%)')}
                />
                <div
                    className={flapBase}
                    style={flapStyle('polygon(0 100%, 50% 50%, 100% 100%)')}
                />
                <svg
                    className="pointer-events-none absolute inset-0 size-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden
                    data-flap-lines
                >
                    <path
                        d="M0 100 L50 50 L100 100"
                        stroke={pipe}
                        strokeWidth="0.5"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.9"
                    />
                </svg>
                {/* Top flap + seal turn together about the top edge. */}
                <div
                    data-top
                    className="absolute inset-0 z-10 [transform-style:preserve-3d]"
                    style={{ transformOrigin: '50% 0%' }}
                >
                    <div className={flapBase} style={flapStyle('polygon(0 0, 100% 0, 50% 50%)')} />
                    <svg
                        className="pointer-events-none absolute inset-0 size-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden
                    >
                        <path
                            d="M0 0 L50 50 L100 0"
                            stroke={pipe}
                            strokeWidth="0.5"
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                            opacity="0.9"
                        />
                    </svg>
                    <div
                        className="absolute start-1/2 top-1/2 size-[min(46cqw,220px)] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
                        style={{ '--wax': wax } as CSSProperties}
                    >
                        <div
                            data-halo
                            className="absolute -inset-[35%] scale-75 rounded-full opacity-0 blur-2xl"
                            style={{background: `radial-gradient(circle, ${p.gold}, transparent 65%)`,}}
                        />
                        <div
                            data-seal-shadow
                            className="absolute inset-[8%] rounded-full bg-black opacity-25 blur-xl"
                        />
                        <div data-seal className="absolute inset-0">
                            <WaxSeal seed={seed} initials={initials} motif={motifs[motifId]} />
                        </div>
                    </div>
                </div>
                {/* Soft-edged circle of light that grows from the opening (a mask, so no hard edge). */}
                <div
                    data-bloom
                    className="pointer-events-none absolute inset-0 z-30"
                    style={
                        {
                            '--r': '0%',
                            background: `radial-gradient(circle at 50% 22%, #fffdf6, ${mixHex(p.bg, '#fff8ec', 0.8)} 45%, ${mixHex(p.bg, '#fff8ec', 0.55)} 100%)`,
                            maskImage:
                                'radial-gradient(circle at 50% 22%, black calc(var(--r) - 30%), transparent var(--r))',
                            WebkitMaskImage:
                                'radial-gradient(circle at 50% 22%, black calc(var(--r) - 30%), transparent var(--r))',
                        } as CSSProperties
                    }
                />
            </div>
        </OpeningShell>
    );
}

function SkipButton({ onSkip }: { onSkip: () => void }) {
    return (
        <button
            type="button"
            onClick={onSkip}
            className="absolute end-5 top-5 z-40 text-xs tracking-[0.35em] uppercase opacity-80"
        >
            Skip ›
        </button>
    );
}
