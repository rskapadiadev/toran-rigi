// Occasion packs: what the invitation is FOR (wedding, naming, prayer meet…), orthogonal to culture packs
// (WHO is celebrating). Adding an occasion = adding one entry here plus designs tagged with its category.
// Solemn occasions are guarded centrally: calm motion only, no bursts or music, no gifting or countdown.
import type { CulturePack, EventVocab, Greeting } from './cultures';
import type { LocalizedText, SectionType } from './types';

export const occasionCategories = [
    'celebrations',
    'new-beginnings',
    'milestones',
    'faith',
    'remembrance',
    'corporate',
    'general',
] as const;
export type OccasionCategory = (typeof occasionCategories)[number];

export const occasionIds = [
    'wedding',
    'engagement',
    'anniversary',
    'naming',
    'baby_shower',
    'griha_pravesh',
    'birthday',
    'retirement',
    'puja',
    'upanayan',
    'mundan',
    'demise_notice',
    'prayer_meet',
    'death_anniversary',
    'corporate',
    'other',
] as const;
export type OccasionId = (typeof occasionIds)[number];

export type OccasionTone = 'festive' | 'joyful' | 'serene' | 'solemn' | 'formal';
export type MotionCeiling = 'calm' | 'rich' | 'cinematic';

// Invitation strings an occasion may re-word; each must exist in src/invitation/strings.ts (unit-tested).
export const occasionCopyKeys = [
    'tapToOpen',
    'blowToLight',
    'and',
    'countdown',
    'celebrations',
    'rsvpTitle',
    'attending',
    'declining',
    'whichEvents',
    'note',
    'thanks',
    'thanksDecline',
    'lightsLit',
    'wishesTitle',
    'leaveWish',
    'wishPending',
    'share',
    'concluded',
    'saveTheDate',
    'daysToGo',
    'admitOne',
    'withLove',
    'family',
    'ourStory',
] as const;
export type OccasionCopyKey = (typeof occasionCopyKeys)[number];

export interface RoleSpec {
    // Admin label for the name field, e.g. "Baby", "In loving memory of".
    label: string;
    placeholder: string;
}

export interface OccasionPack {
    id: OccasionId;
    category: OccasionCategory;
    name: LocalizedText;
    summary: string;
    tone: OccasionTone;
    // Couples get "one & two"; everyone else is about one honouree (a second name is optional).
    people: {
        one: RoleSpec;
        two?: RoleSpec;
    };
    fields: {
        parents: boolean;
        lifeDates: boolean;
        honorific: boolean;
    };
    // Generic ceremony names; culture packs add their own per occasion (cultures.ts occasionEvents).
    events: EventVocab[];
    sections: {
        default: SectionType[];
        forbidden: SectionType[];
    };
    motion: {
        ceiling: MotionCeiling;
        // Petal/confetti bursts and other jubilant effects.
        burst: boolean;
        music: 'culture' | 'off';
    };
    // Which culture greetings fit: auspicious invocations never head a condolence notice.
    greetingTone: 'auspicious' | 'solemn';
    copy: Partial<Record<OccasionCopyKey, LocalizedText>>;
    starter: {
        headline: LocalizedText;
        welcome: LocalizedText;
        closing: LocalizedText;
    };
}

const celebrationSections: SectionType[] = [
    'cover',
    'card',
    'countdown',
    'welcome',
    'story',
    'events',
    'gallery',
    'rsvp',
    'wishes',
    'closing',
];
const gatheringSections: SectionType[] = [
    'cover',
    'card',
    'countdown',
    'welcome',
    'events',
    'gallery',
    'rsvp',
    'wishes',
    'closing',
];
const remembranceSections: SectionType[] = [
    'cover',
    'welcome',
    'story',
    'events',
    'gallery',
    'family',
    'wishes',
    'closing',
];
// Nothing festive, transactional or time-pressured beside grief.
const remembranceForbidden: SectionType[] = ['countdown', 'shagun', 'card', 'photoWall'];

const coupleRoles = {
    one: {
        label: 'Partner one',
        placeholder: 'Riya',
    },
    two: {
        label: 'Partner two',
        placeholder: 'Kabir',
    },
};

const festiveMotion = {
    ceiling: 'cinematic',
    burst: true,
    music: 'culture',
} as const;
const gentleMotion = {
    ceiling: 'rich',
    burst: true,
    music: 'culture',
} as const;
const serenePractice = {
    ceiling: 'rich',
    burst: false,
    music: 'culture',
} as const;
const solemnMotion = {
    ceiling: 'calm',
    burst: false,
    music: 'off',
} as const;

const noExtraFields = {
    parents: false,
    lifeDates: false,
    honorific: false,
};

const joinUs: Partial<Record<OccasionCopyKey, LocalizedText>> = {
    countdown: {
        en: 'Counting down to the day',
        hi: 'शुभ दिन की प्रतीक्षा',
        gu: 'શુભ દિવસની રાહ',
    },
    celebrations: {
        en: 'The programme',
        hi: 'कार्यक्रम',
        gu: 'કાર્યક્રમ',
    },
    whichEvents: {
        en: 'Which events will you attend?',
        hi: 'आप किन कार्यक्रमों में आएँगे?',
        gu: 'આપ કયા કાર્યક્રમમાં પધારશો?',
    },
    note: {
        en: 'A note for the family',
        hi: 'परिवार के लिए संदेश',
        gu: 'પરિવાર માટે સંદેશ',
    },
    wishPending: {
        en: 'Thank you! Your wish will appear once the family approves it.',
        hi: 'धन्यवाद! परिवार की स्वीकृति के बाद आपकी शुभकामना दिखेगी।',
        gu: 'આભાર! પરિવારની મંજૂરી પછી આપની શુભેચ્છા દેખાશે.',
    },
};

const remembranceCopy: Partial<Record<OccasionCopyKey, LocalizedText>> = {
    tapToOpen: {
        en: 'Tap to open',
        hi: 'खोलने के लिए स्पर्श करें',
        gu: 'ખોલવા માટે સ્પર્શ કરો',
    },
    blowToLight: {
        en: 'Light a diya in their memory',
        hi: 'उनकी स्मृति में एक दीप जलाएँ',
        gu: 'તેમની સ્મૃતિમાં એક દીવો પ્રગટાવો',
    },
    and: {en: '·',},
    celebrations: {
        en: 'Prayer & gathering',
        hi: 'प्रार्थना सभा',
        gu: 'પ્રાર્થના સભા',
        ar: 'العزاء والدعاء',
        ur: 'دعا اور تعزیت',
    },
    rsvpTitle: {
        en: 'Let the family know you will be there',
        hi: 'परिवार को अपनी उपस्थिति बताएँ',
        gu: 'પરિવારને આપની હાજરી જણાવો',
    },
    attending: {
        en: 'I will attend',
        hi: 'मैं उपस्थित रहूँगा/रहूँगी',
        gu: 'હું હાજર રહીશ',
    },
    declining: {
        en: 'Unable to attend',
        hi: 'उपस्थित नहीं हो पाऊँगा/पाऊँगी',
        gu: 'હાજર રહી શકીશ નહીં',
    },
    whichEvents: {
        en: 'Which gatherings will you attend?',
        hi: 'आप किस सभा में आएँगे?',
        gu: 'આપ કઈ સભામાં પધારશો?',
    },
    note: {
        en: 'A message for the family',
        hi: 'परिवार के लिए संदेश',
        gu: 'પરિવાર માટે સંદેશ',
    },
    thanks: {
        en: 'Thank you. Your diya has been lit in their memory.',
        hi: 'धन्यवाद। उनकी स्मृति में आपका दीप जल गया है।',
        gu: 'આભાર. તેમની સ્મૃતિમાં આપનો દીવો પ્રગટ્યો છે.',
    },
    thanksDecline: {
        en: 'Thank you for letting the family know. Your thoughts are with them.',
        hi: 'सूचित करने के लिए धन्यवाद। आपकी संवेदनाएँ परिवार तक पहुँचेंगी।',
        gu: 'જાણ કરવા બદલ આભાર. આપની સંવેદના પરિવાર સુધી પહોંચશે.',
    },
    lightsLit: {
        en: 'diyas lit in memory of',
        hi: 'दीप जले स्मृति में —',
        gu: 'દીવા પ્રગટ્યા સ્મૃતિમાં —',
    },
    wishesTitle: {
        en: 'Condolences & memories',
        hi: 'श्रद्धांजलि और स्मृतियाँ',
        gu: 'શ્રદ્ધાંજલિ અને સ્મૃતિઓ',
        ar: 'تعازٍ وذكريات',
        ur: 'تعزیت اور یادیں',
    },
    leaveWish: {
        en: 'Share a memory or condolence',
        hi: 'एक स्मृति या श्रद्धांजलि लिखें',
        gu: 'એક સ્મૃતિ અથવા શ્રદ્ધાંજલિ લખો',
    },
    wishPending: {
        en: 'Thank you. Your message will appear once the family has seen it.',
        hi: 'धन्यवाद। परिवार के देखने के बाद आपका संदेश दिखेगा।',
        gu: 'આભાર. પરિવાર જોયા પછી આપનો સંદેશ દેખાશે.',
    },
    share: {
        en: 'Share with family & friends',
        hi: 'परिवार और मित्रों को भेजें',
        gu: 'પરિવાર અને મિત્રોને મોકલો',
    },
    concluded: {
        en: 'This gathering has concluded. Thank you for keeping them in your prayers.',
        hi: 'यह सभा संपन्न हो चुकी है। अपनी प्रार्थनाओं में उन्हें याद रखने के लिए धन्यवाद।',
        gu: 'આ સભા સંપન્ન થઈ છે. પ્રાર્થનામાં તેમને યાદ રાખવા બદલ આભાર.',
    },
    saveTheDate: {
        en: 'In loving memory',
        hi: 'स्मृति शेष',
        gu: 'સ્મૃતિ શેષ',
        ar: 'في ذكرى',
        ur: 'یادِ رفتگاں',
    },
    admitOne: {
        en: 'Prayer gathering',
        hi: 'प्रार्थना सभा',
        gu: 'પ્રાર્થના સભા',
    },
    withLove: {
        en: 'With gratitude',
        hi: 'सादर',
        gu: 'સાદર',
    },
    family: {
        en: 'In grief,',
        hi: 'शोकाकुल परिवार',
        gu: 'શોકાતુર પરિવાર',
    },
    ourStory: {
        en: 'Remembering',
        hi: 'स्मृतियाँ',
        gu: 'સ્મૃતિઓ',
    },
};

export const occasions: Record<OccasionId, OccasionPack> = {
    wedding: {
        id: 'wedding',
        category: 'celebrations',
        name: {
            en: 'Wedding',
            hi: 'विवाह',
            gu: 'લગ્ન',
            ar: 'زفاف',
            ur: 'شادی',
        },
        summary: 'Multi-day wedding with ceremonies from the culture pack.',
        tone: 'festive',
        people: coupleRoles,
        fields: {
            ...noExtraFields,
            parents: true,
        },
        events: [],
        sections: {
            default: celebrationSections,
            forbidden: [],
        },
        motion: festiveMotion,
        greetingTone: 'auspicious',
        copy: {},
        starter: {
            headline: { en: 'invite you to celebrate their wedding' },
            welcome: { en: 'Together with our families, we would be honoured by your presence.' },
            closing: { en: 'Your presence is the greatest blessing.' },
        },
    },
    engagement: {
        id: 'engagement',
        category: 'celebrations',
        name: {
            en: 'Engagement',
            hi: 'सगाई',
            gu: 'સગાઈ',
            ar: 'خطوبة',
            ur: 'منگنی',
        },
        summary: 'Ring ceremony / sagai / roka, usually a single evening.',
        tone: 'festive',
        people: coupleRoles,
        fields: {
            ...noExtraFields,
            parents: true,
        },
        events: [
            {
                kind: 'ring-ceremony',
                label: {
                    en: 'Ring ceremony',
                    hi: 'अंगूठी समारोह',
                    gu: 'રિંગ સેરેમની',
                },
            },
            {
                kind: 'dinner',
                label: {
                    en: 'Dinner',
                    hi: 'भोज',
                    gu: 'ભોજન',
                },
            },
        ],
        sections: {
            default: celebrationSections,
            forbidden: [],
        },
        motion: festiveMotion,
        greetingTone: 'auspicious',
        copy: {
            countdown: {
                en: 'Counting down to the yes',
                hi: 'शुभ घड़ी की प्रतीक्षा',
                gu: 'શુભ ઘડીની રાહ',
            },
        },
        starter: {
            headline: { en: 'are getting engaged' },
            welcome: { en: 'Join us as two families come together over rings and laughter.' },
            closing: { en: 'We can’t wait to celebrate with you.' },
        },
    },
    anniversary: {
        id: 'anniversary',
        category: 'celebrations',
        name: {
            en: 'Anniversary',
            hi: 'वर्षगाँठ',
            gu: 'લગ્નતિથિ',
            ar: 'ذكرى زواج',
            ur: 'سالگرہ شادی',
        },
        summary: 'Silver, golden or any wedding anniversary.',
        tone: 'joyful',
        people: coupleRoles,
        fields: noExtraFields,
        events: [
            {
                kind: 'celebration',
                label: {
                    en: 'Celebration',
                    hi: 'उत्सव',
                    gu: 'ઉજવણી',
                },
            },
            {
                kind: 'dinner',
                label: {
                    en: 'Dinner',
                    hi: 'भोज',
                    gu: 'ભોજન',
                },
            },
        ],
        sections: {
            default: celebrationSections,
            forbidden: [],
        },
        motion: gentleMotion,
        greetingTone: 'auspicious',
        copy: {
            ...joinUs,
            ourStory: {
                en: 'Our years together',
                hi: 'साथ के वर्ष',
                gu: 'સાથેનાં વર્ષો',
            },
        },
        starter: {
            headline: { en: 'celebrate twenty-five years together' },
            welcome: {en: 'A quarter century of love — and we want to spend the evening with you.',},
            closing: { en: 'Here’s to many more.' },
        },
    },
    naming: {
        id: 'naming',
        category: 'new-beginnings',
        name: {
            en: 'Naming ceremony',
            hi: 'नामकरण संस्कार',
            gu: 'નામકરણ વિધિ',
            ar: 'العقيقة',
            ur: 'عقیقہ',
        },
        summary: 'Namkaran / Aqiqah / Christening: a baby receives their name.',
        tone: 'joyful',
        people: {
            one: {
                label: 'Baby',
                placeholder: 'Aanya',
            },
        },
        fields: {
            ...noExtraFields,
            parents: true,
        },
        events: [
            {
                kind: 'naming-ceremony',
                label: {
                    en: 'Naming ceremony',
                    hi: 'नामकरण',
                    gu: 'નામકરણ',
                },
            },
            {
                kind: 'lunch',
                label: {
                    en: 'Lunch',
                    hi: 'भोजन',
                    gu: 'ભોજન',
                },
            },
        ],
        sections: {
            default: gatheringSections,
            forbidden: [],
        },
        motion: gentleMotion,
        greetingTone: 'auspicious',
        copy: {
            ...joinUs,
            countdown: {
                en: 'Counting down to the little one’s day',
                hi: 'नन्हे के शुभ दिन की प्रतीक्षा',
                gu: 'નાનકડાના શુભ દિવસની રાહ',
            },
            saveTheDate: {
                en: 'A name is coming',
                hi: 'एक नाम आ रहा है',
                gu: 'એક નામ આવી રહ્યું છે',
            },
            rsvpTitle: {
                en: 'Will you come and bless our little one?',
                hi: 'क्या आप हमारे नन्हे को आशीर्वाद देने आएँगे?',
                gu: 'શું આપ અમારા નાનકડાને આશીર્વાદ આપવા પધારશો?',
            },
            family: {
                en: 'Proud parents',
                hi: 'गर्वित माता-पिता',
                gu: 'ગૌરવાન્વિત માતા-પિતા',
            },
            wishesTitle: {
                en: 'Blessings for the baby',
                hi: 'नन्हे के लिए आशीर्वाद',
                gu: 'નાનકડા માટે આશીર્વાદ',
            },
        },
        starter: {
            headline: { en: 'invite you to the naming ceremony of our little one' },
            welcome: {en: 'Our hearts are full. Come bless our baby as we share the name we have chosen.',},
            closing: { en: 'Your blessings mean the world to us.' },
        },
    },
    baby_shower: {
        id: 'baby_shower',
        category: 'new-beginnings',
        name: {
            en: 'Baby shower',
            hi: 'गोद भराई',
            gu: 'સીમંત / ખોળો ભરવો',
            ar: 'حفل استقبال المولود',
            ur: 'گود بھرائی',
        },
        summary: 'Godh bharai / Seemantham / baby shower for the mother-to-be.',
        tone: 'joyful',
        people: {
            one: {
                label: 'Mother-to-be',
                placeholder: 'Meera',
            },
            two: {
                label: 'Partner (optional)',
                placeholder: 'Arjun',
            },
        },
        fields: noExtraFields,
        events: [
            {
                kind: 'godh-bharai',
                label: {
                    en: 'Godh bharai',
                    hi: 'गोद भराई',
                    gu: 'ખોળો ભરવો',
                },
            },
        ],
        sections: {
            default: gatheringSections,
            forbidden: [],
        },
        motion: gentleMotion,
        greetingTone: 'auspicious',
        copy: {
            ...joinUs,
            saveTheDate: {
                en: 'A little one is on the way',
                hi: 'नन्हे मेहमान आने वाले हैं',
                gu: 'નાનકડા મહેમાન આવી રહ્યા છે',
            },
        },
        starter: {
            headline: { en: 'invite you to celebrate the baby on the way' },
            welcome: { en: 'Come shower the mother-to-be with love, laughter and blessings.' },
            closing: { en: 'We can’t wait to see you there.' },
        },
    },
    griha_pravesh: {
        id: 'griha_pravesh',
        category: 'new-beginnings',
        name: {
            en: 'Housewarming',
            hi: 'गृह प्रवेश',
            gu: 'ગૃહ પ્રવેશ / વાસ્તુ',
            ar: 'تدشين المنزل',
            ur: 'نئے گھر کی دعوت',
        },
        summary: 'Griha pravesh / vastu puja / housewarming party.',
        tone: 'joyful',
        people: {
            one: {
                label: 'Family name',
                placeholder: 'The Shah family',
            },
        },
        fields: noExtraFields,
        events: [
            {
                kind: 'vastu-puja',
                label: {
                    en: 'Vastu puja',
                    hi: 'वास्तु पूजा',
                    gu: 'વાસ્તુ પૂજા',
                },
            },
            {
                kind: 'lunch',
                label: {
                    en: 'Lunch',
                    hi: 'भोजन',
                    gu: 'ભોજન',
                },
            },
        ],
        sections: {
            default: gatheringSections,
            forbidden: [],
        },
        motion: gentleMotion,
        greetingTone: 'auspicious',
        copy: {
            ...joinUs,
            saveTheDate: {
                en: 'A new home',
                hi: 'नया घर',
                gu: 'નવું ઘર',
            },
            rsvpTitle: {
                en: 'Will you bless our new home?',
                hi: 'क्या आप हमारे नए घर को आशीर्वाद देंगे?',
                gu: 'શું આપ અમારા નવા ઘરને આશીર્વાદ આપશો?',
            },
        },
        starter: {
            headline: { en: 'welcome you to our new home' },
            welcome: { en: 'A new door, a new beginning — step in with your blessings.' },
            closing: { en: 'Our home is complete with you in it.' },
        },
    },
    birthday: {
        id: 'birthday',
        category: 'milestones',
        name: {
            en: 'Birthday',
            hi: 'जन्मदिन',
            gu: 'જન્મદિવસ',
            ar: 'عيد ميلاد',
            ur: 'سالگرہ',
        },
        summary: 'First birthdays, milestone birthdays, surprise parties.',
        tone: 'joyful',
        people: {
            one: {
                label: 'Birthday star',
                placeholder: 'Vihaan',
            },
        },
        fields: noExtraFields,
        events: [
            {
                kind: 'party',
                label: {
                    en: 'Party',
                    hi: 'पार्टी',
                    gu: 'પાર્ટી',
                },
            },
            {
                kind: 'cake-cutting',
                label: {
                    en: 'Cake cutting',
                    hi: 'केक काटना',
                    gu: 'કેક કટિંગ',
                },
            },
        ],
        sections: {
            default: gatheringSections,
            forbidden: [],
        },
        motion: festiveMotion,
        greetingTone: 'auspicious',
        copy: {
            ...joinUs,
            countdown: {
                en: 'Counting down to the party',
                hi: 'पार्टी की उलटी गिनती',
                gu: 'પાર્ટીની રાહ',
            },
            saveTheDate: {
                en: 'You’re invited',
                hi: 'आप आमंत्रित हैं',
                gu: 'આપ આમંત્રિત છો',
            },
            celebrations: {
                en: 'The party',
                hi: 'पार्टी',
                gu: 'પાર્ટી',
            },
            wishesTitle: {
                en: 'Birthday wishes',
                hi: 'जन्मदिन की शुभकामनाएँ',
                gu: 'જન્મદિવસની શુભેચ્છાઓ',
            },
        },
        starter: {
            headline: { en: 'is turning one!' },
            welcome: { en: 'Cake, games and a lot of love — come celebrate with us.' },
            closing: { en: 'See you at the party!' },
        },
    },
    retirement: {
        id: 'retirement',
        category: 'milestones',
        name: {
            en: 'Retirement',
            hi: 'सेवानिवृत्ति',
            gu: 'નિવૃત્તિ',
            ar: 'تقاعد',
            ur: 'ریٹائرمنٹ',
        },
        summary: 'Retirement, felicitation, a life’s work celebrated.',
        tone: 'formal',
        people: {
            one: {
                label: 'Honouree',
                placeholder: 'Dr. Ramesh Mehta',
            },
        },
        fields: noExtraFields,
        events: [
            {
                kind: 'felicitation',
                label: {
                    en: 'Felicitation',
                    hi: 'सम्मान समारोह',
                    gu: 'સન્માન સમારોહ',
                },
            },
            {
                kind: 'dinner',
                label: {
                    en: 'Dinner',
                    hi: 'भोज',
                    gu: 'ભોજન',
                },
            },
        ],
        sections: {
            default: gatheringSections,
            forbidden: [],
        },
        motion: gentleMotion,
        greetingTone: 'auspicious',
        copy: {
            ...joinUs,
            ourStory: {
                en: 'A life’s work',
                hi: 'जीवन यात्रा',
                gu: 'જીવન યાત્રા',
            },
        },
        starter: {
            headline: { en: 'celebrates 38 years of service' },
            welcome: { en: 'Join us to honour a remarkable career and the next chapter.' },
            closing: { en: 'Thank you for being part of the journey.' },
        },
    },
    puja: {
        id: 'puja',
        category: 'faith',
        name: {
            en: 'Puja / Katha',
            hi: 'पूजा / कथा',
            gu: 'પૂજા / કથા',
        },
        summary: 'Satyanarayan katha, Lakshmi puja, havan, bhajan sandhya.',
        tone: 'serene',
        people: {
            one: {
                label: 'Hosted by',
                placeholder: 'The Patel family',
            },
        },
        fields: noExtraFields,
        events: [
            {
                kind: 'puja',
                label: {
                    en: 'Puja',
                    hi: 'पूजा',
                    gu: 'પૂજા',
                },
            },
            {
                kind: 'aarti',
                label: {
                    en: 'Aarti',
                    hi: 'आरती',
                    gu: 'આરતી',
                },
            },
            {
                kind: 'prasad',
                label: {
                    en: 'Prasad',
                    hi: 'प्रसाद',
                    gu: 'પ્રસાદ',
                },
            },
        ],
        sections: {
            default: ['cover', 'welcome', 'events', 'rsvp', 'closing'],
            forbidden: [],
        },
        motion: serenePractice,
        greetingTone: 'auspicious',
        copy: {
            ...joinUs,
            rsvpTitle: {
                en: 'Will you join us for the puja?',
                hi: 'क्या आप पूजा में पधारेंगे?',
                gu: 'શું આપ પૂજામાં પધારશો?',
            },
            attending: {
                en: 'I will attend',
                hi: 'मैं आऊँगा/आऊँगी',
                gu: 'હું આવીશ',
            },
            declining: {
                en: 'Unable to attend',
                hi: 'नहीं आ पाऊँगा/पाऊँगी',
                gu: 'આવી શકીશ નહીં',
            },
        },
        starter: {
            headline: { en: 'invite you to a Satyanarayan katha at our home' },
            welcome: { en: 'Please join us for the katha, aarti and prasad.' },
            closing: { en: 'With prayers for everyone’s well-being.' },
        },
    },
    upanayan: {
        id: 'upanayan',
        category: 'faith',
        name: {
            en: 'Thread ceremony',
            hi: 'उपनयन / जनेऊ',
            gu: 'જનોઈ',
        },
        summary: 'Upanayan / janoi / sacred-thread ceremony.',
        tone: 'serene',
        people: {
            one: {
                label: 'Batuk (child)',
                placeholder: 'Dhruv',
            },
        },
        fields: {
            ...noExtraFields,
            parents: true,
        },
        events: [
            {
                kind: 'upanayan',
                label: {
                    en: 'Upanayan',
                    hi: 'उपनयन संस्कार',
                    gu: 'જનોઈ વિધિ',
                },
            },
            {
                kind: 'bhojan',
                label: {
                    en: 'Bhojan',
                    hi: 'भोजन',
                    gu: 'ભોજન',
                },
            },
        ],
        sections: {
            default: gatheringSections,
            forbidden: [],
        },
        motion: serenePractice,
        greetingTone: 'auspicious',
        copy: joinUs,
        starter: {
            headline: { en: 'invite you to the sacred-thread ceremony of our son' },
            welcome: { en: 'Bless him as he begins his journey of learning.' },
            closing: { en: 'Your blessings guide him.' },
        },
    },
    mundan: {
        id: 'mundan',
        category: 'faith',
        name: {
            en: 'Mundan',
            hi: 'मुंडन संस्कार',
            gu: 'બાબરી',
        },
        summary: 'First-haircut ceremony (mundan / babri).',
        tone: 'serene',
        people: {
            one: {
                label: 'Child',
                placeholder: 'Kian',
            },
        },
        fields: {
            ...noExtraFields,
            parents: true,
        },
        events: [
            {
                kind: 'mundan',
                label: {
                    en: 'Mundan',
                    hi: 'मुंडन',
                    gu: 'બાબરી',
                },
            },
        ],
        sections: {
            default: gatheringSections,
            forbidden: [],
        },
        motion: serenePractice,
        greetingTone: 'auspicious',
        copy: joinUs,
        starter: {
            headline: { en: 'invite you to the mundan ceremony of our little one' },
            welcome: { en: 'Join us for a morning of rituals and blessings.' },
            closing: { en: 'With love and gratitude.' },
        },
    },
    demise_notice: {
        id: 'demise_notice',
        category: 'remembrance',
        name: {
            en: 'Demise notice',
            hi: 'शोक संदेश',
            gu: 'દુઃખદ અવસાન',
            ar: 'نعي',
            ur: 'اطلاعِ وفات',
        },
        summary: 'A dignified announcement with funeral / last-rites details.',
        tone: 'solemn',
        people: {
            one: {
                label: 'In loving memory of',
                placeholder: 'Shri Harshad Shah',
            },
        },
        fields: {
            parents: false,
            lifeDates: true,
            honorific: true,
        },
        events: [
            {
                kind: 'funeral',
                label: {
                    en: 'Last rites',
                    hi: 'अंतिम संस्कार',
                    gu: 'અંતિમ સંસ્કાર',
                },
            },
        ],
        sections: {
            default: ['cover', 'welcome', 'events', 'family', 'wishes', 'closing'],
            forbidden: [...remembranceForbidden, 'rsvp'],
        },
        motion: solemnMotion,
        greetingTone: 'solemn',
        copy: remembranceCopy,
        starter: {
            headline: { en: 'left for the heavenly abode' },
            welcome: {en: 'With deep sorrow we inform you of the passing of our beloved. Please keep the family in your prayers.',},
            closing: { en: 'May the departed soul rest in eternal peace.' },
        },
    },
    prayer_meet: {
        id: 'prayer_meet',
        category: 'remembrance',
        name: {
            en: 'Prayer meet',
            hi: 'प्रार्थना सभा',
            gu: 'બેસણું / પ્રાર્થના સભા',
            ar: 'مجلس عزاء',
            ur: 'دعائیہ مجلس',
        },
        summary: 'Besnu, uthamna, chautha, shok sabha, memorial service.',
        tone: 'solemn',
        people: {
            one: {
                label: 'In loving memory of',
                placeholder: 'Smt. Kusum Shah',
            },
        },
        fields: {
            parents: false,
            lifeDates: true,
            honorific: true,
        },
        events: [
            {
                kind: 'prayer-meet',
                label: {
                    en: 'Prayer meet',
                    hi: 'प्रार्थना सभा',
                    gu: 'પ્રાર્થના સભા',
                },
            },
        ],
        sections: {
            default: remembranceSections,
            forbidden: remembranceForbidden,
        },
        motion: solemnMotion,
        greetingTone: 'solemn',
        copy: remembranceCopy,
        starter: {
            headline: { en: 'Prayer meet in loving memory' },
            welcome: {en: 'We invite you to join us in prayer as we remember a life lived with love and grace.',},
            closing: { en: 'Your presence and prayers are our strength.' },
        },
    },
    death_anniversary: {
        id: 'death_anniversary',
        category: 'remembrance',
        name: {
            en: 'Death anniversary',
            hi: 'पुण्यतिथि / बरसी',
            gu: 'પુણ્યતિથિ',
            ar: 'ذكرى الوفاة',
            ur: 'برسی',
        },
        summary: 'Punyatithi / barsi / shraddh / memorial anniversary.',
        tone: 'solemn',
        people: {
            one: {
                label: 'In loving memory of',
                placeholder: 'Shri Harshad Shah',
            },
        },
        fields: {
            parents: false,
            lifeDates: true,
            honorific: true,
        },
        events: [
            {
                kind: 'remembrance',
                label: {
                    en: 'Remembrance prayers',
                    hi: 'श्रद्धांजलि सभा',
                    gu: 'શ્રદ્ધાંજલિ સભા',
                },
            },
        ],
        sections: {
            default: remembranceSections,
            forbidden: remembranceForbidden,
        },
        motion: solemnMotion,
        greetingTone: 'solemn',
        copy: remembranceCopy,
        starter: {
            headline: { en: 'First death anniversary' },
            welcome: {en: 'A year has passed, but not a day without remembering. Join us in prayer.',},
            closing: { en: 'Forever in our hearts.' },
        },
    },
    corporate: {
        id: 'corporate',
        category: 'corporate',
        name: {
            en: 'Corporate event',
            hi: 'कॉर्पोरेट कार्यक्रम',
            gu: 'કોર્પોરેટ કાર્યક્રમ',
            ar: 'فعالية الشركات',
            ur: 'کارپوریٹ تقریب',
        },
        summary: 'Launches, annual days, offsites, store openings.',
        tone: 'formal',
        people: {
            one: {
                label: 'Event or company name',
                placeholder: 'Rigi Annual Summit',
            },
        },
        fields: noExtraFields,
        events: [
            {
                kind: 'keynote',
                label: {
                    en: 'Keynote',
                    hi: 'मुख्य संबोधन',
                    gu: 'મુખ્ય વક્તવ્ય',
                },
            },
            {
                kind: 'networking',
                label: {
                    en: 'Networking',
                    hi: 'नेटवर्किंग',
                    gu: 'નેટવર્કિંગ',
                },
            },
            {
                kind: 'dinner',
                label: {
                    en: 'Dinner',
                    hi: 'भोज',
                    gu: 'ભોજન',
                },
            },
        ],
        sections: {
            default: ['cover', 'countdown', 'welcome', 'events', 'rsvp', 'closing'],
            forbidden: ['shagun'],
        },
        motion: gentleMotion,
        greetingTone: 'auspicious',
        copy: {
            ...joinUs,
            and: { en: '×' },
            countdown: {
                en: 'Countdown to the event',
                hi: 'कार्यक्रम की उलटी गिनती',
                gu: 'કાર્યક્રમની ગણતરી',
            },
            celebrations: {
                en: 'Agenda',
                hi: 'कार्यसूची',
                gu: 'કાર્યસૂચિ',
            },
            rsvpTitle: {
                en: 'Register your attendance',
                hi: 'अपनी उपस्थिति दर्ज करें',
                gu: 'આપની હાજરી નોંધાવો',
            },
            attending: {
                en: 'I’ll be there',
                hi: 'मैं आऊँगा/आऊँगी',
                gu: 'હું આવીશ',
            },
            declining: {
                en: 'Can’t make it',
                hi: 'नहीं आ पाऊँगा/पाऊँगी',
                gu: 'નહીં આવી શકું',
            },
            whichEvents: {
                en: 'Which sessions?',
                hi: 'कौन से सत्र?',
                gu: 'કયા સત્ર?',
            },
            note: {
                en: 'Anything we should know?',
                hi: 'कोई जानकारी?',
                gu: 'કોઈ માહિતી?',
            },
            thanks: {
                en: 'You’re registered. See you there!',
                hi: 'आपका पंजीकरण हो गया। वहीं मिलते हैं!',
                gu: 'આપની નોંધણી થઈ ગઈ. ત્યાં મળીએ!',
            },
            admitOne: {
                en: 'Admit one',
                hi: 'प्रवेश पत्र',
                gu: 'પ્રવેશ પત્ર',
            },
            saveTheDate: {
                en: 'Save the date',
                hi: 'तारीख याद रखें',
                gu: 'તારીખ યાદ રાખો',
            },
            withLove: {
                en: 'With thanks',
                hi: 'धन्यवाद सहित',
                gu: 'આભાર સહ',
            },
            wishesTitle: {
                en: 'Messages',
                hi: 'संदेश',
                gu: 'સંદેશા',
            },
        },
        starter: {
            headline: { en: 'invites you to our annual summit' },
            welcome: { en: 'A day of ideas, people and what’s next.' },
            closing: { en: 'We look forward to seeing you.' },
        },
    },
    other: {
        id: 'other',
        category: 'general',
        name: {
            en: 'Other occasion',
            hi: 'अन्य अवसर',
            gu: 'અન્ય પ્રસંગ',
            ar: 'مناسبة أخرى',
            ur: 'دیگر تقریب',
        },
        summary: 'Anything else: reunions, farewells, graduations, community events.',
        tone: 'joyful',
        people: {
            one: {
                label: 'Name or title',
                placeholder: 'Class of 2006 reunion',
            },
        },
        fields: noExtraFields,
        events: [
            {
                kind: 'gathering',
                label: {
                    en: 'Gathering',
                    hi: 'समारोह',
                    gu: 'સમારોહ',
                },
            },
        ],
        sections: {
            default: gatheringSections,
            forbidden: [],
        },
        motion: gentleMotion,
        greetingTone: 'auspicious',
        copy: joinUs,
        starter: {
            headline: { en: 'invites you' },
            welcome: { en: 'We would love to see you there.' },
            closing: { en: 'See you soon.' },
        },
    },
};

export const categoryInfo: Record<OccasionCategory, { label: string;
hint: string }> = {
    celebrations: {
        label: 'Weddings & love',
        hint: 'Weddings, engagements, anniversaries',
    },
    'new-beginnings': {
        label: 'New beginnings',
        hint: 'Naming, baby shower, housewarming',
    },
    milestones: {
        label: 'Milestones',
        hint: 'Birthdays, retirements',
    },
    faith: {
        label: 'Faith & rituals',
        hint: 'Puja, katha, thread ceremony, mundan',
    },
    remembrance: {
        label: 'Remembrance',
        hint: 'Demise notice, prayer meet, death anniversary',
    },
    corporate: {
        label: 'Corporate',
        hint: 'Launches, summits, annual days',
    },
    general: {
        label: 'Everything else',
        hint: 'Reunions, farewells, community events',
    },
};

const isOccasionId = (id: string): id is OccasionId => id in occasions;

// Legacy values (and anything unknown) fall back gracefully so stored rows always render.
export function occasionOf(id: string | undefined): OccasionPack {
    return id && isOccasionId(id) ? occasions[id] : occasions.wedding;
}

export const occasionsIn = (category: OccasionCategory) =>
    occasionIds.map((id) => occasions[id]).filter((o) => o.category === category);

// Weddings, engagements and anniversaries are about two people joined by "&".
export const isCouple = (occasion: OccasionPack) => occasion.category === 'celebrations';

// Sections an occasion starts with, minus anything it forbids (the composer enforces the same list).
export function allowedSection(occasion: OccasionPack, type: SectionType): boolean {
    return !occasion.sections.forbidden.includes(type);
}

interface GreetingFit {
    tone?: 'auspicious' | 'solemn' | 'any';
    occasions?: readonly OccasionId[];
}

// Culture greetings are auspicious unless marked otherwise; some are tied to specific occasions.
export function greetingFits(greeting: GreetingFit, occasion: OccasionPack): boolean {
    if (greeting.occasions && !greeting.occasions.includes(occasion.id)) return false;
    const tone = greeting.tone ?? 'auspicious';
    return tone === 'any' || tone === occasion.greetingTone;
}

export const isSolemn = (occasion: OccasionPack) => occasion.tone === 'solemn';

const motionRank: Record<MotionCeiling, number> = {
    calm: 0,
    rich: 1,
    cinematic: 2,
};

// The designer picks a motion level; the occasion caps it (a prayer meet is never cinematic).
export function cappedMotion(chosen: MotionCeiling, occasion: OccasionPack): MotionCeiling {
    return motionRank[chosen] > motionRank[occasion.motion.ceiling]
        ? occasion.motion.ceiling
        : chosen;
}

// Ceremony names offered in the composer: a wedding uses the culture's list; other occasions get the
// culture's own words first (besnu, aqiqah, shiva…), then the occasion's generic ones.
export function eventVocabFor(occasion: OccasionPack, culture: CulturePack): EventVocab[] {
    if (occasion.id === 'wedding') return culture.events;
    const own = culture.occasionEvents?.[occasion.id] ?? [];
    const kinds = new Set(own.map((e) => e.kind));
    return [...own, ...occasion.events.filter((e) => !kinds.has(e.kind))];
}

export const greetingsFor = (culture: CulturePack, occasion: OccasionPack): Greeting[] =>
    culture.greetings.filter((g) => greetingFits(g, occasion));

// Starting sections: weddings keep the culture's set; everything else uses the occasion's.
export function defaultSectionsFor(occasion: OccasionPack, culture: CulturePack): SectionType[] {
    const base = occasion.id === 'wedding' ? culture.defaultSections : occasion.sections.default;
    return base.filter((type) => allowedSection(occasion, type));
}
