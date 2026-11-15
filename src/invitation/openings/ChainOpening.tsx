import { svgDataUrl } from '@shared/materials';
import { useState } from 'react';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { useInvite } from '../context';
import { PromptPill, useFinish, usePull } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

const PULL = 160;

// Gold chain links, alternating face-on and edge-on, tiled down the chain.
const links = svgDataUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='22'><ellipse cx='7' cy='5.5' rx='4.4' ry='5.2' fill='none' stroke='#e9c46a' stroke-width='2.2'/><rect x='5.9' y='10' width='2.2' height='11' rx='1.1' fill='#b8892c'/></svg>`,
);

function Door({ side, open, part }: { side: 'start' | 'end';
open: boolean;
part: number }) {
    const { data } = useInvite();
    const { design, seed } = data.invitation;
    const sign = side === 'start' ? -1 : 1;
    return (
        <div
            className={`absolute inset-y-0 w-1/2 overflow-hidden ${open ? 'transition-transform duration-[1400ms] ease-[cubic-bezier(0.7,0,0.2,1)]' : ''}`}
            style={{
                // Physical sides: each door slides away from the seam whatever the text direction.
                ...(side === 'start' ? { left: 0 } : { right: 0 }),
                // While pulled, the chain draws the doors a little apart, like a pulley.
                transform: `translateX(${String(sign * (open ? 105 : part * 14))}%)`,
                background:
                    'linear-gradient(90deg, color-mix(in oklab, var(--inv-primary) 70%, black), color-mix(in oklab, var(--inv-primary) 55%, black))',
            }}
        >
            <div className="absolute inset-4 rounded-sm border border-(--inv-gold)/60" />
            <div className="absolute inset-7 rounded-sm border border-(--inv-gold)/30" />
            {/* Half of one medallion on each door: whole only while the doors are shut. */}
            <div
                className="absolute top-1/2 size-[70cqw] max-h-[70svh] max-w-[70svh] -translate-y-1/2 opacity-80"
                style={side === 'start' ? { right: 'calc(-35cqw)' } : { left: 'calc(-35cqw)' }}
            >
                <GenerativeOrnament
                    kind={design.generative.kind}
                    seed={seed}
                    draw={false}
                    className="size-full"
                />
            </div>
            <div
                className="absolute inset-y-0 w-px bg-(--inv-gold)/70"
                style={side === 'start' ? { right: 0 } : { left: 0 }}
            />
        </div>
    );
}

// Closed palace doors with a gold chain hanging in the middle: pull it and the doors part.
export function ChainOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy } = useInvite();
    const [open, setOpen] = useState(false);
    const finish = useFinish(onOpened);
    const { pull, progress, dragging, handlers } = usePull({
        max: PULL,
        threshold: 0.5,
        onStart: onBegin,
        disabled: open,
        onPass: () => {
            if (tier === 'static') {
                onOpened();
                return;
            }
            setOpen(true);
            finish(1500);
        },
    });
    const length = open ? 0 : pull;

    return (
        <OpeningShell hidePrompt hideTitle={open}>
            <div className="absolute inset-0">
                <Door side="start" open={open} part={progress} />
                <Door side="end" open={open} part={progress} />
            </div>
            {/* The chain, then its bell pendant as the handle. */}
            <div
                aria-hidden
                className={`absolute inset-x-0 top-0 z-10 mx-auto w-[14px] ${dragging ? '' : 'transition-[height,opacity] duration-500 ease-out'} ${open ? 'opacity-0' : ''}`}
                style={{
                    height: `calc(34svh + ${String(length)}px)`,
                    backgroundImage: links,
                    backgroundSize: '14px 22px',
                    backgroundPosition: 'bottom',
                }}
            />
            <button
                type="button"
                aria-label={copy('pullTheChain')}
                {...handlers}
                disabled={open}
                className={`absolute inset-x-0 z-40 mx-auto w-fit touch-none ${dragging ? '' : 'transition-[top,opacity] duration-500 ease-out'} ${open ? 'pointer-events-none opacity-0' : 'cursor-grab active:cursor-grabbing'}`}
                style={{ top: `calc(34svh + ${String(length)}px)` }}
            >
                <svg viewBox="0 0 40 56" className="w-12 drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]">
                    <defs>
                        <linearGradient id="ch-brass" x1="0" x2="1">
                            <stop offset="0" stopColor="#7a5418" />
                            <stop offset="0.5" stopColor="#f0cf78" />
                            <stop offset="1" stopColor="#6b4a14" />
                        </linearGradient>
                    </defs>
                    <circle cx="20" cy="4" r="3.5" fill="none" stroke="#e9c46a" strokeWidth="2" />
                    <path
                        d="M20 8 C9 8 6 22 6 34 C6 40 4 44 1 47 L39 47 C36 44 34 40 34 34 C34 22 31 8 20 8 Z"
                        fill="url(#ch-brass)"
                    />
                    <path d="M7 39 H33" stroke="#5a3d10" strokeWidth="1.2" />
                    <circle cx="20" cy="51" r="4" fill="url(#ch-brass)" />
                </svg>
            </button>
            <PromptPill hidden={open}>{copy('pullTheChain')}</PromptPill>
        </OpeningShell>
    );
}
