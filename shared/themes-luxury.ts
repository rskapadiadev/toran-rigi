// The luxury collection: wedding designs built on the luxury library (src/invitation/luxury) and
// on openings no other template uses, so every piece of the library is seen in the shop.
import type { BlockPreset } from './blocks';
import type { ThemeDefinition } from './themes';
import type { InvitationDesign } from './types';

type Palette = InvitationDesign['palette'];

interface Spec {
    slug: string;
    name: string;
    culture: ThemeDefinition['culture'];
    category: ThemeDefinition['category'];
    description: string;
    palette: Palette;
    display: string;
    body: string;
    opening: InvitationDesign['opening'];
    generative: InvitationDesign['generative']['kind'];
    texture: InvitationDesign['texture'];
    titles?: InvitationDesign['titles'];
    film?: InvitationDesign['film'];
}

const theme = (s: Spec): ThemeDefinition => ({
    slug: s.slug,
    name: s.name,
    culture: s.culture,
    category: s.category,
    description: s.description,
    suits: ['celebrations'],
    fromPackage: 'premium',
    featured: true,
    design: {
        palette: s.palette,
        fonts: {
            display: s.display,
            body: s.body,
            script: 'pinyon',
        },
        opening: s.opening,
        generative: {
            kind: s.generative,
            density: 0.6,
        },
        texture: s.texture,
        motion: 'cinematic',
        ...(s.titles && { titles: s.titles }),
        ...(s.film && { film: s.film }),
    },
});

// Deepmala's film cut into frames (scripts/dev/films/render.mjs deepmala --frames).
const yatraFrames = {
    sheets: Array.from(
        { length: 15 },
        (_, s) => `/kits/deepmala/frames/sheet-${String(s).padStart(3, '0')}.webp`,
    ),
    fps: 15,
    count: 135,
    cols: 3,
    rows: 3,
    width: 540,
    height: 960,
};

export const luxuryThemes: ThemeDefinition[] = [
    theme({
        slug: 'sitara',
        name: 'Sitara',
        culture: 'hindu',
        category: 'luxury',
        description:
            'Midnight and gold, like a film premiere: the two of you greet guests in arched portraits, your names fill the screen with your photo inside them, and a suite of cards is dealt in.',
        palette: {
            bg: '#11131f',
            surface: '#1b1e30',
            ink: '#f3ead8',
            muted: '#a9a28f',
            primary: '#1d2550',
            accent: '#7a2440',
            gold: '#d4ad5c',
        },
        display: 'cinzel',
        body: 'cormorant',
        opening: 'portraits',
        generative: 'constellation',
        texture: 'silk',
    }),
    theme({
        slug: 'heera',
        name: 'Heera',
        culture: 'hindu',
        category: 'royal',
        description:
            'Emerald lacquer and gold: guests lift the lid of a jewellery box, the card rises from the velvet, and a gaj yatra elephant carries the ceremonies in.',
        palette: {
            bg: '#f4efe4',
            surface: '#fbf7ee',
            ink: '#1d2a22',
            muted: '#5d6b61',
            primary: '#0f5a46',
            accent: '#8a1c32',
            gold: '#c39a45',
        },
        display: 'marcellus',
        body: 'cormorant',
        opening: 'jewellery-box',
        generative: 'mandala',
        texture: 'silk',
    }),
    theme({
        slug: 'patra',
        name: 'Patra',
        culture: 'universal',
        category: 'luxury',
        description:
            'A letter sealed in oxblood wax: press and hold to break it, the card slides out under vellum, and your story is set like an illuminated manuscript.',
        palette: {
            bg: '#f5efe3',
            surface: '#fbf8f0',
            ink: '#2a1c18',
            muted: '#6e5d54',
            primary: '#5b1622',
            accent: '#9c3b2e',
            gold: '#b8924a',
        },
        display: 'cormorant',
        body: 'cormorant',
        opening: 'sealed-letter',
        generative: 'ketubah',
        texture: 'paper',
    }),
    theme({
        slug: 'roshni',
        name: 'Roshni',
        culture: 'hindu',
        category: 'traditional',
        description:
            'A dark room and one brass lamp: guests pull its cord, the bulb glows, and the invitation opens in warm light, with dhol and bhangra leading the ceremonies.',
        palette: {
            bg: '#f6eddc',
            surface: '#fdf6e8',
            ink: '#2b1d12',
            muted: '#6f5b45',
            primary: '#0e4d57',
            accent: '#d9822b',
            gold: '#d1a24b',
        },
        display: 'fraunces',
        body: 'cormorant',
        opening: 'light-pull',
        generative: 'sunburst',
        texture: 'linen',
    }),
    theme({
        slug: 'sona',
        name: 'Sona',
        culture: 'universal',
        category: 'modern',
        description:
            'Black and gold, sharp and modern: guests scratch away the gold foil to find your names, then a love story with a heartbeat running through it.',
        palette: {
            bg: '#0e0d0c',
            surface: '#1a1816',
            ink: '#f2ead9',
            muted: '#a39a8a',
            primary: '#2a2621',
            accent: '#b8862c',
            gold: '#e0b860',
        },
        display: 'cinzel',
        body: 'manrope',
        opening: 'scratch',
        generative: 'opart',
        texture: 'none',
    }),
    theme({
        slug: 'zari',
        name: 'Zari',
        culture: 'hindu',
        category: 'luxury',
        description:
            'Ivory silk and rose-gold thread: guests draw a gold zip down the silk, then a foil-stamped suite of cards and a welcome set like a manuscript.',
        palette: {
            bg: '#f7efe9',
            surface: '#fdf8f4',
            ink: '#3a2420',
            muted: '#7d6660',
            primary: '#9b4a5a',
            accent: '#c77d6b',
            gold: '#c9976a',
        },
        display: 'cormorant',
        body: 'cormorant',
        opening: 'zipper',
        generative: 'botanical',
        texture: 'silk',
    }),
    theme({
        slug: 'kagaz',
        name: 'Kagaz',
        culture: 'universal',
        category: 'minimal',
        description:
            'Handmade sage paper folded like origami: a square opens flap by flap, then soft tickets and waves for a light, modern celebration.',
        palette: {
            bg: '#eef0e8',
            surface: '#f8f9f4',
            ink: '#24302a',
            muted: '#66726b',
            primary: '#4f6b5a',
            accent: '#c98b6b',
            gold: '#b59a5a',
        },
        display: 'fraunces',
        body: 'manrope',
        opening: 'origami',
        generative: 'truchet',
        texture: 'paper',
    }),
    theme({
        slug: 'deepam',
        name: 'Deepam',
        culture: 'hindu',
        category: 'cultural',
        description:
            'A temple wedding in maroon, gold and banana-leaf green: guests blow (or hold) to light a brass diya, then lotus borders and a thread of ceremonies.',
        palette: {
            bg: '#f7efdc',
            surface: '#fdf7e8',
            ink: '#2c1a10',
            muted: '#6d5640',
            primary: '#6e1423',
            accent: '#2f6b2f',
            gold: '#d2a03c',
        },
        display: 'marcellus',
        body: 'cormorant',
        opening: 'diya',
        generative: 'lotus',
        texture: 'silk',
    }),
    theme({
        slug: 'deepmala',
        name: 'Deepmala',
        culture: 'hindu',
        category: 'luxury',
        description:
            'A night of a thousand diyas: a short film lights the ghats and your names rise into the sky, then every page is handmade midnight paper with gold script and lamps that light as guests scroll.',
        palette: {
            bg: '#0e1838',
            surface: '#152150',
            ink: '#f4e9d2',
            muted: '#b8ac93',
            primary: '#e0b867',
            accent: '#9c3b3b',
            gold: '#d9b36a',
        },
        display: 'cormorant',
        body: 'cormorant',
        opening: 'film',
        generative: 'lotus',
        texture: 'paper',
        titles: 'script',
        // Our own illustrated film (scripts/dev/films/deepmala), shipped with the app.
        film: {
            src: '/kits/deepmala/film.mp4',
            first: '/kits/deepmala/film-first.webp',
            last: '/kits/deepmala/film-last.webp',
            namesAt: 4.6,
        },
    }),
    theme({
        slug: 'deepmala-yatra',
        name: 'Deepmala Yatra',
        culture: 'hindu',
        category: 'luxury',
        description:
            'The Deepmala film plays behind the whole invitation: scroll and the ghats light, fireworks rise beside your names, and every page rests on its own moment of the night.',
        palette: {
            bg: '#0e1838',
            surface: '#152150',
            ink: '#f4e9d2',
            muted: '#b8ac93',
            primary: '#e0b867',
            accent: '#9c3b3b',
            gold: '#d9b36a',
        },
        display: 'cormorant',
        body: 'cormorant',
        opening: 'film',
        generative: 'lotus',
        texture: 'paper',
        titles: 'script',
        // Frames cut by scripts/dev/films/render.mjs deepmala --frames.
        film: {
            src: '/kits/deepmala/film.mp4',
            first: '/kits/deepmala/film-first.webp',
            last: '/kits/deepmala/film-last.webp',
            namesAt: 4.6,
            behind: true,
            frames: yatraFrames,
            // The night on the ghats, then through the haveli's lit central door into its courtyard.
            scenes: [
                {
                    kind: 'film',
                    frames: yatraFrames,
                    exit: 'zoom',
                    portal: {
                        x: 0.5,
                        y: 0.528,
                        zoom: 7,
                    },
                },
                {
                    kind: 'still',
                    image: '/kits/deepmala-mandap/still.webp',
                    length: 4,
                    camera: 'push',
                },
            ],
            // Words in the stretches where the screen holds only the film.
            moments: [
                {
                    text: {
                        en: 'A night of a thousand diyas',
                        hi: 'हज़ार दीयों की एक रात',
                    },
                    from: 5.6,
                    to: 6.45,
                    zone: {
                        x: 0.5,
                        y: 0.14,
                        w: 0.8,
                    },
                    style: 'line',
                },
                {
                    text: {
                        en: 'Two families, one light',
                        hi: 'दो परिवार, एक रोशनी',
                    },
                    from: 7.6,
                    to: 8.15,
                    zone: {
                        x: 0.5,
                        y: 0.17,
                        w: 0.9,
                    },
                    style: 'script',
                },
                {
                    text: {
                        en: 'Come inside',
                        hi: 'अंदर आइए',
                    },
                    from: 9.2,
                    to: 10.45,
                    zone: {
                        x: 0.5,
                        y: 0.1,
                        w: 0.8,
                    },
                    style: 'kicker',
                },
            ],
        },
    }),
];

// Every Deepmala page sits on the same midnight paper, so no seams are drawn between them.
const night = {
    scene: 'midnight',
    edge: 'none',
    divider: 'diya',
} as const;

// Over the film every section is see-through; filmAt is the moment each chapter holds on: the cover
// on the haveli fully lit, the date on the fireworks, the story on the calm last frame, and the
// replies in the courtyard the camera flies into.
const overFilm = {
    scene: 'film',
    edge: 'none',
    divider: 'diya',
} as const;

export const luxuryLayouts: Record<string, BlockPreset> = {
    'deepmala-yatra': {
        cover: {
            variant: 'film',
            scene: 'film',
            filmAt: 5.4,
        },
        // Fireworks beside the names.
        date: {
            ...overFilm,
            filmAt: 6.6,
        },
        blessing: {
            ...overFilm,
            filmAt: 7.5,
        },
        card: {
            ...overFilm,
            variant: 'night',
        },
        // The calm last frame holds for the rest of the invitation.
        welcome: {
            ...overFilm,
            variant: 'centered',
            filmAt: 8.2,
        },
        story: {
            ...overFilm,
            variant: 'centered',
        },
        family: {
            ...overFilm,
            variant: 'centered',
        },
        events: {
            ...overFilm,
            variant: 'pavilions',
        },
        countdown: {
            ...overFilm,
            variant: 'diyas',
        },
        gallery: {
            ...overFilm,
            variant: 'masks',
        },
        venue: overFilm,
        dressCode: overFilm,
        travel: overFilm,
        // Through the door: replies, blessings and the farewell in the mandap courtyard.
        rsvp: {
            ...overFilm,
            filmAt: 10.6,
        },
        wishes: {
            ...overFilm,
            variant: 'default',
        },
        closing: {
            ...overFilm,
            variant: 'rangoli',
        },
    },
    deepmala: {
        cover: {
            variant: 'film',
            scene: 'midnight',
        },
        card: {
            ...night,
            variant: 'night',
        },
        countdown: {
            ...night,
            variant: 'diyas',
        },
        welcome: {
            ...night,
            variant: 'centered',
        },
        story: {
            ...night,
            variant: 'centered',
        },
        family: {
            ...night,
            variant: 'centered',
        },
        events: {
            ...night,
            variant: 'pavilions',
        },
        gallery: {
            ...night,
            variant: 'masks',
        },
        blessing: night,
        date: night,
        venue: night,
        dressCode: night,
        travel: night,
        rsvp: night,
        wishes: {
            ...night,
            variant: 'default',
        },
        closing: {
            ...night,
            variant: 'rangoli',
        },
    },
    sitara: {
        cover: {
            variant: 'premiere',
            scene: 'night',
        },
        card: {
            variant: 'suite',
            scene: 'night',
        },
        welcome: {
            variant: 'illuminated',
            scene: 'night',
        },
        story: {
            variant: 'letter',
            scene: 'paper',
            edge: 'torn',
        },
        events: {
            variant: 'stack',
            scene: 'night',
            edge: 'bagghi',
            edgeMotion: true,
        },
        gallery: {
            scene: 'night',
            variant: 'reel',
        },
        rsvp: { scene: 'velvet' },
        closing: {
            variant: 'rangoli',
            scene: 'night',
            edge: 'doli',
            edgeMotion: true,
        },
    },
    heera: {
        cover: {
            variant: 'arch',
            enter: 'curtain',
            scene: 'silk',
            motif: 'peacock',
        },
        card: {
            variant: 'suite',
            scene: 'velvet',
        },
        countdown: {
            scene: 'jacquard',
            edge: 'cusped',
            variant: 'calendar',
        },
        welcome: {
            variant: 'framed',
            scene: 'paper',
        },
        family: {
            variant: 'illuminated',
            scene: 'paper',
        },
        story: {
            variant: 'portraits',
            scene: 'blush',
        },
        events: {
            variant: 'stack',
            scene: 'silk',
            edge: 'elephant',
            edgeMotion: true,
        },
        gallery: {
            variant: 'polaroid',
            scene: 'paper',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'swag',
        },
        closing: {
            variant: 'monogram',
            scene: 'silk',
            edge: 'cusped',
        },
        wishes: { variant: 'wall' },
    },
    patra: {
        cover: {
            variant: 'letterpress',
            enter: 'ink',
            scene: 'paper',
            motif: 'rose',
        },
        card: {
            variant: 'single',
            scene: 'paper',
            edge: 'torn',
        },
        welcome: {
            variant: 'illuminated',
            scene: 'blush',
        },
        story: {
            variant: 'illuminated',
            scene: 'paper',
        },
        family: {
            variant: 'illuminated',
            scene: 'paper',
        },
        events: {
            variant: 'timeline',
            scene: 'blush',
            edge: 'arch',
        },
        gallery: {
            variant: 'polaroid',
            scene: 'paper',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'lace',
        },
        closing: {
            variant: 'monogram',
            scene: 'paper',
            edge: 'doves',
            edgeMotion: true,
        },
    },
    roshni: {
        cover: {
            variant: 'monogram',
            enter: 'glow',
            scene: 'silk',
            motif: 'diya',
        },
        card: {
            variant: 'envelope',
            scene: 'velvet',
        },
        welcome: {
            variant: 'illuminated',
            scene: 'petals',
        },
        story: {
            variant: 'portraits',
            scene: 'blush',
        },
        countdown: {
            variant: 'rings',
            scene: 'leheriya',
            edge: 'scallop',
        },
        events: {
            variant: 'arches',
            scene: 'silk',
            edge: 'dhol',
            edgeMotion: true,
        },
        gallery: {
            variant: 'masks',
            scene: 'petals',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'swag',
        },
        closing: {
            variant: 'rangoli',
            scene: 'silk',
            edge: 'kites',
            edgeMotion: true,
        },
    },
    sona: {
        cover: {
            variant: 'editorial',
            enter: 'wipe',
            scene: 'plain',
        },
        card: {
            variant: 'single',
            scene: 'plain',
            edge: 'slant',
        },
        countdown: {
            variant: 'flip',
            scene: 'aurora',
            edge: 'heartbeat',
            edgeMotion: true,
        },
        welcome: {
            variant: 'editorial',
            scene: 'plain',
        },
        story: {
            variant: 'framed',
            edge: 'heartbeat',
            edgeMotion: true,
            scene: 'rays',
        },
        events: {
            variant: 'tickets',
            scene: 'plain',
            edge: 'slant',
        },
        gallery: {
            scene: 'plain',
            variant: 'masks',
        },
        rsvp: {
            scene: 'aurora',
            edge: 'slant',
        },
        closing: {
            variant: 'blessing',
            scene: 'plain',
            edge: 'rickshaw',
            edgeMotion: true,
        },
    },
    zari: {
        cover: {
            variant: 'spotlight',
            enter: 'glow',
            scene: 'silk',
            motif: 'rose',
        },
        card: {
            variant: 'suite',
            scene: 'blush',
        },
        welcome: {
            variant: 'illuminated',
            scene: 'paper',
            edge: 'lace',
        },
        story: {
            scene: 'paper',
            variant: 'chapters',
        },
        events: {
            variant: 'stack',
            scene: 'blush',
            edge: 'lace',
        },
        gallery: {
            variant: 'polaroid',
            scene: 'paper',
        },
        rsvp: {
            scene: 'velvet',
            edge: 'lace',
        },
        closing: {
            variant: 'monogram',
            scene: 'silk',
            edge: 'bagghi',
            edgeMotion: true,
        },
        wishes: { variant: 'wall' },
    },
    kagaz: {
        cover: {
            variant: 'calligraphy',
            enter: 'unfold',
            scene: 'paper',
            motif: 'leaf',
        },
        card: {
            variant: 'stack',
            scene: 'paper',
            edge: 'wave',
        },
        countdown: {
            variant: 'line',
            scene: 'watercolor',
            edge: 'wave',
        },
        welcome: {
            variant: 'centered',
            scene: 'paper',
        },
        story: {
            variant: 'framed',
            scene: 'watercolor',
            edge: 'torn',
        },
        events: {
            variant: 'tickets',
            scene: 'paper',
            edge: 'pinking',
        },
        gallery: {
            variant: 'grid',
            scene: 'paper',
        },
        rsvp: {
            scene: 'watercolor',
            edge: 'wave',
        },
        closing: {
            variant: 'blessing',
            scene: 'paper',
            edge: 'balloons',
            edgeMotion: true,
        },
    },
    deepam: {
        cover: {
            variant: 'arch',
            enter: 'glow',
            scene: 'silk',
            motif: 'kalash',
        },
        card: {
            variant: 'single',
            scene: 'jacquard',
            edge: 'lotus',
        },
        countdown: {
            scene: 'paper',
            edge: 'lotus',
            variant: 'calendar',
        },
        welcome: {
            variant: 'framed',
            scene: 'paper',
            motif: 'lotus',
        },
        events: {
            variant: 'timeline',
            scene: 'silk',
            edge: 'lotus',
            motif: 'diya',
        },
        gallery: {
            variant: 'grid',
            scene: 'paper',
        },
        rsvp: {
            scene: 'jacquard',
            edge: 'cusped',
        },
        closing: {
            variant: 'rangoli',
            scene: 'silk',
            edge: 'elephant',
            edgeMotion: true,
        },
    },
};
