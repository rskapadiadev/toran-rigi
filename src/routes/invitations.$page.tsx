import { createFileRoute, Link, notFound } from '@tanstack/react-router';

import { canonical, guideData, pageMeta } from '@/lib/share-meta';
import {
    goldButton,
    GuideFaqs,
    GuideHeader,
    GuideLinks,
    GuideSection,
    quietButton,
} from '@/shop/guides/kit';
import { WordingCard } from '@/shop/guides/Words';
import { TemplateTile } from '@/shop/landing';
import { ShopShell } from '@/shop/ShopShell';

import { fetchDesignGuide } from '../server-fns/guides';

export const Route = createFileRoute('/invitations/$page')({
    loader: async ({ params }) => {
        const result = await fetchDesignGuide({ data: { slug: params.page } });
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's notFound() idiom
        if (!result) throw notFound();
        return result;
    },
    head: ({ loaderData, params }) => {
        if (!loaderData) return {};
        const { guide, page, origin } = loaderData;
        const path = `/invitations/${params.page}`;
        return {
            links: [canonical(origin, path)],
            meta: pageMeta({
                title: loaderData.solemn
                    ? `${guide.name}: a quiet page to share · Toran`
                    : `${guide.name} invitations, digital and living · Toran`,
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
                        name: 'Designs by occasion',
                        path: '/invitations',
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
    component: DesignsPage,
});

function DesignsPage() {
    const data = Route.useLoaderData();
    const { guide, page, own, more, currency, solemn } = data;
    const first = own[0];
    return (
        <ShopShell tone="dark" currency={currency}>
            <GuideHeader
                parent="invitations"
                name={guide.name}
                before={guide.name}
                accent={solemn ? 'designs' : 'invitations'}
                lead={page.lead}
            >
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    {first && (
                        <Link to="/try/$slug" params={{ slug: first.slug }} className={goldButton}>
                            {solemn ? `Open ${first.name}` : `Try ${first.name} free`}
                        </Link>
                    )}
                    <Link to="/wording/$page" params={{ page: guide.slug }} className={quietButton}>
                        Wording ideas
                    </Link>
                </div>
            </GuideHeader>

            <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-5">
                <h2 className="sr-only">Designs</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {own.map((t) => (
                        <TemplateTile key={t.slug} template={t} currency={currency} />
                    ))}
                </div>
            </section>

            <GuideSection title="What it carries">
                <div className="grid gap-8 md:grid-cols-2">
                    <p className="leading-relaxed text-ivory/75">{page.body}</p>
                    {data.ceremonies.length > 0 && (
                        <div>
                            <h3 className="text-[11px] tracking-[0.25em] text-gold uppercase">
                                Ceremonies ready to add
                            </h3>
                            <ul className="mt-3 flex flex-wrap gap-2">
                                {data.ceremonies.map((name) => (
                                    <li
                                        key={name}
                                        className="rounded-full border border-white/10 px-3 py-1 text-sm text-ivory/75"
                                    >
                                        {name}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-3 text-xs text-ivory/45">
                                Or write your own, in your own words.
                            </p>
                        </div>
                    )}
                </div>
            </GuideSection>

            <GuideSection title="Words to start from">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {data.words.map((w, i) => (
                        <WordingCard
                            key={w.id}
                            wording={w}
                            locale="en"
                            sample={data.sample}
                            greeting={null}
                            design={own[i % own.length]}
                        />
                    ))}
                </div>
                <Link
                    to="/wording/$page"
                    params={{ page: guide.slug }}
                    className={`mt-6 ${quietButton}`}
                >
                    All {guide.name.toLowerCase()} wording
                </Link>
            </GuideSection>

            {more.length > 0 && (
                <GuideSection title="Others you may like">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {more.slice(0, 6).map((t) => (
                            <TemplateTile key={t.slug} template={t} currency={currency} />
                        ))}
                    </div>
                </GuideSection>
            )}

            <GuideFaqs faqs={page.faqs} />
            <GuideLinks title="More designs" to="/invitations/$page" guides={data.related} />
        </ShopShell>
    );
}
