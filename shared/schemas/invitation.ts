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

export const designSchema = z.object({
    palette: paletteSchema,
    fonts: z.object({
        display: z.string(),
        body: z.string(),
        script: z.string().optional(),
    }),
    opening: z.enum(openingKinds),
    generative: z.object({
        kind: z.enum(generativeKinds),
        density: z.number().min(0.2).max(1).default(0.6),
    }),
    texture: z.enum(['paper', 'silk', 'linen', 'none']).default('paper'),
    motion: z.enum(['calm', 'rich', 'cinematic']).default('rich'),
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
    'plain',
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
