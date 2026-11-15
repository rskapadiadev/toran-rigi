// Shared bits for the hands-on openings (pull the light, the chain, the zip, the ribbon, the veil):
// one drag feel everywhere, a tap that plays the gesture for you, and a prompt pill that never
// steals the pointer.
import {
    type KeyboardEvent,
    type PointerEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

interface PullOptions {
    /** Furthest the handle travels, in px. */
    max: number;
    /** 'down' pulls a cord or chain; 'up' lifts a veil. */
    direction?: 'down' | 'up';
    /** Fraction of `max` that counts as done when the guest lets go. */
    threshold?: number;
    /** Called once: on a pull past the threshold, on a plain tap, or on Enter/Space. */
    onPass: () => void;
    /** First touch: the gesture browsers require before music may play. */
    onStart?: () => void;
    disabled?: boolean;
}

export function usePull({
    max,
    direction = 'down',
    threshold = 0.55,
    onPass,
    onStart,
    disabled = false,
}: PullOptions) {
    const [pull, setPull] = useState(0);
    const [dragging, setDragging] = useState(false);
    const start = useRef<{ y: number;
moved: boolean } | null>(null);
    const latest = useRef(0);
    const begun = useRef(false);

    const begin = () => {
        if (begun.current) return;
        begun.current = true;
        onStart?.();
    };

    const measure = (clientY: number) => {
        const s = start.current;
        if (!s) return 0;
        const raw = direction === 'down' ? clientY - s.y : s.y - clientY;
        // Past the end the handle resists, like a cord at full stretch.
        const eased = raw > max ? max + (raw - max) * 0.15 : raw;
        return Math.max(0, eased);
    };

    const handlers = {
        onPointerDown: (e: PointerEvent<HTMLElement>) => {
            if (disabled) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            start.current = {
                y: e.clientY,
                moved: false,
            };
            setDragging(true);
            begin();
        },
        onPointerMove: (e: PointerEvent<HTMLElement>) => {
            const s = start.current;
            if (!s) return;
            const value = measure(e.clientY);
            if (value > 6) s.moved = true;
            latest.current = value;
            setPull(value);
        },
        onPointerUp: () => {
            const s = start.current;
            start.current = null;
            setDragging(false);
            if (!s) return;
            // A plain tap plays the whole gesture; a short pull springs back.
            if (!s.moved || latest.current >= max * threshold) onPass();
            else setPull(0);
            latest.current = 0;
        },
        onPointerCancel: () => {
            start.current = null;
            setDragging(false);
            setPull(0);
        },
        onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
            if (disabled || (e.key !== 'Enter' && e.key !== ' ')) return;
            e.preventDefault();
            begin();
            onPass();
        },
    };

    return {
        pull,
        progress: Math.min(1, pull / max),
        dragging,
        handlers,
    };
}

/** Runs `onOpened` after `ms`, and never twice. */
export function useFinish(onOpened: () => void) {
    const done = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(
        () => () => {
            clearTimeout(timer.current);
        },
        [],
    );
    return useCallback(
        (ms: number) => {
            if (done.current) return;
            done.current = true;
            timer.current = setTimeout(onOpened, ms);
        },
        [onOpened],
    );
}

/** The bottom prompt as a label, not a button: the gesture lives on the handle itself. */
export function PromptPill({ children, hidden = false }: { children: string;
hidden?: boolean }) {
    return (
        <p
            aria-live="polite"
            className={`pointer-events-none absolute inset-x-0 bottom-[8svh] z-30 mx-auto w-fit rounded-3xl bg-(--inv-bg)/70 px-7 py-3 text-xs tracking-[0.28em] uppercase shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md transition-opacity duration-500 ${hidden ? 'opacity-0' : 'opacity-100'}`}
        >
            {children}
        </p>
    );
}
