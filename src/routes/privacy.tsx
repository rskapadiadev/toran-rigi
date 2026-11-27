import { brand } from '@shared/brand';
import { createFileRoute, Link } from '@tanstack/react-router';

import { Part, Points, policyHead, PolicyPage, textLink } from '@/shop/policies/kit';

import { fetchOrigin } from '../server-fns/store';

const LEAD =
    'What we keep, why, who helps us keep it, and how to have it removed. We don’t sell your details or show ads.';

export const Route = createFileRoute('/privacy')({
    loader: () => fetchOrigin(),
    head: ({ loaderData }) =>
        policyHead({
            title: 'Privacy',
            lead: LEAD,
            path: '/privacy',
            origin: loaderData?.origin,
        }),
    component: Privacy,
});

function Privacy() {
    return (
        <PolicyPage before="Your" accent="privacy" lead={LEAD}>
            <Part title="Who looks after your details">
                <p>
                    {brand.legalName}, {brand.address}, which runs Toran. Reach us at{' '}
                    <a href={`mailto:${brand.email}`} className={textLink}>
                        {brand.email}
                    </a>{' '}
                    or {brand.phone}.
                </p>
            </Part>
            <Part title="If you’re a customer">
                <Points>
                    <li>
                        <b className="text-ivory">Your email</b>, to sign you in with a code, and
                        your name and country, for your order.
                    </li>
                    <li>
                        <b className="text-ivory">Your invitation</b>: the words, photos, music and
                        dates you add, and your guest list if you make one.
                    </li>
                    <li>
                        <b className="text-ivory">Your orders</b>: what you bought, the amount, the
                        payment’s reference, and whether you downloaded a file, as that ends your
                        refund. Card, bank and UPI details go straight to Razorpay and never reach
                        us.
                    </li>
                    <li>
                        <b className="text-ivory">While you try a design</b>, your words stay on
                        your own device for a day and your photos stay in the open tab. Nothing
                        reaches us until you press Pay: then we keep the words you send with it.
                    </li>
                    <li>
                        <b className="text-ivory">If we make it for you</b>, the details and files
                        you send us for it. Only you and our studio can open them.
                    </li>
                    <li>
                        <b className="text-ivory">If you message us</b>, what you send.
                    </li>
                </Points>
            </Part>
            <Part title="If you’re a guest">
                <p>
                    The family inviting you may add your name and number to their guest list. If you
                    reply or leave a wish, we keep what you type, such as your name, number, who is
                    coming and food needs. The family sees it, and wishes they approve are shown on
                    the invitation. We use it for nothing else. We don’t track guests or build
                    profiles of them. To have your details removed, ask the family or write to us.
                </p>
            </Part>
            <Part title="Everyone who visits">
                <p>
                    We use your internet address for a moment, to show prices in your currency and
                    to stop abuse. We don’t keep it with your details.
                </p>
            </Part>
            <Part title="Who helps us">
                <p>We share only what each one needs to do its part:</p>
                <Points>
                    <li>
                        <b className="text-ivory">Cloudflare</b> runs our site and stores our data.
                        When our studio translates an invitation, the words to translate go through
                        its translation service.
                    </li>
                    <li>
                        <b className="text-ivory">Razorpay</b> takes payments. We send it the amount
                        and our reference; anything else you type in its window, you give to
                        Razorpay.
                    </li>
                    <li>
                        <b className="text-ivory">Resend</b> delivers our emails.
                    </li>
                    <li>
                        <b className="text-ivory">YouTube, Google Maps and WhatsApp</b> only if you
                        press their buttons on an invitation.
                    </li>
                </Points>
                <p>
                    Some of these store data outside India. We also hand over what the law requires,
                    when it requires it.
                </p>
            </Part>
            <Part title="Cookies">
                <p>
                    Only ones the site needs: one that keeps you signed in for 60 days, one that
                    remembers your currency for a year, and one that remembers how you left the
                    menu. Your device also remembers the words you’re trying and the hearts you’ve
                    given. No advertising or tracking cookies.
                </p>
            </Part>
            <Part title="How long we keep it">
                <Points>
                    <li>Your invitation and guest list: until you ask us to delete them.</li>
                    <li>Words sent with a payment you didn’t finish: 30 days.</li>
                    <li>Orders and invoices: as long as Indian tax law requires.</li>
                </Points>
            </Part>
            <Part title="Your choices">
                <p>
                    Ask us for a copy of your details, to correct them, to delete them, or to stop
                    using them, and we’ll do it within 30 days, keeping only what the law says we
                    must. You can also name someone to act for you. Write from the email you signed
                    in with. If you’re not happy with our answer, use the complaints address on{' '}
                    <Link to="/contact" className={textLink}>
                        Contact
                    </Link>
                    ; after that you can go to the Data Protection Board of India.
                </p>
            </Part>
            <Part title="Children">
                <p>
                    Accounts are for adults. If a child is in your photos or named on your
                    invitation, you confirm you’re their parent or have their parent’s consent.
                </p>
            </Part>
            <Part title="Safety">
                <p>
                    Everything travels encrypted, sign-in uses one-time codes instead of passwords,
                    and only you and our studio can open your details. If something ever goes wrong
                    with your data, we’ll tell you.
                </p>
            </Part>
        </PolicyPage>
    );
}
