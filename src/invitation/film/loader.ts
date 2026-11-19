// Frames for drawing a film away from the invitation page: the studio's film editor plays and scrubs
// it, and the couple's video draws every frame of it in turn. Sheets decode as they're needed and
// only a few stay decoded (each is ~19 MB in memory); the compressed files are kept for going back.
import { exitAt, frameAt, frameCell, sceneAt, type TimedScene } from '@shared/film';
import { photoUrl } from '@shared/photos';

import type { Picture, Pictures, PicturesOf } from './paint';

export interface FilmLoader {
    pictures: PicturesOf;
    // Resolves once everything the film shows at t is decoded (for drawing frame by frame).
    ready: (t: number) => Promise<void>;
    close: () => void;
}

export function filmLoader(scenes: TimedScene[], onReady: () => void, keep = 4): FilmLoader {
    const files = new Map<string, Promise<Blob | null>>();
    const bitmaps = new Map<string, ImageBitmap>();
    const decoding = new Map<string, Promise<void>>();
    let recent: string[] = [];
    let closed = false;

    const urlOf = (key: string) => {
        const [kind, scene, sheet] = key.split(':');
        const s = scenes[Number(scene)];
        if (!s) return undefined;
        return kind === 'still' ? s.image : s.frames?.sheets[Number(sheet)];
    };
    const touch = (key: string) => {
        recent = [key, ...recent.filter((k) => k !== key)];
    };
    const load = (key: string): Promise<void> => {
        const pending = decoding.get(key);
        if (pending) return pending;
        if (bitmaps.has(key)) return Promise.resolve();
        const url = urlOf(key);
        if (!url) return Promise.resolve();
        let file = files.get(url);
        if (!file) {
            file = fetch(photoUrl(url))
                .then((r) => (r.ok ? r.blob() : null))
                .catch(() => null);
            files.set(url, file);
        }
        const done = file
            .then((blob) => (blob ? createImageBitmap(blob) : null))
            .catch(() => null)
            .then((bitmap) => {
                decoding.delete(key);
                if (!bitmap) return;
                if (closed) {
                    bitmap.close();
                    return;
                }
                bitmaps.set(key, bitmap);
                touch(key);
                for (const old of recent.slice(keep)) {
                    bitmaps.get(old)?.close();
                    bitmaps.delete(old);
                }
                recent = recent.slice(0, keep);
                onReady();
            });
        decoding.set(key, done);
        return done;
    };
    const get = (key: string) => {
        const bitmap = bitmaps.get(key);
        if (bitmap) touch(key);
        else void load(key);
        return bitmap;
    };

    const pictures: PicturesOf = (i, local) => {
        const scene = scenes[i];
        if (!scene) return null;
        if (scene.kind === 'still') {
            const bitmap = get(`still:${String(i)}`);
            return bitmap
                ? {
                      a: {
                          source: bitmap,
                          sx: 0,
                          sy: 0,
                          sw: bitmap.width,
                          sh: bitmap.height,
                      },
                      mix: 0,
                  }
                : null;
        }
        const f = scene.frames;
        if (!f) return null;
        const pick = frameAt(f, local);
        const ca = frameCell(f, pick.index);
        const cb = frameCell(f, pick.next);
        const sheetA = get(`sheet:${String(i)}:${String(ca.sheet)}`);
        const sheetB = get(`sheet:${String(i)}:${String(cb.sheet)}`);
        if (!sheetA) return null;
        const cut = (source: ImageBitmap, c: typeof ca): Picture => ({
            source,
            sx: c.col * f.width,
            sy: c.row * f.height,
            sw: f.width,
            sh: f.height,
        });
        const out: Pictures = {
            a: cut(sheetA, ca),
            b: sheetB ? cut(sheetB, cb) : undefined,
            mix: pick.mix,
        };
        return out;
    };

    // What the film needs at t: the scene's two nearest frames, and the next scene's first while it
    // fades or flies in.
    const needed = (t: number) => {
        const place = sceneAt(scenes, t);
        const keys: string[] = [];
        const add = (i: number, local: number) => {
            const scene = scenes[i];
            if (!scene) return;
            if (scene.kind === 'still') {
                keys.push(`still:${String(i)}`);
                return;
            }
            const f = scene.frames;
            if (!f) return;
            const pick = frameAt(f, local);
            for (const index of [pick.index, pick.next])
                keys.push(`sheet:${String(i)}:${String(frameCell(f, index).sheet)}`);
        };
        add(place.index, place.local);
        if (exitAt(scenes, place).progress !== null) add(place.index + 1, 0);
        return [...new Set(keys)];
    };

    return {
        pictures,
        ready: async (t) => {
            await Promise.all(needed(t).map(load));
        },
        close: () => {
            closed = true;
            for (const bitmap of bitmaps.values()) bitmap.close();
            bitmaps.clear();
        },
    };
}
