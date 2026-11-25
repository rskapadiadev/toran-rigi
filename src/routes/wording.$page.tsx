import { wordingLocales } from '@shared/wording/types';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useState } from 'react';

import { canonical, guideData, pageMeta } from '@/lib/share-meta';
import { goldButton, GuideFaqs, GuideHeader, GuideLinks, GuideSection } from '@/shop/guides/kit';
import { Languages, MessageCard, WordingCard } from '@/shop/guides/Words';
import { ShopShell } from '@/shop/ShopShell';

import { fetchWordingGuide } from '../server-fns/guides';

const order = ['en', 'hi', 'gu'];

export const Route = createFileRoute('/wording/$page')({
    loader: async ({ params }) => {
        const result = await fetchWordingGuide({ data: { slug: params.page } });
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's notFound() idiom
        if (!result) throw notFound();
        return result;
    },
    head: ({ loaderData, params }) => {
        if (!loaderData) return {};
        const { guide, page, origin } = loaderData;
        const path = `/wording/${params.page}`;
        return {
            links: [canonical(origin, path)],
            meta: pageMeta({
                title: `${guide.name} invitation wording · Toran`,
                description: page.lead,
                path,
                origin,
                image: '/share/toran.jpg?v=1',
                imageType: 'image/jpeg',
                imageAlt: 'Three Toran invitations on phones',
            }),
            scripts: guideData(
                origin,
                [
                    {
                        name: 'Wording',
                        path: '/wording',
                    },
                    {
                        name: guide.name,
                        path,
                    },
                ],
                page.faqs,
            ),
        };
    },
    component: WordingPage,
});

function WordingPage() {
    const data = Route.useLoaderData();
    const { guide, page, wordings, messages, designs, solemn } = data;
    const [locale, setLocale] = useState('en');
    const languages = order.filter((l) => wordings.some((w) => wordingLocales(w).includes(l)));
    return (
        <ShopShell tone="dark">
            <GuideHeader
                parent="wording"
                name={guide.name}
                before={guide.name}
                accent={solemn ? 'wording' : 'invitation wording'}
                lead={page.lead}
            >
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Languages options={languages} value={locale} onChange={setLocale} />
                </div>
            </GuideHeader>

            <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-5">
                <h2 className="sr-only">Wording to copy</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {wordings.map((w, i) => (
                        <WordingCard
                            key={w.id}
                            wording={w}
                            locale={locale}
                            sample={data.sample}
                            greeting={data.greeting}
                            design={designs.length > 0 ? designs[i % designs.length] : undefined}
                        />
                    ))}
                </div>
                <p className="mt-4 text-xs text-ivory/45">Names are examples.</p>
            </section>

            <GuideSection title="How to word it">
                <div className="grid gap-8 md:grid-cols-2">
                    <p className="leading-relaxed text-ivory/75">{page.body}</p>
                    <div>
                        <h3 className="text-[11px] tracking-[0.25em] text-gold uppercase">
                            What to include
                        </h3>
                        <ul className="mt-3 list-disc space-y-1.5 ps-5 text-sm text-ivory/75 marker:text-gold">
                            {page.include.map((line) => (
                                <li key={line}>{line}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </GuideSection>

            {messages.length > 0 && (
                <GuideSection title={solemn ? 'A message to send' : 'WhatsApp messages'}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {messages.map((m) => (
                            <MessageCard key={m.id} message={m} locale={locale} />
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-ivory/45">
                        {'{name}'} is your guest and {'{link}'} your invitation. Your guest list
                        fills them in for you.
                    </p>
                </GuideSection>
            )}

            {data.hasDesigns && (
                <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-5 sm:pt-20">
                    <div className="rounded-[32px] border border-gold/20 bg-[radial-gradient(circle_at_50%_0%,rgba(195,154,78,0.25),transparent_60%),linear-gradient(180deg,#4a0f1f,#120b0d)] px-6 py-12 text-center">
                        <h2 className="font-display text-3xl text-ivory md:text-4xl">
                            {solemn
                                ? 'A quiet page for these words'
                                : 'See these words on an invitation'}
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-sm text-ivory/65">
                            {solemn
                                ? 'Choose a calm design, add the details and share one link.'
                                : 'Try any design free with your own names. You pay only when you love it.'}
                        </p>
                        <Link
                            to="/invitations/$page"
                            params={{ page: guide.slug }}
                            className={`mt-6 ${goldButton}`}
                        >
                            {guide.name} designs
                        </Link>
                    </div>
                </section>
            )}

            <GuideFaqs faqs={page.faqs} />
            <GuideLinks title="More wording" to="/wording/$page" guides={data.related} />
        </ShopShell>
    );
}
