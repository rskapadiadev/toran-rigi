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

// Jagged crack from top to bottom; returns the left-half polygon (the right half is its complement).
function crackPath(seed: number) {
    const rand = rng(seed ^ 0x5bd1e995);
    const xs = Array.from(
        { length: 9 },
        (_, i) => [110 + (rand.next() - 0.5) * 34, (220 / 8) * i] as const,
    );
    return {
        left: `M0 0 ${xs.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} L0 220 Z`,
        right: `M220 0 ${xs.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} L220 220 Z`,
        line: `M${xs.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`,
    };
}

interface SealProps {
    seed: number;
    initials: string;
    motif: string[];
    half?: 'left' | 'right';
    crack: ReturnType<typeof crackPath>;
}

function WaxSeal({ seed, initials, motif, half, crack }: SealProps) {
    const outline = useMemo(() => sealOutline(seed), [seed]);
    const id = `seal-${half ?? 'whole'}`;
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
                <clipPath id={`${id}-clip`}>
                    <path
                        d={
                            half === 'left'
                                ? crack.left
                                : half === 'right'
                                  ? crack.right
                                  : 'M0 0H220V220H0Z'
                        }
                    />
                </clipPath>
            </defs>
            <g clipPath={`url(#${id}-clip)`}>
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

const flapBase = 'absolute inset-0 [backface-visibility:hidden] will-change-transform';

// Silk envelope with piped gold edges; the seal cracks, flaps fold open in 3D, the cotton-paper letter rises.
export function EnvelopeOpening({ onBegin, onOpened }: OpeningProps) {
    const { data, tier, names, copy } = useInvite();
    const { design, seed, culture } = data.invitation;
    const p = design.palette;
    const [motifId = 'paisley'] = cultureMotifs[cultureOf(culture).id];
    const initials = names.initials.join('');
    const crack = useMemo(() => crackPath(seed), [seed]);
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
    const paper = useMemo(
        () =>
            materialBackground({
                kind: 'paper',
                base: '#fbf6ec',
                seed: seed + 9,
            }),
        [seed],
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
        tl.to(q('[data-seal]'), {
            scale: 0.9,
            duration: 0.18,
            ease: 'power2.in',
        })
            .to(q('[data-seal]'), {
                scale: 1,
                duration: 0.25,
                ease: 'back.out(3)',
            })
            .set(q('[data-seal-whole]'), { opacity: 0 })
            .set([q('[data-seal-left]'), q('[data-seal-right]'), q('[data-crack]')], { opacity: 1 })
            .call(() => {
                if ('vibrate' in navigator) navigator.vibrate([18, 30, 40]);
            })
            .to(
                q('[data-seal-left]'),
                {
                    x: -60,
                    y: 240,
                    rotate: -38,
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.in',
                },
                '+=0.12',
            )
            .to(
                [q('[data-crack]'), q('[data-flap-lines]')],
                {
                    opacity: 0,
                    duration: 0.3,
                },
                '<',
            )
            .to(
                q('[data-seal-right]'),
                {
                    x: 60,
                    y: 260,
                    rotate: 32,
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.in',
                },
                '<',
            )
            .to(
                q('[data-flap=top]'),
                {
                    rotateX: -178,
                    duration: 1,
                    ease: 'power3.inOut',
                },
                '-=0.6',
            )
            .to(
                q('[data-flap=left]'),
                {
                    rotateY: 178,
                    duration: 1,
                    ease: 'power3.inOut',
                },
                '-=0.85',
            )
            .to(
                q('[data-flap=right]'),
                {
                    rotateY: -178,
                    duration: 1,
                    ease: 'power3.inOut',
                },
                '<',
            )
            .to(
                q('[data-flap=bottom]'),
                {
                    rotateX: 178,
                    duration: 1,
                    ease: 'power3.inOut',
                },
                '-=0.8',
            )
            .fromTo(
                q('[data-letter]'),
                {
                    y: '18%',
                    scale: 0.7,
                    opacity: 0,
                },
                {
                    y: '0%',
                    scale: 1,
                    opacity: 1,
                    duration: 1.1,
                    ease: 'power3.out',
                },
                '-=0.6',
            )
            .to(
                q('[data-letter]'),
                {
                    scale: 2.6,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.in',
                },
                '+=0.9',
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.6,
                },
                '-=0.5',
            );
    };

    const pipe = mixHex(p.gold, '#ffffff', 0.2);
    // Real sealing wax is deep and saturated: pull the theme primary towards oxblood.
    const wax = mixHex(p.primary, '#5e0815', 0.72);
    const flapStyle = (clip: string, origin: string): CSSProperties => ({
        backgroundImage: flapSilk,
        clipPath: clip,
        transformOrigin: origin,
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
                className="absolute inset-0 overflow-hidden [perspective:1600px]"
                style={{ backgroundImage: silk }}
            >
                <div
                    data-letter
                    className="absolute inset-[9%] flex flex-col items-center justify-center opacity-0 shadow-2xl"
                    style={{
                        backgroundImage: paper,
                        color: '#2b1d18',
                    }}
                >
                    <div className="absolute inset-3 border-2" style={{ borderColor: p.gold }} />
                    <p className="inv-script text-[clamp(2.6rem,13cqw,4.6rem)] leading-tight">
                        {names.one}
                    </p>
                    {names.two && (
                        <>
                            <p className="inv-script text-3xl" style={{ color: p.gold }}>
                                {copy('and')}
                            </p>
                            <p className="inv-script text-[clamp(2.6rem,13cqw,4.6rem)] leading-tight">
                                {names.two}
                            </p>
                        </>
                    )}
                </div>
                <div
                    data-flap="bottom"
                    className={flapBase}
                    style={flapStyle('polygon(0 100%, 50% 50%, 100% 100%)', '50% 100%')}
                />
                <div
                    data-flap="left"
                    className={flapBase}
                    style={flapStyle('polygon(0 0, 50% 50%, 0 100%)', '0 50%')}
                />
                <div
                    data-flap="right"
                    className={flapBase}
                    style={flapStyle('polygon(100% 0, 50% 50%, 100% 100%)', '100% 50%')}
                />
                <div
                    data-flap="top"
                    className={`${flapBase} z-10`}
                    style={flapStyle('polygon(0 0, 100% 0, 50% 50%)', '50% 0')}
                />
                <svg
                    className="pointer-events-none absolute inset-0 z-10 size-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden
                    data-flap-lines
                >
                    <path
                        d="M0 0 L50 50 L100 0 M0 100 L50 50 L100 100"
                        stroke={pipe}
                        strokeWidth="0.5"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.9"
                    />
                </svg>
                <div
                    data-seal
                    className="absolute inset-0 z-20 m-auto size-[min(52cqw,240px)]"
                    style={{ '--wax': wax } as CSSProperties}
                >
                    <div data-seal-whole className="absolute inset-0">
                        <WaxSeal
                            seed={seed}
                            initials={initials}
                            motif={motifs[motifId]}
                            crack={crack}
                        />
                    </div>
                    <div data-seal-left className="absolute inset-0 opacity-0">
                        <WaxSeal
                            seed={seed}
                            initials={initials}
                            motif={motifs[motifId]}
                            crack={crack}
                            half="left"
                        />
                    </div>
                    <div data-seal-right className="absolute inset-0 opacity-0">
                        <WaxSeal
                            seed={seed}
                            initials={initials}
                            motif={motifs[motifId]}
                            crack={crack}
                            half="right"
                        />
                    </div>
                    <svg
                        data-crack
                        viewBox="0 0 220 220"
                        className="pointer-events-none absolute inset-0 opacity-0"
                        aria-hidden
                    >
                        <path
                            d={crack.line}
                            stroke="rgba(0,0,0,0.55)"
                            strokeWidth="2.5"
                            fill="none"
                        />
                    </svg>
                </div>
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
