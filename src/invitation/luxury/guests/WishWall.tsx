// "Wishes wall": the guests' blessings pinned up on a linen board like handwritten notes. Cotton,
// kraft and blush papers of slightly different sizes, each a little askew under a brass pin or a
// strip of washi tape, the name signed in script. The notes pin in one by one as the wall comes
// into view, then sway on their pins. Double-tap a note (or press its heart) to send love.
import { fonts, fontStack } from '@shared/fonts';
import { materialBackground, mixHex } from '@shared/materials';
import { m } from 'motion/react';
import { type CSSProperties, useMemo, useState } from 'react';

import { Reveal } from '../../../motion/Reveal';
import { useInvite } from '../../context';
import { HeartBurst, HeartIcon, useDoubleTap, useHearts } from '../../hearts';
import { usePrint } from '../../print';
import { WishForm } from '../../sections/Extras';
import type { PublicWishData } from '../../types';
import { cottonGrain, deckled, paperGrain } from '../materials';
import { Flourish } from '../typography/ornaments';
import { SectionTitle, useScriptTitles } from '../typography/SectionTitle';

type Hearts = ReturnType<typeof useHearts>;

// The three stocks a guest might have written on.
type PaperKind = 'cotton' | 'kraft' | 'blush';
const papers: PaperKind[] = ['cotton', 'kraft', 'blush'];

interface Paper {
    face: string;
    ink: string;
    grain: string;
}

const paperOf: Record<PaperKind, Paper> = {
    cotton: {
        face: '#fbf6ec',
        ink: '#3b2a20',
        grain: cottonGrain,
    },
    kraft: {
        face: '#cfae84',
        ink: '#3a2414',
        grain: cottonGrain,
    },
    blush: {
        face: '#f6dfd8',
        ink: '#4a2830',
        grain: paperGrain,
    },
};

// A note's character, drawn once from its id so it hangs the same way on every visit.
interface Hang {
    tilt: number;
    paper: PaperKind;
    tape: boolean;
    // Inline inset (as % of the column) so notes come out slightly different widths.
    inset: number;
    tall: boolean;
    deckle: boolean;
    sway: number;
    seed: number;
}

function hangFor(id: string): Hang {
    let h = 2166136261;
    for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    let s = (h >>> 0) % 2147483647 || 1;
    const rand = () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
    return {
        tilt: (rand() - 0.5) * 8,
        paper: papers[Math.floor(rand() * papers.length)] ?? 'cotton',
        tape: rand() < 0.45,
        inset: rand() * 9,
        tall: rand() < 0.35,
        deckle: rand() < 0.5,
        sway: 5 + rand() * 4,
        seed: s,
    };
}

// The sway lives in CSS so it runs on the compositor; Motion only handles the pin-in.
const swayKeyframes = `@keyframes inv-wish-sway{0%,100%{transform:rotate(-0.7deg)}50%{transform:rotate(0.7deg)}}`;

// The note's own shadow, lifted a little off the board.
const lift = '0 14px 22px -12px rgba(30,15,5,0.55), 0 2px 5px rgba(30,15,5,0.18)';

// Every note is written in the same pen, a soft italic serif, whatever the invitation's display face.
const pen: CSSProperties = { fontFamily: fontStack('cormorant') };
const signature = `${fonts.pinyon}, var(--inv-display)`;

function BrassPin() {
    const head: CSSProperties = {
        background:
            'radial-gradient(circle at 35% 30%, #fff6d8 0%, #e2b45a 28%, #a87423 62%, #5a3a10 100%)',
        boxShadow: '0 2px 3px rgba(0,0,0,0.35), 1px 5px 6px -2px rgba(0,0,0,0.3)',
    };
    return (
        <span
            aria-hidden
            className="absolute inset-x-0 top-2 z-10 mx-auto size-3.5 rounded-full"
            style={head}
        />
    );
}

interface TapeProps {
    tone: string;
    lean: number;
}

// A strip of washi tape: translucent, faintly striped, its ends torn into a zigzag.
function Washi({ tone, lean }: TapeProps) {
    const strip: CSSProperties = {
        backgroundColor: `${tone}b8`,
        backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 4px, transparent 4px 9px)',
        clipPath:
            'polygon(3% 0, 97% 0, 100% 20%, 97% 40%, 100% 60%, 97% 80%, 100% 100%, 3% 100%, 0 80%, 3% 60%, 0 40%, 3% 20%)',
        transform: `rotate(${String(lean)}deg)`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
    };
    return (
        <span
            aria-hidden
            className="absolute inset-x-0 -top-2.5 z-10 mx-auto h-5 w-[42%] min-w-16"
            style={strip}
        />
    );
}

interface NoteProps {
    wish: PublicWishData;
    hearts: Hearts;
    index: number;
    still: boolean;
}

function Note({ wish, hearts, index, still }: NoteProps) {
    const { data, copy, dir } = useInvite();
    const { palette } = data.invitation.design;
    const hang = useMemo(() => hangFor(wish.id), [wish.id]);
    const paper = paperOf[hang.paper];
    const target = `wish:${wish.id}`;
    const [burst, setBurst] = useState(0);
    const love = () => {
        setBurst((b) => b + 1);
        void hearts.send(target);
    };
    const tap = useDoubleTap(love);
    const liked = hearts.isLiked(target);
    const count = hearts.count(target);
    // Mirror the lean in right-to-left scripts so the wall reads naturally.
    const tilt = dir === 'rtl' ? -hang.tilt : hang.tilt;

    const slot: CSSProperties = {
        paddingInlineStart: `${String(hang.inset)}%`,
        paddingInlineEnd: `${String(9 - hang.inset)}%`,
    };
    const hidden = {
        opacity: 0,
        y: -26,
        scale: 1.08,
        rotate: tilt + (tilt > 0 ? 7 : -7),
    };
    const pinned = {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: tilt,
    };
    const settle = {
        type: 'spring' as const,
        stiffness: 210,
        damping: 17,
        mass: 0.9,
        delay: (index % 4) * 0.09,
    };
    const once = {
        once: true,
        amount: 0.35,
    };
    const swing: CSSProperties = {
        transformOrigin: '50% 0.5rem',
        animation: still
            ? undefined
            : `inv-wish-sway ${hang.sway.toFixed(2)}s ease-in-out ${(-hang.sway * (hang.seed % 100) * 0.01).toFixed(2)}s infinite`,
    };
    const face: CSSProperties = {
        backgroundColor: paper.face,
        backgroundImage: `${paper.grain}, linear-gradient(160deg, rgba(255,255,255,0.35), transparent 45%, rgba(0,0,0,0.05))`,
        color: paper.ink,
        ...(hang.deckle ? deckled(hang.seed) : {}),
    };
    const shadow: CSSProperties = { boxShadow: lift };
    // Designs without a script face still sign in a pen hand; other scripts fall back to the display.
    const sign: CSSProperties = {
        color: mixHex(palette.primary, paper.ink, 0.35),
        fontFamily: data.invitation.design.fonts.script ? undefined : signature,
    };
    const tape = mixHex(hang.paper === 'kraft' ? palette.primary : palette.gold, '#ffffff', 0.15);

    return (
        <div className="mb-7 break-inside-avoid pt-3" style={slot}>
            <m.figure
                className="relative m-0"
                initial={still ? false : hidden}
                whileInView={pinned}
                animate={still ? pinned : undefined}
                viewport={once}
                transition={settle}
            >
                <div
                    className="relative touch-manipulation select-none motion-reduce:animate-none!"
                    style={swing}
                    onPointerUp={hearts.enabled ? tap : undefined}
                >
                    {/* The shadow sits behind the paper so a deckled edge cannot clip it. */}
                    <span aria-hidden className="absolute inset-1 rounded-[3px]" style={shadow} />
                    <div
                        className={`relative rounded-[3px] px-[clamp(0.9rem,4cqw,1.4rem)] ${hang.tall ? 'pt-9 pb-6' : 'pt-7 pb-4'}`}
                        style={face}
                    >
                        <blockquote
                            className="text-[clamp(1.05rem,4.4cqw,1.3rem)] leading-[1.35] font-medium italic"
                            style={pen}
                            dir="auto"
                        >
                            {wish.message}
                        </blockquote>
                        <figcaption className="mt-4 flex items-end justify-between gap-2">
                            <span
                                className="inv-script text-[clamp(1.25rem,5.4cqw,1.6rem)] leading-none"
                                style={sign}
                                dir="auto"
                            >
                                {wish.name}
                            </span>
                            {hearts.enabled && (
                                <button
                                    type="button"
                                    aria-label={copy('sendLove')}
                                    aria-pressed={liked}
                                    onPointerUp={(e) => {
                                        e.stopPropagation();
                                    }}
                                    onClick={love}
                                    className="-me-1.5 -mb-1 inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-1 text-xs tabular-nums opacity-75 transition hover:bg-black/5 hover:opacity-100"
                                >
                                    <HeartIcon
                                        filled={liked}
                                        className={`size-4 ${liked ? 'text-[#c8344f]' : ''}`}
                                    />
                                    {count > 0 && count}
                                </button>
                            )}
                        </figcaption>
                    </div>
                    {hang.tape ? <Washi tone={tape} lean={-tilt * 1.4} /> : <BrassPin />}
                    <HeartBurst burst={burst} />
                </div>
            </m.figure>
        </div>
    );
}

export function WishWall() {
    const { data, copy, tier } = useInvite();
    const script = useScriptTitles();
    const print = usePrint();
    const hearts = useHearts();
    const { palette } = data.invitation.design;
    const still = tier === 'static' || print;
    const board = useMemo(
        () =>
            materialBackground({
                kind: 'linen',
                base: mixHex(palette.surface, palette.primary, 0.12),
                seed: data.invitation.seed + 11,
            }),
        [palette.surface, palette.primary, data.invitation.seed],
    );
    if (data.invitation.extras.wishes?.enabled === false) return null;

    const wall: CSSProperties = {
        backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,250,240,0.16), transparent 70%), ${board}`,
        boxShadow: `inset 0 0 0 1px ${palette.gold}55, inset 0 0 60px rgba(0,0,0,0.22), 0 24px 50px -28px rgba(0,0,0,0.5)`,
    };
    const frame: CSSProperties = { borderColor: `${palette.gold}66` };

    return (
        <section className="@container px-4 py-20">
            <style>{swayKeyframes}</style>
            {script ? (
                <SectionTitle className="mb-8 text-center">{copy('wishesTitle')}</SectionTitle>
            ) : (
                <Reveal className="mb-8 text-center">
                    <h2 className="inv-display text-[clamp(1.8rem,5cqw,3rem)]">
                        {copy('wishesTitle')}
                    </h2>
                    <Flourish className="mx-auto mt-4 w-[min(48cqw,200px)]" />
                </Reveal>
            )}
            {data.wishes.length > 0 && (
                <div className="mx-auto mb-12 max-w-5xl rounded-md border p-1.5" style={frame}>
                    <div
                        className="columns-2 gap-x-3 rounded-[4px] px-3 pt-5 pb-1 @2xl:columns-3 @2xl:gap-x-6 @2xl:px-8 @5xl:columns-4"
                        style={wall}
                    >
                        {data.wishes.map((w, i) => (
                            <Note key={w.id} wish={w} hearts={hearts} index={i} still={still} />
                        ))}
                    </div>
                </div>
            )}
            <div className="mx-auto max-w-xl">
                <WishForm />
            </div>
        </section>
    );
}
