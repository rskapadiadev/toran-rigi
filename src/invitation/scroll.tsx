import { useScroll, type UseScrollOptions } from 'motion/react';
import { createContext, type RefObject, use } from 'react';

// The element that scrolls the invitation: null on the live page (the window), the canvas frame
// inside the visual editor. Scroll-driven sections must watch the right one.
export const ScrollRootContext = createContext<RefObject<HTMLElement | null> | null>(null);

export function findScrollParent(el: HTMLElement | null): HTMLElement | null {
    for (let p = el?.parentElement ?? null; p; p = p.parentElement) {
        const { overflowY } = getComputedStyle(p);
        if (overflowY === 'auto' || overflowY === 'scroll') return p;
    }
    return null;
}

type Offset = UseScrollOptions['offset'];

// Progress (0 → 1) of `target` moving through the viewport, in whichever element scrolls the invite.
export function useSectionScroll(target: RefObject<HTMLElement | null>, offset?: Offset) {
    const root = use(ScrollRootContext);
    return useScroll({
        target,
        // The ref (not its value): it is filled during commit, before motion subscribes.
        container: root ?? undefined,
        offset: offset ?? ['start start', 'end end'],
    });
}

// Replays the entry ritual from inside the invitation (the closing's "seal the envelope again").
export const ReplayOpeningContext = createContext<(() => void) | null>(null);
export const useReplayOpening = () => use(ReplayOpeningContext);
