// Free stock media for the studio: search Pixabay / Openverse, and import a pick into our storage.
import { stockKinds, stockProviders } from '@shared/stock';
import { Hono } from 'hono';
import { z } from 'zod';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import { importStock, pixabayConfigured, searchStock, StockError } from '../services/stock';

export const stockApi = new Hono<AdminEnv>();

stockApi.use('*', requireAdmin, requirePermission('orders.update'));
stockApi.onError((error, c) => {
    if (error instanceof StockError) return fail(c, 422, error.message);
    console.error('[stock]', error);
    return c.json({
 ok: false,
error: 'The stock library is unavailable right now' 
}, 500);
});

// Which providers are switched on (Pixabay needs a key; Openverse needs none).
stockApi.get('/providers', (c) =>
    c.json({
        pixabay: pixabayConfigured(),
        openverse: true,
    }),
);

const searchInput = z.object({
    provider: z.enum(stockProviders),
    kind: z.enum(stockKinds),
    q: z.string().trim().max(100).default(''),
    page: z.coerce.number().int().min(1).max(25).default(1),
});

stockApi.get('/search', async (c) => {
    const parsed = searchInput.safeParse(c.req.query());
    if (!parsed.success) return fail(c, 422, 'Check the search');
    const { provider, kind, q, page } = parsed.data;
    return c.json(await searchStock(provider, kind, q, page));
});

const importInput = z.object({
    provider: z.enum(stockProviders),
    kind: z.enum(stockKinds),
    id: z.string().trim().min(1).max(64),
});

stockApi.post('/import', async (c) => {
    const parsed = importInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return fail(c, 422, 'Pick an item to import');
    // Each import downloads a file: keep one person from flooding storage.
    if (!(await c.env.rateLimit.limit(`stock-import:${c.get('user').id}`)).success)
        return fail(c, 429, 'Too many imports — wait a minute');
    const { provider, kind, id } = parsed.data;
    return c.json({
 ok: true,
asset: await importStock(provider, kind, id) 
});
});
