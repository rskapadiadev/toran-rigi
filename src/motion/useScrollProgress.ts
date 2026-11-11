import { type RefObject, useEffect, useRef } from 'react';

// Writes --p (0 when the element enters the viewport bottom, 1 at ~40% height) without React re-renders.
export function useScrollProgress<T extends HTMLElement>(enabled = true): RefObject<T | null> {
    const ref = useRef<T>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!enabled) {
            el.style.setProperty('--p', '1');
            return;
        }
        let frame = 0;
        let active = false;
        const update = () => {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.6)));
            el.style.setProperty('--p', p.toFixed(3));
            frame = active ? requestAnimationFrame(update) : 0;
        };
        const observer = new IntersectionObserver(([entry]) => {
            active = Boolean(entry?.isIntersecting);
            if (active && !frame) frame = requestAnimationFrame(update);
        });
        observer.observe(el);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [enabled]);
    return ref;
}
