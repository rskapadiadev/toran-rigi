// Demo invitations for the luxury collection (themes-luxury.ts). Names, dates and venues are
// fictional; portraits and scenes are illustrated stand-ins from the Phoolwari art kit.
import { type DemoEvent, type DemoInvitation, maps, t } from './demo-kit';
import type { SectionConfig, SectionType } from './types';

const sections = (types: SectionType[]): SectionConfig[] =>
    types.map((type) => ({
        type,
        enabled: true,
    }));

// Illustrated scenes standing in for the couple's photos.
const scenes = [
    '/kits/phoolwari/wedding-stage.webp',
    '/kits/phoolwari/wedding-couples.webp',
    '/kits/phoolwari/sangeet-stage.webp',
    '/kits/phoolwari/haldi-stage.webp',
    '/kits/phoolwari/wedding-florals.webp',
    '/kits/phoolwari/shanti-stage.webp',
];

const portraits = {
    'story.one': '/kits/phoolwari/haldi-1.webp',
    'story.two': '/kits/phoolwari/sangeet-2.webp',
    'story.together': '/kits/phoolwari/wedding-couples.webp',
};

interface Day {
    kind: string;
    title: string;
    at: string;
}

// One venue for every ceremony, the way most destination weddings run.
function days(list: Day[], venue: string, address: string, timezone = 'Asia/Kolkata'): DemoEvent[] {
    return list.map((d) => ({
        kind: d.kind,
        title: t(d.title),
        startsAt: d.at,
        timezone,
        venue,
        address,
        mapsUrl: maps(`${venue} ${address}`),
    }));
}

// Deepmala's looks, one per ceremony kind, so the dress code page has something to show.
const deepmalaLooks: Record<string, DemoEvent['dressCode']> = {
    haldi: {
        note: t('Yellows and whites you don’t mind staining'),
        swatches: ['#f2c230', '#fff4d6', '#e8892b'],
    },
    mehndi: {
        note: t('Greens and soft pinks'),
        swatches: ['#4f7d3a', '#e8a3b0', '#f5ead2'],
    },
    sangeet: {
        note: t('Jewel tones and sparkle'),
        swatches: ['#3d2a6b', '#a3163a', '#c9a24a'],
    },
    pheras: {
        note: t('Traditional Indian, in any colour you love'),
        swatches: ['#a3163a', '#e8892b', '#f5ead2'],
    },
};

const dressed = (list: Day[], venue: string, address: string) =>
    days(list, venue, address).map((e) => ({
        ...e,
        dressCode: deepmalaLooks[e.kind],
    }));

const headline = t('request the pleasure of your company at the celebration of their marriage');
const wedding: SectionType[] = [
    'cover',
    'card',
    'countdown',
    'welcome',
    'story',
    'family',
    'events',
    'gallery',
    'rsvp',
    'wishes',
    'closing',
];

export const luxuryDemos: DemoInvitation[] = [
    {
        slug: 'demo-sitara',
        themeSlug: 'sitara',
        culture: 'hindu',
        locales: ['en'],
        calendars: [],
        seed: 7301,
        content: {
            people: {
                one: {
                    name: t('Ishaan'),
                    parents: t('Son of Mr & Mrs Arjun Mehra'),
                },
                two: {
                    name: t('Myra'),
                    parents: t('Daughter of Mr & Mrs Rohan Kapoor'),
                },
            },
            greetingKey: 'shree-ganeshay-namah',
            headline,
            welcome: t(
                'Under a sky full of stars, two families become one. Come and be part of our story.',
            ),
            story: t(
                'We met on a film set in Mumbai: he was the assistant director, she was the one who kept correcting his script. Six years and many retakes later, this is our favourite scene.',
            ),
            family: t('Smt. Kavita & Shri Arjun Mehra · Smt. Neha & Shri Rohan Kapoor'),
            closing: t('Save us a seat in the front row.'),
            coverPhotoKey: '/kits/phoolwari/wedding-stage.webp',
            photoSlots: portraits,
            gallery: scenes,
        },
        events: days(
            [
                {
                    kind: 'sangeet',
                    title: 'Sangeet under the stars',
                    at: '2027-01-29T19:30',
                },
                {
                    kind: 'pheras',
                    title: 'The Wedding',
                    at: '2027-01-30T18:00',
                },
                {
                    kind: 'reception',
                    title: 'Reception',
                    at: '2027-01-31T20:00',
                },
            ],
            'Taj Lands End',
            'Bandstand, Bandra West, Mumbai',
        ),
        extras: { wishes: { enabled: true } },
        sections: sections(wedding),
    },
    {
        slug: 'demo-heera',
        themeSlug: 'heera',
        culture: 'hindu.marwari',
        locales: ['en'],
        calendars: [],
        seed: 7302,
        content: {
            people: {
                one: {
                    name: t('Vihaan'),
                    parents: t('Son of Mr & Mrs Ramesh Agarwal'),
                },
                two: {
                    name: t('Anaya'),
                    parents: t('Daughter of Mr & Mrs Sunil Jain'),
                },
            },
            greetingKey: 'shree-ganeshay-namah',
            headline,
            welcome: t('With the blessings of our elders, we open our doors to you.'),
            story: t(
                'Our grandmothers were school friends in Jodhpur. Fifty years later, they finally got the wedding they always planned.',
            ),
            family: t('Smt. Sarla & Shri Ramesh Agarwal · Smt. Asha & Shri Sunil Jain'),
            closing: t('Your presence is the jewel of our celebration.'),
            photoSlots: portraits,
            gallery: [],
        },
        events: days(
            [
                {
                    kind: 'mehndi',
                    title: 'Mehendi',
                    at: '2027-02-18T15:00',
                },
                {
                    kind: 'haldi',
                    title: 'Haldi',
                    at: '2027-02-19T10:00',
                },
                {
                    kind: 'pheras',
                    title: 'Pheras',
                    at: '2027-02-19T19:00',
                },
                {
                    kind: 'reception',
                    title: 'Reception',
                    at: '2027-02-20T20:00',
                },
            ],
            'Umaid Bhawan Palace',
            'Circuit House Road, Jodhpur',
        ),
        extras: { wishes: { enabled: true } },
        sections: sections(wedding),
    },
    {
        slug: 'demo-patra',
        themeSlug: 'patra',
        culture: 'universal.interfaith',
        locales: ['en'],
        calendars: [],
        seed: 7303,
        content: {
            people: {
                one: { name: t('Eleanor') },
                two: { name: t('Arjun') },
            },
            headline,
            welcome: t(
                'Two families, two traditions and one long table. We would love for you to be there.',
            ),
            story: t(
                'We wrote to each other for a year before we ever met: letters between London and Pune, folded small enough to fit in a book. This is the last one, and it is addressed to you.',
            ),
            family: t('Mr & Mrs Thomas Whitmore · Mr & Mrs Prakash Deshpande'),
            closing: t('With love, and a seat kept for you.'),
            gallery: [],
        },
        events: days(
            [
                {
                    kind: 'ceremony',
                    title: 'The Ceremony',
                    at: '2027-05-22T15:00',
                },
                {
                    kind: 'dinner',
                    title: 'Dinner & Dancing',
                    at: '2027-05-22T19:00',
                },
            ],
            'Cliveden House',
            'Taplow, Berkshire',
            'Europe/London',
        ),
        extras: { wishes: { enabled: true } },
        sections: sections(wedding),
    },
    {
        slug: 'demo-roshni',
        themeSlug: 'roshni',
        culture: 'hindu.gujarati',
        locales: ['en'],
        calendars: [],
        seed: 7304,
        content: {
            people: {
                one: {
                    name: t('Dev'),
                    parents: t('Son of Mr & Mrs Kirit Shah'),
                },
                two: {
                    name: t('Riya'),
                    parents: t('Daughter of Mr & Mrs Nimesh Patel'),
                },
            },
            greetingKey: 'shree-ganeshay-namah',
            headline,
            welcome: t(
                'Switch on the lights, the dhol is waiting. Three days of garba, family and joy.',
            ),
            story: t(
                'One Navratri, one dandiya that hit the wrong head, and one apology that never ended. Here we are.',
            ),
            family: t('Smt. Hema & Shri Kirit Shah · Smt. Bina & Shri Nimesh Patel'),
            closing: t('Come ready to dance.'),
            photoSlots: portraits,
            gallery: scenes,
        },
        events: days(
            [
                {
                    kind: 'garba',
                    title: 'Garba Night',
                    at: '2027-12-03T20:00',
                },
                {
                    kind: 'mehndi',
                    title: 'Mehendi',
                    at: '2027-12-04T15:00',
                },
                {
                    kind: 'pheras',
                    title: 'Hastmilap',
                    at: '2027-12-05T18:30',
                },
            ],
            'The Courtyard',
            'Sarkhej-Gandhinagar Highway, Ahmedabad',
        ),
        extras: { wishes: { enabled: true } },
        sections: sections(wedding),
    },
    {
        slug: 'demo-sona',
        themeSlug: 'sona',
        culture: 'universal.modern',
        locales: ['en'],
        calendars: [],
        seed: 7305,
        content: {
            people: {
                one: { name: t('Kabir') },
                two: { name: t('Zoya') },
            },
            headline: t('are getting married'),
            welcome: t('No fuss, all heart. Dress sharp, dance hard.'),
            story: t(
                'Two doctors, one night shift, a broken vending machine and a shared bar of chocolate at 3 a.m. Our hearts have been in sync ever since.',
            ),
            family: t('With love from the Khannas and the Mirzas'),
            closing: t('See you on the dance floor.'),
            gallery: scenes,
        },
        events: days(
            [
                {
                    kind: 'ceremony',
                    title: 'The Vows',
                    at: '2027-03-13T17:00',
                },
                {
                    kind: 'after-party',
                    title: 'After-party',
                    at: '2027-03-13T21:00',
                },
            ],
            'The Glasshouse',
            'Lodhi Road, New Delhi',
        ),
        extras: { wishes: { enabled: true } },
        sections: sections(wedding),
    },
    {
        slug: 'demo-zari',
        themeSlug: 'zari',
        culture: 'hindu.punjabi',
        locales: ['en'],
        calendars: [],
        seed: 7306,
        content: {
            people: {
                one: {
                    name: t('Aarav'),
                    parents: t('Son of Mr & Mrs Harpreet Bedi'),
                },
                two: {
                    name: t('Simran'),
                    parents: t('Daughter of Mr & Mrs Jaspal Ahuja'),
                },
            },
            greetingKey: 'shree-ganeshay-namah',
            headline,
            welcome: t(
                'Stitched together by family, love and a great deal of food. Join us as we begin.',
            ),
            story: t(
                'Our mothers met at a tailor’s shop arguing over the same bolt of silk.\n\nThey both lost, and their children met at the fitting, laughing about it.\n\nThree Diwalis, one Lohri and many family dinners later, he asked her on a terrace full of fairy lights.\n\nThe silk was finally made into this wedding.',
            ),
            family: t('Smt. Gurpreet & Shri Harpreet Bedi · Smt. Manpreet & Shri Jaspal Ahuja'),
            closing: t('Balle balle, see you there.'),
            gallery: scenes,
        },
        events: days(
            [
                {
                    kind: 'chooda',
                    title: 'Chooda & Haldi',
                    at: '2027-11-12T10:00',
                },
                {
                    kind: 'sangeet',
                    title: 'Sangeet',
                    at: '2027-11-12T20:00',
                },
                {
                    kind: 'pheras',
                    title: 'Wedding',
                    at: '2027-11-13T18:00',
                },
            ],
            'The Oberoi',
            'Dr Zakir Hussain Marg, New Delhi',
        ),
        extras: { wishes: { enabled: true } },
        sections: sections(wedding),
    },
    {
        slug: 'demo-kagaz',
        themeSlug: 'kagaz',
        culture: 'universal.modern',
        locales: ['en'],
        calendars: [],
        seed: 7307,
        content: {
            people: {
                one: { name: t('Tara') },
                two: { name: t('Neil') },
            },
            headline: t('invite you to a small, happy wedding'),
            welcome: t('A garden, a long lunch and the people we love most.'),
            story: t(
                'We met at a paper-making workshop in Auroville and both made terrible paper. This invitation is our second attempt.',
            ),
            family: t('With love from the Iyers and the D’Souzas'),
            closing: t('Come as you are.'),
            gallery: [],
        },
        events: days(
            [
                {
                    kind: 'ceremony',
                    title: 'Ceremony in the garden',
                    at: '2027-02-06T11:00',
                },
                {
                    kind: 'lunch',
                    title: 'Long lunch',
                    at: '2027-02-06T13:00',
                },
            ],
            'Botanical Garden Café',
            'Auroville, Tamil Nadu',
        ),
        extras: { wishes: { enabled: true } },
        sections: sections(wedding),
    },
    {
        slug: 'demo-deepam',
        themeSlug: 'deepam',
        culture: 'hindu.south-indian',
        locales: ['en'],
        calendars: [],
        seed: 7308,
        content: {
            people: {
                one: {
                    name: t('Karthik'),
                    parents: t('Son of Smt. & Shri V. Raghavan'),
                },
                two: {
                    name: t('Meenakshi'),
                    parents: t('Daughter of Smt. & Shri S. Iyer'),
                },
            },
            greetingKey: 'shree-ganeshay-namah',
            headline,
            welcome: t(
                'With the lamp lit and the elders’ blessings, we begin a new life together.',
            ),
            story: t(
                'Both our families have prayed at the same temple for three generations. We just took a little longer to notice each other.',
            ),
            family: t('Smt. Lakshmi & Shri V. Raghavan · Smt. Uma & Shri S. Iyer'),
            closing: t('We seek your blessings.'),
            gallery: [],
        },
        events: days(
            [
                {
                    kind: 'mehndi',
                    title: 'Nalangu',
                    at: '2027-01-21T16:00',
                },
                {
                    kind: 'pheras',
                    title: 'Muhurtham',
                    at: '2027-01-22T07:30',
                },
                {
                    kind: 'reception',
                    title: 'Reception',
                    at: '2027-01-22T19:00',
                },
            ],
            'Sri Kapaleeshwarar Kalyana Mandapam',
            'Mylapore, Chennai',
        ),
        extras: { wishes: { enabled: true } },
        sections: sections(wedding),
    },
    {
        slug: 'demo-deepmala',
        themeSlug: 'deepmala',
        culture: 'hindu',
        locales: ['en', 'hi'],
        calendars: [],
        seed: 7342,
        content: {
            people: {
                one: {
                    name: t('Raghav', 'hi', 'राघव'),
                    parents: t('Son of Smt. Meera & Shri Alok Tandon'),
                },
                two: {
                    name: t('Sia', 'hi', 'सिया'),
                    parents: t('Daughter of Smt. Rekha & Shri Vinod Mishra'),
                },
            },
            greetingKey: 'shree-ganeshay-namah',
            headline,
            welcome: t(
                'On a night when every step of the ghat is lit, we begin our life together. Come and light a diya with us.',
            ),
            story: t(
                'We met at a friend’s Dev Deepawali on the river, both trying to light the same stubborn lamp. Four winters and many cups of malaiyo later, we are getting married.',
            ),
            family: t(
                'With the blessings of Late Smt. Kamla & Shri Ram Tandon · Smt. Shanti & Shri Om Mishra',
            ),
            closing: t('We seek your blessings.'),
            gallery: [],
        },
        events: dressed(
            [
                {
                    kind: 'haldi',
                    title: 'Haldi',
                    at: '2027-11-18T10:00',
                },
                {
                    kind: 'mehndi',
                    title: 'Mehndi',
                    at: '2027-11-18T17:00',
                },
                {
                    kind: 'sangeet',
                    title: 'Sangeet',
                    at: '2027-11-19T19:30',
                },
                {
                    kind: 'pheras',
                    title: 'Pheras',
                    at: '2027-11-20T20:00',
                },
            ],
            'The Ghat Haveli',
            'Assi Ghat, Varanasi',
        ),
        extras: {
            wishes: { enabled: true },
            travel: [
                {
                    title: t('Arriving'),
                    body: t(
                        'Varanasi airport is 40 minutes from the haveli. Family will meet every flight on the 17th.',
                    ),
                },
                {
                    title: t('Where to stay'),
                    body: t('Rooms are held for family at the haveli from the 17th to the 21st.'),
                },
            ],
        },
        sections: sections([
            'cover',
            'date',
            'blessing',
            'card',
            'welcome',
            'story',
            'events',
            'countdown',
            'venue',
            'travel',
            'dressCode',
            'family',
            'rsvp',
            'wishes',
            'closing',
        ]),
    },
];

// Deepmala Yatra: the same wedding, told over the film playing behind the whole invitation.
const deepmalaDemo = luxuryDemos.find((d) => d.slug === 'demo-deepmala');
if (deepmalaDemo)
    luxuryDemos.push({
        ...deepmalaDemo,
        slug: 'demo-deepmala-yatra',
        themeSlug: 'deepmala-yatra',
        seed: 7343,
    });
// Haveli Walk: the same wedding over the illustrated walk from the ghats to the mandap.
if (deepmalaDemo)
    luxuryDemos.push({
        ...deepmalaDemo,
        slug: 'demo-haveli-walk',
        themeSlug: 'haveli-walk',
        seed: 7351,
    });
// Palace Walk: the same wedding over the walk from the palace gate to its terrace.
if (deepmalaDemo)
    luxuryDemos.push({
        ...deepmalaDemo,
        slug: 'demo-palace-walk',
        themeSlug: 'palace-walk',
        seed: 7359,
    });

// Himalaya Walk: the same wedding over the walk up to a mountain shrine in the morning sun.
if (deepmalaDemo)
    luxuryDemos.push({
        ...deepmalaDemo,
        slug: 'demo-himalaya-walk',
        themeSlug: 'himalaya-walk',
        seed: 7373,
    });

// Garden Walk: a wedding of no particular tradition, in a garden by a lake.
luxuryDemos.push({
    slug: 'demo-garden-walk',
    themeSlug: 'garden-walk',
    culture: 'universal.modern',
    locales: ['en'],
    calendars: [],
    seed: 7367,
    content: {
        people: {
            one: { name: t('Rohan') },
            two: { name: t('Elise') },
        },
        headline: t('invite you to celebrate their wedding'),
        welcome: t('In the garden where we first said hello, at the hour the light turns gold.'),
        story: t(
            'We met at a friend’s garden party, both hiding from the rain under the same rose arbour. Three summers later, we are getting married under another one.',
        ),
        family: t('With love from the Mehtas and the Laurents'),
        closing: t('Dinner, dancing and a sky full of stars.'),
        gallery: [],
    },
    events: days(
        [
            {
                kind: 'ceremony',
                title: 'Garden ceremony',
                at: '2027-02-13T16:30',
            },
            {
                kind: 'reception',
                title: 'Dinner under the stars',
                at: '2027-02-13T19:00',
            },
        ],
        'The Rose Garden Estate',
        'Coonoor, Nilgiris',
    ),
    extras: {
        wishes: { enabled: true },
        travel: [
            {
                title: t('Getting there'),
                body: t(
                    'Coimbatore airport is a scenic three hours away. Cars leave at noon on the 13th.',
                ),
            },
        ],
    },
    sections: sections([
        'cover',
        'date',
        'card',
        'welcome',
        'story',
        'events',
        'countdown',
        'venue',
        'travel',
        'family',
        'rsvp',
        'wishes',
        'closing',
    ]),
});
