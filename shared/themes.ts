// The MVP theme collection: original directions per culture pack (seeded into the `themes` table).
import type { BlockPreset } from './blocks';
import type { CultureId } from './cultures';
import type { OccasionCategory } from './occasions';
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
    // Occasion families this design is made for; the composer lists these first.
    suits: OccasionCategory[];
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
        suits: ['celebrations'],
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
        suits: ['celebrations'],
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
        suits: ['celebrations'],
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
        suits: ['celebrations'],
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
        suits: ['celebrations'],
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
        suits: ['celebrations', 'faith'],
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
        suits: ['celebrations'],
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
        suits: ['celebrations'],
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
        suits: ['celebrations'],
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
        suits: ['celebrations', 'milestones', 'corporate', 'general'],
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
        suits: ['celebrations', 'milestones'],
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
    {
        slug: 'shanti',
        name: 'Shanti',
        culture: 'universal',
        category: 'minimal',
        description:
            'A white lotus on handmade ivory paper, quiet slate type and a single line of brass. Dignified and still.',
        suits: ['remembrance'],
        fromPackage: 'signature',
        featured: true,
        design: {
            palette: {
                bg: '#f6f3ee',
                surface: '#ece7df',
                ink: '#2d2a26',
                muted: '#6f685f',
                primary: '#5b6b73',
                accent: '#8a9a8c',
                gold: '#a88f5e',
            },
            fonts: {
                display: 'cormorant',
                body: 'manrope',
            },
            opening: 'lotus',
            generative: {
                kind: 'lotus',
                density: 0.4,
            },
            texture: 'paper',
            motion: 'calm',
        },
    },
    {
        slug: 'deepanjali',
        name: 'Deepanjali',
        culture: 'hindu',
        category: 'traditional',
        description:
            'A lamp lit in their memory: deep indigo night, a warm diya glow and softly drawn mandala.',
        suits: ['remembrance'],
        fromPackage: 'signature',
        featured: true,
        design: {
            palette: {
                bg: '#141826',
                surface: '#1d2233',
                ink: '#efe6d6',
                muted: '#a9a08f',
                primary: '#d9a75b',
                accent: '#6c7a96',
                gold: '#d6b071',
            },
            fonts: {
                display: 'marcellus',
                body: 'cormorant',
            },
            opening: 'diya',
            generative: {
                kind: 'mandala',
                density: 0.3,
            },
            texture: 'linen',
            motion: 'calm',
        },
    },
    {
        slug: 'smriti',
        name: 'Smriti',
        culture: 'universal',
        category: 'minimal',
        description:
            'Monochrome editorial tribute: generous white space, a fine olive branch, a life told plainly.',
        suits: ['remembrance'],
        fromPackage: 'signature',
        featured: false,
        design: {
            palette: {
                bg: '#fafaf8',
                surface: '#f0efeb',
                ink: '#1f1f1f',
                muted: '#6b6b6b',
                primary: '#3a3a3a',
                accent: '#7d8471',
                gold: '#8f8576',
            },
            fonts: {
                display: 'fraunces',
                body: 'manrope',
            },
            opening: 'curtain',
            generative: {
                kind: 'botanical',
                density: 0.35,
            },
            texture: 'none',
            motion: 'calm',
        },
    },
    {
        slug: 'chandni',
        name: 'Chandni',
        culture: 'universal',
        category: 'modern',
        description:
            'Moonlight for a little one: powder blue, silver stars and a lantern that glows open.',
        suits: ['new-beginnings'],
        fromPackage: 'signature',
        featured: true,
        design: {
            palette: {
                bg: '#eef3f9',
                surface: '#e2eaf4',
                ink: '#22324a',
                muted: '#5d6f88',
                primary: '#4a6fa5',
                accent: '#d98f96',
                gold: '#8193b0',
            },
            fonts: {
                display: 'cormorant',
                body: 'manrope',
                script: 'pinyon',
            },
            opening: 'lantern',
            generative: {
                kind: 'botanical',
                density: 0.5,
            },
            texture: 'paper',
            motion: 'rich',
        },
    },
    {
        slug: 'palna',
        name: 'Palna',
        culture: 'universal',
        category: 'floral',
        description:
            'Soft peach and mint, a cradle of tiny dots and an envelope full of good wishes.',
        suits: ['new-beginnings'],
        fromPackage: 'signature',
        featured: false,
        design: {
            palette: {
                bg: '#fff6f0',
                surface: '#fde9df',
                ink: '#3b2a26',
                muted: '#8a6f66',
                primary: '#d0654a',
                accent: '#6f9f88',
                gold: '#c9925c',
            },
            fonts: {
                display: 'fraunces',
                body: 'manrope',
            },
            opening: 'envelope',
            generative: {
                kind: 'bandhani',
                density: 0.5,
            },
            texture: 'paper',
            motion: 'rich',
        },
    },
    {
        slug: 'griha',
        name: 'Griha',
        culture: 'hindu',
        category: 'traditional',
        description:
            'Marigold toran over turmeric silk: the new front door swings open for the first guests.',
        suits: ['new-beginnings', 'faith'],
        fromPackage: 'essential',
        featured: true,
        design: {
            palette: {
                bg: '#fff8e7',
                surface: '#fbe9bf',
                ink: '#3a2508',
                muted: '#7a5a2e',
                primary: '#c2410c',
                accent: '#3f7d3a',
                gold: '#c98a12',
            },
            fonts: {
                display: 'marcellus',
                body: 'cormorant',
            },
            opening: 'doors',
            generative: {
                kind: 'mandala',
                density: 0.6,
            },
            texture: 'silk',
            motion: 'rich',
        },
    },
    {
        slug: 'utsav',
        name: 'Utsav',
        culture: 'universal',
        category: 'modern',
        description:
            'Coral, teal and sunshine confetti: a party invite that bursts open and keeps celebrating.',
        suits: ['milestones'],
        fromPackage: 'signature',
        featured: true,
        design: {
            palette: {
                bg: '#fffaf3',
                surface: '#ffeedd',
                ink: '#2b1b3d',
                muted: '#6b5a7d',
                primary: '#e23d65',
                accent: '#0f7fa3',
                gold: '#e9a100',
            },
            fonts: {
                display: 'fraunces',
                body: 'manrope',
            },
            opening: 'envelope',
            generative: {
                kind: 'bandhani',
                density: 0.8,
            },
            texture: 'none',
            motion: 'cinematic',
        },
    },
    {
        slug: 'legacy',
        name: 'Legacy',
        culture: 'universal',
        category: 'luxury',
        description:
            'Navy and burnished brass for a lifetime of work, a golden anniversary or a felicitation.',
        suits: ['milestones', 'celebrations', 'corporate'],
        fromPackage: 'essential',
        featured: false,
        design: {
            palette: {
                bg: '#0f1b2d',
                surface: '#16263d',
                ink: '#f1ebe0',
                muted: '#b4ab9b',
                primary: '#c9a227',
                accent: '#5a7d9a',
                gold: '#d4af37',
            },
            fonts: {
                display: 'cinzel',
                body: 'cormorant',
            },
            opening: 'curtain',
            generative: {
                kind: 'girih',
                density: 0.5,
            },
            texture: 'linen',
            motion: 'rich',
        },
    },
    {
        slug: 'aarti',
        name: 'Aarti',
        culture: 'hindu',
        category: 'traditional',
        description:
            'Saffron and marigold around a glowing diya: a katha, puja or bhajan sandhya at home.',
        suits: ['faith'],
        fromPackage: 'signature',
        featured: true,
        design: {
            palette: {
                bg: '#fff4e0',
                surface: '#ffe2b8',
                ink: '#3d1608',
                muted: '#8a4b22',
                primary: '#d9480f',
                accent: '#a61e4d',
                gold: '#d99412',
            },
            fonts: {
                display: 'marcellus',
                body: 'cormorant',
            },
            opening: 'diya',
            generative: {
                kind: 'mandala',
                density: 0.85,
            },
            texture: 'silk',
            motion: 'rich',
        },
    },
    {
        slug: 'mangal',
        name: 'Mangal',
        culture: 'hindu',
        category: 'cultural',
        description:
            'Kumkum red and turmeric with a kalash at the door, for the janoi, mundan or any sanskar.',
        suits: ['faith', 'new-beginnings'],
        fromPackage: 'signature',
        featured: false,
        design: {
            palette: {
                bg: '#fdf6e3',
                surface: '#f8e7bb',
                ink: '#3a0d0d',
                muted: '#7d3b2b',
                primary: '#b91c1c',
                accent: '#a87204',
                gold: '#c99a2e',
            },
            fonts: {
                display: 'cinzel',
                body: 'cormorant',
            },
            opening: 'doors',
            generative: {
                kind: 'lotus',
                density: 0.7,
            },
            texture: 'paper',
            motion: 'rich',
        },
    },
    {
        slug: 'summit',
        name: 'Summit',
        culture: 'universal',
        category: 'modern',
        description:
            'Midnight slate with electric accents: a crisp, confident invite for launches and summits.',
        suits: ['corporate'],
        fromPackage: 'essential',
        featured: true,
        design: {
            palette: {
                bg: '#0b1220',
                surface: '#111a2e',
                ink: '#e8edf7',
                muted: '#97a3b8',
                primary: '#4f7cff',
                accent: '#22d3ee',
                gold: '#9fb4ff',
            },
            fonts: {
                display: 'manrope',
                body: 'manrope',
            },
            opening: 'curtain',
            generative: {
                kind: 'girih',
                density: 0.4,
            },
            texture: 'none',
            motion: 'rich',
        },
    },
];

export const themeBySlug = (slug: string) => themeCatalog.find((t) => t.slug === slug);

// Each theme is a full layout, not just a palette: variant, entrance, backdrop and edge per section.
export const themeLayouts: Record<string, BlockPreset> = {
    rajwada: {
        cover: {
            variant: 'arch',
            enter: 'curtain',
            scene: 'silk',
        },
        card: {
            variant: 'stack',
            enter: 'tilt',
        },
        countdown: {
            variant: 'flip',
            scene: 'jacquard',
        },
        welcome: {
            variant: 'framed',
            enter: 'unfold',
            scene: 'velvet',
        },
        events: {
            variant: 'arches',
            edge: 'arch',
        },
        gallery: {
            variant: 'film',
            scene: 'jacquard',
        },
        closing: {
            variant: 'monogram',
            scene: 'silk',
        },
    },
    bandhani: {
        cover: {
            variant: 'monogram',
            enter: 'bloom',
        },
        countdown: {
            variant: 'rings',
            edge: 'scallop',
        },
        welcome: {
            variant: 'centered',
            enter: 'bloom',
            edge: 'scallop',
        },
        story: {
            variant: 'editorial',
            edge: 'torn',
        },
        events: {
            variant: 'tickets',
            enter: 'drift',
            edge: 'scallop',
        },
        gallery: { variant: 'polaroid' },
        closing: {
            variant: 'blessing',
            enter: 'bloom',
            edge: 'scallop',
        },
    },
    gulmohar: {
        cover: {
            variant: 'spotlight',
            enter: 'ink',
        },
        card: {
            variant: 'stack',
            enter: 'tilt',
        },
        welcome: {
            variant: 'centered',
            enter: 'ink',
            edge: 'torn',
        },
        story: {
            variant: 'editorial',
            enter: 'rise',
        },
        events: {
            variant: 'arches',
            edge: 'seam',
        },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
        },
        closing: { variant: 'monogram' },
    },
    mashrabiya: {
        cover: {
            variant: 'arch',
            enter: 'curtain',
            scene: 'silk',
        },
        countdown: {
            variant: 'line',
            scene: 'night',
        },
        welcome: {
            variant: 'framed',
            enter: 'curtain',
        },
        events: {
            variant: 'arches',
            edge: 'arch',
        },
        gallery: {
            variant: 'grid',
            enter: 'curtain',
        },
        closing: {
            variant: 'blessing',
            scene: 'night',
        },
    },
    noor: {
        cover: {
            variant: 'arch',
            enter: 'ink',
            scene: 'night',
        },
        card: {
            variant: 'single',
            scene: 'night',
            enter: 'unfold',
        },
        countdown: {
            variant: 'rings',
            scene: 'night',
        },
        welcome: {
            variant: 'centered',
            scene: 'night',
            enter: 'ink',
        },
        events: {
            variant: 'timeline',
            scene: 'night',
            enter: 'rise',
        },
        rsvp: { scene: 'night' },
        closing: {
            variant: 'blessing',
            scene: 'night',
        },
    },
    kamal: {
        cover: {
            variant: 'monogram',
            enter: 'bloom',
            scene: 'paper',
        },
        countdown: {
            variant: 'line',
            scene: 'paper',
        },
        welcome: {
            variant: 'centered',
            enter: 'bloom',
            scene: 'blush',
            edge: 'scallop',
        },
        events: {
            variant: 'timeline',
            scene: 'paper',
            edge: 'torn',
        },
        gallery: {
            variant: 'grid',
            scene: 'paper',
        },
        closing: {
            variant: 'blessing',
            enter: 'bloom',
            scene: 'paper',
        },
    },
    phulkari: {
        cover: {
            variant: 'arch',
            enter: 'unfold',
        },
        countdown: {
            variant: 'flip',
            edge: 'scallop',
        },
        welcome: {
            variant: 'framed',
            enter: 'wipe',
        },
        events: {
            variant: 'timeline',
            enter: 'wipe',
        },
        gallery: { variant: 'polaroid' },
        closing: { variant: 'monogram' },
    },
    'cathedral-garden': {
        cover: {
            variant: 'arch',
            enter: 'rise',
            scene: 'blush',
        },
        card: {
            variant: 'stack',
            enter: 'tilt',
        },
        welcome: {
            variant: 'editorial',
            enter: 'rise',
            edge: 'torn',
        },
        events: {
            variant: 'tickets',
            enter: 'drift',
        },
        gallery: { variant: 'polaroid' },
        closing: {
            variant: 'monogram',
            scene: 'paper',
        },
    },
    chuppah: {
        cover: {
            variant: 'arch',
            enter: 'unfold',
            scene: 'paper',
        },
        card: {
            variant: 'single',
            enter: 'unfold',
        },
        countdown: {
            variant: 'line',
            scene: 'paper',
        },
        welcome: {
            variant: 'framed',
            scene: 'paper',
            edge: 'torn',
        },
        events: {
            variant: 'timeline',
            scene: 'blush',
        },
        closing: {
            variant: 'blessing',
            scene: 'paper',
        },
    },
    editorial: {
        cover: {
            variant: 'editorial',
            enter: 'wipe',
            scene: 'plain',
        },
        card: {
            variant: 'single',
            scene: 'plain',
            enter: 'rise',
        },
        countdown: {
            variant: 'line',
            scene: 'plain',
        },
        welcome: {
            variant: 'editorial',
            scene: 'plain',
            enter: 'wipe',
        },
        story: {
            variant: 'editorial',
            scene: 'plain',
        },
        events: {
            variant: 'tickets',
            scene: 'plain',
            enter: 'drift',
            edge: 'none',
        },
        gallery: {
            variant: 'film',
            scene: 'plain',
        },
        rsvp: { scene: 'plain' },
        closing: {
            variant: 'blessing',
            scene: 'plain',
        },
    },
    resham: {
        cover: {
            variant: 'spotlight',
            enter: 'ink',
        },
        card: {
            variant: 'stack',
            enter: 'tilt',
        },
        welcome: {
            variant: 'framed',
            enter: 'unfold',
        },
        events: { variant: 'arches' },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
        },
        closing: { variant: 'monogram' },
    },
    shanti: {
        cover: {
            variant: 'arch',
            enter: 'ink',
            scene: 'paper',
            motif: 'lotus',
        },
        welcome: {
            variant: 'centered',
            enter: 'ink',
            scene: 'plain',
        },
        story: {
            variant: 'editorial',
            enter: 'rise',
            scene: 'paper',
            motif: 'leaf',
        },
        events: {
            variant: 'timeline',
            enter: 'rise',
            scene: 'plain',
        },
        gallery: {
            variant: 'grid',
            enter: 'ink',
            scene: 'paper',
        },
        family: {
            variant: 'framed',
            enter: 'ink',
            scene: 'paper',
        },
        wishes: {
            enter: 'rise',
            scene: 'plain',
        },
        closing: {
            variant: 'blessing',
            enter: 'ink',
            scene: 'paper',
            motif: 'lotus',
        },
    },
    deepanjali: {
        cover: {
            variant: 'spotlight',
            enter: 'ink',
            scene: 'night',
            motif: 'diya',
        },
        welcome: {
            variant: 'framed',
            enter: 'ink',
            scene: 'velvet',
        },
        story: {
            variant: 'centered',
            enter: 'rise',
            scene: 'night',
        },
        events: {
            variant: 'timeline',
            enter: 'rise',
            scene: 'velvet',
        },
        gallery: {
            variant: 'grid',
            enter: 'ink',
            scene: 'night',
        },
        family: {
            variant: 'centered',
            enter: 'ink',
            scene: 'velvet',
        },
        wishes: {
            enter: 'rise',
            scene: 'night',
        },
        closing: {
            variant: 'blessing',
            enter: 'ink',
            scene: 'night',
            motif: 'diya',
        },
    },
    smriti: {
        cover: {
            variant: 'editorial',
            enter: 'rise',
            scene: 'plain',
        },
        welcome: {
            variant: 'editorial',
            enter: 'rise',
            scene: 'plain',
        },
        story: {
            variant: 'editorial',
            enter: 'rise',
            scene: 'paper',
            motif: 'olive',
        },
        events: {
            variant: 'timeline',
            enter: 'rise',
            scene: 'plain',
        },
        gallery: {
            variant: 'film',
            enter: 'ink',
            scene: 'paper',
        },
        family: {
            variant: 'editorial',
            enter: 'ink',
            scene: 'plain',
        },
        wishes: {
            enter: 'rise',
            scene: 'paper',
        },
        closing: {
            variant: 'blessing',
            enter: 'ink',
            scene: 'plain',
            motif: 'olive',
        },
    },
    chandni: {
        cover: {
            variant: 'monogram',
            enter: 'bloom',
            scene: 'blush',
            motif: 'moon',
        },
        card: {
            variant: 'single',
            enter: 'unfold',
        },
        countdown: {
            variant: 'rings',
            scene: 'paper',
        },
        welcome: {
            variant: 'centered',
            enter: 'drift',
            scene: 'blush',
            motif: 'moon',
        },
        events: {
            variant: 'arches',
            edge: 'scallop',
            scene: 'paper',
        },
        gallery: {
            variant: 'polaroid',
            scene: 'blush',
        },
        rsvp: {
            scene: 'blush',
            motif: 'moon',
        },
        closing: {
            variant: 'monogram',
            scene: 'paper',
        },
    },
    palna: {
        cover: {
            variant: 'arch',
            enter: 'bloom',
            scene: 'blush',
            motif: 'confetti',
        },
        card: {
            variant: 'stack',
            enter: 'tilt',
        },
        countdown: {
            variant: 'line',
            scene: 'paper',
        },
        welcome: {
            variant: 'framed',
            enter: 'bloom',
            scene: 'paper',
        },
        events: {
            variant: 'tickets',
            edge: 'scallop',
            scene: 'blush',
        },
        gallery: {
            variant: 'polaroid',
            scene: 'paper',
        },
        closing: {
            variant: 'blessing',
            scene: 'blush',
            motif: 'lotus',
        },
    },
    griha: {
        cover: {
            variant: 'arch',
            enter: 'curtain',
            scene: 'silk',
            motif: 'marigold',
        },
        card: {
            variant: 'stack',
            enter: 'tilt',
        },
        countdown: {
            variant: 'flip',
            scene: 'jacquard',
            motif: 'kalash',
        },
        welcome: {
            variant: 'framed',
            enter: 'unfold',
            scene: 'paper',
        },
        events: {
            variant: 'arches',
            edge: 'arch',
            scene: 'silk',
            motif: 'kalash',
        },
        gallery: {
            variant: 'film',
            scene: 'jacquard',
        },
        closing: {
            variant: 'monogram',
            scene: 'silk',
            motif: 'marigold',
        },
    },
    utsav: {
        cover: {
            variant: 'editorial',
            enter: 'bloom',
            scene: 'plain',
            motif: 'confetti',
        },
        card: {
            variant: 'single',
            enter: 'tilt',
        },
        countdown: {
            variant: 'flip',
            scene: 'blush',
            motif: 'confetti',
        },
        welcome: {
            variant: 'centered',
            enter: 'bloom',
            scene: 'plain',
        },
        events: {
            variant: 'tickets',
            edge: 'torn',
            scene: 'blush',
            motif: 'confetti',
        },
        gallery: {
            variant: 'polaroid',
            scene: 'plain',
        },
        closing: {
            variant: 'blessing',
            scene: 'blush',
            motif: 'confetti',
        },
    },
    legacy: {
        cover: {
            variant: 'monogram',
            enter: 'curtain',
            scene: 'velvet',
        },
        card: {
            variant: 'single',
            enter: 'unfold',
        },
        countdown: {
            variant: 'line',
            scene: 'night',
        },
        welcome: {
            variant: 'editorial',
            enter: 'wipe',
            scene: 'velvet',
        },
        story: {
            variant: 'editorial',
            scene: 'night',
        },
        events: {
            variant: 'timeline',
            scene: 'velvet',
        },
        gallery: {
            variant: 'film',
            scene: 'night',
        },
        closing: {
            variant: 'monogram',
            scene: 'velvet',
        },
    },
    aarti: {
        cover: {
            variant: 'spotlight',
            enter: 'ink',
            scene: 'silk',
            motif: 'diya',
        },
        welcome: {
            variant: 'framed',
            enter: 'unfold',
            scene: 'jacquard',
            motif: 'marigold',
        },
        events: {
            variant: 'arches',
            edge: 'scallop',
            scene: 'silk',
            motif: 'diya',
        },
        rsvp: {
            scene: 'jacquard',
            motif: 'marigold',
        },
        closing: {
            variant: 'blessing',
            scene: 'silk',
            motif: 'marigold',
        },
    },
    mangal: {
        cover: {
            variant: 'arch',
            enter: 'unfold',
            scene: 'jacquard',
            motif: 'kalash',
        },
        card: {
            variant: 'stack',
            enter: 'tilt',
        },
        countdown: {
            variant: 'rings',
            scene: 'paper',
        },
        welcome: {
            variant: 'framed',
            scene: 'paper',
            motif: 'lotus',
        },
        events: {
            variant: 'arches',
            edge: 'arch',
            scene: 'jacquard',
            motif: 'kalash',
        },
        closing: {
            variant: 'monogram',
            scene: 'jacquard',
            motif: 'kalash',
        },
    },
    summit: {
        cover: {
            variant: 'editorial',
            enter: 'wipe',
            scene: 'night',
            motif: 'spark',
        },
        countdown: {
            variant: 'line',
            scene: 'plain',
        },
        welcome: {
            variant: 'editorial',
            enter: 'wipe',
            scene: 'plain',
        },
        events: {
            variant: 'tickets',
            enter: 'drift',
            scene: 'night',
            edge: 'none',
            motif: 'spark',
        },
        rsvp: {scene: 'plain',},
        closing: {
            variant: 'blessing',
            scene: 'night',
            motif: 'spark',
        },
    },
};
