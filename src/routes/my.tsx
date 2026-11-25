import { createFileRoute } from '@tanstack/react-router';

import { PortalShell } from '@/shop/portal/PortalShell';

// Everything a signed-in customer has: invitations, guests, cards and payments.
export const Route = createFileRoute('/my')({
    ssr: false,
    head: () => ({
        meta: [
            { title: 'My invitations · Toran' },
            {
                name: 'robots',
                content: 'noindex',
            },
        ],
    }),
    component: PortalShell,
});
