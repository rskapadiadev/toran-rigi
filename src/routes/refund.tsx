import { brand } from '@shared/brand';
import { REFUND_DAYS } from '@shared/policies';
import { createFileRoute } from '@tanstack/react-router';

import { Part, Points, policyHead, PolicyPage, textLink } from '@/shop/policies/kit';

import { fetchOrigin } from '../server-fns/store';

const LEAD = `Try any design free before you pay. Change your mind within ${String(REFUND_DAYS)} days, before publishing or downloading anything, and you get all your money back.`;

export const Route = createFileRoute('/refund')({
    loader: () => fetchOrigin(),
    head: ({ loaderData }) =>
        policyHead({
            title: 'Refunds and cancellation',
            lead: LEAD,
            path: '/refund',
            origin: loaderData?.origin,
        }),
    component: Refund,
});

function Refund() {
    return (
        <PolicyPage before="Refunds and" accent="cancellation" lead={LEAD}>
            <Part title="When you get a full refund">
                <Points>
                    <li>
                        You ask within {REFUND_DAYS} days of paying, and you have never published
                        your invitation or downloaded any of its cards, PDFs or videos.
                    </li>
                    <li>
                        You were charged twice, or charged the wrong amount. We return the extra.
                    </li>
                    <li>You paid but the invitation never reached your account.</li>
                    <li>
                        Something is broken, you told us, and we couldn’t fix it. This applies after
                        publishing or downloading too.
                    </li>
                </Points>
            </Part>
            <Part title="When we can’t refund">
                <p>
                    Once your invitation has been published, any of its files has been downloaded,
                    or {REFUND_DAYS} days have passed, the purchase is final unless something is
                    broken and we can’t fix it. A change of plans, date or venue isn’t a fault: you
                    can edit your invitation until the day after your last ceremony, at no cost.
                </p>
                <p>
                    Invitations our studio makes for you by hand follow what you agreed with us in
                    your quote.
                </p>
            </Part>
            <Part title="How to cancel and ask for a refund">
                <p>
                    Write to{' '}
                    <a href={`mailto:${brand.email}`} className={textLink}>
                        {brand.email}
                    </a>{' '}
                    from the email you signed in with, or message {brand.phone}. Tell us your order
                    number, which is under Payments in My invitations.
                </p>
            </Part>
            <Part title="When the money arrives">
                <p>
                    We send approved refunds within 5 working days, to the card, bank account or UPI
                    you paid with. Your bank can take another 5 to 7 working days to show it. Once
                    refunded, the invitation is taken out of your account.
                </p>
            </Part>
        </PolicyPage>
    );
}
