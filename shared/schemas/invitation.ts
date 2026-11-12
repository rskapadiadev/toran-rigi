import { z } from 'zod';

import { occasionIds } from '../occasions';

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
] as const;

export const generativeKinds = [
    'mandala',
    'girih',
    'botanical',
    'ketubah',
    'phulkari',
    'lotus',
    'bandhani',
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
    'none',
] as const;

export const sceneKinds = [
    'silk',
    'jacquard',
    'paper',
    'blush',
    'velvet',
    'night',
    'plain',
] as const;

export const edgeKinds = ['seam', 'torn', 'scallop', 'arch', 'none'] as const;

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
] as const;

export const sectionConfigSchema = z.object({
    type: z.enum(sectionTypes),
    enabled: z.boolean().default(true),
    variant: z.string().max(40).optional(),
    enter: z.enum(enterPresets).optional(),
    scene: z.enum(sceneKinds).optional(),
    edge: z.enum(edgeKinds).optional(),
    motif: z.enum(motifIds).optional(),
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
    music: z.object({ allowAutoOffer: z.boolean() }).optional(),
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
