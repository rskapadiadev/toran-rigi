// Templates: the studio's catalogue of ready-made invitations. Everyone can browse; owners manage it.
import { PHOTO_MAX_BYTES, type PhotoMime, photoMimes, photoUrl } from '@shared/photos';
import { createTemplateInput, updateTemplateInput } from '@shared/schemas/templates';
import { Hono } from 'hono';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import { OrderError } from '../repos/orders';
import {
    createTemplate,
    duplicateTemplate,
    listTemplates,
    setTemplatePoster,
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

const isPhotoMime = (type: string): type is PhotoMime =>
    (photoMimes as readonly string[]).includes(type);

templatesApi.post('/:id/poster', requirePermission('catalog.manage'), async (c) => {
    const body = (await c.req.parseBody()) as Record<string, unknown>;
    const file = body.file;
    if (!(file instanceof File)) return fail(c, 422, 'Choose a picture');
    if (!isPhotoMime(file.type)) return fail(c, 422, 'Use a JPG, PNG, WebP or AVIF picture');
    if (file.size > PHOTO_MAX_BYTES) return fail(c, 422, 'Keep the picture under 6 MB');
    const key = await setTemplatePoster(c.req.param('id'), file.type, await file.arrayBuffer());
    return c.json({
        ok: true,
        key,
        url: photoUrl(key),
    });
});
