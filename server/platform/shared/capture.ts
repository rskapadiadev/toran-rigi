// The browser-agnostic part of photographing pages: the PDF's print edition, page by page, and the
// matching cards. Adapters supply the browser calls.
import type { CapturedPage, CardShot, PageLink } from '../types';

export const PAGE_W = 430;
export const PAGE_H = 932;
// Twice the page size: sharp text on phones and when zoomed, still a few hundred KB a page.
export const SCALE = 2;
export const JPEG_QUALITY = 80;

interface PreparedPage {
    // Where the page starts in the window, after scrolling to it.
    top: number;
    height: number;
    links: PageLink[];
    anchors: string[];
}

export interface Clip {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface CaptureDriver {
    goto(url: string): Promise<void>;
    waitForReady(): Promise<void>;
    // Brings page n into the window and says where it is; null after the last one.
    prepare(n: number): Promise<PreparedPage | null>;
    shoot(clip: Clip): Promise<Uint8Array>;
}

// Bundlers that keep function names wrap inner functions in this helper, which the page doesn't have.
export const NAME_SHIM = 'globalThis.__name ??= (f) => f';

// Runs inside the page. Pages are found, measured and scrolled to one at a time, right before each is
// photographed: resizing the window to reach them would stretch every full-screen section.
// A section taller than a page continues on the next, cut between its items, never through one.
export function preparePage(n: number): PreparedPage | null {
    const PAGE = 932;
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-print-off]'))) {
        el.style.visibility = '';
        el.removeAttribute('data-print-off');
    }
    const pages: HTMLElement[] = [];
    for (const block of Array.from(document.querySelectorAll<HTMLElement>('main > *'))) {
        const own = Array.from(block.querySelectorAll<HTMLElement>('[data-print-page]'));
        if (own.length > 0) pages.push(...own);
        else if (block.offsetHeight > 0) pages.push(block);
    }
    let before = 0;
    for (const el of pages) {
        const box = el.getBoundingClientRect();
        const starts = [0];
        // Everything smaller than a page; of these, all but hairlines must stay whole.
        const items = Array.from(el.querySelectorAll<HTMLElement>('*')).flatMap((item) => {
            const r = item.getBoundingClientRect();
            return r.height > 0 && r.height <= PAGE * 0.9 && r.width > 0
                ? [
                      {
                          item,
                          from: r.top - box.top,
                          to: r.bottom - box.top,
                      },
                  ]
                : [];
        });
        let from = 0;
        while (box.height - from > PAGE * 1.02) {
            let cut = from + PAGE;
            for (let moved = true; moved;) {
                moved = false;
                for (const i of items)
                    if (
                        i.to - i.from >= 20 &&
                        i.from < cut &&
                        i.to > cut + 1 &&
                        i.from > from + PAGE * 0.25
                    ) {
                        cut = i.from;
                        moved = true;
                    }
            }
            starts.push(cut);
            from = cut;
        }
        if (n >= before + starts.length) {
            before += starts.length;
            continue;
        }
        const part = n - before;
        const start = starts[part] ?? 0;
        const end = starts[part + 1] ?? box.height;
        // The last part ends with its section, so the next section never shows below it.
        const shown = Math.max(0, Math.min(start, box.height - PAGE));
        for (const i of items)
            if (i.from >= end - 1 || i.to <= start + 1) {
                i.item.style.visibility = 'hidden';
                i.item.setAttribute('data-print-off', '');
            }
        window.scrollTo(0, box.top + window.scrollY + shown);
        const top = el.getBoundingClientRect().top + shown;
        const height = Math.min(PAGE, Math.round(box.height));
        const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('a[href]'))
            .filter(
                (a) =>
                    a.closest('[data-print-off]') === null &&
                    (/^https?:/.test(a.href) || a.getAttribute('href')?.startsWith('#') === true),
            )
            .map((a) => {
                const q = a.getBoundingClientRect();
                const raw = a.getAttribute('href') ?? '';
                return {
                    href: raw.startsWith('#') ? raw : a.href,
                    x: q.left,
                    y: q.top - top,
                    w: q.width,
                    h: q.height,
                };
            })
            .filter((l) => l.w > 0 && l.h > 0 && l.y >= 0 && l.y < height);
        const anchors = [el, ...Array.from(el.querySelectorAll<HTMLElement>('[id]'))]
            .filter((x) => x.closest('[data-print-off]') === null)
            .map((x) => x.id)
            .filter(Boolean);
        return {
            top,
            height,
            links,
            anchors,
        };
    }
    return null;
}

const STEP_MS = 120;
const SETTLE_MS = 1500;
const wait = (ms: number) =>
    new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });

// A broken layout must not keep the browser photographing for ever.
const MAX_PAGES = 80;

export async function capturePages(driver: CaptureDriver, url: string): Promise<CapturedPage[]> {
    await driver.goto(url);
    await driver.waitForReady();
    // Words, props and photos come in as they are scrolled to: walk past everything once, then wait.
    let count = 0;
    while (count < MAX_PAGES && (await driver.prepare(count))) {
        count++;
        await wait(STEP_MS);
    }
    await wait(SETTLE_MS);
    const shots: CapturedPage[] = [];
    for (let n = 0; n < count; n++) {
        const page = await driver.prepare(n);
        if (!page) break;
        await wait(STEP_MS);
        const jpeg = await driver.shoot({
            x: 0,
            y: page.top,
            width: PAGE_W,
            height: page.height,
        });
        shots.push({
            jpeg,
            height: page.height,
            links: page.links,
            anchors: page.anchors,
        });
    }
    return shots;
}

// Print cards are JPEGs at 600 dpi: near-lossless, and a fraction of a PNG's size.
export const CARD_QUALITY = 94;

export const wholeCard = (shot: CardShot): Clip => ({
    x: 0,
    y: 0,
    width: shot.width,
    height: shot.height,
});

export interface CardDriver {
    open(shot: CardShot): Promise<void>;
    shoot(shot: CardShot): Promise<Uint8Array>;
}

// Cards are photographed one after another in the same browser: opening one is the slow part.
export async function captureCards(driver: CardDriver, shots: CardShot[]): Promise<Uint8Array[]> {
    const images: Uint8Array[] = [];
    for (const shot of shots) {
        await driver.open(shot);
        images.push(await driver.shoot(shot));
    }
    return images;
}
