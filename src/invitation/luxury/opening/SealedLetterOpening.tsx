// The sealed letter: a cotton-paper envelope on the showroom table, closed with the couple's wax
// seal. The guest presses and holds the seal until it cracks; the halves fall away, the flap peels
// open with a paper curl onto a gold-trellised liner, and the card slides out under a vellum sheet
// that lifts away before the invitation takes over. CSS 3D + GSAP, no WebGL.
import { mixHex } from '@shared/materials';
import {
    type CSSProperties,
    type KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { loadGsap } from '../../../motion/gsap';
import { useInvite } from '../../context';
import { useFinish } from '../../openings/gesture';
import type { OpeningProps } from '../../openings/types';
import { useCoverFacts } from '../../sections/covers';
import { applySeal, type SealHandle, WaxSeal } from '../envelope/WaxSeal';
import {
    cottonGrain,
    deckled,
    foilInk,
    linerPattern,
    paperGrain,
    plane,
    showroom,
} from '../materials';
import { HandoffVeil, StagePrompt, StageTitle } from './stage';

// Where the flap folds as it lifts, and where its tip (and the seal) sits, as fractions of height.
const FOLD = 0.3;
const TIP = 0.62;
// A press shorter than this is a tap: the seal breaks by itself.
const TAP_MS = 220;

interface Parts {
    flap: HTMLDivElement | null;
    flapTip: HTMLDivElement | null;
    card: HTMLDivElement | null;
    vellum: HTMLDivElement | null;
    envelope: HTMLDivElement | null;
    camera: HTMLDivElement | null;
    veil: HTMLDivElement | null;
    title: HTMLDivElement | null;
}

interface Pose {
    crack: number;
    split: number;
    // 0 → 1: the flap lifts, curls and lies open.
    flap: number;
    // 0 → 1: the card slides out of the envelope.
    card: number;
    // 0 → 1: the vellum lifts off the card.
    vellum: number;
    push: number;
}

function applyPose(parts: Parts, seal: SealHandle | null, p: Pose) {
    if (seal) applySeal(seal, p.crack, p.split);
    // The paper bends while it moves and lies flat again once open.
    const curl = Math.sin(Math.PI * p.flap) * 48;
    if (parts.flap)
        parts.flap.style.transform = `translateZ(6px) rotateX(${String(p.flap * 178)}deg)`;
    if (parts.flapTip) parts.flapTip.style.transform = `rotateX(${String(-curl)}deg)`;
    if (parts.card) {
        // Out of the pocket first, then forward over the open flap.
        const lift = p.card * 64;
        const forward = Math.max(0, p.card - 0.45) / 0.55;
        parts.card.style.transform = `translateY(${String(-lift)}%) translateZ(${String(2 + forward * 40)}px)`;
    }
    if (parts.vellum) {
        parts.vellum.style.transform = `translate(${String(p.vellum * 38)}%, ${String(-p.vellum * 24)}%) rotate(${String(p.vellum * 9)}deg)`;
        parts.vellum.style.opacity = String(0.85 * (1 - p.vellum));
    }
    if (parts.envelope)
        parts.envelope.style.transform = `translate(-50%, -50%) translateY(${String(p.card * 16)}%) rotateX(${String(12 - p.card * 6)}deg) rotateZ(${String(-2 + p.card * 2)}deg)`;
    if (parts.title) parts.title.style.opacity = String(Math.max(0, 1 - p.flap * 1.6));
    if (parts.camera)
        parts.camera.style.transform = `scale(${String(1 + p.push * 0.3)}) translateY(${String(p.push * 6)}%)`;
    if (parts.veil) parts.veil.style.opacity = String(Math.max(0, (p.push - 0.3) / 0.7));
}

export function SealedLetterOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy, names, data, t } = useInvite();
    const facts = useCoverFacts();
    const finish = useFinish(onOpened);
    const { palette } = data.invitation.design;
    const [stage, setStage] = useState<'sealed' | 'pressing' | 'opening'>('sealed');
    const parts = useRef<Parts>({
        flap: null,
        flapTip: null,
        card: null,
        vellum: null,
        envelope: null,
        camera: null,
        veil: null,
        title: null,
    });
    const seal = useRef<SealHandle | null>(null);
    const pose = useRef<Pose>({
        crack: 0,
        split: 0,
        flap: 0,
        card: 0,
        vellum: 0,
        push: 0,
    });
    const pressedAt = useRef(0);
    const begun = useRef(false);
    const still = tier === 'static';

    useEffect(() => {
        if (!still) void loadGsap();
    }, [still]);

    const colors = useMemo(
        () => ({
            paper: mixHex('#f4ecdd', palette.surface, 0.25),
            paperShade: mixHex('#e6d9c2', palette.surface, 0.2),
            liner: mixHex(palette.primary, '#000000', 0.35),
            wax: mixHex(palette.primary, '#000000', 0.12),
            gold: palette.gold,
        }),
        [palette],
    );

    const adoptSeal = useCallback((h: SealHandle) => {
        seal.current = h;
    }, []);

    const apply = () => {
        applyPose(parts.current, seal.current, pose.current);
    };

    const begin = () => {
        if (begun.current) return;
        begun.current = true;
        onBegin();
    };

    const reveal = useCallback(async () => {
        setStage('opening');
        if (still) {
            finish(250);
            return;
        }
        const gsap = await loadGsap();
        const p = pose.current;
        const step = () => {
            applyPose(parts.current, seal.current, p);
        };
        gsap.killTweensOf(p);
        const tl = gsap.timeline();
        tl.to(p, {
            crack: 1,
            duration: 0.18,
            ease: 'power1.in',
            onUpdate: step,
        });
        tl.to(
            p,
            {
                split: 1,
                duration: 0.95,
                ease: 'power2.in',
                onUpdate: step,
            },
            0.12,
        );
        tl.to(
            p,
            {
                flap: 1,
                duration: 1.15,
                ease: 'power2.inOut',
                onUpdate: step,
            },
            0.45,
        );
        tl.to(
            p,
            {
                card: 1,
                duration: 1.2,
                ease: 'power3.inOut',
                onUpdate: step,
            },
            1.3,
        );
        tl.to(
            p,
            {
                vellum: 1,
                duration: 0.85,
                ease: 'power2.in',
                onUpdate: step,
            },
            2.2,
        );
        tl.to(
            p,
            {
                push: 1,
                duration: 1.0,
                ease: 'power2.inOut',
                onUpdate: step,
            },
            2.85,
        );
        finish(3950);
    }, [finish, still]);

    const press = async () => {
        if (stage !== 'sealed') return;
        begin();
        setStage('pressing');
        pressedAt.current = performance.now();
        if (still) return;
        const gsap = await loadGsap();
        const p = pose.current;
        // Holding drives the crack; it breaks on its own once it runs the full width.
        gsap.to(p, {
            crack: 1,
            duration: 0.95,
            ease: 'power1.in',
            onUpdate: apply,
            onComplete: () => {
                void reveal();
            },
        });
    };

    const release = async () => {
        if (stage !== 'pressing') return;
        const tapped = performance.now() - pressedAt.current < TAP_MS;
        if (still || tapped || pose.current.crack >= 0.45) {
            void reveal();
            return;
        }
        // Let go too soon: the wax settles, the hairline closes.
        const gsap = await loadGsap();
        gsap.killTweensOf(pose.current);
        gsap.to(pose.current, {
            crack: 0,
            duration: 0.4,
            ease: 'power2.out',
            onUpdate: apply,
        });
        setStage('sealed');
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        begin();
        void reveal();
    };

    const envelope: CSSProperties & Record<'--w' | '--h', string> = {
        '--w': 'min(86cqw, 30rem)',
        '--h': 'calc(var(--w) * 0.7)',
        position: 'absolute',
        left: '50%',
        top: '58%',
        width: 'var(--w)',
        height: 'var(--h)',
        transformStyle: 'preserve-3d',
        transform: 'translate(-50%, -50%) rotateX(12deg) rotateZ(-2deg)',
    };
    const preserve: CSSProperties = { transformStyle: 'preserve-3d' };
    const room = showroom(palette.primary, colors.gold);
    const stageBg: CSSProperties = { background: room };
    const paperFace = (tone: string, angle: number) =>
        `${cottonGrain}, linear-gradient(${String(angle)}deg, ${mixHex(tone, '#ffffff', 0.35)} 0%, ${tone} 55%, ${mixHex(tone, '#000000', 0.08)} 100%)`;
    const liner = `${linerPattern(colors.gold)}, radial-gradient(ellipse at 50% 30%, ${mixHex(colors.liner, '#ffffff', 0.08)}, ${colors.liner} 70%)`;
    const goldInk = foilInk(colors.gold);
    const rule: CSSProperties = { background: colors.gold };
    const headline = t(data.invitation.content.headline);
    // Flap halves: the upper part (to the fold) and the tip (fold to point).
    const left = `${String((FOLD / TIP) * 50)}%`;
    const right = `${String(100 - (FOLD / TIP) * 50)}%`;
    const flapTop = `polygon(0 0, 100% 0, ${right} 100%, ${left} 100%)`;
    const flapTipShape = `polygon(${left} 0, ${right} 0, 50% 100%)`;

    return (
        <div
            className="inv-root fixed inset-0 z-50 touch-none overflow-hidden select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
            style={stageBg}
            data-opening
        >
            <StageTitle
                titleRef={(el) => {
                    parts.current.title = el;
                }}
            />
            <div
                ref={(el) => {
                    parts.current.camera = el;
                }}
                className="absolute inset-0 origin-[50%_42%] [perspective:1200px]"
            >
                <div
                    ref={(el) => {
                        parts.current.envelope = el;
                    }}
                    style={envelope}
                    data-sealed-letter
                >
                    {/* Shadow of the envelope on the table. */}
                    <div
                        style={plane({
                            inset: '-6% -5% -10%',
                            background:
                                'radial-gradient(ellipse at 50% 58%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 72%)',
                            transform: 'translateZ(-2px)',
                        })}
                    />
                    {/* Inside back: the liner, seen once the flap is open. */}
                    <div
                        style={plane({
                            inset: 0,
                            backgroundImage: liner,
                            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.55)',
                            borderRadius: 3,
                        })}
                    />
                    {/* The card, with a sheet of vellum over it. */}
                    <div
                        ref={(el) => {
                            parts.current.card = el;
                        }}
                        style={plane({
                            left: '6%',
                            right: '6%',
                            top: '7%',
                            height: '88%',
                            transform: 'translateZ(2px)',
                            backgroundImage: `${paperGrain}, linear-gradient(165deg, #fffdf8, #f2e9d8)`,
                            boxShadow:
                                '0 1px 0 rgba(255,255,255,0.9) inset, 0 -6px 18px rgba(0,0,0,0.25)',
                            backfaceVisibility: 'visible',
                            ...deckled(data.invitation.seed),
                        })}
                        className="flex flex-col items-center justify-start overflow-hidden pt-[7%] text-center"
                    >
                        <div
                            className="absolute inset-[4%] rounded-[1px]"
                            style={{ border: `1px solid ${colors.gold}99` }}
                        />
                        <div
                            className="flex size-[calc(var(--w)*0.13)] items-center justify-center rounded-full"
                            style={{ border: `1px solid ${colors.gold}` }}
                        >
                            <span
                                className="inv-display text-[calc(var(--w)*0.05)] leading-none"
                                style={goldInk}
                            >
                                {names.initials.join('')}
                            </span>
                        </div>
                        {headline && (
                            <p className="mt-[4%] line-clamp-2 max-w-[80%] text-[calc(var(--w)*0.024)] leading-snug tracking-[0.12em] text-[#7b6650] uppercase">
                                {headline}
                            </p>
                        )}
                        <p className="inv-display mt-[3%] max-w-[86%] text-[calc(var(--w)*0.07)] leading-tight text-[#3a2a1f]">
                            {names.title}
                        </p>
                        <span className="my-[3%] h-px w-1/4" style={rule} />
                        {facts.dateText && (
                            <p className="max-w-[80%] text-[calc(var(--w)*0.024)] tracking-[0.16em] text-balance text-[#7b6650] uppercase">
                                {facts.dateText}
                            </p>
                        )}
                        {/* Vellum: translucent, faintly printed, lifting off to reveal the card. */}
                        <div
                            ref={(el) => {
                                parts.current.vellum = el;
                            }}
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `${linerPattern(colors.gold)}, linear-gradient(160deg, rgba(255,255,255,0.5), rgba(248,244,236,0.35))`,
                                backgroundSize: '18px 18px, auto',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                            }}
                        />
                    </div>
                    {/* The pocket: side flaps, then the bottom flap folded over them. */}
                    <div
                        style={plane({
                            inset: 0,
                            transform: 'translateZ(4px)',
                            clipPath: 'polygon(0 0, 50% 56%, 0 100%)',
                            backgroundImage: paperFace(colors.paperShade, 90),
                        })}
                    />
                    <div
                        style={plane({
                            inset: 0,
                            transform: 'translateZ(4px)',
                            clipPath: 'polygon(100% 0, 50% 56%, 100% 100%)',
                            backgroundImage: paperFace(colors.paperShade, 270),
                        })}
                    />
                    <div
                        style={plane({
                            inset: 0,
                            transform: 'translateZ(4.5px)',
                            clipPath: 'polygon(0 100%, 50% 47%, 100% 100%)',
                            backgroundImage: paperFace(colors.paper, 180),
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
                        })}
                    />
                    {/* The flap's shadow on the pocket. */}
                    <div
                        style={plane({
                            inset: 0,
                            transform: 'translateZ(5px)',
                            clipPath: `polygon(0 0, 100% 0, 50% ${String(TIP * 100 + 3)}%)`,
                            background:
                                'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.18))',
                            opacity: 0.9,
                        })}
                    />
                    {/* The flap, hinged along the top edge, folding as it lifts. */}
                    <div
                        ref={(el) => {
                            parts.current.flap = el;
                        }}
                        style={{
                            ...preserve,
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: `${String(FOLD * 100)}%`,
                            transformOrigin: '50% 0',
                            transform: 'translateZ(6px)',
                        }}
                    >
                        <div
                            style={plane({
                                inset: 0,
                                clipPath: flapTop,
                                backgroundImage: paperFace(colors.paper, 175),
                            })}
                        />
                        <div
                            style={plane({
                                inset: 0,
                                clipPath: flapTop,
                                transform: 'rotateY(180deg)',
                                backgroundImage: liner,
                            })}
                        />
                        <div
                            ref={(el) => {
                                parts.current.flapTip = el;
                            }}
                            style={{
                                ...preserve,
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: '100%',
                                height: `${String(((TIP - FOLD) / FOLD) * 100)}%`,
                                transformOrigin: '50% 0',
                            }}
                        >
                            <div
                                style={plane({
                                    inset: 0,
                                    clipPath: flapTipShape,
                                    backgroundImage: paperFace(colors.paper, 175),
                                })}
                            />
                            <div
                                style={plane({
                                    inset: 0,
                                    clipPath: flapTipShape,
                                    transform: 'rotateY(180deg)',
                                    backgroundImage: liner,
                                })}
                            />
                        </div>
                    </div>
                    {/* The seal over the flap's tip. */}
                    <div
                        className="absolute inset-x-0 mx-auto w-[calc(var(--w)*0.3)]"
                        style={{
                            top: `calc(var(--h) * ${String(TIP)} - var(--w) * 0.155)`,
                            transform: 'translateZ(9px)',
                        }}
                    >
                        <WaxSeal
                            seed={data.invitation.seed}
                            wax={colors.wax}
                            initials={names.initials.join('')}
                            className="w-full"
                            handleRef={adoptSeal}
                        />
                    </div>
                </div>
            </div>
            <HandoffVeil
                veilRef={(el) => {
                    parts.current.veil = el;
                }}
            />
            {/* The whole stage takes the press, so a thumb anywhere near the seal works. */}
            <div
                role="button"
                tabIndex={0}
                aria-label={copy('pressSeal')}
                className="absolute inset-0 z-30 cursor-pointer outline-none"
                onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    void press();
                }}
                onPointerUp={() => {
                    void release();
                }}
                onPointerCancel={() => {
                    void release();
                }}
                onKeyDown={onKeyDown}
            />
            <StagePrompt visible={stage === 'sealed'}>{copy('pressSeal')}</StagePrompt>
        </div>
    );
}
