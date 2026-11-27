// What guests wear to each function: the drawn outfits, colour stories to start from, and plain
// names for colours so a swatch can be read aloud or written on a mood board.
import { hexToOklch } from './palette';

export const outfitIds = [
    'sari',
    'lehenga',
    'anarkali',
    'sharara',
    'gown',
    'abaya',
    'kurta',
    'sherwani',
    'bandhgala',
    'suit',
] as const;
export type OutfitId = (typeof outfitIds)[number];

export type Wearer = 'ladies' | 'gentlemen';

interface OutfitInfo {
    label: string;
    who: Wearer;
}

export const outfitInfo: Record<OutfitId, OutfitInfo> = {
    sari: {
        label: 'Sari',
        who: 'ladies',
    },
    lehenga: {
        label: 'Lehenga',
        who: 'ladies',
    },
    anarkali: {
        label: 'Anarkali',
        who: 'ladies',
    },
    sharara: {
        label: 'Sharara',
        who: 'ladies',
    },
    gown: {
        label: 'Gown',
        who: 'ladies',
    },
    abaya: {
        label: 'Abaya',
        who: 'ladies',
    },
    kurta: {
        label: 'Kurta',
        who: 'gentlemen',
    },
    sherwani: {
        label: 'Sherwani',
        who: 'gentlemen',
    },
    bandhgala: {
        label: 'Bandhgala',
        who: 'gentlemen',
    },
    suit: {
        label: 'Suit',
        who: 'gentlemen',
    },
};

export const MAX_OUTFITS = 4;
export const MAX_SWATCHES = 6;
export const MAX_AVOID = 3;

const isOutfit = (id: string): id is OutfitId => (outfitIds as readonly string[]).includes(id);

// The figures a function shows: the couple's picks, or two that suit the tradition.
export function outfitsFor(picked: readonly string[] | undefined, culture: string): OutfitId[] {
    const own = (picked ?? []).filter(isOutfit).slice(0, MAX_OUTFITS);
    if (own.length > 0) return own;
    const base = culture.split('.')[0];
    if (base === 'christian' || base === 'jewish' || base === 'universal') return ['gown', 'suit'];
    if (base === 'islamic') return ['anarkali', 'sherwani'];
    return ['lehenga', 'kurta'];
}

export interface LookPalette {
    id: string;
    name: string;
    colors: string[];
}

export const lookPalettes: LookPalette[] = [
    {
        id: 'marigold',
        name: 'Marigold',
        colors: ['#f4b41a', '#f7d154', '#e8762c', '#fff3c4'],
    },
    {
        id: 'mehndi',
        name: 'Mehndi green',
        colors: ['#3f6b2a', '#8db255', '#d8e8a8', '#e05a8a'],
    },
    {
        id: 'jewel',
        name: 'Jewel tones',
        colors: ['#1f4e79', '#7a1f5c', '#0f6b5c', '#c9a227'],
    },
    {
        id: 'festive',
        name: 'Festive brights',
        colors: ['#d62e4b', '#f39c12', '#1e9e5a', '#2d6cdf'],
    },
    {
        id: 'pastel',
        name: 'Pastels',
        colors: ['#f6c9d0', '#c9def4', '#d9ecd0', '#f3e3b5'],
    },
    {
        id: 'blush',
        name: 'Blush & rose gold',
        colors: ['#f2c4c0', '#d9918a', '#b76e79', '#f7e6e0'],
    },
    {
        id: 'ivory-gold',
        name: 'Ivory & gold',
        colors: ['#f6efe0', '#e8d8b0', '#c9a24a', '#8a6a2f'],
    },
    {
        id: 'wine',
        name: 'Wine & gold',
        colors: ['#6e1530', '#a3163a', '#c9a24a', '#f1dcc0'],
    },
    {
        id: 'saffron',
        name: 'Saffron & cream',
        colors: ['#e8892b', '#f2c230', '#fff4d6', '#b5361c'],
    },
    {
        id: 'royal',
        name: 'Royal blue & silver',
        colors: ['#1d3f8f', '#3a66c4', '#c0c6d0', '#0d1f4a'],
    },
    {
        id: 'black-tie',
        name: 'Black tie',
        colors: ['#111111', '#3a3a3a', '#c9a24a', '#f2f2f2'],
    },
    {
        id: 'white',
        name: 'All white',
        colors: ['#ffffff', '#f4f1ea', '#e7e2d6', '#d8cfbd'],
    },
];

const byKind: Record<string, string> = {
    haldi: 'marigold',
    mehndi: 'mehndi',
    henna: 'mehndi',
    sangeet: 'jewel',
    garba: 'festive',
    mameru: 'saffron',
    'ganesh-sthapana': 'saffron',
    'grah-shanti': 'saffron',
    'griha-pravesh': 'saffron',
    'vastu-shanti': 'saffron',
    seemant: 'saffron',
    namkaran: 'saffron',
    'naam-karan': 'saffron',
    chhathi: 'saffron',
    engagement: 'blush',
    roka: 'blush',
    chunni: 'blush',
    baraat: 'festive',
    pheras: 'wine',
    lagna: 'wine',
    'anand-karaj': 'pastel',
    nikah: 'ivory-gold',
    walima: 'pastel',
    zaffa: 'jewel',
    aqiqah: 'pastel',
    reception: 'royal',
    'after-party': 'black-tie',
    'rehearsal-dinner': 'black-tie',
    welcome: 'pastel',
    brunch: 'pastel',
    baptism: 'pastel',
    'christening-lunch': 'pastel',
};

// A colour story that suits the function, to start from in one tap.
export const suggestedPalette = (kind: string): LookPalette =>
    lookPalettes.find((p) => p.id === byKind[kind]) ??
    lookPalettes[4] ?? {
        id: 'pastel',
        name: 'Pastels',
        colors: [],
    };

// Plain names, matched by how close a colour looks (OKLab), not by its code.
const named: [string, string][] = [
    ['White', '#ffffff'],
    ['Ivory', '#f6efe0'],
    ['Cream', '#fff4d6'],
    ['Beige', '#e7dcc4'],
    ['Champagne', '#e8d8b0'],
    ['Gold', '#c9a24a'],
    ['Antique gold', '#8a6a2f'],
    ['Mustard', '#d4a017'],
    ['Yellow', '#f7d154'],
    ['Marigold', '#f4b41a'],
    ['Saffron', '#e8892b'],
    ['Orange', '#e8762c'],
    ['Peach', '#f6c3a0'],
    ['Coral', '#ef6f5e'],
    ['Rust', '#b5361c'],
    ['Red', '#d62e4b'],
    ['Crimson', '#a3163a'],
    ['Maroon', '#6e1530'],
    ['Blush', '#f2c4c0'],
    ['Pink', '#f6c9d0'],
    ['Rose', '#d9918a'],
    ['Rose gold', '#b76e79'],
    ['Hot pink', '#e05a8a'],
    ['Magenta', '#be185d'],
    ['Plum', '#7a1f5c'],
    ['Purple', '#6b21a8'],
    ['Lavender', '#c8b6e2'],
    ['Navy', '#0d1f4a'],
    ['Royal blue', '#1d3f8f'],
    ['Blue', '#2d6cdf'],
    ['Powder blue', '#c9def4'],
    ['Teal', '#0f6b5c'],
    ['Emerald', '#1e9e5a'],
    ['Bottle green', '#3f6b2a'],
    ['Leaf green', '#8db255'],
    ['Mint', '#d9ecd0'],
    ['Silver', '#c0c6d0'],
    ['Grey', '#8a8a8a'],
    ['Charcoal', '#3a3a3a'],
    ['Black', '#111111'],
];

const lab = (hex: string) => {
    const { l, c, h } = hexToOklch(hex);
    const r = (h * Math.PI) / 180;
    return [l, c * Math.cos(r), c * Math.sin(r)] as const;
};

const namedLab = named.map(([name, hex]) => [name, lab(hex)] as const);

export function colourName(hex: string): string {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return 'Colour';
    const [l, a, b] = lab(hex);
    let best = 'Colour';
    let gap = Infinity;
    for (const [name, [l2, a2, b2]] of namedLab) {
        const d = (l - l2) ** 2 + (a - a2) ** 2 + (b - b2) ** 2;
        if (d < gap) {
            gap = d;
            best = name;
        }
    }
    return best;
}

// "Marigold, saffron and cream", for words beside the swatches.
export function colourList(colors: readonly string[]): string {
    const names = [...new Set(colors.map(colourName))].map((n, i) =>
        i === 0 ? n : n.toLowerCase(),
    );
    if (names.length < 2) return names.join('');
    return `${names.slice(0, -1).join(', ')} and ${names.at(-1) ?? ''}`;
}
