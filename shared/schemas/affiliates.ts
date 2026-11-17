import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

// An affiliate (planner, photographer, decorator…) who refers couples; their logo can sit beside
// Toran's at the foot of the invitations they referred.
export const affiliateInput = z.object({
    name: z.string().trim().min(2, 'Give the affiliate a name').max(120),
    details: optionalText(600),
    website: z.url('Enter a full link, e.g. https://…').max(300).optional().or(z.literal('')),
    email: z.email().max(200).optional().or(z.literal('')),
    phone: optionalText(32),
    // Commission in percent (10 = 10%), stored as basis points.
    commission: z.number().min(0).max(100),
    isActive: z.boolean(),
});
export type AffiliateInput = z.infer<typeof affiliateInput>;
