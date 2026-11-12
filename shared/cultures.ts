// Culture packs: the unit that makes Toran multi-faith. Adding a tradition = adding one entry.
// Sacred text lives ONLY in `greetings` (vetted, never AI-generated) and is marked sacred so no
// destructive effect (blow, break, scratch) is ever applied to it. Each pack needs a community
// reviewer's sign-off before launch.
import { type OccasionId, occasionIds, occasions } from './occasions';
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
    // Default 'auspicious'; 'solemn' greetings head remembrance notices only.
    tone?: 'auspicious' | 'solemn' | 'any';
    // Limit to these occasions (e.g. "Shubh Vivah" is wedding-only).
    occasions?: readonly OccasionId[];
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
    // Wedding ceremonies; other occasions use `occasionEvents` plus the occasion's generic list.
    events: EventVocab[];
    occasionEvents?: Partial<Record<OccasionId, EventVocab[]>>;
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
    'card',
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
                occasions: ['wedding', 'engagement'],
            },
            {
                key: 'om-shanti',
                text: {
                    en: '॥ Om Shanti ॥',
                    hi: '॥ ॐ शान्ति ॥',
                    gu: '॥ ૐ શાંતિ ॥',
                },
                transliteration: 'Om Shanti',
                meaning: 'Peace (to the departed soul)',
                sacred: true,
                tone: 'solemn',
            },
            {
                key: 'shraddhanjali',
                text: {
                    en: 'Shraddhanjali',
                    hi: 'श्रद्धांजलि',
                    gu: 'શ્રદ્ધાંજલિ',
                },
                meaning: 'A tribute of reverence',
                sacred: false,
                tone: 'solemn',
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
        occasionEvents: {
            naming: [
                {
                    kind: 'namkaran',
                    label: {
                        en: 'Namkaran',
                        hi: 'नामकरण',
                        gu: 'નામકરણ',
                    },
                },
                {
                    kind: 'chhathi',
                    label: {
                        en: 'Chhathi',
                        hi: 'छठी',
                        gu: 'છઠ્ઠી',
                    },
                },
            ],
            baby_shower: [
                {
                    kind: 'seemant',
                    label: {
                        en: 'Seemant',
                        hi: 'गोद भराई',
                        gu: 'સીમંત',
                    },
                },
            ],
            griha_pravesh: [
                {
                    kind: 'griha-pravesh',
                    label: {
                        en: 'Griha pravesh',
                        hi: 'गृह प्रवेश',
                        gu: 'ગૃહ પ્રવેશ',
                    },
                },
                {
                    kind: 'vastu-shanti',
                    label: {
                        en: 'Vastu shanti',
                        hi: 'वास्तु शांति',
                        gu: 'વાસ્તુ શાંતિ',
                    },
                },
            ],
            demise_notice: [
                {
                    kind: 'antim-yatra',
                    label: {
                        en: 'Antim yatra',
                        hi: 'अंतिम यात्रा',
                        gu: 'અંતિમ યાત્રા',
                    },
                },
            ],
            prayer_meet: [
                {
                    kind: 'besnu',
                    label: {
                        en: 'Besnu',
                        hi: 'बैठक',
                        gu: 'બેસણું',
                    },
                },
                {
                    kind: 'uthamna',
                    label: {
                        en: 'Uthamna',
                        hi: 'उठावना',
                        gu: 'ઉઠમણું',
                    },
                },
                {
                    kind: 'shok-sabha',
                    label: {
                        en: 'Shok sabha',
                        hi: 'शोक सभा',
                        gu: 'શોક સભા',
                    },
                },
            ],
            death_anniversary: [
                {
                    kind: 'shraddh',
                    label: {
                        en: 'Shraddh',
                        hi: 'श्राद्ध',
                        gu: 'શ્રાદ્ધ',
                    },
                },
                {
                    kind: 'punyatithi',
                    label: {
                        en: 'Punyatithi',
                        hi: 'पुण्यतिथि',
                        gu: 'પુણ્યતિથિ',
                    },
                },
            ],
        },
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
                tone: 'any',
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
            {
                key: 'inna-lillahi',
                text: {
                    en: 'Inna lillahi wa inna ilayhi raji‘un',
                    ar: 'إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
                    ur: 'إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
                },
                transliteration: 'Inna lillahi wa inna ilayhi raji‘un',
                meaning: 'To God we belong and to Him we return (Quran 2:156)',
                sacred: true,
                tone: 'solemn',
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
        occasionEvents: {
            naming: [
                {
                    kind: 'aqiqah',
                    label: {
                        en: 'Aqiqah',
                        ar: 'العقيقة',
                        ur: 'عقیقہ',
                    },
                },
            ],
            demise_notice: [
                {
                    kind: 'namaz-e-janaza',
                    label: {
                        en: 'Namaz-e-janaza',
                        ar: 'صلاة الجنازة',
                        ur: 'نمازِ جنازہ',
                    },
                },
                {
                    kind: 'tadfeen',
                    label: {
                        en: 'Burial',
                        ar: 'الدفن',
                        ur: 'تدفین',
                    },
                },
            ],
            prayer_meet: [
                {
                    kind: 'quran-khwani',
                    label: {
                        en: 'Quran khwani',
                        ar: 'ختم القرآن',
                        ur: 'قرآن خوانی',
                    },
                },
                {
                    kind: 'fatiha',
                    label: {
                        en: 'Fatiha',
                        ar: 'الفاتحة',
                        ur: 'فاتحہ',
                    },
                },
            ],
            death_anniversary: [
                {
                    kind: 'barsi',
                    label: {
                        en: 'Barsi',
                        ur: 'برسی',
                    },
                },
            ],
        },
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
                tone: 'any',
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
        occasionEvents: {
            naming: [
                {
                    kind: 'namkaran',
                    label: {
                        en: 'Namkaran',
                        hi: 'नामकरण',
                        gu: 'નામકરણ',
                    },
                },
            ],
            prayer_meet: [
                {
                    kind: 'prarthana-sabha',
                    label: {
                        en: 'Prarthana sabha',
                        hi: 'प्रार्थना सभा',
                        gu: 'પ્રાર્થના સભા',
                    },
                },
                {
                    kind: 'bhavna',
                    label: {
                        en: 'Bhavna',
                        hi: 'भावना',
                        gu: 'ભાવના',
                    },
                },
            ],
        },
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
                tone: 'any',
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
        occasionEvents: {
            naming: [
                {
                    kind: 'naam-karan',
                    label: {
                        en: 'Naam karan',
                        hi: 'नामकरण',
                        pa: 'ਨਾਮ ਕਰਨ',
                    },
                },
            ],
            demise_notice: [
                {
                    kind: 'antim-sanskar',
                    label: {
                        en: 'Antim sanskar',
                        hi: 'अंतिम संस्कार',
                        pa: 'ਅੰਤਿਮ ਸੰਸਕਾਰ',
                    },
                },
            ],
            prayer_meet: [
                {
                    kind: 'sahaj-path-bhog',
                    label: {
                        en: 'Sahaj path bhog',
                        pa: 'ਸਹਿਜ ਪਾਠ ਭੋਗ',
                    },
                },
                {
                    kind: 'antim-ardas',
                    label: {
                        en: 'Antim ardas',
                        hi: 'अंतिम अरदास',
                        pa: 'ਅੰਤਿਮ ਅਰਦਾਸ',
                    },
                },
            ],
        },
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
                occasions: ['wedding', 'engagement', 'anniversary'],
            },
            {
                key: 'blessed-mourn',
                text: {en: 'Blessed are those who mourn, for they shall be comforted.',},
                meaning: 'Matthew 5:4',
                sacred: true,
                tone: 'solemn',
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
        occasionEvents: {
            naming: [
                {
                    kind: 'baptism',
                    label: {
                        en: 'Baptism',
                        hi: 'बपतिस्मा',
                    },
                },
                {
                    kind: 'christening-lunch',
                    label: {en: 'Christening lunch',},
                },
            ],
            demise_notice: [
                {
                    kind: 'funeral-mass',
                    label: {en: 'Funeral mass',},
                },
                {
                    kind: 'burial',
                    label: {en: 'Burial',},
                },
            ],
            prayer_meet: [
                {
                    kind: 'memorial-service',
                    label: {en: 'Memorial service',},
                },
            ],
            death_anniversary: [
                {
                    kind: 'memorial-mass',
                    label: {en: 'Memorial mass',},
                },
            ],
        },
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
                tone: 'any',
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
            {
                key: 'baruch-dayan-haemet',
                text: {
                    en: 'Baruch Dayan HaEmet',
                    he: 'ברוך דיין האמת',
                },
                transliteration: 'Baruch Dayan HaEmet',
                meaning: 'Blessed is the true Judge (said on hearing of a death)',
                sacred: true,
                tone: 'solemn',
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
        occasionEvents: {
            naming: [
                {
                    kind: 'brit-milah',
                    label: {
                        en: 'Brit milah',
                        he: 'ברית מילה',
                    },
                },
                {
                    kind: 'simchat-bat',
                    label: {
                        en: 'Simchat bat',
                        he: 'שמחת בת',
                    },
                },
            ],
            demise_notice: [
                {
                    kind: 'levaya',
                    label: {
                        en: 'Funeral (levaya)',
                        he: 'לוויה',
                    },
                },
            ],
            prayer_meet: [
                {
                    kind: 'shiva',
                    label: {
                        en: 'Shiva',
                        he: 'שבעה',
                    },
                },
            ],
            death_anniversary: [
                {
                    kind: 'yahrzeit',
                    label: {
                        en: 'Yahrzeit',
                        he: 'יארצייט',
                    },
                },
                {
                    kind: 'unveiling',
                    label: {
                        en: 'Unveiling',
                        he: 'הקמת מצבה',
                    },
                },
            ],
        },
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
        greetings: [
            {
                key: 'in-loving-memory',
                text: {
                    en: 'In loving memory',
                    hi: 'स्मृति में',
                    gu: 'સ્મૃતિમાં',
                },
                meaning: 'A tribute',
                sacred: false,
                tone: 'solemn',
            },
        ],
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
        occasionEvents: {
            prayer_meet: [
                {
                    kind: 'memorial',
                    label: {
                        en: 'Memorial',
                        hi: 'स्मृति सभा',
                        gu: 'સ્મૃતિ સભા',
                    },
                },
            ],
            demise_notice: [
                {
                    kind: 'funeral',
                    label: {
                        en: 'Funeral',
                        hi: 'अंतिम संस्कार',
                        gu: 'અંતિમ સંસ્કાર',
                    },
                },
            ],
        },
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

// Looks through the culture's wedding list, its per-occasion lists, then every occasion's generic list.
export function eventLabel(culture: string, kind: string, locale: string): string {
    const pack = cultureOf(culture);
    const vocab = [
        ...pack.events,
        ...Object.values(pack.occasionEvents ?? {}).flat(),
        ...occasionIds.flatMap((id) => occasions[id].events),
    ].find((e) => e.kind === kind);
    return vocab ? pickText(vocab.label, locale) : kind;
}

// Falls back to English, then to the first available script, so missing translations never blank out.
export function pickText(text: LocalizedText | undefined, locale: string): string {
    if (!text) return '';
    return text[locale] ?? text.en ?? Object.values(text)[0] ?? '';
}
