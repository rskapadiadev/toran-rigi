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

export interface PageLink {
    // A web address, or "#id" for a jump to the page holding that element.
    href: string;
    // In page units (px of the 430-wide page), origin top-left.
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface CapturedPage {
    jpeg: Uint8Array;
    // Height of the captured image in page units (a full page is 932).
    height: number;
    links: PageLink[];
    // Element ids on this page, so "#id" links elsewhere can jump here.
    anchors: string[];
}

// Photographs a print edition page by page in a real browser (Cloudflare Browser Rendering, or
// local Chrome on Node). Absent where no browser is available.
export interface PageCapturer {
    capture(url: string): Promise<CapturedPage[]>;
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
    capturer?: PageCapturer;
}
