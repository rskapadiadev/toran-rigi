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

// ── Scenes: films and stills played end to end on one timeline ─────────────────────────────
export type CameraMove = 'still' | 'push' | 'pull' | 'rise' | 'fall' | 'drift-left' | 'drift-right';
export type SceneExit = 'cut' | 'fade' | 'zoom';

export interface Focus {
    x: number;
    y: number;
    zoom: number;
}

export interface FilmScene {
    kind: 'film' | 'still';
    frames?: FilmFrames;
    image?: string;
    length?: number;
    camera?: CameraMove;
    exit?: SceneExit;
    portal?: Focus;
}

export interface TimedScene extends FilmScene {
    start: number;
    duration: number;
}

// The last stretch of a scene that its fade or zoom exit takes.
export const EXIT_SECONDS = 0.7;
const STILL_SECONDS = 3;

interface FilmLike {
    frames?: FilmFrames;
    scenes?: FilmScene[];
}

// The film's scenes with their place on the timeline. A film without scenes is one scene of its frames.
export function timelineOf(film: FilmLike | undefined): TimedScene[] {
    if (!film) return [];
    const list: FilmScene[] = film.scenes?.length
        ? film.scenes
        : film.frames
          ? [
                {
                    kind: 'film',
                    frames: film.frames,
                },
            ]
          : [];
    const timed: TimedScene[] = [];
    let start = 0;
    for (const scene of list) {
        if (scene.kind === 'film' ? !scene.frames : !scene.image) continue;
        const duration =
            scene.kind === 'film' && scene.frames
                ? filmLength(scene.frames)
                : (scene.length ?? STILL_SECONDS);
        timed.push({
            ...scene,
            start,
            duration,
        });
        start += duration;
    }
    return timed;
}

export const timelineLength = (scenes: readonly TimedScene[]) => {
    const last = scenes.at(-1);
    return last ? last.start + last.duration : 0;
};

export interface ScenePlace {
    index: number;
    // Seconds into the scene.
    local: number;
}

export function sceneAt(scenes: readonly TimedScene[], seconds: number): ScenePlace {
    let index = 0;
    for (let i = 0; i < scenes.length; i++) {
        const s = scenes[i];
        if (s && seconds >= s.start) index = i;
    }
    const scene = scenes[index];
    const local = scene ? Math.max(0, Math.min(scene.duration, seconds - scene.start)) : 0;
    return {
        index,
        local,
    };
}

const smooth = (p: number) => {
    const x = Math.max(0, Math.min(1, p));
    return x * x * (3 - 2 * x);
};
const mixNum = (a: number, b: number, k: number) => a + (b - a) * k;

const moves: Record<CameraMove, [Focus, Focus]> = {
    still: [
        {
            x: 0.5,
            y: 0.5,
            zoom: 1,
        },
        {
            x: 0.5,
            y: 0.5,
            zoom: 1,
        },
    ],
    push: [
        {
            x: 0.5,
            y: 0.5,
            zoom: 1,
        },
        {
            x: 0.5,
            y: 0.5,
            zoom: 1.18,
        },
    ],
    pull: [
        {
            x: 0.5,
            y: 0.5,
            zoom: 1.18,
        },
        {
            x: 0.5,
            y: 0.5,
            zoom: 1,
        },
    ],
    rise: [
        {
            x: 0.5,
            y: 0.62,
            zoom: 1.2,
        },
        {
            x: 0.5,
            y: 0.4,
            zoom: 1.2,
        },
    ],
    fall: [
        {
            x: 0.5,
            y: 0.4,
            zoom: 1.2,
        },
        {
            x: 0.5,
            y: 0.62,
            zoom: 1.2,
        },
    ],
    'drift-left': [
        {
            x: 0.6,
            y: 0.5,
            zoom: 1.2,
        },
        {
            x: 0.4,
            y: 0.5,
            zoom: 1.2,
        },
    ],
    'drift-right': [
        {
            x: 0.4,
            y: 0.5,
            zoom: 1.2,
        },
        {
            x: 0.6,
            y: 0.5,
            zoom: 1.2,
        },
    ],
};

export const blendFocus = (a: Focus, b: Focus, k: number): Focus => ({
    x: mixNum(a.x, b.x, k),
    y: mixNum(a.y, b.y, k),
    // Zoom blends evenly in scale, so flying into a door feels steady rather than rushed at the end.
    zoom: a.zoom * Math.pow(b.zoom / a.zoom, k),
});

// Where the camera looks, `progress` (0–1) through the scene.
export function cameraAt(move: CameraMove | undefined, progress: number): Focus {
    const [from, to] = moves[move ?? 'still'];
    return blendFocus(from, to, smooth(progress));
}

export interface ViewRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

// The part of the picture (fractions) a focus shows, kept inside the picture.
export function viewOf(focus: Focus): ViewRect {
    const size = 1 / focus.zoom;
    const x = Math.max(0, Math.min(1 - size, focus.x - size / 2));
    const y = Math.max(0, Math.min(1 - size, focus.y - size / 2));
    return {
        x,
        y,
        w: size,
        h: size,
    };
}

export interface ExitState {
    // 0–1 through the exit, or null outside it.
    progress: number | null;
    next?: TimedScene;
}

export function exitAt(scenes: readonly TimedScene[], place: ScenePlace): ExitState {
    const scene = scenes[place.index];
    const next = scenes[place.index + 1];
    if (!scene || !next || (scene.exit ?? 'cut') === 'cut') return { progress: null };
    const span = Math.min(EXIT_SECONDS, scene.duration / 2);
    const into = place.local - (scene.duration - span);
    return {
        progress: into >= 0 ? Math.min(1, into / span) : null,
        next,
    };
}

// ── Words on the film ──────────────────────────────────────────────────────────────────────
// Seconds of film over which moment text fades in and out.
export const MOMENT_FADE = 0.3;

interface MomentSpan {
    from: number;
    to: number;
}

// How visible a moment's words are at this point of the film (0–1).
export function momentAlpha(moment: MomentSpan, seconds: number): number {
    if (moment.to <= moment.from) return 0;
    const fade = Math.min(MOMENT_FADE, (moment.to - moment.from) / 2);
    const rise = (seconds - moment.from) / fade;
    const fall = (moment.to - seconds) / fade;
    return Math.max(0, Math.min(1, rise, fall));
}
