import { brand } from '@shared/brand';
import { MADE_NAME } from '@shared/made';
import { REFUND_DAYS, REPLY_TIME } from '@shared/policies';
import { createFileRoute, Link } from '@tanstack/react-router';

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
                        your invitation or downloaded any of its cards, posts, PDFs or videos.
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
                <p>Bespoke work our studio quotes for you follows what you agreed in the quote.</p>
            </Part>
            <Part title="If we make it for you">
                <p>
                    The {MADE_NAME.toLowerCase()} fee is refunded in full until you send us your
                    details. Once you have, our studio has started on it, so the fee isn’t refunded,
                    unless we can’t deliver your first look. The design itself follows the rules
                    above.
                </p>
            </Part>
            <Part title="If money left your account but no order showed up">
                <p>
                    Sometimes a bank takes the money but the payment doesn’t go through. Your bank
                    or Razorpay usually returns it on its own within 5 to 7 working days. If it
                    hasn’t come back by then, write to us with the payment ID, the date and the
                    amount, and we’ll chase it for you.
                </p>
            </Part>
            <Part title="How to cancel and ask for a refund">
                <p>
                    Write to{' '}
                    <a href={`mailto:${brand.email}`} className={textLink}>
                        {brand.email}
                    </a>{' '}
                    from the email you signed in with, or message {brand.phone}. Please tell us:
                </p>
                <Points>
                    <li>Your order number, which is under Payments in My invitations.</li>
                    <li>The email you signed in with.</li>
                    <li>
                        The payment ID from Razorpay’s email or message (it starts with “pay_”), the
                        date and the amount.
                    </li>
                </Points>
                <p>We reply within {REPLY_TIME}.</p>
            </Part>
            <Part title="When the money arrives">
                <p>
                    We send approved refunds within 5 working days, to the card, bank account or UPI
                    you paid with. Your bank can take another 5 to 7 working days to show it. Once
                    refunded, the invitation is taken out of your account.
                </p>
            </Part>
            <Part title="Deleting your account">
                <p>
                    If you want a refund, ask for it before you ask us to delete your account. Once
                    it’s deleted, your invitation and its link are gone for good.
                </p>
            </Part>
            <Part title="Your legal rights">
                <p>
                    This rule adds to your rights under the Consumer Protection Act, 2019 and takes
                    none of them away. If you’re unhappy with our answer, see Complaints on{' '}
                    <Link to="/contact" className={textLink}>
                        Contact
                    </Link>
                    .
                </p>
            </Part>
        </PolicyPage>
    );
}
