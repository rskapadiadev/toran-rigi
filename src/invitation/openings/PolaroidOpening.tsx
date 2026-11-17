import { type PointerEvent, useEffect, useRef, useState } from 'react';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { useInvite } from '../context';
import { PromptPill, useFinish } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// How much rubbing (px of finger travel) develops the photo fully.
const RUB = 1400;

// A blank instant photo: rub it and it develops into the couple's names in warm sepia,
// then the photo grows to fill the screen and becomes the invitation.
interface Point {
    x: number;
    y: number;
}

export function PolaroidOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy, names, data } = useInvite();
    const { design, seed } = data.invitation;
    const [developed, setDeveloped] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const finish = useFinish(onOpened);
    const last = useRef<Point | null>(null);
    const begun = useRef(false);
    const auto = useRef<number | undefined>(undefined);
    const done = developed >= 1;

    const start = () => {
        if (begun.current) return;
        begun.current = true;
        onBegin();
    };

    // Enter/Space (and still devices) develop it on its own over a couple of seconds.
    const develop = () => {
        start();
        if (tier === 'static') {
            onOpened();
            return;
        }
        if (auto.current !== undefined) return;
        const from = performance.now();
        const base = developed;
        const step = (now: number) => {
            const value = Math.min(1, base + (now - from) / 2400);
            setDeveloped(value);
            if (value < 1) auto.current = requestAnimationFrame(step);
        };
        auto.current = requestAnimationFrame(step);
    };

    useEffect(
        () => () => {
            cancelAnimationFrame(auto.current ?? 0);
        },
        [],
    );
    useEffect(() => {
        if (!done) return;
        const t = setTimeout(() => {
            setLeaving(true);
        }, 900);
        finish(2200);
        return () => {
            clearTimeout(t);
        };
    }, [done, finish]);

    const rub = {
        onPointerDown: (e: PointerEvent<HTMLElement>) => {
            start();
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = {
                x: e.clientX,
                y: e.clientY,
            };
        },
        onPointerMove: (e: PointerEvent<HTMLElement>) => {
            const prev = last.current;
            if (!prev || done) return;
            const travel = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
            last.current = {
                x: e.clientX,
                y: e.clientY,
            };
            setDeveloped((d) => Math.min(1, d + travel / RUB));
        },
        onPointerUp: () => {
            last.current = null;
            if (developed > 0) return;
            // A tap: still devices develop it outright; elsewhere the photo glimmers, a hint to rub.
            if (tier === 'static') {
                develop();
                return;
            }
            setDeveloped(0.12);
            window.setTimeout(() => {
                setDeveloped((d) => (d === 0.12 ? 0 : d));
            }, 420);
        },
    };

    // Developing: from near-black brown, through murky, to warm sepia.
    const d = developed;
    const image = `brightness(${String(0.15 + d * 0.95)}) contrast(${String(0.6 + d * 0.5)}) sepia(${String(1 - d * 0.35)}) saturate(${String(0.4 + d * 0.8)})`;

    return (
        <OpeningShell hidePrompt hideTitle>
            <div
                className={`absolute inset-0 transition-opacity duration-700 ${leaving ? 'opacity-0 delay-500' : ''}`}
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 40%, color-mix(in oklab, var(--inv-bg) 85%, white), color-mix(in oklab, var(--inv-bg) 70%, black))',
                }}
            />
            <div
                role="button"
                tabIndex={0}
                aria-label={copy('developPhoto')}
                {...rub}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        develop();
                    }
                }}
                className={`absolute top-1/2 z-30 w-[min(72cqw,340px)] touch-none rounded-[4px] bg-[#fbfaf6] p-[5%] pb-[22%] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.55)] transition-[transform,opacity] duration-[1300ms] ease-[cubic-bezier(0.6,0,0.2,1)] ${done ? '' : 'cursor-grab'}`}
                style={{
                    left: '50%',
                    transform: leaving
                        ? 'translate(-50%, -50%) rotate(0deg) scale(3.2)'
                        : 'translate(-50%, -50%) rotate(-4deg)',
                    opacity: leaving ? 0 : 1,
                }}
            >
                <div
                    className="relative flex aspect-square flex-col items-center justify-center overflow-hidden"
                    style={{
                        background:
                            'radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--inv-gold) 45%, #f3e3c4), color-mix(in oklab, var(--inv-primary) 45%, #3a2414))',
                        filter: image,
                    }}
                >
                    <div className="absolute inset-[12%] opacity-50">
                        <GenerativeOrnament
                            kind={design.generative.kind}
                            seed={seed}
                            draw={false}
                            className="size-full"
                        />
                    </div>
                    <p className="inv-display relative text-[clamp(1.4rem,7cqw,2.4rem)] leading-tight text-[#2a1708]">
                        {names.one}
                    </p>
                    {names.two && (
                        <>
                            <p className="inv-script relative text-xl text-[#5a3414]">&amp;</p>
                            <p className="inv-display relative text-[clamp(1.4rem,7cqw,2.4rem)] leading-tight text-[#2a1708]">
                                {names.two}
                            </p>
                        </>
                    )}
                    {/* The developing film's sheen fades as the image comes up. */}
                    <div
                        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_40%,rgba(0,0,0,0.25))]"
                        style={{ opacity: 1 - d * 0.7 }}
                    />
                </div>
                <p className="inv-script absolute inset-x-0 bottom-[6%] text-center text-lg text-[#3a2a1a]/80">
                    {names.title}
                </p>
            </div>
            <PromptPill hidden={developed > 0.05}>{copy('developPhoto')}</PromptPill>
        </OpeningShell>
    );
}
