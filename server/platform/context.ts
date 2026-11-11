import { AsyncLocalStorage } from 'node:async_hooks';

import type { Platform } from './types';

// One store per request; works on Workers (nodejs_compat) and Node alike.
const store = new AsyncLocalStorage<Platform>();

export const runWithPlatform = <T>(platform: Platform, fn: () => T): T => store.run(platform, fn);

export function getPlatform(): Platform {
    const platform = store.getStore();
    if (!platform) throw new Error('getPlatform() called outside a request');
    return platform;
}
