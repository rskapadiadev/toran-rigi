import { createFileRoute } from '@tanstack/react-router';

import { canonical, pageMeta } from '@/lib/share-meta';
import { GuideIndex } from '@/shop/guides/GuideIndex';
import { IndexHeader } from '@/shop/guides/kit';
import { ShopShell } from '@/shop/ShopShell';

import { fetchGuides } from '../server-fns/guides';

const TITLE = 'Digital invitations by occasion and tradition · Toran';
const LEAD =
    'Living invitations for Hindu, Muslim, Sikh, Jain, Christian, Jewish and interfaith weddings, and for every celebration and remembrance around them.';

export const Route = createFileRoute('/invitations/')({
    loader: () => fetchGuides(),
    head: ({ loaderData }) => {
        const origin = loaderData?.origin ?? '';
        return {
            links: [canonical(origin, '/invitations')],
            meta: pageMeta({
                title: TITLE,
                description: LEAD,
                path: '/invitations',
                origin,
                image: '/share/toran.jpg?v=1',
                imageType: 'image/jpeg',
                imageAlt: 'Three Toran invitations on phones',
            }),
        };
    },
    component: InvitationsIndex,
});

function InvitationsIndex() {
    const { groups } = Route.useLoaderData();
    return (
        <ShopShell tone="dark">
            <IndexHeader before="An invitation for" accent="your occasion" lead={LEAD} />
            <GuideIndex groups={groups} of="invitations" />
        </ShopShell>
    );
}
