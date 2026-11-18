// Film openings: a short upright clip the studio uploads, with stills of its first and last frames.
export const filmMimes = ['video/mp4', 'video/webm'] as const;
export type FilmMime = (typeof filmMimes)[number];

// A 9:16 clip of about 9 s encodes well under this; it stops raw exports, which stall on 4G.
export const FILM_MAX_BYTES = 12 * 1024 * 1024;
// Stills are drawn from the clip in the browser, no wider than this.
export const FILM_STILL_MAX_WIDTH = 1080;

// Under public/ so the /media route serves them, beside the invitation's photos.
export const filmPrefix = (invitationId: string) => `public/invitations/${invitationId}/films/`;

export const filmExtension = (mime: FilmMime) => (mime === 'video/webm' ? 'webm' : 'mp4');

// ── The film behind the invitation ──────────────────────────────────────────────────────────
// Frames are cut into sprite sheets (cols × rows per sheet) and drawn on a canvas as the guest scrolls.
export interface FilmFrames {
    sheets: string[];
    fps: number;
    count: number;
    cols: number;
    rows: number;
    width: number;
    height: number;
}

// Frames cut in the browser: small enough to keep a budget phone's memory calm, sharp enough behind text.
export const FRAMES_FPS = 15;
export const FRAME_WIDTH = 540;
export const FRAMES_GRID = 3;

export interface FrameCell {
    sheet: number;
    col: number;
    row: number;
}

export const filmLength = (frames: FilmFrames) => (frames.count - 1) / frames.fps;

export function frameCell(frames: FilmFrames, index: number): FrameCell {
    const per = frames.cols * frames.rows;
    const i = Math.max(0, Math.min(frames.count - 1, Math.round(index)));
    const k = i % per;
    return {
        sheet: Math.floor(i / per),
        col: k % frames.cols,
        row: Math.floor(k / frames.cols),
    };
}

export interface FramePick {
    index: number;
    next: number;
    // How far towards the next frame (0–1): the two are crossfaded so 15 fps scrubs smoothly.
    mix: number;
}

export function frameAt(frames: FilmFrames, seconds: number): FramePick {
    const f = Math.max(0, Math.min(frames.count - 1, seconds * frames.fps));
    const index = Math.floor(f);
    return {
        index,
        next: Math.min(frames.count - 1, index + 1),
        mix: f - index,
    };
}

export interface FilmChapter {
    // Index (in the rendered list) of the chapter's first section.
    start: number;
    // The film moment the chapter holds on, and the moment the film travels from to get there.
    at: number;
    from: number;
}

// Consecutive sections on the same moment form a chapter; a section without a moment keeps the last one.
export function chaptersOf(moments: readonly (number | undefined)[], first: number): FilmChapter[] {
    const chapters: FilmChapter[] = [];
    let current = moments[0] ?? first;
    moments.forEach((m, i) => {
        const at = m ?? current;
        if (i === 0)
            chapters.push({
                start: 0,
                at,
                from: 0,
            });
        else if (at !== current)
            chapters.push({
                start: i,
                at,
                from: current,
            });
        current = at;
    });
    return chapters;
}

// Scroll distance (in screen heights) for travelling a stretch of film: about 0.6 screens a second.
export const travelScreens = (seconds: number) =>
    Math.max(0.5, Math.min(2.4, Math.abs(seconds) * 0.6));
