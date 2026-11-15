// Music: the studio library (A) and a customer's own song for one invitation (B).
// Generated music (C) needs no endpoint: it is played in the browser from the invitation's seed.
import { cultureIds } from '@shared/cultures';
import { MUSIC_MAX_BYTES, musicMimes } from '@shared/music';
import { type Context, Hono } from 'hono';
import { z } from 'zod';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import {
    createTrack,
    getTrack,
    listTracks,
    storeUpload,
    trackFromStock,
    updateTrack,
} from '../repos/music';
import { importStock, StockError } from '../services/stock';

type Audio =
    { ok: true;
mime: string;
body: ArrayBuffer;
name: string } | { ok: false;
error: string };

// The uploaded file, checked for type and size before anything is stored.
async function readAudio(form: Record<string, unknown>): Promise<Audio> {
    const file = form.file;
    if (!(file instanceof File))
        return {
            ok: false,
            error: 'Choose an audio file',
        };
    if (!(musicMimes as readonly string[]).includes(file.type))
        return {
            ok: false,
            error: 'Use an MP3, M4A, AAC, OGG, WAV or WebM file',
        };
    if (file.size > MUSIC_MAX_BYTES)
        return {
            ok: false,
            error: 'Keep the file under 15 MB',
        };
    return {
        ok: true,
        mime: file.type,
        body: await file.arrayBuffer(),
        name: file.name,
    };
}

const form = async (c: Context<AdminEnv>) => (await c.req.parseBody()) as Record<string, unknown>;
const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const trackFields = z.object({
    title: z.string().trim().min(1, 'Give the track a title').max(120),
    artist: z.string().trim().max(120).optional(),
    culture: z
        .string()
        .refine(
            (c) => c === '' || (cultureIds as readonly string[]).includes(c),
            'Unknown tradition',
        )
        .optional(),
    licenseUrl: z.url('Add a link to the licence'),
    durationSec: z.coerce.number().int().min(1).max(3600).optional(),
});

export const musicApi = new Hono<AdminEnv>();
musicApi.use('*', requireAdmin);

// Everyone who edits invitations can browse the library; only owners change it.
musicApi.get('/', requirePermission('orders.update'), async (c) =>
    c.json(await listTracks(c.req.query('all') !== '1')),
);

musicApi.post('/', requirePermission('catalog.manage'), async (c) => {
    const body = await form(c);
    const audio = await readAudio(body);
    if (!audio.ok) return fail(c, 422, audio.error);
    const parsed = trackFields.safeParse({
        title: text(body.title),
        artist: text(body.artist) || undefined,
        culture: text(body.culture) || undefined,
        licenseUrl: text(body.licenseUrl),
        durationSec: text(body.durationSec) || undefined,
    });
    if (!parsed.success)
        return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check the details');
    const track = await createTrack({
        ...parsed.data,
        mime: audio.mime,
        body: audio.body,
    });
    return c.json({
        ok: true,
        track,
    });
});

musicApi.patch('/:id', requirePermission('catalog.manage'), async (c) => {
    const parsed = trackFields
        .partial()
        .extend({ isActive: z.boolean().optional() })
        .safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
        return fail(c, 422, parsed.error.issues[0]?.message ?? 'Check the details');
    if (!(await getTrack(c.req.param('id')))) return fail(c, 404, 'Track not found');
    const { durationSec: _d, ...patch } = parsed.data;
    await updateTrack(c.req.param('id'), patch);
    return c.json({ ok: true });
});

// Free music from Openverse, added to the library with its credit. Anyone who edits invitations may
// do this: the licence is recorded from the source, not typed in by hand.
musicApi.post('/from-stock', requirePermission('orders.update'), async (c) => {
    const parsed = z
        .object({ id: z.string().trim().min(8).max(64) })
        .safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return fail(c, 422, 'Pick a track');
    try {
        const asset = await importStock('openverse', 'audio', parsed.data.id);
        return c.json({
 ok: true,
track: await trackFromStock(asset) 
});
    } catch (error) {
        if (error instanceof StockError) return fail(c, 422, error.message);
        throw error;
    }
});

/** B: the customer's own song, stored in the invitation's folder once the rights are confirmed. */
export async function uploadInvitationMusic(c: Context<AdminEnv>) {
    const body = await form(c);
    if (text(body.rights) !== 'yes')
        return fail(c, 422, 'Confirm you have the right to use this song in a shared invitation');
    const audio = await readAudio(body);
    if (!audio.ok) return fail(c, 422, audio.error);
    const blobKey = await storeUpload(c.req.param('id') ?? '', audio.mime, audio.body);
    return c.json({
        ok: true,
        blobKey,
        title: audio.name.replace(/\.[a-z0-9]+$/i, '').slice(0, 160),
        rightsConfirmedAt: new Date().toISOString(),
    });
}
