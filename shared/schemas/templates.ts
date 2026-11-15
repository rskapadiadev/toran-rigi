import { z } from 'zod';

import { cultureIds } from '../cultures';
import { occasionIds } from '../occasions';

const culture = z
    .string()
    .max(40)
    .refine(
        (c) => (cultureIds as readonly string[]).includes(c.split('.')[0] ?? ''),
        'Unknown culture',
    );

export const createTemplateInput = z.object({
    name: z.string().trim().min(2, 'Give the template a name').max(80),
    description: z.string().trim().max(400).optional(),
    occasion: z.enum(occasionIds),
    culture,
    themeSlug: z.string().max(40),
});
export type CreateTemplateInput = z.infer<typeof createTemplateInput>;

export const updateTemplateInput = z
    .object({
        name: z.string().trim().min(2, 'Give the template a name').max(80),
        description: z.string().trim().max(400),
        status: z.enum(['draft', 'published', 'archived']),
        isFeatured: z.boolean(),
        fromPackage: z.string().max(40),
        sort: z.number().int().min(0).max(10_000),
    })
    .partial();
export type UpdateTemplateInput = z.infer<typeof updateTemplateInput>;
