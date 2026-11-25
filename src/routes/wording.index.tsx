import { createFileRoute } from '@tanstack/react-router';

import { canonical, pageMeta } from '@/lib/share-meta';
import { GuideIndex } from '@/shop/guides/GuideIndex';
import { IndexHeader } from '@/shop/guides/kit';
import { ShopShell } from '@/shop/ShopShell';

import { fetchGuides } from '../server-fns/guides';

const TITLE = 'Invitation wording for every occasion · Toran';
const LEAD =
    'Ready invitation wording for weddings, griha pravesh, naming, birthdays, puja and prayer meets, in English, Hindi and Gujarati. Copy it or try it on a design.';

export const Route = createFileRoute('/wording/')({
    loader: () => fetchGuides(),
    head: ({ loaderData }) => {
        const origin = loaderData?.origin ?? '';
        return {
            links: [canonical(origin, '/wording')],
            meta: pageMeta({
                title: TITLE,
                description: LEAD,
                path: '/wording',
                origin,
                image: '/share/toran.jpg?v=1',
                imageType: 'image/jpeg',
                imageAlt: 'Three Toran invitations on phones',
            }),
        };
    },
    component: WordingIndex,
});

function WordingIndex() {
    const { groups } = Route.useLoaderData();
    return (
        <ShopShell tone="dark">
            <IndexHeader before="Find the" accent="right words" lead={LEAD} />
            <GuideIndex groups={groups} of="wording" />
        </ShopShell>
    );
}
