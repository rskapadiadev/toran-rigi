import { brand } from '@shared/brand';
import { MADE_HOURS, MADE_ROUNDS } from '@shared/made';
import { createFileRoute, Link } from '@tanstack/react-router';

import { Part, Points, policyHead, PolicyPage, textLink } from '@/shop/policies/kit';

import { fetchOrigin } from '../server-fns/store';

const LEAD =
    'What you get when you buy a Toran invitation, what stays yours, and what we ask of you.';

export const Route = createFileRoute('/terms')({
    loader: () => fetchOrigin(),
    head: ({ loaderData }) =>
        policyHead({
            title: 'Terms',
            lead: LEAD,
            path: '/terms',
            origin: loaderData?.origin,
        }),
    component: Terms,
});

function Terms() {
    return (
        <PolicyPage before="Terms of" accent="use" lead={LEAD}>
            <Part title="Who we are">
                <p>
                    Toran (also “Toran by Rigi”) is run by {brand.legalName}, {brand.address}. In
                    these terms “we” means {brand.legalName} and “you” means the person who uses the
                    site or buys an invitation. By using Toran you accept these terms. You must be
                    18 or older to buy.
                </p>
            </Part>
            <Part title="What you buy">
                <Points>
                    <li>
                        One invitation, in the design you chose, for one celebration. The page you
                        buy from lists what’s included: photos, ceremonies and how long it stays
                        online.
                    </li>
                    <li>
                        It stays online for at least the months shown when you bought, counted from
                        the day you first publish.
                    </li>
                    <li>
                        You can change your words, photos, ceremonies, sections, languages and music
                        until the day after your last ceremony. The design itself doesn’t change; a
                        different design is a new purchase.
                    </li>
                    <li>You may not resell an invitation or copy our designs.</li>
                </Points>
            </Part>
            <Part title="If we make it for you">
                <Points>
                    <li>
                        Our studio sets your words, photos, ceremonies and music from what you send.
                        Your first look comes within {MADE_HOURS} hours of everything we need; the
                        time waits while we ask you for anything missing.
                    </li>
                    <li>
                        {MADE_ROUNDS} rounds of changes are included, with all your changes in each.
                        More are priced before we start.
                    </li>
                    <li>
                        We copy what you send. Please check names, dates and places in your first
                        look before you publish.
                    </li>
                </Points>
            </Part>
            <Part title="Price and payment">
                <p>
                    You pay once, in advance. There is no subscription. The price shown before you
                    pay is the whole amount, with any tax that applies. Payments are handled by
                    Razorpay; we never see or keep your card or bank details. Your invitation is
                    added to your account only after the payment is confirmed. See{' '}
                    <Link to="/delivery" className={textLink}>
                        Delivery
                    </Link>{' '}
                    and{' '}
                    <Link to="/refund" className={textLink}>
                        Refunds
                    </Link>
                    .
                </p>
            </Part>
            <Part title="Your words, photos and guests">
                <Points>
                    <li>
                        They stay yours. You let us store and show them so that we can run your
                        invitation, and for nothing else.
                    </li>
                    <li>
                        Use only words, photos and music you have the right to use. If people are in
                        your photos, make sure they’re happy to be.
                    </li>
                    <li>
                        Add a guest’s name or number only to invite them, and take it out if they
                        ask.
                    </li>
                    <li>
                        Please read your invitation through before you publish it. The names, dates
                        and places on it are yours to check.
                    </li>
                </Points>
            </Part>
            <Part title="Our designs and music">
                <p>
                    The designs, drawings and code belong to us. The music in our library is free to
                    use or used under its licence, credited on the invitation where the licence asks
                    for it, and is for use inside your invitation, its cards and its videos.
                </p>
            </Part>
            <Part title="What isn’t allowed">
                <p>
                    Nothing unlawful, hateful, obscene or disrespectful to any faith, no pretending
                    to be someone else, and no harming the service or other people’s invitations. We
                    may take such an invitation offline. We’ll tell you why, unless the law stops
                    us.
                </p>
            </Part>
            <Part title="Links are open to whoever has them">
                <p>
                    Anyone with your invitation’s link can open it and pass it on. We ask search
                    engines not to list it, but please don’t put anything on it you want kept
                    secret.
                </p>
            </Part>
            <Part title="If something goes wrong">
                <p>
                    We work to keep every invitation online, but can’t promise it will never be
                    interrupted. Tell us about a fault and we’ll fix it, or refund you as our refund
                    rule says. Beyond that, the most we owe you is what you paid for the invitation.
                    Nothing here takes away the rights Indian consumer law gives you.
                </p>
            </Part>
            <Part title="Changes and law">
                <p>
                    We may update these terms; what you already bought keeps the terms you bought it
                    under. Indian law applies, and the courts of {brand.courts} decide any dispute.
                    Please{' '}
                    <Link to="/contact" className={textLink}>
                        talk to us
                    </Link>{' '}
                    first.
                </p>
            </Part>
        </PolicyPage>
    );
}
