import { pickText } from '@shared/cultures';
import { titleOf } from '@shared/people';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { z } from 'zod';

import { InvitationView } from '../invitation/InvitationView';
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
    head: ({ loaderData }) => {
        if (!loaderData) return {};
        const { content, locales } = loaderData.invitation.invitation;
        const locale = locales[0] ?? 'en';
        const title = titleOf(content, locale);
        const description = pickText(content.headline, locale);
        return {
            meta: [
                { title: `${title} — Toran` },
                {
                    name: 'description',
                    content: description,
                },
                {
                    property: 'og:title',
                    content: title,
                },
                {
                    property: 'og:description',
                    content: description,
                },
                {
                    property: 'og:type',
                    content: 'website',
                },
                {
                    name: 'twitter:card',
                    content: 'summary_large_image',
                },
                {
                    name: 'theme-color',
                    content: loaderData.invitation.invitation.design.palette.bg,
                },
            ],
        };
    },
    component: InvitationPage,
});

function InvitationPage() {
    const { invitation, guest } = Route.useLoaderData();
    const { lang } = Route.useSearch();
    return <InvitationView data={invitation} initialLocale={lang} guest={guest} />;
}
