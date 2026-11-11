import type { KvCache, RateLimiter } from '../types';

// Process-local fallbacks for Node; swap for Redis when running several instances.
interface CacheEntry {
    value: unknown;
    expires: number;
}

export function createMemoryCache(maxEntries = 500): KvCache {
    const entries = new Map<string, CacheEntry>();
    return {
        get<T>(key: string) {
            const hit = entries.get(key);
            if (!hit || hit.expires < Date.now()) {
                entries.delete(key);
                return Promise.resolve(null);
            }
            return Promise.resolve(hit.value as T);
        },
        set(key, value, ttlSeconds) {
            if (entries.size >= maxEntries) {
                const oldest = entries.keys().next().value;
                if (oldest !== undefined) entries.delete(oldest);
            }
            entries.set(key, {
                value,
                expires: Date.now() + ttlSeconds * 1000,
            });
            return Promise.resolve();
        },
        delete(key) {
            entries.delete(key);
            return Promise.resolve();
        },
    };
}

export function createMemoryRateLimiter(limit: number, periodSeconds: number): RateLimiter {
    const hits = new Map<string, number[]>();
    return {
        limit(key) {
            const now = Date.now();
            const windowStart = now - periodSeconds * 1000;
            const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);
            recent.push(now);
            hits.set(key, recent);
            return Promise.resolve({ success: recent.length <= limit });
        },
    };
}
