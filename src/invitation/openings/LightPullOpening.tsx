import { useState } from 'react';

import { useInvite } from '../context';
import { PromptPill, useFinish, usePull } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

const CORD = 150;

// A dark room and one brass pendant lamp: the guest pulls its cord — click — the bulb flickers on,
// warm light floods out and the names appear in it.
export function LightPullOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy } = useInvite();
    const [phase, setPhase] = useState<'dark' | 'click' | 'lit' | 'leaving'>('dark');
    const finish = useFinish(onOpened);
    const { pull, dragging, handlers } = usePull({
        max: 110,
        onStart: onBegin,
        disabled: phase !== 'dark',
        onPass: () => {
            if (tier === 'static') {
                onOpened();
                return;
            }
            setPhase('click');
            // The flicker runs ~0.8s, then the room fills with light, then the invitation.
            setTimeout(() => {
                setPhase('lit');
            }, 800);
            setTimeout(() => {
                setPhase('leaving');
            }, 3000);
            finish(3700);
        },
    });
    const lit = phase === 'lit' || phase === 'leaving';
    // The cord snaps back when it clicks; while dragging it follows the finger.
    const stretch = phase === 'dark' ? pull : 0;

    return (
        <OpeningShell hidePrompt hideTitle={!lit}>
            <div
                className={`absolute inset-0 transition-opacity duration-700 ${phase === 'leaving' ? 'opacity-0' : 'opacity-100'}`}
                style={{ background: '#07050a' }}
            >
                {/* Warm light pooling out of the bulb. */}
                <div
                    aria-hidden
                    className="absolute inset-x-0 top-[34svh] mx-auto size-[30svh] rounded-full transition-[transform,opacity] duration-[1600ms] ease-out"
                    style={{
                        background:
                            'radial-gradient(circle, #fff3d0 0%, color-mix(in oklab, var(--inv-gold) 70%, #ffdca0) 18%, color-mix(in oklab, var(--inv-bg) 85%, transparent) 46%, transparent 72%)',
                        transform: `translateY(-50%) scale(${lit ? 9 : 0.2})`,
                        opacity: lit ? 1 : 0,
                    }}
                />
                <svg
                    viewBox="0 0 200 420"
                    className="absolute inset-x-0 top-[12svh] mx-auto h-[62svh] overflow-visible"
                    aria-hidden
                >
                    <defs>
                        <linearGradient id="lp-brass" x1="0" x2="1">
                            <stop offset="0" stopColor="#6b4a14" />
                            <stop offset="0.45" stopColor="#e9c46a" />
                            <stop offset="0.6" stopColor="#b88a2e" />
                            <stop offset="1" stopColor="#5a3d10" />
                        </linearGradient>
                        <radialGradient id="lp-bulb">
                            <stop offset="0" stopColor="#fffbe8" />
                            <stop offset="0.6" stopColor="#ffe6a3" />
                            <stop offset="1" stopColor="#e0a640" />
                        </radialGradient>
                    </defs>
                    {/* Flex to the ceiling, the brass shade, the bulb. */}
                    <path d="M100 -90 V96" stroke="#3a2c1c" strokeWidth="2" />
                    <path d="M92 96 h16 v10 h-16 z" fill="url(#lp-brass)" />
                    <path
                        d="M100 104 C70 104 52 128 46 150 L154 150 C148 128 130 104 100 104 Z"
                        fill="url(#lp-brass)"
                    />
                    <path d="M46 150 L154 150" stroke="#f3d68a" strokeWidth="2" />
                    <circle
                        cx="100"
                        cy="166"
                        r="15"
                        fill={phase === 'dark' ? '#2a2420' : 'url(#lp-bulb)'}
                        className={
                            phase === 'click' ? 'animate-[bulb-flicker_0.8s_steps(1)_both]' : ''
                        }
                        style={lit ? { filter: 'drop-shadow(0 0 18px #ffe3a0)' } : undefined}
                    />
                    {/* The pull cord: hangs from the shade's rim, stretches with the finger. */}
                    <line
                        x1="138"
                        y1="150"
                        x2="138"
                        y2={150 + CORD + stretch}
                        stroke="#c9a464"
                        strokeWidth="1.4"
                        className={dragging ? '' : 'transition-[y2] duration-300 ease-out'}
                    />
                </svg>
            </div>
            {/* The bead is the handle: a real element, so it can be dragged, tapped or focused. */}
            <button
                type="button"
                aria-label={copy('pullTheLight')}
                {...handlers}
                disabled={phase !== 'dark'}
                className={`absolute z-40 flex size-16 touch-none items-center justify-center ${dragging ? '' : 'transition-transform duration-300 ease-out'} ${phase === 'dark' ? 'cursor-grab active:cursor-grabbing' : 'opacity-0'}`}
                style={{
                    // 62svh tall svg of 420 units: the cord ends at (150 + CORD) / 420 of it.
                    top: `calc(12svh + 62svh * ${String((150 + CORD) / 420)} - 6px)`,
                    left: `calc(50% + 62svh * ${String(38 / 420)})`,
                    transform: `translate(-50%, ${String(stretch)}px)`,
                }}
            >
                <span className="block h-7 w-3.5 rounded-full bg-[linear-gradient(90deg,#6b4a14,#e9c46a,#6b4a14)] shadow-[0_0_14px_rgba(233,196,106,0.35)]" />
            </button>
            <PromptPill hidden={phase !== 'dark'}>{copy('pullTheLight')}</PromptPill>
        </OpeningShell>
    );
}
