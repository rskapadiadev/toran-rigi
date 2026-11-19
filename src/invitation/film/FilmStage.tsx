// The film behind the invitation: one canvas that stays put while the page scrolls over it. The
// film's frames come in sprite sheets; scrolling through a travel spacer moves the film between two
// moments, and sections sit over the frame held between travels.
import {
    blendFocus,
    cameraAt,
    exitAt,
    type Focus,
    frameAt,
    frameCell,
    momentAlpha,
    sceneAt,
    type TimedScene,
    viewOf,
    type ViewRect,
} from '@shared/film';
import { photoUrl } from '@shared/photos';
import type { FilmMoment } from '@shared/types';
import { type MotionValue, motionValue, useReducedMotion } from 'motion/react';
import {
    createContext,
    type ReactNode,
    type RefObject,
    use,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';

import { useInvite } from '../context';

export interface FilmTravelSpan {
    el: HTMLElement;
    from: number;
    to: number;
    // How much the film dims once this chapter's sections are on screen (0 = not at all).
    veil: number;
    order: number;
}

export interface FilmStageValue {
    time: MotionValue<number>;
    // The moment the first chapter holds on: where the opening brings the film to rest.
    first: number;
    register: (span: FilmTravelSpan) => () => void;
}

export const FilmStageContext = createContext<FilmStageValue | null>(null);
export const useFilmStage = () => use(FilmStageContext);

// Decoded sheets are big (a 3×3 sheet of 540×960 frames is ~19 MB in memory): keep only a few.
const DECODED = 4;
const FETCHING = 3;
// How dark the film goes behind a chapter's words.
const VEIL = 0.58;

class SheetCache {
    private blobs = new Map<number, Promise<Blob | null>>();
    private bitmaps = new Map<number, ImageBitmap>();
    private decoding = new Set<number>();
    private recent: number[] = [];
    private queue: number[] = [];
    private active = 0;
    private closed = false;

    constructor(
        private urls: string[],
        private ready: () => void,
        // How many decoded sheets to keep: fewer on a lean connection's (often lower-memory) phone.
        private keep = DECODED,
    ) {}

    prefetch(order: number[]) {
        this.queue = order.filter((i) => i >= 0 && i < this.urls.length);
        this.pump();
    }

    private pump() {
        while (this.active < FETCHING && this.queue.length) {
            const i = this.queue.shift();
            if (i === undefined || this.blobs.has(i)) continue;
            void this.load(i);
        }
    }

    private load(i: number) {
        const url = this.urls[i];
        if (!url) return Promise.resolve(null);
        this.active++;
        const blob = fetch(url)
            .then((r) => (r.ok ? r.blob() : null))
            .catch(() => null)
            .finally(() => {
                this.active--;
                this.pump();
            });
        this.blobs.set(i, blob);
        return blob;
    }

    get(i: number) {
        const bitmap = this.bitmaps.get(i);
        if (bitmap) {
            this.recent = [i, ...this.recent.filter((k) => k !== i)];
            return bitmap;
        }
        this.want(i);
        return undefined;
    }

    want(i: number) {
        if (i < 0 || i >= this.urls.length || this.bitmaps.has(i) || this.decoding.has(i)) return;
        this.decoding.add(i);
        void (this.blobs.get(i) ?? this.load(i))
            .then((blob) => (blob ? createImageBitmap(blob) : null))
            .catch(() => null)
            .then((bitmap) => {
                this.decoding.delete(i);
                if (!bitmap) return;
                if (this.closed) {
                    bitmap.close();
                    return;
                }
                this.bitmaps.set(i, bitmap);
                this.recent = [i, ...this.recent.filter((k) => k !== i)];
                for (const old of this.recent.slice(this.keep)) {
                    this.bitmaps.get(old)?.close();
                    this.bitmaps.delete(old);
                }
                this.recent = this.recent.slice(0, this.keep);
                this.ready();
            });
    }

    close() {
        this.closed = true;
        for (const bitmap of this.bitmaps.values()) bitmap.close();
        this.bitmaps.clear();
    }
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

interface NetworkInfo {
    saveData?: boolean;
    effectiveType?: string;
}

// Data Saver or a 2G connection: load the film as it's reached instead of all of it up front.
function leanNetwork() {
    const net = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    return net?.saveData === true || /2g/.test(net?.effectiveType ?? '');
}

interface StageProps {
    scenes: TimedScene[];
    poster?: string;
    first: number;
    // The first chapter's veil: none under the cover's names.
    firstVeil: number;
    opened: boolean;
    // The editor scrolls a frame, not the window.
    scrollRoot: RefObject<HTMLElement | null> | null;
    still: boolean;
    // Words placed on the film at its moments.
    moments?: FilmMoment[];
    // Ease to the nearest moment when the guest stops scrolling.
    settle?: boolean;
    // Reading the invitation without the walk: the film rests on this moment, dimmed behind the words.
    resting?: number;
    children: ReactNode;
}

const momentLook: Record<NonNullable<FilmMoment['style']>, string> = {
    kicker: 'text-[3.4cqw] tracking-[0.38em] text-(--inv-gold) uppercase',
    line: 'inv-display text-[6.4cqw] leading-snug text-[#fff6e2]',
    script: 'inv-script text-[12cqw] leading-tight text-(--inv-gold)',
};

// A picture ready to draw: one frame cut from a sheet, or a whole still.
interface Picture {
    source: ImageBitmap;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
}

interface Pictures {
    a: Picture;
    b?: Picture;
    mix: number;
}

// Every scene is shown in the same upright column as the film.
const ASPECT = 9 / 16;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const ease = (p: number) => {
    const x = clamp(p);
    return x * x * (3 - 2 * x);
};

function paint(
    ctx: CanvasRenderingContext2D,
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

export function FilmStage({
    scenes,
    poster,
    first,
    firstVeil,
    opened,
    scrollRoot,
    still,
    moments,
    settle = false,
    resting,
    children,
}: StageProps) {
    const { t: say, dir } = useInvite();
    const words = useRef<(HTMLElement | null)[]>([]);
    const reduced = useReducedMotion() === true;
    const snap = still || reduced;
    const time = useMemo(() => motionValue(0), []);
    const spans = useRef(new Set<FilmTravelSpan>());
    const canvas = useRef<HTMLCanvasElement>(null);
    const blur = useRef<HTMLCanvasElement>(null);
    const veil = useRef<HTMLDivElement>(null);
    const posterEl = useRef<HTMLImageElement>(null);
    const frame = useRef(0);
    const drawRef = useRef<() => void>(() => undefined);
    const schedule = useCallback(() => {
        if (frame.current) return;
        frame.current = requestAnimationFrame(() => {
            frame.current = 0;
            drawRef.current();
        });
    }, []);
    const caches = useRef<(SheetCache | null)[]>([]);
    const stills = useRef(new Map<string, ImageBitmap>());

    // Load every scene: the first film's opening stretch first, later scenes a moment after.
    useEffect(() => {
        const lean = leanNetwork();
        const list = scenes.map((scene) =>
            scene.kind === 'film' && scene.frames
                ? new SheetCache(scene.frames.sheets.map(photoUrl), schedule, lean ? 2 : DECODED)
                : null,
        );
        caches.current = list;
        const timers = scenes.map((scene, i) =>
            window.setTimeout(
                () => {
                    const cache = list[i];
                    const f = scene.frames;
                    if (!cache || !f) return;
                    const total = Math.ceil(f.count / (f.cols * f.rows));
                    const leadAt = clamp((first - scene.start) / Math.max(0.01, scene.duration));
                    const lead = frameCell(f, frameAt(f, leadAt * scene.duration).index).sheet;
                    // On a lean connection only the opening's stretch loads ahead; the rest as it's reached.
                    cache.prefetch(
                        lean
                            ? range(i === 0 ? lead + 1 : 1)
                            : [...range(lead + 1), ...range(total)],
                    );
                },
                i === 0 ? 0 : 1200,
            ),
        );
        let live = true;
        const decoded = new Map<string, ImageBitmap>();
        for (const key of new Set(scenes.map((s) => (s.kind === 'still' ? s.image : undefined)))) {
            if (!key) continue;
            void fetch(photoUrl(key))
                .then((r) => (r.ok ? r.blob() : null))
                .then((blob) => (blob ? createImageBitmap(blob) : null))
                .catch(() => null)
                .then((bitmap) => {
                    if (!bitmap) return;
                    if (!live) {
                        bitmap.close();
                        return;
                    }
                    decoded.set(key, bitmap);
                    schedule();
                });
        }
        stills.current = decoded;
        schedule();
        return () => {
            live = false;
            timers.forEach((t) => {
                clearTimeout(t);
            });
            list.forEach((c) => c?.close());
            caches.current = [];
            decoded.forEach((b) => {
                b.close();
            });
            decoded.clear();
        };
    }, [scenes, first, schedule]);

    // Draw the film at its current time: the scene's frame (two nearest crossfaded) through its camera,
    // and during an exit, the next scene fading in or growing out of the door the camera flies into.
    useEffect(() => {
        const pictures = (i: number, local: number): Pictures | null => {
            const scene = scenes[i];
            if (!scene) return null;
            if (scene.kind === 'still') {
                const bitmap = scene.image ? stills.current.get(scene.image) : undefined;
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
            const cache = caches.current[i];
            if (!f || !cache) return null;
            const pick = frameAt(f, local);
            const ca = frameCell(f, pick.index);
            const cb = frameCell(f, pick.next);
            const sheetA = cache.get(ca.sheet);
            const sheetB = cache.get(cb.sheet);
            cache.want(ca.sheet + 1);
            if (!sheetA) return null;
            const cut = (source: ImageBitmap, c: typeof ca): Picture => ({
                source,
                sx: c.col * f.width,
                sy: c.row * f.height,
                sw: f.width,
                sh: f.height,
            });
            return {
                a: cut(sheetA, ca),
                b: sheetB ? cut(sheetB, cb) : undefined,
                mix: pick.mix,
            };
        };
        drawRef.current = () => {
            const el = canvas.current;
            const ctx = el?.getContext('2d');
            if (!el || !ctx) return;
            const t = time.get();
            const place = sceneAt(scenes, t);
            const scene = scenes[place.index];
            const current = pictures(place.index, place.local);
            if (!scene || !current) return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.round(el.clientWidth * dpr);
            const h = Math.round(el.clientHeight * dpr);
            if (el.width !== w || el.height !== h) {
                el.width = w;
                el.height = h;
            }
            // Fit the height, like the upright film frame: cropped on phones, centred on wide screens.
            const dw = h * ASPECT;
            const column = {
                x: (w - dw) / 2,
                y: 0,
                w: dw,
                h,
            };
            const focus = cameraAt(scene.camera, place.local / Math.max(0.01, scene.duration));
            const exit = exitAt(scenes, place);
            const next = exit.next;
            ctx.clearRect(0, 0, w, h);
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
                    if (after)
                        paint(ctx, after.a, cameraAt(next.camera, 0), column, ease(exit.progress));
                }
            }
            ctx.globalAlpha = 1;
            // The blurred fill either side, from a tiny copy of the same picture.
            const fill = blur.current?.getContext('2d');
            const tiny = {
                x: 0,
                y: 0,
                w: 24,
                h: 42,
            };
            if (fill && dw < w) paint(fill, current.a, focus, tiny, 1);
            if (posterEl.current) posterEl.current.style.opacity = '0';
            // The moment on screen, for checks and the editor's tests.
            el.parentElement?.setAttribute('data-film-time', t.toFixed(2));
            moments?.forEach((m, i) => {
                const word = words.current[i];
                if (!word) return;
                const a = momentAlpha(m, t);
                word.style.opacity = String(a);
                word.style.transform = `translateY(calc(-50% + ${String((1 - a) * 14)}px))`;
                word.setAttribute('aria-hidden', a > 0.5 ? 'false' : 'true');
            });
        };
        schedule();
        const off = time.on('change', schedule);
        window.addEventListener('resize', schedule);
        return () => {
            off();
            window.removeEventListener('resize', schedule);
        };
    }, [scenes, time, schedule, snap, moments]);

    // Once open, the scroll position sets the film's time and how dim it sits behind the words.
    useEffect(() => {
        if (!opened) return;
        const root = scrollRoot?.current ?? null;
        const target: HTMLElement | Window = root ?? window;
        let tick = 0;
        const update = () => {
            tick = 0;
            if (resting !== undefined) {
                time.set(resting);
                if (veil.current) veil.current.style.opacity = String(VEIL);
                return;
            }
            const viewTop = root ? root.getBoundingClientRect().top : 0;
            const vh = root ? root.clientHeight : window.innerHeight;
            const list = [...spans.current].sort((x, y) => x.order - y.order);
            let t = first;
            let dim = firstVeil;
            let previous = firstVeil;
            for (const span of list) {
                const r = span.el.getBoundingClientRect();
                const top = r.top - viewTop;
                if (top >= vh) break;
                const bottom = r.bottom - viewTop;
                const travel = r.height - vh;
                const p = travel > 0 ? clamp(-top / travel) : top <= 0 ? 1 : 0;
                const k = snap ? (p < 0.5 ? 0 : 1) : p;
                t = span.from + (span.to - span.from) * k;
                // Dim while the last chapter's words are still leaving, or the next chapter's arriving.
                dim = Math.max(clamp(top / vh) * previous, clamp((vh - bottom) / vh) * span.veil);
                previous = span.veil;
            }
            time.set(t);
            if (veil.current) veil.current.style.opacity = String(dim * VEIL);
        };
        // When asked for, a pause mid-travel eases on to the nearer moment, so the film rests on one.
        let rest = 0;
        const settleNow = () => {
            const viewTop = root ? root.getBoundingClientRect().top : 0;
            const vh = root ? root.clientHeight : window.innerHeight;
            for (const span of spans.current) {
                const r = span.el.getBoundingClientRect();
                const top = r.top - viewTop;
                const travel = r.height - vh;
                const p = travel > 0 ? -top / travel : 0;
                if (p <= 0.02 || p >= 0.98) continue;
                target.scrollBy({
                    top: p < 0.5 ? top : top + travel,
                    behavior: 'smooth',
                });
                return;
            }
        };
        const onScroll = () => {
            if (!tick) tick = requestAnimationFrame(update);
            if (settle && !snap && resting === undefined) {
                clearTimeout(rest);
                rest = window.setTimeout(settleNow, 260);
            }
        };
        update();
        target.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            clearTimeout(rest);
            cancelAnimationFrame(tick);
            target.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [opened, scrollRoot, first, firstVeil, snap, time, settle, resting]);

    const register = useCallback((span: FilmTravelSpan) => {
        spans.current.add(span);
        window.dispatchEvent(new Event('resize'));
        return () => {
            spans.current.delete(span);
        };
    }, []);
    const value = useMemo(
        () => ({
            time,
            first,
            register,
        }),
        [time, first, register],
    );
    const lift = { marginBottom: 'calc(var(--inv-screen, 100svh) * -1)' };

    return (
        <FilmStageContext value={value}>
            <div
                className="pointer-events-none sticky top-0 z-0 h-[var(--inv-screen,100svh)] overflow-hidden bg-black"
                style={lift}
                data-film-stage
            >
                <canvas
                    aria-hidden
                    ref={blur}
                    width={24}
                    height={42}
                    className="absolute inset-0 size-full scale-110 opacity-50 blur-2xl"
                />
                {poster && (
                    <img
                        aria-hidden
                        ref={posterEl}
                        src={photoUrl(poster)}
                        alt=""
                        className="absolute inset-y-0 start-1/2 aspect-[9/16] h-full max-w-none -translate-x-1/2 object-cover transition-opacity duration-300 rtl:translate-x-1/2"
                    />
                )}
                <canvas aria-hidden ref={canvas} className="absolute inset-0 size-full" />
                <div
                    aria-hidden
                    ref={veil}
                    className="absolute inset-0 bg-[#04061a] transition-opacity duration-300"
                    style={{ opacity: 0 }}
                />
                {moments && moments.length > 0 && (
                    <div className="[container-type:size] absolute inset-y-0 start-1/2 aspect-[9/16] h-full -translate-x-1/2 rtl:translate-x-1/2">
                        {moments.map((m, i) => {
                            // Zones are places in the picture, which is never mirrored.
                            const x = dir === 'rtl' ? 1 - m.zone.x : m.zone.x;
                            const place = {
                                insetInlineStart: `${String((x - m.zone.w / 2) * 100)}%`,
                                top: `${String(m.zone.y * 100)}%`,
                                width: `${String(m.zone.w * 100)}%`,
                                opacity: 0,
                                transform: 'translateY(-50%)',
                            };
                            return (
                                <p
                                    // Moments have no ids: their place in the list is who they are.
                                    key={i}
                                    ref={(el) => {
                                        words.current[i] = el;
                                    }}
                                    aria-hidden
                                    className={`absolute m-0 text-center text-balance [text-shadow:0_2px_18px_rgba(0,0,0,0.65)] ${momentLook[m.style ?? 'line']}`}
                                    style={place}
                                    data-film-moment={i}
                                >
                                    {say(m.text)}
                                </p>
                            );
                        })}
                    </div>
                )}
            </div>
            {children}
        </FilmStageContext>
    );
}
