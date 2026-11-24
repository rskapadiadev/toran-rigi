// Link-preview images: /og/<slug>.png (published, optional ?g=<guest token>) and /og/p/<token>.png (draft preview).
// Published cards are rendered once per version (and guest) and kept in blob storage; drafts render fresh.
import { forViewer } from '@shared/families';
import { shareFacts } from '@shared/share';
import { Hono } from 'hono';

import type { AppEnv } from '../app';
import { resolveLink } from '../repos/guests';
import { getInvitationByPreviewToken, getPublishedInvitation } from '../repos/invitations';
import { renderCard } from './render';

const png = (body: BodyInit, cacheControl: string) =>
    new Response(body, {
        headers: {
            'content-type': 'image/png',
            'cache-control': cacheControl,
        },
    });

// Bump when the card design changes so stored images are regenerated.
const DESIGN = 'd2';

export const og = new Hono<AppEnv>();

og.get('/p/:file{[A-Za-z0-9_-]{10,64}\\.png}', async (c) => {
    const token = c.req.param('file').slice(0, -4);
    const data = await getInvitationByPreviewToken(token);
    if (!data) return c.notFound();
    const image = await renderCard(shareFacts(data).card);
    return png(image, 'public, max-age=300');
});

og.get('/:file{[a-z0-9-]{1,80}\\.png}', async (c) => {
    const slug = c.req.param('file').slice(0, -4);
    const full = await getPublishedInvitation(slug);
    if (!full) return c.notFound();
    const { id, version } = full.invitation;
    const { guest, group, viewer } = await resolveLink(id, c.req.query('g')?.slice(0, 64));
    // The dates and names this link's own page shows: a private function's date stays private.
    const data = forViewer(full, viewer);
    const who = guest?.id ?? group?.id;
    // URLs carry ?v=<version>, so a fetched image never changes; unversioned URLs revalidate daily.
    const cacheControl = c.req.query('v')
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=86400';

    const { blob } = c.env;
    const key = `og/${id}/${DESIGN}-v${String(version)}${who ? `-${who}` : ''}.png`;
    const stored = await blob.get(key);
    if (stored) return png(stored.body, cacheControl);

    const image = await renderCard(shareFacts(data, guest?.displayName).card);
    c.env.background(blob.put(key, image, { contentType: 'image/png' }));
    return png(image, cacheControl);
});
