// The MVP theme collection: original directions per culture pack (seeded into the `themes` table).
import type { CultureId } from './cultures';
import type { InvitationDesign } from './types';

export interface ThemeDefinition {
    slug: string;
    name: string;
    culture: CultureId;
    category:
        | 'royal'
        | 'floral'
        | 'traditional'
        | 'minimal'
        | 'modern'
        | 'luxury'
        | 'cultural'
        | 'destination';
    description: string;
    fromPackage: string;
    featured: boolean;
    design: InvitationDesign;
}

export const themeCatalog: ThemeDefinition[] = [
    {
        slug: 'rajwada',
        name: 'Rajwada',
        culture: 'hindu',
        category: 'royal',
        description:
            'Carved palace doors swing open onto jharokha arches in burnished gold and deep burgundy.',
        fromPackage: 'premium',
        featured: true,
        design: {
            palette: {
                bg: '#1c0b10',
                surface: '#2a1118',
                ink: '#f7ead7',
                muted: '#cdb7a0',
                primary: '#b8324f',
                accent: '#2f6f5e',
                gold: '#d9a441',
            },
            fonts: {
                display: 'cinzel',
                body: 'cormorant',
                script: 'pinyon',
            },
            opening: 'doors',
            generative: {
                kind: 'mandala',
                density: 0.8,
            },
            texture: 'silk',
            motion: 'cinematic',
        },
    },
    {
        slug: 'bandhani',
        name: 'Bandhani',
        culture: 'hindu',
        category: 'traditional',
        description:
            'A tie-dye bloom of thousands of dots unfurls in kumkum red and marigold — pure Gujarat.',
        fromPackage: 'signature',
        featured: true,
        design: {
            palette: {
                bg: '#fbf3e4',
                surface: '#f5e4c8',
                ink: '#2b0f0c',
                muted: '#7a4b3a',
                primary: '#b3261e',
                accent: '#e08a00',
                gold: '#c18f2f',
            },
            fonts: {
                display: 'marcellus',
                body: 'cormorant',
            },
            opening: 'diya',
            generative: {
                kind: 'bandhani',
                density: 0.7,
            },
            texture: 'linen',
            motion: 'rich',
        },
    },
    {
        slug: 'gulmohar',
        name: 'Gulmohar',
        culture: 'hindu',
        category: 'floral',
        description:
            'A wax-sealed envelope breaks open and gulmohar petals drift across dusty rose and champagne.',
        fromPackage: 'signature',
        featured: true,
        design: {
            palette: {
                bg: '#fbf4f1',
                surface: '#f3e3de',
                ink: '#2e1a1f',
                muted: '#82626a',
                primary: '#a8455e',
                accent: '#7c8c6e',
                gold: '#c79b5b',
            },
            fonts: {
                display: 'fraunces',
                body: 'cormorant',
                script: 'pinyon',
            },
            opening: 'envelope',
            generative: {
                kind: 'botanical',
                density: 0.6,
            },
            texture: 'paper',
            motion: 'rich',
        },
    },
    {
        slug: 'mashrabiya',
        name: 'Mashrabiya',
        culture: 'islamic',
        category: 'luxury',
        description:
            'Light filters through carved lattice doors that slide apart over emerald and gold geometry.',
        fromPackage: 'premium',
        featured: true,
        design: {
            palette: {
                bg: '#0c1f1a',
                surface: '#123029',
                ink: '#f3ead8',
                muted: '#b9c4b4',
                primary: '#2e8b6d',
                accent: '#8c2f39',
                gold: '#d4af5a',
            },
            fonts: {
                display: 'kufi',
                body: 'amiri',
            },
            opening: 'mashrabiya',
            generative: {
                kind: 'girih',
                density: 0.8,
            },
            texture: 'silk',
            motion: 'cinematic',
        },
    },
    {
        slug: 'noor',
        name: 'Noor',
        culture: 'islamic',
        category: 'modern',
        description:
            'Tap to light the fanoos lanterns; a crescent rises over midnight blue as your names glow.',
        fromPackage: 'signature',
        featured: false,
        design: {
            palette: {
                bg: '#0b1530',
                surface: '#13214a',
                ink: '#f2ecdf',
                muted: '#aeb6cf',
                primary: '#6f8fd8',
                accent: '#d97a8a',
                gold: '#e6c06b',
            },
            fonts: {
                display: 'ruqaa',
                body: 'amiri',
            },
            opening: 'lantern',
            generative: {
                kind: 'girih',
                density: 0.6,
            },
            texture: 'none',
            motion: 'rich',
        },
    },
    {
        slug: 'kamal',
        name: 'Kamal',
        culture: 'jain',
        category: 'minimal',
        description:
            'A serene lotus unfolds petal by petal — one petal for every ceremony — in white and saffron.',
        fromPackage: 'signature',
        featured: true,
        design: {
            palette: {
                bg: '#fffaf2',
                surface: '#f8ecd9',
                ink: '#2a1c10',
                muted: '#7d6a55',
                primary: '#d0731b',
                accent: '#b04a5a',
                gold: '#c99a3e',
            },
            fonts: {
                display: 'marcellus',
                body: 'cormorant',
            },
            opening: 'lotus',
            generative: {
                kind: 'lotus',
                density: 0.6,
            },
            texture: 'paper',
            motion: 'calm',
        },
    },
    {
        slug: 'phulkari',
        name: 'Phulkari',
        culture: 'sikh',
        category: 'cultural',
        description:
            'Threads stitch themselves into Phulkari blossoms; the Laavan unfold as a four-chapter journey.',
        fromPackage: 'essential',
        featured: true,
        design: {
            palette: {
                bg: '#fff6ec',
                surface: '#fbe6cf',
                ink: '#2c1206',
                muted: '#7c5236',
                primary: '#c2410c',
                accent: '#9d174d',
                gold: '#d69e2e',
            },
            fonts: {
                display: 'fraunces',
                body: 'manrope',
            },
            opening: 'phulkari',
            generative: {
                kind: 'phulkari',
                density: 0.8,
            },
            texture: 'linen',
            motion: 'rich',
        },
    },
    {
        slug: 'cathedral-garden',
        name: 'Cathedral Garden',
        culture: 'christian',
        category: 'floral',
        description:
            'Garden-arch doors open onto botanical florals, a wax seal and the soft chime of bells.',
        fromPackage: 'signature',
        featured: false,
        design: {
            palette: {
                bg: '#f8f6f0',
                surface: '#ecefe6',
                ink: '#1d2420',
                muted: '#5e6b62',
                primary: '#4f6f52',
                accent: '#b07a8a',
                gold: '#bfa06a',
            },
            fonts: {
                display: 'cormorant',
                body: 'manrope',
                script: 'pinyon',
            },
            opening: 'garden-arch',
            generative: {
                kind: 'botanical',
                density: 0.5,
            },
            texture: 'paper',
            motion: 'calm',
        },
    },
    {
        slug: 'chuppah',
        name: 'Chuppah',
        culture: 'jewish',
        category: 'luxury',
        description:
            'A chuppah canopy unfolds over your names inside an illuminated Ketubah border. Mazel Tov!',
        fromPackage: 'premium',
        featured: true,
        design: {
            palette: {
                bg: '#f7f4ee',
                surface: '#e9e4d8',
                ink: '#1a1f2e',
                muted: '#5a6070',
                primary: '#24427a',
                accent: '#8f2d3c',
                gold: '#c2a14d',
            },
            fonts: {
                display: 'cormorant',
                body: 'cormorant',
            },
            opening: 'chuppah',
            generative: {
                kind: 'ketubah',
                density: 0.7,
            },
            texture: 'paper',
            motion: 'rich',
        },
    },
    {
        slug: 'editorial',
        name: 'Editorial',
        culture: 'universal',
        category: 'minimal',
        description:
            'Magazine-grade typography; a curtain of serif letters slides away to reveal your story.',
        fromPackage: 'signature',
        featured: false,
        design: {
            palette: {
                bg: '#f4f1ea',
                surface: '#e7e2d6',
                ink: '#171512',
                muted: '#6b665c',
                primary: '#5d6b4f',
                accent: '#b4532a',
                gold: '#a8884f',
            },
            fonts: {
                display: 'fraunces',
                body: 'manrope',
            },
            opening: 'curtain',
            generative: {
                kind: 'botanical',
                density: 0.3,
            },
            texture: 'none',
            motion: 'calm',
        },
    },
    {
        slug: 'resham',
        name: 'Resham',
        culture: 'universal',
        category: 'luxury',
        description: 'Silk threads embroider your names stitch by stitch among roses on ivory.',
        fromPackage: 'essential',
        featured: true,
        design: {
            palette: {
                bg: '#fbf7f0',
                surface: '#f1e7da',
                ink: '#2a1d1d',
                muted: '#7f6a64',
                primary: '#a13d52',
                accent: '#56705b',
                gold: '#c09451',
            },
            fonts: {
                display: 'cormorant',
                body: 'cormorant',
                script: 'pinyon',
            },
            opening: 'stitch',
            generative: {
                kind: 'mandala',
                density: 0.5,
            },
            texture: 'silk',
            motion: 'rich',
        },
    },
];

export const themeBySlug = (slug: string) => themeCatalog.find((t) => t.slug === slug);
