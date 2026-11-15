// Pieces of the shop's dark, editorial pages (landing and collections): floating header, rising
// reveals, live phone and laptop frames, template tiles.
import { formatMoney } from '@shared/money';
import { occasionOf } from '@shared/occasions';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { type CSSProperties, type ReactNode, useState } from 'react';

import { cn } from '@/lib/utils';

import type { StoreTemplate } from './types';

// ── Header ──────────────────────────────────────────────────────────────────

export function FloatingHeader() {
    const link = 'rounded-full px-3.5 py-1.5 text-sm text-ivory/80 transition hover:text-ivory';
    return (
        <header className="fixed inset-x-0 top-3 z-40 px-3 sm:top-4">
            <div className="mx-auto flex h-13 max-w-[1336px] items-center justify-between rounded-full border border-white/10 bg-night/55 ps-5 pe-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                <Link to="/" className="font-display text-2xl tracking-wide text-gold-bright">
                    Toran
                </Link>
                <nav className="flex items-center gap-0.5">
                    <Link to="/collections" className={cn(link, 'hidden sm:block')}>
                        Collections
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

// Eyebrow + display heading with one italic gold word, the shop's section opener.
interface HeadingProps {
    eyebrow: string;
    before: string;
    accent: string;
    after?: string;
    className?: string;
}

export function SectionHeading({ eyebrow, before, accent, after = '', className }: HeadingProps) {
    return (
        <Rise className={className}>
            <p className="text-[11px] tracking-[0.35em] text-gold uppercase">{eyebrow}</p>
            <h2 className="mt-3 font-display text-5xl leading-[1.05] text-ivory md:text-6xl">
                {before} <em className="text-gold-bright">{accent}</em> {after}
            </h2>
        </Rise>
    );
}

// ── Device frames ───────────────────────────────────────────────────────────

interface FrameProps {
    slug: string;
    title: string;
    // On-screen width in px; the page inside lays out at a real device width and is scaled down.
    width: number;
    className?: string;
    style?: CSSProperties;
    eager?: boolean;
}

export function LivePhone({ slug, title, width, className, style, eager = false }: FrameProps) {
    const scale = (width - 12) / 390;
    const height = Math.round(width * 2.05);
    const inner = {
        width: 390,
        height: (height - 12) / scale,
        transform: `scale(${String(scale)})`,
    };
    return (
        <div
            className={cn(
                'overflow-hidden rounded-[30px] bg-[#0b0708] p-[6px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10',
                className,
            )}
            style={{
                width,
                height,
                ...style,
            }}
        >
            <div className="size-full overflow-hidden rounded-[24px] bg-wine">
                <iframe
                    src={`/${slug}?embed=1`}
                    title={title}
                    loading={eager ? 'eager' : 'lazy'}
                    tabIndex={-1}
                    aria-hidden
                    className="pointer-events-none origin-top-left border-0"
                    style={inner}
                />
            </div>
        </div>
    );
}

export function LiveLaptop({ slug, title, width }: FrameProps) {
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
                </div>
            </div>
            <div className="h-3 w-full rounded-b-[14px] bg-gradient-to-b from-[#d9d4cf] to-[#8d8782]" />
            <div className="h-1.5 w-1/5 rounded-b-md bg-[#6f6a66]" />
        </div>
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
                <LivePhone
                    slug={template.sampleSlug}
                    title={template.name}
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
                    <p className="shrink-0 font-display text-xl text-gold-bright">
                        {formatMoney(template.price, currency)}
                    </p>
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
                    Try it free
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
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
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
                <div className="flex min-h-[420px] items-center justify-center">
                    {device === 'desktop' ? (
                        <>
                            <div className="hidden md:block">
                                <LiveLaptop slug={t.sampleSlug} title={t.name} width={640} />
                            </div>
                            <div className="md:hidden">
                                <LiveLaptop slug={t.sampleSlug} title={t.name} width={260} />
                            </div>
                        </>
                    ) : (
                        <LivePhone key={t.slug} slug={t.sampleSlug} title={t.name} width={220} />
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
            {t.price !== null && (
                <p className="mt-1 text-sm text-gold-bright">
                    {formatMoney(t.price, currency)} · {t.packageName}
                </p>
            )}
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
            className="relative h-full min-h-[820px]"
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
                    <LivePhone
                        slug={t.sampleSlug}
                        title={t.name}
                        width={i === 2 ? 250 : 222}
                        eager
                    />
                    <span
                        className={cn(
                            'absolute start-1/2 -bottom-14 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-night/80 py-1.5 ps-4 pe-1.5 whitespace-nowrap backdrop-blur transition duration-500',
                            active === i
                                ? 'translate-y-0 opacity-100'
                                : 'pointer-events-none translate-y-2 opacity-0',
                        )}
                    >
                        <span className="font-display text-lg text-ivory">{t.name}</span>
                        <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-night">
                            Try it free
                        </span>
                    </span>
                </Link>
            ))}
        </div>
    );
}
