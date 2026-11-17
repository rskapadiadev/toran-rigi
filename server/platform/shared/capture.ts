// The browser-agnostic part of capturing a print edition: wait for it to lay itself out, find its
// pages and their links, then photograph each page. Adapters supply the browser calls.
import type { CapturedPage, PageLink } from '../types';

export const PAGE_W = 430;
export const PAGE_H = 932;
// Twice the page size: sharp text on phones and when zoomed, still a few hundred KB a page.
export const SCALE = 2;
export const JPEG_QUALITY = 80;

interface FoundPage {
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
    // Runs findPages in the page and returns its result.
    findPages(): Promise<FoundPage[]>;
    shoot(clip: Clip): Promise<Uint8Array>;
}

// Runs inside the page: each section's own [data-print-page]s, else the section itself.
export function findPagesInDocument(): FoundPage[] {
    const out: FoundPage[] = [];
    for (const block of Array.from(document.querySelectorAll<HTMLElement>('main > *'))) {
        const own = Array.from(block.querySelectorAll<HTMLElement>('[data-print-page]'));
        const list = own.length > 0 ? own : block.offsetHeight > 0 ? [block] : [];
        for (const el of list) {
            const r = el.getBoundingClientRect();
            const top = r.top + window.scrollY;
            const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('a[href]'))
                .filter((a) => /^https?:/.test(a.href) || a.getAttribute('href')?.startsWith('#'))
                .map((a) => {
                    const q = a.getBoundingClientRect();
                    const raw = a.getAttribute('href') ?? '';
                    return {
                        href: raw.startsWith('#') ? raw : a.href,
                        x: q.left,
                        y: q.top + window.scrollY - top,
                        w: q.width,
                        h: q.height,
                    };
                })
                .filter((l) => l.w > 0 && l.h > 0);
            const ids = [el, ...Array.from(el.querySelectorAll<HTMLElement>('[id]'))]
                .map((x) => x.id)
                .filter(Boolean);
            out.push({
                top,
                height: r.height,
                links,
                anchors: ids,
            });
        }
    }
    return out;
}

export async function capturePages(driver: CaptureDriver, url: string): Promise<CapturedPage[]> {
    await driver.goto(url);
    await driver.waitForReady();
    const pages = await driver.findPages();
    const shots: CapturedPage[] = [];
    for (const page of pages) {
        const height = Math.min(PAGE_H, Math.round(page.height));
        const jpeg = await driver.shoot({
            x: 0,
            y: page.top,
            width: PAGE_W,
            height,
        });
        shots.push({
            jpeg,
            height,
            links: page.links,
            anchors: page.anchors,
        });
    }
    return shots;
}
