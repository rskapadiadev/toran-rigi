// "Light the jyot": a jagran's darbar before it begins. Chunri curtains hang closed under a marigold
// toran and a brass akhand jyot waits at their foot, unlit. A tap lights it: the flame catches, a row
// of diyas along the stage lights from the middle outwards, the glow swells and the curtains part
// onto the invitation. On the static tier the jyot lights and the invitation simply fades in.
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import { loadGsap } from '../../../motion/gsap';
import { useInvite } from '../../context';
import { useFinish } from '../../openings/gesture';
import type { OpeningProps } from '../../openings/types';
import { chunri, DiyaRow, MarigoldToran } from '../darbar/art';
import { DiyaLamp } from '../typography/DiyaGarland';
import { HandoffVeil, StageTitle } from './stage';

interface Parts {
    left: HTMLDivElement | null;
    right: HTMLDivElement | null;
    aura: HTMLDivElement | null;
    jyot: HTMLButtonElement | null;
    title: HTMLDivElement | null;
    veil: HTMLDivElement | null;
}

const VELVET = 'radial-gradient(90% 60% at 50% 78%, #5a1420 0%, #2a0810 55%, #12040a 100%)';
const stageBg: CSSProperties = { background: VELVET };
const leftCurtain: CSSProperties = {
    ...chunri('end'),
    left: 0,
    boxShadow: 'inset -18px 0 30px -12px rgba(0,0,0,0.55)',
};
const rightCurtain: CSSProperties = {
    ...chunri('start'),
    right: 0,
    boxShadow: 'inset 18px 0 30px -12px rgba(0,0,0,0.55)',
};
const auraStyle: CSSProperties = {
    background:
        'radial-gradient(circle, rgba(255,214,128,0.95) 0%, rgba(255,150,60,0.4) 35%, transparent 68%)',
    opacity: 0,
};

export function JyotOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy } = useInvite();
    const finish = useFinish(onOpened);
    const [lit, setLit] = useState(false);
    const parts = useRef<Parts>({
        left: null,
        right: null,
        aura: null,
        jyot: null,
        title: null,
        veil: null,
    });
    const still = tier === 'static';

    // Fetch GSAP while the guest looks at the closed darbar, so the tap never waits on it.
    useEffect(() => {
        if (!still) void loadGsap();
    }, [still]);

    const light = async () => {
        if (lit) return;
        // The first touch: the gesture browsers need before the bhajan may play.
        onBegin();
        setLit(true);
        if (still) {
            finish(600);
            return;
        }
        const gsap = await loadGsap();
        const p = parts.current;
        const timeline = gsap.timeline();
        timeline.to(
            p.aura,
            {
                opacity: 0.85,
                scale: 6,
                duration: 1.6,
                ease: 'power2.out',
            },
            0.25,
        );
        timeline.to(
            p.title,
            {
                opacity: 0,
                y: -24,
                duration: 0.8,
                ease: 'power2.in',
            },
            1.1,
        );
        timeline.to(
            p.left,
            {
                xPercent: -104,
                duration: 1.7,
                ease: 'power2.inOut',
            },
            1.2,
        );
        timeline.to(
            p.right,
            {
                xPercent: 104,
                duration: 1.7,
                ease: 'power2.inOut',
            },
            1.2,
        );
        timeline.to(
            p.jyot,
            {
                opacity: 0,
                scale: 0.85,
                duration: 0.9,
                ease: 'power2.in',
            },
            1.9,
        );
        timeline.to(
            p.veil,
            {
                opacity: 1,
                duration: 0.6,
                ease: 'power1.in',
            },
            2.5,
        );
        finish(3150);
    };

    return (
        <div
            className="inv-root fixed inset-0 z-50 touch-manipulation overflow-hidden select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
            style={stageBg}
            data-opening
        >
            <div
                ref={(el) => {
                    parts.current.left = el;
                }}
                className="absolute inset-y-0 w-[52%]"
                style={leftCurtain}
            />
            <div
                ref={(el) => {
                    parts.current.right = el;
                }}
                className="absolute inset-y-0 w-[52%]"
                style={rightCurtain}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[42%] bg-gradient-to-b from-[#12040a]/85 via-[#12040a]/45 to-transparent"
            />
            <MarigoldToran live={!still} className="absolute inset-x-0 top-0 z-20" />
            <StageTitle
                titleRef={(el) => {
                    parts.current.title = el;
                }}
            />
            <div
                ref={(el) => {
                    parts.current.aura = el;
                }}
                aria-hidden
                className="pointer-events-none absolute start-1/2 bottom-[calc(var(--inv-screen,100svh)*0.2-5px)] z-20 size-40 -translate-x-1/2 rounded-full rtl:translate-x-1/2"
                style={auraStyle}
            />
            <button
                ref={(el) => {
                    parts.current.jyot = el;
                }}
                type="button"
                aria-label={copy('lightTheJyot')}
                onClick={() => {
                    void light();
                }}
                disabled={lit}
                className="absolute start-1/2 bottom-[calc(var(--inv-screen,100svh)*0.2)] z-30 flex size-[clamp(120px,34cqw,168px)] -translate-x-1/2 cursor-pointer items-end justify-center rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#f3d27a] rtl:translate-x-1/2"
            >
                {!lit && (
                    <span
                        aria-hidden
                        className="absolute inset-[18%] animate-ping rounded-full border border-[#f3d27a]/60 motion-reduce:animate-none"
                    />
                )}
                <svg viewBox="0 0 120 120" className="relative w-full overflow-visible" aria-hidden>
                    <path d="M46 102 H74 L70 112 H50 Z" fill="#b07a22" />
                    <path d="M40 112 H80 V116 H40 Z" fill="#8a5716" />
                    <DiyaLamp x={60} y={88} size={3} lit={lit} phase={1} />
                </svg>
            </button>
            <div className="absolute inset-x-0 bottom-[calc(var(--inv-screen,100svh)*0.035)] z-20 mx-auto w-[min(94cqw,620px)]">
                <DiyaRow count={9} lit={lit} stagger={170} className="w-full" />
            </div>
            {/* Above the jyot on a dark pill: the curtains' gold seam runs right behind it. */}
            <p
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 bottom-[calc(var(--inv-screen,100svh)*0.2+clamp(120px,34cqw,168px)+10px)] z-30 mx-auto w-fit max-w-[86%] rounded-full bg-[#12040a]/75 px-5 py-2 text-center text-[11px] tracking-[0.3em] text-[#f4ead6] uppercase backdrop-blur-sm transition-opacity duration-500 ${lit ? 'opacity-0' : 'opacity-100'}`}
            >
                {copy('lightTheJyot')}
            </p>
            <HandoffVeil
                veilRef={(el) => {
                    parts.current.veil = el;
                }}
            />
        </div>
    );
}
