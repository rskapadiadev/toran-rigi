// Demo invitations shown in the theme gallery (seeded as is_demo rows). Names are fictional.
export type { DemoEvent, DemoInvitation } from './demo-kit';
import { applyLayout } from './blocks';
import type { CultureId } from './cultures';
import { cultures } from './cultures';
import { type DemoInvitation, maps, t } from './demo-kit';
import { luxuryDemos } from './demo-luxury';
import { occasionDemos } from './demo-occasions';
import { defaultMusicStyle, type MusicStyle } from './music';
import { type OccasionId, occasionOf } from './occasions';
import { themeBySlug, themeLayouts } from './themes';
import type { SectionConfig } from './types';

function sectionsFor(culture: CultureId, extra: SectionConfig['type'][] = []): SectionConfig[] {
    const base = cultures[culture].defaultSections;
    return [...base, ...extra.filter((s) => !base.includes(s))].map((type) => ({
        type,
        enabled: true,
    }));
}

const surat = (q: string) => maps(`${q}, Surat`);

const rawDemos: DemoInvitation[] = [
    {
        // Smit & Dhruvi's own wardrobe planner, rebuilt as a living invitation (art: public/kits/phoolwari).
        slug: 'demo-phoolwari',
        themeSlug: 'phoolwari',
        culture: 'hindu.gujarati',
        locales: ['en'],
        calendars: [],
        seed: 2701,
        content: {
            people: {
                one: { name: t('Smit') },
                two: { name: t('Dhruvi') },
            },
            greetingKey: 'shree-ganeshay-namah',
            headline: t('The Wedding Wardrobe Edit'),
            welcome: t('Six celebrations. A hundred memories. One beautiful story.'),
            story: t(
                'Dear Friends & Family,\nThe countdown to Smit & Dhruvi’s forever has begun, and we can’t wait to celebrate with you!\nFrom dreamy hues to sangeet sparkle and timeless traditional attire, every celebration has its own vibe. Our Wedding Wardrobe Edit is here to inspire your looks for each occasion.\n\nThink of it as inspiration, not rules. Add your personal touch, wear what makes you feel wonderful, and come ready to dance, laugh and make memories! Dress for the moments, stay for the memories.',
            ),
            closing: t('Dress for the moments, stay for the memories.'),
            photoSlots: { 'cover.monogram': '/kits/phoolwari/monogram-ds.webp' },
            gallery: [],
        },
        events: [
            {
                kind: 'haldi',
                title: t('Haldi'),
                startsAt: '2027-01-27T10:00',
                timezone: 'Asia/Kolkata',
                venue: 'Patel Street, Magdalla',
                address: 'Behind VR Mall, Magdalla, Surat',
                mapsUrl: surat('Patel Street Magdalla behind VR Mall'),
                description: t(
                    'A little something blue, a little sunshine, and a thousand reasons to smile. Let’s colour this celebration in love, laughter and all things blue.',
                ),
                dressCode: {
                    title: t('Blue Reverie'),
                    note: t(
                        'Shades of blue, from soft powder blue and dreamy pastels to serene sky blue and delicate hues of azure.',
                    ),
                    ladies: t(
                        'Blue shararas, salwar suits, anarkalis, Indo-western sets, flowy skirts or playful fusion ensembles.',
                    ),
                    gentlemen: t(
                        'Kurtas in shades of blue, paired with ivory or white if you like.',
                    ),
                    swatches: ['#b9d3ee', '#7fa6d8', '#4a6fa5', '#1f3a6e'],
                },
            },
            {
                kind: 'sangeet',
                title: t('Sangeet'),
                startsAt: '2027-01-27T19:30',
                timezone: 'Asia/Kolkata',
                venue: 'Tahuko Farm',
                address: 'Silent Zone, Dumas Road, Surat',
                mapsUrl: surat('Tahuko Farm Silent Zone Dumas Road'),
                description: t(
                    'Bring your sparkle, bring your moves and bring all the love to the dance floor tonight as we celebrate Dhruvi & Smit in the language of music, madness and memories.',
                ),
                dressCode: {
                    title: t('The Moonlit Affair'),
                    note: t('If it glitters, shimmers or catches the light, it belongs here.'),
                    ladies: t(
                        'Glamorous gowns, sequinned dresses, glittery sarees, statement lehengas or metallic ensembles.',
                    ),
                    gentlemen: t(
                        'Statement blazers, tux-inspired looks or contemporary Indo-western outfits.',
                    ),
                    swatches: ['#111111', '#e7c3c6', '#1d2c5e', '#c0c4cc'],
                },
            },
            {
                kind: 'grah-shanti',
                title: t('Grah Shanti'),
                startsAt: '2027-01-28T18:00',
                timezone: 'Asia/Kolkata',
                venue: 'Rio Greens',
                address: 'Valentine Theatre Lane, New Magdalla, Surat',
                mapsUrl: surat('Rio Greens Valentine Theatre Lane New Magdalla'),
                description: t(
                    'With prayers in our hearts and faith in our journey, we seek divine grace for a lifetime of harmony, prosperity and love.',
                ),
                dressCode: {
                    title: t('Sacred & Serene'),
                    note: t('Traditional Indian attire.'),
                    ladies: t(
                        'Sarees, lehengas, anarkalis, elegant suits and other traditional Indian ensembles.',
                    ),
                    gentlemen: t(
                        'Traditional kurtas, kurta-pyjama sets, bandhgala suits and other elegant Indian attire.',
                    ),
                    swatches: ['#f2d36b', '#8cbf3f', '#f4a7b9', '#b7a6d9'],
                },
            },
            {
                kind: 'pheras',
                title: t('Wedding'),
                startsAt: '2027-01-29T18:30',
                timezone: 'Asia/Kolkata',
                venue: 'Swarnbhumi Party Plot',
                address: 'Near DPS School, near Avadh Utopia, Dumas, Surat',
                mapsUrl: surat('Swarnbhumi Party Plot near DPS School Dumas'),
                description: t(
                    'Like Shiv and Parvati, may love be our strength, devotion our foundation and our greatest blessing. Join us as Dhruvi & Smit begin their forever, hand in hand and heart to heart.',
                ),
                dressCode: {
                    title: t('Shiv Shakti — The Sacred Union'),
                    note: t('Indian cultural elegance, timeless, regal and rooted in tradition.'),
                    ladies: t(
                        'Traditional lehengas, rich sarees or elegant Indo-western ensembles with a traditional soul.',
                    ),
                    gentlemen: t(
                        'Sherwanis, bandhgalas, classic Indo-western attire or embroidered jackets.',
                    ),
                    swatches: ['#8c1530', '#e9a6b8', '#c39a3c', '#efe4d2'],
                },
            },
        ],
        extras: {
            wishes: { enabled: true },
            branding: {
                style: 'signature',
                dark: true,
            },
        },
        sections: [
            'cover',
            'story',
            'card',
            'countdown',
            'events',
            'family',
            'gallery',
            'wishes',
        ].map((type) => ({
            type: type as SectionConfig['type'],
            enabled: true,
        })),
    },
    {
        slug: 'demo-mehfil',
        themeSlug: 'mehfil',
        culture: 'hindu',
        locales: ['en', 'hi'],
        calendars: [],
        seed: 5713,
        content: {
            people: {
                one: { name: t('Aanya', 'hi', 'आन्या') },
                two: { name: t('Kabir', 'hi', 'कबीर') },
            },
            greetingKey: 'shree-ganeshay-namah',
            headline: t(
                'request the pleasure of your company at the celebration of their marriage',
                'hi',
                'अपने विवाह समारोह में आपकी उपस्थिति का अनुरोध करते हैं',
            ),
            welcome: t(
                'Three days of colour, music and family. Come as you are, leave with stories.',
            ),
            story: t(
                'You have watched us grow up, laughed with us and loved us through every chapter. It would mean the world to have you beside us as we begin this one.\n\nCome hungry, come ready to dance, and bring your brightest smile.',
            ),
            family: t('Smt. Meera & Shri Rajesh Malhotra · Smt. Nisha & Shri Vikram Kapoor'),
            closing: t('We can’t wait to celebrate with you.'),
            // Illustrated stand-ins for the couple's portraits (the Phoolwari art kit).
            photoSlots: {
                'story.one': '/kits/phoolwari/haldi-1.webp',
                'story.two': '/kits/phoolwari/sangeet-2.webp',
                'story.together': '/kits/phoolwari/wedding-couples.webp',
            },
            gallery: [],
        },
        events: [
            {
                kind: 'mehndi',
                title: t('Mehendi', 'hi', 'मेहंदी'),
                startsAt: '2027-02-11T16:00',
                timezone: 'Asia/Kolkata',
                venue: 'The Leela Palace',
                address: 'Old Airport Road, Bengaluru',
                mapsUrl: maps('The Leela Palace Bengaluru'),
            },
            {
                kind: 'sangeet',
                title: t('Sangeet', 'hi', 'संगीत'),
                startsAt: '2027-02-12T19:00',
                timezone: 'Asia/Kolkata',
                venue: 'The Leela Palace',
                address: 'Old Airport Road, Bengaluru',
                mapsUrl: maps('The Leela Palace Bengaluru'),
            },
            {
                kind: 'pheras',
                title: t('Wedding', 'hi', 'विवाह'),
                startsAt: '2027-02-13T19:00',
                timezone: 'Asia/Kolkata',
                venue: 'The Leela Palace',
                address: 'Old Airport Road, Bengaluru',
                mapsUrl: maps('The Leela Palace Bengaluru'),
                dressCode: {
                    note: t('Festive Indian or black tie'),
                    swatches: ['#8e1f4f', '#c0902f'],
                },
            },
            {
                kind: 'reception',
                title: t('Reception', 'hi', 'रिसेप्शन'),
                startsAt: '2027-02-14T19:30',
                timezone: 'Asia/Kolkata',
                venue: 'The Leela Palace',
                address: 'Old Airport Road, Bengaluru',
                mapsUrl: maps('The Leela Palace Bengaluru'),
            },
        ],
        extras: { wishes: { enabled: true } },
        sections: sectionsFor('hindu', ['story', 'family']),
    },
    {
        slug: 'demo-rajwada',
        themeSlug: 'rajwada',
        culture: 'hindu.gujarati',
        locales: ['en', 'gu', 'hi'],
        calendars: [],
        seed: 1021,
        content: {
            people: {
                one: {
                    name: t('Aarav', 'gu', 'આરવ', 'hi', 'आरव'),
                    parents: t('Son of Mr & Mrs Mehul Shah', 'gu', 'શ્રી મેહુલભાઈ શાહના સુપુત્ર'),
                },
                two: {
                    name: t('Diya', 'gu', 'દિયા', 'hi', 'दिया'),
                    parents: t('Daughter of Mr & Mrs Kiran Patel', 'gu', 'શ્રી કિરણભાઈ પટેલના સુપુત્રી'),
                },
            },
            greetingKey: 'shree-ganeshay-namah',
            headline: t(
                'Together with their families, invite you to celebrate their wedding',
                'gu',
                'પરિવારજનો સાથે આપને લગ્નોત્સવમાં સાદર આમંત્રે છે',
                'hi',
                'परिवार सहित आपको विवाह समारोह में सादर आमंत्रित करते हैं',
            ),
            welcome: t(
                'Across Ahmedabad’s old pols and a palace on the lake, our two families become one. Come, be part of the story.',
                'gu',
                'અમદાવાદની પોળથી તળાવકિનારાના મહેલ સુધી — બે પરિવાર એક બને છે. પધારો, આ વાર્તાનો ભાગ બનો.',
            ),
            story: t(
                'We met at a Navratri garba in 2019 — he missed every step, she laughed at every one. Five years and a thousand chai breaks later, here we are.',
            ),
            family: t('The Shah & Patel families', 'gu', 'શાહ અને પટેલ પરિવાર'),
            closing: t(
                'Your presence is the greatest blessing.',
                'gu',
                'આપની હાજરી એ જ અમારા માટે સૌથી મોટા આશીર્વાદ છે.',
            ),
            hashtag: '#AaravWedsDiya',
            gallery: [],
        },
        events: [
            {
                kind: 'mehndi',
                title: t('Mehndi', 'gu', 'મહેંદી'),
                startsAt: '2027-01-21T16:00',
                endsAt: '2027-01-21T20:00',
                timezone: 'Asia/Kolkata',
                venue: 'The House of MG',
                address: 'Lal Darwaja, Ahmedabad',
                mapsUrl: maps('The House of MG Ahmedabad'),
                dressCode: {
                    note: t('Shades of green'),
                    swatches: ['#3f7d4e', '#9bc48a'],
                },
            },
            {
                kind: 'garba',
                title: t('Garba Night', 'gu', 'ગરબા રાત્રિ'),
                startsAt: '2027-01-21T21:00',
                timezone: 'Asia/Kolkata',
                venue: 'Riverfront Lawns',
                address: 'Sabarmati Riverfront, Ahmedabad',
                mapsUrl: maps('Sabarmati Riverfront Ahmedabad'),
                dressCode: {
                    note: t('Chaniya choli & kediyu'),
                    swatches: ['#c2185b', '#f9a825', '#1565c0'],
                },
            },
            {
                kind: 'pheras',
                title: t('Hastmilap', 'gu', 'હસ્તમેળાપ'),
                startsAt: '2027-01-22T10:30',
                timezone: 'Asia/Kolkata',
                venue: 'Taj Lake Palace',
                address: 'Lake Pichola, Udaipur',
                mapsUrl: maps('Taj Lake Palace Udaipur'),
                dressCode: {
                    note: t('Royal reds & gold'),
                    swatches: ['#b8324f', '#d9a441'],
                },
            },
            {
                kind: 'reception',
                title: t('Reception', 'gu', 'રિસેપ્શન'),
                startsAt: '2027-01-22T19:30',
                timezone: 'Asia/Kolkata',
                venue: 'Taj Lake Palace',
                address: 'Lake Pichola, Udaipur',
                mapsUrl: maps('Taj Lake Palace Udaipur'),
            },
        ],
        extras: {
            shagun: {
                upiId: 'aaravdiya@upi',
                payeeName: 'Aarav & Diya',
            },
            wishes: { enabled: true },
        },
        sections: sectionsFor('hindu', ['dressCode']),
    },
    {
        slug: 'demo-bandhani',
        themeSlug: 'bandhani',
        culture: 'hindu.gujarati',
        locales: ['gu', 'en'],
        calendars: [],
        seed: 2207,
        content: {
            people: {
                one: { name: t('Krish', 'gu', 'ક્રિશ') },
                two: { name: t('Meera', 'gu', 'મીરા') },
            },
            greetingKey: 'shree-ganeshay-namah',
            headline: t('Request the pleasure of your company', 'gu', 'આપની ઉપસ્થિતિ પ્રાર્થનીય છે'),
            welcome: t(
                'Kumkum, kankotri and a courtyard full of family — come home to Rajkot for our wedding.',
                'gu',
                'કંકુ, કંકોતરી અને પરિવારથી ભરેલું આંગણું — અમારા લગ્નમાં રાજકોટ પધારો.',
            ),
            closing: t(
                'With love, the Joshi & Trivedi families',
                'gu',
                'સ્નેહાધીન, જોષી અને ત્રિવેદી પરિવાર',
            ),
            gallery: [],
        },
        events: [
            {
                kind: 'mameru',
                title: t('Mameru', 'gu', 'મામેરું'),
                startsAt: '2027-02-10T11:00',
                timezone: 'Asia/Kolkata',
                venue: 'Joshi Niwas',
                address: 'Kalawad Road, Rajkot',
                mapsUrl: maps('Kalawad Road Rajkot'),
            },
            {
                kind: 'pheras',
                title: t('Lagna', 'gu', 'લગ્ન'),
                startsAt: '2027-02-11T18:30',
                timezone: 'Asia/Kolkata',
                venue: 'Imperial Palace',
                address: 'Dr Yagnik Road, Rajkot',
                mapsUrl: maps('Imperial Palace Rajkot'),
            },
        ],
        extras: { wishes: { enabled: true } },
        sections: sectionsFor('hindu'),
    },
    {
        slug: 'demo-gulmohar',
        themeSlug: 'gulmohar',
        culture: 'hindu.marwari',
        locales: ['en', 'hi'],
        calendars: [],
        seed: 3391,
        content: {
            people: {
                one: { name: t('Vihaan', 'hi', 'विहान') },
                two: { name: t('Anaya', 'hi', 'अनाया') },
            },
            greetingKey: 'shubh-vivah',
            headline: t(
                'invite you to the beginning of forever',
                'hi',
                'आपको हमारे नए सफ़र की शुरुआत में आमंत्रित करते हैं',
            ),
            welcome: t('Under the gulmohar trees of Jaipur, where it all began.'),
            closing: t('See you under the gulmohars.'),
            gallery: [],
        },
        events: [
            {
                kind: 'haldi',
                title: t('Haldi', 'hi', 'हल्दी'),
                startsAt: '2027-03-04T10:00',
                timezone: 'Asia/Kolkata',
                venue: 'Samode Haveli',
                address: 'Gangapole, Jaipur',
                mapsUrl: maps('Samode Haveli Jaipur'),
                dressCode: {
                    note: t('Yellow & white'),
                    swatches: ['#f4c430', '#fffbe6'],
                },
            },
            {
                kind: 'pheras',
                title: t('Pheras', 'hi', 'फेरे'),
                startsAt: '2027-03-05T19:00',
                timezone: 'Asia/Kolkata',
                venue: 'Rambagh Palace',
                address: 'Bhawani Singh Road, Jaipur',
                mapsUrl: maps('Rambagh Palace Jaipur'),
            },
        ],
        extras: {},
        sections: sectionsFor('hindu'),
    },
    {
        slug: 'demo-mashrabiya',
        themeSlug: 'mashrabiya',
        culture: 'islamic.arab',
        locales: ['ar', 'en'],
        calendars: ['islamic-umalqura'],
        seed: 4471,
        content: {
            people: {
                one: { name: t('Omar', 'ar', 'عمر') },
                two: { name: t('Layla', 'ar', 'ليلى') },
            },
            greetingKey: 'bismillah',
            headline: t(
                'request the honour of your presence at their wedding',
                'ar',
                'يتشرفون بدعوتكم لحضور حفل زفافهم',
            ),
            welcome: t(
                'Two families, one celebration beneath the lanterns of Dubai.',
                'ar',
                'عائلتان واحتفال واحد تحت فوانيس دبي.',
            ),
            closing: t('Your presence completes our joy.', 'ar', 'حضوركم يكمل فرحتنا.'),
            gallery: [],
        },
        events: [
            {
                kind: 'nikah',
                title: t('Katb al-Kitab', 'ar', 'عقد القران'),
                startsAt: '2027-04-15T17:00',
                timezone: 'Asia/Dubai',
                venue: 'Al Habtoor Palace',
                address: 'Al Habtoor City, Dubai',
                mapsUrl: maps('Al Habtoor Palace Dubai'),
            },
            {
                kind: 'reception',
                title: t('Wedding Reception', 'ar', 'حفل الزفاف'),
                startsAt: '2027-04-16T20:00',
                timezone: 'Asia/Dubai',
                venue: 'Jumeirah Emirates Towers',
                address: 'Sheikh Zayed Road, Dubai',
                mapsUrl: maps('Jumeirah Emirates Towers'),
            },
        ],
        extras: { wishes: { enabled: true } },
        sections: sectionsFor('islamic'),
    },
    {
        slug: 'demo-noor',
        themeSlug: 'noor',
        culture: 'islamic.south-asian',
        locales: ['ur', 'en'],
        calendars: ['islamic-umalqura'],
        seed: 5503,
        content: {
            people: {
                one: { name: t('Zayan', 'ur', 'زیان') },
                two: { name: t('Inaya', 'ur', 'عنایہ') },
            },
            greetingKey: 'bismillah',
            headline: t(
                'cordially invite you to their Nikah',
                'ur',
                'آپ کو اپنے نکاح میں دعوت دیتے ہیں',
            ),
            welcome: t(
                'With the duas of our elders, we begin a new chapter in Hyderabad.',
                'ur',
                'بزرگوں کی دعاؤں کے ساتھ ہم حیدرآباد میں ایک نئے باب کا آغاز کرتے ہیں۔',
            ),
            closing: t('Please keep us in your duas.', 'ur', 'ہمیں اپنی دعاؤں میں یاد رکھیں۔'),
            gallery: [],
        },
        events: [
            {
                kind: 'mehndi',
                title: t('Mehndi', 'ur', 'مہندی'),
                startsAt: '2027-01-14T19:00',
                timezone: 'Asia/Kolkata',
                venue: 'Taj Falaknuma Palace',
                address: 'Engine Bowli, Hyderabad',
                mapsUrl: maps('Taj Falaknuma Palace'),
            },
            {
                kind: 'nikah',
                title: t('Nikah', 'ur', 'نکاح'),
                startsAt: '2027-01-15T13:00',
                timezone: 'Asia/Kolkata',
                venue: 'Chowmahalla Palace',
                address: 'Khilwat, Hyderabad',
                mapsUrl: maps('Chowmahalla Palace'),
            },
            {
                kind: 'walima',
                title: t('Walima', 'ur', 'ولیمہ'),
                startsAt: '2027-01-16T20:00',
                timezone: 'Asia/Kolkata',
                venue: 'Chowmahalla Palace',
                address: 'Khilwat, Hyderabad',
                mapsUrl: maps('Chowmahalla Palace'),
            },
        ],
        extras: {},
        sections: sectionsFor('islamic'),
    },
    {
        slug: 'demo-kamal',
        themeSlug: 'kamal',
        culture: 'jain.shwetambar',
        locales: ['gu', 'en', 'hi'],
        calendars: [],
        seed: 6619,
        content: {
            people: {
                one: { name: t('Parshva', 'gu', 'પાર્શ્વ', 'hi', 'पार्श्व') },
                two: { name: t('Siddhi', 'gu', 'સિદ્ધિ', 'hi', 'सिद्धि') },
            },
            greetingKey: 'jai-jinendra',
            headline: t(
                'seek your blessings as they begin their journey together',
                'gu',
                'જીવનની નવી યાત્રાની શરૂઆતમાં આપના આશીર્વાદ ઇચ્છે છે',
            ),
            welcome: t('In the spirit of ahimsa and joy, we welcome you to Palitana.'),
            closing: t('With folded hands, the Mehta & Shah families'),
            gallery: [],
        },
        events: [
            {
                kind: 'sangeet',
                title: t('Sangeet Sandhya', 'gu', 'સંગીત સંધ્યા'),
                startsAt: '2027-02-02T19:00',
                timezone: 'Asia/Kolkata',
                venue: 'Vijay Vilas Palace',
                address: 'Adpur, Palitana',
                mapsUrl: maps('Vijay Vilas Palace Palitana'),
            },
            {
                kind: 'lagna',
                title: t('Lagna', 'gu', 'લગ્ન'),
                startsAt: '2027-02-03T11:00',
                timezone: 'Asia/Kolkata',
                venue: 'Vijay Vilas Palace',
                address: 'Adpur, Palitana',
                mapsUrl: maps('Vijay Vilas Palace Palitana'),
            },
        ],
        extras: {},
        sections: sectionsFor('jain'),
    },
    {
        slug: 'demo-phulkari',
        themeSlug: 'phulkari',
        culture: 'sikh.punjabi',
        locales: ['en', 'pa'],
        calendars: [],
        seed: 7727,
        content: {
            people: {
                one: { name: t('Arjan', 'pa', 'ਅਰਜਨ') },
                two: { name: t('Noor', 'pa', 'ਨੂਰ') },
            },
            greetingKey: 'ik-onkar',
            headline: t(
                'request the pleasure of your company at their Anand Karaj',
                'pa',
                'ਅਨੰਦ ਕਾਰਜ ਵਿੱਚ ਆਪ ਜੀ ਨੂੰ ਸਾਦਰ ਸੱਦਾ',
            ),
            welcome: t('Four Laavan, two families, one lifetime. Join us in Amritsar.'),
            closing: t('With love and blessings, the Gill & Sandhu families'),
            gallery: [],
        },
        events: [
            {
                kind: 'sangeet',
                title: t('Sangeet', 'pa', 'ਸੰਗੀਤ'),
                startsAt: '2027-11-20T19:00',
                timezone: 'Asia/Kolkata',
                venue: 'Radisson Blu',
                address: 'Airport Road, Amritsar',
                mapsUrl: maps('Radisson Blu Amritsar'),
            },
            {
                kind: 'anand-karaj',
                title: t('Anand Karaj', 'pa', 'ਅਨੰਦ ਕਾਰਜ'),
                startsAt: '2027-11-21T09:00',
                timezone: 'Asia/Kolkata',
                venue: 'Gurdwara Sahib',
                address: 'Ranjit Avenue, Amritsar',
                mapsUrl: maps('Gurdwara Ranjit Avenue Amritsar'),
            },
            {
                kind: 'reception',
                title: t('Reception', 'pa', 'ਰਿਸੈਪਸ਼ਨ'),
                startsAt: '2027-11-21T19:30',
                timezone: 'Asia/Kolkata',
                venue: 'Hyatt Regency',
                address: 'GT Road, Amritsar',
                mapsUrl: maps('Hyatt Regency Amritsar'),
            },
        ],
        extras: {},
        sections: sectionsFor('sikh'),
    },
    {
        slug: 'demo-cathedral-garden',
        themeSlug: 'cathedral-garden',
        culture: 'christian.catholic',
        locales: ['en'],
        calendars: [],
        seed: 8803,
        content: {
            people: {
                one: { name: t('Daniel') },
                two: { name: t('Sophia') },
            },
            greetingKey: 'love-is-patient',
            headline: t('joyfully invite you to their wedding'),
            welcome: t('From a rainy afternoon in a Goa bookshop to the altar of Se Cathedral.'),
            closing: t('Join us for dinner, dancing and forever.'),
            gallery: [],
        },
        events: [
            {
                kind: 'ceremony',
                title: t('Holy Matrimony'),
                startsAt: '2027-12-18T16:00',
                timezone: 'Asia/Kolkata',
                venue: 'Se Cathedral',
                address: 'Old Goa',
                mapsUrl: maps('Se Cathedral Old Goa'),
            },
            {
                kind: 'reception',
                title: t('Reception'),
                startsAt: '2027-12-18T19:30',
                timezone: 'Asia/Kolkata',
                venue: 'Taj Fort Aguada',
                address: 'Sinquerim, Goa',
                mapsUrl: maps('Taj Fort Aguada'),
            },
        ],
        extras: {},
        sections: sectionsFor('christian'),
    },
    {
        slug: 'demo-chuppah',
        themeSlug: 'chuppah',
        culture: 'jewish.sephardic',
        locales: ['en', 'he'],
        calendars: ['hebrew'],
        seed: 9917,
        content: {
            people: {
                one: { name: t('David', 'he', 'דוד') },
                two: { name: t('Miriam', 'he', 'מרים') },
            },
            greetingKey: 'bsd',
            headline: t(
                'together with their families invite you to their wedding',
                'he',
                'יחד עם משפחותיהם מתכבדים להזמינכם לחתונתם',
            ),
            welcome: t('Under the chuppah, surrounded by those we love.'),
            closing: t('Mazel Tov — we can’t wait to celebrate with you!', 'he', 'מזל טוב!'),
            gallery: [],
        },
        events: [
            {
                kind: 'kabbalat-panim',
                title: t('Kabbalat Panim', 'he', 'קבלת פנים'),
                startsAt: '2027-06-10T17:30',
                timezone: 'Asia/Dubai',
                venue: 'The Ritz-Carlton',
                address: 'JBR, Dubai',
                mapsUrl: maps('Ritz-Carlton JBR Dubai'),
            },
            {
                kind: 'chuppah',
                title: t('Chuppah', 'he', 'חופה'),
                startsAt: '2027-06-10T18:30',
                timezone: 'Asia/Dubai',
                venue: 'The Ritz-Carlton',
                address: 'JBR, Dubai',
                mapsUrl: maps('Ritz-Carlton JBR Dubai'),
            },
        ],
        extras: {},
        sections: sectionsFor('jewish'),
    },
    {
        slug: 'demo-editorial',
        themeSlug: 'editorial',
        culture: 'universal.modern',
        locales: ['en'],
        calendars: [],
        seed: 10333,
        content: {
            people: {
                one: { name: t('Kabir') },
                two: { name: t('Ira') },
            },
            headline: t('are getting married'),
            welcome: t('A small wedding, a long table, and everyone we love.'),
            closing: t('Come hungry. Leave happy.'),
            gallery: [],
        },
        events: [
            {
                kind: 'ceremony',
                title: t('Ceremony'),
                startsAt: '2027-04-17T17:00',
                timezone: 'Asia/Kolkata',
                venue: 'Soho House',
                address: 'Juhu, Mumbai',
                mapsUrl: maps('Soho House Mumbai'),
            },
            {
                kind: 'reception',
                title: t('Long-table dinner'),
                startsAt: '2027-04-17T20:00',
                timezone: 'Asia/Kolkata',
                venue: 'Soho House',
                address: 'Juhu, Mumbai',
                mapsUrl: maps('Soho House Mumbai'),
            },
        ],
        extras: {},
        sections: sectionsFor('universal'),
    },
    {
        slug: 'demo-resham',
        themeSlug: 'resham',
        culture: 'universal.interfaith',
        locales: ['en', 'hi', 'ar'],
        calendars: [],
        seed: 11447,
        content: {
            people: {
                one: { name: t('Rohan', 'hi', 'रोहन') },
                two: { name: t('Sara', 'ar', 'سارة') },
            },
            headline: t('two traditions, one thread — invite you to their wedding'),
            welcome: t(
                'A Gujarati boy and an Emirati girl, stitched together by one very lucky Dubai monsoon.',
            ),
            closing: t('Every thread of this celebration is woven with your love.'),
            gallery: [],
        },
        events: [
            {
                kind: 'welcome',
                title: t('Welcome Evening'),
                startsAt: '2027-03-12T19:00',
                timezone: 'Asia/Dubai',
                venue: 'Bab Al Shams',
                address: 'Al Qudra, Dubai',
                mapsUrl: maps('Bab Al Shams Dubai'),
            },
            {
                kind: 'ceremony',
                title: t('Ceremony'),
                startsAt: '2027-03-13T17:30',
                timezone: 'Asia/Dubai',
                venue: 'Atlantis The Royal',
                address: 'Palm Jumeirah, Dubai',
                mapsUrl: maps('Atlantis The Royal'),
            },
            {
                kind: 'reception',
                title: t('Reception'),
                startsAt: '2027-03-13T20:30',
                timezone: 'Asia/Dubai',
                venue: 'Atlantis The Royal',
                address: 'Palm Jumeirah, Dubai',
                mapsUrl: maps('Atlantis The Royal'),
            },
        ],
        extras: { wishes: { enabled: true } },
        sections: sectionsFor('universal'),
    },
];

// Each demo's finishing touches: generated music that suits the tradition and the footer credit style.
// Every demo has music; where the culture keeps it off, or on solemn occasions, it waits to be tapped.
const demoFinish: Partial<Record<string, DemoInvitation['extras']>> = {
    mehfil: {
        music: {
            source: 'generated',
            style: 'shehnai',
        },
        branding: {
            style: 'seal',
            dark: true,
        },
    },
    rajwada: {
        music: {
            source: 'generated',
            style: 'shehnai',
        },
        branding: {
            style: 'seal',
            dark: true,
        },
    },
    bandhani: {
        music: {
            source: 'generated',
            style: 'shehnai',
        },
        branding: { style: 'pill' },
    },
    gulmohar: {
        music: {
            source: 'generated',
            style: 'santoor',
        },
        branding: { style: 'signature' },
    },
    mashrabiya: {
        branding: {
            style: 'stamp',
            dark: true,
        },
    },
    noor: {
        branding: {
            style: 'signature',
            dark: true,
        },
    },
    kamal: {
        music: {
            source: 'generated',
            style: 'bells',
        },
        branding: { style: 'line' },
    },
    phulkari: {
        music: {
            source: 'generated',
            style: 'shehnai',
        },
        branding: { style: 'seal' },
    },
    'cathedral-garden': {
        music: {
            source: 'generated',
            style: 'piano',
        },
        branding: { style: 'signature' },
    },
    chuppah: {
        music: {
            source: 'generated',
            style: 'piano',
        },
        branding: { style: 'stamp' },
    },
    editorial: {
        music: {
            source: 'generated',
            style: 'piano',
        },
        branding: { style: 'line' },
    },
    resham: {
        music: {
            source: 'generated',
            style: 'ambient',
        },
        branding: { style: 'pill' },
    },
    shanti: {
        music: {
            source: 'generated',
            style: 'ambient',
        },
        branding: { style: 'line' },
    },
    deepanjali: {
        music: {
            source: 'generated',
            style: 'santoor',
        },
        branding: {
            style: 'line',
            dark: true,
        },
    },
    smriti: { branding: { style: 'line' } },
    chandni: {
        music: {
            source: 'generated',
            style: 'bells',
        },
        branding: {
            style: 'pill',
            dark: true,
        },
    },
    palna: {
        music: {
            source: 'generated',
            style: 'bells',
        },
        branding: { style: 'pill' },
    },
    griha: {
        music: {
            source: 'generated',
            style: 'bells',
        },
        branding: { style: 'seal' },
    },
    utsav: {
        music: {
            source: 'generated',
            style: 'bells',
        },
        branding: { style: 'pill' },
    },
    legacy: {
        music: {
            source: 'generated',
            style: 'piano',
        },
        branding: {
            style: 'signature',
            dark: true,
        },
    },
    aarti: {
        music: {
            source: 'generated',
            style: 'bells',
        },
        branding: {
            style: 'seal',
            dark: true,
        },
    },
    mangal: {
        music: {
            source: 'generated',
            style: 'shehnai',
        },
        branding: { style: 'stamp' },
    },
    summit: {
        branding: {
            style: 'line',
            dark: true,
        },
    },
};

// Designs whose mood calls for something other than their tradition's usual sound.
const demoMusic: Partial<Record<string, MusicStyle>> = {
    'demo-phoolwari': 'santoor',
    'demo-sitara': 'santoor',
    'demo-deepam': 'bells',
    'demo-deepmala': 'santoor',
    'demo-deepmala-yatra': 'santoor',
    'demo-palace-walk': 'santoor',
    'demo-himalaya-walk': 'bells',
};

function musicFor(demo: DemoInvitation) {
    const own = demoFinish[demo.themeSlug]?.music ?? demo.extras.music;
    if (own) return own;
    const occasion = occasionOf(demo.occasion);
    const style =
        demoMusic[demo.slug] ??
        defaultMusicStyle({
            culture: demo.culture,
            tone: occasion.tone,
            category: occasion.category,
        });
    return {
        source: 'generated' as const,
        style,
    };
}

// Demos ship with their theme's full layout preset and finishing touches applied.
export const demoInvitations: (DemoInvitation & { occasion: OccasionId })[] = [
    ...rawDemos,
    ...luxuryDemos,
    ...occasionDemos,
].map((demo) => ({
    ...demo,
    occasion: demo.occasion ?? 'wedding',
    sections: applyLayout(demo.sections, themeLayouts[demo.themeSlug]),
    extras: {
        ...demo.extras,
        ...demoFinish[demo.themeSlug],
        music: musicFor(demo),
    },
}));

export const demoForTheme = (themeSlug: string) =>
    demoInvitations.find((d) => d.themeSlug === themeSlug);

// Sanity guard: every demo must point at a real theme.
for (const demo of demoInvitations) {
    if (!themeBySlug(demo.themeSlug)) throw new Error(`Demo ${demo.slug} references unknown theme`);
}
