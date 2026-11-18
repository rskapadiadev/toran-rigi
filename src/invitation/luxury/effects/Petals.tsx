// Falling petals: rose and marigold petals drifting down a section, fluttering in 3D as they sway.
// Pure CSS keyframes (translate + transform + opacity only), so low-end phones stay smooth.
import { rng } from '@shared/generative';
import { mixHex } from '@shared/materials';
import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from 'react';

import { useInvite } from '../../context';
import { usePrint } from '../../print';

type Shape = 'rose' | 'marigold';

interface Petal {
    shape: Shape;
    tone: number;
    x: number;
    size: number;
    fall: number;
    delay: number;
    sway: number;
    swayDelay: number;
    amp: number;
    spin: number;
    alpha: number;
    restY: number;
    rest: boolean;
}

interface Tone {
    light: string;
    mid: string;
    deep: string;
}

const ROSE =
    'M20 46C9 41 2.5 30 3 19C3.5 9 10 2.5 15.5 4C18 4.7 19.2 6.5 20 8.2C20.8 6.5 22 4.7 24.5 4C30 2.5 36.5 9 37 19C37.5 30 31 41 20 46Z';
const MARIGOLD =
    'M20 46C14.5 44 10 37 9 28C8.2 20 8.6 12 11 6.5L13.6 9.2L15.8 4.4L18.6 8.4L20.6 3.4L23.2 8.2L26 4.4L28 9.4L30.6 6.6C32.6 12.6 32.4 20 31.4 27.4C30.4 37 26 44 20 46Z';
// Screen heights a petal crosses in one fall: taller sections get longer falls, not faster petals.
const SCREEN = 860;

function petalsFor(seed: number, count: number): Petal[] {
    const r = rng(seed + 808);
    return Array.from({ length: count }, (_, i) => {
        const shape: Shape = i % 3 === 2 ? 'marigold' : 'rose';
        // Three depth bands: far petals are smaller, fainter and slower.
        const depth = i % 3 === 0 ? 0.62 : i % 3 === 1 ? 0.82 : 1;
        const fall = r.range(13, 19) / (0.75 + depth * 0.25);
        return {
            shape,
            tone: r.int(0, 1),
            // Spread evenly across the width, then jittered, so petals never bunch up.
            x: ((i + r.range(0.15, 0.85)) / count) * 96 + 2,
            size: (shape === 'rose' ? r.range(26, 38) : r.range(17, 25)) * depth,
            fall,
            // Even stagger through the fall, so the section is never empty or crowded.
            delay: -((i * 0.618 * fall) % fall) - r.range(0, 1.5),
            sway: r.range(3.2, 5.4),
            swayDelay: -r.range(0, 5),
            amp: r.range(14, 34) * depth,
            spin: r.range(-50, 50),
            alpha: 0.55 + depth * 0.4,
            // Resting petals keep clear of the edges, so a section boundary never slices one.
            restY: r.range(10, 86),
            rest: i % 3 !== 0 && i < 12,
        };
    });
}

function useHeight() {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(SCREEN);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            // Bucketed, so tiny reflows never restart the animations.
            const h = Math.round((entry?.contentRect.height ?? SCREEN) / 200) * 200;
            setHeight(Math.max(h, 400));
        });
        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, []);
    return {
        ref,
        height,
    };
}

export function Petals() {
    const { data, tier } = useInvite();
    const print = usePrint();
    const id = useId();
    const p = data.invitation.design.palette;
    const seed = data.invitation.seed;
    const { ref, height } = useHeight();
    const live = tier !== 'static' && !print;
    const screens = Math.min(Math.max(height / SCREEN, 1), 3);
    const count = Math.round(Math.min(16 + (screens - 1) * 4, 24));
    const petals = useMemo(() => petalsFor(seed, count), [seed, count]);
    const tones = useMemo(() => {
        const rose = (c: string, w: number) => mixHex(mixHex(c, '#e2617f', w), '#ffffff', 0.18);
        const marigold = (c: string, w: number) => mixHex(c, '#f39a1e', w);
        const tone = (mid: string): Tone => ({
            light: mixHex(mid, '#fff6ec', 0.5),
            mid,
            deep: mixHex(mid, '#5a0c1c', 0.32),
        });
        return {
            rose: [tone(rose(p.primary, 0.74)), tone(rose(p.accent, 0.82))],
            marigold: [tone(marigold(p.gold, 0.55)), tone(marigold(p.accent, 0.72))],
        };
    }, [p.primary, p.accent, p.gold]);
    const grad = (shape: Shape, tone: number) => `${id}-${shape}-${String(tone)}`;
    const shown = live ? petals : petals.filter((petal) => petal.rest);
    return (
        <div ref={ref} aria-hidden className="fx-petals pointer-events-none absolute inset-0">
            <svg width="0" height="0" className="absolute">
                <defs>
                    {(['rose', 'marigold'] as const).map((shape) =>
                        tones[shape].map((t, i) => (
                            <radialGradient
                                key={grad(shape, i)}
                                id={grad(shape, i)}
                                cx="0.5"
                                cy="0.92"
                                r="0.95"
                                fx="0.5"
                                fy="1"
                            >
                                <stop offset="0" stopColor={t.deep} />
                                <stop offset="0.5" stopColor={t.mid} />
                                <stop offset="1" stopColor={t.light} />
                            </radialGradient>
                        )),
                    )}
                    <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0.3">
                        <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
                        <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
                        <stop offset="1" stopColor="#000000" stopOpacity="0.12" />
                    </linearGradient>
                </defs>
            </svg>
            {shown.map((petal, i) => {
                const style = {
                    insetInlineStart: `${petal.x.toFixed(2)}%`,
                    width: `${petal.size.toFixed(1)}px`,
                    height: `${(petal.size * 1.2).toFixed(1)}px`,
                    opacity: petal.alpha.toFixed(2),
                    '--fall': `${(petal.fall * screens).toFixed(2)}s`,
                    '--delay': `${(petal.delay * screens).toFixed(2)}s`,
                    '--sway': `${petal.sway.toFixed(2)}s`,
                    '--sway-delay': `${petal.swayDelay.toFixed(2)}s`,
                    '--amp': `${petal.amp.toFixed(1)}px`,
                    '--spin': `${petal.spin.toFixed(0)}deg`,
                    '--rest-y': `${petal.restY.toFixed(1)}cqh`,
                    '--alpha': petal.alpha.toFixed(2),
                } as CSSProperties;
                return (
                    <svg
                        key={i}
                        viewBox="0 0 40 48"
                        className={`fx-petal ${live ? 'fx-petal-live' : ''}`}
                        data-rest={petal.rest ? 'on' : 'off'}
                        style={style}
                    >
                        <path
                            d={petal.shape === 'rose' ? ROSE : MARIGOLD}
                            fill={`url(#${grad(petal.shape, petal.tone)})`}
                        />
                        <path
                            d={petal.shape === 'rose' ? ROSE : MARIGOLD}
                            fill={`url(#${id}-sheen)`}
                        />
                        {/* The petal's cupped fold: a soft shadow down one side gives it body. */}
                        <path
                            d="M20 45C13 41 8.5 32 9 22C9.5 15 12 10 15 8C12.5 16 13.5 30 20 45Z"
                            fill="#3a0612"
                            fillOpacity="0.14"
                        />
                        <path
                            d="M20 44C19.4 34 19.6 22 20.4 12"
                            fill="none"
                            stroke="#ffffff"
                            strokeOpacity="0.28"
                            strokeWidth="0.7"
                            strokeLinecap="round"
                        />
                    </svg>
                );
            })}
        </div>
    );
}
