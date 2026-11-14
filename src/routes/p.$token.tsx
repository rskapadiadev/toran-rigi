import { createFileRoute, notFound } from '@tanstack/react-router';

import { InvitationView } from '../invitation/InvitationView';
import { shareMeta } from '../lib/share-meta';
import { fetchPreview } from '../server-fns/invitations';

// Private preview link for unpublished drafts (noindex); shared with the couple for approval.
export const Route = createFileRoute('/p/$token')({
    loader: async ({ params }) => {
        const data = await fetchPreview({ data: { token: params.token } });
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's notFound() idiom
        if (!data) throw notFound();
        return data;
    },
    // Drafts get the same rich card (couples share these for approval) but stay out of search.
    head: ({ loaderData, params }) => ({
        meta: [
            ...(loaderData
                ? shareMeta({
                      source: loaderData.invitation,
                      origin: loaderData.origin,
                      path: `/p/${params.token}`,
                      image: `/og/p/${params.token}.png`,
                  })
                : [{ title: 'Preview — Toran' }]),
            {
                name: 'robots',
                content: 'noindex, nofollow',
            },
        ],
    }),
    component: Preview,
});

function Preview() {
    const { invitation } = Route.useLoaderData();
    return (
        <>
            <div className="fixed inset-x-0 bottom-0 z-[60] bg-night/90 py-2 text-center text-xs tracking-widest text-ivory uppercase">
                Preview · not yet published
            </div>
            <InvitationView data={invitation} />
        </>
    );
}
