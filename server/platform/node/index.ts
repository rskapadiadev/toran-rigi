import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';

import { createClient } from '@libsql/client';
import { parseConfig } from '@shared/config';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from '../../db/schema';
import { createMemoryCache, createMemoryRateLimiter } from '../shared/memory';
import { createS3Blob } from '../shared/s3-blob';
import type { BlobStore, Db, Platform } from '../types';

function diskBlob(root: string): BlobStore {
    const path = (key: string) => join(root, key.replace(/\.\./g, ''));
    return {
        async put(key, body, { contentType }) {
            const file = path(key);
            await mkdir(dirname(file), { recursive: true });
            const bytes =
                body instanceof ReadableStream
                    ? new Uint8Array(await new Response(body).arrayBuffer())
                    : body;
            await writeFile(file, new Uint8Array(bytes as ArrayBuffer));
            await writeFile(`${file}.meta`, JSON.stringify({ contentType }));
        },
        async get(key) {
            const file = path(key);
            try {
                const [info, meta] = await Promise.all([
                    stat(file),
                    readFile(`${file}.meta`, 'utf8'),
                ]);
                const { contentType } = JSON.parse(meta) as { contentType: string };
                const data = await readFile(file);
                return {
                    body: Readable.toWeb(Readable.from(data)) as ReadableStream,
                    contentType,
                    size: info.size,
                };
            } catch {
                return null;
            }
        },
        async delete(key) {
            await rm(path(key), { force: true });
            await rm(`${path(key)}.meta`, { force: true });
        },
        async list(prefix) {
            const dir = path(prefix.slice(0, prefix.lastIndexOf('/') + 1));
            try {
                const files = await readdir(dir, { recursive: true });
                return files
                    .filter((f) => !f.endsWith('.meta'))
                    .map((f) => join(prefix.slice(0, prefix.lastIndexOf('/') + 1), f))
                    .filter((k) => k.startsWith(prefix));
            } catch {
                return [];
            }
        },
    };
}

let platform: Platform | undefined;

// Built once per process from process.env; adapters chosen by *_DRIVER variables.
export function getNodePlatform(): Platform {
    if (platform) return platform;
    const config = parseConfig(process.env);
    const client = createClient({
        url: config.LIBSQL_URL,
        authToken: config.LIBSQL_AUTH_TOKEN,
    });
    const blob =
        config.BLOB_DRIVER === 's3' && config.S3_ENDPOINT && config.S3_BUCKET
            ? createS3Blob({
                  endpoint: config.S3_ENDPOINT,
                  bucket: config.S3_BUCKET,
                  accessKeyId: config.S3_ACCESS_KEY_ID ?? '',
                  secretAccessKey: config.S3_SECRET_ACCESS_KEY ?? '',
                  region: config.S3_REGION,
              })
            : diskBlob(config.DISK_BLOB_DIR);

    platform = {
        name: 'node',
        config,
        db: drizzle(client, { schema }) as unknown as Db,
        blob,
        cache: createMemoryCache(),
        rateLimit: createMemoryRateLimiter(30, 60),
        background: (task) => {
            task.catch((error: unknown) => {
                console.error('[background]', error);
            });
        },
        country: (request) =>
            request.headers.get('cf-ipcountry') ?? request.headers.get('x-country') ?? undefined,
    };
    return platform;
}
