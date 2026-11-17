// A storybook opening with a real page curl (react-pageflip, as in the GTS story library).
// A leather-bound book on a table: the cover opens, pages turn through the title, the names, the
// ceremonies and the date, and turning onto the back cover (or "Enter") opens the invitation.
// Every screen sees an open book: the cover alone, then two-page spreads, the turned page on the left.
import { materialBackground, mixHex } from '@shared/materials';
import { peopleOf } from '@shared/people';
import { formatEventDate, zonedToUtc } from '@shared/time';
import {
    type ComponentType,
    type CSSProperties,
    forwardRef,
    type ReactNode,
    type Ref,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import HTMLFlipBook from 'react-pageflip';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { useInvite } from '../context';
import { useCoverFacts } from '../sections/covers';
import { PromptPill, useFinish } from './gesture';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

interface FlipHandle {
    pageFlip(): { flipNext(): void } | undefined;
}

// react-pageflip types every setting as required; this is the subset used.
type FlipBookProps = Record<string, unknown> & {
    children: ReactNode;
    ref?: Ref<FlipHandle>;
};
const FlipBook = HTMLFlipBook as unknown as ComponentType<FlipBookProps>;

// Cover, six leaves, back cover: an even count, so the back cover lands on its own.
const PAGES = 8;
const INK = '#2a1b10';
const GOLD = '#9a7428';

type Side = 'left' | 'right';

interface PageProps {
    side: Side;
    hard?: boolean;
    paper?: string;
    number?: number;
    children: ReactNode;
    style?: CSSProperties;
}

// Every direct child of the book must forward its ref. Soft pages get the gutter shadow at the
// spine, a stack of page edges at the outer side, gold rules and a page number.
const Page = forwardRef<HTMLDivElement, PageProps>(function Page(
    { side, hard = false, paper, number, children, style },
    ref,
) {
    const spine = side === 'left' ? 'right' : 'left';
    return (
        // react-pageflip rewrites this element's inline style, so the page's look lives one level in.
        <div ref={ref} data-density={hard ? 'hard' : 'soft'}>
            <div
                className="[container-type:size] relative size-full overflow-hidden"
                style={
                    hard
                        ? style
                        : {
                              backgroundImage: paper,
                              backgroundColor: '#f4ecdc',
                              color: INK,
                              ...style,
                          }
                }
            >
                {!hard && (
                    <>
                        {/* The gutter: paper curving into the spine. */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-y-0 w-[16cqw]"
                            style={{
                                [spine]: 0,
                                background: `linear-gradient(to ${side === 'left' ? 'left' : 'right'}, rgba(60,40,20,0.28), rgba(60,40,20,0.08) 35%, transparent)`,
                            }}
                        />
                        {/* Edges of the pages beneath, at the outer side. */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-y-[1.2cqh] w-[1.6cqw]"
                            style={{
                                [side]: 0,
                                background:
                                    'repeating-linear-gradient(90deg, #e8dcc4 0 1px, #c9b896 1px 2px)',
                            }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-[5cqw] border border-[#b8934a]/45"
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-[6.4cqw] border border-[#b8934a]/25"
                        />
                        {number !== undefined && (
                            <p
                                className="absolute bottom-[2.4cqh] text-[2.8cqw] tracking-[0.2em] text-[#8a6a3a]"
                                style={{ [side]: '9cqw' }}
                            >
                                {toRoman(number)}
                            </p>
                        )}
                    </>
                )}
                {children}
            </div>
        </div>
    );
});

function toRoman(n: number): string {
    const map: [number, string][] = [
        [10, 'x'],
        [9, 'ix'],
        [5, 'v'],
        [4, 'iv'],
        [1, 'i'],
    ];
    let out = '';
    let rest = n;
    for (const [v, s] of map) {
        while (rest >= v) {
            out += s;
            rest -= v;
        }
    }
    return out;
}

// A small ornament between lines.
function Rule() {
    return (
        <svg viewBox="0 0 120 12" className="w-[34cqw]" aria-hidden>
            <path d="M0 6 H48 M72 6 H120" stroke={GOLD} strokeWidth="0.8" />
            <path d="M60 1 L65 6 L60 11 L55 6 Z" fill={GOLD} />
            <circle cx="50" cy="6" r="1.4" fill={GOLD} />
            <circle cx="70" cy="6" r="1.4" fill={GOLD} />
        </svg>
    );
}

// Brass protectors on the cover's outer corners.
function Corners({ side }: { side: Side }) {
    const outer =
        side === 'right'
            ? ['top-0 right-0', 'bottom-0 right-0']
            : ['top-0 left-0', 'bottom-0 left-0'];
    return (
        <>
            {outer.map((pos, i) => (
                <svg
                    key={pos}
                    viewBox="0 0 40 40"
                    aria-hidden
                    className="pointer-events-none absolute size-[16cqw]"
                    style={{
                        ...(pos.includes('top') ? { top: 0 } : { bottom: 0 }),
                        ...(pos.includes('right') ? { right: 0 } : { left: 0 }),
                        transform: `scale(${pos.includes('right') ? -1 : 1}, ${i === 1 ? -1 : 1})`,
                    }}
                >
                    <defs>
                        <linearGradient
                            id={`brass-${side}-${String(i)}`}
                            x1="0"
                            x2="1"
                            y1="0"
                            y2="1"
                        >
                            <stop offset="0" stopColor="#f1d68a" />
                            <stop offset="0.5" stopColor="#b88a2e" />
                            <stop offset="1" stopColor="#7a5418" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0 0 H40 C26 6 16 14 12 26 C8 32 4 36 0 40 Z"
                        fill={`url(#brass-${side}-${String(i)})`}
                    />
                    <circle cx="9" cy="9" r="2" fill="#5a3d10" />
                </svg>
            ))}
        </>
    );
}

interface BookSize {
    w: number;
    h: number;
    spread: boolean;
}

export function BookOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy, data, t, locale, names, occasion } = useInvite();
    const facts = useCoverFacts();
    const { design, seed, content } = data.invitation;
    const people = peopleOf(content);
    const stage = useRef<HTMLDivElement>(null);
    const book = useRef<FlipHandle>(null);
    const [size, setSize] = useState<BookSize | null>(null);
    const [page, setPage] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const finish = useFinish(onOpened);
    const begun = useRef(false);

    // A spread when two pages fit legibly; otherwise one large page at a time.
    useLayoutEffect(() => {
        const el = stage.current;
        if (!el) return;
        const w = el.clientWidth;
        const h = el.clientHeight;
        // Always an open book, phones too: a turned page lies on the left like a real one.
        const spread = true;
        const across = 2;
        const pageW = Math.floor(
            Math.min((w - (w >= 640 ? 80 : 20)) / across, (h * 0.68) / 1.42, 400),
        );
        setSize({
            w: pageW,
            h: Math.floor(pageW * 1.42),
            spread,
        });
    }, []);

    const leather = useMemo(
        () =>
            materialBackground({
                kind: 'velvet',
                base: mixHex(design.palette.primary, '#000000', 0.5),
                seed,
            }),
        [design.palette.primary, seed],
    );
    const paper = useMemo(
        () =>
            materialBackground({
                kind: 'paper',
                // Warm cream: the paper texture's fibres darken it, so start lighter than the target.
                base: mixHex('#fcf4e3', design.palette.bg, 0.08),
                seed: seed + 2,
            }),
        [design.palette.bg, seed],
    );
    const endpaper = useMemo(
        () =>
            materialBackground({
                kind: 'jacquard',
                base: mixHex(design.palette.primary, '#000000', 0.15),
                motif: 'paisley',
                motifColor: mixHex(design.palette.primary, '#ffffff', 0.18),
                seed: seed + 3,
                motifScale: 0.22,
            }),
        [design.palette.primary, seed],
    );

    const events = data.events.slice(0, 5).map((e) => ({
        title: t(e.title),
        date: formatEventDate(zonedToUtc(e.startsAt, e.timezone), e.timezone, locale),
    }));
    const venue = data.events[0]?.venue;

    const start = () => {
        if (begun.current) return;
        begun.current = true;
        onBegin();
        if (tier === 'static') onOpened();
    };

    const enter = () => {
        start();
        setLeaving(true);
        finish(900);
    };

    // On a spread the side alternates (cover right, then left/right); a single page is always right.
    const side = (i: number): Side => (!size?.spread ? 'right' : i % 2 === 1 ? 'left' : 'right');
    // Closed, the cover sits alone on the right half: slide the book so it is centred, like a book
    // lying on the table, and slide it back as it opens.
    const shift = !size?.spread ? 0 : page === 0 ? -size.w / 2 : page >= PAGES - 1 ? size.w / 2 : 0;
    const cover: CSSProperties = {
        backgroundImage: leather,
        backgroundColor: 'var(--inv-primary)',
    };
    const gold = 'border border-[#d8b469]/70';
    const ornament = (cls: string, opacity = 1) => (
        <div className={cls} style={{ opacity }}>
            <GenerativeOrnament
                kind={design.generative.kind}
                seed={seed}
                draw={false}
                className="size-full"
            />
        </div>
    );
    const centre = 'absolute inset-[10cqw] flex flex-col items-center justify-center text-center';

    return (
        <OpeningShell hideTitle hidePrompt>
            <div
                ref={stage}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${leaving ? 'opacity-0' : ''}`}
                style={{
                    // A table in lamplight.
                    background:
                        'radial-gradient(ellipse at 50% 42%, color-mix(in oklab, var(--inv-bg) 35%, #5a4028) 0%, #2a1c10 45%, #0e0905 85%)',
                }}
                onPointerDown={start}
            >
                {size && (
                    <div
                        className="relative cursor-grab transition-transform duration-[900ms] ease-[cubic-bezier(0.45,0,0.2,1)] active:cursor-grabbing"
                        style={{ transform: `translateX(${String(shift)}px)` }}
                    >
                        {/* Soft shadow of the book on the table. */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-x-[6%] -bottom-[5%] h-[14%] rounded-[50%] bg-black/55 blur-xl"
                        />
                        <FlipBook
                            ref={book}
                            width={size.w}
                            height={size.h}
                            size="fixed"
                            minWidth={120}
                            maxWidth={420}
                            minHeight={170}
                            maxHeight={620}
                            showCover
                            drawShadow
                            maxShadowOpacity={0.6}
                            flippingTime={1000}
                            usePortrait={!size.spread}
                            startZIndex={0}
                            autoSize={false}
                            mobileScrollSupport={false}
                            swipeDistance={20}
                            clickEventForward
                            useMouseEvents
                            showPageCorners
                            disableFlipByClick={false}
                            startPage={0}
                            style={{}}
                            onFlip={(e: { data: number }) => {
                                setPage(e.data);
                                // Turning onto the back cover means the guest has read it through.
                                if (e.data >= PAGES - 1) enter();
                            }}
                        >
                            {/* Cover: leather, debossed rules, brass corners, medallion, names in foil. */}
                            <Page side={side(0)} hard style={cover}>
                                <div className={`absolute inset-[5cqw] ${gold}`} />
                                <div className={`absolute inset-[7cqw] ${gold} opacity-60`} />
                                <Corners side="right" />
                                <div className="absolute inset-x-[10cqw] top-[10cqh] flex flex-col items-center text-center">
                                    <p className="text-[3.6cqw] tracking-[0.4em] text-[#e6c77a] uppercase">
                                        {t(occasion.name)}
                                    </p>
                                </div>
                                {ornament(
                                    'absolute inset-x-[22cqw] top-[18cqh] aspect-square',
                                    0.85,
                                )}
                                <div className="absolute inset-x-0 bottom-[13cqh] px-[8cqw] text-center">
                                    <p className="inv-display foil-text text-[11cqw] leading-none">
                                        {facts.one}
                                    </p>
                                    {facts.two && (
                                        <>
                                            <p className="inv-script text-[8cqw] text-[#e6c77a]">
                                                {facts.and}
                                            </p>
                                            <p className="inv-display foil-text text-[11cqw] leading-none">
                                                {facts.two}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </Page>
                            {/* Endpaper with a monogram bookplate. */}
                            <Page
                                side={side(1)}
                                hard
                                style={{
                                    backgroundImage: endpaper,
                                    backgroundColor: 'var(--inv-primary)',
                                }}
                            >
                                <div className="absolute inset-x-[24cqw] top-1/2 flex aspect-[4/5] -translate-y-1/2 flex-col items-center justify-center rounded-[50%] border-2 border-[#b8934a] bg-[#f4ecdc] text-center shadow-[0_6px_14px_rgba(0,0,0,0.35)]">
                                    <p className="inv-display text-[10cqw] leading-none text-[#5a3414]">
                                        {names.initials.join(' · ')}
                                    </p>
                                    <p className="mt-[2cqw] text-[2.6cqw] tracking-[0.3em] text-[#8a6a3a] uppercase">
                                        {facts.year}
                                    </p>
                                </div>
                            </Page>
                            {/* Title page. */}
                            <Page side={side(2)} paper={paper} number={1}>
                                <div className={`${centre} gap-[3cqh]`}>
                                    {facts.greeting && (
                                        <p
                                            className="text-[3.8cqw] tracking-[0.15em]"
                                            style={{ color: GOLD }}
                                        >
                                            {t(facts.greeting.text)}
                                        </p>
                                    )}
                                    <Rule />
                                    <p className="text-[3.2cqw] tracking-[0.4em] uppercase opacity-70">
                                        {t(occasion.name)}
                                    </p>
                                    <p className="inv-display text-[10cqw] leading-none">
                                        {facts.one}
                                    </p>
                                    {facts.two && (
                                        <>
                                            <p
                                                className="inv-script text-[7cqw]"
                                                style={{ color: GOLD }}
                                            >
                                                {facts.and}
                                            </p>
                                            <p className="inv-display text-[10cqw] leading-none">
                                                {facts.two}
                                            </p>
                                        </>
                                    )}
                                    <Rule />
                                    <p className="text-[3.2cqw] tracking-[0.3em] opacity-70">
                                        {facts.year}
                                    </p>
                                </div>
                            </Page>
                            {/* The invitation line, under the medallion. */}
                            <Page side={side(3)} paper={paper} number={2}>
                                <div className={`${centre} gap-[4cqh]`}>
                                    {ornament('aspect-square w-[46cqw]', 0.75)}
                                    <p className="inv-display text-[6.2cqw] leading-snug">
                                        {facts.headline}
                                    </p>
                                </div>
                            </Page>
                            {/* The names, with their families. */}
                            <Page side={side(4)} paper={paper} number={3}>
                                <div className={`${centre} gap-[2.4cqh]`}>
                                    {facts.honorific && (
                                        <p className="text-[3.4cqw] tracking-[0.3em] uppercase opacity-70">
                                            {facts.honorific}
                                        </p>
                                    )}
                                    <p className="inv-display text-[11cqw] leading-none">
                                        {facts.one}
                                    </p>
                                    {people.one.parents && (
                                        <p className="text-[3.6cqw] italic opacity-75">
                                            {t(people.one.parents)}
                                        </p>
                                    )}
                                    {facts.two && (
                                        <>
                                            <Rule />
                                            <p className="inv-display text-[11cqw] leading-none">
                                                {facts.two}
                                            </p>
                                            {people.two?.parents && (
                                                <p className="text-[3.6cqw] italic opacity-75">
                                                    {t(people.two.parents)}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Page>
                            {/* Every ceremony, like a table of contents. */}
                            <Page side={side(5)} paper={paper} number={4}>
                                <div className={`${centre} gap-[2.6cqh]`}>
                                    <p
                                        className="text-[3.2cqw] tracking-[0.4em] uppercase"
                                        style={{ color: GOLD }}
                                    >
                                        {copy('celebrations')}
                                    </p>
                                    <Rule />
                                    <ul className="w-full space-y-[2.2cqh]">
                                        {events.map((e) => (
                                            <li
                                                key={`${e.title}-${e.date}`}
                                                className="flex flex-col"
                                            >
                                                <span className="inv-display text-[5.6cqw] leading-tight">
                                                    {e.title}
                                                </span>
                                                <span className="text-[3cqw] tracking-[0.12em] opacity-70">
                                                    {e.date}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Page>
                            {/* The date and place, and the way in. */}
                            <Page side={side(6)} paper={paper} number={5}>
                                <div className={`${centre} gap-[3cqh]`}>
                                    {ornament('aspect-square w-[30cqw]', 0.6)}
                                    <p className="inv-display text-[6.4cqw] leading-snug">
                                        {facts.dateText}
                                    </p>
                                    {venue && (
                                        <p className="text-[3.6cqw] italic opacity-75">{venue}</p>
                                    )}
                                    <Rule />
                                    <p
                                        className="text-[3cqw] tracking-[0.3em] uppercase"
                                        style={{ color: GOLD }}
                                    >
                                        {copy('turnPage')} ›
                                    </p>
                                </div>
                            </Page>
                            <Page side={side(7)} hard style={cover}>
                                <div className={`absolute inset-[5cqw] ${gold}`} />
                                <Corners side="left" />
                                {ornament('absolute inset-[30cqw] aspect-square', 0.35)}
                            </Page>
                        </FlipBook>
                        {/* A silk ribbon bookmark hanging from the spine. */}
                        {size.spread && page > 0 && page < PAGES - 1 && (
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -bottom-[7%] z-10 h-[16%] w-[10px] -translate-x-1/2 bg-[linear-gradient(90deg,#7a1424,#b8243a_50%,#7a1424)] [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]"
                                style={{ left: '50%' }}
                            />
                        )}
                    </div>
                )}
            </div>
            {page >= (size?.spread ? 5 : 6) && !leaving && (
                <button
                    type="button"
                    onClick={enter}
                    className="absolute inset-x-0 bottom-[6svh] z-40 mx-auto w-fit rounded-full bg-(--inv-gold) px-7 py-3 text-xs tracking-[0.3em] text-black uppercase shadow-lg"
                >
                    {copy('enterInvitation')}
                </button>
            )}
            <PromptPill hidden={page >= 5 || leaving}>{copy('turnPage')}</PromptPill>
        </OpeningShell>
    );
}
