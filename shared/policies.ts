// The pages the law and the payment service ask every shop to show, in the footer's order.
export const policyPages = [
    {
        path: '/contact',
        name: 'Contact',
    },
    {
        path: '/terms',
        name: 'Terms',
    },
    {
        path: '/privacy',
        name: 'Privacy',
    },
    {
        path: '/refund',
        name: 'Refunds',
    },
    {
        path: '/delivery',
        name: 'Delivery',
    },
] as const;

// Change it whenever the words of a policy change.
export const POLICIES_UPDATED = '27 November 2026';

export const REFUND_DAYS = 7;

interface RefundFacts {
    paidAt: string | null;
    publishedAt: string | null;
    downloaded: boolean;
    now: number;
}

// A change of mind is refunded until they publish, take a file, or the days run out.
export const refundOpen = ({ paidAt, publishedAt, downloaded, now }: RefundFacts): boolean =>
    paidAt !== null &&
    publishedAt === null &&
    !downloaded &&
    now < Date.parse(paidAt) + REFUND_DAYS * 86_400_000;
