// Culture packs: the unit that makes Toran multi-faith. Adding a tradition = adding one entry.
// Sacred text lives ONLY in `greetings` (vetted, never AI-generated) and is marked sacred so no
// destructive effect (blow, break, scratch) is ever applied to it. Each pack needs a community
// reviewer's sign-off before launch.
import type { LocalizedText, SectionType } from './types';

export const cultureIds = [
    'hindu',
    'islamic',
    'jain',
    'sikh',
    'christian',
    'jewish',
    'universal',
] as const;
export type CultureId = (typeof cultureIds)[number];

export interface Greeting {
    key: string;
    text: LocalizedText;
    transliteration?: string;
    meaning: string;
    sacred: boolean;
}

export interface EventVocab {
    kind: string;
    label: LocalizedText;
}

export interface CultureVariant {
    id: string;
    name: string;
}

export interface CulturePack {
    id: CultureId;
    name: LocalizedText;
    variants: CultureVariant[];
    greetings: Greeting[];
    events: EventVocab[];
    dietary: string[];
    calendars: ('gregorian' | 'islamic-umalqura' | 'hebrew')[];
    defaultSections: SectionType[];
    sensitivity: {
        musicDefault: 'on' | 'off';
        allowImageFreeLayout: boolean;
    };
    blessingWord: LocalizedText;
}

const commonSections: SectionType[] = [
    'cover',
    'names',
    'countdown',
    'welcome',
    'story',
    'events',
    'gallery',
    'venue',
    'rsvp',
    'wishes',
    'closing',
];

export const cultures: Record<CultureId, CulturePack> = {
    hindu: {
        id: 'hindu',
        name: {
            en: 'Hindu',
            hi: 'हिन्दू',
            gu: 'હિન્દુ',
        },
        variants: [
            {
                id: 'gujarati',
                name: 'Gujarati',
            },
            {
                id: 'marwari',
                name: 'Marwari',
            },
            {
                id: 'punjabi',
                name: 'Punjabi',
            },
            {
                id: 'south-indian',
                name: 'South Indian',
            },
            {
                id: 'bengali',
                name: 'Bengali',
            },
        ],
        greetings: [
            {
                key: 'shree-ganeshay-namah',
                text: {
                    en: '॥ Shree Ganeshay Namah ॥',
                    hi: '॥ श्री गणेशाय नमः ॥',
                    gu: '॥ શ્રી ગણેશાય નમઃ ॥',
                },
                transliteration: 'Shree Ganeshay Namah',
                meaning: 'Salutations to Lord Ganesha, remover of obstacles',
                sacred: true,
            },
            {
                key: 'shubh-vivah',
                text: {
                    en: 'Shubh Vivah',
                    hi: 'शुभ विवाह',
                    gu: 'શુભ વિવાહ',
                },
                meaning: 'Auspicious wedding',
                sacred: false,
            },
        ],
        events: [
            {
                kind: 'engagement',
                label: {
                    en: 'Engagement',
                    hi: 'सगाई',
                    gu: 'સગાઈ',
                },
            },
            {
                kind: 'ganesh-sthapana',
                label: {
                    en: 'Ganesh Sthapana',
                    hi: 'गणेश स्थापना',
                    gu: 'ગણેશ સ્થાપના',
                },
            },
            {
                kind: 'mameru',
                label: {
                    en: 'Mameru',
                    gu: 'મામેરું',
                },
            },
            {
                kind: 'haldi',
                label: {
                    en: 'Haldi',
                    hi: 'हल्दी',
                    gu: 'પીઠી',
                },
            },
            {
                kind: 'mehndi',
                label: {
                    en: 'Mehndi',
                    hi: 'मेहंदी',
                    gu: 'મહેંદી',
                },
            },
            {
                kind: 'sangeet',
                label: {
                    en: 'Sangeet',
                    hi: 'संगीत',
                    gu: 'સંગીત સંધ્યા',
                },
            },
            {
                kind: 'garba',
                label: {
                    en: 'Garba / Raas',
                    gu: 'ગરબા / રાસ',
                },
            },
            {
                kind: 'baraat',
                label: {
                    en: 'Baraat',
                    hi: 'बारात',
                    gu: 'જાન',
                },
            },
            {
                kind: 'pheras',
                label: {
                    en: 'Wedding Ceremony',
                    hi: 'फेरे',
                    gu: 'હસ્તમેળાપ',
                },
            },
            {
                kind: 'reception',
                label: {
                    en: 'Reception',
                    hi: 'रिसेप्शन',
                    gu: 'રિસેપ્શન',
                },
            },
        ],
        dietary: ['vegetarian', 'jain', 'vegan', 'non-vegetarian'],
        calendars: ['gregorian'],
        defaultSections: [
            ...commonSections.slice(0, 5),
            'family',
            ...commonSections.slice(5),
            'shagun',
        ],
        sensitivity: {
            musicDefault: 'on',
            allowImageFreeLayout: false,
        },
        blessingWord: {
            en: 'Aashirvaad',
            hi: 'आशीर्वाद',
            gu: 'આશીર્વાદ',
        },
    },
    islamic: {
        id: 'islamic',
        name: {
            en: 'Muslim',
            ar: 'إسلامي',
            ur: 'اسلامی',
            hi: 'मुस्लिम',
        },
        variants: [
            {
                id: 'south-asian',
                name: 'South Asian',
            },
            {
                id: 'arab',
                name: 'Arab / Emirati',
            },
        ],
        greetings: [
            {
                key: 'bismillah',
                text: {
                    ar: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
                    ur: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
                    en: 'In the name of Allah, the Most Gracious, the Most Merciful',
                },
                transliteration: 'Bismillah ir-Rahman ir-Rahim',
                meaning: 'In the name of Allah, the Most Gracious, the Most Merciful',
                sacred: true,
            },
            {
                key: 'mubarak',
                text: {
                    en: 'Shaadi Mubarak',
                    ur: 'شادی مبارک',
                    ar: 'ألف مبروك',
                },
                meaning: 'Congratulations on the marriage',
                sacred: false,
            },
        ],
        events: [
            {
                kind: 'engagement',
                label: {
                    en: 'Mangni',
                    ur: 'منگنی',
                    ar: 'الخطوبة',
                },
            },
            {
                kind: 'mehndi',
                label: {
                    en: 'Mehndi',
                    ur: 'مہندی',
                    ar: 'ليلة الحناء',
                },
            },
            {
                kind: 'nikah',
                label: {
                    en: 'Nikah',
                    ur: 'نکاح',
                    ar: 'عقد القران',
                },
            },
            {
                kind: 'rukhsati',
                label: {
                    en: 'Rukhsati',
                    ur: 'رخصتی',
                },
            },
            {
                kind: 'zaffa',
                label: {
                    en: 'Zaffa',
                    ar: 'الزفة',
                },
            },
            {
                kind: 'walima',
                label: {
                    en: 'Walima',
                    ur: 'ولیمہ',
                    ar: 'الوليمة',
                },
            },
            {
                kind: 'reception',
                label: {
                    en: 'Reception',
                    ur: 'استقبالیہ',
                    ar: 'حفل الاستقبال',
                },
            },
        ],
        dietary: ['halal', 'vegetarian', 'vegan'],
        calendars: ['gregorian', 'islamic-umalqura'],
        defaultSections: [...commonSections],
        sensitivity: {
            musicDefault: 'off',
            allowImageFreeLayout: true,
        },
        blessingWord: {
            en: 'Duas',
            ur: 'دعائیں',
            ar: 'الدعاء',
        },
    },
    jain: {
        id: 'jain',
        name: {
            en: 'Jain',
            hi: 'जैन',
            gu: 'જૈન',
        },
        variants: [
            {
                id: 'shwetambar',
                name: 'Shwetambar',
            },
            {
                id: 'digambar',
                name: 'Digambar',
            },
        ],
        greetings: [
            {
                key: 'jai-jinendra',
                text: {
                    en: 'Jai Jinendra',
                    hi: 'जय जिनेन्द्र',
                    gu: 'જય જિનેન્દ્ર',
                },
                meaning: 'Honour to the Jinas, the victorious ones',
                sacred: true,
            },
        ],
        events: [
            {
                kind: 'engagement',
                label: {
                    en: 'Sagai',
                    hi: 'सगाई',
                    gu: 'સગાઈ',
                },
            },
            {
                kind: 'mehndi',
                label: {
                    en: 'Mehndi',
                    hi: 'मेहंदी',
                    gu: 'મહેંદી',
                },
            },
            {
                kind: 'sangeet',
                label: {
                    en: 'Sangeet',
                    hi: 'संगीत',
                    gu: 'સંગીત સંધ્યા',
                },
            },
            {
                kind: 'lagna',
                label: {
                    en: 'Lagna (Wedding)',
                    hi: 'लग्न',
                    gu: 'લગ્ન',
                },
            },
            {
                kind: 'reception',
                label: {
                    en: 'Reception',
                    hi: 'रिसेप्शन',
                    gu: 'રિસેપ્શન',
                },
            },
        ],
        dietary: ['jain', 'vegetarian', 'vegan'],
        calendars: ['gregorian'],
        defaultSections: [...commonSections.slice(0, 5), 'family', ...commonSections.slice(5)],
        sensitivity: {
            musicDefault: 'on',
            allowImageFreeLayout: false,
        },
        blessingWord: {
            en: 'Shubhkamna',
            hi: 'शुभकामना',
            gu: 'શુભકામના',
        },
    },
    sikh: {
        id: 'sikh',
        name: {
            en: 'Sikh',
            pa: 'ਸਿੱਖ',
            hi: 'सिख',
        },
        variants: [
            {
                id: 'punjabi',
                name: 'Punjabi',
            },
        ],
        greetings: [
            {
                key: 'ik-onkar',
                text: {
                    en: 'ੴ',
                    pa: 'ੴ ਸਤਿ ਨਾਮੁ',
                },
                transliteration: 'Ik Onkar Sat Naam',
                meaning: 'One Creator; Truth is His name',
                sacred: true,
            },
        ],
        events: [
            {
                kind: 'roka',
                label: {
                    en: 'Roka',
                    pa: 'ਰੋਕਾ',
                },
            },
            {
                kind: 'chunni',
                label: {
                    en: 'Chunni Ceremony',
                    pa: 'ਚੁੰਨੀ',
                },
            },
            {
                kind: 'mehndi',
                label: {
                    en: 'Mehndi',
                    pa: 'ਮਹਿੰਦੀ',
                },
            },
            {
                kind: 'sangeet',
                label: {
                    en: 'Sangeet',
                    pa: 'ਸੰਗੀਤ',
                },
            },
            {
                kind: 'anand-karaj',
                label: {
                    en: 'Anand Karaj',
                    pa: 'ਅਨੰਦ ਕਾਰਜ',
                },
            },
            {
                kind: 'reception',
                label: {
                    en: 'Reception',
                    pa: 'ਰਿਸੈਪਸ਼ਨ',
                },
            },
        ],
        dietary: ['vegetarian', 'non-vegetarian', 'vegan'],
        calendars: ['gregorian'],
        defaultSections: [...commonSections.slice(0, 5), 'family', ...commonSections.slice(5)],
        sensitivity: {
            musicDefault: 'on',
            allowImageFreeLayout: false,
        },
        blessingWord: {
            en: 'Blessings',
            pa: 'ਅਸੀਸਾਂ',
        },
    },
    christian: {
        id: 'christian',
        name: {
            en: 'Christian',
            hi: 'ईसाई',
            ar: 'مسيحي',
        },
        variants: [
            {
                id: 'catholic',
                name: 'Catholic',
            },
            {
                id: 'protestant',
                name: 'Protestant',
            },
            {
                id: 'orthodox',
                name: 'Orthodox',
            },
        ],
        greetings: [
            {
                key: 'love-is-patient',
                text: { en: '“Love is patient, love is kind.” — 1 Corinthians 13:4' },
                meaning: 'Scripture on love',
                sacred: true,
            },
        ],
        events: [
            {
                kind: 'rehearsal-dinner',
                label: { en: 'Rehearsal Dinner' },
            },
            {
                kind: 'ceremony',
                label: {
                    en: 'Wedding Ceremony',
                    ar: 'مراسم الزفاف',
                },
            },
            {
                kind: 'reception',
                label: {
                    en: 'Reception',
                    ar: 'حفل الاستقبال',
                },
            },
            {
                kind: 'after-party',
                label: { en: 'After Party' },
            },
        ],
        dietary: ['none', 'vegetarian', 'vegan', 'gluten-free'],
        calendars: ['gregorian'],
        defaultSections: [...commonSections],
        sensitivity: {
            musicDefault: 'on',
            allowImageFreeLayout: false,
        },
        blessingWord: { en: 'Blessings' },
    },
    jewish: {
        id: 'jewish',
        name: {
            en: 'Jewish',
            he: 'יהודי',
        },
        variants: [
            {
                id: 'ashkenazi',
                name: 'Ashkenazi',
            },
            {
                id: 'sephardic',
                name: 'Sephardic',
            },
            {
                id: 'mizrahi',
                name: 'Mizrahi',
            },
        ],
        greetings: [
            {
                key: 'bsd',
                text: {
                    he: 'בס״ד',
                    en: 'B’siyata Dishmaya',
                },
                transliteration: 'B’siyata Dishmaya',
                meaning: 'With the help of Heaven',
                sacred: true,
            },
            {
                key: 'mazel-tov',
                text: {
                    he: 'מזל טוב',
                    en: 'Mazel Tov',
                },
                meaning: 'Good fortune / congratulations',
                sacred: false,
            },
        ],
        events: [
            {
                kind: 'aufruf',
                label: {
                    en: 'Aufruf',
                    he: 'עלייה לתורה',
                },
            },
            {
                kind: 'henna',
                label: {
                    en: 'Henna Night',
                    he: 'חינה',
                },
            },
            {
                kind: 'kabbalat-panim',
                label: {
                    en: 'Kabbalat Panim',
                    he: 'קבלת פנים',
                },
            },
            {
                kind: 'chuppah',
                label: {
                    en: 'Chuppah',
                    he: 'חופה',
                },
            },
            {
                kind: 'reception',
                label: {
                    en: 'Seudah & Celebration',
                    he: 'סעודה',
                },
            },
        ],
        dietary: ['kosher', 'vegetarian', 'vegan'],
        calendars: ['gregorian', 'hebrew'],
        defaultSections: [...commonSections],
        sensitivity: {
            musicDefault: 'on',
            allowImageFreeLayout: true,
        },
        blessingWord: {
            en: 'Blessings',
            he: 'ברכות',
        },
    },
    universal: {
        id: 'universal',
        name: {
            en: 'Universal',
            hi: 'सार्वभौमिक',
            gu: 'સર્વસામાન્ય',
            ar: 'عالمي',
            ur: 'عالمی',
        },
        variants: [
            {
                id: 'modern',
                name: 'Modern',
            },
            {
                id: 'interfaith',
                name: 'Interfaith',
            },
        ],
        greetings: [],
        events: [
            {
                kind: 'welcome',
                label: {
                    en: 'Welcome Evening',
                    hi: 'स्वागत संध्या',
                    gu: 'સ્વાગત સંધ્યા',
                    ar: 'أمسية الترحيب',
                    ur: 'استقبالیہ شام',
                },
            },
            {
                kind: 'ceremony',
                label: {
                    en: 'Ceremony',
                    hi: 'समारोह',
                    gu: 'સમારોહ',
                    ar: 'المراسم',
                    ur: 'تقریب',
                },
            },
            {
                kind: 'reception',
                label: {
                    en: 'Reception',
                    hi: 'रिसेप्शन',
                    gu: 'રિસેપ્શન',
                    ar: 'حفل الاستقبال',
                    ur: 'استقبالیہ',
                },
            },
            {
                kind: 'brunch',
                label: { en: 'Farewell Brunch' },
            },
        ],
        dietary: ['none', 'vegetarian', 'vegan', 'halal', 'kosher', 'jain'],
        calendars: ['gregorian'],
        defaultSections: [...commonSections],
        sensitivity: {
            musicDefault: 'on',
            allowImageFreeLayout: true,
        },
        blessingWord: {
            en: 'Wishes',
            hi: 'शुभकामनाएँ',
            gu: 'શુભેચ્છાઓ',
            ar: 'التهاني',
            ur: 'نیک خواہشات',
        },
    },
};

const isCultureId = (value: string): value is CultureId =>
    (cultureIds as readonly string[]).includes(value);

export function cultureOf(id: string): CulturePack {
    const base = id.split('.')[0] ?? '';
    return isCultureId(base) ? cultures[base] : cultures.universal;
}

export function eventLabel(culture: string, kind: string, locale: string): string {
    const vocab = cultureOf(culture).events.find((e) => e.kind === kind);
    return vocab ? pickText(vocab.label, locale) : kind;
}

// Falls back to English, then to the first available script, so missing translations never blank out.
export function pickText(text: LocalizedText | undefined, locale: string): string {
    if (!text) return '';
    return text[locale] ?? text.en ?? Object.values(text)[0] ?? '';
}
