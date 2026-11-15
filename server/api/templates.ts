// Templates: the studio's catalogue of ready-made invitations. Everyone can browse; owners manage it.
import { createTemplateInput, updateTemplateInput } from '@shared/schemas/templates';
import { Hono } from 'hono';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import { OrderError } from '../repos/orders';
import {
    createTemplate,
    duplicateTemplate,
    listTemplates,
    updateTemplate,
} from '../repos/templates';

export const templatesApi = new Hono<AdminEnv>();

templatesApi.use('*', requireAdmin);
templatesApi.onError((error, c) => {
    if (error instanceof OrderError) return fail(c, 409, error.message);
    console.error('[templates]', error);
    return c.json(
        {
            ok: false,
            error: 'Something went wrong',
        },
        500,
    );
});

const json = async (c: { req: { json: () => Promise<unknown> } }) => c.req.json().catch(() => null);

templatesApi.get('/', requirePermission('orders.view'), async (c) => c.json(await listTemplates()));

templatesApi.post('/', requirePermission('catalog.manage'), async (c) => {
    const parsed = createTemplateInput.safeParse(await json(c));
    if (!parsed.success)
        return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check the template details');
    return c.json({
        ok: true,
        ...(await createTemplate(parsed.data)),
    });
});

templatesApi.post('/:id/duplicate', requirePermission('catalog.manage'), async (c) =>
    c.json({
        ok: true,
        ...(await duplicateTemplate(c.req.param('id'))),
    }),
);

templatesApi.patch('/:id', requirePermission('catalog.manage'), async (c) => {
    const parsed = updateTemplateInput.safeParse(await json(c));
    if (!parsed.success)
        return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check the template details');
    await updateTemplate(c.req.param('id'), parsed.data);
    return c.json({ ok: true });
});
