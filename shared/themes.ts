// The MVP theme collection: original directions per culture pack (seeded into the `themes` table).
import type { BlockPreset } from './blocks';
import type { CultureId } from './cultures';
import type { OccasionCategory } from './occasions';
import { luxuryLayouts, luxuryThemes } from './themes-luxury';
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
            'Pull the gold chain and carved palace doors part onto jharokha arches in burnished gold and deep burgundy; the baraat ghodi brings the card and the doli carries the bride off.',
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
            opening: 'chain',
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
            opening: 'bandhani',
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
            'A gota-edged dupatta floats away over dusty rose and champagne; watercolour gulmohar blooms, the ghodi into the ceremonies and the doli at the farewell.',
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
            opening: 'veil',
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
            'Guests offer flowers and the lamp is lit in their memory: deep indigo night, a warm diya glow and softly drawn mandala.',
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
            opening: 'tribute',
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
            opening: 'ink',
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
            'Moonlight for a little one: powder blue and silver stars, and an instant photo that develops into the name as guests rub it.',
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
            opening: 'polaroid',
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
            'Soft peach and mint, a gift that unwraps, drifting clouds and butterflies for the little one on the way.',
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
            opening: 'ribbon',
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
            'Coral, teal and sunshine confetti: fireworks spell the name, then a party invite that keeps celebrating.',
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
            opening: 'fireworks',
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
            'A leather-bound book opens on a lifetime of work: navy and burnished brass, art-deco steps and a note from the family.',
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
            opening: 'book',
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
            'Ring the ghanti three times: saffron and marigold swags, a glowing diya on every arch and a rangoli at the end.',
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
            opening: 'bell',
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
            'Kumkum red and turmeric: molten gold drops fuse and flood the screen, then a kalash on every arch, for the janoi, mundan or any sanskar.',
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
            opening: 'liquid-gold',
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
            'Midnight slate with electric accents: a hyperspace opening and sharp diagonal cuts for launches and summits.',
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
            opening: 'warp',
            generative: {
                kind: 'girih',
                density: 0.4,
            },
            texture: 'none',
            motion: 'rich',
        },
    },
    {
        slug: 'mehfil',
        name: 'Mehfil',
        culture: 'hindu',
        category: 'luxury',
        description:
            'Plum velvet, zari gold and blush paper: your photo story, a card drawn from its envelope, stacked arches and a marigold rangoli seal.',
        suits: ['celebrations'],
        fromPackage: 'premium',
        featured: true,
        design: {
            palette: {
                bg: '#f3e2dc',
                surface: '#fbf4ec',
                ink: '#3b1f24',
                muted: '#7a5b5e',
                primary: '#8e1f4f',
                accent: '#b3263e',
                gold: '#c0902f',
            },
            fonts: {
                display: 'cormorant',
                body: 'cormorant',
                script: 'pinyon',
            },
            opening: 'envelope',
            generative: {
                kind: 'mandala',
                density: 0.6,
            },
            texture: 'silk',
            motion: 'cinematic',
        },
    },
    {
        slug: 'phoolwari',
        name: 'Phoolwari',
        culture: 'hindu',
        category: 'floral',
        description:
            'A hand-illustrated wildflower garden: Ganesha and a gold monogram, then one painted page per ceremony with its theme, dress code and guests stepping onto the stage.',
        suits: ['celebrations'],
        fromPackage: 'premium',
        featured: true,
        design: {
            palette: {
                bg: '#f4ece0',
                surface: '#fdf6ec',
                ink: '#4a1830',
                muted: '#7d5a66',
                primary: '#a3164f',
                accent: '#8f7cc2',
                gold: '#c39a3c',
            },
            fonts: {
                display: 'marcellus',
                body: 'cormorant',
                script: 'pinyon',
            },
            opening: 'garden',
            generative: {
                kind: 'botanical',
                density: 0.5,
            },
            texture: 'paper',
            motion: 'cinematic',
        },
    },
];

// The luxury collection joins the catalogue after the original designs.
themeCatalog.push(...luxuryThemes);

export const themeBySlug = (slug: string) => themeCatalog.find((t) => t.slug === slug);

// Each theme is a full layout, not just a palette: variant, entrance, backdrop and edge per section.
export const themeLayouts: Record<string, BlockPreset> = {
    // Palace wedding: the baraat ghodi brings the card, cusped jharokha arches frame each ceremony, the doli carries the bride off at the close.
    rajwada: {
        cover: {
            variant: 'arch',
            enter: 'curtain',
            scene: 'silk',
            motif: 'paisley',
        },
        card: {
            variant: 'envelope',
            enter: 'rise',
            scene: 'velvet',
            edge: 'ghodi',
            edgeMotion: true,
        },
        countdown: {
            variant: 'flip',
            enter: 'rise',
            scene: 'jacquard',
            edge: 'cusped',
        },
        welcome: {
            variant: 'framed',
            enter: 'unfold',
            scene: 'velvet',
            edge: 'seam',
        },
        family: {
            variant: 'blessings',
            enter: 'unfold',
            scene: 'paper',
            edge: 'torn',
        },
        story: {
            variant: 'letter',
            enter: 'rise',
            scene: 'paper',
        },
        events: {
            variant: 'stack',
            enter: 'rise',
            scene: 'blush',
            motif: 'paisley',
            edge: 'elephant',
            edgeMotion: true,
        },
        gallery: {
            variant: 'film',
            enter: 'rise',
            scene: 'jacquard',
            edge: 'seam',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'swag',
        },
        wishes: {
            scene: 'paper',
            edge: 'torn',
        },
        closing: {
            variant: 'rangoli',
            enter: 'glow',
            scene: 'silk',
            edge: 'doli',
            edgeMotion: true,
        },
        shagun: {
            scene: 'silk',
            edge: 'lace',
        },
    },
    // Garba colours: leheriya waves, a tie-dye bloom, ghungroo on the sangeet arch and the ghodi trotting into the ceremonies.
    bandhani: {
        cover: {
            variant: 'monogram',
            enter: 'bloom',
            scene: 'silk',
            motif: 'marigold',
        },
        card: {
            variant: 'single',
            enter: 'unfold',
            scene: 'paper',
            edge: 'pinking',
        },
        countdown: {
            variant: 'rings',
            enter: 'rise',
            scene: 'leheriya',
            edge: 'scallop',
            edgeMotion: true,
        },
        welcome: {
            variant: 'centered',
            enter: 'bloom',
            scene: 'paper',
            edge: 'kites',
            edgeMotion: true,
        },
        family: {
            variant: 'blessings',
            enter: 'unfold',
            scene: 'paper',
        },
        story: {
            variant: 'letter',
            enter: 'rise',
            scene: 'paper',
            edge: 'torn',
        },
        events: {
            variant: 'stack',
            enter: 'drift',
            scene: 'leheriya',
            edge: 'ghodi',
            edgeMotion: true,
        },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
            scene: 'paper',
            edge: 'scallop',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'scallop',
        },
        wishes: {
            scene: 'paper',
            edge: 'torn',
        },
        closing: {
            variant: 'rangoli',
            enter: 'bloom',
            scene: 'silk',
            edge: 'scallop',
        },
        shagun: { scene: 'silk' },
    },
    // Marwari florals: watercolour blooms, a mandap swag, the ghodi into the ceremonies and the doli at the farewell.
    gulmohar: {
        cover: {
            variant: 'spotlight',
            enter: 'ink',
            scene: 'silk',
            motif: 'rose',
        },
        card: {
            variant: 'envelope',
            enter: 'rise',
            scene: 'blush',
            edge: 'swag',
        },
        countdown: {
            variant: 'rings',
            enter: 'rise',
            scene: 'watercolor',
            edge: 'bagghi',
            edgeMotion: true,
        },
        welcome: {
            variant: 'centered',
            enter: 'ink',
            scene: 'watercolor',
            edge: 'torn',
        },
        family: {
            variant: 'blessings',
            enter: 'unfold',
            scene: 'paper',
        },
        story: {
            variant: 'letter',
            enter: 'rise',
            scene: 'paper',
            edge: 'torn',
        },
        events: {
            variant: 'stack',
            enter: 'rise',
            scene: 'blush',
            edge: 'ghodi',
            edgeMotion: true,
        },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
            scene: 'watercolor',
            edge: 'scallop',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'swag',
        },
        wishes: {
            scene: 'paper',
            edge: 'torn',
        },
        closing: {
            variant: 'rangoli',
            enter: 'glow',
            scene: 'blush',
            edge: 'doli',
            edgeMotion: true,
        },
        shagun: { scene: 'silk' },
    },
    // Courtyard geometry: onion-domed ogee arches between every block, girih on the cover and seal.
    mashrabiya: {
        cover: {
            variant: 'arch',
            enter: 'curtain',
            scene: 'silk',
            motif: 'girih',
        },
        card: {
            variant: 'single',
            enter: 'unfold',
            scene: 'jacquard',
            edge: 'ogee',
            motif: 'arabesque',
        },
        countdown: {
            variant: 'line',
            enter: 'rise',
            scene: 'night',
            edge: 'ogee',
        },
        welcome: {
            variant: 'framed',
            enter: 'curtain',
            scene: 'paper',
            edge: 'seam',
        },
        story: {
            variant: 'editorial',
            enter: 'rise',
            scene: 'paper',
        },
        events: {
            variant: 'arches',
            enter: 'rise',
            scene: 'jacquard',
            edge: 'ogee',
            motif: 'arabesque',
        },
        gallery: {
            variant: 'grid',
            enter: 'curtain',
            scene: 'paper',
            edge: 'seam',
        },
        rsvp: {
            scene: 'night',
            edge: 'ogee',
        },
        wishes: {
            scene: 'paper',
            edge: 'torn',
        },
        closing: {
            variant: 'monogram',
            enter: 'glow',
            scene: 'night',
            motif: 'girih',
            edge: 'lanterns',
            edgeMotion: true,
        },
    },
    // Lantern night: aurora glow, crescent moons and ogee arches over midnight blue.
    noor: {
        cover: {
            variant: 'arch',
            enter: 'ink',
            scene: 'night',
            motif: 'moon',
        },
        card: {
            variant: 'envelope',
            enter: 'rise',
            scene: 'night',
            edge: 'ogee',
        },
        countdown: {
            variant: 'rings',
            enter: 'rise',
            scene: 'aurora',
            edge: 'lanterns',
            edgeMotion: true,
        },
        welcome: {
            variant: 'centered',
            enter: 'ink',
            scene: 'night',
        },
        story: {
            variant: 'letter',
            enter: 'rise',
            scene: 'paper',
            edge: 'torn',
        },
        events: {
            variant: 'timeline',
            enter: 'rise',
            scene: 'night',
            edge: 'ogee',
            motif: 'moon',
        },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
            scene: 'paper',
            edge: 'torn',
        },
        rsvp: {
            scene: 'night',
            edge: 'cloud',
        },
        wishes: {
            scene: 'paper',
            edge: 'torn',
        },
        closing: {
            variant: 'blessing',
            enter: 'glow',
            scene: 'night',
            edge: 'ogee',
            motif: 'moon',
        },
    },
    // Jain serenity: a row of lotus petals between every block, white and saffron, nothing loud.
    kamal: {
        cover: {
            variant: 'monogram',
            enter: 'bloom',
            scene: 'paper',
            motif: 'lotus',
        },
        card: {
            variant: 'single',
            enter: 'unfold',
            scene: 'paper',
            edge: 'lotus',
        },
        countdown: {
            variant: 'line',
            enter: 'rise',
            scene: 'paper',
            edge: 'lotus',
        },
        welcome: {
            variant: 'centered',
            enter: 'bloom',
            scene: 'blush',
            edge: 'lotus',
        },
        family: {
            variant: 'blessings',
            enter: 'unfold',
            scene: 'paper',
        },
        story: {
            variant: 'letter',
            enter: 'rise',
            scene: 'paper',
            edge: 'torn',
        },
        events: {
            variant: 'timeline',
            enter: 'rise',
            scene: 'watercolor',
            edge: 'lotus',
            motif: 'lotus',
        },
        gallery: {
            variant: 'grid',
            enter: 'ink',
            scene: 'paper',
            edge: 'torn',
        },
        rsvp: {
            scene: 'blush',
            edge: 'lotus',
        },
        wishes: { scene: 'paper' },
        closing: {
            variant: 'blessing',
            enter: 'bloom',
            scene: 'paper',
            edge: 'lotus',
            motif: 'lotus',
        },
    },
    // Punjabi embroidery: phulkari silk, scalloped borders and the groom on his ghodi into the Laavan.
    phulkari: {
        cover: {
            variant: 'arch',
            enter: 'unfold',
            scene: 'silk',
            motif: 'phulkari',
        },
        card: {
            variant: 'envelope',
            enter: 'rise',
            scene: 'silk',
            edge: 'swag',
        },
        countdown: {
            variant: 'flip',
            enter: 'rise',
            scene: 'leheriya',
            edge: 'dhol',
            edgeMotion: true,
        },
        welcome: {
            variant: 'framed',
            enter: 'wipe',
            scene: 'paper',
            edge: 'seam',
        },
        family: {
            variant: 'blessings',
            enter: 'unfold',
            scene: 'paper',
        },
        story: {
            variant: 'letter',
            enter: 'rise',
            scene: 'paper',
            edge: 'torn',
        },
        events: {
            variant: 'timeline',
            enter: 'wipe',
            scene: 'blush',
            edge: 'ghodi',
            edgeMotion: true,
            motif: 'phulkari',
        },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
            scene: 'jacquard',
            edge: 'scallop',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'swag',
        },
        wishes: {
            scene: 'paper',
            edge: 'torn',
        },
        closing: {
            variant: 'monogram',
            enter: 'glow',
            scene: 'silk',
            edge: 'scallop',
            motif: 'phulkari',
        },
    },
    // Garden chapel: lace and watercolour, a wax-sealed envelope, and the just-married car driving off at the end.
    'cathedral-garden': {
        cover: {
            variant: 'arch',
            enter: 'rise',
            scene: 'blush',
            motif: 'rose',
        },
        card: {
            variant: 'envelope',
            enter: 'rise',
            scene: 'watercolor',
            edge: 'lace',
        },
        countdown: {
            variant: 'line',
            enter: 'rise',
            scene: 'paper',
            edge: 'doves',
            edgeMotion: true,
        },
        welcome: {
            variant: 'editorial',
            enter: 'rise',
            scene: 'paper',
            edge: 'torn',
        },
        story: {
            variant: 'letter',
            enter: 'rise',
            scene: 'paper',
        },
        events: {
            variant: 'tickets',
            enter: 'drift',
            scene: 'watercolor',
            edge: 'lace',
            motif: 'olive',
        },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
            scene: 'paper',
            edge: 'torn',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'lace',
        },
        wishes: { scene: 'paper' },
        closing: {
            variant: 'monogram',
            enter: 'glow',
            scene: 'paper',
            edge: 'car',
            edgeMotion: true,
        },
    },
    // Ketubah paper: pomegranates, soft waves and lace, calm and luminous.
    chuppah: {
        cover: {
            variant: 'arch',
            enter: 'unfold',
            scene: 'paper',
            motif: 'pomegranate',
        },
        card: {
            variant: 'single',
            enter: 'unfold',
            scene: 'paper',
            edge: 'wave',
        },
        countdown: {
            variant: 'line',
            enter: 'rise',
            scene: 'blush',
            edge: 'scallop',
        },
        welcome: {
            variant: 'framed',
            enter: 'ink',
            scene: 'paper',
            edge: 'torn',
        },
        story: {
            variant: 'letter',
            enter: 'rise',
            scene: 'paper',
        },
        events: {
            variant: 'timeline',
            enter: 'rise',
            scene: 'watercolor',
            edge: 'lace',
            motif: 'olive',
        },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
            scene: 'paper',
            edge: 'torn',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'lace',
        },
        wishes: { scene: 'paper' },
        closing: {
            variant: 'blessing',
            enter: 'glow',
            scene: 'paper',
            motif: 'pomegranate',
            edge: 'doves',
            edgeMotion: true,
        },
    },
    // Magazine: one clean diagonal between spreads, a terrazzo story page, words that type themselves in.
    editorial: {
        cover: {
            variant: 'editorial',
            enter: 'wipe',
            scene: 'plain',
        },
        card: {
            variant: 'single',
            enter: 'rise',
            scene: 'plain',
            edge: 'slant',
        },
        countdown: {
            variant: 'line',
            enter: 'words',
            scene: 'plain',
            edge: 'none',
        },
        welcome: {
            variant: 'editorial',
            enter: 'wipe',
            scene: 'plain',
        },
        story: {
            variant: 'editorial',
            enter: 'words',
            scene: 'terrazzo',
            edge: 'slant',
        },
        events: {
            variant: 'tickets',
            enter: 'drift',
            scene: 'plain',
            edge: 'slant',
        },
        gallery: {
            variant: 'film',
            enter: 'rise',
            scene: 'plain',
            edge: 'none',
        },
        rsvp: {
            scene: 'plain',
            edge: 'slant',
        },
        wishes: {
            scene: 'plain',
            edge: 'none',
        },
        closing: {
            variant: 'blessing',
            enter: 'words',
            scene: 'plain',
            edge: 'rickshaw',
            edgeMotion: true,
        },
    },
    // Silk and thread: zari lace between blocks, embroidered roses, a card drawn from its envelope.
    resham: {
        cover: {
            variant: 'spotlight',
            enter: 'ink',
            scene: 'silk',
            motif: 'rose',
        },
        card: {
            variant: 'envelope',
            enter: 'rise',
            scene: 'silk',
            edge: 'lace',
        },
        countdown: {
            variant: 'rings',
            enter: 'rise',
            scene: 'blush',
            edge: 'scallop',
        },
        welcome: {
            variant: 'framed',
            enter: 'unfold',
            scene: 'paper',
            edge: 'lace',
        },
        story: {
            variant: 'letter',
            enter: 'rise',
            scene: 'paper',
            edge: 'torn',
        },
        events: {
            variant: 'arches',
            enter: 'rise',
            scene: 'blush',
            edge: 'lace',
            motif: 'rose',
        },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
            scene: 'paper',
            edge: 'torn',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'seam',
        },
        wishes: {
            scene: 'paper',
            edge: 'torn',
        },
        closing: {
            variant: 'monogram',
            enter: 'glow',
            scene: 'silk',
            motif: 'rose',
            edge: 'bagghi',
            edgeMotion: true,
        },
    },
    // Prayer meet: still paper, a lotus border at the close and only gentle ink entrances.
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
            edge: 'none',
        },
        story: {
            variant: 'editorial',
            enter: 'rise',
            scene: 'paper',
            edge: 'torn',
            motif: 'leaf',
        },
        events: {
            variant: 'timeline',
            enter: 'rise',
            scene: 'plain',
            edge: 'torn',
        },
        gallery: {
            variant: 'grid',
            enter: 'ink',
            scene: 'paper',
            edge: 'torn',
        },
        family: {
            variant: 'framed',
            enter: 'ink',
            scene: 'paper',
        },
        wishes: {
            enter: 'rise',
            scene: 'plain',
            edge: 'none',
        },
        closing: {
            variant: 'blessing',
            enter: 'ink',
            scene: 'paper',
            edge: 'lotus',
            motif: 'lotus',
        },
    },
    // Remembrance: indigo night and a lamp's glow; soft waves, never anything that bounces.
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
            edge: 'none',
        },
        story: {
            variant: 'centered',
            enter: 'glow',
            scene: 'night',
            edge: 'wave',
        },
        events: {
            variant: 'timeline',
            enter: 'rise',
            scene: 'velvet',
            edge: 'wave',
        },
        gallery: {
            variant: 'grid',
            enter: 'ink',
            scene: 'night',
            edge: 'none',
        },
        family: {
            variant: 'centered',
            enter: 'ink',
            scene: 'velvet',
            edge: 'none',
        },
        wishes: {
            enter: 'rise',
            scene: 'night',
            edge: 'none',
        },
        closing: {
            variant: 'blessing',
            enter: 'glow',
            scene: 'night',
            edge: 'wave',
            motif: 'diya',
        },
    },
    // A plain tribute: white space, torn paper and a dove at the close.
    smriti: {
        cover: {
            variant: 'editorial',
            enter: 'ink',
            scene: 'plain',
            motif: 'olive',
        },
        welcome: {
            variant: 'editorial',
            enter: 'ink',
            scene: 'plain',
        },
        events: {
            variant: 'timeline',
            enter: 'rise',
            scene: 'paper',
            edge: 'torn',
        },
        family: {
            variant: 'editorial',
            enter: 'ink',
            scene: 'plain',
            edge: 'torn',
        },
        wishes: {
            enter: 'rise',
            scene: 'plain',
            edge: 'none',
        },
        closing: {
            variant: 'blessing',
            enter: 'ink',
            scene: 'plain',
            edge: 'torn',
            motif: 'dove',
        },
    },
    // Moonlight for a little one: clouds that drift between blocks, crescent moons and butterflies.
    chandni: {
        cover: {
            variant: 'monogram',
            enter: 'bloom',
            scene: 'night',
            motif: 'moon',
        },
        card: {
            variant: 'envelope',
            enter: 'rise',
            scene: 'blush',
            edge: 'cloud',
            edgeMotion: true,
        },
        countdown: {
            variant: 'rings',
            enter: 'pop',
            scene: 'paper',
            edge: 'stork',
            edgeMotion: true,
        },
        welcome: {
            variant: 'centered',
            enter: 'bloom',
            scene: 'blush',
            edge: 'none',
            motif: 'butterfly',
        },
        events: {
            variant: 'stack',
            enter: 'rise',
            scene: 'paper',
            edge: 'cloud',
        },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
            scene: 'blush',
            edge: 'scallop',
        },
        rsvp: {
            scene: 'night',
            edge: 'cloud',
            motif: 'moon',
        },
        wishes: {
            scene: 'paper',
            edge: 'cloud',
        },
        closing: {
            variant: 'monogram',
            enter: 'glow',
            scene: 'night',
            edge: 'cloud',
            edgeMotion: true,
            motif: 'moon',
        },
    },
    // Baby shower: soft clouds, watercolour and confetti, butterflies and a gift that unwraps.
    palna: {
        cover: {
            variant: 'arch',
            enter: 'bloom',
            scene: 'blush',
            motif: 'butterfly',
        },
        card: {
            variant: 'stack',
            enter: 'tilt',
            scene: 'watercolor',
            edge: 'stork',
            edgeMotion: true,
        },
        countdown: {
            variant: 'line',
            enter: 'pop',
            scene: 'paper',
            edge: 'scallop',
        },
        welcome: {
            variant: 'framed',
            enter: 'bloom',
            scene: 'paper',
            edge: 'cloud',
        },
        events: {
            variant: 'tickets',
            enter: 'drift',
            scene: 'blush',
            edge: 'scallop',
            motif: 'butterfly',
        },
        gallery: {
            variant: 'polaroid',
            enter: 'pop',
            scene: 'paper',
            edge: 'cloud',
        },
        rsvp: {
            scene: 'watercolor',
            edge: 'cloud',
        },
        wishes: {
            scene: 'paper',
            edge: 'scallop',
        },
        closing: {
            variant: 'blessing',
            enter: 'bloom',
            scene: 'confetti',
            edge: 'cloud',
            edgeMotion: true,
            motif: 'heart',
        },
    },
    // New home: the front door opens, a mandap swag hangs over each block, and a rangoli waits at the threshold.
    griha: {
        cover: {
            variant: 'arch',
            enter: 'curtain',
            scene: 'silk',
            motif: 'marigold',
        },
        card: {
            variant: 'envelope',
            enter: 'rise',
            scene: 'silk',
            edge: 'swag',
        },
        countdown: {
            variant: 'flip',
            enter: 'rise',
            scene: 'jacquard',
            edge: 'cusped',
            motif: 'kalash',
        },
        welcome: {
            variant: 'framed',
            enter: 'unfold',
            scene: 'paper',
            edge: 'seam',
        },
        events: {
            variant: 'stack',
            enter: 'rise',
            scene: 'silk',
            edge: 'cusped',
            motif: 'kalash',
        },
        gallery: {
            variant: 'film',
            enter: 'rise',
            scene: 'jacquard',
            edge: 'seam',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'swag',
        },
        wishes: {
            scene: 'paper',
            edge: 'torn',
        },
        closing: {
            variant: 'rangoli',
            enter: 'glow',
            scene: 'silk',
            edge: 'swag',
            edgeMotion: true,
        },
    },
    // Party: confetti everywhere, playful pop entrances and wavy, pinked edges.
    utsav: {
        cover: {
            variant: 'editorial',
            enter: 'pop',
            scene: 'confetti',
            motif: 'balloons',
        },
        card: {
            variant: 'single',
            enter: 'pop',
            scene: 'confetti',
            edge: 'wave',
            edgeMotion: true,
        },
        countdown: {
            variant: 'flip',
            enter: 'pop',
            scene: 'plain',
            motif: 'confetti',
            edge: 'balloons',
            edgeMotion: true,
        },
        welcome: {
            variant: 'centered',
            enter: 'words',
            scene: 'confetti',
            edge: 'wave',
        },
        events: {
            variant: 'tickets',
            enter: 'swing',
            scene: 'terrazzo',
            edge: 'pinking',
            motif: 'balloons',
        },
        gallery: {
            variant: 'polaroid',
            enter: 'pop',
            scene: 'confetti',
            edge: 'wave',
        },
        rsvp: {
            scene: 'aurora',
            edge: 'wave',
            edgeMotion: true,
        },
        wishes: {
            scene: 'plain',
            edge: 'pinking',
        },
        closing: {
            variant: 'blessing',
            enter: 'pop',
            scene: 'confetti',
            edge: 'wave',
            edgeMotion: true,
            motif: 'confetti',
        },
    },
    // A life's work: art-deco steps between chapters, a note from the family, navy and brass.
    legacy: {
        cover: {
            variant: 'monogram',
            enter: 'rise',
            scene: 'velvet',
            motif: 'olive',
        },
        card: {
            variant: 'single',
            enter: 'unfold',
            scene: 'paper',
            edge: 'deco',
        },
        countdown: {
            variant: 'line',
            enter: 'words',
            scene: 'night',
            edge: 'deco',
        },
        welcome: {
            variant: 'editorial',
            enter: 'words',
            scene: 'velvet',
            edge: 'deco',
        },
        story: {
            variant: 'letter',
            enter: 'rise',
            scene: 'paper',
            edge: 'torn',
        },
        events: {
            variant: 'timeline',
            enter: 'rise',
            scene: 'velvet',
            edge: 'deco',
        },
        gallery: {
            variant: 'film',
            enter: 'rise',
            scene: 'night',
            edge: 'deco',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'deco',
        },
        wishes: {
            scene: 'paper',
            edge: 'torn',
        },
        closing: {
            variant: 'monogram',
            enter: 'glow',
            scene: 'velvet',
            edge: 'deco',
        },
    },
    // Puja at home: ring the ghanti, marigold swags, a diya on every arch and a rangoli at the end.
    aarti: {
        cover: {
            variant: 'spotlight',
            enter: 'glow',
            scene: 'silk',
            motif: 'diya',
        },
        welcome: {
            variant: 'framed',
            enter: 'ink',
            scene: 'jacquard',
            edge: 'cusped',
            motif: 'marigold',
        },
        events: {
            variant: 'stack',
            enter: 'rise',
            scene: 'silk',
            edge: 'swag',
            motif: 'diya',
        },
        rsvp: {
            scene: 'jacquard',
            edge: 'cusped',
            motif: 'marigold',
        },
        closing: {
            variant: 'rangoli',
            enter: 'glow',
            scene: 'silk',
            edge: 'swag',
            edgeMotion: true,
        },
    },
    // Sanskar: a lotus that blooms open, a kalash on every arch, lotus petals between blocks.
    mangal: {
        cover: {
            variant: 'arch',
            enter: 'unfold',
            scene: 'jacquard',
            motif: 'kalash',
        },
        card: {
            variant: 'envelope',
            enter: 'rise',
            scene: 'paper',
            edge: 'lotus',
        },
        countdown: {
            variant: 'rings',
            enter: 'rise',
            scene: 'paper',
            edge: 'lotus',
        },
        welcome: {
            variant: 'framed',
            enter: 'unfold',
            scene: 'paper',
            edge: 'none',
            motif: 'lotus',
        },
        events: {
            variant: 'stack',
            enter: 'rise',
            scene: 'jacquard',
            edge: 'cusped',
            motif: 'kalash',
        },
        gallery: {
            variant: 'polaroid',
            enter: 'bloom',
            scene: 'paper',
            edge: 'torn',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'swag',
        },
        wishes: { scene: 'paper' },
        closing: {
            variant: 'rangoli',
            enter: 'glow',
            scene: 'jacquard',
            edge: 'lotus',
        },
    },
    // Launch night: hyperspace in, aurora glow and sharp diagonal cuts.
    summit: {
        cover: {
            variant: 'editorial',
            enter: 'wipe',
            scene: 'night',
            motif: 'spark',
        },
        countdown: {
            variant: 'line',
            enter: 'words',
            scene: 'aurora',
            edge: 'slant',
        },
        welcome: {
            variant: 'editorial',
            enter: 'wipe',
            scene: 'plain',
            edge: 'none',
        },
        events: {
            variant: 'tickets',
            enter: 'drift',
            scene: 'night',
            edge: 'slant',
            motif: 'spark',
        },
        rsvp: {
            scene: 'plain',
            edge: 'slant',
        },
        closing: {
            variant: 'blessing',
            enter: 'glow',
            scene: 'aurora',
            edge: 'slant',
            motif: 'spark',
        },
    },
    phoolwari: {
        cover: {
            variant: 'garden',
            enter: 'none',
            scene: 'plain',
            edge: 'none',
        },
        // The Library's "A note from us": the letter on torn paper with polaroids.
        story: {
            variant: 'letter',
            scene: 'paper',
            edge: 'none',
        },
        // The card comes out of its envelope under a night sky, the baraat ghodi trotting along the top.
        card: {
            variant: 'envelope',
            scene: 'night',
            edge: 'ghodi',
            edgeMotion: true,
        },
        countdown: {
            variant: 'line',
            scene: 'silk',
            motif: 'paisley',
            edge: 'scallop',
        },
        family: {
            variant: 'blessings',
            scene: 'blush',
            edge: 'none',
        },
        gallery: {
            variant: 'polaroid',
            scene: 'blush',
            edge: 'none',
        },
        // The vidaai car drives along the foot of the countdown, into the ceremonies.
        events: {
            variant: 'wardrobe',
            enter: 'none',
            scene: 'plain',
            edge: 'car',
            edgeMotion: true,
        },
        rsvp: {
            scene: 'blush',
            edge: 'none',
        },
        wishes: {
            scene: 'plain',
            edge: 'none',
        },
    },
    mehfil: {
        cover: {
            variant: 'photo',
            scene: 'velvet',
        },
        // A boxed suite of deckled cards: foil-stamped monogram, names written in ink.
        card: {
            variant: 'suite',
            scene: 'velvet',
        },
        countdown: {
            variant: 'line',
            scene: 'blush',
        },
        welcome: {
            variant: 'centered',
            enter: 'ink',
            scene: 'blush',
        },
        events: {
            variant: 'stack',
            scene: 'blush',
            edge: 'dhol',
            edgeMotion: true,
        },
        // The couple introduced as a magazine feature: two arched portraits that part like doors.
        story: {
            variant: 'portraits',
            scene: 'blush',
            edge: 'lace',
        },
        family: {
            variant: 'blessings',
            scene: 'blush',
        },
        gallery: {
            variant: 'polaroid',
            scene: 'blush',
        },
        closing: {
            variant: 'rangoli',
            scene: 'blush',
            edge: 'doli',
            edgeMotion: true,
        },
    },
};

Object.assign(themeLayouts, luxuryLayouts);
