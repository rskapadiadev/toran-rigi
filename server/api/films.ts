// Film-opening clips for the visual editor. Studio only: customers never upload video.
import { FILM_MAX_BYTES, type FilmMime, filmMimes } from '@shared/film';
import { photoUrl } from '@shared/photos';
import { Hono } from 'hono';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import { storeFilm } from '../repos/photos';

const isFilmMime = (type: string): type is FilmMime =>
    (filmMimes as readonly string[]).includes(type);

export const filmsApi = new Hono<AdminEnv>();

filmsApi.use('*', requireAdmin, requirePermission('orders.update'));

filmsApi.post('/:invitationId', async (c) => {
    const body = (await c.req.parseBody()) as Record<string, unknown>;
    const file = body.file;
    if (!(file instanceof File)) return fail(c, 422, 'Choose a film');
    if (!isFilmMime(file.type)) return fail(c, 422, 'Use an MP4 or WebM film');
    if (file.size > FILM_MAX_BYTES) return fail(c, 422, 'Keep the film under 12 MB');
    const key = await storeFilm(c.req.param('invitationId'), file.type, await file.arrayBuffer());
    return c.json(
        {
            key,
            url: photoUrl(key),
        },
        201,
    );
});
