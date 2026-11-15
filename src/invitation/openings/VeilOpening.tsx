import { svgDataUrl } from '@shared/materials';
import { useState } from 'react';

import { useInvite } from '../context';
import { PromptPill, useFinish, usePull } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// Fine net and scattered sequins of a sheer dupatta.
const net = svgDataUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26'><path d='M0 13 H26 M13 0 V26' stroke='#fff' stroke-opacity='0.08' stroke-width='0.6'/><circle cx='6' cy='6' r='1.1' fill='#ffe7a8' fill-opacity='0.7'/><circle cx='19' cy='19' r='0.8' fill='#ffe7a8' fill-opacity='0.5'/></svg>`,
);
// Gota-patti border: gold scallops with a row of dots.
const gota = svgDataUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='34'><rect width='40' height='12' fill='#d9b25a'/><path d='M0 12 Q10 30 20 12 Q30 30 40 12 Z' fill='#e9c46a'/><circle cx='10' cy='6' r='2' fill='#fff2c8'/><circle cx='30' cy='6' r='2' fill='#fff2c8'/></svg>`,
);

// A sheer embroidered veil over the names: swipe it up and it floats away, the names coming into focus.
export function VeilOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy } = useInvite();
    const [lifted, setLifted] = useState(false);
    const finish = useFinish(onOpened);
    const { pull, progress, dragging, handlers } = usePull({
        max: 260,
        direction: 'up',
        threshold: 0.4,
        onStart: onBegin,
        disabled: lifted,
        onPass: () => {
            if (tier === 'static') {
                onOpened();
                return;
            }
            setLifted(true);
            finish(2400);
        },
    });

    return (
        <OpeningShell hidePrompt>
            {/* Behind the veil: the scene in the invitation's own colours. */}
            <div
                className={`absolute inset-0 transition-opacity duration-700 ${lifted ? 'opacity-0 delay-[1500ms]' : ''}`}
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 30%, color-mix(in oklab, var(--inv-primary) 40%, var(--inv-bg)), color-mix(in oklab, var(--inv-primary) 70%, black))',
                }}
            />
            {/* The veil is the handle: the whole sheet follows the finger up. */}
            <div
                role="button"
                tabIndex={0}
                aria-label={copy('liftVeil')}
                {...handlers}
                className={`absolute -inset-x-[10%] top-0 z-[26] h-[80%] touch-none ${lifted ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'} ${dragging ? '' : 'transition-[transform,opacity] duration-[1400ms] ease-[cubic-bezier(0.45,0,0.2,1)]'}`}
                style={{
                    transform: lifted
                        ? 'translateY(-120%) rotate(-4deg) skewX(4deg)'
                        : `translateY(${String(-pull)}px) skewX(${String(progress * 3)}deg)`,
                    opacity: lifted ? 0.2 : 1,
                    transformOrigin: '50% 0%',
                }}
            >
                <div
                    className="absolute inset-0 backdrop-blur-[7px]"
                    style={{
                        backgroundColor: 'color-mix(in oklab, var(--inv-primary) 62%, transparent)',
                        backgroundImage: net,
                    }}
                />
                {/* Gota border and tassels along the hem. */}
                <div
                    className="absolute inset-x-0 bottom-0 h-[34px]"
                    style={{
                        backgroundImage: gota,
                        backgroundSize: '40px 34px',
                    }}
                />
                <div className="absolute inset-x-0 -bottom-6 flex justify-around">
                    {Array.from({ length: 14 }, (_, i) => (
                        <span key={i} className="flex flex-col items-center">
                            <span className="h-4 w-px bg-[#e9c46a]" />
                            <span className="size-2 rounded-full bg-[#e9c46a] shadow-[0_0_6px_rgba(233,196,106,0.6)]" />
                        </span>
                    ))}
                </div>
            </div>
            <PromptPill hidden={lifted}>{copy('liftVeil')}</PromptPill>
        </OpeningShell>
    );
}
