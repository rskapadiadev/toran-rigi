import { z } from 'zod';

// One schema for the RSVP form and the API: validation is written once.
export const rsvpInput = z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().max(32).optional(),
    attending: z.boolean(),
    guestCount: z.number().int().min(1).max(20),
    eventIds: z.array(z.string().max(64)).max(40).default([]),
    dietary: z.string().max(40).optional(),
    message: z.string().trim().max(1000).optional(),
    guestToken: z.string().max(64).optional(),
    turnstileToken: z.string().max(4096).optional(),
});
export type RsvpInput = z.infer<typeof rsvpInput>;

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
