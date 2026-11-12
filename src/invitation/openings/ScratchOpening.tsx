import { rng } from '@shared/generative';
import { useEffect, useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { fitCanvas, loop, rgba, type Stage } from './canvas';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

interface Spark {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
}

const BRUSH = 26;
const REVEAL_AT = 0.45;

// Brushed gold foil with a guilloché diamond lattice, drawn once per size.
function paintFoil({ ctx, w, h }: Stage, gold: string, seed: number) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, rgba(gold, 1));
    g.addColorStop(0.35, '#fff4cf');
    g.addColorStop(0.55, rgba(gold, 1));
    g.addColorStop(0.8, '#8a6a22');
    g.addColorStop(1, rgba(gold, 1));
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const r = rng(seed);
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#3a2a08';
    for (let y = 0; y < h; y += 2) {
        ctx.beginPath();
        ctx.moveTo(0, y + r.range(-0.5, 0.5));
        ctx.lineTo(w, y + r.range(-0.5, 0.5));
        ctx.stroke();
    }
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.7;
    const step = 22;
    for (let x = -h; x < w + h; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.moveTo(x + h, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

// Gold-foil scratch card: guests rub the foil away to uncover the names, sparks fly from the brush.
export function ScratchOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, names, data, copy } = useInvite();
    const { palette } = data.invitation.design;
    const foilRef = useRef<HTMLCanvasElement>(null);
    const sparkRef = useRef<HTMLCanvasElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [done, setDone] = useState(false);
    const began = useRef(false);
    const sparks = useRef<Spark[]>([]);
    // The pointer handlers live in one effect; these refs hand them the latest callbacks.
    const finishRef = useRef<() => void>(() => undefined);
    const beginRef = useRef(onBegin);

    const finish = async () => {
        if (done) return;
        setDone(true);
        if (!began.current) onBegin();
        const gsap = await loadGsap();
        const shell = cardRef.current?.closest('[data-opening]');
        gsap.timeline({ onComplete: onOpened })
            .to(foilRef.current, {
                opacity: 0,
                duration: 0.6,
            })
            .to(cardRef.current, {
                scale: 1.08,
                duration: 1.1,
                ease: 'power2.out',
            })
            .to(shell ?? [], {
                opacity: 0,
                duration: 0.6,
            });
    };

    useEffect(() => {
        finishRef.current = () => void finish();
        beginRef.current = onBegin;
    });

    useEffect(() => {
        const foil = foilRef.current;
        const sparkCanvas = sparkRef.current;
        if (!foil || !sparkCanvas || tier === 'static') return;
        const stage = fitCanvas(foil);
        const sparkStage = fitCanvas(sparkCanvas);
        if (!stage || !sparkStage) return;
        paintFoil(stage, palette.gold, data.invitation.seed);
        const { ctx } = stage;
        let last: [number, number] | null = null;
        let strokes = 0;

        const coverage = () => {
            // Sample a coarse grid of the foil's alpha: cheap enough to run every few strokes.
            const { width, height } = foil;
            const pixels = ctx.getImageData(0, 0, width, height).data;
            let clear = 0;
            let total = 0;
            for (let y = 0; y < height; y += 12)
                for (let x = 0; x < width; x += 12) {
                    total++;
                    if ((pixels[(y * width + x) * 4 + 3] ?? 255) < 40) clear++;
                }
            return clear / total;
        };

        const scratch = (x: number, y: number) => {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = BRUSH * 2;
            ctx.beginPath();
            ctx.moveTo(last?.[0] ?? x, last?.[1] ?? y);
            ctx.lineTo(x, y);
            ctx.stroke();
            last = [x, y];
            for (let i = 0; i < 3; i++)
                sparks.current.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 220,
                    vy: (Math.random() - 1) * 220,
                    life: 1,
                });
            if (++strokes % 8 === 0 && coverage() > REVEAL_AT) finishRef.current();
        };

        const point = (e: PointerEvent): [number, number] => {
            const rect = foil.getBoundingClientRect();
            return [e.clientX - rect.left, e.clientY - rect.top];
        };
        const down = (e: PointerEvent) => {
            foil.setPointerCapture(e.pointerId);
            if (!began.current) {
                began.current = true;
                beginRef.current();
            }
            last = null;
            scratch(...point(e));
        };
        const move = (e: PointerEvent) => {
            if (e.buttons === 0 && e.pointerType === 'mouse') return;
            if (!foil.hasPointerCapture(e.pointerId)) return;
            scratch(...point(e));
        };
        foil.addEventListener('pointerdown', down);
        foil.addEventListener('pointermove', move);

        const stop = loop((dt) => {
            const s = sparkStage.ctx;
            s.clearRect(0, 0, sparkStage.w, sparkStage.h);
            sparks.current = sparks.current.filter((p) => p.life > 0);
            for (const p of sparks.current) {
                p.life -= dt * 1.6;
                p.vy += 420 * dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                s.fillStyle = rgba(palette.gold, Math.max(0, p.life));
                s.beginPath();
                s.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
                s.fill();
            }
            return undefined;
        });
        return () => {
            stop();
            foil.removeEventListener('pointerdown', down);
            foil.removeEventListener('pointermove', move);
        };
    }, [tier, palette.gold, data.invitation.seed]);

    return (
        <OpeningShell
            onTap={tier === 'static' ? () => void finish() : undefined}
            hideTitle
            busy={done}
        >
            <div className="absolute inset-0 bg-(--inv-bg)" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
                <div
                    ref={cardRef}
                    className="relative flex aspect-[3/4] w-[min(82cqw,380px)] flex-col items-center justify-center overflow-hidden rounded-3xl bg-(--inv-surface) p-8 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] ring-1 ring-(--inv-gold)/60"
                >
                    <p className="text-[10px] tracking-[0.45em] text-(--inv-gold) uppercase">
                        {copy('saveTheDate')}
                    </p>
                    <h1 className="inv-display mt-6 text-[clamp(2.2rem,10cqw,3.6rem)] leading-[1] break-normal">
                        <span className="foil-text block">{names.one}</span>
                        {names.two && (
                            <>
                                <span className="inv-script my-2 block text-[0.6em] text-(--inv-primary)">
                                    {copy('and')}
                                </span>
                                <span className="foil-text block">{names.two}</span>
                            </>
                        )}
                    </h1>
                    {names.lifeSpan && (
                        <p className="inv-display mt-4 tracking-[0.2em] opacity-80">
                            {names.lifeSpan}
                        </p>
                    )}
                    {tier !== 'static' && (
                        <>
                            <canvas
                                ref={foilRef}
                                className="absolute inset-0 size-full cursor-grab touch-none"
                                aria-label={copy('scratchToReveal')}
                                role="img"
                            />
                            <canvas
                                ref={sparkRef}
                                className="pointer-events-none absolute inset-0 size-full"
                                aria-hidden
                            />
                            {!done && (
                                <p className="pointer-events-none absolute inset-x-0 bottom-8 text-[11px] tracking-[0.35em] text-[#3a2a08] uppercase">
                                    {copy('scratchToReveal')}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </OpeningShell>
    );
}
