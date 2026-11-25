// Pieces of the shop's dark, editorial pages (landing and collections): floating header, rising
// reveals, live phone and laptop frames, template tiles.
import { formatMoney } from '@shared/money';
import { isSolemn, occasionOf } from '@shared/occasions';
import { photoUrl } from '@shared/photos';
import { SHOW_SHOP_PRICES } from '@shared/pricing';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    motion,
    type MotionValue,
    useInView,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'motion/react';
import { type CSSProperties, type ReactNode, useRef, useState, useSyncExternalStore } from 'react';

import { cn } from '@/lib/utils';

import type { StoreTemplate } from './types';

// ── Header ──────────────────────────────────────────────────────────────────

export function FloatingHeader() {
    const link = 'rounded-full px-3.5 py-1.5 text-sm text-ivory/80 transition hover:text-ivory';
    return (
        <header className="fixed inset-x-0 top-3 z-40 px-3 sm:top-4">
            <div className="mx-auto flex h-13 max-w-[1600px] items-center justify-between rounded-full border border-white/10 bg-night/55 ps-5 pe-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                <Link to="/" className="font-display text-2xl tracking-wide text-gold-bright">
                    Toran
                </Link>
                <nav className="flex items-center gap-0.5">
                    <Link to="/collections" className={cn(link, 'hidden sm:block')}>
                        Collections
                    </Link>
                    <Link to="/wording" className={cn(link, 'hidden md:block')}>
                        Wording
                    </Link>
                    <a href="/#how" className={cn(link, 'hidden md:block')}>
                        How it works
                    </a>
                    <Link
                        to="/my"
                        className="ms-1 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-ivory transition hover:bg-white/10"
                    >
                        My invitations
                    </Link>
                </nav>
            </div>
        </header>
    );
}

// ── Motion ──────────────────────────────────────────────────────────────────

interface RiseProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

// Fades up once when scrolled into view; still for reduced motion.
export function Rise({ children, className, delay = 0 }: RiseProps) {
    const reduce = useReducedMotion();
    const hidden = {
        opacity: 0,
        y: 28,
    };
    const shown = {
        opacity: 1,
        y: 0,
    };
    const transition = {
        duration: 0.9,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1] as const,
    };
    return (
        <motion.div
            className={className}
            initial={reduce ? false : hidden}
            whileInView={shown}
            viewport={{
                once: true,
                margin: '-60px',
            }}
            transition={transition}
        >
            {children}
        </motion.div>
    );
}

// For the first screen: plain CSS that only moves, so the words never wait for the page's script.
export function Settle({ children, className, delay = 0 }: RiseProps) {
    return (
        <div
            className={cn('animate-settle motion-reduce:animate-none', className)}
            style={{ animationDelay: `${String(delay)}ms` }}
        >
            {children}
        </div>
    );
}

// Eyebrow + display heading with one italic gold word, the shop's section opener.
interface HeadingProps {
    eyebrow: string;
    before: string;
    accent: string;
    after?: string;
    className?: string;
    // Opens the page: lit from the first paint instead of brightening on scroll.
    first?: boolean;
}

export function SectionHeading({
    eyebrow,
    before,
    accent,
    after = '',
    className,
    first = false,
}: HeadingProps) {
    const label = <p className="text-[11px] tracking-[0.35em] text-gold uppercase">{eyebrow}</p>;
    const heading = 'mt-3 font-display text-5xl leading-[1.05] text-ivory md:text-6xl';
    if (first)
        return (
            <Settle className={className}>
                {label}
                <h2 className={heading}>
                    {before} <em className="text-gold-bright">{accent}</em> {after}
                </h2>
            </Settle>
        );
    return (
        <div className={className}>
            <Rise>{label}</Rise>
            <ScrollWords className={heading} before={before} accent={accent} after={after} />
        </div>
    );
}

interface WordsProps {
    before: string;
    accent: string;
    after: string;
    className: string;
}

interface WordInfo {
    text: string;
    accent: boolean;
}

const splitWords = (text: string, accent: boolean): WordInfo[] =>
    text
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => ({
            text: w,
            accent,
        }));

// The heading brightens word by word as it scrolls up the screen. Words never start fully hidden,
// so the heading reads even before the first scroll, and it is simply lit for reduced motion.
function ScrollWords({ before, accent, after, className }: WordsProps) {
    const ref = useRef<HTMLHeadingElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 0.92', 'start 0.5'],
    });
    const words = [
        ...splitWords(before, false),
        ...splitWords(accent, true),
        ...splitWords(after, false),
    ];
    return (
        <h2 ref={ref} className={className}>
            {words.map((w, i) => (
                <Word
                    key={`${w.text}-${String(i)}`}
                    word={w}
                    progress={scrollYProgress}
                    range={[i / words.length, (i + 1) / words.length]}
                    still={reduce === true}
                />
            ))}
        </h2>
    );
}

interface WordProps {
    word: WordInfo;
    progress: MotionValue<number>;
    range: [number, number];
    still: boolean;
}

function Word({ word, progress, range, still }: WordProps) {
    const opacity = useTransform(progress, range, [0.18, 1]);
    const lit = still ? undefined : { opacity };
    const text = word.accent ? <em className="text-gold-bright">{word.text}</em> : word.text;
    return (
        <>
            <motion.span style={lit}>{text}</motion.span>{' '}
        </>
    );
}

// ── Device frames ───────────────────────────────────────────────────────────

interface FrameProps {
    slug: string;
    title: string;
    // On-screen width in px; the page inside lays out at a real device width and is scaled down.
    width: number;
    className?: string;
}

const WIDE = '(min-width: 768px)';
const subscribeWide = (cb: () => void) => {
    const mq = window.matchMedia(WIDE);
    mq.addEventListener('change', cb);
    return () => {
        mq.removeEventListener('change', cb);
    };
};
const isWide = () => window.matchMedia(WIDE).matches;

interface PosterPhoneProps {
    template: StoreTemplate;
    width: number;
    className?: string;
    // Above the fold: fetch first.
    priority?: boolean;
}

// A design's cover as one still picture in a phone. The catalogue shows these instead of running
// each invitation live, so a page of designs costs a few images, not a few apps.
export function PosterPhone({ template, width, className, priority = false }: PosterPhoneProps) {
    const height = Math.round(width * 2.05);
    const { palette } = template.design;
    const fallback = { background: `linear-gradient(160deg, ${palette.primary}, ${palette.ink})` };
    return (
        <div
            className={cn(
                'overflow-hidden rounded-[30px] bg-[#0b0708] p-[6px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10',
                className,
            )}
            style={{
                width,
                height,
            }}
        >
            <div className="size-full overflow-hidden rounded-[24px] bg-wine">
                {template.posterKey ? (
                    <img
                        src={photoUrl(template.posterKey)}
                        alt={`${template.name} invitation`}
                        width={width - 12}
                        height={height - 12}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchPriority={priority ? 'high' : 'auto'}
                        decoding="async"
                        draggable={false}
                        className="size-full object-cover object-top"
                    />
                ) : (
                    <div
                        className="flex size-full flex-col items-center justify-center gap-3 p-4 text-center"
                        style={fallback}
                    >
                        <span className="font-display text-3xl" style={{ color: palette.gold }}>
                            {template.name}
                        </span>
                        <span className="text-[10px] tracking-[0.3em] text-white/70 uppercase">
                            Tap to open
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export function LiveLaptop({ slug, title, width, live = true }: FrameProps & { live?: boolean }) {
    const screen = width * 0.84;
    const scale = screen / 1280;
    const inner = {
        width: 1280,
        height: 800,
        transform: `scale(${String(scale)})`,
    };
    return (
        <div className="relative flex flex-col items-center" style={{ width }}>
            <div
                className="relative rounded-t-[18px] border border-white/15 bg-[#0b0708] p-[10px] pb-[14px] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)]"
                style={{ width: screen + 22 }}
            >
                <div className="absolute start-1/2 top-[3px] size-1.5 -translate-x-1/2 rounded-full bg-white/20" />
                <div
                    className="overflow-hidden rounded-[6px] bg-wine"
                    style={{
                        width: screen,
                        height: 800 * scale,
                    }}
                >
                    {live && (
                        <iframe
                            key={slug}
                            src={`/${slug}?embed=1`}
                            title={title}
                            loading="lazy"
                            tabIndex={-1}
                            aria-hidden
                            className="pointer-events-none origin-top-left border-0"
                            style={inner}
                        />
                    )}
                </div>
            </div>
            <div className="h-3 w-full rounded-b-[14px] bg-gradient-to-b from-[#d9d4cf] to-[#8d8782]" />
            <div className="h-1.5 w-1/5 rounded-b-md bg-[#6f6a66]" />
        </div>
    );
}

// ── Price ───────────────────────────────────────────────────────────────────

interface PriceTagProps {
    price: number;
    compare: number | null;
    off: number | null;
    currency: string;
    className?: string;
    // Light pages (try, my invitations) need ink colours instead of ivory and gold.
    tone?: 'dark' | 'light';
}

// "₹1,999 ₹999 50% off": the was-price struck through, the price, and the saving.
export function PriceTag({
    price,
    compare,
    off,
    currency,
    className,
    tone = 'dark',
}: PriceTagProps) {
    const dark = tone === 'dark';
    if (!SHOW_SHOP_PRICES) return null;
    return (
        <span className={cn('inline-flex items-baseline gap-2', className)}>
            {compare !== null && (
                <s className={cn('text-[0.8em]', dark ? 'text-ivory/40' : 'text-muted-foreground')}>
                    <span className="sr-only">Was </span>
                    {formatMoney(compare, currency)}
                </s>
            )}
            <span className={dark ? 'text-gold-bright' : 'text-ink'}>
                {compare !== null && <span className="sr-only">now </span>}
                {formatMoney(price, currency)}
            </span>
            {off !== null && (
                <span
                    className={cn(
                        'self-center rounded-full border px-1.5 py-px font-sans text-[10px] font-semibold tracking-wide',
                        dark
                            ? 'border-gold/50 text-gold-bright'
                            : 'border-gold-deep/40 text-gold-deep',
                    )}
                >
                    {off}% off
                </span>
            )}
        </span>
    );
}

// ── Template tile ───────────────────────────────────────────────────────────

interface TileProps {
    template: StoreTemplate;
    currency: string;
}

// A collection card: the live invitation in a phone on a wash of the design's own colours.
export function TemplateTile({ template, currency }: TileProps) {
    const { palette } = template.design;
    // No sale and no "free" beside a loss.
    const solemn = isSolemn(occasionOf(template.eventKind));
    const gradient = `radial-gradient(circle at 50% 30%, ${palette.primary}cc, ${palette.ink} 75%)`;
    const wash = { background: gradient };
    return (
        <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-2 transition duration-500 hover:-translate-y-1 hover:border-gold/40">
            <Link
                to="/try/$slug"
                params={{ slug: template.slug }}
                aria-label={`Try ${template.name}`}
                className="relative flex h-[340px] items-end justify-center overflow-hidden rounded-[22px]"
                style={wash}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(232,196,119,0.35),transparent_60%)]" />
                <PosterPhone
                    template={template}
                    width={170}
                    className="relative translate-y-10 transition duration-700 group-hover:translate-y-4"
                />
            </Link>
            <div className="flex items-end justify-between gap-3 px-3 pt-4 pb-3">
                <div className="min-w-0">
                    <h3 className="truncate font-display text-2xl text-ivory">{template.name}</h3>
                    <p className="text-[11px] tracking-[0.2em] text-ivory/45 uppercase">
                        {occasionOf(template.eventKind).name.en}
                    </p>
                </div>
                {template.price !== null && (
                    <PriceTag
                        price={template.price}
                        compare={solemn ? null : template.comparePrice}
                        off={solemn ? null : template.off}
                        currency={currency}
                        className="shrink-0 flex-wrap justify-end font-display text-xl"
                    />
                )}
            </div>
            <div className="flex gap-2 px-3 pb-3">
                <a
                    href={`/${template.sampleSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-gold transition hover:text-gold-bright"
                >
                    View live demo <ArrowRight className="size-3.5" />
                </a>
                <Link
                    to="/try/$slug"
                    params={{ slug: template.slug }}
                    className="ms-auto rounded-full bg-gold/90 px-4 py-1.5 text-sm font-medium text-night transition hover:bg-gold-bright"
                >
                    {solemn ? 'Open it' : 'Try it free'}
                </Link>
            </div>
        </article>
    );
}

// ── "See it on every screen" ────────────────────────────────────────────────

interface ShowcaseProps {
    templates: StoreTemplate[];
    currency: string;
}

export function ScreenShowcase({ templates, currency }: ShowcaseProps) {
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const stage = useRef<HTMLDivElement>(null);
    const seen = useInView(stage, {
        once: true,
        margin: '200px',
    });
    // Phones get the phone view only: a laptop scaled to 260px says nothing.
    const wide = useSyncExternalStore(subscribeWide, isWide, () => true);
    const [i, setI] = useState(0);
    const t = templates[i % templates.length];
    if (!t) return null;
    const step = (d: number) => {
        setI((n) => (n + d + templates.length) % templates.length);
    };
    const arrow =
        'flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ivory transition hover:bg-white/10';
    return (
        <div className="flex flex-col items-center">
            <div className="hidden rounded-full border border-white/10 bg-white/5 p-1 md:flex">
                {(['desktop', 'mobile'] as const).map((d) => (
                    <button
                        key={d}
                        type="button"
                        aria-pressed={device === d}
                        onClick={() => {
                            setDevice(d);
                        }}
                        className={cn(
                            'rounded-full px-5 py-1.5 font-display text-base capitalize transition',
                            device === d ? 'bg-gold text-night' : 'text-ivory/70 hover:text-ivory',
                        )}
                    >
                        {d}
                    </button>
                ))}
            </div>
            <div className="mt-10 flex w-full items-center justify-center gap-4 md:gap-10">
                <button
                    type="button"
                    aria-label="Previous design"
                    className={arrow}
                    onClick={() => {
                        step(-1);
                    }}
                >
                    <ChevronLeft className="size-5" />
                </button>
                <div ref={stage} className="flex min-h-[420px] items-center justify-center">
                    {device === 'desktop' && wide ? (
                        // The one live invitation on the page, started only once it scrolls into view.
                        <LiveLaptop slug={t.sampleSlug} title={t.name} width={640} live={seen} />
                    ) : (
                        <PosterPhone key={t.slug} template={t} width={220} />
                    )}
                </div>
                <button
                    type="button"
                    aria-label="Next design"
                    className={arrow}
                    onClick={() => {
                        step(1);
                    }}
                >
                    <ChevronRight className="size-5" />
                </button>
            </div>
            <p className="mt-8 font-display text-3xl text-ivory">{t.name}</p>
            <p className="mt-1 flex items-baseline justify-center gap-2 text-sm">
                {SHOW_SHOP_PRICES && t.price !== null && (
                    <>
                        <PriceTag
                            price={t.price}
                            compare={t.comparePrice}
                            off={t.off}
                            currency={currency}
                        />
                        <span className="text-ivory/45">·</span>
                    </>
                )}
                <span className="text-ivory/45">{occasionOf(t.eventKind).name.en}</span>
            </p>
            <div className="mt-5 flex gap-3">
                <a
                    href={`/${t.sampleSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-ivory transition hover:bg-white/10"
                >
                    View live demo
                </a>
                <Link
                    to="/try/$slug"
                    params={{ slug: t.slug }}
                    className="rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 py-2 text-sm font-medium text-night shadow-[0_10px_30px_-10px_rgba(232,196,119,0.6)]"
                >
                    Use this design
                </Link>
            </div>
        </div>
    );
}

// ── Hero fan ────────────────────────────────────────────────────────────────

interface FanProps {
    templates: StoreTemplate[];
}

const FAN_ANGLE = [-16, -8, 0, 8, 16];
const FAN_SHIFT = [-210, -105, 0, 105, 210];
const FAN_LIFT = [64, 20, 0, 20, 64];
const FAN_LAYER = [1, 2, 3, 2, 1];

// Hue (0–360) and lightness (0–1) of a #rrggbb colour.
function hueLight(hex: string): [number, number] {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [
        number,
        number,
        number,
    ];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const light = (max + min) / 2;
    if (max === min) return [0, light];
    const d = max - min;
    const hue =
        max === r
            ? ((g - b) / d + (g < b ? 6 : 0)) * 60
            : max === g
              ? ((b - r) / d + 2) * 60
              : ((r - g) / d + 4) * 60;
    return [hue, light];
}

// Same colour family on the same kind of paper (both light or both dark) reads as the same card.
function lookAlike(a: StoreTemplate, b: StoreTemplate): boolean {
    const [ha] = hueLight(a.design.palette.primary);
    const [hb] = hueLight(b.design.palette.primary);
    const [, la] = hueLight(a.design.palette.bg);
    const [, lb] = hueLight(b.design.palette.bg);
    const gap = Math.min(Math.abs(ha - hb), 360 - Math.abs(ha - hb));
    return gap < 25 && la > 0.5 === lb > 0.5;
}

const toneRank: Record<string, number> = {
    festive: 0,
    joyful: 1,
    formal: 2,
    serene: 3,
};

// The hero's five: each a different occasion (and tradition where the catalogue allows), lively
// ones first, never a remembrance. The wedding, if any, takes the front-centre seat.
export function heroPicks(templates: readonly StoreTemplate[], count = 5): StoreTemplate[] {
    const candidates = templates
        .filter((t) => occasionOf(t.eventKind).tone !== 'solemn')
        .map((t, i) => ({
            t,
            i,
            rank: toneRank[occasionOf(t.eventKind).tone] ?? 9,
        }))
        .sort((a, b) => a.rank - b.rank || a.i - b.i)
        .map((c) => c.t);
    const picks: StoreTemplate[] = [];
    const base = (t: StoreTemplate) => t.culture.split('.')[0] ?? t.culture;
    const newOccasion = (t: StoreTemplate) => picks.every((p) => p.eventKind !== t.eventKind);
    // The cover guests see first is the opening (envelope, doors, lantern…): two alike look like
    // one design, whatever the occasion.
    const newOpening = (t: StoreTemplate) =>
        picks.every((p) => p.design.opening !== t.design.opening);
    const newCulture = (t: StoreTemplate) => picks.every((p) => base(p) !== base(t));
    const newColour = (t: StoreTemplate) => picks.every((p) => !lookAlike(p, t));
    // Strictest first, loosening only when the catalogue runs out of variety.
    const passes = [
        (t: StoreTemplate) => newOccasion(t) && newOpening(t) && newCulture(t) && newColour(t),
        (t: StoreTemplate) => newOccasion(t) && newOpening(t) && newColour(t),
        (t: StoreTemplate) => newOccasion(t) && newOpening(t),
        newOccasion,
        () => true,
    ];
    for (const fits of passes)
        for (const t of candidates) {
            if (picks.length >= count) break;
            if (!picks.includes(t) && fits(t)) picks.push(t);
        }
    const wedding = picks.findIndex((t) => t.eventKind === 'wedding');
    const centre = Math.floor(picks.length / 2);
    if (wedding >= 0 && picks.length > centre) {
        const [w] = picks.splice(wedding, 1);
        if (w) picks.splice(centre, 0, w);
    }
    return picks;
}

// Five live designs fanned like cards. Pointing at one (or tabbing to it) straightens and lifts it
// to the front while its neighbours ease aside; nothing ever leaves the fan.
export function HeroFan({ templates }: FanProps) {
    const [active, setActive] = useState<number | null>(null);
    const fan = templates.slice(0, 5);
    const place = (i: number): CSSProperties => {
        const base = {
            x: FAN_SHIFT[i] ?? 0,
            y: FAN_LIFT[i] ?? 0,
            r: FAN_ANGLE[i] ?? 0,
        };
        if (active === null)
            return {
                transform: `translate(calc(-50% + ${String(base.x)}px), calc(-50% + ${String(base.y)}px)) rotate(${String(base.r)}deg)`,
                zIndex: FAN_LAYER[i] ?? 1,
            };
        if (i === active)
            return {
                transform: `translate(calc(-50% + ${String(base.x)}px), calc(-50% - 28px)) rotate(0deg) scale(1.06)`,
                zIndex: 10,
            };
        // Neighbours make room: further away the closer they are.
        const away = i < active ? -1 : 1;
        const push = Math.abs(i - active) === 1 ? 46 : 24;
        return {
            transform: `translate(calc(-50% + ${String(base.x + away * push)}px), calc(-50% + ${String(base.y + 14)}px)) rotate(${String(base.r + away * 3)}deg) scale(0.96)`,
            zIndex: FAN_LAYER[i] ?? 1,
            opacity: 0.55,
            filter: 'saturate(0.7)',
        };
    };
    return (
        <div
            className="relative h-full min-h-[680px]"
            onPointerLeave={() => {
                setActive(null);
            }}
        >
            {fan.map((t, i) => (
                <Link
                    key={t.slug}
                    to="/try/$slug"
                    params={{ slug: t.slug }}
                    aria-label={`Try ${t.name}`}
                    onPointerEnter={() => {
                        setActive(i);
                    }}
                    onFocus={() => {
                        setActive(i);
                    }}
                    onBlur={() => {
                        setActive(null);
                    }}
                    className="absolute start-1/2 top-1/2 rounded-[30px] transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:transition-none"
                    style={place(i)}
                >
                    <PosterPhone template={t} width={i === 2 ? 250 : 222} priority />
                    <span
                        className={cn(
                            'absolute start-1/2 -top-14 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-night/80 py-1.5 ps-4 pe-1.5 whitespace-nowrap backdrop-blur transition duration-500',
                            active === i
                                ? 'translate-y-0 opacity-100'
                                : 'pointer-events-none translate-y-2 opacity-0',
                        )}
                    >
                        <span className="font-display text-lg text-ivory">{t.name}</span>
                        <span className="text-[10px] tracking-[0.2em] text-gold uppercase">
                            {occasionOf(t.eventKind).name.en}
                        </span>
                        <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-night">
                            Try it free
                        </span>
                    </span>
                </Link>
            ))}
        </div>
    );
}
