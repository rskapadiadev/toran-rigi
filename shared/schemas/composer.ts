import { z } from 'zod';

import { cultureIds } from '../cultures';
import { occasionIds } from '../occasions';
import {
    contentSchema,
    designSchema,
    extrasSchema,
    localizedText,
    sectionConfigSchema,
} from './invitation';

const localIso = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Use YYYY-MM-DDTHH:mm');

export const eventInput = z.object({
    id: z.string().max(64).optional(),
    kind: z.string().min(1).max(40),
    title: localizedText,
    startsAt: localIso,
    endsAt: localIso.optional().or(z.literal('')),
    timezone: z.string().min(3).max(64),
    venue: z.string().trim().min(1).max(160),
    address: z.string().max(240).optional(),
    mapsUrl: z.url().max(600).optional().or(z.literal('')),
    description: localizedText.optional(),
    dressCode: z
        .object({
            note: localizedText.optional(),
            swatches: z.array(z.string().regex(/^#[0-9a-f]{6}$/i)).max(6),
        })
        .optional(),
});
export type EventInput = z.infer<typeof eventInput>;

export const saveInvitationInput = z.object({
    occasion: z.enum(occasionIds),
    culture: z
        .string()
        .max(40)
        .refine(
            (c) => (cultureIds as readonly string[]).includes(c.split('.')[0] ?? ''),
            'Unknown culture',
        ),
    themeSlug: z.string().max(40).optional(),
    locales: z.array(z.string().max(5)).min(1).max(5),
    calendars: z.array(z.enum(['islamic-umalqura', 'hebrew'])).max(2),
    seed: z
        .number()
        .int()
        .min(0)
        .max(2 ** 32),
    design: designSchema,
    content: contentSchema,
    sections: z.array(sectionConfigSchema).min(1),
    extras: extrasSchema,
    rsvpEnabled: z.boolean(),
    events: z.array(eventInput).max(40),
});
export type SaveInvitationInput = z.infer<typeof saveInvitationInput>;

export const slugInput = z.object({
    slug: z
        .string()
        .regex(
            /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/,
            'Use 3–60 lowercase letters, numbers and dashes',
        ),
});

export const guestImportInput = z.object({
    // One guest per line: "Shah Parivar, +9198xxxxxx, 4"
    lines: z.string().max(50_000),
});

export const wishModerationInput = z.object({ status: z.enum(['approved', 'hidden', 'pending']) });
