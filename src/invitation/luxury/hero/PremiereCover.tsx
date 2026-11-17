// "Premiere": the cover as a film's title sequence. A dark, letterboxed frame with film grain; the
// couple's names set huge, their photo visible only through the letters. As guests scroll, the
// camera flies through the names into the full photograph, the letterbox draws back, and the
// couple are introduced over the picture: names in script, the headline, the date, the venue.
// Scroll-driven, so it plays at the guest's pace. Without a photo the letters are cut from gold
// foil and the camera flies into a glowing field in the invitation's colours.
import { mixHex } from '@shared/materials';
import { COVER_SLOT, photoUrl, slotPhoto } from '@shared/photos';
import { m, useTransform } from 'motion/react';
import { type CSSProperties, useRef } from 'react';

import { GenerativeOrnament } from '../../../motion/GenerativeOrnament';
import { useInvite } from '../../context';
import { Editable, useEditing } from '../../editing';
import { usePrint } from '../../print';
import { useSectionScroll } from '../../scroll';
import { fitDisplay, useCoverFacts } from '../../sections/covers';
import { foil, foilInk, grain } from '../materials';

interface IntroProps {
    // Shown over the photograph once the camera has arrived.
    still: boolean;
    style?: object;
}

function Introduction({ still, style }: IntroProps) {
    const { copy, occasion } = useInvite();
    const facts = useCoverFacts();
    const kicker = occasion.id === 'wedding' ? copy('theWeddingOf') : copy('saveTheDate');
    const body = (
        <>
            <p className="text-[11px] tracking-[0.5em] uppercase opacity-80">{kicker}</p>
            <h2 className="inv-script mt-4 text-[clamp(2.8rem,13cqw,5.5rem)] leading-[1.05]">
                {facts.one}
                {facts.two && (
                    <>
                        <span className="mx-3 text-[0.6em] text-(--inv-gold)">{facts.and}</span>
                        {facts.two}
                    </>
                )}
            </h2>
            {facts.headline && (
                <p className="mx-auto mt-5 max-w-[34ch] text-[clamp(0.85rem,3.4cqw,1.05rem)] leading-relaxed opacity-85">
                    <Editable path="headline" multiline>
                        {facts.headline}
                    </Editable>
                </p>
            )}
            <span className="mx-auto mt-6 block h-px w-16 bg-(--inv-gold)" />
            {facts.dateText && (
                <p className="mt-5 text-[12px] tracking-[0.42em] uppercase">{facts.dateText}</p>
            )}
        </>
    );
    const box =
        'absolute inset-x-0 bottom-0 z-30 px-6 pt-[calc(var(--inv-screen,100svh)*0.3)] pb-[calc(var(--inv-screen,100svh)*0.12)] text-center text-[#fbf5ea] [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]';
    const shade: CSSProperties = {
        background:
            'linear-gradient(180deg, transparent 0%, rgba(8,5,4,0.55) 45%, rgba(8,5,4,0.88) 100%)',
    };
    if (still)
        return (
            <div className={box} style={shade}>
                {body}
            </div>
        );
    return (
        <m.div
            className={box}
            style={{
                ...shade,
                ...style,
            }}
        >
            {body}
        </m.div>
    );
}

export function PremiereCover() {
    const { data, tier, copy, t, names } = useInvite();
    const facts = useCoverFacts();
    const print = usePrint();
    const editing = useEditing();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress: p } = useSectionScroll(ref);
    const { palette } = data.invitation.design;
    const key = slotPhoto(data.invitation.content, COVER_SLOT);
    const photo = key ? photoUrl(key) : undefined;

    // The title card: names masked over the photo, credits around them.
    const zoom = useTransform(p, [0.22, 0.5], [1, 11]);
    const namesFade = useTransform(p, [0.4, 0.5], [1, 0]);
    const credits = useTransform(p, [0.08, 0.22], [1, 0]);
    // The photograph arrives as the camera passes through the letters, settling from a push-in.
    const photoIn = useTransform(p, [0.3, 0.48], [0, 1]);
    const photoScale = useTransform(p, [0.3, 0.6, 1], [1.25, 1.06, 1]);
    // The letterbox draws back once the shot is full-frame.
    const bars = useTransform(
        p,
        [0.45, 0.62],
        ['calc(var(--inv-screen, 100svh) * 0.03)', 'calc(var(--inv-screen, 100svh) * 0)'],
    );
    const introIn = useTransform(p, [0.55, 0.7], [0, 1]);
    const introY = useTransform(p, [0.55, 0.7], [28, 0]);
    const cue = useTransform(p, [0, 0.06], [1, 0]);

    const night = mixHex(palette.primary, '#050303', 0.82);
    const fill = photo ? `url("${photo}") center / cover no-repeat` : foil(palette.gold);
    const field = `radial-gradient(ellipse 60% 50% at 50% 45%, ${mixHex(palette.primary, night, 0.35)} 0%, ${night} 75%)`;
    const monogramInk = foilInk(palette.gold);
    const shot = photo ? (
        <img
            src={photo}
            alt=""
            data-photo-slot={COVER_SLOT}
            className="size-full object-cover"
            draggable={false}
        />
    ) : (
        // No photo: the couple's own medallion, drawn in gold on night, their monogram at its heart.
        <div
            data-photo
            data-photo-slot={COVER_SLOT}
            className="relative flex size-full items-center justify-center overflow-hidden"
            style={{ background: field }}
        >
            <GenerativeOrnament
                kind={data.invitation.design.generative.kind}
                seed={data.invitation.seed}
                className="absolute w-[130vmin] max-w-none opacity-70"
                draw={false}
            />
            <span
                className="inv-display relative text-[clamp(3.5rem,18cqw,7rem)] leading-none"
                style={monogramInk}
            >
                {names.initials.join('')}
            </span>
            {editing && (
                <span className="absolute bottom-[30%] text-[11px] tracking-[0.4em] text-white/70 uppercase">
                    Main photo · click to add
                </span>
            )}
        </div>
    );
    const stageBg: CSSProperties = { background: night };
    const grainLayer: CSSProperties = { backgroundImage: grain };

    // The PDF, reduced motion and still devices: the finished frame, photo and introduction.
    if (print || tier === 'static')
        return (
            <section
                className="relative h-[var(--inv-screen,100svh)] min-h-[600px] overflow-hidden"
                style={stageBg}
                data-print-page
            >
                <div className="absolute inset-0">{shot}</div>
                <Introduction still />
            </section>
        );

    // Letters cut from the photo (or foil): the background is clipped to the glyphs.
    const lettersStyle = {
        background: fill,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        scale: zoom,
        opacity: namesFade,
        fontSize: fitDisplay([facts.one, facts.two], 22, 118, 13),
        // A hairline of foil keeps every letter's shape where the photo is dark.
        WebkitTextStroke: `1px ${mixHex(palette.gold, '#ffffff', 0.2)}99`,
    };
    const photoStyle = {
        opacity: photoIn,
        scale: photoScale,
    };
    const introStyle = {
        opacity: introIn,
        y: introY,
    };
    return (
        <section
            ref={ref}
            className="relative h-[calc(var(--inv-screen,100svh)*2.6)]"
            style={stageBg}
            data-premiere
        >
            <div className="sticky top-0 h-[var(--inv-screen,100svh)] overflow-hidden">
                <m.div className="absolute inset-0" style={photoStyle}>
                    {shot}
                </m.div>

                <m.div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center leading-[0.84] font-bold tracking-tight uppercase"
                    style={lettersStyle}
                >
                    <span className="inv-display block">
                        <Editable path="people.one.name">{facts.one}</Editable>
                    </span>
                    {facts.two && (
                        <>
                            <span className="inv-script block py-[0.06em] text-[0.42em] normal-case">
                                {facts.and}
                            </span>
                            <span className="inv-display block">
                                <Editable path="people.two.name">{facts.two}</Editable>
                            </span>
                        </>
                    )}
                </m.div>

                {/* Credits around the title card, like the first frame of a film. */}
                <m.div
                    className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between px-6 py-[calc(var(--inv-screen,100svh)*0.1)] text-center text-[#f4ead6]"
                    style={{ opacity: credits }}
                >
                    <p className="text-[11px] tracking-[0.5em] uppercase opacity-75">
                        {facts.guest
                            ? `${copy('dearGuest')} ${facts.guest.name}`
                            : facts.greeting
                              ? t(facts.greeting.text)
                              : ''}
                    </p>
                    {facts.dateText && (
                        <p className="text-[11px] tracking-[0.5em] uppercase opacity-75">
                            {facts.dateText}
                        </p>
                    )}
                </m.div>

                <Introduction still={false} style={introStyle} />

                {/* Letterbox bars. */}
                <m.div
                    className="absolute inset-x-0 top-0 z-30 bg-black"
                    style={{ height: bars }}
                />
                <m.div
                    className="absolute inset-x-0 bottom-0 z-30 bg-black"
                    style={{ height: bars }}
                />

                {/* Film grain over everything, flickering a few times a second. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-[-50%] z-40 animate-[premiere-grain_0.6s_steps(4)_infinite] opacity-[0.07] will-change-transform motion-reduce:animate-none"
                    style={grainLayer}
                />

                <m.div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--inv-screen,100svh)*0.025)] z-40 mx-auto flex w-fit flex-col items-center gap-2 text-[10px] tracking-[0.45em] text-[#f4ead6]/70 uppercase"
                    style={{ opacity: cue }}
                >
                    <span className="h-8 w-px animate-pulse bg-gradient-to-b from-transparent to-[#f4ead6]/70 motion-reduce:animate-none" />
                </m.div>
            </div>
        </section>
    );
}
