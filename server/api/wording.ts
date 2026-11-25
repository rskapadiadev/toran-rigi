// The wording library, for the editors: words that fit one occasion and tradition.
import { type CultureId, cultureIds, cultureOf } from '@shared/cultures';
import { occasionIds } from '@shared/occasions';
import { wordingById, wordingsFor } from '@shared/wording';
import { Hono } from 'hono';
import { z } from 'zod';

import type { AppEnv } from '../app';
import { fail } from '../lib/http';

export const wordingApi = new Hono<AppEnv>();

const query = z.object({
    occasion: z.enum(occasionIds),
    // "hindu" or "hindu.gujarati".
    culture: z.string().max(40),
});

const isCulture = (id: string): id is CultureId => (cultureIds as readonly string[]).includes(id);

wordingApi.get('/', (c) => {
    const parsed = query.safeParse(c.req.query());
    if (!parsed.success) return fail(c, 422, 'Unknown occasion');
    const [root = '', variant] = parsed.data.culture.split('.');
    c.header('cache-control', 'public, max-age=3600');
    return c.json(
        wordingsFor({
            occasion: parsed.data.occasion,
            culture: isCulture(root) ? root : cultureOf(root).id,
            variant,
        }),
    );
});

wordingApi.get('/:id', (c) => {
    const words = wordingById(c.req.param('id'));
    if (!words) return fail(c, 404, 'Those words aren’t in the library');
    c.header('cache-control', 'public, max-age=3600');
    return c.json(words);
});
