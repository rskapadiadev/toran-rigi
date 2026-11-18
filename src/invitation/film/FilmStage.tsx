// The film behind the invitation: one canvas that stays put while the page scrolls over it. The
// film's frames come in sprite sheets; scrolling through a travel spacer moves the film between two
// moments, and sections sit over the frame held between travels.
import { type FilmFrames, frameAt, frameCell } from '@shared/film';
import { photoUrl } from '@shared/photos';
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
                for (const old of this.recent.slice(DECODED)) {
                    this.bitmaps.get(old)?.close();
                    this.bitmaps.delete(old);
                }
                this.recent = this.recent.slice(0, DECODED);
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

interface StageProps {
    frames: FilmFrames;
    poster?: string;
    first: number;
    // The first chapter's veil: none under the cover's names.
    firstVeil: number;
    opened: boolean;
    // The editor scrolls a frame, not the window.
    scrollRoot: RefObject<HTMLElement | null> | null;
    still: boolean;
    children: ReactNode;
}

export function FilmStage({
    frames,
    poster,
    first,
    firstVeil,
    opened,
    scrollRoot,
    still,
    children,
}: StageProps) {
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
    const cacheRef = useRef<SheetCache | null>(null);

    useEffect(() => {
        const per = frames.cols * frames.rows;
        const sheetOf = (t: number) => frameCell(frames, frameAt(frames, t).index).sheet;
        // The opening's stretch first (it plays straight away after the tap), then the rest in order.
        const lead = sheetOf(first);
        const order = [
            ...Array.from({ length: lead + 1 }, (_, i) => i),
            ...Array.from({ length: Math.ceil(frames.count / per) }, (_, i) => i),
        ];
        const cache = new SheetCache(frames.sheets.map(photoUrl), schedule);
        cacheRef.current = cache;
        cache.prefetch(order);
        schedule();
        return () => {
            cache.close();
            cacheRef.current = null;
        };
    }, [frames, first, schedule]);

    // Draw the frame at the film's current time: the two nearest frames crossfaded.
    useEffect(() => {
        drawRef.current = () => {
            const el = canvas.current;
            const ctx = el?.getContext('2d');
            const cache = cacheRef.current;
            if (!el || !ctx || !cache) return;
            const pick = frameAt(frames, time.get());
            const a = frameCell(frames, pick.index);
            const b = frameCell(frames, pick.next);
            const sheetA = cache.get(a.sheet);
            const sheetB = cache.get(b.sheet);
            cache.want(a.sheet + 1);
            if (!sheetA) return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.round(el.clientWidth * dpr);
            const h = Math.round(el.clientHeight * dpr);
            if (el.width !== w || el.height !== h) {
                el.width = w;
                el.height = h;
            }
            // Fit the height, like the upright film frame: cropped on phones, centred on wide screens.
            const dw = (h * frames.width) / frames.height;
            const dx = (w - dw) / 2;
            const paint = (sheet: ImageBitmap, cell: typeof a, alpha: number) => {
                ctx.globalAlpha = alpha;
                ctx.drawImage(
                    sheet,
                    cell.col * frames.width,
                    cell.row * frames.height,
                    frames.width,
                    frames.height,
                    dx,
                    0,
                    dw,
                    h,
                );
            };
            ctx.clearRect(0, 0, w, h);
            paint(sheetA, a, 1);
            if (sheetB && pick.mix > 0.02 && !snap) paint(sheetB, b, pick.mix);
            ctx.globalAlpha = 1;
            // The blurred fill either side, from a tiny copy of the same frame.
            const fill = blur.current?.getContext('2d');
            if (fill && dw < w)
                fill.drawImage(
                    sheetA,
                    a.col * frames.width,
                    a.row * frames.height,
                    frames.width,
                    frames.height,
                    0,
                    0,
                    24,
                    42,
                );
            if (posterEl.current) posterEl.current.style.opacity = '0';
            // The frame on screen, for checks and the editor's tests.
            el.parentElement?.setAttribute('data-film-time', time.get().toFixed(2));
        };
        schedule();
        const off = time.on('change', schedule);
        window.addEventListener('resize', schedule);
        return () => {
            off();
            window.removeEventListener('resize', schedule);
        };
    }, [frames, time, schedule, snap]);

    // Once open, the scroll position sets the film's time and how dim it sits behind the words.
    useEffect(() => {
        if (!opened) return;
        const root = scrollRoot?.current ?? null;
        const target: HTMLElement | Window = root ?? window;
        let tick = 0;
        const update = () => {
            tick = 0;
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
        const onScroll = () => {
            if (!tick) tick = requestAnimationFrame(update);
        };
        update();
        target.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(tick);
            target.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [opened, scrollRoot, first, firstVeil, snap, time]);

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
                aria-hidden
                className="pointer-events-none sticky top-0 z-0 h-[var(--inv-screen,100svh)] overflow-hidden bg-black"
                style={lift}
                data-film-stage
            >
                <canvas
                    ref={blur}
                    width={24}
                    height={42}
                    className="absolute inset-0 size-full scale-110 opacity-50 blur-2xl"
                />
                {poster && (
                    <img
                        ref={posterEl}
                        src={photoUrl(poster)}
                        alt=""
                        className="absolute inset-y-0 start-1/2 aspect-[9/16] h-full max-w-none -translate-x-1/2 object-cover transition-opacity duration-300 rtl:translate-x-1/2"
                    />
                )}
                <canvas ref={canvas} className="absolute inset-0 size-full" />
                <div
                    ref={veil}
                    className="absolute inset-0 bg-[#04061a] transition-opacity duration-300"
                    style={{ opacity: 0 }}
                />
            </div>
            {children}
        </FilmStageContext>
    );
}
