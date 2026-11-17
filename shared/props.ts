// Ceremony props: the object each ceremony card carries in the stacked-arches layout (a kalash for
// the pheras, mehndi cones for the mehndi…). Pure data, shared by the invitation, the Library and
// the editor. To add one: draw it in src/invitation/props.tsx and add its entry here.

export interface CeremonyPropInfo {
    id: string;
    label: string;
    hint: string;
    // Words in a ceremony's kind that call for this prop. The first entry that matches wins, so
    // specific ceremonies ("ring-ceremony", "naming-ceremony") sit above generic ones ("ceremony").
    match: readonly string[];
    // Ritual objects of one family of traditions; other invitations skip them.
    cultures?: readonly string[];
}

const dharmic = ['hindu', 'jain', 'sikh'] as const;

export const ceremonyProps = [
    {
        id: 'rings',
        label: 'Ring box',
        hint: 'A velvet box with two gold bands, for the engagement and roka',
        match: ['ring', 'engage', 'sagai', 'roka', 'gol-dhana'],
    },
    {
        id: 'cradle',
        label: 'Palna',
        hint: 'A gilded swing cradle with a crescent moon, for naming days and baby showers',
        match: [
            'naming',
            'namkaran',
            'naam-karan',
            'godh-bharai',
            'seemant',
            'baby',
            'chhathi',
            'aqiqah',
            'brit-milah',
            'simchat-bat',
        ],
    },
    {
        id: 'cake',
        label: 'Celebration cake',
        hint: 'Three ivory tiers, gold bands, cascading roses and lit candles',
        match: ['cake', 'birthday'],
    },
    {
        id: 'dove',
        label: 'Dove with olive',
        hint: 'A white dove carrying an olive branch through rays of light, for baptisms',
        match: ['baptism', 'christening'],
    },
    {
        id: 'lily',
        label: 'Remembrance lilies',
        hint: 'White lilies tied with a ribbon, for prayer meets and memorials',
        match: [
            'prayer',
            'prarthana',
            'shraddh',
            'punyatithi',
            'uthamna',
            'remembrance',
            'memorial',
            'funeral',
            'burial',
            'besnu',
            'shok',
            'barsi',
            'antim',
            'levaya',
            'yahrzeit',
            'unveiling',
            'fatiha',
            'janaza',
            'tadfeen',
            'quran',
            'shiva',
        ],
    },
    {
        id: 'mic',
        label: 'Gold microphone',
        hint: 'A vintage ribbon microphone in a laurel, for keynotes and felicitations',
        match: ['keynote', 'networking', 'felicitation', 'summit', 'conference', 'launch'],
    },
    {
        id: 'mehndi',
        label: 'Mehndi cones',
        hint: 'Two henna cones with gold collars',
        match: ['mehndi', 'mehendi', 'henna'],
        cultures: dharmic,
    },
    {
        id: 'haldi',
        label: 'Haldi urli',
        hint: 'A brass urli of turmeric paste with floating marigolds',
        match: ['haldi', 'pithi', 'ubtan'],
        cultures: dharmic,
    },
    {
        id: 'bangles',
        label: 'Chooda',
        hint: 'A stack of bridal bangles in red, pink and gold',
        match: ['chooda', 'chura', 'bangle'],
        cultures: dharmic,
    },
    {
        id: 'kaleere',
        label: 'Kaleere',
        hint: 'Golden Punjabi kaleere with pearl drops, for the Anand Karaj',
        match: ['anand', 'laavan', 'kaleer'],
        cultures: dharmic,
    },
    {
        id: 'gifts',
        label: 'Mameru trousseau',
        hint: 'Velvet gift boxes and a folded zari saree, for the mameru',
        match: ['mameru', 'mosalu', 'gift', 'trousseau', 'chunni'],
        cultures: dharmic,
    },
    {
        id: 'dandiya',
        label: 'Dandiya',
        hint: 'A pair of mirror-work dandiya sticks with tassels',
        match: ['garba', 'raas', 'dandiya'],
        cultures: dharmic,
    },
    {
        id: 'ghungroo',
        label: 'Ghungroo',
        hint: 'Dancing bells on a red cord, for the sangeet',
        match: ['sangeet', 'music', 'dance', 'mehfil', 'zaffa'],
    },
    {
        id: 'safa',
        label: 'Safa with kalgi',
        hint: 'The groom’s bandhani turban with a jewelled kalgi and pearl strings',
        match: ['baraat', 'sehra', 'ghodi', 'safa'],
        cultures: dharmic,
    },
    {
        id: 'lantern',
        label: 'Fanoos lantern',
        hint: 'A jewelled lantern crowned with a crescent, for the nikah and walima',
        match: ['nikah', 'walima', 'rukhsati', 'iftar', 'eid'],
    },
    {
        id: 'chuppah',
        label: 'Chuppah',
        hint: 'A canopy on gold poles, draped and garlanded',
        match: ['chuppah', 'kabbalat', 'aufruf'],
    },
    {
        id: 'agni',
        label: 'Havan kund',
        hint: 'The sacred fire in a stepped copper kund, for the pheras',
        match: [
            'phera',
            'lagna',
            'vivah',
            'hastmilap',
            'havan',
            'grah-shanti',
            'upanayan',
            'janoi',
            'mundan',
        ],
        cultures: dharmic,
    },
    {
        id: 'kalash',
        label: 'Kalash',
        hint: 'A brass kalash with mango leaves and a coconut',
        match: ['kalash', 'griha', 'vastu', 'ganesh', 'sthapana'],
        cultures: dharmic,
    },
    {
        id: 'thali',
        label: 'Puja thali',
        hint: 'A brass thali with a lit diya, kumkum, rice and flowers',
        match: ['puja', 'aarti', 'prasad', 'katha', 'satyanarayan', 'tilak', 'bhajan'],
        cultures: dharmic,
    },
    {
        id: 'flutes',
        label: 'Champagne flutes',
        hint: 'Two flutes meeting in a toast, for receptions and cocktails',
        match: ['reception', 'cocktail', 'party', 'dinner', 'brunch'],
    },
    {
        id: 'varmala',
        label: 'Varmala',
        hint: 'Rose and marigold garlands for the jaimala',
        match: ['varmala', 'jaimala', 'wedding', 'shaadi', 'ceremony'],
        cultures: dharmic,
    },
    {
        id: 'diya',
        label: 'Diya',
        hint: 'A clay lamp with a warm flame; the prop for anything else',
        match: [],
    },
] as const satisfies readonly CeremonyPropInfo[];

export type CeremonyPropId = (typeof ceremonyProps)[number]['id'];

// When nothing matches: each tradition's own quiet default.
const fallbackFor: Record<string, CeremonyPropId> = {
    hindu: 'diya',
    jain: 'diya',
    sikh: 'diya',
    islamic: 'lantern',
    christian: 'dove',
    jewish: 'flutes',
};

// Ceremony kind → its prop. Words match whole words of the kind ("ring" finds "ring-ceremony",
// never "gathering"); hyphenated words match as written.
export function propFor(kind: string, culture = 'hindu'): CeremonyPropId {
    const k = kind.toLowerCase();
    const words = k.split(/[^a-z]+/).filter(Boolean);
    const root = culture.split('.')[0] ?? culture;
    for (const prop of ceremonyProps) {
        const allowed =
            !('cultures' in prop) || (prop.cultures as readonly string[]).includes(root);
        if (!allowed) continue;
        const hit = prop.match.some((word: string) =>
            word.includes('-') ? k.includes(word) : words.some((w) => w.startsWith(word)),
        );
        if (hit) return prop.id;
    }
    if (words.some((w) => ['wedding', 'ceremony', 'matrimony', 'marriage'].includes(w)))
        return 'rings';
    return fallbackFor[root] ?? 'flutes';
}
