import { materialBackground, mixHex } from '@shared/materials';
import { useMemo, useState } from 'react';

import { useInvite } from '../context';
import { PromptPill, useFinish, usePull } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

const satin =
    'linear-gradient(90deg, color-mix(in oklab, var(--inv-gold) 55%, black), var(--inv-gold) 30%, color-mix(in oklab, var(--inv-gold) 40%, white) 50%, var(--inv-gold) 70%, color-mix(in oklab, var(--inv-gold) 55%, black))';

// The invitation arrives gift-wrapped: pull the bow's tail, the bow unties, the ribbons slide off
// and the paper's four flaps fly back.
export function RibbonOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy, data } = useInvite();
    const { design, seed, culture } = data.invitation;
    const [phase, setPhase] = useState<'wrapped' | 'untie' | 'unwrap'>('wrapped');
    const finish = useFinish(onOpened);
    const paper = useMemo(
        () =>
            materialBackground({
                kind: 'jacquard',
                base: mixHex(design.palette.primary, '#000000', 0.3),
                motif: culture.startsWith('islamic') ? 'girih' : 'paisley',
                motifColor: mixHex(design.palette.primary, '#000000', 0.18),
                seed,
                motifScale: 0.24,
            }),
        [design.palette.primary, seed, culture],
    );
    const { pull, dragging, handlers } = usePull({
        max: 120,
        threshold: 0.5,
        onStart: onBegin,
        disabled: phase !== 'wrapped',
        onPass: () => {
            if (tier === 'static') {
                onOpened();
                return;
            }
            setPhase('untie');
            setTimeout(() => {
                setPhase('unwrap');
            }, 900);
            finish(2300);
        },
    });
    const untied = phase !== 'wrapped';
    const unwrap = phase === 'unwrap';
    const move = 'transition-transform duration-[1100ms] ease-[cubic-bezier(0.7,0,0.25,1)]';

    // The four paper flaps, each flying off toward its own corner.
    const flaps = [
        ['0 0, 50% 0, 50% 50%, 0 50%', '-60%, -60%', -14],
        ['50% 0, 100% 0, 100% 50%, 50% 50%', '60%, -60%', 14],
        ['50% 50%, 100% 50%, 100% 100%, 50% 100%', '60%, 60%', -10],
        ['0 50%, 50% 50%, 50% 100%, 0 100%', '-60%, 60%', 10],
    ] as const;

    return (
        <OpeningShell hidePrompt hideTitle={untied}>
            <div className="absolute inset-0">
                {flaps.map(([clip, to, turn]) => (
                    <div
                        key={clip}
                        className={`absolute inset-0 ${move}`}
                        style={{
                            clipPath: `polygon(${clip})`,
                            backgroundImage: paper,
                            backgroundColor: 'var(--inv-primary)',
                            transform: unwrap
                                ? `translate(${to}) rotate(${String(turn)}deg)`
                                : 'none',
                        }}
                    />
                ))}
                {/* Ribbons: the vertical one slides up, the horizontal one slides away sideways. */}
                <div
                    className={`absolute inset-x-0 inset-y-0 mx-auto w-14 shadow-[0_0_18px_rgba(0,0,0,0.35)] ${move}`}
                    style={{
                        background: satin,
                        transform: `translateY(${untied ? '-110%' : '0'})`,
                    }}
                />
                <div
                    className={`absolute inset-x-0 top-1/2 h-14 -translate-y-1/2 shadow-[0_0_18px_rgba(0,0,0,0.35)] ${move}`}
                    style={{
                        background: satin.replace('90deg', '180deg'),
                        transform: `translateY(-50%) translateX(${untied ? '110%' : '0'})`,
                    }}
                />
            </div>
            {/* The bow: loops shrink away when untied; the tail is the handle. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-1/2 z-30 mx-auto w-56 transition-[transform,opacity] duration-700"
                style={{
                    transform: `translateY(-50%) scale(${untied ? 0.2 : 1}) rotate(${untied ? 40 : 0}deg)`,
                    opacity: untied ? 0 : 1,
                }}
            >
                <svg
                    viewBox="0 0 200 120"
                    className="w-full overflow-visible drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)]"
                >
                    <defs>
                        <linearGradient id="rb-satin" x1="0" x2="1" y1="0" y2="1">
                            <stop
                                offset="0"
                                stopColor="color-mix(in oklab, var(--inv-gold) 55%, black)"
                            />
                            <stop
                                offset="0.45"
                                stopColor="color-mix(in oklab, var(--inv-gold) 50%, white)"
                            />
                            <stop
                                offset="1"
                                stopColor="color-mix(in oklab, var(--inv-gold) 60%, black)"
                            />
                        </linearGradient>
                    </defs>
                    <path
                        d="M100 60 C70 20 22 18 18 44 C14 70 64 74 100 60 Z"
                        fill="url(#rb-satin)"
                    />
                    <path
                        d="M100 60 C130 20 178 18 182 44 C186 70 136 74 100 60 Z"
                        fill="url(#rb-satin)"
                    />
                    <path
                        d="M100 60 C80 78 70 100 62 118 L78 116 C84 98 92 80 100 66 Z"
                        fill="url(#rb-satin)"
                    />
                    <ellipse cx="100" cy="60" rx="14" ry="12" fill="url(#rb-satin)" />
                </svg>
            </div>
            <button
                type="button"
                aria-label={copy('untieRibbon')}
                {...handlers}
                disabled={untied}
                className={`absolute z-40 touch-none ${dragging ? '' : 'transition-[top,opacity] duration-300 ease-out'} ${untied ? 'pointer-events-none opacity-0' : 'cursor-grab active:cursor-grabbing'}`}
                style={{
                    left: 'calc(50% + 16px)',
                    top: `calc(50% + 40px + ${String(pull)}px)`,
                }}
            >
                {/* The right tail, longer as it is pulled. */}
                <svg viewBox="0 0 30 60" className="w-8 drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)]">
                    <path
                        d="M4 0 C12 18 18 36 24 58 L8 56 C6 38 4 20 0 4 Z"
                        fill="var(--inv-gold)"
                    />
                    <path
                        d="M8 56 L16 50 L24 58 Z"
                        fill="color-mix(in oklab, var(--inv-gold) 55%, black)"
                    />
                </svg>
            </button>
            <PromptPill hidden={untied}>{copy('untieRibbon')}</PromptPill>
        </OpeningShell>
    );
}
