import { type CSSProperties, useState } from 'react';

import { useInvite } from '../context';
import { PromptPill, useFinish, usePull } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// The scene is laid out against the invitation's own screen (the phone, or a preview frame), never
// the browser window, so the cord and its bead always sit inside the frame.
const SCREEN = 'var(--inv-screen, 100svh)';
// The lamp drawing: 290 units tall (y -100 … 190), shown at 44% of the screen from 9% down.
const LAMP_TOP = 0.09;
const LAMP_H = 0.44;
const unit = `(${SCREEN} * ${String(LAMP_H)} / 290)`;
// Where the cord leaves the shade's rim, in drawing units, and its resting length.
const RIM_X = 38;
const RIM_Y = 250;
const CORD = `${SCREEN} * 0.15`;
const PULL = 110;

// A dark room and one brass pendant lamp: the guest pulls its cord. The filament warms as the cord
// stretches; past the click the bulb flickers on, warm light floods out and the names appear in it.
export function LightPullOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy } = useInvite();
    const [phase, setPhase] = useState<'dark' | 'click' | 'lit' | 'leaving'>('dark');
    const finish = useFinish(onOpened);
    const { pull, dragging, handlers } = usePull({
        max: PULL,
        onStart: onBegin,
        disabled: phase !== 'dark',
        onPass: () => {
            if ('vibrate' in navigator) navigator.vibrate(18);
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
    // The cord springs back once it clicks; while dragging it follows the finger.
    const stretch = phase === 'dark' ? pull : 0;
    const warmth = phase === 'dark' ? Math.min(1, pull / PULL) : 0;
    const idle = phase === 'dark' && !dragging && pull === 0;

    const lamp: CSSProperties = {
        top: `calc(${SCREEN} * ${String(LAMP_TOP)})`,
        height: `calc(${SCREEN} * ${String(LAMP_H)})`,
    };
    // Cord and bead hang together from the rim, so they swing as one.
    const hanger: CSSProperties = {
        left: `calc(50% + ${String(RIM_X)} * ${unit})`,
        top: `calc(${SCREEN} * ${String(LAMP_TOP)} + ${String(RIM_Y)} * ${unit})`,
    };
    const cord: CSSProperties = { height: `calc(${CORD} + ${String(stretch)}px)` };
    const bead: CSSProperties = { top: `calc(${CORD} + ${String(stretch)}px - 4px)` };
    const glow: CSSProperties = {
        top: `calc(${SCREEN} * ${String(LAMP_TOP)} + 266 * ${unit})`,
        background:
            'radial-gradient(circle, #fff3d0 0%, color-mix(in oklab, var(--inv-gold) 70%, #ffdca0) 18%, color-mix(in oklab, var(--inv-bg) 85%, transparent) 46%, transparent 72%)',
        transform: `translateY(-50%) scale(${lit ? 9 : 0.2 + warmth * 0.5})`,
        opacity: lit ? 1 : warmth * 0.45,
    };

    return (
        <OpeningShell hidePrompt hideTitle={!lit}>
            <div
                className={`absolute inset-0 transition-opacity duration-700 ${phase === 'leaving' ? 'opacity-0' : 'opacity-100'}`}
                style={{ background: '#07050a' }}
            >
                {/* Warm light pooling out of the bulb: a glimmer while pulling, a flood once lit. */}
                <div
                    aria-hidden
                    className={`absolute inset-x-0 mx-auto size-[calc(var(--inv-screen,100svh)*0.3)] rounded-full ${dragging ? '' : 'transition-[transform,opacity] duration-[1600ms] ease-out'}`}
                    style={glow}
                />
                <svg
                    viewBox="0 -100 200 290"
                    className="absolute inset-x-0 mx-auto overflow-visible"
                    style={lamp}
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
                        <linearGradient id="lp-shadeIn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#2a1d0a" />
                            <stop offset="1" stopColor="#5a3d10" />
                        </linearGradient>
                    </defs>
                    {/* Flex to the ceiling, the brass cap and shade with its lit rim, the bulb. */}
                    <path d="M100 -100 V96" stroke="#3a2c1c" strokeWidth="2" />
                    <path d="M92 96 h16 v10 h-16 z" fill="url(#lp-brass)" />
                    <path
                        d="M100 104 C70 104 52 128 46 150 L154 150 C148 128 130 104 100 104 Z"
                        fill="url(#lp-brass)"
                    />
                    <ellipse cx="100" cy="150" rx="54" ry="5" fill="url(#lp-shadeIn)" />
                    <path d="M46 150 L154 150" stroke="#f3d68a" strokeWidth="1.6" />
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
                    {/* The filament warms as the cord stretches. */}
                    <path
                        d="M94 168 q3 -8 6 0 q3 8 6 0"
                        fill="none"
                        stroke="#ffb547"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        opacity={phase === 'dark' ? warmth : 0}
                    />
                </svg>
                {/* The cord and its brass bead: one hanging piece that stretches with the finger. */}
                <div
                    className={`absolute z-40 w-0 origin-top ${idle ? 'animate-[lp-sway_3.2s_ease-in-out_infinite_alternate] motion-reduce:animate-none' : ''}`}
                    style={hanger}
                >
                    <div
                        className={`absolute start-[-0.7px] top-0 w-[1.4px] bg-[#c9a464] ${dragging ? '' : 'transition-[height] duration-300 ease-out'} ${phase === 'dark' ? '' : 'opacity-0 transition-opacity'}`}
                        style={cord}
                    />
                    <button
                        type="button"
                        aria-label={copy('pullTheLight')}
                        {...handlers}
                        disabled={phase !== 'dark'}
                        className={`absolute start-0 flex size-16 -translate-x-1/2 touch-none items-start justify-center rtl:translate-x-1/2 ${dragging ? '' : 'transition-[top] duration-300 ease-out'} ${phase === 'dark' ? 'cursor-grab active:cursor-grabbing' : 'opacity-0'}`}
                        style={bead}
                    >
                        <span className="mt-1 block h-7 w-3.5 rounded-full bg-[linear-gradient(90deg,#6b4a14,#e9c46a,#6b4a14)] shadow-[0_0_14px_rgba(233,196,106,0.4)]" />
                    </button>
                </div>
            </div>
            <PromptPill hidden={phase !== 'dark'}>{copy('pullTheLight')}</PromptPill>
        </OpeningShell>
    );
}
