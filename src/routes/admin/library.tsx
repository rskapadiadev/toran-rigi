import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { categoryIds } from '@/admin/library/categories';
// The page lives in its own module so none of its code ends up in what every visitor downloads.
import { LibraryPage } from '@/admin/library/LibraryPage';

export const Route = createFileRoute('/admin/library')({
    validateSearch: z.object({
        c: z.enum(categoryIds).optional(),
        i: z.string().max(60).optional(),
        // Sub-group within a category (e.g. "Cover" inside Section layouts).
        g: z.string().max(40).optional(),
        s: z.string().max(40).optional(),
        // Section edges: play their animation in the preview.
        a: z.boolean().optional(),
        // Generative art: a shuffled seed, so a design worth keeping can be shared by link.
        r: z.number().int().nonnegative().optional(),
    }),
    component: LibraryPage,
});
