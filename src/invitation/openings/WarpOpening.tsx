import { mixHex } from '@shared/materials';
import { useEffect, useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { fitCanvas, loop, rgba } from './canvas';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

interface Star {
    x: number;
    y: number;
    z: number;
    pz: number;
    tint: string;
}

const NEAR = 0.02;

// Hyperspace: a calm 3D starfield that lunges into streaks, flashes white, and drops the names in.
export function WarpOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, names, data, copy } = useInvite();
    const { palette } = data.invitation.design;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const flash = useRef<HTMLDivElement>(null);
    const reveal = useRef<HTMLDivElement>(null);
    const speed = useRef(0.06);
    const [busy, setBusy] = useState(false);
    const deep = mixHex(palette.bg, '#03050c', 0.82);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || tier === 'static') return;
        const stage = fitCanvas(canvas);
        if (!stage) return;
        const { ctx, w, h } = stage;
        const count = tier === 'full' ? 720 : 260;
        const tints = ['#ffffff', '#ffffff', palette.gold, palette.accent];
        const spawn = (z = Math.random()): Star => ({
            x: (Math.random() * 2 - 1) * 1.2,
            y: (Math.random() * 2 - 1) * 1.2,
            z: Math.max(NEAR, z),
            pz: Math.max(NEAR, z),
            tint: tints[Math.floor(Math.random() * tints.length)] ?? '#ffffff',
        });
        const stars = Array.from({ length: count }, () => spawn());
        const f = Math.max(w, h) * 0.5;
        ctx.fillStyle = deep;
        ctx.fillRect(0, 0, w, h);
        return loop((dt) => {
            const v = speed.current;
            // Long exposure while warping: the previous frame lingers as streaks.
            ctx.fillStyle = v > 0.5 ? rgba(deep, 0.28) : deep;
            ctx.fillRect(0, 0, w, h);
            for (const s of stars) {
                s.pz = s.z;
                s.z -= v * dt;
                if (s.z <= NEAR) {
                    Object.assign(s, spawn(1));
                    continue;
                }
                const x = w / 2 + (s.x / s.z) * f;
                const y = h / 2 + (s.y / s.z) * f;
                const px = w / 2 + (s.x / s.pz) * f;
                const py = h / 2 + (s.y / s.pz) * f;
                const size = Math.min(3.2, (1 - s.z) * 2.8 + 0.7);
                ctx.strokeStyle = rgba(s.tint, Math.min(1, 1.3 - s.z * 0.85));
                ctx.lineWidth = size;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(x + 0.01, y + 0.01);
                ctx.stroke();
            }
            return undefined;
        });
    }, [tier, palette.gold, palette.accent, deep]);

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
        gsap.timeline({ onComplete: onOpened })
            .to(speed, {
                current: 2.6,
                duration: 1.3,
                ease: 'power3.in',
            })
            .to(
                flash.current,
                {
                    opacity: 1,
                    duration: 0.25,
                    ease: 'power2.in',
                },
                1.2,
            )
            .set(speed, { current: 0.04 }, 1.45)
            .to(flash.current, {
                opacity: 0,
                duration: 0.9,
                ease: 'power2.out',
            })
            .fromTo(
                reveal.current,
                {
                    opacity: 0,
                    scale: 1.6,
                    filter: 'blur(14px)',
                },
                {
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1.1,
                    ease: 'expo.out',
                },
                1.5,
            )
            .to(
                shell ?? [],
                {
                    opacity: 0,
                    duration: 0.7,
                },
                3.3,
            );
    };

    return (
        <OpeningShell onTap={() => void open()} busy={busy} hideTitle={busy}>
            <div className="absolute inset-0" style={{ background: deep }} />
            <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden />
            <div
                ref={flash}
                className="pointer-events-none absolute inset-0 bg-white opacity-0"
                aria-hidden
            />
            <div
                ref={reveal}
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-white opacity-0"
            >
                <p className="text-[10px] tracking-[0.5em] uppercase opacity-80">
                    {copy('saveTheDate')}
                </p>
                <h1 className="inv-display mt-5 text-[clamp(2.4rem,11cqw,4.6rem)] leading-none break-normal">
                    {names.title}
                </h1>
            </div>
        </OpeningShell>
    );
}
