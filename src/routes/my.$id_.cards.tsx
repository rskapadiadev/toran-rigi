import { createFileRoute } from '@tanstack/react-router';

import { CardsPage } from '@/shop/cards/CardsPage';
import { ShopShell } from '@/shop/ShopShell';

export const Route = createFileRoute('/my/$id_/cards')({
    ssr: false,
    head: () => ({
        meta: [
            { title: 'Your cards · Toran' },
            {
                name: 'robots',
                content: 'noindex',
            },
        ],
    }),
    component: CardsRoute,
});

function CardsRoute() {
    const { id } = Route.useParams();
    return (
        <ShopShell>
            <CardsPage invitationId={id} />
        </ShopShell>
    );
}
