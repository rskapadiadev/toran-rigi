import { z } from 'zod';

export const localizedText = z.record(z.string(), z.string());

export const eventKinds = [
    'wedding',
    'engagement',
    'birthday',
    'baby_shower',
    'anniversary',
    'corporate',
    'other',
] as const;

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

const person = z.object({
    name: localizedText,
    parents: localizedText.optional(),
});

export const contentSchema = z.object({
    couple: z.object({
        one: person,
        two: person,
    }),
    greetingKey: z.string().optional(),
    headline: localizedText,
    welcome: localizedText,
    story: localizedText.optional(),
    family: localizedText.optional(),
    closing: localizedText,
    hashtag: z.string().optional(),
    coverPhotoKey: z.string().optional(),
    gallery: z.array(z.string()).default([]),
});

export const sectionConfigSchema = z.object({
    type: z.enum(sectionTypes),
    enabled: z.boolean().default(true),
    variant: z.string().optional(),
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
