// The studio's private test of the AI portrait models, on the founders' own photos: nothing is
// stored, and nothing about anyone but the photos themselves is sent.
import { colourName } from '@shared/looks';
import { PHOTO_MAX_BYTES } from '@shared/photos';
import { designScene, MAX_REFERENCES, portraitProviders, portraitScenes } from '@shared/portraits';
import { Hono } from 'hono';
import { z } from 'zod';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import { makePortrait, PortraitError, portraitsConfigured } from '../services/portraits';

export const portraitsApi = new Hono<AdminEnv>();

portraitsApi.use('*', requireAdmin, requirePermission('portraits.test'));
portraitsApi.onError((error, c) => {
    if (error instanceof PortraitError) return fail(c, 422, error.message);
    console.error('[portraits]', error);
    return c.json(
        {
            ok: false,
            error: 'The photo couldn’t be made just now',
        },
        500,
    );
});

portraitsApi.get('/providers', (c) => c.json(portraitsConfigured()));

const tryInput = z.object({
    provider: z.enum(portraitProviders),
    scene: z.string().max(20),
    consent: z.literal('yes'),
    colours: z
        .string()
        .max(60)
        .regex(/^(#[0-9a-f]{6},?){0,4}$/i)
        .optional(),
    motif: z
        .string()
        .trim()
        .max(30)
        .regex(/^[a-z -]*$/i)
        .optional(),
});

const photoTypes = ['image/jpeg', 'image/png', 'image/webp'];

portraitsApi.post('/try', async (c) => {
    if (!(await c.env.rateLimit.limit(`portraits:${c.get('user').id}`)).success)
        return fail(c, 429, 'Give it a minute, then try again');
    const body = (await c.req.parseBody({ all: true })) as Record<string, unknown>;
    const parsed = tryInput.safeParse(body);
    if (!parsed.success) return fail(c, 422, 'Tick that these are your own photos, then try again');
    const { provider, scene: sceneId, colours, motif } = parsed.data;
    const scene =
        sceneId === 'design'
            ? designScene({
                  colours: (colours ?? '')
                      .split(',')
                      .filter(Boolean)
                      .map((h) => colourName(h).toLowerCase()),
                  motif,
              })
            : portraitScenes.find((s) => s.id === sceneId);
    if (!scene) return fail(c, 422, 'Pick a scene');
    const raw = body.photos;
    const files = (Array.isArray(raw) ? raw : [raw]).filter((f): f is File => f instanceof File);
    if (files.length === 0) return fail(c, 422, 'Add a photo of each of you');
    if (files.length > MAX_REFERENCES)
        return fail(c, 422, `Up to ${String(MAX_REFERENCES)} photos`);
    for (const f of files) {
        if (!photoTypes.includes(f.type)) return fail(c, 422, 'Use JPG, PNG or WebP photos');
        if (f.size > PHOTO_MAX_BYTES) return fail(c, 422, 'Keep each photo under 6 MB');
    }
    const photos = await Promise.all(
        files.map(async (f) => ({
            mime: f.type,
            bytes: new Uint8Array(await f.arrayBuffer()),
        })),
    );
    const made = await makePortrait(provider, scene, photos);
    let binary = '';
    for (let i = 0; i < made.bytes.length; i += 0x8000)
        binary += String.fromCharCode(...made.bytes.subarray(i, i + 0x8000));
    return c.json({
        image: `data:${made.mime};base64,${btoa(binary)}`,
        ms: made.ms,
        bytes: made.bytes.length,
    });
});
