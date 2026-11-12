import { mixHex } from '@shared/materials';
import { useEffect, useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { fitCanvas, loop, rgba } from './canvas';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

interface Spark {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    // Set once the sparks are called to spell the initials.
    tx?: number;
    ty?: number;
}

interface Rocket {
    x: number;
    y: number;
    vy: number;
    burstAt: number;
    color: string;
}

// Pixel positions of the initials, sampled from an off-screen canvas in the invitation's display face.
function letterPoints(text: string, w: number, h: number, font: string, gap: number) {
    const off = document.createElement('canvas');
    off.width = Math.round(w);
    off.height = Math.round(h);
    const ctx = off.getContext('2d');
    if (!ctx) return [];
    // Measure at a reference size, then scale so the initials span at most 80% of the width.
    ctx.font = `600 100px ${font}`;
    const measured = Math.max(1, ctx.measureText(text).width);
    const size = Math.min((w * 0.8 * 100) / measured, h * 0.28);
    ctx.font = `600 ${String(size)}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(text, w / 2, h * 0.42);
    const data = ctx.getImageData(0, 0, off.width, off.height).data;
    const points: [number, number][] = [];
    for (let y = 0; y < off.height; y += gap)
        for (let x = 0; x < off.width; x += gap)
            if ((data[(y * off.width + x) * 4 + 3] ?? 0) > 128) points.push([x, y]);
    return points;
}

// Fireworks over a night sky; on tap a volley bursts and the sparks swarm into the initials.
export function FireworksOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, names, data, copy } = useInvite();
    const { palette } = data.invitation.design;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reveal = useRef<HTMLDivElement>(null);
    const mode = useRef<'idle' | 'volley' | 'spell' | 'fall'>('idle');
    const [busy, setBusy] = useState(false);
    const sky = mixHex(palette.bg, '#04030a', 0.85);
    const initials = names.initials.join(names.initials.length > 1 ? '&' : '');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || tier === 'static') return;
        const stage = fitCanvas(canvas);
        if (!stage) return;
        const { ctx, w, h } = stage;
        const colors = [palette.gold, palette.primary, palette.accent, '#ffffff'];
        const pick = () => colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff';
        const sparks: Spark[] = [];
        const rockets: Rocket[] = [];
        let nextLaunch = 0.3;
        let spelled = false;
        const font = getComputedStyle(canvas).getPropertyValue('--inv-display') || 'serif';

        const launch = (x = w * (0.2 + Math.random() * 0.6)) => {
            rockets.push({
                x,
                y: h,
                vy: -(h * (0.95 + Math.random() * 0.35)),
                burstAt: h * (0.18 + Math.random() * 0.3),
                color: pick(),
            });
        };
        const burst = (x: number, y: number, color: string, count: number) => {
            for (let i = 0; i < count; i++) {
                const a = Math.random() * Math.PI * 2;
                const v = 60 + Math.random() * 170;
                sparks.push({
                    x,
                    y,
                    vx: Math.cos(a) * v,
                    vy: Math.sin(a) * v,
                    life: 1,
                    color: Math.random() < 0.25 ? '#ffffff' : color,
                });
            }
        };
        const spell = () => {
            const targets = letterPoints(initials, w, h, font, tier === 'full' ? 5 : 8);
            // Recruit live sparks first, then top up from the centre.
            targets.forEach(([tx, ty], i) => {
                const s: Spark = sparks[i] ?? {
                    x: w / 2,
                    y: h * 0.42,
                    vx: 0,
                    vy: 0,
                    life: 1,
                    color: palette.gold,
                };
                s.tx = tx;
                s.ty = ty;
                s.life = 1;
                s.color = Math.random() < 0.8 ? palette.gold : '#fff6d6';
                if (!sparks[i]) sparks.push(s);
            });
        };

        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
        return loop((dt, t) => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = rgba(sky, mode.current === 'spell' ? 0.35 : 0.22);
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';

            if (mode.current === 'idle' && t > nextLaunch) {
                launch();
                nextLaunch = t + 1.1 + Math.random() * 0.9;
            }
            if (mode.current === 'volley' && t > nextLaunch) {
                launch();
                nextLaunch = t + 0.16;
            }
            if (mode.current === 'spell' && !spelled) {
                spelled = true;
                spell();
            }

            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets[i];
                if (!r) continue;
                r.y += r.vy * dt;
                r.vy += h * 0.5 * dt;
                ctx.fillStyle = rgba(r.color, 0.9);
                ctx.fillRect(r.x - 1, r.y, 2, 9);
                if (r.y <= r.burstAt || r.vy >= 0) {
                    burst(r.x, r.y, r.color, tier === 'full' ? 90 : 45);
                    rockets.splice(i, 1);
                }
            }
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                if (!s) continue;
                if (s.tx !== undefined && s.ty !== undefined && mode.current === 'spell') {
                    // Critically damped pull towards the letter pixel.
                    s.vx += ((s.tx - s.x) * 22 - s.vx * 7) * dt;
                    s.vy += ((s.ty - s.y) * 22 - s.vy * 7) * dt;
                } else {
                    s.vy += 110 * dt;
                    s.vx *= 0.985;
                    s.life -= dt * (mode.current === 'fall' ? 0.9 : 0.55);
                }
                s.x += s.vx * dt;
                s.y += s.vy * dt;
                if (s.life <= 0) {
                    sparks.splice(i, 1);
                    continue;
                }
                ctx.fillStyle = rgba(s.color, Math.min(1, s.life));
                ctx.beginPath();
                ctx.arc(s.x, s.y, mode.current === 'spell' ? 1.6 : 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
            return undefined;
        });
    }, [tier, palette.gold, palette.primary, palette.accent, sky, initials]);

    const open = async () => {
        if (busy) return;
        setBusy(true);
        onBegin();
        if (tier === 'static') {
            onOpened();
            return;
        }
        const gsap = await loadGsap();
        const shell = canvasRef.current?.closest('[data-opening]');
        mode.current = 'volley';
        gsap.timeline({ onComplete: onOpened })
            .call(
                () => {
                    mode.current = 'spell';
                },
                [],
                1.1,
            )
            .fromTo(
                reveal.current,
                {
                    opacity: 0,
                    y: 12,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                },
                2.2,
            )
            .call(
                () => {
                    mode.current = 'fall';
                },
                [],
                3.4,
            )
            .to(
                shell ?? [],
                {
                    opacity: 0,
                    duration: 0.8,
                },
                3.7,
            );
    };

    return (
        <OpeningShell onTap={() => void open()} busy={busy} hideTitle={busy}>
            <div className="absolute inset-0" style={{ background: sky }} />
            <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden />
            <div
                ref={reveal}
                className="pointer-events-none absolute inset-x-0 top-[58%] flex flex-col items-center px-8 text-center text-white opacity-0"
            >
                <h1 className="inv-display text-[clamp(1.8rem,8cqw,3.4rem)] leading-tight break-normal">
                    {names.title}
                </h1>
                <p className="mt-3 text-[10px] tracking-[0.5em] uppercase opacity-80">
                    {copy('saveTheDate')}
                </p>
            </div>
        </OpeningShell>
    );
}
