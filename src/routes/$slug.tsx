import { createFileRoute, notFound } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { InvitationView } from '../invitation/InvitationView';
import { applyTrial, PreviewBar, type Trial } from '../invitation/PreviewBar';
import { shareMeta } from '../lib/share-meta';
import { fetchInvitation } from '../server-fns/invitations';

const search = z.object({
    lang: z.string().max(5).optional(),
    g: z.string().max(64).optional(),
    // Set by the shop's template cards, which show the page in a small frame with no try bar.
    embed: z.coerce.string().max(4).optional(),
});

export const Route = createFileRoute('/$slug')({
    validateSearch: search,
    loaderDeps: ({ search: { g } }) => ({ g }),
    loader: async ({ params, deps }) => {
        const result = await fetchInvitation({
            data: {
                slug: params.slug,
                guestToken: deps.g,
            },
        });
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's notFound() idiom
        if (!result) throw notFound();
        return result;
    },
    head: ({ loaderData, params, match }) => {
        if (!loaderData) return {};
        const { invitation, origin, guest } = loaderData;
        const g = guest ? `&g=${encodeURIComponent(guest.token)}` : '';
        return {
            meta: shareMeta({
                source: invitation,
                origin,
                path: `/${params.slug}`,
                image: `/og/${params.slug}.png?v=${String(invitation.invitation.version)}${g}`,
                guestName: guest?.name,
                lang: match.search.lang,
            }),
        };
    },
    component: InvitationPage,
});

function InvitationPage() {
    const { invitation, guest } = Route.useLoaderData();
    const { lang, embed } = Route.useSearch();
    // Demos are template previews: visitors can try their own names and start an order.
    const [trial, setTrial] = useState<Trial | null>(null);
    const data = useMemo(() => applyTrial(invitation, trial), [invitation, trial]);
    return (
        <>
            <InvitationView data={data} initialLocale={lang} guest={guest} />
            {invitation.invitation.isDemo && embed === undefined && (
                <PreviewBar data={invitation} trial={trial} onTrial={setTrial} />
            )}
        </>
    );
}
