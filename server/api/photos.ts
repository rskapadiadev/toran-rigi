// Photo upload for the visual editor. The draft stores the returned key (cover, gallery, people).
import { PHOTO_MAX_BYTES, type PhotoMime, photoMimes, photoUrl } from '@shared/photos';
import { Hono } from 'hono';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import { deletePhoto, storePhoto } from '../repos/photos';

const isPhotoMime = (type: string): type is PhotoMime =>
    (photoMimes as readonly string[]).includes(type);

export const photosApi = new Hono<AdminEnv>();

photosApi.use('*', requireAdmin, requirePermission('orders.update'));

photosApi.post('/:invitationId', async (c) => {
    const body = (await c.req.parseBody()) as Record<string, unknown>;
    const file = body.file;
    if (!(file instanceof File)) return fail(c, 422, 'Choose a photo');
    if (!isPhotoMime(file.type)) return fail(c, 422, 'Use a JPG, PNG, WebP or AVIF photo');
    if (file.size > PHOTO_MAX_BYTES) return fail(c, 422, 'Keep each photo under 6 MB');
    const key = await storePhoto(c.req.param('invitationId'), file.type, await file.arrayBuffer());
    return c.json(
        {
            key,
            url: photoUrl(key),
        },
        201,
    );
});

photosApi.delete('/:invitationId', async (c) => {
    const key = c.req.query('key') ?? '';
    const ok = await deletePhoto(c.req.param('invitationId'), key);
    return ok ? c.json({ ok: true }) : fail(c, 400, 'Unknown photo');
});
