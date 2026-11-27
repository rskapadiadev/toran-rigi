import { MADE_HOURS } from '@shared/made';
import { occasionOf } from '@shared/occasions';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Eye, PenLine, Send } from 'lucide-react';

import { LoginCrown } from '@/admin/shell/login-crown';
import { ToranSeal } from '@/components/brand/toran-seal';
import { canonical, pageMeta } from '@/lib/share-meta';
import { cn } from '@/lib/utils';
import {
    HeroFan,
    heroPicks,
    PosterPhone,
    Rise,
    ScreenShowcase,
    SectionHeading,
    Settle,
    TemplateTile,
} from '@/shop/landing';
import { ShopShell } from '@/shop/ShopShell';

import { fetchCatalogue } from '../server-fns/store';

export const Route = createFileRoute('/')({
    loader: () => fetchCatalogue(),
    head: ({ loaderData }) => ({
        links: [canonical(loaderData?.origin ?? '', '/')],
        meta: pageMeta({
            title: 'Toran · Digital invitations that open like a doorway',
            description:
                'Living digital invitations for weddings and every celebration. Try any design free with your names and photos, pay only when you love it, share one link on WhatsApp.',
            path: '/',
            origin: loaderData?.origin ?? '',
            // Drawn by scripts/dev/share-image.mjs; bump ?v= after a redraw so chat apps fetch it again.
            image: '/share/toran.jpg?v=1',
            imageType: 'image/jpeg',
            imageAlt:
                'Three Toran invitations on phones: a palace at dusk, carved maroon doors and a green archway',
        }),
    }),
    component: Home,
});

const features = [
    {
        icon: PenLine,
        title: 'Make it yours',
        body: 'Names, ceremonies, photos and words. No design skills needed.',
    },
    {
        icon: Eye,
        title: 'See it live',
        body: 'The real invitation changes as you type, on phone and desktop.',
    },
    {
        icon: Send,
        title: 'One link, everyone invited',
        body: 'Share on WhatsApp. Guests need no app, just a tap.',
    },
];

const steps = [
    {
        n: '01',
        title: 'Choose a design',
        body: 'Every design in the collection is a real, living invitation made by our studio.',
    },
    {
        n: '02',
        title: 'Personalise everything',
        body: 'Try it free with your names, ceremonies and photos. Your words wait on your device for a day.',
    },
    {
        n: '03',
        title: 'Buy, publish, share',
        body: 'Keep it with one payment, publish your own link and keep editing until the big day.',
    },
];

const faqs = [
    {
        q: 'Do my guests need to download anything?',
        a: 'No. Your invitation is one link that opens in any phone or computer browser, with a rich preview when shared on WhatsApp.',
    },
    {
        q: 'Can I try a design before paying?',
        a: 'Yes. Open any design, type your names, ceremonies and photos and see the real invitation change. You pay only when you choose “Buy & keep”.',
    },
    {
        q: 'Can I change things after buying?',
        a: 'Yes. Sign in to “My invitations” and edit your words, photos and ceremonies any time until your celebration. Changes show on your live link straight away.',
    },
    {
        q: 'Which traditions and languages do you support?',
        a: 'Hindu, Muslim, Sikh, Jain, Christian, Jewish and secular celebrations, with English, Hindi, Gujarati, Arabic and Urdu.',
    },
    {
        q: 'Can you make it for me?',
        a: `Yes. Send us your details or a photo of your printed card and our studio makes it, with your first look within ${String(MADE_HOURS)} hours. See “We make it for you” at the foot of this page.`,
    },
];

interface SealWatermarkProps {
    side: 'start' | 'end';
}

// The studio login's watermark: the Toran seal, huge and faint, turning slowly with a quarter of it
// off the edge of the page.
function SealWatermark({ side }: SealWatermarkProps) {
    return (
        <div
            aria-hidden
            className={cn(
                'pointer-events-none absolute top-1/2 -z-10 size-[min(110vh,820px)] -translate-y-1/2 select-none',
                side === 'end'
                    ? 'end-0 translate-x-[45%] rtl:-translate-x-[45%]'
                    : 'start-0 -translate-x-[45%] rtl:translate-x-[45%]',
            )}
        >
            <ToranSeal
                title=""
                className="size-full animate-[spin_90s_linear_infinite] text-gold opacity-[0.08] motion-reduce:animate-none"
            />
        </div>
    );
}

function Home() {
    const { templates, currency } = Route.useLoaderData();
    const fan = heroPicks(templates);
    const tiles = templates.slice(0, 5);

    return (
        <ShopShell tone="dark" currency={currency}>
            {/* ── Hero: the login's tradition panel on the left, five live designs on the right ── */}
            <section className="overflow-hidden bg-night pt-[76px]">
                {/* The hero is the crown's canvas: garland across the top, greeting on the left,
                    the tradition's emblem glowing behind the fanned designs. No card around it. */}
                <div className="hero-crown grain relative">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(195,154,78,0.24),transparent_40%),radial-gradient(circle_at_78%_50%,rgba(110,26,46,0.6),transparent_55%),radial-gradient(circle_at_70%_100%,rgba(195,154,78,0.1),transparent_50%)]" />
                    <div className="mx-auto grid max-w-[1360px] gap-10 px-5 pb-12 lg:grid-cols-[minmax(0,600px)_1fr]">
                        {/* Left: greeting crown + promise. On phones the crown stays in this column. */}
                        <div className="relative flex flex-col text-ivory lg:static">
                            <div className="hidden lg:block">
                                <LoginCrown className="[[&>div.relative]:!mt-[calc(clamp(110px,9.5vw,150px)+48px)]>div.relative]:!mt-[calc(clamp(110px,9.5vw,150px)+28px)]" />
                            </div>
                            <div className="lg:hidden">
                                <LoginCrown compact />
                            </div>
                            <div className="relative z-10 pt-16 lg:pt-6 [@media(max-height:760px)]:lg:pt-0">
                                <Settle>
                                    <p className="text-[11px] tracking-[0.35em] text-gold uppercase">
                                        Every tradition · Every celebration
                                    </p>
                                </Settle>
                                <Settle delay={80}>
                                    <h1 className="mt-4 font-display text-5xl leading-[1.02] text-balance md:text-6xl [@media(max-height:760px)]:lg:text-5xl">
                                        Made for <em className="text-gold-bright">your</em>{' '}
                                        ceremonies.
                                    </h1>
                                </Settle>
                                <Settle delay={160}>
                                    <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ivory/65">
                                        Every celebration begins at the Toran. Living invitations
                                        with your names, every ceremony and your story, shared as
                                        one link.
                                    </p>
                                </Settle>
                                <Settle delay={240}>
                                    <div className="mt-7 inline-flex rounded-full border border-white/10 bg-white/5 p-1.5">
                                        <Link
                                            to="/collections"
                                            className="rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 py-3 text-sm font-semibold text-night shadow-[0_12px_30px_-10px_rgba(232,196,119,0.7)] transition hover:brightness-105"
                                        >
                                            Create your invite
                                        </Link>
                                        <a
                                            href="#collection"
                                            className="rounded-full px-5 py-3 text-sm text-ivory transition hover:bg-white/5"
                                        >
                                            See designs
                                        </a>
                                    </div>
                                    <p className="mt-3 ps-2 text-xs tracking-wide text-ivory/50">
                                        Try free · Pay only when you love it · Share on WhatsApp
                                    </p>
                                </Settle>
                            </div>
                        </div>

                        {/* Right: five live invitations, fanned */}
                        {fan.length > 0 && (
                            <div className="relative z-10 hidden lg:block">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute start-1/2 top-1/2 size-[680px] -translate-x-1/2 -translate-y-1/2 select-none"
                                >
                                    <ToranSeal
                                        title=""
                                        className="size-full animate-[spin_120s_linear_infinite] text-gold opacity-[0.12] motion-reduce:animate-none"
                                    />
                                </div>
                                <div className="origin-bottom translate-y-[46%] scale-[0.82] xl:scale-100">
                                    <HeroFan templates={fan} />
                                </div>
                            </div>
                        )}
                        {/* Phones: the five designs side by side, swipe through */}
                        {fan.length > 0 && (
                            <div className="relative z-10 -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 lg:hidden">
                                {fan.map((t) => (
                                    <Link
                                        key={t.slug}
                                        to="/try/$slug"
                                        params={{ slug: t.slug }}
                                        aria-label={`Try ${t.name}`}
                                        className="shrink-0 snap-center"
                                    >
                                        <PosterPhone template={t} width={210} priority />
                                        <p className="mt-3 text-center font-display text-xl text-ivory">
                                            {t.name}
                                        </p>
                                        <p className="text-center text-[10px] tracking-[0.2em] text-gold uppercase">
                                            {occasionOf(t.eventKind).name.en}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Collection ── */}
            <section
                id="collection"
                className="relative isolate mx-auto max-w-6xl scroll-mt-24 px-5 pt-24"
            >
                <SealWatermark side="end" />
                <SectionHeading
                    eyebrow="The collection"
                    before="Find"
                    accent="your"
                    after="invitation"
                />
                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {tiles.map((t, i) => (
                        <Rise key={t.slug} delay={(i % 3) * 90}>
                            <TemplateTile template={t} currency={currency} />
                        </Rise>
                    ))}
                    <Rise delay={180}>
                        <Link
                            to="/collections"
                            className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 rounded-[28px] border border-white/10 bg-white/[0.03] text-center transition hover:border-gold/40"
                        >
                            <span className="font-display text-3xl text-ivory">All designs</span>
                            <span className="text-sm text-gold">
                                Browse all {templates.length} in the collection →
                            </span>
                        </Link>
                    </Rise>
                </div>
            </section>

            {/* ── Every screen ── */}
            {templates.length > 0 && (
                <section className="mx-auto max-w-6xl px-5 pt-32 text-center">
                    <SectionHeading
                        eyebrow="Designs"
                        before="See it on"
                        accent="every"
                        after="screen"
                    />
                    <div className="mt-10">
                        <ScreenShowcase templates={templates.slice(0, 8)} currency={currency} />
                    </div>
                </section>
            )}

            {/* ── Why ── */}
            <section className="mx-auto max-w-5xl px-5 pt-32">
                <div className="grid gap-10 md:grid-cols-3 md:divide-x md:divide-white/10">
                    {features.map((f, i) => (
                        <Rise key={f.title} delay={i * 100} className="px-6 text-center">
                            <span className="mx-auto flex size-13 items-center justify-center rounded-full border border-gold/30 text-gold">
                                <f.icon className="size-5" />
                            </span>
                            <h3 className="mt-5 font-display text-2xl text-ivory">{f.title}</h3>
                            <p className="mt-2 text-sm text-ivory/55">{f.body}</p>
                        </Rise>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section
                id="how"
                className="relative isolate mx-auto max-w-6xl scroll-mt-24 px-5 pt-32"
            >
                <SealWatermark side="start" />
                <SectionHeading
                    eyebrow="How it works"
                    before="Three simple"
                    accent="steps"
                    className="text-center"
                />
                <ol className="mt-14 grid gap-8 md:grid-cols-3">
                    {steps.map((s, i) => (
                        <Rise key={s.n} delay={i * 100}>
                            <li className="border-t border-white/10 pt-6">
                                <p className="font-display text-4xl text-gold-bright italic">
                                    {s.n}
                                </p>
                                <h3 className="mt-3 font-display text-2xl text-ivory">{s.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-ivory/55">
                                    {s.body}
                                </p>
                            </li>
                        </Rise>
                    ))}
                </ol>
            </section>

            {/* ── FAQ ── */}
            <section className="mx-auto max-w-3xl px-5 pt-32">
                <SectionHeading
                    eyebrow="Questions"
                    before="Before you"
                    accent="begin"
                    className="text-center"
                />
                <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
                    {faqs.map((f) => (
                        <details key={f.q} className="group py-5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl text-ivory">
                                {f.q}
                                <span className="text-gold transition group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-3 text-sm leading-relaxed text-ivory/60">{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ── Closing call ── */}
            <section className="px-5 pt-32">
                <Rise className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-gold/20 bg-[radial-gradient(circle_at_50%_0%,rgba(195,154,78,0.25),transparent_60%),linear-gradient(180deg,#4a0f1f,#120b0d)] px-6 py-16 text-center">
                    <ToranSeal className="mx-auto size-24 animate-[spin_40s_linear_infinite] text-gold-bright drop-shadow-[0_8px_30px_rgba(195,154,78,0.35)] motion-reduce:animate-none" />
                    <h2 className="mt-6 font-display text-5xl text-ivory">
                        Open your <em className="text-gold-bright">doorway</em>
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-ivory/60">
                        Pick a design and see your names on it in under a minute.
                    </p>
                    <Link
                        to="/collections"
                        className="mt-8 inline-block rounded-full bg-gradient-to-b from-gold-bright to-gold px-8 py-3 text-sm font-semibold text-night shadow-[0_12px_30px_-10px_rgba(232,196,119,0.7)]"
                    >
                        Create your invite
                    </Link>
                </Rise>
            </section>
        </ShopShell>
    );
}
