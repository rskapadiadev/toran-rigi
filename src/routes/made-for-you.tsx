import { brand } from '@shared/brand';
import { whatsappLink } from '@shared/guests';
import { MADE_HOURS, MADE_ROUNDS, madeRequest } from '@shared/made';
import { formatMoney } from '@shared/money';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Check, MessageCircle, X } from 'lucide-react';

import { canonical, guideData, pageMeta } from '@/lib/share-meta';
import { goldButton, GuideFaqs, GuideSection, quietButton } from '@/shop/guides/kit';
import { Settle } from '@/shop/landing';
import { ShopShell } from '@/shop/ShopShell';

import { fetchMadeOffer } from '../server-fns/made';

const PATH = '/made-for-you';
const TITLE = 'We make your invitation for you · Toran';
const LEAD = `Send us your details or a photo of your printed card. Our studio makes your living invitation, and your first look comes within ${String(MADE_HOURS)} hours.`;

const steps = [
    {
        title: 'Choose a design',
        body: 'Pick any design in the collection and tick “We make it for you” when you buy.',
    },
    {
        title: 'Send your details',
        body: 'Names, family, each ceremony, and any photos. A picture of your printed card is fine.',
    },
    {
        title: 'See your first look',
        body: `Within ${String(MADE_HOURS)} hours of everything we need, ready on your phone.`,
    },
    {
        title: 'Publish and share',
        body: `Ask for up to ${String(MADE_ROUNDS)} rounds of changes, then publish your link.`,
    },
];

const included = [
    `Your first look within ${String(MADE_HOURS)} hours of your complete details`,
    `${String(MADE_ROUNDS)} rounds of changes, all your changes together in each`,
    'Your names, words, ceremonies, photos and music set for you',
    'More languages, if you send the words in them',
    'Matching cards and a PDF, as with every invitation',
];

const excluded = [
    'A new design made from scratch',
    'Checking spellings and dates for you: we copy what you send',
    'More than two rounds of changes (we tell you the price first)',
];

const faqs = [
    {
        q: 'What do I need to send?',
        a: 'The names as they should be written, the family who is inviting, and each ceremony with its day, time and place. Photos and a song if you have them. A photo of your printed card covers most of it.',
    },
    {
        q: 'When does the 48 hours start?',
        a: 'When we have everything we need. If something is missing we ask you straight away, and the clock waits for your answer.',
    },
    {
        q: 'Can I still change things myself?',
        a: 'Yes. Once you have your first look you can fix small things yourself in Edit, or send us your changes.',
    },
    {
        q: 'Who sees it before I publish?',
        a: 'Only you and our studio. Nothing is sent to guests until you publish.',
    },
    {
        q: 'Is the design included?',
        a: 'No: you pay for the design you choose, and this on top, once.',
    },
];

export const Route = createFileRoute('/made-for-you')({
    loader: () => fetchMadeOffer(),
    head: ({ loaderData }) => {
        const origin = loaderData?.origin ?? '';
        return {
            links: [canonical(origin, PATH)],
            meta: pageMeta({
                title: TITLE,
                description: LEAD,
                path: PATH,
                origin,
                image: '/share/toran.jpg?v=1',
                imageType: 'image/jpeg',
                imageAlt: 'Three Toran invitations on phones',
            }),
            scripts: guideData(
                origin,
                [
                    {
                        name: 'We make it for you',
                        path: PATH,
                    },
                ],
                faqs,
            ),
        };
    },
    component: MadeForYou,
});

const askUs = whatsappLink(brand.whatsapp, madeRequest());

function Ask({ primary }: { primary: boolean }) {
    return (
        <a
            href={askUs}
            target="_blank"
            rel="noreferrer"
            className={primary ? goldButton : quietButton}
        >
            <MessageCircle className="me-1.5 size-4" /> Ask us on WhatsApp
        </a>
    );
}

function MadeForYou() {
    const { currency, price, online } = Route.useLoaderData();
    const cost = price === null ? null : formatMoney(price, currency);
    return (
        <ShopShell tone="dark" currency={currency}>
            <header className="relative isolate">
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_20%_0%,rgba(195,154,78,0.2),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(110,26,46,0.6),transparent_55%)] [mask-image:linear-gradient(black_40%,transparent)]" />
                <Settle className="relative mx-auto max-w-6xl px-4 pt-28 sm:px-5 sm:pt-32">
                    <p className="text-[11px] tracking-[0.35em] text-gold uppercase">
                        Done for you
                    </p>
                    <h1 className="mt-4 font-display text-4xl leading-[1.05] text-balance text-ivory sm:text-5xl md:text-6xl">
                        We make it <em className="text-gold-bright">for you</em>
                    </h1>
                    <p className="mt-4 max-w-2xl leading-relaxed text-ivory/70">{LEAD}</p>
                    {cost && (
                        <p className="mt-5 font-display text-3xl text-ivory">
                            {cost}{' '}
                            <span className="font-sans text-sm text-ivory/55">
                                on top of your design, once
                            </span>
                        </p>
                    )}
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                        {online ? (
                            <>
                                <Link to="/collections" className={goldButton}>
                                    Choose a design
                                </Link>
                                <Ask primary={false} />
                            </>
                        ) : (
                            <>
                                <Ask primary />
                                <Link to="/collections" className={quietButton}>
                                    See the designs
                                </Link>
                            </>
                        )}
                    </div>
                    {!online && (
                        <p className="mt-3 text-xs text-ivory/50">
                            Tell us the design you like, or ask us to suggest one.
                        </p>
                    )}
                </Settle>
            </header>
            <GuideSection title="How it works">
                <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, i) => (
                        <li key={step.title} className="border-t border-white/10 pt-5">
                            <p className="font-display text-3xl text-gold-bright italic">
                                {String(i + 1).padStart(2, '0')}
                            </p>
                            <h3 className="mt-2 font-display text-2xl text-ivory">{step.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-ivory/60">
                                {step.body}
                            </p>
                        </li>
                    ))}
                </ol>
            </GuideSection>
            <GuideSection title="What you get">
                <div className="grid gap-8 md:grid-cols-2">
                    <ul className="space-y-3">
                        {included.map((line) => (
                            <li key={line} className="flex gap-3 text-ivory/80">
                                <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-gold" />
                                {line}
                            </li>
                        ))}
                    </ul>
                    <div>
                        <p className="mb-3 text-[11px] tracking-[0.3em] text-ivory/50 uppercase">
                            Not included
                        </p>
                        <ul className="space-y-3">
                            {excluded.map((line) => (
                                <li key={line} className="flex gap-3 text-ivory/60">
                                    <X
                                        aria-hidden
                                        className="mt-0.5 size-5 shrink-0 text-ivory/35"
                                    />
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </GuideSection>
            <GuideFaqs faqs={faqs} />
            <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-5">
                <div className="rounded-[28px] border border-gold/20 bg-[radial-gradient(circle_at_50%_0%,rgba(195,154,78,0.2),transparent_60%),linear-gradient(180deg,#4a0f1f,#120b0d)] px-6 py-12 text-center">
                    <h2 className="font-display text-4xl text-ivory">
                        Rather do it <em className="text-gold-bright">yourself?</em>
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-ivory/60">
                        Every design can be tried free with your own names, and edited by you
                        whenever you like.
                    </p>
                    <Link to="/collections" className={`${goldButton} mt-7`}>
                        Try a design free
                    </Link>
                </div>
            </section>
        </ShopShell>
    );
}
