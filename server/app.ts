import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server';
import { Hono } from 'hono';

import { api } from './api';
import { og } from './og/route';
import { runWithPlatform } from './platform/context';
import type { Platform } from './platform/types';

export interface AppEnv {
    Bindings: Platform;
}

const startFetch = createStartHandler(defaultStreamHandler);

// Host-agnostic app: Hono owns /api and /media, everything else renders through TanStack Start.
export function createApp() {
    const app = new Hono<AppEnv>();

    app.use('*', async (c, next) => runWithPlatform(c.env, next));
    app.route('/api', api);
    app.route('/og', og);

    app.get('/media/*', async (c) => {
        const key = decodeURIComponent(c.req.path.slice('/media/'.length));
        if (!key.startsWith('public/')) return c.notFound();
        const object = await c.env.blob.get(key);
        if (!object) return c.notFound();
        const headers = {
            'content-type': object.contentType,
            'cache-control': 'public, max-age=31536000, immutable',
            'accept-ranges': 'bytes',
        };
        // Safari will not play audio without byte ranges. Media files are small (≤15 MB), so a
        // requested range is cut from the whole object rather than from every storage driver.
        const range = /^bytes=(\d*)-(\d*)$/.exec(c.req.header('range') ?? '');
        if (!range) return new Response(object.body, { headers });
        const bytes = new Uint8Array(await new Response(object.body).arrayBuffer());
        const size = bytes.length;
        const [, from = '', to = ''] = range;
        // "bytes=-500" asks for the last 500 bytes.
        const start = from === '' ? Math.max(0, size - Number(to)) : Number(from);
        const end = from === '' || to === '' ? size - 1 : Math.min(Number(to), size - 1);
        if (start >= size || start > end)
            return new Response(null, {
                status: 416,
                headers: { 'content-range': `bytes */${String(size)}` },
            });
        return new Response(bytes.slice(start, end + 1), {
            status: 206,
            headers: {
                ...headers,
                'content-range': `bytes ${String(start)}-${String(end)}/${String(size)}`,
                'content-length': String(end - start + 1),
            },
        });
    });

    app.all('*', (c) => runWithPlatform(c.env, () => startFetch(c.req.raw)));
    return app;
}
