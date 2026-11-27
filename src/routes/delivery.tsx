import { brand } from '@shared/brand';
import { MADE_HOURS } from '@shared/made';
import { REFUND_DAYS, REPLY_TIME } from '@shared/policies';
import { createFileRoute, Link } from '@tanstack/react-router';

import { Part, Points, policyHead, PolicyPage, textLink } from '@/shop/policies/kit';

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
            <Part title="Your link">
                <Points>
                    <li>
                        It goes live the moment you publish. Changes you save after that show on it
                        straight away.
                    </li>
                    <li>
                        It stays online for at least the months shown with your design, counted from
                        the day you first publish.
                    </li>
                    <li>
                        After that it becomes a quiet thank-you keepsake: your names, the date and
                        your photos, at the same link. Replies, guests’ details and venue details
                        come off it.
                    </li>
                </Points>
            </Part>
            <Part title="If we make it for you">
                <p>
                    Your invitation appears in your account straight away, and we make it there.
                    Your first look comes within {MADE_HOURS} hours of your complete details, and we
                    email you when it’s ready.
                </p>
            </Part>
            <Part title="Cards, posts and PDFs">
                <p>
                    They’re ready to download from Cards in My invitations as soon as your payment
                    is confirmed. Each one is made when you first ask for it, which takes a few
                    seconds. Look them over first: your first download ends your {REFUND_DAYS}-day
                    refund.
                </p>
            </Part>
            <Part title="Videos">
                <p>
                    Videos are made on your own phone or computer, from your invitation. It takes a
                    little while, longer on an older phone, so keep the screen open until it’s done.
                    Then share it or save it. This works in the latest Chrome, or in Safari on an
                    iPhone with iOS 17 or newer.
                </p>
            </Part>
            <Part title="Printing">
                <p>
                    We don’t print or ship anything. The printed invitation is a two-sided 5 × 7
                    inch PDF, drawn at 600 dots to the inch with bleed and crop marks, so any print
                    shop can print it as it is.
                </p>
            </Part>
            <Part title="No delivery charges">
                <p>Nothing is shipped, so there is nothing to pay for delivery.</p>
            </Part>
            <Part title="If something hasn’t arrived">
                <p>
                    If your invitation isn’t in your account or a download won’t work, message{' '}
                    {brand.phone} or write to{' '}
                    <a href={`mailto:${brand.email}`} className={textLink}>
                        {brand.email}
                    </a>
                    . We usually put it right within {REPLY_TIME}. If you paid and we can’t deliver
                    your invitation, you get all your money back.
                </p>
            </Part>
        </PolicyPage>
    );
}
