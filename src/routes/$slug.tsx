import { createFileRoute, notFound } from '@tanstack/react-router';
import { z } from 'zod';

import { InvitationView } from '../invitation/InvitationView';
import { shareMeta } from '../lib/share-meta';
import { fetchInvitation } from '../server-fns/invitations';

const search = z.object({
    lang: z.string().max(5).optional(),
    g: z.string().max(64).optional(),
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
    const { lang } = Route.useSearch();
    return <InvitationView data={invitation} initialLocale={lang} guest={guest} />;
}
