// Posts for Instagram and WhatsApp status: a countdown to the day, a post for each ceremony on its
// day, a thank-you after, a square save-the-date and a grid for the profile. Lists, days and sizes
// only; src/invitation/cards/PostView draws them and server/services/posts photographs them.

// Days before the main ceremony that get a countdown post: two milestones, then every day of the
// last month, down to tomorrow (1) and the day itself (0).
export const COUNTDOWN_DAYS = [100, 60, ...Array.from({ length: 31 }, (_, i) => 30 - i)];

// The three ways a countdown is drawn, each in the invitation's own design.
export const postLooks = ['number', 'calendar', 'photo'] as const;
export type PostLook = (typeof postLooks)[number];

export const postFaces = ['count', 'ceremony', 'thanks', 'square', 'grid', 'look'] as const;
export type PostFace = (typeof postFaces)[number];

// Tiles across and down a profile grid: three to a row, as Instagram shows them.
export const GRID_COLUMNS = 3;
export const gridSizes = [3, 6, 9] as const;
export type GridSize = (typeof gridSizes)[number];

interface Size {
    width: number;
    height: number;
}

// Laid out at half size and photographed at twice: stories 1080 × 1920, the square 1080 × 1080,
// grid tiles 1080 × 1440 (the 3:4 Instagram's grid shows).
const TILE: Size = {
    width: 540,
    height: 720,
};

export function postSize(face: PostFace, tiles: GridSize = 6): Size {
    if (face === 'square')
        return {
            width: 540,
            height: 540,
        };
    if (face === 'grid')
        return {
            width: TILE.width * GRID_COLUMNS,
            height: TILE.height * (tiles / GRID_COLUMNS),
        };
    return {
        width: 540,
        height: 960,
    };
}

export type PostKind = 'countdown' | 'ceremony' | 'thanks' | 'square' | 'grid' | 'look';

export interface PostInfo {
    id: string;
    kind: PostKind;
    face: PostFace;
    title: string;
    size: string;
    // The day to post it (yyyy-mm-dd); none for the square and the grid, which go up any time.
    on: string | null;
    day?: number;
    eventId?: string;
    tiles?: GridSize;
    // A function only some guests are invited to: send it to them, not to a status.
    private?: boolean;
}

interface PostEvent {
    id: string;
    title: string;
    // Its own local day (yyyy-mm-dd), as guests read it on the invitation.
    date: string;
}

interface PostsInput {
    // Only the functions everyone is invited to: a status is seen by every contact.
    events: readonly PostEvent[];
    mainId: string | null;
    // Nothing counts down to a prayer meet.
    solemn: boolean;
    // Today where the invitation is (yyyy-mm-dd): posts for days gone by aren't offered.
    today: string;
    // Functions with a look to wear, private ones too: what to wear goes to the people invited.
    looks?: readonly (PostEvent & { private: boolean })[];
}

export const addDays = (date: string, days: number): string => {
    const d = new Date(`${date}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
};

const daysLabel = (day: number) =>
    day === 0 ? 'The day' : day === 1 ? 'Tomorrow' : `${String(day)} days to go`;

export function postsFor({ events, mainId, solemn, today, looks = [] }: PostsInput): PostInfo[] {
    if (solemn || events.length === 0) return [];
    const main = events.find((e) => e.id === mainId) ?? events[0];
    if (!main) return [];
    const story = '1080 × 1920';
    const countdown: PostInfo[] = COUNTDOWN_DAYS.map((day) => ({
        id: `count:${String(day)}`,
        kind: 'countdown' as const,
        face: 'count' as const,
        title: daysLabel(day),
        size: story,
        on: addDays(main.date, -day),
        day,
    })).filter((p) => p.on >= today);
    const ceremonies: PostInfo[] = events
        .filter((e) => e.date >= today)
        .map((e) => ({
            id: `ceremony:${e.id}`,
            kind: 'ceremony' as const,
            face: 'ceremony' as const,
            title: e.title,
            size: story,
            on: e.date,
            eventId: e.id,
        }));
    const wear: PostInfo[] = looks
        .filter((e) => e.date >= today)
        .map((e) => ({
            id: `look:${e.id}`,
            kind: 'look' as const,
            face: 'look' as const,
            title: `${e.title}: what to wear`,
            size: story,
            on: null,
            eventId: e.id,
            ...(e.private && { private: true }),
        }));
    const last = events.reduce((a, e) => (e.date > a ? e.date : a), main.date);
    return [
        ...countdown,
        ...ceremonies,
        ...wear,
        {
            id: 'thanks',
            kind: 'thanks',
            face: 'thanks',
            title: 'Thank you',
            size: story,
            on: addDays(last, 1),
        },
        {
            id: 'square',
            kind: 'square',
            face: 'square',
            title: 'Save the date, square',
            size: '1080 × 1080',
            on: null,
        },
        ...gridSizes.map((tiles) => ({
            id: `grid:${String(tiles)}`,
            kind: 'grid' as const,
            face: 'grid' as const,
            title: `Profile grid, ${String(tiles)} posts`,
            size: `${String(tiles)} × 1080 × 1440`,
            on: null,
            tiles,
        })),
    ];
}

interface Clip {
    x: number;
    y: number;
    width: number;
    height: number;
}

// One tile of the grid, in the order to post it. Instagram puts the newest first, so the
// bottom-right tile goes up first and the top-left last.
export function gridTile(tiles: GridSize, posted: number): Clip {
    const at = tiles - posted;
    return {
        x: (at % GRID_COLUMNS) * TILE.width,
        y: Math.floor(at / GRID_COLUMNS) * TILE.height,
        ...TILE,
    };
}

interface PhotoSources {
    content: {
        coverPhotoKey?: string | null;
        gallery: readonly string[];
    };
    design: {
        film?: { last?: string };
        art?: { venue?: string };
    };
}

// The photo a post can use: the cover, the first in the gallery, or the design's own picture.
export const postPhoto = ({ content, design }: PhotoSources): string | undefined =>
    content.coverPhotoKey ?? content.gallery[0] ?? design.film?.last ?? design.art?.venue;

export const postById = (posts: readonly PostInfo[], id: string) => posts.find((p) => p.id === id);

// "riya-kabir-12-days-to-go.png"; a grid is one file per tile, numbered in posting order.
export function postFileName(slug: string, post: PostInfo, variant = '', tile?: number): string {
    const part = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const name = post.kind === 'ceremony' ? `${part || 'ceremony'}-today` : part;
    const which = tile === undefined ? '' : `post-${String(tile)}`;
    return `${[slug, name, which, variant].filter(Boolean).join('-')}.png`;
}
