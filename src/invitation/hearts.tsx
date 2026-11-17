// Double-tap hearts on wishes and gallery photos. Each device sends one heart per wish or photo;
// the counts are shared, so the family sees which blessings and pictures guests loved.
import type { HeartCounts } from '@shared/schemas/guest';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { useInvite } from './context';
import { usePrint } from './print';

// One request per page for every component that shows hearts.
const loaded = new Map<string, Promise<HeartCounts>>();

const likedKey = (slug: string) => `toran-hearts:${slug}`;

function readLiked(slug: string): string[] {
    try {
        const raw = localStorage.getItem(likedKey(slug));
        return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
        return [];
    }
}

function saveLiked(slug: string, liked: string[]) {
    try {
        localStorage.setItem(likedKey(slug), JSON.stringify(liked));
    } catch {
        // Private mode: the heart still counts, this device just forgets it sent one.
    }
}

function loadCounts(slug: string) {
    let counts = loaded.get(slug);
    if (!counts) {
        counts = fetch(`/api/i/${slug}/hearts`)
            .then((res) => (res.ok ? res.json<HeartCounts>() : {}))
            .catch(() => ({}));
        loaded.set(slug, counts);
    }
    return counts;
}

export function useHearts() {
    const { data } = useInvite();
    const print = usePrint();
    const slug = data.invitation.slug;
    // Drafts, previews and the PDF have no guests to heart them.
    const enabled = data.invitation.status === 'published' && !print;
    const [counts, setCounts] = useState<HeartCounts>({});
    const [liked, setLiked] = useState<string[]>([]);

    useEffect(() => {
        if (!enabled) return;
        let live = true;
        void loadCounts(slug).then((c) => {
            if (!live) return;
            setCounts(c);
            setLiked(readLiked(slug));
        });
        return () => {
            live = false;
        };
    }, [slug, enabled]);

    const send = useCallback(
        async (target: string) => {
            if (!enabled || liked.includes(target)) return;
            const next = [...liked, target];
            setLiked(next);
            saveLiked(slug, next);
            setCounts((c) => ({
                ...c,
                [target]: (c[target] ?? 0) + 1,
            }));
            const init: RequestInit = {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ target }),
            };
            const res = await fetch(`/api/i/${slug}/hearts`, init).catch(() => null);
            const body = res?.ok ? await res.json<{ count?: number }>() : null;
            if (body?.count !== undefined) {
                const count = body.count;
                setCounts((c) => ({
                    ...c,
                    [target]: count,
                }));
            }
        },
        [enabled, liked, slug],
    );

    return {
        enabled,
        count: (target: string) => counts[target] ?? 0,
        isLiked: (target: string) => liked.includes(target),
        send,
    };
}

const DOUBLE_TAP_MS = 280;

// Tells a double tap from a single one. The single action (opening a photo) waits a moment so a
// second tap can still turn it into a heart.
export function useDoubleTap(onDouble: () => void, onSingle?: () => void) {
    const last = useRef(0);
    const timer = useRef<number | undefined>(undefined);
    useEffect(
        () => () => {
            window.clearTimeout(timer.current);
        },
        [],
    );
    return () => {
        const now = performance.now();
        if (now - last.current < DOUBLE_TAP_MS) {
            window.clearTimeout(timer.current);
            last.current = 0;
            onDouble();
            return;
        }
        last.current = now;
        if (onSingle) timer.current = window.setTimeout(onSingle, DOUBLE_TAP_MS);
    };
}

const heartPath =
    'M12 21s-7.5-4.6-9.6-9.2C1 8.6 2.9 5 6.4 5c2.1 0 3.5 1.2 4.4 2.6l1.2 1.7 1.2-1.7C14.1 6.2 15.5 5 17.6 5c3.5 0 5.4 3.6 4 6.8C19.5 16.4 12 21 12 21z';

interface IconProps {
    filled: boolean;
    className?: string;
}

export function HeartIcon({ filled, className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <path
                d={heartPath}
                fill={filled ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.8"
            />
        </svg>
    );
}

interface BurstProps {
    // Bumped on every double tap; each value plays one burst.
    burst: number;
}

// The big heart that pops over a photo or wish on a double tap.
export function HeartBurst({ burst }: BurstProps) {
    const reduce = useReducedMotion();
    const pop = {
        scale: [0.2, 1.15, 1, 1.1],
        opacity: [0, 1, 1, 0],
    };
    const fade = { opacity: [0, 1, 0] };
    const timing = {
        duration: reduce ? 0.6 : 0.9,
        times: reduce ? [0, 0.3, 1] : [0, 0.25, 0.6, 1],
        ease: 'easeOut' as const,
    };
    return (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <AnimatePresence>
                {burst > 0 && (
                    <m.span
                        key={burst}
                        initial={{ opacity: 0 }}
                        animate={reduce ? fade : pop}
                        transition={timing}
                        className="text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
                    >
                        <HeartIcon filled className="size-20" />
                    </m.span>
                )}
            </AnimatePresence>
        </span>
    );
}

interface CountProps {
    count: number;
    liked: boolean;
    children?: ReactNode;
}

// A small "♥ 12" pill; hidden until someone has sent a heart.
export function HeartPill({ count, liked, children }: CountProps) {
    if (count === 0 && !liked) return null;
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] text-white tabular-nums backdrop-blur-sm">
            <HeartIcon filled={liked} className="size-3 text-[#ff6b81]" />
            {count}
            {children}
        </span>
    );
}
