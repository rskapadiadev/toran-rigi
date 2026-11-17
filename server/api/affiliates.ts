// Affiliates: everyone in the studio can see them; owners add, edit and upload logos.
import { PHOTO_MAX_BYTES, type PhotoMime, photoMimes, photoUrl } from '@shared/photos';
import { affiliateInput } from '@shared/schemas/affiliates';
import { Hono } from 'hono';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import {
    createAffiliate,
    listAffiliates,
    setAffiliateLogo,
    updateAffiliate,
} from '../repos/affiliates';
import { OrderError } from '../repos/orders';

export const affiliatesApi = new Hono<AdminEnv>();

affiliatesApi.use('*', requireAdmin);
affiliatesApi.onError((error, c) => {
    if (error instanceof OrderError) return fail(c, 409, error.message);
    console.error('[affiliates]', error);
    return c.json(
        {
            ok: false,
            error: 'Something went wrong',
        },
        500,
    );
});

const isPhotoMime = (type: string): type is PhotoMime =>
    (photoMimes as readonly string[]).includes(type);

affiliatesApi.get('/', requirePermission('orders.view'), async (c) =>
    c.json(await listAffiliates()),
);

affiliatesApi.post('/', requirePermission('catalog.manage'), async (c) => {
    const parsed = affiliateInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
        return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check the details');
    return c.json({
        ok: true,
        ...(await createAffiliate(parsed.data)),
    });
});

affiliatesApi.patch('/:id', requirePermission('catalog.manage'), async (c) => {
    const parsed = affiliateInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
        return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check the details');
    await updateAffiliate(c.req.param('id'), parsed.data);
    return c.json({ ok: true });
});

affiliatesApi.post('/:id/logo', requirePermission('catalog.manage'), async (c) => {
    const body = (await c.req.parseBody()) as Record<string, unknown>;
    const file = body.file;
    if (!(file instanceof File)) return fail(c, 422, 'Choose a logo');
    if (!isPhotoMime(file.type)) return fail(c, 422, 'Use a PNG, WebP, JPG or AVIF logo');
    if (file.size > PHOTO_MAX_BYTES) return fail(c, 422, 'Keep the logo under 6 MB');
    const key = await setAffiliateLogo(c.req.param('id'), file.type, await file.arrayBuffer());
    return c.json({
        ok: true,
        key,
        url: photoUrl(key),
    });
});
