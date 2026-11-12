import { useEffect, useRef, useState } from 'react';

import { loadGsap } from '../../motion/gsap';
import { useInvite } from '../context';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

const HOLD_MS = 900;
const BLOW_THRESHOLD = 0.16;

// Signature ritual: blow on the phone (mic loudness only, never recorded) or press-and-hold to light the diya.
export function DiyaOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy } = useInvite();
    const stage = useRef<HTMLDivElement>(null);
    const [heat, setHeat] = useState(0);
    const [lit, setLit] = useState(false);
    const [listening, setListening] = useState(false);
    const begun = useRef(false);
    const stopMic = useRef<() => void>(() => undefined);
    const holdTimer = useRef<number | undefined>(undefined);

    const begin = () => {
        if (begun.current) return;
        begun.current = true;
        onBegin();
    };

    const ignite = async () => {
        if (lit) return;
        setLit(true);
        stopMic.current();
        const root = stage.current;
        if (!root || tier === 'static') {
            onOpened();
            return;
        }
        const gsap = await loadGsap();
        gsap.timeline({ onComplete: onOpened })
            .to(
                root.querySelector('[data-flame]'),
                {
                    scale: 1.6,
                    duration: 0.5,
                    ease: 'back.out(3)',
                },
                0,
            )
            .to(
                root.querySelector('[data-aura]'),
                {
                    scale: 9,
                    opacity: 0.95,
                    duration: 1.6,
                    ease: 'power2.out',
                },
                0.2,
            )
            .to(
                root.parentElement ?? root,
                {
                    opacity: 0,
                    duration: 0.7,
                },
                1.5,
            );
    };

    const listen = async () => {
        begin();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                },
            });
            const ctx = new AudioContext();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            ctx.createMediaStreamSource(stream).connect(analyser);
            const buffer = new Float32Array(analyser.fftSize);
            let frame = 0;
            let sustained = 0;
            setListening(true);
            const tick = () => {
                analyser.getFloatTimeDomainData(buffer);
                const rms = Math.sqrt(buffer.reduce((sum, v) => sum + v * v, 0) / buffer.length);
                setHeat((h) => Math.min(1, Math.max(0, h * 0.92 + rms * 1.6)));
                sustained = rms > BLOW_THRESHOLD ? sustained + 1 : Math.max(0, sustained - 1);
                if (sustained > 14) {
                    void ignite();
                    return;
                }
                frame = requestAnimationFrame(tick);
            };
            stopMic.current = () => {
                cancelAnimationFrame(frame);
                stream.getTracks().forEach((track) => {
                    track.stop();
                });
                void ctx.close();
                setListening(false);
            };
            tick();
        } catch {
            setListening(false);
        }
    };

    useEffect(
        () => () => {
            stopMic.current();
            window.clearTimeout(holdTimer.current);
        },
        [],
    );

    const startHold = () => {
        begin();
        setHeat(0.6);
        holdTimer.current = window.setTimeout(() => void ignite(), HOLD_MS);
    };
    const endHold = () => {
        window.clearTimeout(holdTimer.current);
        if (!lit) setHeat(0);
    };

    const flameScale = lit ? 1.4 : 0.35 + heat * 0.9;

    return (
        <OpeningShell
            hidePrompt
            footer={
                <div className="absolute inset-x-0 bottom-[7svh] z-30 flex flex-col items-center gap-3 px-6 text-center">
                    <p className="text-sm tracking-[0.2em] uppercase">{copy('blowToLight')}</p>
                    <p className="text-xs opacity-70">{copy('orHold')}</p>
                    {!listening && !lit && (
                        <button
                            type="button"
                            onClick={() => void listen()}
                            className="mt-2 rounded-full border border-(--inv-gold) px-5 py-2 text-xs tracking-widest uppercase"
                        >
                            {copy('useMic')}
                        </button>
                    )}
                    <p className="max-w-xs text-[11px] opacity-60">{copy('micPrivacy')}</p>
                </div>
            }
        >
            <div ref={stage} className="absolute inset-0 flex items-center justify-center">
                <div
                    data-aura
                    className="absolute size-24 rounded-full opacity-30 blur-2xl"
                    style={{
                        background:
                            'radial-gradient(circle, #ffd27a, var(--inv-gold) 40%, transparent 70%)',
                    }}
                />
                <button
                    type="button"
                    aria-label={copy('orHold')}
                    onPointerDown={startHold}
                    onPointerUp={endHold}
                    onPointerLeave={endHold}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') void ignite();
                    }}
                    className="relative w-[min(48cqw,240px)] touch-none select-none"
                >
                    <svg viewBox="0 0 200 200" className="w-full overflow-visible" aria-hidden>
                        <g
                            data-flame
                            style={{
                                transformOrigin: '100px 96px',
                                transform: `scale(${flameScale})`,
                                transition: 'transform 120ms linear',
                            }}
                        >
                            <path
                                className="diya-flicker"
                                d="M100 30 C112 56 124 70 118 88 C114 100 106 104 100 104 C94 104 86 100 82 88 C76 70 88 56 100 30 Z"
                                fill="url(#flame)"
                            />
                            <path
                                d="M100 62 C106 76 110 84 107 92 C105 98 102 100 100 100 C98 100 95 98 93 92 C90 84 94 76 100 62 Z"
                                fill="#fff8e1"
                                opacity="0.9"
                            />
                        </g>
                        <defs>
                            <linearGradient id="flame" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0" stopColor="#ff7a00" />
                                <stop offset="0.6" stopColor="#ffc53d" />
                                <stop offset="1" stopColor="#fff2b3" />
                            </linearGradient>
                            <linearGradient id="clay" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="var(--inv-gold)" />
                                <stop
                                    offset="1"
                                    stopColor="color-mix(in oklab, var(--inv-primary) 70%, black)"
                                />
                            </linearGradient>
                        </defs>
                        <path
                            d="M100 104 v8"
                            stroke="#3a2a1a"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <path
                            d="M30 116 Q100 100 170 116 Q160 160 100 164 Q40 160 30 116 Z"
                            fill="url(#clay)"
                        />
                        <path
                            d="M30 116 Q100 132 170 116"
                            fill="none"
                            stroke="var(--inv-gold)"
                            strokeWidth="2"
                        />
                        <path
                            d="M60 140 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0"
                            fill="none"
                            stroke="var(--inv-gold)"
                            strokeWidth="1.5"
                            opacity="0.7"
                        />
                    </svg>
                </button>
            </div>
        </OpeningShell>
    );
}
