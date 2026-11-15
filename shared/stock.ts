// Free stock media: Pixabay (photos, illustrations, vectors, videos) and Openverse (Creative Commons
// photos and audio). Searched through our API, then imported into our own storage on pick: Pixabay
// forbids permanent hotlinking, and an invitation must not break when a third party moves a file.

export const stockKinds = ['photo', 'illustration', 'vector', 'video', 'audio'] as const;
export type StockKind = (typeof stockKinds)[number];

export const stockProviders = ['pixabay', 'openverse'] as const;
export type StockProvider = (typeof stockProviders)[number];

/** Which providers can serve each kind, best first. */
export const providersFor: Record<StockKind, StockProvider[]> = {
    photo: ['pixabay', 'openverse'],
    illustration: ['pixabay', 'openverse'],
    vector: ['pixabay'],
    video: ['pixabay'],
    audio: ['openverse'],
};

/** One search hit, for the picker grid. Preview URLs are the provider's, for browsing only. */
export interface StockResult {
    provider: StockProvider;
    kind: StockKind;
    id: string;
    title: string;
    thumbnail: string;
    /** A larger preview image, or the audio/video stream for auditioning. */
    preview: string;
    width?: number;
    height?: number;
    durationSec?: number;
    creator: string;
    sourceUrl: string;
    license: string;
}

export interface StockPage {
    results: StockResult[];
    page: number;
    hasMore: boolean;
}

/** A picked item, stored in our own blob storage with everything its licence asks us to credit. */
export interface StockAsset {
    blobKey: string;
    kind: StockKind;
    mime: string;
    size: number;
    width?: number;
    height?: number;
    durationSec?: number;
    provider: StockProvider;
    providerId: string;
    title: string;
    creator: string;
    creatorUrl?: string;
    /** The item's page on the provider. */
    sourceUrl: string;
    license: string;
    licenseUrl: string;
}

export const PIXABAY_LICENSE = 'Pixabay Content License';
export const PIXABAY_LICENSE_URL = 'https://pixabay.com/service/license-summary/';

/** A credit line, e.g. "Photo by Asha on Pixabay" or "“Raga” by Ravi · CC BY 4.0 · via Openverse". */
export function creditLine(
    a: Pick<StockAsset, 'kind' | 'title' | 'creator' | 'provider' | 'license'>,
): string {
    const what = {
        photo: 'Photo',
        illustration: 'Illustration',
        vector: 'Vector',
        video: 'Video',
        audio: 'Music',
    }[a.kind];
    if (a.provider === 'pixabay') return `${what} by ${a.creator} on Pixabay`;
    return `“${a.title}” by ${a.creator} · ${a.license} · via Openverse`;
}

/** File types accepted on import. SVG is excluded: served from our own origin it could run script. */
export const stockMimes: Record<'image' | 'video' | 'audio', readonly string[]> = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm'],
    audio: [
        'audio/mpeg',
        'audio/mp4',
        'audio/ogg',
        'audio/wav',
        'audio/x-wav',
        'audio/flac',
        'audio/webm',
    ],
};

export const STOCK_MAX_BYTES = {
    image: 25,
    video: 80,
    audio: 30,
} as const;
