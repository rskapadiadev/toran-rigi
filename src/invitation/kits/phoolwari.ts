// Phoolwari ("flower garden"): hand-illustrated artwork (Ganesha, monogram, meadow, stages, guests)
// staged as a web experience. Each ceremony scene keeps the artist's composition (layer positions
// in percent of the original illustration) so layers can move on their own: the stage rises, guests
// step in one by one, flowers grow. Artwork lives in public/kits/phoolwari (trimmed, transparent WebP).

export const KIT = '/kits/phoolwari';

// The pages are 843.75 × 1827 points; everything below is measured on that page.
export const PAGE_RATIO = 843.75 / 1827;

export interface Layer {
    src: string;
    x: number;
    y: number;
    w: number;
    // How the layer arrives as the page scrolls in.
    from: 'rise' | 'left' | 'right' | 'grow' | 'still' | 'drop';
    // Arrival order within the scene (0 first).
    order: number;
    // Gentle loop once in place.
    sway?: boolean;
    // Layers nearer the guest move a little more while scrolling.
    depth?: number;
}

export type Ambient = 'marigold' | 'sparkle' | 'glow' | 'lotus' | 'butterflies';

export interface WardrobePage {
    // Text colour of this scene, and a soft tint for dates and ornaments.
    ink: string;
    tint: string;
    // The scene's colour world (CSS background) and whether text sits on a dark sky.
    sky: string;
    dark: boolean;
    layers: Layer[];
    ambient: Ambient;
    // Moving party lights over the scene: beams from above and spots sweeping the floor.
    lights?: boolean;
}

const at = (name: string) => `${KIT}/${name}.webp`;

export const coverPage = {
    ink: '#a3164f',
    ganesha: at('ganesha'),
    monogram: at('monogram-ds'),
    meadow: at('meadow'),
    floraLeft: at('flora-left'),
    floraRight: at('flora-right'),
    sprig: at('sprig'),
};

const haldi: WardrobePage = {
    ink: '#3f1a5e',
    tint: '#c99a1d',
    // Morning sun over powder blue.
    sky: 'radial-gradient(120% 60% at 50% 0%, #fff4c7 0%, rgba(255,244,199,0) 60%), linear-gradient(180deg, #fffaf0 0%, #fdeec2 40%, #dbe8f7 100%)',
    dark: false,
    ambient: 'marigold',
    layers: [
        {
            src: at('haldi-stage'),
            x: -15.7,
            y: 45.41,
            w: 130.31,
            from: 'rise',
            order: 0,
        },
        {
            src: at('haldi-1'),
            x: 10.11,
            y: 62.65,
            w: 23.08,
            from: 'left',
            order: 2,
            depth: 1,
        },
        {
            src: at('haldi-2'),
            x: 21.11,
            y: 64.04,
            w: 35.63,
            from: 'rise',
            order: 3,
            depth: 1,
        },
        {
            src: at('haldi-3'),
            x: 38.3,
            y: 63.98,
            w: 40.97,
            from: 'rise',
            order: 4,
            depth: 1,
        },
        {
            src: at('haldi-4'),
            x: 61.34,
            y: 62.44,
            w: 25.77,
            from: 'right',
            order: 2,
            depth: 1,
        },
        {
            src: at('haldi-leaves'),
            x: -17.1,
            y: 72.09,
            w: 104.33,
            from: 'grow',
            order: 1,
            sway: true,
            depth: 2,
        },
        {
            src: at('haldi-leaves'),
            x: 9.25,
            y: 72.09,
            w: 104.33,
            from: 'grow',
            order: 1,
            sway: true,
            depth: 2,
        },
    ],
};

const sangeet: WardrobePage = {
    ink: '#f4efff',
    tint: '#c9d4ff',
    // Moonlit night: a pale moon high on the right, the sky deepening to indigo.
    sky: 'radial-gradient(circle 44px at 9% 4.5%, #fffdf2 0%, #f3edd0 55%, rgba(243,237,208,0) 100%), radial-gradient(80% 50% at 9% 4%, rgba(140,160,230,0.35) 0%, rgba(140,160,230,0) 70%), linear-gradient(180deg, #0b1230 0%, #18245a 55%, #34488a 100%)',
    dark: true,
    ambient: 'sparkle',
    lights: true,
    layers: [
        {
            src: at('sangeet-stage'),
            x: 14.94,
            y: 41.4,
            w: 70.13,
            from: 'drop',
            order: 0,
        },
        {
            src: at('sangeet-1'),
            x: 14.12,
            y: 65.15,
            w: 21.17,
            from: 'left',
            order: 2,
            depth: 1,
        },
        {
            src: at('sangeet-2'),
            x: 21.73,
            y: 65.66,
            w: 37.36,
            from: 'rise',
            order: 3,
            depth: 1,
        },
        {
            src: at('sangeet-3'),
            x: 45.11,
            y: 65.44,
            w: 35.23,
            from: 'rise',
            order: 4,
            depth: 1,
        },
        {
            src: at('sangeet-4'),
            x: 65.28,
            y: 64.93,
            w: 19.58,
            from: 'right',
            order: 2,
            depth: 1,
        },
        {
            src: at('wildflowers'),
            x: 5.52,
            y: 83.26,
            w: 45.3,
            from: 'grow',
            order: 1,
            sway: true,
            depth: 2,
        },
        {
            src: at('wildflowers'),
            x: 46.01,
            y: 83.38,
            w: 47.1,
            from: 'grow',
            order: 1,
            sway: true,
            depth: 2,
        },
    ],
};

const shanti: WardrobePage = {
    ink: '#34501a',
    tint: '#c08a2a',
    // A calm prayer glow: warm gold light on sage.
    sky: 'radial-gradient(90% 55% at 50% 38%, #fff3cf 0%, rgba(255,243,207,0) 65%), linear-gradient(180deg, #f9f4e4 0%, #eef2da 50%, #dbe6c4 100%)',
    dark: false,
    ambient: 'glow',
    layers: [
        {
            src: at('shanti-stage'),
            x: 7.38,
            y: 43.61,
            w: 85.13,
            from: 'rise',
            order: 0,
        },
        {
            src: at('shanti-1'),
            x: 9.58,
            y: 63.88,
            w: 21.97,
            from: 'left',
            order: 2,
            depth: 1,
        },
        {
            src: at('shanti-2'),
            x: 19.76,
            y: 64.55,
            w: 39.6,
            from: 'rise',
            order: 3,
            depth: 1,
        },
        {
            src: at('shanti-3'),
            x: 38.21,
            y: 64.66,
            w: 40.95,
            from: 'rise',
            order: 4,
            depth: 1,
        },
        {
            src: at('shanti-4'),
            x: 68.65,
            y: 63.74,
            w: 23.3,
            from: 'right',
            order: 2,
            depth: 1,
        },
        {
            src: at('wildflowers'),
            x: 5.52,
            y: 83.26,
            w: 45.3,
            from: 'grow',
            order: 1,
            sway: true,
            depth: 2,
        },
        {
            src: at('wildflowers'),
            x: 46.01,
            y: 83.38,
            w: 47.1,
            from: 'grow',
            order: 1,
            sway: true,
            depth: 2,
        },
    ],
};

const wedding: WardrobePage = {
    ink: '#7d1029',
    tint: '#c9566f',
    // Blush dusk for the sacred union.
    sky: 'radial-gradient(100% 55% at 50% 30%, #fff7f3 0%, rgba(255,247,243,0) 65%), linear-gradient(180deg, #fff2f2 0%, #fbd9df 50%, #f2b4c3 100%)',
    dark: false,
    ambient: 'lotus',
    layers: [
        {
            src: at('wedding-stage'),
            x: 9.75,
            y: 40.51,
            w: 80.86,
            from: 'rise',
            order: 0,
        },
        {
            src: at('wedding-couples'),
            x: 12.12,
            y: 60.7,
            w: 76.11,
            from: 'rise',
            order: 2,
            depth: 1,
        },
        {
            src: at('wedding-florals'),
            x: 5.22,
            y: 74.05,
            w: 88.32,
            from: 'grow',
            order: 1,
            sway: true,
            depth: 2,
        },
    ],
};

// Ceremony kind → its illustrated page. Unknown kinds take the closest mood.
const byKind: Record<string, WardrobePage> = {
    haldi: haldi,
    pithi: haldi,
    mehndi: haldi,
    mameru: haldi,
    sangeet: sangeet,
    garba: sangeet,
    cocktail: sangeet,
    reception: sangeet,
    'grah-shanti': shanti,
    'vastu-shanti': shanti,
    'ganesh-sthapana': shanti,
    puja: shanti,
    pheras: wedding,
    wedding: wedding,
    baraat: wedding,
};

export const pageFor = (kind: string): WardrobePage => byKind[kind] ?? wedding;
