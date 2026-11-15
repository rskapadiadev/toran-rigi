// Auto-translate for the editor: whatever is typed in one language is written into the others.
import { translateInput } from '@shared/schemas/translate';
import { Hono } from 'hono';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import { translate, TranslateError, translationConfigured } from '../services/translate';

export const translateApi = new Hono<AdminEnv>();

translateApi.use('*', requireAdmin, requirePermission('orders.update'));
translateApi.onError((error, c) => {
    if (error instanceof TranslateError) return fail(c, 409, error.message);
    console.error('[translate]', error);
    return c.json(
        {
            ok: false,
            error: 'Translation failed, try again in a moment',
        },
        502,
    );
});

translateApi.get('/', (c) => c.json({ enabled: translationConfigured() }));

translateApi.post('/', async (c) => {
    const parsed = translateInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
        return fail(c, 422, parsed.error.issues[0]?.message ?? 'Nothing to translate');
    return c.json({
        ok: true,
        items: await translate(parsed.data.items),
    });
});
