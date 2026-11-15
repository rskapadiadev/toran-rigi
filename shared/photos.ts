// Invitation photos: the browser resizes to WebP before upload, the server only checks and stores.
export const photoMimes = ['image/webp', 'image/jpeg', 'image/png', 'image/avif'] as const;
export type PhotoMime = (typeof photoMimes)[number];

// After in-browser resizing a photo is ~200–600 KB; this only stops raw camera files.
export const PHOTO_MAX_BYTES = 6 * 1024 * 1024;
// Longest edge the browser resizes to: sharp on a 3× phone, light on WhatsApp's in-app browser.
export const PHOTO_MAX_EDGE = 2000;

// Under public/: the /media route only ever serves that prefix (dev mail and the like stay private).
export const photoPrefix = (invitationId: string) => `public/invitations/${invitationId}/photos/`;

const extension: Record<PhotoMime, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/avif': 'avif',
};
export const photoExtension = (mime: PhotoMime) => extension[mime];

// Stored keys become public URLs through the /media route (long-cached, immutable).
// A "blob:" key is a photo picked while trying a template: shown from the browser, never uploaded.
export const photoUrl = (key: string) => (key.startsWith('blob:') ? key : `/media/${key}`);

// ── Section photo frames ───────────────────────────────────────────────────────
// Sections that show photos have their own named frames, so a photo sits exactly where it was put
// and the gallery holds only gallery photos.
export interface PhotoSlot {
    id: string;
    label: string;
    hint: string;
}

// The cover's main frame is stored as coverPhotoKey (link previews and openings read it too).
export const COVER_SLOT = 'cover';

// Section type → layout variant → its frames, in reading order.
export const photoSlots: Record<string, Record<string, readonly PhotoSlot[]>> = {
    cover: {
        photo: [
            {
                id: COVER_SLOT,
                label: 'Main photo',
                hint: 'Fills the screen, then settles into a torn-paper frame',
            },
            {
                id: 'cover.left',
                label: 'Left polaroid',
                hint: 'Slides in from the left, beside the names',
            },
            {
                id: 'cover.right',
                label: 'Right polaroid',
                hint: 'Slides in from the right',
            },
        ],
    },
    story: {
        letter: [
            {
                id: 'story.top',
                label: 'Top-right photo',
                hint: 'Pinned to the top corner of the letter',
            },
            {
                id: 'story.bottom',
                label: 'Bottom-right photo',
                hint: 'Tucked under the bottom corner',
            },
        ],
    },
};

export const slotsFor = (type: string, variant: string | undefined): readonly PhotoSlot[] =>
    (variant && photoSlots[type]?.[variant]) || [];

interface PhotoContent {
    coverPhotoKey?: string;
    gallery: string[];
    photoSlots?: Record<string, string>;
}

export const slotPhoto = (content: PhotoContent, id: string): string | undefined =>
    id === COVER_SLOT ? content.coverPhotoKey : content.photoSlots?.[id];

// Every photo the invitation uses (what the package's photo limit counts).
export function photosInUse(content: PhotoContent): string[] {
    const keys = [
        content.coverPhotoKey,
        ...Object.values(content.photoSlots ?? {}),
        ...content.gallery,
    ];
    return [...new Set(keys.filter((k): k is string => Boolean(k)))];
}
