import { materialBackground, mixHex } from '@shared/materials';
import { useMemo, useState } from 'react';

import { useInvite } from '../context';
import { PromptPill, useFinish, usePull } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

const shade = 'color-mix(in oklab, var(--inv-gold) 55%, black)';
const sheen = 'color-mix(in oklab, var(--inv-gold) 45%, white)';
// Where the pull tail leaves the knot.
const tailAnchor = {
    left: 'calc(50% - 4px)',
    top: 'calc(50% - 2px)',
};
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
                    viewBox="0 0 200 140"
                    className="w-full overflow-visible drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)]"
                >
                    <defs>
                        <linearGradient id="rb-satin" x1="0" x2="1" y1="0" y2="1">
                            <stop offset="0" stopColor={shade} />
                            <stop offset="0.45" stopColor={sheen} />
                            <stop offset="1" stopColor={shade} />
                        </linearGradient>
                    </defs>
                    {/* Left tail, behind the loops, ending in a V-cut. */}
                    <path
                        d="M93 66 C87 86 79 106 70 130 L79 124 L86 134 C93 110 100 88 105 68 Z"
                        fill="url(#rb-satin)"
                    />
                    {/* Two loops, mirrored: the satin face, the shadowed inside of the fold and a sheen along the top. */}
                    {[false, true].map((mirror) => (
                        <g
                            key={String(mirror)}
                            transform={mirror ? 'matrix(-1 0 0 1 200 0)' : undefined}
                        >
                            <path
                                d="M100 58 C84 38 58 12 32 17 C12 21 8 46 22 61 C36 76 68 72 100 63 Z"
                                fill="url(#rb-satin)"
                            />
                            <path
                                d="M93 57 C78 45 58 32 42 34 C31 36 30 49 38 55 C50 63 74 62 93 60 Z"
                                fill={shade}
                                opacity="0.55"
                            />
                            <path
                                d="M96 54 C82 36 60 20 36 22"
                                fill="none"
                                stroke="white"
                                strokeOpacity="0.35"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </g>
                    ))}
                    {/* The knot, gathered into pleats. */}
                    <rect x="87" y="45" width="26" height="27" rx="9" fill="url(#rb-satin)" />
                    <path
                        d="M95 48 C93 56 93 62 95 69 M105 48 C107 56 107 62 105 69"
                        fill="none"
                        stroke={shade}
                        strokeOpacity="0.5"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            <button
                type="button"
                aria-label={copy('untieRibbon')}
                {...handlers}
                disabled={untied}
                className={`absolute z-40 touch-none transition-opacity ${untied ? 'pointer-events-none opacity-0' : 'cursor-grab active:cursor-grabbing'}`}
                style={tailAnchor}
            >
                {/* The right tail stays tied to the knot and stretches as guests pull it. */}
                <svg
                    viewBox="0 0 40 80"
                    className={`w-10 origin-top drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)] ${dragging ? '' : 'transition-transform duration-300 ease-out'}`}
                    style={{ transform: `scaleY(${String(1 + pull / 80)})` }}
                >
                    <defs>
                        <linearGradient id="rb-tail" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0" stopColor={shade} />
                            <stop offset="0.5" stopColor={sheen} />
                            <stop offset="1" stopColor={shade} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M2 2 C9 26 17 50 27 76 L32 67 L40 77 C31 50 23 26 17 0 Z"
                        fill="url(#rb-tail)"
                    />
                </svg>
            </button>
            <PromptPill hidden={untied}>{copy('untieRibbon')}</PromptPill>
        </OpeningShell>
    );
}
