import { occasionOf } from '@shared/occasions';
import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Rise, SectionHeading, TemplateTile } from '@/shop/landing';
import { ShopShell } from '@/shop/ShopShell';

import { fetchCatalogue } from '../server-fns/store';

export const Route = createFileRoute('/collections')({
    validateSearch: z.object({ occasion: z.string().max(40).optional() }),
    loader: () => fetchCatalogue(),
    head: () => ({
        meta: [
            { title: 'The collection · Toran' },
            {
                name: 'description',
                content: 'Living digital invitations for every tradition. Try any design free.',
            },
        ],
    }),
    component: Collections,
});

function Collections() {
    const { templates, currency } = Route.useLoaderData();
    const { occasion } = Route.useSearch();
    const kinds = [...new Set(templates.map((t) => t.eventKind))];
    const shown = occasion ? templates.filter((t) => t.eventKind === occasion) : templates;
    const chip = 'rounded-full border px-4 py-1.5 text-sm transition';
    const on = 'border-gold bg-gold text-night';
    const off = 'border-white/15 text-ivory/75 hover:border-white/30 hover:text-ivory';
    return (
        <ShopShell tone="dark" currency={currency}>
            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_20%_0%,rgba(195,154,78,0.2),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(110,26,46,0.6),transparent_55%)]" />
                <div className="relative mx-auto max-w-6xl px-5 pt-32">
                    <SectionHeading
                        eyebrow="The collection"
                        before="Find"
                        accent="your"
                        after="invitation"
                    />
                    <Rise delay={100}>
                        <p className="mt-4 max-w-xl text-ivory/60">
                            Every design is live. Open one to try it with your own names, ceremonies
                            and photos. Nothing is shared until you buy and publish.
                        </p>
                    </Rise>
                    {kinds.length > 1 && (
                        <Rise delay={160}>
                            <div className="mt-8 flex flex-wrap gap-2">
                                <Link
                                    to="/collections"
                                    search={{}}
                                    className={cn(chip, occasion ? off : on)}
                                >
                                    All
                                </Link>
                                {kinds.map((k) => (
                                    <Link
                                        key={k}
                                        to="/collections"
                                        search={{ occasion: k }}
                                        className={cn(chip, occasion === k ? on : off)}
                                    >
                                        {occasionOf(k).name.en}
                                    </Link>
                                ))}
                            </div>
                        </Rise>
                    )}
                    {shown.length > 0 ? (
                        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {shown.map((t, i) => (
                                <Rise key={t.slug} delay={(i % 3) * 90}>
                                    <TemplateTile template={t} currency={currency} />
                                </Rise>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-10 rounded-3xl border border-dashed border-white/15 p-10 text-center text-ivory/60">
                            New designs are on their way. Check back soon.
                        </p>
                    )}
                </div>
            </section>
        </ShopShell>
    );
}
