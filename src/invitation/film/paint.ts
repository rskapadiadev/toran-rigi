// Drawing the film at a moment: the scene's frame (two nearest crossfaded) through its camera, and
// during an exit, the next scene fading in or growing out of the door the camera flies into. Shared
// by the stage behind the invitation and the video a couple shares, so both show the same picture.
import {
    blendFocus,
    cameraAt,
    exitAt,
    type Focus,
    sceneAt,
    type TimedScene,
    viewOf,
    type ViewRect,
} from '@shared/film';

// A picture ready to draw: one frame cut from a sheet, or a whole still.
export interface Picture {
    source: ImageBitmap;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
}

export interface Pictures {
    a: Picture;
    b?: Picture;
    mix: number;
}

// What a scene shows at a moment of its own, or null while its frames are still loading.
export type PicturesOf = (scene: number, local: number) => Pictures | null;

// Every scene is shown in the same upright column as the film.
export const ASPECT = 9 / 16;

const ease = (p: number) => {
    const x = Math.max(0, Math.min(1, p));
    return x * x * (3 - 2 * x);
};

export function paint(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    pic: Picture,
    focus: Focus,
    rect: ViewRect,
    alpha: number,
) {
    let { sx, sy, sw, sh } = pic;
    // Crop to the upright column first (stills may be any shape), then to what the camera sees.
    if (sw / sh > ASPECT) {
        const nw = sh * ASPECT;
        sx += (sw - nw) / 2;
        sw = nw;
    } else if (sw / sh < ASPECT) {
        const nh = sw / ASPECT;
        sy += (sh - nh) / 2;
        sh = nh;
    }
    const v = viewOf(focus);
    ctx.globalAlpha = alpha;
    ctx.drawImage(
        pic.source,
        sx + v.x * sw,
        sy + v.y * sh,
        v.w * sw,
        v.h * sh,
        rect.x,
        rect.y,
        rect.w,
        rect.h,
    );
}

interface Drawn {
    picture: Picture;
    focus: Focus;
}

// Paints the film at time t into the column; `snap` (reduced motion, stills only) skips the blends.
// Returns what it drew, or null when the frame isn't loaded yet (the caller keeps the last one).
export function paintFilm(
    ctx: CanvasRenderingContext2D,
    column: ViewRect,
    scenes: TimedScene[],
    t: number,
    pictures: PicturesOf,
    snap: boolean,
): Drawn | null {
    const place = sceneAt(scenes, t);
    const scene = scenes[place.index];
    const current = pictures(place.index, place.local);
    if (!scene || !current) return null;
    const focus = cameraAt(scene.camera, place.local / Math.max(0.01, scene.duration));
    const exit = exitAt(scenes, place);
    const next = exit.next;
    if (exit.progress !== null && next && scene.exit === 'zoom' && scene.portal && !snap) {
        const e = ease(exit.progress);
        const fly = blendFocus(focus, scene.portal, e);
        paint(ctx, current.a, fly, column, 1);
        // The door's place on screen right now: it opens out to fill the column as the camera arrives.
        const vf = viewOf(fly);
        const vp = viewOf(scene.portal);
        const door = {
            x: column.x + ((vp.x - vf.x) / vf.w) * column.w,
            y: column.y + ((vp.y - vf.y) / vf.h) * column.h,
            w: (vp.w / vf.w) * column.w,
            h: (vp.h / vf.h) * column.h,
        };
        const inside = pictures(place.index + 1, 0);
        if (inside) {
            // Seen through an arched doorway whose curve flattens as it fills the screen.
            const round = (door.w / 2) * (1 - e);
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(door.x, door.y, door.w, door.h, [round, round, 0, 0]);
            ctx.clip();
            paint(ctx, inside.a, cameraAt(next.camera, 0), door, Math.min(1, e * 1.6));
            ctx.restore();
        }
    } else {
        paint(ctx, current.a, focus, column, 1);
        if (current.b && current.mix > 0.02 && !snap)
            paint(ctx, current.b, focus, column, current.mix);
        if (exit.progress !== null && next && scene.exit === 'fade') {
            const after = pictures(place.index + 1, 0);
            if (after) paint(ctx, after.a, cameraAt(next.camera, 0), column, ease(exit.progress));
        }
    }
    ctx.globalAlpha = 1;
    return {
        picture: current.a,
        focus,
    };
}
