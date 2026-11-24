import { createFileRoute } from '@tanstack/react-router';

import { GuestsPage } from '@/shop/guests/GuestsPage';
import { ShopShell } from '@/shop/ShopShell';

export const Route = createFileRoute('/my/$id_/guests')({
    ssr: false,
    head: () => ({
        meta: [
            { title: 'Your guests · Toran' },
            {
                name: 'robots',
                content: 'noindex',
            },
        ],
    }),
    component: GuestsRoute,
});

function GuestsRoute() {
    const { id } = Route.useParams();
    return (
        <ShopShell>
            <GuestsPage invitationId={id} />
        </ShopShell>
    );
}
