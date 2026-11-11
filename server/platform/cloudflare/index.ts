import { parseConfig } from '@shared/config';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from '../../db/schema';
import { createMemoryCache } from '../shared/memory';
import { createS3Blob } from '../shared/s3-blob';
import type { BlobStore, KvCache, Platform, RateLimiter } from '../types';

export interface CloudflareEnv {
    DB: D1Database;
    MEDIA: R2Bucket;
    RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
    [key: string]: unknown;
}

function r2Blob(bucket: R2Bucket): BlobStore {
    return {
        async put(key, body, { contentType, cacheControl }) {
            await bucket.put(key, body, {
                httpMetadata: {
                    contentType,
                    cacheControl,
                },
            });
        },
        async get(key) {
            const object = await bucket.get(key);
            if (!object) return null;
            return {
                body: object.body,
                contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
                size: object.size,
                etag: object.httpEtag,
            };
        },
        async delete(key) {
            await bucket.delete(key);
        },
        async list(prefix) {
            const listed = await bucket.list({ prefix });
            return listed.objects.map((o) => o.key);
        },
    };
}

// Workers Cache API is per-colo; good enough for cache-aside of published invitations.
function cfCache(): KvCache {
    const base = 'https://cache.internal/';
    const cache = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
    return {
        async get<T>(key: string) {
            const hit = await cache.match(base + encodeURIComponent(key));
            return hit ? ((await hit.json()) as T) : null;
        },
        async set(key, value, ttlSeconds) {
            await cache.put(
                base + encodeURIComponent(key),
                new Response(JSON.stringify(value), {
                    headers: {
                        'content-type': 'application/json',
                        'cache-control': `max-age=${ttlSeconds}`,
                    },
                }),
            );
        },
        async delete(key) {
            await cache.delete(base + encodeURIComponent(key));
        },
    };
}

const fallbackLimiter = (): RateLimiter => ({ limit: () => Promise.resolve({ success: true }) });

export function createCloudflarePlatform(env: CloudflareEnv, ctx: ExecutionContext): Platform {
    const config = parseConfig(env);
    const limiter = env.RATE_LIMITER;
    const blob =
        config.BLOB_DRIVER === 's3' && config.S3_ENDPOINT && config.S3_BUCKET
            ? createS3Blob({
                  endpoint: config.S3_ENDPOINT,
                  bucket: config.S3_BUCKET,
                  accessKeyId: config.S3_ACCESS_KEY_ID ?? '',
                  secretAccessKey: config.S3_SECRET_ACCESS_KEY ?? '',
                  region: config.S3_REGION,
              })
            : r2Blob(env.MEDIA);

    return {
        name: 'cloudflare',
        config,
        db: drizzle(env.DB, { schema }),
        blob,
        cache: config.CACHE_DRIVER === 'memory' ? createMemoryCache() : cfCache(),
        rateLimit: limiter ? { limit: (key) => limiter.limit({ key }) } : fallbackLimiter(),
        background: (task) => {
            ctx.waitUntil(task);
        },
        country: (request) => request.headers.get('cf-ipcountry') ?? undefined,
    };
}
