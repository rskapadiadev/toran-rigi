// "Two portraits": the couple introduced like a magazine feature. The screen is split down the
// middle: one portrait each, unveiled from opposite ends, their names set tall along the outer
// edges with a line of family beneath. Then the two halves part like doors onto a photograph of
// the two of them together, and their story is told over it. Scroll-driven, pinned full-screen.
// Without photos, each half is woven silk in the invitation's colours with the person's initial
// in foil, and the shared frame is their medallion.
import { materialBackground, mixHex } from '@shared/materials';
import { photoUrl, slotPhoto } from '@shared/photos';
import { m, type MotionValue, useMotionValue, useTransform } from 'motion/react';
import { type CSSProperties, type ReactNode, useMemo, useRef } from 'react';

import { GenerativeOrnament } from '../../../motion/GenerativeOrnament';
import { useInvite } from '../../context';
import { Editable, useEditing } from '../../editing';
import { usePrint } from '../../print';
import { useSectionScroll } from '../../scroll';
import { useCoverFacts } from '../../sections/covers';
import { foilInk } from '../materials';

export const PORTRAIT_ONE = 'story.one';
export const PORTRAIT_TWO = 'story.two';
export const PORTRAIT_TOGETHER = 'story.together';

// Woven silk behind each portrait, so cut-outs and the moment before the unveil sit on fabric.
function useSilk(tone: string, salt: number) {
    const { data } = useInvite();
    return useMemo(
        () =>
            materialBackground({
                kind: 'silk',
                base: tone,
                seed: data.invitation.seed + salt,
            }),
        [tone, data.invitation.seed, salt],
    );
}

interface PortraitProps {
    slot: string;
    initial: string;
    // Background silk when there is no photo.
    tone: string;
}

function Portrait({ slot, initial, tone }: PortraitProps) {
    const { data } = useInvite();
    const editing = useEditing();
    const key = slotPhoto(data.invitation.content, slot);
    const silk = useSilk(tone, slot === PORTRAIT_ONE ? 3 : 5);
    if (key)
        return (
            <img
                src={photoUrl(key)}
                alt=""
                data-photo-slot={slot}
                className="size-full object-cover object-top pt-[9%]"
                draggable={false}
            />
        );
    const panel: CSSProperties = { backgroundImage: silk };
    return (
        <div
            data-photo
            data-photo-slot={slot}
            className="flex size-full items-center justify-center"
            style={panel}
        >
            <span
                className="inv-display text-[clamp(5rem,30cqw,12rem)] leading-none"
                style={foilInk(data.invitation.design.palette.gold)}
            >
                {initial}
            </span>
            {editing && (
                <span className="absolute bottom-[20%] text-[10px] tracking-[0.35em] text-white/75 uppercase">
                    Photo · click to add
                </span>
            )}
        </div>
    );
}

interface NameplateProps {
    name: ReactNode;
    family: string;
    side: 'start' | 'end';
    style?: object;
}

// A name set tall along the outer edge, the family line in small caps beneath.
function Nameplate({ name, family, side, style }: NameplateProps) {
    const edge =
        side === 'start'
            ? 'start-0 items-start ps-[5cqw] text-start'
            : 'end-0 items-end pe-[5cqw] text-end';
    return (
        <m.div
            className={`absolute bottom-[calc(var(--inv-screen,100svh)*0.12)] z-20 flex max-w-[48%] flex-col text-[#fbf5ea] [text-shadow:0_2px_16px_rgba(0,0,0,0.55)] ${edge}`}
            style={style}
        >
            <p className="inv-display text-[clamp(2rem,10cqw,4.6rem)] leading-[0.9] font-semibold tracking-tight uppercase">
                {name}
            </p>
            {family && (
                <p className="mt-2 text-[clamp(0.55rem,2.3cqw,0.75rem)] leading-relaxed tracking-[0.25em] uppercase opacity-85">
                    {family}
                </p>
            )}
        </m.div>
    );
}

// 'story' tells their story over the photo; 'cover' (and the opening) introduces them instead.
export type PortraitsMode = 'story' | 'cover';

interface Motion {
    p: MotionValue<number>;
    mode: PortraitsMode;
}

function Together({ p, mode }: Motion) {
    const { data, t, copy, occasion } = useInvite();
    const facts = useCoverFacts();
    const key =
        slotPhoto(data.invitation.content, PORTRAIT_TOGETHER) ??
        data.invitation.content.coverPhotoKey;
    const { palette } = data.invitation.design;
    const night = mixHex(palette.primary, '#050303', 0.8);
    const drift = useTransform(p, [0.45, 1], [1.12, 1]);
    const story = t(data.invitation.content.story) || t(data.invitation.content.welcome);
    const storyIn = useTransform(p, [0.62, 0.76], [0, 1]);
    const storyY = useTransform(p, [0.62, 0.76], [24, 0]);
    const glow = `radial-gradient(ellipse 60% 50% at 50% 42%, ${mixHex(palette.primary, night, 0.3)} 0%, ${night} 75%)`;
    const field: CSSProperties = { background: glow };
    const picture = key ? (
        <m.img
            src={photoUrl(key)}
            alt=""
            data-photo-slot={PORTRAIT_TOGETHER}
            className="size-full object-cover"
            style={{ scale: drift }}
            draggable={false}
        />
    ) : (
        <div
            data-photo
            data-photo-slot={PORTRAIT_TOGETHER}
            className="flex size-full items-center justify-center"
            style={field}
        >
            <GenerativeOrnament
                kind={data.invitation.design.generative.kind}
                seed={data.invitation.seed}
                className="w-[110vmin] max-w-none opacity-60"
                draw={false}
            />
        </div>
    );
    const shade: CSSProperties = {
        background:
            'linear-gradient(180deg, transparent 0%, rgba(8,5,4,0.6) 50%, rgba(8,5,4,0.9) 100%)',
    };
    return (
        <div className="absolute inset-0">
            {picture}
            <m.div
                className="absolute inset-x-0 bottom-0 px-6 pt-[calc(var(--inv-screen,100svh)*0.26)] pb-[calc(var(--inv-screen,100svh)*0.12)] text-center text-[#fbf5ea]"
                style={{
                    ...shade,
                    opacity: storyIn,
                    y: storyY,
                }}
            >
                {mode === 'story' ? (
                    <>
                        <p className="text-[11px] tracking-[0.5em] text-(--inv-gold) uppercase">
                            {copy('ourStory')}
                        </p>
                        {story && (
                            <p className="inv-display mx-auto mt-4 max-w-[30ch] text-[clamp(1.1rem,4.6cqw,1.6rem)] leading-snug whitespace-pre-line">
                                <Editable path="story" multiline>
                                    {story}
                                </Editable>
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <p className="text-[11px] tracking-[0.5em] text-(--inv-gold) uppercase">
                            {occasion.id === 'wedding' ? copy('theWeddingOf') : copy('saveTheDate')}
                        </p>
                        <h2 className="inv-script mt-3 text-[clamp(2.6rem,12cqw,5rem)] leading-[1.05]">
                            {facts.one}
                            {facts.two && (
                                <>
                                    <span className="mx-3 text-[0.6em] text-(--inv-gold)">
                                        {facts.and}
                                    </span>
                                    {facts.two}
                                </>
                            )}
                        </h2>
                        {facts.headline && (
                            <p className="mx-auto mt-4 max-w-[34ch] text-[clamp(0.85rem,3.4cqw,1.05rem)] leading-relaxed opacity-85">
                                {facts.headline}
                            </p>
                        )}
                        <span className="mx-auto mt-5 block h-px w-16 bg-(--inv-gold)" />
                        {facts.dateText && (
                            <p className="mt-4 text-[12px] tracking-[0.42em] uppercase">
                                {facts.dateText}
                            </p>
                        )}
                    </>
                )}
            </m.div>
        </div>
    );
}

// The portrait sits in a tall arched window on the silk, edged in gold, not edge to edge.
const windowFrame =
    'absolute inset-x-[12%] top-[calc(var(--inv-screen,100svh)*0.1)] h-[calc(var(--inv-screen,100svh)*0.54)] overflow-hidden rounded-t-full bg-black/20 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] ring-1 ring-(--inv-gold)/70';

interface StageProps {
    p: MotionValue<number>;
    mode: PortraitsMode;
}

// The whole scene, driven by any 0 → 1 progress: the scroll (story, cover) or a timeline (opening).
export function PortraitsStage({ p, mode }: StageProps) {
    const { data, t, names, dir } = useInvite();
    const { people } = data.invitation.content;
    const { palette } = data.invitation.design;
    const toneOne = mixHex(palette.primary, '#000000', 0.25);
    const toneTwo = mixHex(palette.accent, '#000000', 0.15);
    const silkOne = useSilk(toneOne, 3);
    const silkTwo = useSilk(toneTwo, 5);

    // Unveiled from opposite ends: one rises from below, the other falls from above.
    const unveilOne = useTransform(p, [0, 0.14], [100, 0]);
    const unveilTwo = useTransform(p, [0.04, 0.18], [100, 0]);
    const clipOne = useTransform(unveilOne, (v) => `inset(${String(v)}% 0 0 0)`);
    const clipTwo = useTransform(unveilTwo, (v) => `inset(0 0 ${String(v)}% 0)`);
    // A slow push on each portrait while it is on screen.
    const pushOne = useTransform(p, [0, 0.45], [1.06, 1]);
    const pushTwo = useTransform(p, [0.04, 0.45], [1.06, 1]);
    const namesIn = useTransform(p, [0.12, 0.24], [0, 1]);
    const namesOut = useTransform(p, [0.36, 0.44], [1, 0]);
    const nameOpacity = useTransform([namesIn, namesOut], ([a, b]: number[]) =>
        Math.min(a ?? 0, b ?? 0),
    );
    // The doors: the halves part outward onto the two of them together.
    // Outward in the reading direction: the first half sits at the right in Arabic and Urdu.
    const outward = dir === 'rtl' ? -1 : 1;
    const doorOne = useTransform(p, [0.4, 0.6], ['0%', `${String(-102 * outward)}%`]);
    const doorTwo = useTransform(p, [0.4, 0.6], ['0%', `${String(102 * outward)}%`]);
    const seam = useTransform(p, [0.18, 0.26, 0.38, 0.42], [0, 1, 1, 0]);

    const one = <Editable path="people.one.name">{names.one}</Editable>;
    const two = names.two ? <Editable path="people.two.name">{names.two}</Editable> : null;
    const familyOne = t(people.one.parents);
    const familyTwo = t(people.two?.parents);

    const half = 'absolute inset-y-0 w-1/2 overflow-hidden';
    const shade = (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-b from-transparent via-black/35 to-black/80"
        />
    );
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#0b0706]">
            <Together p={p} mode={mode} />
            <m.div
                className={`${half} start-0 z-10`}
                style={{
                    x: doorOne,
                    backgroundImage: silkOne,
                }}
            >
                <m.div className={windowFrame} style={{ clipPath: clipOne }}>
                    <m.div className="size-full" style={{ scale: pushOne }}>
                        <Portrait
                            slot={PORTRAIT_ONE}
                            initial={names.initials[0] ?? ''}
                            tone={toneOne}
                        />
                    </m.div>
                </m.div>
                {shade}
            </m.div>
            <m.div
                className={`${half} end-0 z-10`}
                style={{
                    x: doorTwo,
                    backgroundImage: silkTwo,
                }}
            >
                <m.div className={windowFrame} style={{ clipPath: clipTwo }}>
                    <m.div className="size-full" style={{ scale: pushTwo }}>
                        <Portrait
                            slot={PORTRAIT_TWO}
                            initial={names.initials[1] ?? ''}
                            tone={toneTwo}
                        />
                    </m.div>
                </m.div>
                {shade}
            </m.div>
            {/* A gold seam where the two halves meet. */}
            <m.div
                aria-hidden
                className="absolute inset-y-[calc(var(--inv-screen,100svh)*0.08)] start-1/2 z-20 w-px -translate-x-1/2 bg-(--inv-gold) rtl:translate-x-1/2"
                style={{ opacity: seam }}
            />
            <Nameplate
                name={one}
                family={familyOne}
                side="start"
                style={{ opacity: nameOpacity }}
            />
            {two && (
                <Nameplate
                    name={two}
                    family={familyTwo}
                    side="end"
                    style={{ opacity: nameOpacity }}
                />
            )}
        </div>
    );
}

interface StillProps {
    mode: PortraitsMode;
}

// The PDF, reduced motion, still devices: the two portraits, then the two of them together.
function PortraitsStill({ mode }: StillProps) {
    const done = useMotionValue(1);
    const p = done;
    const { data, t, names } = useInvite();
    const { people } = data.invitation.content;
    const { palette } = data.invitation.design;
    const toneOne = mixHex(palette.primary, '#000000', 0.25);
    const toneTwo = mixHex(palette.accent, '#000000', 0.15);
    const silkOne = useSilk(toneOne, 3);
    const silkTwo = useSilk(toneTwo, 5);

    const one = <Editable path="people.one.name">{names.one}</Editable>;
    const two = names.two ? <Editable path="people.two.name">{names.two}</Editable> : null;
    const familyOne = t(people.one.parents);
    const familyTwo = t(people.two?.parents);

    const stillShade = (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-b from-transparent via-black/35 to-black/80"
        />
    );
    return (
        <section className="relative" data-print-page>
            <div className="relative grid h-[var(--inv-screen,100svh)] min-h-[560px] grid-cols-2 overflow-hidden">
                <div className="relative overflow-hidden" style={{ backgroundImage: silkOne }}>
                    <div className={windowFrame}>
                        <Portrait
                            slot={PORTRAIT_ONE}
                            initial={names.initials[0] ?? ''}
                            tone={toneOne}
                        />
                    </div>
                    {stillShade}
                </div>
                <div className="relative overflow-hidden" style={{ backgroundImage: silkTwo }}>
                    <div className={windowFrame}>
                        <Portrait
                            slot={PORTRAIT_TWO}
                            initial={names.initials[1] ?? ''}
                            tone={toneTwo}
                        />
                    </div>
                    {stillShade}
                </div>
                <Nameplate name={one} family={familyOne} side="start" />
                {two && <Nameplate name={two} family={familyTwo} side="end" />}
            </div>
            <div className="relative h-[var(--inv-screen,100svh)] min-h-[560px] overflow-hidden">
                <Together p={p} mode={mode} />
            </div>
        </section>
    );
}

interface PortraitsProps {
    mode?: PortraitsMode;
}

export function Portraits({ mode = 'story' }: PortraitsProps) {
    const { tier } = useInvite();
    const print = usePrint();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress: p } = useSectionScroll(ref);
    if (print || tier === 'static') return <PortraitsStill mode={mode} />;
    return (
        <section ref={ref} className="relative h-[calc(var(--inv-screen,100svh)*3)]" data-portraits>
            <div className="sticky top-0 h-[var(--inv-screen,100svh)] overflow-hidden">
                <PortraitsStage p={p} mode={mode} />
            </div>
        </section>
    );
}
