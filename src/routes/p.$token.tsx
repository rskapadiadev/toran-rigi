import { createFileRoute, notFound } from '@tanstack/react-router';

import { InvitationView } from '../invitation/InvitationView';
import { fetchPreview } from '../server-fns/invitations';

// Private preview link for unpublished drafts (noindex); shared with the couple for approval.
export const Route = createFileRoute('/p/$token')({
    loader: async ({ params }) => {
        const data = await fetchPreview({ data: { token: params.token } });
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's notFound() idiom
        if (!data) throw notFound();
        return data;
    },
    head: () => ({
        meta: [
            { title: 'Preview — Toran' },
            {
                name: 'robots',
                content: 'noindex, nofollow',
            },
        ],
    }),
    component: Preview,
});

function Preview() {
    const data = Route.useLoaderData();
    return (
        <>
            <div className="fixed inset-x-0 bottom-0 z-[60] bg-night/90 py-2 text-center text-xs tracking-widest text-ivory uppercase">
                Preview · not yet published
            </div>
            <InvitationView data={data} />
        </>
    );
}
