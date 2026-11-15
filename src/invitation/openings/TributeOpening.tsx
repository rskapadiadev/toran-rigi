import { rng } from '@shared/generative';
import { peopleOf } from '@shared/people';
import { useEffect, useRef, useState } from 'react';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { useInvite } from '../context';
import { PromptPill, useFinish } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// Offerings before the lamp is lit.
const OFFERINGS = 3;
const BLOW_THRESHOLD = 0.14;

type Flower = 'marigold' | 'rose' | 'jasmine' | 'whiteRose' | 'lily';

interface Petal {
    id: number;
    flower: Flower;
    // Where it comes to rest (px, relative to the stage) and where it was thrown from.
    x: number;
    y: number;
    fromX: number;
    fromY: number;
    turn: number;
    size: number;
    delay: number;
}

// The flowers and the lamp each tradition offers.
function ritual(culture: string): { flowers: Flower[];
lamp: 'diya' | 'candle' | 'none' } {
    const base = culture.split('.')[0];
    if (base === 'hindu' || base === 'jain' || base === 'sikh')
        return {
            flowers: ['marigold', 'marigold', 'rose', 'jasmine'],
            lamp: 'diya',
        };
    if (base === 'islamic')
        return {
            flowers: ['rose', 'jasmine', 'jasmine'],
            lamp: 'none',
        };
    return {
        flowers: ['whiteRose', 'whiteRose', 'lily', 'jasmine'],
        lamp: 'candle',
    };
}

function PetalShape({ flower, size }: { flower: Flower;
size: number }) {
    switch (flower) {
        case 'marigold':
            return (
                <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden>
                    <path
                        d="M10 1 C14 3 17 6 18 10 C17 14 14 17 10 19 C6 17 3 14 2 10 C3 6 6 3 10 1 Z"
                        fill="#f29a1b"
                    />
                    <path
                        d="M10 4 C13 6 15 8 15 10 C15 13 13 15 10 16 C7 15 5 13 5 10 C5 8 7 6 10 4 Z"
                        fill="#ffb52e"
                    />
                </svg>
            );
        case 'rose':
            return (
                <svg viewBox="0 0 20 24" width={size} height={size * 1.2} aria-hidden>
                    <path
                        d="M10 1 C17 6 19 14 15 20 C13 23 7 23 5 20 C1 14 3 6 10 1 Z"
                        fill="#b8243a"
                    />
                    <path
                        d="M10 4 C14 8 15 13 13 17"
                        stroke="#e0566a"
                        strokeWidth="1"
                        fill="none"
                    />
                </svg>
            );
        case 'whiteRose':
            return (
                <svg viewBox="0 0 20 24" width={size} height={size * 1.2} aria-hidden>
                    <path
                        d="M10 1 C17 6 19 14 15 20 C13 23 7 23 5 20 C1 14 3 6 10 1 Z"
                        fill="#fbf6ee"
                    />
                    <path
                        d="M10 4 C14 8 15 13 13 17"
                        stroke="#e6dccb"
                        strokeWidth="1"
                        fill="none"
                    />
                </svg>
            );
        case 'lily':
            return (
                <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
                    <path d="M12 2 C15 8 15 12 12 22 C9 12 9 8 12 2 Z" fill="#fffaf2" />
                    <path d="M12 12 L13 4" stroke="#e8c97a" strokeWidth="0.8" />
                </svg>
            );
        case 'jasmine':
            return (
                <svg viewBox="0 0 20 20" width={size * 0.8} height={size * 0.8} aria-hidden>
                    {[0, 72, 144, 216, 288].map((a) => (
                        <ellipse
                            key={a}
                            cx="10"
                            cy="5.5"
                            rx="2.6"
                            ry="4.5"
                            fill="#fffdf6"
                            transform={`rotate(${String(a)} 10 10)`}
                        />
                    ))}
                    <circle cx="10" cy="10" r="1.8" fill="#f2d66b" />
                </svg>
            );
    }
}

// One petal, thrown in an arc from the guest's hand and coming to rest on the tribute.
function Flying({ petal }: { petal: Petal }) {
    const el = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const node = el.current;
        if (!node) return;
        const dx = petal.fromX - petal.x;
        const dy = petal.fromY - petal.y;
        const animation = node.animate(
            [
                {
                    transform: `translate(${String(dx)}px, ${String(dy)}px) rotate(0deg)`,
                    opacity: 0,
                },
                {
                    transform: `translate(${String(dx * 0.45)}px, ${String(dy * 0.45 - 90)}px) rotate(${String(petal.turn * 0.6)}deg)`,
                    opacity: 1,
                    offset: 0.45,
                },
                {
                    transform: `translate(0px, 0px) rotate(${String(petal.turn)}deg)`,
                    opacity: 1,
                },
            ],
            {
                duration: 1500,
                delay: petal.delay,
                easing: 'cubic-bezier(0.3, 0.1, 0.3, 1)',
                fill: 'both',
            },
        );
        return () => {
            animation.cancel();
        };
    }, [petal]);
    return (
        <span
            ref={el}
            aria-hidden
            className="pointer-events-none absolute z-20 -translate-1/2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
            style={{
                left: petal.x,
                top: petal.y,
            }}
        >
            <PetalShape flower={petal.flower} size={petal.size} />
        </span>
    );
}

// A floral tribute for remembrance: guests tap (or blow) to offer flowers onto the photo; after
// three offerings the lamp is lit, incense rises, and the notice opens. No garland: not every
// tradition places one.
export function TributeOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy, names, data } = useInvite();
    const { design, seed, culture, content } = data.invitation;
    const photo = peopleOf(content).one.photoKey;
    const { flowers, lamp } = ritual(culture);
    const stage = useRef<HTMLDivElement>(null);
    const frame = useRef<HTMLDivElement>(null);
    const [petals, setPetals] = useState<Petal[]>([]);
    const [offerings, setOfferings] = useState(0);
    const [listening, setListening] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const finish = useFinish(onOpened);
    const begun = useRef(false);
    const nextId = useRef(0);
    const random = useRef(rng(seed + 404));
    const stopMic = useRef<() => void>(() => undefined);
    const done = offerings >= OFFERINGS;

    const begin = () => {
        if (begun.current) return;
        begun.current = true;
        onBegin();
    };

    // A handful of petals from (x, y) onto the tribute: most settle in a heap at the frame's foot,
    // a few catch on the frame itself.
    const offer = (fromX: number, fromY: number) => {
        begin();
        if (tier === 'static') {
            onOpened();
            return;
        }
        const s = stage.current?.getBoundingClientRect();
        const f = frame.current?.getBoundingClientRect();
        if (!s || !f || done) return;
        const r = random.current;
        const burst: Petal[] = Array.from({ length: 9 }, (_, k) => {
            const onFrame = k < 2;
            const spread = f.width * 0.62;
            return {
                id: nextId.current++,
                flower: r.pick(flowers),
                x: f.left - s.left + f.width / 2 + r.range(-spread / 2, spread / 2),
                y: onFrame
                    ? f.top - s.top + r.range(f.height * 0.15, f.height * 0.9)
                    : f.bottom - s.top + r.range(-6, 22),
                fromX: fromX - s.left + r.range(-18, 18),
                fromY: fromY - s.top + r.range(-10, 10),
                turn: r.range(-200, 200),
                size: r.range(14, 22),
                delay: k * 55,
            };
        });
        setPetals((list) => [...list, ...burst]);
        setOfferings((n) => n + 1);
    };

    useEffect(() => {
        if (!done) return;
        stopMic.current();
        const t = setTimeout(() => {
            setLeaving(true);
        }, 3200);
        finish(4400);
        return () => {
            clearTimeout(t);
        };
    }, [done, finish]);

    // Blow into the phone (loudness only, never recorded): each sustained breath is one offering.
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
            let frameId = 0;
            let sustained = 0;
            let cooldown = 0;
            setListening(true);
            const tick = () => {
                analyser.getFloatTimeDomainData(buffer);
                const rms = Math.sqrt(buffer.reduce((sum, v) => sum + v * v, 0) / buffer.length);
                sustained = rms > BLOW_THRESHOLD ? sustained + 1 : Math.max(0, sustained - 1);
                cooldown = Math.max(0, cooldown - 1);
                if (sustained > 10 && cooldown === 0) {
                    const s = stage.current?.getBoundingClientRect();
                    if (s) offer(s.left + s.width / 2, s.bottom - 20);
                    sustained = 0;
                    cooldown = 40;
                }
                frameId = requestAnimationFrame(tick);
            };
            stopMic.current = () => {
                cancelAnimationFrame(frameId);
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
        },
        [],
    );

    return (
        <OpeningShell hideTitle hidePrompt>
            <div
                ref={stage}
                className={`absolute inset-0 transition-opacity duration-[1200ms] ${leaving ? 'opacity-0' : ''}`}
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 38%, color-mix(in oklab, var(--inv-bg) 30%, #2a2622), #0d0c0b 75%)',
                }}
                // Tapping anywhere offers flowers from that spot.
                onPointerDown={(e) => {
                    if ((e.target as HTMLElement).closest('[data-mic]')) return;
                    offer(e.clientX, e.clientY);
                }}
            >
                {/* A soft light falls on the frame. */}
                <div
                    aria-hidden
                    className="absolute inset-x-0 top-[12svh] mx-auto h-[56svh] w-[80cqw] rounded-full opacity-60 blur-2xl"
                    style={{
                        background:
                            'radial-gradient(ellipse, rgba(255,236,200,0.35), transparent 70%)',
                    }}
                />
                {/* The frame: photo if there is one, otherwise the name in quiet type. */}
                <div
                    ref={frame}
                    className="absolute inset-x-0 top-[16svh] mx-auto aspect-square w-[min(62cqw,270px)] rounded-[6px] border-[6px] border-[#c9a45a] bg-[#1b1714] p-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7),inset_0_0_0_2px_#7a5a24]"
                >
                    <div className="relative flex size-full flex-col items-center justify-center overflow-hidden rounded-[3px] bg-[#2a2420] text-center">
                        {photo ? (
                            <img
                                src={`/media/${photo}`}
                                alt={names.one}
                                className="absolute inset-0 size-full object-cover grayscale-[0.25] sepia-[0.15]"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-[10%] opacity-25">
                                    <GenerativeOrnament
                                        kind={design.generative.kind}
                                        seed={seed}
                                        draw={false}
                                        className="size-full"
                                    />
                                </div>
                                {names.honorific && (
                                    <p className="relative text-xs tracking-[0.3em] text-[#e6d3a8] uppercase">
                                        {names.honorific}
                                    </p>
                                )}
                                <p className="inv-display relative px-4 text-[clamp(1.3rem,6cqw,2rem)] leading-tight text-[#f3e6c8]">
                                    {names.one}
                                </p>
                                {names.lifeSpan && (
                                    <p className="relative mt-2 text-xs tracking-[0.25em] text-[#cdb98f]">
                                        {names.lifeSpan}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
                {/* Lamp and incense at the foot of the tribute. */}
                <div
                    aria-hidden
                    className="absolute inset-x-0 top-[calc(16svh+min(62cqw,270px)+30px)] mx-auto flex w-fit items-end gap-10"
                >
                    {lamp !== 'none' && (
                        <svg viewBox="0 0 60 70" className="w-12 overflow-visible">
                            {done && (
                                <>
                                    <circle
                                        cx="30"
                                        cy={lamp === 'diya' ? 34 : 18}
                                        r="20"
                                        fill="rgba(255,214,120,0.35)"
                                        className="animate-pulse"
                                    />
                                    <path
                                        d={
                                            lamp === 'diya'
                                                ? 'M30 22 C36 30 35 38 30 42 C25 38 24 30 30 22 Z'
                                                : 'M30 4 C35 11 34 17 30 20 C26 17 25 11 30 4 Z'
                                        }
                                        fill="#ffd36b"
                                        className="origin-bottom animate-[flame-sway_1.6s_ease-in-out_infinite_alternate]"
                                    />
                                </>
                            )}
                            {lamp === 'diya' ? (
                                <path
                                    d="M6 44 L54 44 Q50 62 30 64 Q10 62 6 44 Z"
                                    fill="#b8792e"
                                    stroke="#e0a85a"
                                    strokeWidth="1.2"
                                />
                            ) : (
                                <rect
                                    x="23"
                                    y="20"
                                    width="14"
                                    height="44"
                                    rx="2"
                                    fill="#f6efe2"
                                    stroke="#d8ccb6"
                                />
                            )}
                        </svg>
                    )}
                    <svg viewBox="0 0 30 80" className="w-6 overflow-visible">
                        {done &&
                            [0, 1, 2].map((k) => (
                                <path
                                    key={k}
                                    d="M15 6 C9 -6 21 -16 14 -30 C8 -42 20 -50 15 -64"
                                    fill="none"
                                    stroke="rgba(230,226,220,0.35)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="animate-[smoke-rise_4s_ease-out_infinite]"
                                    style={{ animationDelay: `${String(k * 1.3)}s` }}
                                />
                            ))}
                        <path d="M15 6 L15 78" stroke="#5a3a22" strokeWidth="1.6" />
                        <circle cx="15" cy="6" r="1.8" fill={done ? '#ff7a3a' : '#5a3a22'} />
                        <path d="M10 78 H20" stroke="#8a6a3a" strokeWidth="3" />
                    </svg>
                </div>
                {petals.map((petal) => (
                    <Flying key={petal.id} petal={petal} />
                ))}
                {/* A quiet line once the tribute is offered. */}
                <p
                    className={`inv-display absolute inset-x-0 bottom-[16svh] text-center text-lg text-[#efe2c4] transition-opacity duration-[1600ms] ${done ? 'opacity-100' : 'opacity-0'}`}
                >
                    {copy('tributeOffered')}
                </p>
            </div>
            {!done && (
                <div className="absolute inset-x-0 bottom-[3svh] z-40 flex flex-col items-center gap-2">
                    {!listening && (
                        <button
                            type="button"
                            data-mic
                            onClick={() => void listen()}
                            className="rounded-full border border-[#c9a45a]/60 px-4 py-1.5 text-[10px] tracking-[0.3em] text-[#e6d3a8] uppercase"
                        >
                            {copy('blowFlowers')}
                        </button>
                    )}
                    {listening && (
                        <p className="text-[10px] text-[#cdb98f]">{copy('micPrivacy')}</p>
                    )}
                </div>
            )}
            <PromptPill
                hidden={done}
            >{`${copy('offerFlowers')} · ${String(offerings)}/${String(OFFERINGS)}`}</PromptPill>
        </OpeningShell>
    );
}
