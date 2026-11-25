import { brand } from '@shared/brand';
import { createFileRoute, Link } from '@tanstack/react-router';

import { Part, policyHead, PolicyPage, textLink } from '@/shop/policies/kit';

import { fetchOrigin } from '../server-fns/store';

const LEAD =
    'Everything we sell is digital. Your invitation appears in your account as soon as your payment is confirmed; nothing is posted to you.';

export const Route = createFileRoute('/delivery')({
    loader: () => fetchOrigin(),
    head: ({ loaderData }) =>
        policyHead({
            title: 'Delivery',
            lead: LEAD,
            path: '/delivery',
            origin: loaderData?.origin,
        }),
    component: Delivery,
});

function Delivery() {
    return (
        <PolicyPage before="How it" accent="reaches you" lead={LEAD}>
            <Part title="How long it takes">
                <p>
                    Usually a few seconds after you pay. If your bank is slow to confirm, it can
                    take up to 30 minutes. You don’t need to keep the page open.
                </p>
            </Part>
            <Part title="Where to find it">
                <p>
                    Sign in to{' '}
                    <Link to="/my" className={textLink}>
                        My invitations
                    </Link>{' '}
                    with the email you used to buy. Your invitation stays private until you publish
                    it. Then you share its link yourself, on WhatsApp or anywhere else.
                </p>
            </Part>
            <Part title="Cards and PDFs">
                <p>
                    Matching cards, PDFs and videos are downloads from the same place. We don’t
                    print or ship anything, so there are no delivery charges.
                </p>
            </Part>
            <Part title="If it hasn’t arrived">
                <p>
                    Message {brand.phone} or write to{' '}
                    <a href={`mailto:${brand.email}`} className={textLink}>
                        {brand.email}
                    </a>
                    . If you paid and we can’t deliver your invitation, you get all your money back.
                </p>
            </Part>
        </PolicyPage>
    );
}
