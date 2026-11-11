import { type RefObject, useEffect, useRef, useState } from 'react';

export function useInView<T extends Element>(
    options: IntersectionObserverInit = { threshold: 0.2 },
): [RefObject<T | null>, boolean] {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) {
                setInView(true);
                observer.disconnect();
            }
        }, options);
        observer.observe(el);
        return () => {
            observer.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- options are static per call site
    }, []);
    return [ref, inView];
}
