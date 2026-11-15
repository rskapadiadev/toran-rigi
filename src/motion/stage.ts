// Whether the stage is set: an opening (envelope, doors…) may still cover the page.
import { useInView } from 'motion/react';
import { createContext, type RefObject, use } from 'react';

// False while an opening (envelope, doors…) still covers the page. Entrances wait for it, so whatever
// is on screen when the opening lifts plays then, and the rest plays as it scrolls into view.
export const StageContext = createContext(true);

/** True once the opening has finished and `ref` is (or has been) on screen. */
export function useEntrance(ref: RefObject<Element | null>): boolean {
    const ready = use(StageContext);
    // 'some' and no bottom inset: clip-path presets start as a sliver (the observer measures the
    // clipped area), and a sliver at the screen's foot must still count as "in view".
    const inView = useInView(ref, {
        once: true,
        amount: 'some',
    });
    return ready && inView;
}
