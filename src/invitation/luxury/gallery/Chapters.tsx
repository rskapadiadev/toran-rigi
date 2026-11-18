// "Memory chapters": the couple's story told as a timeline. Each paragraph is a numbered chapter,
// paired with a photograph mounted like a print in a keepsake album. A golden thread runs down the
// page and draws itself as the guest scrolls, lighting each chapter's marker as it is reached, and
// ties off in the couple's medallion. Phones read it down one side; wide screens alternate.
import { mixHex } from '@shared/materials';
import { photoUrl } from '@shared/photos';
import { m, type MotionValue, useMotionValue, useTransform } from 'motion/react';
import { type CSSProperties, type ReactNode, useRef } from 'react';

import { GenerativeOrnament } from '../../../motion/GenerativeOrnament';
import { useInvite } from '../../context';
import { Editable, useEditing } from '../../editing';
import { usePrint } from '../../print';
import { useSectionScroll } from '../../scroll';
import { foilInk, paperGrain } from '../materials';
import { Flourish } from '../typography/ornaments';

const roman = (n: number) => {
    const marks: [number, string][] = [
        [10, 'X'],
        [9, 'IX'],
        [5, 'V'],
        [4, 'IV'],
        [1, 'I'],
    ];
    let rest = n;
    let out = '';
    for (const [size, mark] of marks) {
        while (rest >= size) {
            out += mark;
            rest -= size;
        }
    }
    return out;
};

// Roman numerals read as a chapter in English; other scripts count in their own digits.
const numeral = (n: number, locale: string) =>
    locale === 'en' ? roman(n) : new Intl.NumberFormat(locale).format(n);

// Where the thread runs: down the start edge on phones, down the middle on wide screens.
const threadX = 'start-[1.35rem] @2xl:start-1/2';

const silk = [0.6, 0, 0.2, 1] as const;
const once = {
    once: true,
    margin: '0px 0px -12% 0px',
};

interface ThreadProps {
    p: MotionValue<number>;
}

// The thread: a faint guide, the gold that draws over it, and a bead of light at its tip.
function Thread({ p }: ThreadProps) {
    const tip = useTransform(p, (v) => `${String(v * 100)}%`);
    const gold: CSSProperties = {
        background:
            'linear-gradient(180deg, transparent 0%, var(--inv-gold) 6%, var(--inv-gold) 100%)',
    };
    const glow = {
        boxShadow:
            '0 0 0 3px color-mix(in srgb, var(--inv-gold) 25%, transparent), 0 0 14px 2px var(--inv-gold)',
    };
    return (
        <div aria-hidden className={`pointer-events-none absolute inset-y-0 w-px ${threadX}`}>
            <div className="absolute inset-0 bg-(--inv-gold) opacity-20" />
            <m.div
                className="absolute inset-0 origin-top"
                style={{
                    ...gold,
                    scaleY: p,
                }}
            />
            <m.div className="absolute inset-0" style={{ y: tip }}>
                <span
                    className="absolute start-0 top-0 -ms-[3.5px] -mt-1 size-2 rounded-full bg-(--inv-gold)"
                    style={glow}
                />
            </m.div>
        </div>
    );
}

interface PhotoProps {
    index: number;
    src: string | undefined;
    still: boolean;
}

// A print in a paper mount, laid in a little crooked, the way photographs go into an album.
function Print({ index, src, still }: PhotoProps) {
    const { data } = useInvite();
    const { palette, generative } = data.invitation.design;
    const tilt = index % 2 === 0 ? -1.6 : 1.4;
    const arch = index % 2 === 0;
    const mount: CSSProperties = {
        backgroundImage: `${paperGrain}, linear-gradient(160deg, #fbf6ec, ${mixHex('#efe4cf', palette.surface, 0.15)})`,
        boxShadow: '0 26px 40px -24px rgba(0,0,0,0.55), 0 2px 5px rgba(0,0,0,0.12)',
    };
    const frame = arch ? 'rounded-t-full' : 'rounded-[2px]';
    const velvet = `radial-gradient(circle at 50% 40%, ${mixHex(palette.primary, '#ffffff', 0.12)}, ${mixHex(palette.primary, '#000000', 0.4)})`;
    const field: CSSProperties = { background: velvet };
    const picture = src ? (
        <img
            src={photoUrl(src)}
            alt=""
            decoding="async"
            className="size-full object-cover"
            draggable={false}
        />
    ) : (
        <div className="flex size-full items-center justify-center" style={field}>
            <GenerativeOrnament
                kind={generative.kind}
                seed={data.invitation.seed + index * 7}
                draw={false}
                className="w-[82%] opacity-80"
            />
        </div>
    );
    // The mount drives the print: a fully clipped photo never registers as in view on its own.
    const laid = {
        hidden: {
            opacity: 0,
            y: 48,
            rotate: 0,
        },
        shown: {
            opacity: 1,
            y: 0,
            rotate: tilt,
            transition: {
                duration: 1.1,
                ease: silk,
            },
        },
    };
    const developed = {
        hidden: {
            clipPath: 'inset(100% 0% 0% 0%)',
            scale: 1.18,
        },
        shown: {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            transition: {
                duration: 1.5,
                delay: 0.2,
                ease: silk,
            },
        },
    };
    return (
        <m.figure
            className="relative mx-auto w-full max-w-[17rem] p-[6%] pb-[9%]"
            style={mount}
            variants={laid}
            initial={still ? 'shown' : 'hidden'}
            whileInView="shown"
            viewport={once}
        >
            <div
                className={`relative aspect-[4/5] overflow-hidden ${frame} ring-1 ring-(--inv-gold)/70`}
            >
                <m.div className="size-full" variants={developed}>
                    {picture}
                </m.div>
                <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-[5px] ${frame} ring-1 ring-white/35`}
                />
            </div>
        </m.figure>
    );
}

interface ChapterProps {
    index: number;
    body: ReactNode;
    photo: string | undefined;
    still: boolean;
}

function ChapterRow({ index, body, photo, still }: ChapterProps) {
    const { data, locale } = useInvite();
    const { palette } = data.invitation.design;
    // Wide screens alternate: the photo on the start side, then on the end side.
    const photoFirst = index % 2 === 0;
    const textSide = photoFirst
        ? '@2xl:order-2 @2xl:text-start'
        : '@2xl:order-1 @2xl:text-end @2xl:items-end';
    const photoSide = photoFirst ? '@2xl:order-1' : '@2xl:order-2';
    const unlit = {
        backgroundColor: 'rgba(0,0,0,0)',
        scale: 0.6,
    };
    const lit = {
        backgroundColor: palette.gold,
        scale: 1,
    };
    const light = {
        duration: 0.6,
        ease: silk,
    };
    const hidden = {
        opacity: 0,
        y: 28,
    };
    const shown = {
        opacity: 1,
        y: 0,
    };
    const ink = {
        duration: 1.2,
        delay: 0.25,
        ease: silk,
    };
    // Foil runs top to bottom here: a lone "I" is one stroke and fell into the pale band of the slanted sheen.
    const number: CSSProperties = {
        ...foilInk(palette.gold),
        backgroundImage: `linear-gradient(180deg, ${mixHex(palette.gold, '#ffffff', 0.35)} 0%, ${palette.gold} 38%, ${mixHex(palette.gold, '#000000', 0.38)} 100%)`,
    };
    return (
        <li className="relative grid items-center gap-y-7 ps-[3.4rem] @2xl:grid-cols-2 @2xl:gap-x-[12cqw] @2xl:ps-0">
            {/* The chapter's marker on the thread: a lozenge that fills with gold when reached. */}
            <m.span
                aria-hidden
                className={`absolute top-2 -ms-[7px] size-[15px] rotate-45 border border-(--inv-gold) bg-(--inv-bg) @2xl:top-1/2 @2xl:-mt-[7px] ${threadX}`}
                initial={still ? lit : unlit}
                whileInView={lit}
                viewport={once}
                transition={light}
            />
            <div className={photoSide}>
                <Print index={index} src={photo} still={still} />
            </div>
            <m.div
                className={`flex flex-col items-start ${textSide}`}
                initial={still ? shown : hidden}
                whileInView={shown}
                viewport={once}
                transition={ink}
            >
                <span
                    className="inv-display text-[clamp(3.2rem,15cqw,5rem)] leading-none font-bold"
                    style={number}
                    dir="ltr"
                >
                    {numeral(index + 1, locale)}
                </span>
                <span className="mt-3 mb-4 block h-px w-12 bg-(--inv-gold)" aria-hidden />
                <p
                    className="inv-display max-w-[30ch] text-[clamp(1.12rem,4.4cqw,1.45rem)] leading-snug whitespace-pre-line"
                    dir="auto"
                >
                    {body}
                </p>
            </m.div>
        </li>
    );
}

export function Chapters() {
    const { data, t, copy, names, tier } = useInvite();
    const editing = useEditing();
    const print = usePrint();
    const ref = useRef<HTMLOListElement>(null);
    const { scrollYProgress } = useSectionScroll(ref, ['start 0.62', 'end 0.62']);
    const drawn = useMotionValue(1);
    const still = print || tier === 'static';
    const { content, design } = data.invitation;
    const story = t(content.story);
    if (!story.trim() && !editing) return null;

    // In the studio the whole story stays one editable text; guests see it in chapters.
    const chapters: ReactNode[] = editing
        ? [
              <Editable key="story" path="story" multiline>
                  {story}
              </Editable>,
          ]
        : story
              .split(/\n\s*\n/)
              .map((part) => part.trim())
              .filter(Boolean);
    const photos = content.gallery;
    const knot = {
        opacity: 1,
        scale: 1,
    };
    const loose = {
        opacity: 0,
        scale: 0.7,
    };
    const tie = {
        duration: 0.9,
        ease: silk,
    };
    return (
        <section className="relative px-[6cqw] py-24" data-print-page={print || undefined}>
            <header className="mb-16 text-center">
                <p className="text-[11px] tracking-[0.5em] text-(--inv-gold) uppercase">
                    {copy('ourStory')}
                </p>
                {names.title && (
                    <h2 className="inv-script mt-4 text-[clamp(2.4rem,11cqw,4.4rem)] leading-[1.05] text-(--inv-primary)">
                        {names.title}
                    </h2>
                )}
                <Flourish className="mx-auto mt-5 w-[min(56cqw,240px)]" />
            </header>
            <div className="relative mx-auto max-w-4xl">
                <ol
                    ref={ref}
                    className="relative flex flex-col gap-[clamp(4.5rem,18cqw,8rem)] pb-24"
                >
                    <Thread p={still ? drawn : scrollYProgress} />
                    {chapters.map((body, i) => (
                        <ChapterRow
                            key={i}
                            index={i}
                            body={body}
                            photo={photos.length > 0 ? photos[i % photos.length] : undefined}
                            still={still}
                        />
                    ))}
                </ol>
                {/* The thread ties off in the couple's own medallion. */}
                <m.div
                    aria-hidden
                    className={`absolute top-full -ms-8 -mt-1 size-16 @2xl:-ms-10 @2xl:size-20 ${threadX}`}
                    initial={still ? knot : loose}
                    whileInView={knot}
                    viewport={once}
                    transition={tie}
                >
                    <GenerativeOrnament
                        kind={design.generative.kind}
                        seed={data.invitation.seed}
                        draw={!still}
                        className="size-full"
                    />
                </m.div>
            </div>
            {editing && (
                <p className="mt-6 text-center text-[11px] tracking-[0.2em] uppercase opacity-60">
                    Leave a blank line between paragraphs to start a new chapter
                </p>
            )}
        </section>
    );
}
