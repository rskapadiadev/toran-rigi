// The jewellery box: a lacquered presentation case resting on a dark table under a spotlight.
// The guest lifts the hinged lid with a finger (or taps and it opens by itself); warm light spills
// from the velvet, the invitation card rises out of its slot and turns to face them, and the
// camera moves in until the card becomes the invitation. Built as a real 3D object in CSS
// (perspective, preserve-3d faces) and timed with GSAP: no WebGL, nothing heavy on first paint.
import { mixHex } from '@shared/materials';
import {
    type CSSProperties,
    type KeyboardEvent,
    type PointerEvent,
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

// The lid's resting angle when fully open, and how far a finger must lift it to count.
const OPEN_ANGLE = 106;
const COMMIT_ANGLE = 28;
// Pixels of upward drag that lift the lid all the way.
const DRAG_RANGE = 170;

// Velvet and lacquer grain, rendered once by the browser and tiled; paper gets a far finer one.
const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const paperGrain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

interface Palette {
    lacquer: string;
    lacquerLight: string;
    lacquerDark: string;
    velvet: string;
    velvetLight: string;
    gold: string;
    table: string;
}

function usePalette(): Palette {
    const { data } = useInvite();
    const { primary, gold } = data.invitation.design.palette;
    return useMemo(
        () => ({
            lacquer: mixHex(primary, '#000000', 0.32),
            lacquerLight: mixHex(primary, '#ffffff', 0.12),
            lacquerDark: mixHex(primary, '#000000', 0.62),
            velvet: mixHex(primary, '#000000', 0.5),
            velvetLight: mixHex(primary, '#000000', 0.18),
            gold,
            table: mixHex(primary, '#0b0706', 0.86),
        }),
        [primary, gold],
    );
}

// Every face of the box is one absolutely placed plane in the box's 3D space.
const plane = (style: CSSProperties): CSSProperties => ({
    position: 'absolute',
    backfaceVisibility: 'hidden',
    ...style,
});

const foil = (gold: string) =>
    `linear-gradient(115deg, ${mixHex(gold, '#000000', 0.45)} 0%, ${gold} 28%, ${mixHex(gold, '#ffffff', 0.7)} 48%, ${gold} 62%, ${mixHex(gold, '#000000', 0.4)} 100%)`;

interface Parts {
    lid: HTMLDivElement | null;
    card: HTMLDivElement | null;
    glow: HTMLDivElement | null;
    rays: HTMLDivElement | null;
    camera: HTMLDivElement | null;
    veil: HTMLDivElement | null;
    title: HTMLDivElement | null;
}

interface DragStart {
    y: number;
    moved: boolean;
}

interface Pose {
    // Lid angle in degrees, 0 closed.
    lid: number;
    // 0 → 1: the card rising out of the box and turning to the guest.
    rise: number;
    // 0 → 1: the camera moving in until the card fills the screen.
    push: number;
}

// Writes a pose straight onto the elements: the drag and the timeline run at 60fps without React.
function applyPose(parts: Parts, pose: Pose) {
    const light = Math.min(1, pose.lid / OPEN_ANGLE);
    if (parts.lid)
        parts.lid.style.transform = `translateZ(var(--h)) rotateX(${String(pose.lid)}deg)`;
    if (parts.glow) parts.glow.style.opacity = String(light);
    // The names above the box make way for the card, which carries them.
    if (parts.title) parts.title.style.opacity = String(Math.max(0, 1 - light * 1.4));
    if (parts.rays) parts.rays.style.opacity = String(light * (1 - pose.push) * 0.85);
    if (parts.card)
        parts.card.style.transform = `translateZ(calc(var(--h) * 0.42 + ${String(pose.rise)} * var(--w) * 0.5)) translateY(${String(pose.rise * -4)}%) rotateX(${String(pose.rise * -58)}deg) scale(${String(1 + pose.rise * 0.22)})`;
    // A gentle dolly-in only: scaling 3D layers further makes the browser upscale their bitmaps.
    if (parts.camera)
        parts.camera.style.transform = `scale(${String(1 + pose.push * 0.32)}) translateY(${String(pose.push * 3)}%)`;
    if (parts.veil) parts.veil.style.opacity = String(Math.max(0, (pose.push - 0.3) / 0.7));
}

export function JewelleryBoxOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy, names } = useInvite();
    const facts = useCoverFacts();
    const colors = usePalette();
    const finish = useFinish(onOpened);
    const [stage, setStage] = useState<'closed' | 'lifting' | 'opening'>('closed');
    const parts = useRef<Parts>({
        lid: null,
        card: null,
        glow: null,
        rays: null,
        camera: null,
        veil: null,
        title: null,
    });
    const pose = useRef<Pose>({
        lid: 0,
        rise: 0,
        push: 0,
    });
    const drag = useRef<DragStart | null>(null);
    const begun = useRef(false);
    const still = tier === 'static';

    // Fetch GSAP while the guest admires the closed box, so the first lift never waits on it.
    useEffect(() => {
        if (!still) void loadGsap();
    }, [still]);

    const begin = () => {
        if (begun.current) return;
        begun.current = true;
        onBegin();
    };

    const open = useCallback(async () => {
        if (stage === 'opening') return;
        setStage('opening');
        if (still) {
            finish(250);
            return;
        }
        const gsap = await loadGsap();
        const p = pose.current;
        const apply = () => {
            applyPose(parts.current, p);
        };
        const timeline = gsap.timeline();
        // The hinge swings past open and settles back, the way a weighted lid does.
        timeline.to(p, {
            lid: OPEN_ANGLE,
            duration: 1.1,
            ease: 'back.out(1.5)',
            onUpdate: apply,
        });
        timeline.to(
            p,
            {
                rise: 1,
                duration: 1.35,
                ease: 'power2.inOut',
                onUpdate: apply,
            },
            0.6,
        );
        timeline.to(
            p,
            {
                push: 1,
                duration: 1.05,
                ease: 'power3.in',
                onUpdate: apply,
            },
            1.85,
        );
        finish(2950);
    }, [finish, stage, still]);

    const settleBack = async () => {
        const gsap = await loadGsap();
        const p = pose.current;
        gsap.to(p, {
            lid: 0,
            duration: 0.55,
            ease: 'bounce.out',
            onUpdate: () => {
                applyPose(parts.current, p);
            },
        });
        setStage('closed');
    };

    const handlers = {
        onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
            if (stage === 'opening') return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = {
                y: e.clientY,
                moved: false,
            };
            begin();
        },
        onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
            const d = drag.current;
            if (!d || stage === 'opening') return;
            const lift = d.y - e.clientY;
            if (Math.abs(lift) > 6) d.moved = true;
            if (!d.moved) return;
            if (stage !== 'lifting') setStage('lifting');
            // The lid follows the finger, stiffening as it nears fully open.
            const raw = Math.max(0, lift) / DRAG_RANGE;
            const angle = OPEN_ANGLE * (raw < 1 ? raw : 1 + (raw - 1) * 0.08);
            pose.current.lid = Math.min(angle, OPEN_ANGLE + 6);
            applyPose(parts.current, pose.current);
        },
        onPointerUp: () => {
            const d = drag.current;
            drag.current = null;
            if (!d || stage === 'opening') return;
            if (!d.moved || pose.current.lid >= COMMIT_ANGLE) void open();
            else void settleBack();
        },
        onPointerCancel: () => {
            drag.current = null;
            if (stage === 'lifting') void settleBack();
        },
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            begin();
            void open();
        },
    };

    const box: CSSProperties & Record<'--w' | '--d' | '--h' | '--lh', string> = {
        '--w': 'min(76cqw, 26rem)',
        '--d': 'calc(var(--w) * 0.68)',
        '--h': 'calc(var(--w) * 0.2)',
        '--lh': 'calc(var(--w) * 0.075)',
        position: 'absolute',
        left: '50%',
        top: '57%',
        width: 'var(--w)',
        height: 'var(--d)',
        transformStyle: 'preserve-3d',
        transform: 'translate(-50%, -50%) rotateX(58deg)',
    };
    const preserve: CSSProperties = { transformStyle: 'preserve-3d' };
    const spotlight = `radial-gradient(ellipse 62% 46% at 50% 58%, ${mixHex(colors.gold, colors.table, 0.82)} 0%, ${colors.table} 62%, #050303 100%)`;
    const stageBg: CSSProperties = { background: spotlight };
    const lacquerFace = `linear-gradient(118deg, transparent 32%, rgba(255,255,255,0.16) 40%, transparent 48%), ${grain}, linear-gradient(160deg, ${colors.lacquerLight} 0%, ${colors.lacquer} 46%, ${colors.lacquerDark} 100%)`;
    const lacquerTop: CSSProperties = { backgroundImage: lacquerFace };
    const velvet = `${grain}, radial-gradient(ellipse at 50% 40%, ${colors.velvetLight} 0%, ${colors.velvet} 70%)`;
    const satin = `linear-gradient(170deg, transparent 20%, rgba(255,255,255,0.55) 34%, transparent 46%), linear-gradient(165deg, #fbf6ec 0%, #efe4cf 55%, #dccbaa 100%)`;
    const gold = foil(colors.gold);
    const ray = (alpha: string) => `${mixHex(colors.gold, '#ffffff', 0.65)}${alpha}`;
    // Shafts of light fanning upward out of the open box.
    const rays = `conic-gradient(from 0deg at 50% 100%, transparent 0deg, ${ray('50')} 8deg, transparent 15deg, ${ray('38')} 24deg, transparent 34deg, transparent 326deg, ${ray('38')} 336deg, transparent 345deg, ${ray('50')} 352deg, transparent 360deg)`;
    const tabSatin = `linear-gradient(90deg, ${colors.gold}, ${mixHex(colors.gold, '#ffffff', 0.55)} 50%, ${colors.gold})`;
    const tab: CSSProperties = { background: tabSatin };
    const prompt = stage === 'closed';
    const foilInk: CSSProperties = {
        backgroundImage: gold,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
    };
    const rule: CSSProperties = { background: colors.gold };
    const crestRing: CSSProperties = { border: `1px solid ${colors.gold}` };
    const crestInk: CSSProperties = { color: mixHex(colors.gold, '#000000', 0.2) };

    return (
        <div
            className="inv-root fixed inset-0 z-50 touch-none overflow-hidden select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
            style={stageBg}
            data-opening
        >
            {/* The couple's names above the box, in foil, no frame. */}
            <div
                ref={(el) => {
                    parts.current.title = el;
                }}
                className="pointer-events-none absolute inset-x-0 top-[11svh] z-20 flex flex-col items-center px-6 text-center text-[#f4ead6]"
            >
                {facts.guest && (
                    <p className="mb-3 text-[11px] tracking-[0.4em] uppercase opacity-70">
                        {copy('dearGuest')} {facts.guest.name}
                    </p>
                )}
                <h1 className="inv-display text-[clamp(2rem,7.5cqw,3.6rem)] leading-none">
                    <span className="foil-text">{names.one}</span>
                    {names.two && (
                        <>
                            <span className="inv-script mx-3 text-[0.8em] opacity-80">
                                {copy('and')}
                            </span>
                            <span className="foil-text">{names.two}</span>
                        </>
                    )}
                </h1>
                {facts.dateText && (
                    <p className="mt-4 text-[11px] tracking-[0.45em] uppercase opacity-60">
                        {facts.dateText}
                    </p>
                )}
            </div>

            <div
                ref={(el) => {
                    parts.current.camera = el;
                }}
                className="absolute inset-0 origin-[50%_44%] [perspective:1100px]"
            >
                {/* Light pouring out of the opened box. */}
                <div
                    ref={(el) => {
                        parts.current.rays = el;
                    }}
                    className="pointer-events-none absolute inset-x-[-25%] top-[6%] h-[52%]"
                    style={{
                        opacity: 0,
                        background: rays,
                        maskImage:
                            'radial-gradient(ellipse 46% 100% at 50% 100%, #000 25%, transparent 80%)',
                    }}
                />

                <div style={box} data-jewellery-box>
                    {/* Shadow pooled on the table. */}
                    <div
                        style={plane({
                            inset: '-14% -12%',
                            background:
                                'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)',
                            transform: 'translateZ(-1px)',
                        })}
                    />
                    {/* Inner walls: ivory satin lining. */}
                    <div
                        style={plane({
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: 'var(--h)',
                            transformOrigin: 'top',
                            transform: 'translateZ(var(--h)) rotateX(-90deg)',
                            background: satin,
                        })}
                    />
                    <div
                        style={plane({
                            left: 0,
                            top: 0,
                            width: 'var(--h)',
                            height: '100%',
                            transformOrigin: 'left',
                            transform: 'translateZ(var(--h)) rotateY(90deg)',
                            background: satin,
                            filter: 'brightness(0.86)',
                        })}
                    />
                    <div
                        style={plane({
                            right: 0,
                            top: 0,
                            width: 'var(--h)',
                            height: '100%',
                            transformOrigin: 'right',
                            transform: 'translateZ(var(--h)) rotateY(-90deg)',
                            background: satin,
                            filter: 'brightness(0.92)',
                        })}
                    />
                    {/* The velvet tray, raised inside, with a slit cradling the card. */}
                    <div
                        style={plane({
                            inset: '5%',
                            transform: 'translateZ(calc(var(--h) * 0.4))',
                            backgroundImage: velvet,
                            boxShadow: 'inset 0 0 18px rgba(0,0,0,0.65)',
                        })}
                    />
                    <div
                        style={plane({
                            left: '17%',
                            right: '17%',
                            top: '49%',
                            height: '4%',
                            transform: 'translateZ(calc(var(--h) * 0.41))',
                            background: 'linear-gradient(#000000cc, #00000033)',
                            borderRadius: '40%',
                        })}
                    />
                    {/* Warm light from inside. */}
                    <div
                        ref={(el) => {
                            parts.current.glow = el;
                        }}
                        style={plane({
                            inset: '-10%',
                            opacity: 0,
                            transform: 'translateZ(calc(var(--h) * 0.45))',
                            background: `radial-gradient(ellipse at 50% 50%, ${mixHex(colors.gold, '#ffffff', 0.75)}cc 0%, ${colors.gold}55 35%, transparent 65%)`,
                        })}
                    />
                    {/* The invitation card, resting in its slot until it rises. */}
                    <div
                        ref={(el) => {
                            parts.current.card = el;
                        }}
                        style={plane({
                            left: '19%',
                            right: '19%',
                            top: '16%',
                            bottom: '22%',
                            transformOrigin: '50% 100%',
                            transform: 'translateZ(calc(var(--h) * 0.42))',
                            backgroundImage: `${paperGrain}, linear-gradient(160deg, #fffdf7, #f3ead8)`,
                            boxShadow:
                                '0 1px 0 rgba(255,255,255,0.8) inset, 0 12px 30px rgba(0,0,0,0.45)',
                            borderRadius: 2,
                        })}
                        className="flex flex-col items-center justify-center text-center"
                    >
                        <div
                            className="absolute inset-[6%] rounded-[1px]"
                            style={{ border: `1px solid ${colors.gold}` }}
                        />
                        <p
                            className="inv-display text-[calc(var(--w)*0.09)] leading-none"
                            style={foilInk}
                        >
                            {names.initials.join(' · ')}
                        </p>
                        <span className="my-[5%] h-px w-1/3" style={rule} />
                        <p className="inv-display max-w-[86%] text-[calc(var(--w)*0.052)] leading-tight text-[#3f2f22]">
                            {names.title}
                        </p>
                        {facts.dateText && (
                            <p className="mt-[5%] max-w-[80%] text-[calc(var(--w)*0.024)] leading-relaxed tracking-[0.16em] text-balance text-[#8a7458] uppercase">
                                {facts.dateText}
                            </p>
                        )}
                    </div>

                    {/* Front wall: lacquer with a gold clasp. */}
                    <div
                        style={plane({
                            left: 0,
                            top: '100%',
                            width: '100%',
                            height: 'var(--h)',
                            transformOrigin: 'top',
                            transform: 'translateZ(var(--h)) rotateX(-90deg)',
                            backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.1), transparent 40%), ${grain}, linear-gradient(90deg, ${colors.lacquerDark}, ${colors.lacquer} 30%, ${colors.lacquerLight} 52%, ${colors.lacquer} 74%, ${colors.lacquerDark})`,
                        })}
                    >
                        <div
                            className="absolute inset-x-[4%] top-[14%] h-px"
                            style={{ background: colors.gold }}
                        />
                        <div
                            className="absolute inset-x-0 top-[22%] mx-auto h-[46%] w-[10%] rounded-[3px]"
                            style={{
                                backgroundImage: gold,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            }}
                        >
                            <span className="absolute inset-x-0 top-[38%] mx-auto size-[18%] rounded-full bg-black/60" />
                        </div>
                    </div>
                    {/* Top rim around the opening. */}
                    <div
                        style={plane({
                            inset: 0,
                            transform: 'translateZ(var(--h))',
                            border: 'calc(var(--w) * 0.035) solid transparent',
                            borderImage: `linear-gradient(160deg, ${colors.lacquerLight}, ${colors.lacquerDark}) 1`,
                        })}
                    />

                    {/* The lid, hinged along the back edge. */}
                    <div
                        ref={(el) => {
                            parts.current.lid = el;
                        }}
                        style={{
                            ...preserve,
                            position: 'absolute',
                            inset: 0,
                            transformOrigin: '50% 0',
                            transform: 'translateZ(var(--h)) rotateX(0deg)',
                        }}
                    >
                        {/* Underside: ivory satin with the couple's crest, like a jeweller's mark. */}
                        <div
                            style={plane({
                                inset: 0,
                                transform: 'rotateX(180deg)',
                                background: satin,
                                boxShadow: 'inset 0 0 22px rgba(120,90,40,0.35)',
                            })}
                            className="flex flex-col items-center justify-center"
                        >
                            <div
                                className="flex size-[calc(var(--w)*0.2)] items-center justify-center rounded-full"
                                style={crestRing}
                            >
                                <span
                                    className="inv-display text-[calc(var(--w)*0.075)] leading-none"
                                    style={crestInk}
                                >
                                    {names.initials.join('')}
                                </span>
                            </div>
                        </div>
                        {/* Front skirt, with a satin pull tab. */}
                        <div
                            style={plane({
                                left: 0,
                                top: '100%',
                                width: '100%',
                                height: 'var(--lh)',
                                transformOrigin: 'top',
                                transform: 'translateZ(var(--lh)) rotateX(-90deg)',
                                backgroundImage: `${grain}, linear-gradient(90deg, ${colors.lacquerDark}, ${colors.lacquer} 30%, ${colors.lacquerLight} 52%, ${colors.lacquer} 74%, ${colors.lacquerDark})`,
                            })}
                        >
                            <div
                                className="absolute inset-x-0 bottom-[-130%] mx-auto h-[150%] w-[9%] rounded-b-[3px]"
                                style={tab}
                            />
                        </div>
                        {/* Top: lacquer, a fine gold inlay and the embossed monogram. */}
                        <div
                            style={plane({
                                inset: 0,
                                transform: 'translateZ(var(--lh))',
                                ...lacquerTop,
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                            })}
                            className="flex items-center justify-center"
                        >
                            <div
                                className="absolute inset-[7%] rounded-[2px]"
                                style={{ border: `1px solid ${colors.gold}aa` }}
                            />
                            <div
                                className="absolute inset-[9.5%] rounded-[1px]"
                                style={{ border: `1px solid ${colors.gold}55` }}
                            />
                            <p
                                className="inv-display text-[calc(var(--w)*0.15)] leading-none"
                                style={{
                                    backgroundImage: gold,
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.25)) drop-shadow(0 -1px 0 rgba(0,0,0,0.5))',
                                }}
                            >
                                {names.initials.join('')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* The camera ends on the invitation's own colour, so the hand-off is seamless. */}
            <div
                ref={(el) => {
                    parts.current.veil = el;
                }}
                className="pointer-events-none absolute inset-0 z-40 bg-(--inv-bg) opacity-0"
            />

            {/* The whole stage takes the gesture: lift anywhere, or tap. */}
            <div
                role="button"
                tabIndex={0}
                aria-label={copy('liftLid')}
                className="absolute inset-0 z-30 cursor-grab outline-none active:cursor-grabbing"
                {...handlers}
            />
            <p
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 bottom-[9svh] z-30 mx-auto flex w-fit flex-col items-center gap-2 text-[11px] tracking-[0.4em] text-[#f4ead6]/80 uppercase transition-opacity duration-500 ${prompt ? 'opacity-100' : 'opacity-0'}`}
            >
                <span className="h-8 w-px animate-pulse bg-gradient-to-t from-transparent to-[#f4ead6]/80 motion-reduce:animate-none" />
                {copy('liftLid')}
            </p>
        </div>
    );
}
