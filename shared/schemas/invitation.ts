import { z } from 'zod';

import { brandingStyles } from '../branding';
import { musicSources, musicStyles } from '../music';
import { occasionIds } from '../occasions';
import { stockKinds, stockProviders } from '../stock';
import { textStylesSchema } from '../text-style';

export const localizedText = z.record(z.string(), z.string());

// Kept as the column name (`event_kind`); its values are occasion ids.
export const eventKinds = occasionIds;

export const openingKinds = [
    'doors',
    'envelope',
    'curtain',
    'bandhani',
    'diya',
    'stitch',
    'mashrabiya',
    'lantern',
    'lotus',
    'phulkari',
    'chuppah',
    'garden-arch',
    'scratch',
    'liquid-gold',
    'ink',
    'origami',
    'warp',
    'fireworks',
    'light-pull',
    'chain',
    'zipper',
    'ribbon',
    'veil',
    'bell',
    'polaroid',
    'tribute',
    'book',
    'garden',
    'jewellery-box',
    'sealed-letter',
    'portraits',
    'film',
] as const;

export const generativeKinds = [
    'mandala',
    'girih',
    'botanical',
    'ketubah',
    'phulkari',
    'lotus',
    'bandhani',
    'squares',
    'bauhaus',
    'truchet',
    'orbits',
    'sunburst',
    'spirograph',
    'opart',
    'constellation',
] as const;

export const sectionTypes = [
    'cover',
    'names',
    'card',
    'blessing',
    'date',
    'countdown',
    'welcome',
    'story',
    'gallery',
    'events',
    'venue',
    'family',
    'dressCode',
    'travel',
    'live',
    'rsvp',
    'wishes',
    'shagun',
    'photoWall',
    'closing',
] as const;

export const paletteSchema = z.object({
    bg: z.string(),
    surface: z.string(),
    ink: z.string(),
    muted: z.string(),
    primary: z.string(),
    accent: z.string(),
    gold: z.string(),
});

export const filmFramesSchema = z.object({
    sheets: z.array(z.string()).min(1).max(200),
    fps: z.number().min(1).max(60),
    count: z.number().int().min(1).max(5000),
    cols: z.number().int().min(1).max(12),
    rows: z.number().int().min(1).max(12),
    width: z.number().int().min(16).max(2160),
    height: z.number().int().min(16).max(3840),
});

// How the camera moves across a scene while it plays (stills come alive with a slow move).
export const cameraMoves = [
    'still',
    'push',
    'pull',
    'rise',
    'fall',
    'drift-left',
    'drift-right',
] as const;
// How one scene hands over to the next: straight cut, crossfade, or a zoom through a door or window.
export const sceneExits = ['cut', 'fade', 'zoom'] as const;

// A point of the picture (fractions of its width and height) and how close the camera comes to it.
export const focusSchema = z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    zoom: z.number().min(1).max(12),
});

// One scene of the film behind the invitation: a stretch of film frames, or a still the camera moves over.
export const filmSceneSchema = z.object({
    kind: z.enum(['film', 'still']),
    frames: filmFramesSchema.optional(),
    image: z.string().optional(),
    // Seconds a still lasts on the film's timeline; a film lasts as long as its frames.
    length: z.number().min(0.5).max(30).optional(),
    camera: z.enum(cameraMoves).optional(),
    exit: z.enum(sceneExits).optional(),
    // Where a zoom exit flies into (a door, a window), and how close it comes before the next scene.
    portal: focusSchema.optional(),
});

export const momentStyles = ['kicker', 'line', 'script'] as const;

// Words placed on the film: shown in a box of the picture while the film is between `from` and `to`.
export const filmMomentSchema = z.object({
    text: localizedText,
    from: z.number().min(0).max(600),
    to: z.number().min(0).max(600),
    // The box's centre and width, as fractions of the upright picture.
    zone: z.object({
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        w: z.number().min(0.1).max(1),
    }),
    style: z.enum(momentStyles).optional(),
});

// Layers placed on the film for a stretch of seconds: a photo, the couple's monogram, an ornament from
// the motif library, or an effect over the whole picture. Each fades in with its entrance.
export const layerKinds = ['photo', 'monogram', 'ornament', 'effect'] as const;
export const layerEffects = ['petals', 'marigold', 'sparkles', 'fireworks', 'lanterns'] as const;
export const layerEnters = ['fade', 'rise', 'zoom', 'blur'] as const;
export const photoShapes = ['arch', 'circle', 'frame'] as const;

// A layer's pose at a second of the film; between two, it moves smoothly from one to the next.
export const layerKeySchema = z.object({
    at: z.number().min(0).max(600),
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    w: z.number().min(0.05).max(1),
    opacity: z.number().min(0).max(1),
    rotate: z.number().min(-180).max(180),
});

export const filmLayerSchema = z.object({
    kind: z.enum(layerKinds),
    from: z.number().min(0).max(600),
    to: z.number().min(0).max(600),
    // The layer's centre and width, as fractions of the upright picture (effects fill it).
    zone: z.object({
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        w: z.number().min(0.05).max(1),
    }),
    enter: z.enum(layerEnters).optional(),
    photo: z.string().max(300).optional(),
    shape: z.enum(photoShapes).optional(),
    // A motif id (see shared/motifs.ts; checked where it's drawn, as the list is defined below).
    motif: z.string().max(40).optional(),
    effect: z.enum(layerEffects).optional(),
    // Keyframes: without them the layer stays at its zone.
    keys: z.array(layerKeySchema).max(16).optional(),
});

export const designSchema = z.object({
    palette: paletteSchema,
    fonts: z.object({
        display: z.string(),
        body: z.string(),
        script: z.string().optional(),
    }),
    opening: z.enum(openingKinds),
    // A filmed opening (the 'film' kind): the studio's clip plus stills of its first and last frames.
    film: z
        .object({
            src: z.string(),
            first: z.string().optional(),
            last: z.string().optional(),
            // Seconds into the clip when the names rise, timed to the scene's big moment.
            namesAt: z.number().min(0).optional(),
            // The film stays behind the whole invitation and scrolling moves it frame by frame.
            behind: z.boolean().optional(),
            // Frames cut from the film into sprite sheets: drawn on a canvas, so scrubbing is smooth
            // on every phone (and works in low-power mode, where video won't play).
            frames: filmFramesSchema.optional(),
            // Several scenes played end to end on one timeline; without them the film is one scene.
            scenes: z.array(filmSceneSchema).max(12).optional(),
            moments: z.array(filmMomentSchema).max(24).optional(),
            layers: z.array(filmLayerSchema).max(24).optional(),
            // Ease to the nearest moment when the guest stops scrolling (off unless the studio asks).
            settle: z.boolean().optional(),
        })
        .optional(),
    generative: z.object({
        kind: z.enum(generativeKinds),
        density: z.number().min(0.2).max(1).default(0.6),
    }),
    texture: z.enum(['paper', 'silk', 'linen', 'none']).default('paper'),
    motion: z.enum(['calm', 'rich', 'cinematic']).default('rich'),
    // How chapters are titled: a small gold kicker, or a large gold script title over its divider.
    titles: z.enum(['kicker', 'script']).optional(),
    // Painted art the studio sets per design (media keys or /kits paths). Each piece is optional:
    // sections draw their own ornament where a painting is missing.
    art: z
        .object({
            // Vetted sacred art shown in the blessing arch (studio-set, never generated per guest).
            blessing: z.string().optional(),
            divider: z.string().optional(),
            venue: z.string().optional(),
            dress: z.string().optional(),
            // One painting per ceremony kind (mehndi, sangeet, pheras…), used by Pavilions.
            pavilions: z.record(z.string(), z.string()).optional(),
        })
        .optional(),
});

const isoDate = z.iso.date();

const person = z.object({
    name: localizedText,
    parents: localizedText.optional(),
    // "Late Shri", "Smt.", "Dr." — shown before the name where the occasion asks for it.
    honorific: localizedText.optional(),
    born: isoDate.optional(),
    passed: isoDate.optional(),
    photoKey: z.string().optional(),
});

// Who the invitation is about: a couple, a baby, a departed parent, a company. `two` is optional.
const peopleSchema = z.object({
    one: person,
    two: person.optional(),
});

// Older rows stored a wedding-only `couple`; read them as `people`.
const legacyCouple = (value: unknown) => {
    if (value && typeof value === 'object' && 'couple' in value && !('people' in value)) {
        const { couple, ...rest } = value;
        return {
            ...rest,
            people: couple,
        };
    }
    return value;
};

export const contentSchema = z.preprocess(
    legacyCouple,
    z.object({
        people: peopleSchema,
        greetingKey: z.string().optional(),
        headline: localizedText,
        welcome: localizedText,
        story: localizedText.optional(),
        family: localizedText.optional(),
        closing: localizedText,
        hashtag: z.string().optional(),
        coverPhotoKey: z.string().optional(),
        gallery: z.array(z.string()).default([]),
        // Photos placed in a section's own frames (slot id → key); see `photoSlots`. The cover's main
        // photo stays in coverPhotoKey. Never shared with the gallery.
        photoSlots: z.record(z.string(), z.string()).optional(),
        // Styling picked per text in the visual editor (path → style); see shared/text-style.
        textStyles: textStylesSchema.optional(),
        // Text path ("headline", "event:3:title") → languages typed by hand. Auto-translate fills
        // every other language of that text and never overwrites these.
        handWritten: z.record(z.string(), z.array(z.string())).optional(),
    }),
);

// Modular blocks: every section picks a layout variant, an entrance, a backdrop and an edge.
export const enterPresets = [
    'rise',
    'curtain',
    'unfold',
    'bloom',
    'ink',
    'wipe',
    'drift',
    'tilt',
    'iris',
    'sweep',
    'zoom',
    'flip',
    'petal',
    'stamp',
    'drop',
    'glow',
    'swing',
    'pop',
    'typewriter',
    'words',
    'quill',
    'none',
] as const;

export const sceneKinds = [
    'silk',
    'jacquard',
    'paper',
    'blush',
    'velvet',
    'night',
    'terrazzo',
    'watercolor',
    'leheriya',
    'aurora',
    'confetti',
    'petals',
    'rays',
    'midnight',
    'plain',
    // See-through, over the film playing behind the invitation.
    'film',
] as const;

export const edgeKinds = [
    'seam',
    'lace',
    'torn',
    'scallop',
    'arch',
    'cusped',
    'ogee',
    'lotus',
    'swag',
    'wave',
    'pinking',
    'cloud',
    'deco',
    'slant',
    'heartbeat',
    'doli',
    'ghodi',
    'car',
    'elephant',
    'bagghi',
    'dhol',
    'rickshaw',
    'doves',
    'stork',
    'lanterns',
    'balloons',
    'kites',
    'none',
] as const;

export const motifIds = [
    'paisley',
    'lotus',
    'girih',
    'rose',
    'phulkari',
    'pomegranate',
    'marigold',
    'arabesque',
    'olive',
    'diya',
    'moon',
    'leaf',
    'kalash',
    'confetti',
    'spark',
    'peacock',
    'elephant',
    'bell',
    'kite',
    'tulip',
    'hexagram',
    'hamsa',
    'dove',
    'heart',
    'rings',
    'butterfly',
    'balloons',
] as const;

// The ornament between a chapter's title and its words (see src/invitation/luxury/typography/dividers.tsx).
export const dividerKinds = [
    'medallion',
    'flourish',
    'lotus',
    'paisley',
    'deco',
    'line',
    'diya',
] as const;

export const sectionConfigSchema = z.object({
    type: z.enum(sectionTypes),
    enabled: z.boolean().default(true),
    variant: z.string().max(40).optional(),
    enter: z.enum(enterPresets).optional(),
    scene: z.enum(sceneKinds).optional(),
    edge: z.enum(edgeKinds).optional(),
    motif: z.enum(motifIds).optional(),
    // One switch for every edge: drift, breathe, walk or pulse. Off = still.
    edgeMotion: z.boolean().optional(),
    divider: z.enum(dividerKinds).optional(),
    // Seconds into the background film this section sits on; unset keeps the previous moment.
    filmAt: z.number().min(0).max(600).optional(),
});

export const extrasSchema = z.object({
    shagun: z
        .object({
            upiId: z.string(),
            payeeName: z.string(),
            note: z.string().optional(),
        })
        .optional(),
    live: z.object({ youtubeUrl: z.url() }).optional(),
    travel: z
        .array(
            z.object({
                title: localizedText,
                body: localizedText,
                link: z.url().optional(),
            }),
        )
        .optional(),
    photoWall: z
        .object({
            enabled: z.boolean(),
            quota: z.number().int().positive(),
        })
        .optional(),
    wishes: z.object({ enabled: z.boolean() }).optional(),
    // Paid add-on: the couple and their guests can download the invitation as a PDF. Only the
    // studio switches it on; doing so adds the add-on to the order's invoice.
    pdf: z.object({ enabled: z.boolean() }).optional(),
    // Which "Created with Toran" mark sits at the foot of the page (see shared/branding.ts).
    branding: z
        .object({
            style: z.enum(brandingStyles),
            // A night-dark band behind the mark instead of the page's own colour.
            dark: z.boolean().optional(),
            // The affiliate who referred this invitation: their logo sits beside Toran's.
            affiliateId: z.string().max(64).optional(),
        })
        .optional(),
    // Credits for free stock media (Pixabay / Openverse). CC BY-style licences require them on the page.
    credits: z
        .array(
            z.object({
                blobKey: z.string().max(300),
                kind: z.enum(stockKinds),
                provider: z.enum(stockProviders),
                title: z.string().max(300),
                creator: z.string().max(200),
                creatorUrl: z.url().max(600).optional(),
                sourceUrl: z.url().max(600),
                license: z.string().max(120),
                licenseUrl: z.url().max(600),
            }),
        )
        .max(200)
        .optional(),
    // The source of background music (shared/music.ts). The server resolves the file to play.
    music: z
        .object({
            allowAutoOffer: z.boolean().optional(),
            source: z.enum(musicSources).optional(),
            // Library: the chosen track. Upload: the stored file and its display title.
            trackId: z.string().max(40).optional(),
            blobKey: z.string().max(200).optional(),
            title: z.string().max(160).optional(),
            // Upload: when someone confirmed the right to use the song in a shared invitation.
            rightsConfirmedAt: z.string().max(40).optional(),
            // Generated: the style of music played in the browser.
            style: z.enum(musicStyles).optional(),
        })
        .optional(),
});

export const packageLimitsSchema = z.object({
    events: z.number().int(),
    photos: z.number().int(),
    languages: z.number().int(),
    revisions: z.number().int(),
    hostingMonths: z.number().int(),
    deliveryHours: z.number().int(),
    guestLinks: z.boolean(),
    qrCard: z.boolean(),
    customOpening: z.boolean(),
    photoWallQuota: z.number().int(),
});
