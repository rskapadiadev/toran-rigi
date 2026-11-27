import { brand } from '@shared/brand';
import { MADE_HOURS, MADE_ROUNDS } from '@shared/made';
import { DELETE_DAYS, RECORDS_YEARS } from '@shared/policies';
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
                    18 or older to buy, and what you tell us about yourself and your celebration
                    must be true.
                </p>
            </Part>
            <Part title="Your account">
                <Points>
                    <li>
                        You sign in with a code we send to your email. So anyone who can open your
                        email, or a phone where you’re signed in, can open your account. Keep them
                        to yourself, and sign out on a shared phone or computer.
                    </li>
                    <li>
                        To close your account, write to{' '}
                        <a href={`mailto:${brand.email}`} className={textLink}>
                            {brand.email}
                        </a>{' '}
                        or message {brand.phone} from the email or number you use with us. We delete
                        it within {DELETE_DAYS} days.
                    </li>
                    <li>
                        Deleting takes a live invitation offline and its link stops working for
                        everyone. If you want a refund, ask for it before you ask us to delete.
                    </li>
                    <li>
                        We keep invoices and payment records for about {RECORDS_YEARS} years, as
                        Indian tax law requires, even after your account is deleted.
                    </li>
                </Points>
            </Part>
            <Part title="What you buy">
                <Points>
                    <li>
                        One invitation, in the design you chose, for one celebration. The page you
                        buy from lists what’s included: photos, ceremonies and how long it stays
                        online.
                    </li>
                    <li>
                        You can change your words, photos, ceremonies, sections, languages and music
                        until the day after your last ceremony. The design itself doesn’t change; a
                        different design is a new purchase.
                    </li>
                    <li>
                        Your design is yours to use, not yours alone: other families may choose it
                        too.
                    </li>
                    <li>You may not resell an invitation or copy our designs.</li>
                </Points>
            </Part>
            <Part title="How long it stays online">
                <Points>
                    <li>
                        At least the months shown with the design when you bought it, counted from
                        the day you first publish.
                    </li>
                    <li>
                        After that, your invitation becomes a quiet thank-you keepsake: your names,
                        the date and your photos, still at the same link. Replies, guests’ details
                        and venue details come off it.
                    </li>
                    <li>
                        If your date moves, change it in your invitation before the day. If you need
                        it online for longer,{' '}
                        <Link to="/contact" className={textLink}>
                            write to us
                        </Link>
                        .
                    </li>
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
                <Points>
                    <li>
                        You pay once, in advance. There is no subscription. The price shown before
                        you pay is the whole amount.
                    </li>
                    <li>
                        We aren’t registered for GST yet, so no GST is charged. What you see under
                        Payments in My invitations is a receipt, not a tax invoice.
                    </li>
                    <li>
                        Payments are handled by Razorpay, and its name may show on your bank
                        statement. We never see or keep your card or bank details.
                    </li>
                    <li>
                        Your invitation is added to your account only after the payment is
                        confirmed. See{' '}
                        <Link to="/delivery" className={textLink}>
                            Delivery
                        </Link>{' '}
                        and{' '}
                        <Link to="/refund" className={textLink}>
                            Refunds
                        </Link>
                        .
                    </li>
                    <li>Prices may change, but never for something you have already bought.</li>
                </Points>
            </Part>
            <Part title="Your words, photos and guests">
                <Points>
                    <li>
                        They stay yours. You let us store and show them only to make and show your
                        invitation, its cards and its files. That permission ends when you delete
                        them.
                    </li>
                    <li>
                        Use only words, photos and music you have the right to use. If people are in
                        your photos, make sure they’re happy to be. Don’t use photos of celebrities
                        or public figures unless you have the right to.
                    </li>
                    <li>
                        Add a child’s photo or name only if you’re their parent or guardian, or have
                        their agreement.
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
            <Part title="Replies and wishes">
                <p>
                    Guests can reply and leave wishes on your invitation. A wish shows only once you
                    approve it, and what you approve and share is yours to answer for.
                </p>
            </Part>
            <Part title="Your downloads">
                <p>
                    Your cards, posts, PDFs and videos are yours to print and share for your
                    celebration, as often as you like.
                </p>
            </Part>
            <Part title="We never show yours without asking">
                <p>
                    We never put your invitation, names or photos in our shop, ads or social posts
                    unless you have said yes first. The couples and families in our sample designs
                    are made up.
                </p>
            </Part>
            <Part title="Our designs and music">
                <p>
                    The designs, drawings and code belong to us. The music in our library is free to
                    use or used under its licence, credited on the invitation where the licence asks
                    for it, and is for use inside your invitation, its cards and its videos.
                </p>
            </Part>
            <Part title="What isn’t allowed">
                <Points>
                    <li>Sexual content, or anything obscene.</li>
                    <li>
                        Harassing anyone, or hate against any religion, caste, community or gender.
                    </li>
                    <li>Fake or misleading documents, or pretending to be someone else.</li>
                    <li>Anything against Indian law.</li>
                    <li>
                        Getting round our payments or security, or harming the service or other
                        people’s invitations.
                    </li>
                </Points>
                <p>
                    We may take such an invitation offline or close the account. We’ll tell you why,
                    unless the law stops us.
                </p>
            </Part>
            <Part title="Links are open to whoever has them">
                <p>
                    Anyone with your invitation’s link can open it and pass it on. We ask search
                    engines not to list it, but please don’t put anything on it you want kept
                    secret. We can’t answer for what other people do with a link you share.
                </p>
            </Part>
            <Part title="If something goes wrong">
                <p>
                    We work to keep every invitation online, but can’t promise it will never be
                    interrupted. Tell us about a fault and we’ll fix it, or refund you as our refund
                    rule says. If WhatsApp, Razorpay, the internet or our hosting providers have an
                    outage, we’ll do our best and tell you what’s happening. Beyond that, the most
                    we owe you is what you paid for the invitation. Nothing here takes away the
                    rights the Consumer Protection Act, 2019 gives you.
                </p>
            </Part>
            <Part title="Changes and law">
                <p>
                    We may update these terms. For a big change we’ll show a notice on the site and
                    email our customers. What you already bought keeps the terms you bought it
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
