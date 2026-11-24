import { z } from 'zod';

import { sides } from '../guests';

// One schema for the RSVP form and the API: validation is written once.
export const rsvpInput = z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().max(32).optional(),
    attending: z.boolean(),
    guestCount: z.number().int().min(1).max(20),
    eventIds: z.array(z.string().max(64)).max(40).default([]),
    // How many are coming to each function (function id → people). Older pages send only guestCount.
    counts: z.record(z.string().max(64), z.number().int().min(0).max(20)).optional(),
    dietary: z.string().max(40).optional(),
    message: z.string().trim().max(1000).optional(),
    guestToken: z.string().max(64).optional(),
    turnstileToken: z.string().max(4096).optional(),
});
export type RsvpInput = z.infer<typeof rsvpInput>;

export const openedInput = z.object({ token: z.string().min(1).max(64) });

export const wishInput = z.object({
    name: z.string().trim().min(1).max(120),
    message: z.string().trim().min(2).max(600),
    guestToken: z.string().max(64).optional(),
    turnstileToken: z.string().max(4096).optional(),
});
export type WishInput = z.infer<typeof wishInput>;

// A guest's double-tap heart: on an approved wish or on one of the invitation's gallery photos.
export const heartInput = z.object({ target: z.string().regex(/^(wish|photo):[\w./-]{1,200}$/) });
export type HeartInput = z.infer<typeof heartInput>;
export type HeartCounts = Record<string, number>;

// ── The couple's guest list ─────────────────────────────────────────────────

const side = z.enum(sides).nullable();
const phone = z
    .string()
    .trim()
    .max(32)
    .regex(/^[+\d\s()-]*$/, 'Use only digits, spaces and a + for the country code');

export const guestInput = z.object({
    // As their invite greets them: "Sharma family", "Mama ji".
    displayName: z.string().trim().min(1, 'Add the family’s name').max(120),
    phone: phone.optional(),
    side: side.optional(),
    groupId: z.string().max(64).nullable().optional(),
    maxGuests: z.number().int().min(1).max(20).nullable().optional(),
    note: z.string().trim().max(500).optional(),
});
export type GuestInput = z.infer<typeof guestInput>;

export const guestPasteInput = z.object({
    // One family per line: "Sharma family, +91 98765 43210, 4"
    lines: z.string().max(50_000),
    side: side.optional(),
    groupId: z.string().max(64).nullable().optional(),
});
export type GuestPasteInput = z.infer<typeof guestPasteInput>;

export const groupInput = z.object({ name: z.string().trim().min(1, 'Name the group').max(60) });

// Who sees each function: function id → audience keys (see shared/guests.ts). Empty = everyone.
const audienceMap = z.record(z.string().max(64), z.array(z.string().max(80)).max(40));
export const audienceInput = z.object({ audience: audienceMap });
export type AudienceInput = z.infer<typeof audienceInput>;

const familyRepliesInput = z.object({
    enabled: z.boolean(),
    whatsapp: phone.optional(),
});

export const repliesInput = z.object({
    enabled: z.boolean(),
    whatsapp: phone.optional(),
    by: z.iso.date().optional().or(z.literal('')),
    message: z.string().trim().max(1000).optional(),
    reminder: z.string().trim().max(1000).optional(),
    sides: z
        .object({
            one: familyRepliesInput.optional(),
            two: familyRepliesInput.optional(),
        })
        .optional(),
});
export type RepliesInput = z.infer<typeof repliesInput>;

// A reply that came only on WhatsApp, typed in by the couple for one family.
export const manualReplyInput = z.object({
    attending: z.boolean(),
    counts: z.record(z.string().max(64), z.number().int().min(0).max(50)),
    message: z.string().trim().max(1000).optional(),
});
export type ManualReplyInput = z.infer<typeof manualReplyInput>;
