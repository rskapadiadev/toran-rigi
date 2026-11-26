// "Darbar": the cover as a jagran stage at night. A marigold toran across the top, brass bells swaying
// on their chains, stage light falling from above and the hosts' own photo of the deity in a gold
// jharokha strung with lights. When the opening lifts, a row of diyas catches from the middle out
// and petals drift down. The photo is always the customer's; without one the arch holds a lit
// akhand jyot, so nothing sacred is ever drawn or invented here.
import { archPath } from '@shared/arches';
import { COVER_SLOT, photoUrl, slotPhoto } from '@shared/photos';
import { formatEventTime, zonedToUtc } from '@shared/time';
import { type CSSProperties, useId, useRef } from 'react';

import { GenerativeOrnament } from '../../../motion/GenerativeOrnament';
import { useEntrance } from '../../../motion/stage';
import { useInvite } from '../../context';
import { Editable } from '../../editing';
import { usePrint } from '../../print';
import { fitDisplay, useCoverFacts } from '../../sections/covers';
import { DiyaRow, MarigoldToran, TempleBell } from '../darbar/art';
import { Petals } from '../effects/Petals';
import { DiyaLamp } from '../typography/DiyaGarland';

// The jharokha drawn in a 300 × 480 box: the arch itself, closed for the photo's clip.
const ARCH = archPath('hindu');
const CLOSED = `${ARCH} Z`;

interface FrameProps {
    photo: string | undefined;
    live: boolean;
}

// The gold arch on its chowki, strung with lights, holding the photo or the akhand jyot.
function DarbarArch({ photo, live }: FrameProps) {
    const id = useId();
    const pulse = live ? 'glow-pulse 2.6s ease-in-out infinite' : undefined;
    const lights: CSSProperties = { animation: pulse };
    return (
        <svg viewBox="0 0 300 480" className="relative w-full overflow-visible" aria-hidden>
            <defs>
                <clipPath id={`${id}-clip`}>
                    <path d={CLOSED} />
                </clipPath>
                <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fff0b8" />
                    <stop offset="0.35" stopColor="var(--inv-gold)" />
                    <stop offset="0.7" stopColor="#8f5a12" />
                    <stop offset="1" stopColor="#f3d27a" />
                </linearGradient>
                <radialGradient id={`${id}-glow`} cx="0.5" cy="0.78" r="0.7">
                    <stop offset="0" stopColor="#ffcf6e" stopOpacity="0.55" />
                    <stop offset="0.5" stopColor="var(--inv-primary)" stopOpacity="0.25" />
                    <stop offset="1" stopColor="#12040a" stopOpacity="0.95" />
                </radialGradient>
            </defs>
            <g clipPath={`url(#${id}-clip)`}>
                <rect x="0" y="0" width="300" height="480" fill={`url(#${id}-glow)`} />
                {photo ? (
                    <image
                        href={photo}
                        x="20"
                        y="8"
                        width="260"
                        height="462"
                        preserveAspectRatio="xMidYMid slice"
                    />
                ) : (
                    <DiyaLamp x={150} y={392} size={4.2} lit phase={2} />
                )}
            </g>
            {/* Lights strung along the arch: round dots of a dashed stroke, breathing together. */}
            <path
                d={ARCH}
                transform="translate(150 470) scale(1.07 1.035) translate(-150 -470)"
                fill="none"
                stroke="#ffe39a"
                strokeWidth={4.4}
                strokeLinecap="round"
                strokeDasharray="0 12"
                style={lights}
            />
            <path d={ARCH} fill="none" stroke={`url(#${id}-gold)`} strokeWidth={7} />
            <path
                d={ARCH}
                transform="translate(150 470) scale(0.94 0.97) translate(-150 -470)"
                fill="none"
                stroke={`url(#${id}-gold)`}
                strokeWidth={1.6}
                opacity={0.85}
            />
            {/* The chowki: a red cloth with a gold border under the frame. */}
            <path d="M-6 466 H306 L296 488 H4 Z" fill="var(--inv-accent)" />
            <path d="M-6 466 H306" stroke={`url(#${id}-gold)`} strokeWidth={3} />
            <path d="M4 484 H296" stroke={`url(#${id}-gold)`} strokeWidth={1.2} opacity={0.8} />
        </svg>
    );
}

export function DarbarCover() {
    const { data, tier, locale, copy } = useInvite();
    const facts = useCoverFacts();
    const print = usePrint();
    const { content, design, seed } = data.invitation;
    const key = slotPhoto(content, COVER_SLOT);
    const live = tier !== 'static' && !print;
    const foot = useRef<HTMLDivElement>(null);
    const lit = useEntrance(foot) || !live;
    const first = data.events[0];
    const time = first
        ? formatEventTime(zonedToUtc(first.startsAt, first.timezone), first.timezone, locale)
        : '';
    const screen: CSSProperties = {
        minHeight: 'var(--inv-screen, 100svh)',
        background:
            'radial-gradient(120% 70% at 50% 38%, color-mix(in oklab, var(--inv-primary) 34%, var(--inv-bg)) 0%, var(--inv-bg) 62%, color-mix(in oklab, var(--inv-bg) 70%, black) 100%)',
    };
    // Stage light: soft beams fanning down from above the toran, leaning slowly from side to side.
    const beams: CSSProperties = {
        background:
            'conic-gradient(from 160deg at 50% -8%, transparent 0deg, rgba(255,214,140,0.16) 8deg, transparent 15deg, transparent 22deg, rgba(255,214,140,0.12) 29deg, transparent 36deg, transparent 43deg, rgba(255,214,140,0.16) 50deg, transparent 57deg)',
        transformOrigin: '50% 0%',
        // Fades out before its own edge, so the light never ends in a line.
        maskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)',
        animation: live ? 'toran-sway 11s ease-in-out infinite' : undefined,
    };
    const frame: CSSProperties = { width: 'min(56cqw, 290px, 26svh)' };
    return (
        <section
            className="relative flex flex-col items-center overflow-hidden px-6 pb-10 text-center"
            style={screen}
            data-darbar
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-[-30%] top-0 h-[85%]"
                style={beams}
            />
            <Petals />
            <MarigoldToran live={live} className="absolute inset-x-0 top-0 z-10" />
            <TempleBell
                live={live}
                className="absolute start-[5%] top-[clamp(40px,12cqw,76px)] z-10 w-[clamp(26px,7.5cqw,44px)]"
            />
            <TempleBell
                live={live}
                phase={1.3}
                className="absolute end-[5%] top-[clamp(40px,12cqw,76px)] z-10 w-[clamp(26px,7.5cqw,44px)]"
            />

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-[clamp(10px,2.2svh,22px)] pt-[clamp(84px,24cqw,118px)]">
                {facts.greeting && (
                    // Sacred text: set calmly, never animated destructively.
                    <p className="inv-display text-[clamp(0.95rem,4cqw,1.25rem)] text-(--inv-gold)">
                        {facts.greeting.text[locale] ?? facts.greeting.text.en}
                    </p>
                )}
                {facts.guest && (
                    <p className="text-[11px] tracking-[0.35em] uppercase opacity-80">
                        {copy('dearGuest')} {facts.guest.name}
                    </p>
                )}
                <div className="relative" style={frame} data-photo-slot={COVER_SLOT}>
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-[38%] rounded-full bg-[radial-gradient(circle,rgba(255,206,120,0.42),transparent_62%)]"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-[30%] opacity-25"
                    >
                        <GenerativeOrnament
                            kind={design.generative.kind}
                            seed={seed}
                            className="size-full text-(--inv-gold)"
                            spin={tier === 'full' && !print}
                        />
                    </div>
                    <DarbarArch photo={key ? photoUrl(key) : undefined} live={live} />
                </div>
                <h2
                    className="inv-display leading-[1.05] text-balance"
                    style={{ fontSize: fitDisplay([facts.one], 11, 80, 4.4) }}
                >
                    <span className="foil-text">
                        <Editable path="people.one.name">{facts.one}</Editable>
                    </span>
                </h2>
                {facts.headline && (
                    <p className="max-w-[36ch] text-[clamp(0.9rem,3.6cqw,1.15rem)] leading-relaxed opacity-90">
                        <Editable path="headline" multiline>
                            {facts.headline}
                        </Editable>
                    </p>
                )}
                {facts.dateText && (
                    <p className="flex flex-wrap items-center justify-center gap-x-3 text-[clamp(0.8rem,3.2cqw,1rem)] tracking-[0.18em] text-(--inv-gold) uppercase">
                        <span>{facts.dateText}</span>
                        {time && (
                            <>
                                <span aria-hidden className="size-1 rounded-full bg-current" />
                                <span>{time}</span>
                            </>
                        )}
                    </p>
                )}
            </div>
            <div ref={foot} className="relative z-10 mt-4 w-[min(92cqw,560px)]">
                <DiyaRow count={9} lit={lit} className="w-full" />
            </div>
        </section>
    );
}
