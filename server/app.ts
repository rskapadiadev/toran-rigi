import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server';
import { Hono } from 'hono';

import { api } from './api';
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

    app.get('/media/*', async (c) => {
        const key = decodeURIComponent(c.req.path.slice('/media/'.length));
        if (!key.startsWith('public/')) return c.notFound();
        const object = await c.env.blob.get(key);
        if (!object) return c.notFound();
        return new Response(object.body, {
            headers: {
                'content-type': object.contentType,
                'cache-control': 'public, max-age=31536000, immutable',
            },
        });
    });

    app.all('*', (c) => runWithPlatform(c.env, () => startFetch(c.req.raw)));
    return app;
}
