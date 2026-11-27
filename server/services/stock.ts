// Free stock media providers and import into our own storage.
// Pixabay: photos, illustrations, vectors and videos under the Pixabay Content License (key needed).
// Openverse: Creative Commons photos and audio, filtered to licences that allow commercial use.
// Searches are cached 24h (Pixabay's terms ask for it). Imports never fetch a URL the browser sent:
// the item is looked up again by id, and only public https hosts are downloaded from.
import {
    PIXABAY_LICENSE,
    PIXABAY_LICENSE_URL,
    STOCK_MAX_BYTES,
    type StockAsset,
    type StockKind,
    stockMimes,
    type StockPage,
    type StockProvider,
} from '@shared/stock';

import { getPlatform } from '../platform/context';

export class StockError extends Error {}

const DAY = 86_400;
// Generic client name only: nothing about the studio or its customers goes to providers.
const USER_AGENT = 'ToranInvitations/1.0 (+stock search)';

async function getJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
        headers: {
            accept: 'application/json',
            'user-agent': USER_AGENT,
        },
    });
    if (res.status === 429)
        throw new StockError('The stock library is busy — try again in a minute');
    if (!res.ok) throw new StockError(`The stock library did not answer (${String(res.status)})`);
    return await res.json();
}

// ── Pixabay ─────────────────────────────────────────────────────────────────

interface PixabayImage {
    id: number;
    pageURL: string;
    tags: string;
    previewURL: string;
    webformatURL: string;
    largeImageURL: string;
    imageWidth: number;
    imageHeight: number;
    user: string;
    user_id: number;
}

interface PixabayVideoFile {
    url: string;
    width: number;
    height: number;
    size: number;
    thumbnail?: string;
}

interface PixabayVideo {
    id: number;
    pageURL: string;
    tags: string;
    duration: number;
    videos: {
        large: PixabayVideoFile;
        medium: PixabayVideoFile;
        small: PixabayVideoFile;
        tiny: PixabayVideoFile;
    };
    user: string;
    user_id: number;
}

interface PixabayResponse<T> {
    totalHits: number;
    hits: T[];
}

const PER_PAGE = 24;
type PixabayAuthor = Pick<PixabayImage, 'user' | 'user_id'>;

const pixabayUser = (h: PixabayAuthor) =>
    `https://pixabay.com/users/${encodeURIComponent(h.user)}-${String(h.user_id)}/`;
const titleFromTags = (tags: string) => tags.split(',')[0]?.trim() ?? 'Pixabay';

function pixabayUrl(kind: StockKind, params: Record<string, string>) {
    const key = getPlatform().config.PIXABAY_API_KEY;
    if (!key) throw new StockError('Add PIXABAY_API_KEY to search Pixabay');
    const base = kind === 'video' ? 'https://pixabay.com/api/videos/' : 'https://pixabay.com/api/';
    const query = new URLSearchParams({
        key,
        safesearch: 'true',
        ...params,
    });
    if (kind !== 'video') query.set('image_type', kind);
    return `${base}?${query.toString()}`;
}

async function pixabaySearch(kind: StockKind, q: string, page: number): Promise<StockPage> {
    const params = {
        q: q.slice(0, 100),
        page: String(page),
        per_page: String(PER_PAGE),
    };
    if (kind === 'video') {
        const data = await getJson<PixabayResponse<PixabayVideo>>(pixabayUrl(kind, params));
        return {
            page,
            hasMore: page * PER_PAGE < Math.min(data.totalHits, 500),
            results: data.hits.map((h) => ({
                provider: 'pixabay',
                kind,
                id: String(h.id),
                title: titleFromTags(h.tags),
                thumbnail: h.videos.tiny.thumbnail ?? '',
                preview: h.videos.tiny.url,
                width: h.videos.medium.width,
                height: h.videos.medium.height,
                durationSec: h.duration,
                creator: h.user,
                sourceUrl: h.pageURL,
                license: PIXABAY_LICENSE,
            })),
        };
    }
    const data = await getJson<PixabayResponse<PixabayImage>>(pixabayUrl(kind, params));
    return {
        page,
        // Pixabay returns at most 500 hits per query.
        hasMore: page * PER_PAGE < Math.min(data.totalHits, 500),
        results: data.hits.map((h) => ({
            provider: 'pixabay',
            kind,
            id: String(h.id),
            title: titleFromTags(h.tags),
            thumbnail: h.previewURL,
            preview: h.webformatURL,
            width: h.imageWidth,
            height: h.imageHeight,
            creator: h.user,
            sourceUrl: h.pageURL,
            license: PIXABAY_LICENSE,
        })),
    };
}

// The file to import, looked up again by id (never a URL from the browser).
async function pixabayItem(kind: StockKind, id: string) {
    if (kind === 'video') {
        const data = await getJson<PixabayResponse<PixabayVideo>>(pixabayUrl(kind, { id }));
        const h = data.hits[0];
        if (!h) throw new StockError('That video is no longer on Pixabay');
        // 1280px: sharp on phones and laptops without a heavy download.
        const file = h.videos.medium.url ? h.videos.medium : h.videos.small;
        return {
            url: file.url,
            width: file.width,
            height: file.height,
            durationSec: h.duration,
            title: titleFromTags(h.tags),
            creator: h.user,
            creatorUrl: pixabayUser(h),
            sourceUrl: h.pageURL,
            license: PIXABAY_LICENSE,
            licenseUrl: PIXABAY_LICENSE_URL,
        };
    }
    const data = await getJson<PixabayResponse<PixabayImage>>(pixabayUrl(kind, { id }));
    const h = data.hits[0];
    if (!h) throw new StockError('That image is no longer on Pixabay');
    return {
        url: h.largeImageURL,
        width: h.imageWidth,
        height: h.imageHeight,
        title: titleFromTags(h.tags),
        creator: h.user,
        creatorUrl: pixabayUser(h),
        sourceUrl: h.pageURL,
        license: PIXABAY_LICENSE,
        licenseUrl: PIXABAY_LICENSE_URL,
    };
}

// ── Openverse ───────────────────────────────────────────────────────────────

interface OpenverseItem {
    id: string;
    title: string | null;
    url: string;
    thumbnail: string | null;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
    creator: string | null;
    creator_url: string | null;
    license: string;
    license_version: string | null;
    license_url: string;
    foreign_landing_url: string;
    filetype?: string | null;
}

interface OpenverseResponse {
    result_count: number;
    page_count: number;
    results: OpenverseItem[];
}

const OPENVERSE = 'https://api.openverse.org/v1';
// "CC0", "CC BY 4.0", "Public Domain Mark".
const licenceName = (i: OpenverseItem) =>
    i.license === 'pdm'
        ? 'Public Domain Mark'
        : `${i.license === 'cc0' ? 'CC0' : `CC ${i.license.toUpperCase()}`}${i.license_version ? ` ${i.license_version}` : ''}`;
const openverseKind = (kind: StockKind) => (kind === 'audio' ? 'audio' : 'images');

async function openverseSearch(kind: StockKind, q: string, page: number): Promise<StockPage> {
    const query = new URLSearchParams({
        q: q.slice(0, 100),
        page: String(page),
        page_size: '20',
        // Only licences that allow use in a commercial product (an invitation the studio sells), so
        // never NC. They must also allow modification (never ND): invitations crop and frame images.
        license_type: 'commercial,modification',
        mature: 'false',
    });
    // Music goes into the couple's videos too, which share-alike would bind to its own licence.
    if (kind === 'audio') {
        query.delete('license_type');
        query.set('license', 'cc0,pdm,by');
    }
    if (kind === 'photo') query.set('category', 'photograph');
    if (kind === 'illustration') query.set('category', 'illustration');
    if (kind === 'audio') query.set('category', 'music');
    const data = await getJson<OpenverseResponse>(
        `${OPENVERSE}/${openverseKind(kind)}/?${query.toString()}`,
    );
    return {
        page,
        hasMore: page < data.page_count,
        results: data.results.map((i) => ({
            provider: 'openverse',
            kind,
            id: i.id,
            title: i.title ?? 'Untitled',
            thumbnail: i.thumbnail ?? '',
            preview: kind === 'audio' ? i.url : (i.thumbnail ?? i.url),
            width: i.width ?? undefined,
            height: i.height ?? undefined,
            durationSec: i.duration ? Math.round(i.duration / 1000) : undefined,
            creator: i.creator ?? 'Unknown',
            sourceUrl: i.foreign_landing_url,
            license: licenceName(i),
        })),
    };
}

async function openverseItem(kind: StockKind, id: string) {
    if (!/^[0-9a-f-]{8,64}$/i.test(id)) throw new StockError('Unknown item');
    const i = await getJson<OpenverseItem>(`${OPENVERSE}/${openverseKind(kind)}/${id}/`);
    return {
        url: i.url,
        width: i.width ?? undefined,
        height: i.height ?? undefined,
        durationSec: i.duration ? Math.round(i.duration / 1000) : undefined,
        title: i.title ?? 'Untitled',
        creator: i.creator ?? 'Unknown',
        creatorUrl: i.creator_url ?? undefined,
        sourceUrl: i.foreign_landing_url,
        license: licenceName(i),
        licenseUrl: i.license_url,
    };
}

// ── Search & import ─────────────────────────────────────────────────────────

export const pixabayConfigured = () => Boolean(getPlatform().config.PIXABAY_API_KEY);

export async function searchStock(
    provider: StockProvider,
    kind: StockKind,
    q: string,
    page: number,
): Promise<StockPage> {
    if (provider === 'openverse' && (kind === 'vector' || kind === 'video'))
        throw new StockError('Openverse has no vectors or videos');
    if (provider === 'pixabay' && kind === 'audio')
        throw new StockError('Pixabay has no music API');
    const { cache } = getPlatform();
    // v3: music excludes ND and SA licences (cached v2 results could include them).
    const key = `stock:v3:${provider}:${kind}:${q.trim().toLowerCase()}:${String(page)}`;
    const hit = await cache.get<StockPage>(key);
    if (hit) return hit;
    const result =
        provider === 'pixabay'
            ? await pixabaySearch(kind, q, page)
            : await openverseSearch(kind, q, page);
    await cache.set(key, result, DAY);
    return result;
}

// Only public https hosts: never localhost, private ranges or cloud metadata addresses.
function safeUrl(raw: string): URL {
    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        throw new StockError('The file’s address is not valid');
    }
    const host = url.hostname.toLowerCase();
    const privateHost =
        host === 'localhost' ||
        host.endsWith('.local') ||
        host.endsWith('.internal') ||
        /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) ||
        host === '[::1]' ||
        /^\[(fc|fd|fe80)/.test(host);
    if (url.protocol !== 'https:' || privateHost)
        throw new StockError('That file cannot be imported');
    return url;
}

const family = (kind: StockKind): keyof typeof stockMimes =>
    kind === 'video' ? 'video' : kind === 'audio' ? 'audio' : 'image';

const extension: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/flac': 'flac',
    'audio/webm': 'webm',
};

/** Downloads the item into our storage (once: a second pick reuses the stored file). */
export async function importStock(
    provider: StockProvider,
    kind: StockKind,
    id: string,
): Promise<StockAsset> {
    const item =
        provider === 'pixabay' ? await pixabayItem(kind, id) : await openverseItem(kind, id);
    const url = safeUrl(item.url);
    const res = await fetch(url, {
        headers: { 'user-agent': USER_AGENT },
        redirect: 'follow',
    });
    if (res.status === 429)
        throw new StockError('The photo library is busy — try again in a minute');
    if (!res.ok || !res.body) throw new StockError('The file could not be downloaded');
    // Redirects must stay on public https hosts too.
    safeUrl(res.url || url.toString());
    const mime = (res.headers.get('content-type') ?? '').split(';')[0]?.trim().toLowerCase() ?? '';
    const group = family(kind);
    if (!stockMimes[group].includes(mime))
        throw new StockError(`That file type (${mime || 'unknown'}) is not supported`);
    const limit = STOCK_MAX_BYTES[group] * 1024 * 1024;
    const declared = Number(res.headers.get('content-length') ?? 0);
    if (declared > limit)
        throw new StockError(`Files over ${String(STOCK_MAX_BYTES[group])} MB cannot be imported`);
    const body = new Uint8Array(await res.arrayBuffer());
    if (body.byteLength > limit)
        throw new StockError(`Files over ${String(STOCK_MAX_BYTES[group])} MB cannot be imported`);

    const safeId = id.replace(/[^a-z0-9-]/gi, '').slice(0, 64);
    const blobKey = `public/stock/${provider}/${kind}/${safeId}.${extension[mime] ?? 'bin'}`;
    const { blob } = getPlatform();
    if (!(await blob.get(blobKey)))
        await blob.put(blobKey, body, {
            contentType: mime,
            cacheControl: 'public, max-age=31536000, immutable',
        });
    return {
        blobKey,
        kind,
        mime,
        size: body.byteLength,
        width: item.width,
        height: item.height,
        durationSec: item.durationSec,
        provider,
        providerId: id,
        title: item.title,
        creator: item.creator,
        creatorUrl: item.creatorUrl,
        sourceUrl: item.sourceUrl,
        license: item.license,
        licenseUrl: item.licenseUrl,
    };
}
