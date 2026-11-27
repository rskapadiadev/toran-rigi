import { brand } from '@shared/brand';
import { MADE_HOURS, MADE_PRICE, MADE_ROUNDS } from '@shared/made';
import { formatMoney } from '@shared/money';
import { DELETE_DAYS, RECORDS_YEARS, REFUND_DAYS, REPLY_TIME } from '@shared/policies';
import { COUNTDOWN_DAYS } from '@shared/posts';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { Part, Points, policyHead, PolicyPage, textLink } from '@/shop/policies/kit';

import { fetchOrigin } from '../server-fns/store';

const LEAD =
    'Short answers on trying, buying, guests, cards and everything else. Can’t find yours? Write to us and a person will answer.';

export const Route = createFileRoute('/help')({
    loader: () => fetchOrigin(),
    head: ({ loaderData }) =>
        policyHead({
            title: 'Help',
            lead: LEAD,
            path: '/help',
            origin: loaderData?.origin,
        }),
    component: Help,
});

interface Article {
    id: string;
    title: string;
    body: ReactNode;
}

interface Group {
    title: string;
    articles: Article[];
}

const madeCost = `${formatMoney(MADE_PRICE.INR, 'INR')} in India, ${formatMoney(MADE_PRICE.USD, 'USD')} elsewhere`;
const firstCountdown = COUNTDOWN_DAYS[0] ?? 100;
const secondCountdown = COUNTDOWN_DAYS[1] ?? 60;

const groups: Group[] = [
    {
        title: 'Trying and buying',
        articles: [
            {
                id: 'try-free',
                title: 'Try a design free',
                body: (
                    <>
                        <p>
                            Open any design in the{' '}
                            <Link to="/collections" className={textLink}>
                                collection
                            </Link>{' '}
                            and press Try it free. Type your names, dates and ceremonies, add
                            photos, and watch your own invitation come together beside the form. You
                            don’t need an account.
                        </p>
                        <p>
                            Your words stay on this device for a day. Photos stay only in the open
                            tab, so they’re gone if you close it. Nothing reaches us until you pay.
                        </p>
                    </>
                ),
            },
            {
                id: 'buying',
                title: 'Buying',
                body: (
                    <Points>
                        <li>
                            Prices are in rupees in India. Elsewhere they’re set in US dollars and
                            shown in your own currency; you can change it at the bottom of any page.
                        </li>
                        <li>You pay once, through Razorpay. There’s no subscription.</li>
                        <li>
                            Your invitation is ready within seconds, or up to 30 minutes if your
                            bank is slow, with the words and photos you were trying already in it.
                        </li>
                        <li>
                            Find it in{' '}
                            <Link to="/my" className={textLink}>
                                My invitations
                            </Link>
                            . Your receipt is under Payments.
                        </li>
                    </Points>
                ),
            },
            {
                id: 'sign-in',
                title: 'Signing in on another phone',
                body: (
                    <>
                        <p>
                            Sign in with the same email you bought with. We email you a code that
                            works for 10 minutes; if it doesn’t come, look in your spam folder.
                            There’s no password to remember.
                        </p>
                        <p>
                            Your invitation follows your account to any phone or computer. Words you
                            were only trying, before you bought, stay on the device you typed them
                            on.
                        </p>
                    </>
                ),
            },
        ],
    },
    {
        title: 'Making your invitation',
        articles: [
            {
                id: 'editing',
                title: 'Editing your invitation',
                body: (
                    <>
                        <p>
                            You can change everything but the look: your words, photos, ceremonies,
                            languages, music, replies, gifts and wishes. Under Sections you can show
                            or hide each part of the invitation and change their order.
                        </p>
                        <p>
                            The design, its colours, lettering and movement stay as our studio made
                            them. A different design is a new purchase. Editing closes the day after
                            your last ceremony.
                        </p>
                    </>
                ),
            },
            {
                id: 'publishing',
                title: 'Publishing, and when changes go live',
                body: (
                    <>
                        <p>
                            Your invitation stays private until you press Publish. Publishing gives
                            you its link; anything left to pay has to be paid first.
                        </p>
                        <p>
                            Once it’s published, every change you save shows on your live invitation
                            straight away, so guests who open it later see the newest version.
                        </p>
                    </>
                ),
            },
            {
                id: 'link',
                title: 'Your link',
                body: (
                    <p>
                        Your link is made from your names. We ask search engines not to list it, but
                        anyone you send it to can open it and pass it on. If you’d like a different
                        one, write to us before you start sharing it. Your link stays online for at
                        least the months shown with your design, then becomes a thank-you keepsake.
                        See{' '}
                        <Link to="/delivery" className={textLink}>
                            Delivery
                        </Link>
                        .
                    </p>
                ),
            },
            {
                id: 'ceremonies',
                title: 'Ceremonies',
                body: (
                    <p>
                        Add each ceremony with its day, time and venue. Guests can open the venue in
                        maps and add the ceremony to their calendar. Remove a ceremony, or switch
                        Ceremonies off, and its cards go too.
                    </p>
                ),
            },
            {
                id: 'languages',
                title: 'Languages',
                body: (
                    <p>
                        Your invitation can be in more than one language: English, Hindi, Gujarati,
                        Punjabi, Arabic, Urdu and Hebrew. Pick them, then write your words in each.
                        Guests switch between them on the invitation. Arabic, Urdu and Hebrew read
                        right to left, and the whole invitation turns to match.
                    </p>
                ),
            },
            {
                id: 'music',
                title: 'Music',
                body: (
                    <p>
                        Choose a song from our library, or add your own once you confirm you have
                        the right to use it. Guests hear it while they look through your invitation,
                        and can turn it off.
                    </p>
                ),
            },
            {
                id: 'family-versions',
                title: 'A version for each family',
                body: (
                    <p>
                        Each family’s guests can see their own version: their own person’s name
                        first, and their own welcome, family and closing lines where you want them
                        to differ. Everyone else sees the main version.
                    </p>
                ),
            },
            {
                id: 'what-to-wear',
                title: 'What to wear',
                body: (
                    <p>
                        Give each function a look: its colours, drawn outfits and a note for your
                        guests. They appear on a What to wear page in your invitation, and each
                        function gets a story picture to send to your family groups.
                    </p>
                ),
            },
            {
                id: 'blessings',
                title: 'Blessings and sacred lines',
                body: (
                    <p>
                        Mantras, verses, Gurbani and blessings come only from our checked library
                        for your tradition, or from you. We never use AI to write them, and we never
                        put an effect on sacred words or the names of God that breaks or scatters
                        them.
                    </p>
                ),
            },
            {
                id: 'wording',
                title: 'Finding the right words',
                body: (
                    <p>
                        Our{' '}
                        <Link to="/wording" className={textLink}>
                            wording library
                        </Link>{' '}
                        has invitation words for every occasion and tradition, to copy into your
                        invitation and make your own.
                    </p>
                ),
            },
        ],
    },
    {
        title: 'Guests',
        articles: [
            {
                id: 'guests',
                title: 'Guests, families, groups and links',
                body: (
                    <Points>
                        <li>
                            Add each family you’re inviting, on one side or the other, and put them
                            in groups if you like.
                        </li>
                        <li>
                            Every family gets its own link, showing only the functions it’s invited
                            to.
                        </li>
                        <li>
                            Send from your own phone: tap a family and WhatsApp opens with your
                            message, their name and their link filled in. We never message your
                            guests ourselves.
                        </li>
                        <li>
                            For a WhatsApp group or broadcast list, use a link for a whole side or
                            group.
                        </li>
                    </Points>
                ),
            },
            {
                id: 'some-guests',
                title: 'Showing a ceremony to some guests only',
                body: (
                    <p>
                        Each ceremony can be for everyone, for one side’s families, or for a group.
                        Guests only see the ceremonies their link is for. Your plain link, without a
                        family’s name in it, shows only what is for everyone.
                    </p>
                ),
            },
            {
                id: 'replies',
                title: 'Replies and wishes',
                body: (
                    <p>
                        Guests reply on your invitation: who is coming to which function, how many,
                        and any food needs. You see every reply and the numbers for each function
                        under Guests. If a family replies again, its newest answer counts. Wishes
                        show on the invitation only after you approve them.
                    </p>
                ),
            },
        ],
    },
    {
        title: 'Cards and files',
        articles: [
            {
                id: 'cards',
                title: 'Cards',
                body: (
                    <>
                        <p>
                            Your invitation comes with matching cards in your names: a save the
                            date, the invitation as a picture to send, a printed invitation, a card
                            for each function and an Instagram story. Find them under Cards.
                        </p>
                        <p>
                            They follow your invitation. Change a date once and every card changes
                            with it; remove a ceremony and its card goes. The printed invitation is
                            a two-sided 5 × 7 inch PDF with bleed, ready for any print shop.
                        </p>
                    </>
                ),
            },
            {
                id: 'posts',
                title: 'Countdown and social posts',
                body: (
                    <p>
                        For a happy occasion, Cards also has posts in your invitation’s own design:
                        a countdown at {firstCountdown} and {secondCountdown} days, then every day
                        of the last month down to the day itself, in three looks. There’s a post for
                        each ceremony on its day, a thank-you for after, a square save the date and
                        a grid for your profile.
                    </p>
                ),
            },
            {
                id: 'pdf',
                title: 'The invitation as a PDF',
                body: (
                    <p>
                        Download your whole invitation as a PDF from Cards, page by page, with
                        directions and calendar links you can still tap. You can also let guests
                        download it from the invitation.
                    </p>
                ),
            },
            {
                id: 'video',
                title: 'Video',
                body: (
                    <p>
                        Your story card can become a short video, and designs with a moving film can
                        also make a video of the whole invitation once it’s published. The video is
                        made on your own phone or computer, with your music if you like, so keep the
                        screen open until it’s done. It works in the latest Chrome, or Safari on an
                        iPhone with iOS 17 or newer.
                    </p>
                ),
            },
        ],
    },
    {
        title: 'We make it for you',
        articles: [
            {
                id: 'made-for-you',
                title: 'We make it for you',
                body: (
                    <>
                        <p>
                            Rather not do it yourself? Add it when you buy, for {madeCost}. Send us
                            your details, or a photo of your printed card, and your first look comes
                            within {MADE_HOURS} hours of everything we need. {MADE_ROUNDS} rounds of
                            changes are included.
                        </p>
                        <p>
                            We copy what you send, so please check names, dates and places. While
                            our studio is working on it, editing waits. It’s refunded in full until
                            you send your details.{' '}
                            <Link to="/made-for-you" className={textLink}>
                                How it works
                            </Link>
                        </p>
                    </>
                ),
            },
        ],
    },
    {
        title: 'Your account',
        articles: [
            {
                id: 'refunds',
                title: 'Refunds and cancelling',
                body: (
                    <p>
                        Change your mind within {REFUND_DAYS} days, before you publish or download
                        anything, and you get all your money back. Write to us with your order
                        number and we reply within {REPLY_TIME}. The full rule is on{' '}
                        <Link to="/refund" className={textLink}>
                            Refunds
                        </Link>
                        .
                    </p>
                ),
            },
            {
                id: 'delete',
                title: 'Deleting your account and details',
                body: (
                    <p>
                        Write to{' '}
                        <a href={`mailto:${brand.email}`} className={textLink}>
                            {brand.email}
                        </a>{' '}
                        or message {brand.phone}, and we delete your account within {DELETE_DAYS}{' '}
                        days. A live invitation goes offline and its link stops working, so ask for
                        any refund first. We keep invoices and payment records for about{' '}
                        {RECORDS_YEARS} years, as Indian tax law requires. See{' '}
                        <Link to="/privacy" className={textLink}>
                            Privacy
                        </Link>
                        .
                    </p>
                ),
            },
        ],
    },
];

function Help() {
    return (
        <PolicyPage before="How can we" accent="help?" lead={LEAD} dated={false}>
            <nav
                aria-label="Help topics"
                className="mt-10 grid gap-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-5 sm:grid-cols-2"
            >
                {groups.map((group) => (
                    <div key={group.title}>
                        <p className="text-[11px] tracking-[0.3em] text-gold uppercase">
                            {group.title}
                        </p>
                        <ul className="mt-2 space-y-1.5 text-sm">
                            {group.articles.map((a) => (
                                <li key={a.id}>
                                    <a
                                        href={`#${a.id}`}
                                        className="text-ivory/75 hover:text-ivory hover:underline"
                                    >
                                        {a.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
            {groups.map((group) => (
                <section key={group.title} className="pt-8">
                    <h2 className="border-b border-white/10 pt-8 pb-2 text-[11px] tracking-[0.35em] text-gold uppercase">
                        {group.title}
                    </h2>
                    {group.articles.map((a) => (
                        <Part key={a.id} id={a.id} title={a.title} level="h3">
                            {a.body}
                        </Part>
                    ))}
                </section>
            ))}
        </PolicyPage>
    );
}
