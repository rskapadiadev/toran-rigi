import type { AppConfig } from '@shared/config';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type * as schema from '../db/schema';

// Both D1 and libSQL drivers support batch(): atomic multi-statement writes without interactive transactions.
export type Db = BaseSQLiteDatabase<'async', unknown, typeof schema> &
    Pick<DrizzleD1Database<typeof schema>, 'batch'>;

export interface BlobObject {
    body: ReadableStream;
    contentType: string;
    size: number;
    etag?: string;
}

export interface BlobPutOptions {
    contentType: string;
    cacheControl?: string;
}

export interface BlobStore {
    put(
        key: string,
        body: ArrayBuffer | ReadableStream | Uint8Array,
        options: BlobPutOptions,
    ): Promise<void>;
    get(key: string): Promise<BlobObject | null>;
    delete(key: string): Promise<void>;
    list(prefix: string): Promise<string[]>;
}

export interface KvCache {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
    delete(key: string): Promise<void>;
}

export interface RateLimitResult {
    success: boolean;
}

export interface RateLimiter {
    limit(key: string): Promise<RateLimitResult>;
}

export interface Platform {
    name: 'cloudflare' | 'node';
    config: AppConfig;
    db: Db;
    blob: BlobStore;
    cache: KvCache;
    rateLimit: RateLimiter;
    // Run work after the response is sent (waitUntil on Workers, detached promise on Node).
    background(task: Promise<unknown>): void;
    country(request: Request): string | undefined;
}
