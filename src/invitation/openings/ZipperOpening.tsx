import { materialBackground, mixHex } from '@shared/materials';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useInvite } from '../context';
import { PromptPill, useFinish, usePull } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// The whole screen is silk with a gold zip down the middle. Pulling the slider parts the two halves
// in a V above it — through the gap the invitation itself shows — then they fall away.
export function ZipperOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy, data } = useInvite();
    const { design, seed } = data.invitation;
    const stage = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({
        w: 390,
        h: 800,
    });
    const [phase, setPhase] = useState<'closed' | 'unzipping' | 'apart'>('closed');
    const finish = useFinish(onOpened);

    useLayoutEffect(() => {
        const el = stage.current;
        if (!el) return;
        const measure = () => {
            setSize({
                w: el.clientWidth,
                h: el.clientHeight,
            });
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, []);

    // The slider waits just below the names card at the top.
    const top = size.h * 0.26;
    const { pull, dragging, handlers } = usePull({
        max: size.h * 0.62,
        threshold: 0.55,
        onStart: onBegin,
        disabled: phase !== 'closed',
        onPass: () => {
            if (tier === 'static') {
                onOpened();
                return;
            }
            setPhase('unzipping');
            setTimeout(() => {
                setPhase('apart');
            }, 900);
            finish(2000);
        },
    });

    const z = phase === 'closed' ? top + pull : size.h * 1.06;
    // The V widens with the slider: a third of how far it has travelled, at the top edge.
    const gap = Math.min(size.w * 0.48, (z - top) * 0.34);
    const silk = useMemo(() => {
        const base = mixHex(design.palette.primary, '#000000', 0.25);
        return materialBackground({
            kind: 'silk',
            base,
            seed,
        });
    }, [design.palette.primary, seed]);
    const smooth = dragging
        ? ''
        : 'transition-[clip-path,transform,opacity] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]';

    const half = (side: 'left' | 'right') => {
        const clip =
            side === 'left'
                ? `polygon(0 0, ${String(size.w / 2 - gap)}px 0, 50% ${String(z)}px, 50% 100%, 0 100%)`
                : `polygon(${String(size.w / 2 + gap)}px 0, 100% 0, 100% 100%, 50% 100%, 50% ${String(z)}px)`;
        const away =
            phase === 'apart'
                ? `translateX(${side === 'left' ? '-70%' : '70%'}) rotate(${side === 'left' ? -6 : 6}deg)`
                : 'none';
        return (
            <div
                className={`absolute inset-0 ${smooth}`}
                style={{
                    clipPath: clip,
                    backgroundImage: silk,
                    backgroundColor: 'var(--inv-primary)',
                    transform: away,
                    opacity: phase === 'apart' ? 0 : 1,
                }}
            />
        );
    };

    return (
        <OpeningShell hidePrompt hideTitle={phase !== 'closed'}>
            {/* Transparent stage: only the silk halves cover the invitation behind. */}
            <div ref={stage} className="absolute inset-0" style={{ background: 'transparent' }}>
                {half('left')}
                {half('right')}
                {/* Teeth still closed below the slider; open edges above it. */}
                <svg
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 ${phase === 'apart' ? 'opacity-0 transition-opacity duration-500' : ''}`}
                    width={size.w}
                    height={size.h}
                >
                    <defs>
                        <pattern id="zip-teeth" width="12" height="7" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0.5" width="7" height="3" rx="1" fill="#e2bd62" />
                            <rect x="5" y="4" width="7" height="3" rx="1" fill="#b8892c" />
                        </pattern>
                    </defs>
                    <rect
                        x={size.w / 2 - 6}
                        y={z}
                        width="12"
                        height={Math.max(0, size.h - z)}
                        fill="url(#zip-teeth)"
                    />
                    <path
                        d={`M${String(size.w / 2 - gap)} 0 L${String(size.w / 2)} ${String(z)} L${String(size.w / 2 + gap)} 0`}
                        fill="none"
                        stroke="#e2bd62"
                        strokeWidth="5"
                        strokeDasharray="3 4"
                    />
                </svg>
            </div>
            {/* The slider and its pull tab: the handle. */}
            <button
                type="button"
                aria-label={copy('unzip')}
                {...handlers}
                disabled={phase !== 'closed'}
                className={`absolute inset-x-0 z-40 mx-auto w-fit touch-none ${dragging ? '' : 'transition-[top,opacity] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]'} ${phase === 'closed' ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none opacity-0'}`}
                style={{ top: `${String(z - 14)}px` }}
            >
                <svg viewBox="0 0 34 70" className="w-9 drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]">
                    <defs>
                        <linearGradient id="zip-brass" x1="0" x2="1">
                            <stop offset="0" stopColor="#7a5418" />
                            <stop offset="0.5" stopColor="#f0cf78" />
                            <stop offset="1" stopColor="#6b4a14" />
                        </linearGradient>
                    </defs>
                    <path d="M4 2 H30 L26 22 H8 Z" fill="url(#zip-brass)" />
                    <path d="M12 18 H22 V30 H12 Z" fill="url(#zip-brass)" />
                    <path
                        d="M8 30 H26 C28 30 30 32 30 34 L28 62 C28 66 25 68 22 68 H12 C9 68 6 66 6 62 L4 34 C4 32 6 30 8 30 Z M12 40 V58 H22 V40 Z"
                        fill="url(#zip-brass)"
                        fillRule="evenodd"
                    />
                </svg>
            </button>
            <PromptPill hidden={phase !== 'closed'}>{copy('unzip')}</PromptPill>
        </OpeningShell>
    );
}
