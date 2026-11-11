import { AwsClient } from 'aws4fetch';

import type { BlobStore } from '../types';

interface S3Options {
    endpoint: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}

// Any S3-compatible store (AWS S3, R2 S3 API, MinIO, B2); fetch-based so it runs everywhere.
export function createS3Blob(options: S3Options): BlobStore {
    const client = new AwsClient({
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
        region: options.region,
        service: 's3',
    });
    const url = (key: string) =>
        `${options.endpoint.replace(/\/$/, '')}/${options.bucket}/${encodeURI(key)}`;

    return {
        async put(key, body, { contentType, cacheControl }) {
            const headers: Record<string, string> = { 'content-type': contentType };
            if (cacheControl) headers['cache-control'] = cacheControl;
            const res = await client.fetch(url(key), {
                method: 'PUT',
                body: body as BodyInit,
                headers,
            });
            if (!res.ok) throw new Error(`S3 put failed: ${res.status}`);
        },
        async get(key) {
            const res = await client.fetch(url(key));
            if (res.status === 404) return null;
            if (!res.ok || !res.body) throw new Error(`S3 get failed: ${res.status}`);
            return {
                body: res.body,
                contentType: res.headers.get('content-type') ?? 'application/octet-stream',
                size: Number(res.headers.get('content-length') ?? 0),
                etag: res.headers.get('etag') ?? undefined,
            };
        },
        async delete(key) {
            await client.fetch(url(key), { method: 'DELETE' });
        },
        async list(prefix) {
            const res = await client.fetch(
                `${options.endpoint.replace(/\/$/, '')}/${options.bucket}?list-type=2&prefix=${encodeURIComponent(prefix)}`,
            );
            const xml = await res.text();
            return [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1] ?? '').filter(Boolean);
        },
    };
}
