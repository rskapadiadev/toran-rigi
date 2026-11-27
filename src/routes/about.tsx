import { brand } from '@shared/brand';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BookOpen, Mail, PenLine, ShieldCheck, Smartphone } from 'lucide-react';

import { goldButton, quietButton } from '@/shop/guides/kit';
import { Rise, SectionHeading, Settle } from '@/shop/landing';
import { policyHead, textLink } from '@/shop/policies/kit';
import { ShopShell } from '@/shop/ShopShell';

import { fetchOrigin } from '../server-fns/store';

const LEAD =
    'A toran is the garland hung over a doorway to welcome guests in. Ours are living invitations: they open, move and play your music on every guest’s phone, in your words and your tradition.';

export const Route = createFileRoute('/about')({
    loader: () => fetchOrigin(),
    head: ({ loaderData }) =>
        policyHead({
            title: 'About us',
            lead: LEAD,
            path: '/about',
            origin: loaderData?.origin,
        }),
    component: About,
});

const traditions = ['Hindu', 'Muslim', 'Sikh', 'Jain', 'Christian', 'Jewish', 'Secular'];

const occasions = [
    'Weddings',
    'Engagements',
    'Naming ceremonies',
    'Baby showers',
    'Griha pravesh',
    'Pujas',
    'Birthdays',
    'Anniversaries',
    'Retirements',
    'Corporate evenings',
    'Prayer meets',
];

const promises = [
    {
        icon: PenLine,
        title: 'You change everything but the look',
        body: 'Words, photos, ceremonies, languages, music, replies and which parts show, as often as you like. The design stays as our studio made it.',
    },
    {
        icon: Smartphone,
        title: 'It works on every phone',
        body: 'Opened from WhatsApp on an old phone or a new one, it loads quickly and reads well, with nothing for guests to install.',
    },
    {
        icon: BookOpen,
        title: 'Sacred lines are never made up',
        body: 'Mantras, verses, Gurbani and blessings come only from our checked library, or from you. Never from AI.',
    },
    {
        icon: ShieldCheck,
        title: 'Your details are for your invitation',
        body: 'We use what you give us to make and show your invitation, and for nothing else. We never sell it.',
    },
];

function Chips({ items }: { items: readonly string[] }) {
    return (
        <ul className="flex flex-wrap gap-2">
            {items.map((item) => (
                <li
                    key={item}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm text-ivory/75"
                >
                    {item}
                </li>
            ))}
        </ul>
    );
}

function About() {
    return (
        <ShopShell tone="dark">
            <main>
                <header className="relative isolate">
                    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_20%_0%,rgba(195,154,78,0.2),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(110,26,46,0.6),transparent_55%)] [mask-image:linear-gradient(black_40%,transparent)]" />
                    <Settle className="relative mx-auto max-w-6xl px-4 pt-28 sm:px-5 sm:pt-32">
                        <p className="text-[11px] tracking-[0.35em] text-gold uppercase">
                            About {brand.name}
                        </p>
                        <h1 className="mt-4 font-display text-4xl leading-[1.05] text-balance text-ivory sm:text-5xl md:text-6xl">
                            The doorway to every <em className="text-gold-bright">celebration</em>
                        </h1>
                        <p className="mt-4 max-w-2xl leading-relaxed text-ivory/70">{LEAD}</p>
                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <Link to="/collections" className={goldButton}>
                                Try a design free
                            </Link>
                            <Link to="/made-for-you" className={quietButton}>
                                We make it for you
                            </Link>
                        </div>
                    </Settle>
                </header>

                <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-5 sm:pt-24">
                    <SectionHeading eyebrow="Why we exist" before="For every" accent="family" />
                    <Rise className="mt-6 max-w-2xl space-y-4 leading-relaxed text-ivory/70">
                        <p>
                            Most invitations now arrive on a phone, but most digital invitations
                            still look like a printed card in a photo. We wanted the card to come
                            alive: the doors open, the petals fall, the music starts, and every
                            ceremony is a tap away with its venue, time and map.
                        </p>
                        <p>
                            And we wanted it to feel like yours, whatever you believe and whatever
                            you’re celebrating. Each tradition has its own greetings, its own
                            colours and its own order of ceremonies, and each occasion its own
                            words.
                        </p>
                    </Rise>
                    <Rise className="mt-10 grid gap-8 md:grid-cols-2">
                        <div>
                            <h3 className="mb-3 text-[11px] tracking-[0.3em] text-ivory/50 uppercase">
                                Every tradition
                            </h3>
                            <Chips items={traditions} />
                        </div>
                        <div>
                            <h3 className="mb-3 text-[11px] tracking-[0.3em] text-ivory/50 uppercase">
                                Every occasion
                            </h3>
                            <Chips items={occasions} />
                        </div>
                    </Rise>
                </section>

                <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-5 sm:pt-24">
                    <SectionHeading eyebrow="What we promise" before="Made with" accent="care" />
                    <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                        {promises.map(({ icon: Icon, title, body }, i) => (
                            <li key={title}>
                                <Rise
                                    delay={i * 80}
                                    className="h-full rounded-2xl border border-white/10 bg-white/5 p-6"
                                >
                                    <Icon aria-hidden className="size-6 text-gold" />
                                    <h3 className="mt-4 font-display text-2xl text-ivory">
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-ivory/60">
                                        {body}
                                    </p>
                                </Rise>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-5 sm:pt-24">
                    <SectionHeading eyebrow="Who makes it" before="From" accent="Surat" />
                    <Rise className="mt-6 max-w-2xl space-y-4 leading-relaxed text-ivory/70">
                        <p>
                            {brand.name} is made by {brand.legalName}, a {brand.parent} company, in{' '}
                            {brand.address}. Our studio makes every design in the collection, and
                            when you write to us, a person answers.
                        </p>
                        <p>
                            If you’d rather not do it yourself, our studio can{' '}
                            <Link to="/made-for-you" className={textLink}>
                                make your invitation for you
                            </Link>{' '}
                            from your details or a photo of your printed card.
                        </p>
                    </Rise>
                </section>

                <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-5 sm:pt-24">
                    <Rise className="max-w-2xl">
                        <h2 className="font-display text-3xl text-ivory md:text-4xl">
                            Partnerships and press
                        </h2>
                        <p className="mt-4 leading-relaxed text-ivory/70">
                            Wedding planners, venues, photographers and writers: we’d love to hear
                            from you.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <a href={`mailto:${brand.email}`} className={quietButton}>
                                <Mail aria-hidden className="size-4" />
                                <span className="break-all">{brand.email}</span>
                            </a>
                            <Link to="/contact" className={quietButton}>
                                All the ways to reach us
                            </Link>
                        </div>
                    </Rise>
                </section>

                <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-5">
                    <div className="rounded-[28px] border border-gold/20 bg-[radial-gradient(circle_at_50%_0%,rgba(195,154,78,0.2),transparent_60%),linear-gradient(180deg,#4a0f1f,#120b0d)] px-6 py-12 text-center">
                        <h2 className="font-display text-4xl text-ivory">
                            See yours come <em className="text-gold-bright">alive</em>
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-ivory/60">
                            Try any design free with your own names. You only pay if you love it.
                        </p>
                        <Link to="/collections" className={`${goldButton} mt-7`}>
                            Try a design free
                        </Link>
                    </div>
                </section>
            </main>
        </ShopShell>
    );
}
