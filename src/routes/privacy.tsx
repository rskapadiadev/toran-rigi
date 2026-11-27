import { brand } from '@shared/brand';
import { MADE_NAME } from '@shared/made';
import { DELETE_DAYS, RECORDS_YEARS } from '@shared/policies';
import { createFileRoute } from '@tanstack/react-router';

import { Grievance, Part, Points, policyHead, PolicyPage, textLink } from '@/shop/policies/kit';

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
                    {brand.legalName}, {brand.address}, which runs Toran. Under the Digital Personal
                    Data Protection Act, 2023, we are the “data fiduciary” for your details: we
                    decide why and how they’re used, and we answer for them. Reach us at{' '}
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
                <p>
                    We never message guests ourselves. The family sends each link from their own
                    phone, on WhatsApp or however they like, and we send guests no emails or texts.
                </p>
            </Part>
            <Part title="Everyone who visits">
                <p>
                    We use your internet address for a moment, to show prices in your currency and
                    to stop abuse. We don’t keep it with your details.
                </p>
            </Part>
            <Part title="Photos">
                <p>
                    Photos you add to your invitation are resized on your own device before they
                    reach us, and the copy we keep carries none of the hidden details a camera adds,
                    such as where the photo was taken. Files you send us for “{MADE_NAME}” are kept
                    just as you sent them, so they may still have those details; only you and our
                    studio can open them.
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
                    when it requires it. We never sell your details, and never use your words,
                    photos or guest list to train AI.
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
                    <li>
                        When its months online are over, your invitation becomes a thank-you
                        keepsake with your names, date and photos. Replies, guests’ details and
                        venue details come off it.
                    </li>
                    <li>Words sent with a payment you didn’t finish: 30 days.</li>
                    <li>
                        Files you send for “{MADE_NAME}”: until you ask us to delete them, or your
                        account is deleted.
                    </li>
                    <li>
                        Orders, invoices and payment records: about {RECORDS_YEARS} years, as Indian
                        tax law requires.
                    </li>
                </Points>
                <p>When you ask us to delete something, we do it within {DELETE_DAYS} days.</p>
            </Part>
            <Part title="Your choices">
                <p>
                    Ask us for a copy of your details, to correct them, to delete them, or to stop
                    using them. We delete within {DELETE_DAYS} days and do the rest within 30 days,
                    keeping only what the law says we must. You can also name someone to act for
                    you. Write from the email you signed in with, or message us from your number.
                </p>
                <p>
                    If you take back your consent, we stop using your details from then on. We can’t
                    call back files you have already downloaded or links you have already shared.
                </p>
                <p>
                    If you’re not happy with our answer, write to our grievance officer below; after
                    that you can go to the Data Protection Board of India.
                </p>
            </Part>
            <Part title="Children">
                <p>
                    Accounts are for adults. If a child is in your photos or named on your
                    invitation, you confirm you’re their parent or guardian, or have their parent’s
                    or guardian’s agreement.
                </p>
                <p>
                    Found a photo of your child, or of you, on an invitation you didn’t agree to?
                    Write to us and we’ll take it down.
                </p>
            </Part>
            <Part title="Safety">
                <p>
                    Everything travels encrypted, sign-in uses one-time codes instead of passwords,
                    and only you and our studio can open your details. If something ever goes wrong
                    with your data, we’ll tell you, and the Data Protection Board of India, as the
                    law requires.
                </p>
            </Part>
            <Part title="Grievance officer">
                <Grievance />
            </Part>
            <Part title="Changes to this page">
                <p>
                    The date below shows when this page last changed. For a big change we’ll also
                    show a notice on the site and email our customers.
                </p>
            </Part>
        </PolicyPage>
    );
}
