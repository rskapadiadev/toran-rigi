// Demo invitations shown in the theme gallery (seeded as is_demo rows). Names are fictional.
import type { CultureId } from './cultures';
import { cultures } from './cultures';
import { themeBySlug } from './themes';
import type { InvitationContent, InvitationExtras, LocalizedText, SectionConfig } from './types';

export interface DemoDressCode {
    note?: LocalizedText;
    swatches: string[];
}

export interface DemoEvent {
    kind: string;
    title: LocalizedText;
    startsAt: string;
    endsAt?: string;
    timezone: string;
    venue: string;
    address: string;
    mapsUrl: string;
    description?: LocalizedText;
    dressCode?: DemoDressCode;
}

export interface DemoInvitation {
    slug: string;
    themeSlug: string;
    culture: string;
    locales: string[];
    calendars: string[];
    seed: number;
    content: InvitationContent;
    events: DemoEvent[];
    extras: InvitationExtras;
    sections: SectionConfig[];
}

// t('English', 'gu', 'ગુજરાતી', 'hi', 'हिन्दी') → { en, gu, hi }
function t(en: string, ...pairs: string[]): LocalizedText {
    const text: LocalizedText = { en };
    for (let i = 0; i + 1 < pairs.length; i += 2) text[pairs[i] ?? ''] = pairs[i + 1] ?? '';
    return text;
}

const maps = (q: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

function sectionsFor(culture: CultureId, extra: SectionConfig['type'][] = []): SectionConfig[] {
    const base = cultures[culture].defaultSections;
    return [...base, ...extra.filter((s) => !base.includes(s))].map((type) => ({
        type,
        enabled: true,
    }));
}

export const demoInvitations: DemoInvitation[] = [
    {
        slug: 'demo-rajwada',
        themeSlug: 'rajwada',
        culture: 'hindu.gujarati',
        locales: ['en', 'gu', 'hi'],
        calendars: [],
        seed: 1021,
        content: {
            couple: {
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
            couple: {
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
            couple: {
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
            couple: {
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
            couple: {
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
            couple: {
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
            couple: {
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
            couple: {
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
            couple: {
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
            couple: {
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
            couple: {
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

export const demoForTheme = (themeSlug: string) =>
    demoInvitations.find((d) => d.themeSlug === themeSlug);

// Sanity guard: every demo must point at a real theme.
for (const demo of demoInvitations) {
    if (!themeBySlug(demo.themeSlug)) throw new Error(`Demo ${demo.slug} references unknown theme`);
}
