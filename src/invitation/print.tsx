// The PDF edition: still pages, each exactly one phone screen. Sections that can lay themselves
// out as pages mark them with data-print-page; anything else is fitted (shrunk) to a page.
import { createContext, use, useEffect } from 'react';

export const PAGE_W = 430;
export const PAGE_H = 932;

export const PrintContext = createContext(false);
export const usePrint = () => use(PrintContext);

// Every page of the document, in order: a section's own pages when it has them, else the section.
export function printPages(root: HTMLElement): HTMLElement[] {
    const pages: HTMLElement[] = [];
    for (const block of Array.from(root.querySelectorAll<HTMLElement>('main > *'))) {
        const own = Array.from(block.querySelectorAll<HTMLElement>('[data-print-page]'));
        if (own.length > 0) pages.push(...own);
        else if (block.offsetHeight > 0) pages.push(block);
    }
    return pages;
}

// Below this, words get too small to read: the section keeps this size and runs on to more pages.
const SMALLEST = 0.72;
const RUNNING_ON = 0.85;

// Shrinks a section to `scale` with a transform: browsers disagree on how zoomed boxes measure.
function shrink(page: HTMLElement, scale: number) {
    const rtl = getComputedStyle(page).direction === 'rtl';
    page.style.width = `${String(PAGE_W / scale)}px`;
    page.style.minHeight = `${String(PAGE_H / scale)}px`;
    page.style.transformOrigin = rtl ? '100% 0' : '0 0';
    page.style.transform = `scale(${String(scale)})`;
    // The room it no longer takes up.
    page.style.marginBottom = `${String(-page.offsetHeight * (1 - scale))}px`;
}

// Fits each section to one page: short ones grow to fill it, tall ones shrink to fit it.
export function usePrintFit(root: React.RefObject<HTMLElement | null>, on: boolean) {
    useEffect(() => {
        const el = root.current;
        if (!on || !el) return;
        const fit = () => {
            for (const page of printPages(el)) {
                if (page.hasAttribute('data-print-page')) continue;
                page.style.minHeight = `${String(PAGE_H)}px`;
                if (page.scrollHeight <= PAGE_H + 2) continue;
                // A shrunk section is also wider inside, so it comes out shorter: measure it twice.
                const guess = Math.max(SMALLEST, PAGE_H / page.scrollHeight);
                page.style.minHeight = '';
                page.style.width = `${String(PAGE_W / guess)}px`;
                const fitted = PAGE_H / page.scrollHeight;
                shrink(page, fitted < SMALLEST ? RUNNING_ON : Math.min(1, fitted));
            }
            el.setAttribute('data-print-ready', '');
        };
        // Pages are captured without scrolling, so lazy images must load now; fit once fonts and
        // every image are in, so heights are final.
        const images = Array.from(el.querySelectorAll('img'));
        for (const img of images) img.loading = 'eager';
        const loaded = images.map((img) =>
            img.complete ? Promise.resolve() : img.decode().catch(() => undefined),
        );
        void Promise.all([document.fonts.ready, ...loaded]).then(() => {
            window.setTimeout(fit, 300);
        });
    }, [root, on]);
}
