import { z } from 'zod';

// "Create your invite" from a demo: enough to call the visitor back, nothing more.
export const inquiryInput = z
    .object({
        name: z.string().trim().min(1, 'Tell us your name').max(120),
        phone: z.string().trim().max(32).optional().or(z.literal('')),
        email: z.email('Check the email address').max(200).optional().or(z.literal('')),
        date: z.iso.date().optional().or(z.literal('')),
        theme: z.string().max(40).optional(),
        message: z.string().max(1000).optional(),
    })
    .refine((v) => Boolean(v.phone) || Boolean(v.email), {
        message: 'Add a phone number or an email so we can reach you',
        path: ['phone'],
    });
export type InquiryInput = z.infer<typeof inquiryInput>;
