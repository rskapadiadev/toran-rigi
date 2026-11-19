// The film's layers on the invitation: photos, the monogram and ornaments placed on the picture, and
// effects over it, each shown for its stretch of seconds with its entrance.
import { momentAlpha } from '@shared/film';
import { type MotifId, motifs } from '@shared/motifs';
import { photoUrl } from '@shared/photos';
import type { FilmLayer } from '@shared/types';
import type { MotionValue } from 'motion/react';
import { type CSSProperties, useEffect, useRef } from 'react';

import { drawEffect, enterLook, initialsOf, poseAt, shapeAspect } from './layers';

const isMotif = (id: string | undefined): id is MotifId => id !== undefined && id in motifs;

const shapeLook = {
    arch: 'rounded-t-[999px] rounded-b-md',
    circle: 'rounded-full',
    frame: 'rounded-md',
} as const;

interface ArtProps {
    layer: FilmLayer;
    one: string;
    two: string;
}

// What a layer shows (its size comes from its width; effects are drawn on the canvas instead).
export function LayerArt({ layer, one, two }: ArtProps) {
    if (layer.kind === 'photo') {
        const shape = layer.shape ?? 'arch';
        const frame: CSSProperties = { aspectRatio: String(shapeAspect[shape]) };
        return (
            <div
                className={`overflow-hidden bg-black/30 p-[3%] shadow-[0_14px_40px_-12px_rgba(0,0,0,0.7)] ring-2 ring-(--inv-gold) ${shapeLook[shape]}`}
                style={frame}
            >
                {layer.photo ? (
                    <img
                        src={photoUrl(layer.photo)}
                        alt=""
                        className={`size-full object-cover ${shapeLook[shape]}`}
                        draggable={false}
                    />
                ) : (
                    <div className={`size-full bg-white/10 ${shapeLook[shape]}`} />
                )}
            </div>
        );
    }
    if (layer.kind === 'monogram')
        return (
            <svg viewBox="0 0 100 100" className="w-full text-(--inv-gold)" aria-hidden>
                <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="rgba(0,0,0,0.25)"
                    stroke="currentColor"
                    strokeWidth="1.6"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="41"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.6"
                />
                <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="inv-script"
                    fill="currentColor"
                    fontSize={two ? 24 : 40}
                >
                    {initialsOf(one, two)}
                </text>
            </svg>
        );
    if (layer.kind === 'ornament' && isMotif(layer.motif))
        return (
            <svg
                viewBox="0 0 100 100"
                className="w-full text-(--inv-gold) drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]"
                aria-hidden
            >
                {motifs[layer.motif].map((d, i) => (
                    <path key={i} d={d} fill="currentColor" fillRule="evenodd" />
                ))}
            </svg>
        );
    return null;
}

interface Props {
    layers: FilmLayer[];
    time: MotionValue<number>;
    one: string;
    two: string;
    dir: 'ltr' | 'rtl';
    // Reduced motion: effects hold still.
    still: boolean;
}

export function FilmLayers({ layers, time, one, two, dir, still }: Props) {
    const nodes = useRef<(HTMLDivElement | null)[]>([]);
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let frame = 0;
        const paint = () => {
            frame = 0;
            const t = time.get();
            layers.forEach((layer, i) => {
                const el = nodes.current[i];
                if (!el) return;
                const a = momentAlpha(layer, t);
                const look = enterLook(layer.enter ?? 'fade', a);
                // Keyframes move it, size it, fade and turn it; a place in the picture, never mirrored.
                const pose = poseAt(layer, t);
                const x = dir === 'rtl' ? 1 - pose.x : pose.x;
                el.style.insetInlineStart = `${String((x - pose.w / 2) * 100)}%`;
                el.style.top = `${String(pose.y * 100)}%`;
                el.style.width = `${String(pose.w * 100)}%`;
                el.style.opacity = String(a * pose.opacity);
                el.style.transform = `translateY(-50%) rotate(${String(pose.rotate)}deg) ${look.transform}`;
                el.style.filter = look.filter;
                el.style.visibility = a > 0 ? 'visible' : 'hidden';
            });
            // Effects keep moving while they're on screen, even while the film holds.
            const el = canvas.current;
            const ctx = el?.getContext('2d');
            const live = layers.filter((l) => l.kind === 'effect' && momentAlpha(l, t) > 0);
            if (!el || !ctx) return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.round(el.clientWidth * dpr);
            const h = Math.round(el.clientHeight * dpr);
            if (el.width !== w || el.height !== h) {
                el.width = w;
                el.height = h;
            }
            ctx.clearRect(0, 0, w, h);
            const clock = still ? 0 : performance.now() / 1000;
            for (const layer of live)
                drawEffect(ctx, layer.effect ?? 'petals', clock, w, h, momentAlpha(layer, t));
            if (live.length > 0 && !still) frame = requestAnimationFrame(paint);
        };
        const kick = () => {
            if (!frame) frame = requestAnimationFrame(paint);
        };
        kick();
        const off = time.on('change', kick);
        return () => {
            off();
            cancelAnimationFrame(frame);
        };
    }, [layers, time, still, dir]);

    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 start-1/2 aspect-[9/16] h-full -translate-x-1/2 rtl:translate-x-1/2"
            data-film-layers
        >
            <canvas ref={canvas} className="absolute inset-0 size-full" />
            {layers.map((layer, i) => {
                if (layer.kind === 'effect') return null;
                // Places in the picture, which is never mirrored.
                const x = dir === 'rtl' ? 1 - layer.zone.x : layer.zone.x;
                const place: CSSProperties = {
                    insetInlineStart: `${String((x - layer.zone.w / 2) * 100)}%`,
                    top: `${String(layer.zone.y * 100)}%`,
                    width: `${String(layer.zone.w * 100)}%`,
                    opacity: 0,
                    visibility: 'hidden',
                };
                return (
                    <div
                        // Layers have no ids: their place in the list is who they are.
                        key={i}
                        ref={(el) => {
                            nodes.current[i] = el;
                        }}
                        className="absolute"
                        style={place}
                        data-film-layer={i}
                    >
                        <LayerArt layer={layer} one={one} two={two} />
                    </div>
                );
            })}
        </div>
    );
}
