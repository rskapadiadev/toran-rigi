// The chapter bar over a film invitation: a fine progress line with a tick for each chapter, the
// chapter being read, Next, which glides on through the film to the next chapter, and a way to read
// the invitation without the walk.
import type { SectionType } from '@shared/types';
import { useReducedMotion } from 'motion/react';
import { type RefObject, useEffect, useRef, useState } from 'react';

import { useInvite } from '../context';
import type { StringKey } from '../strings';

const titles: Partial<Record<SectionType, StringKey>> = {
    date: 'theDate',
    blessing: 'chapterBlessing',
    card: 'chapterInvitation',
    welcome: 'chapterWelcome',
    story: 'ourStory',
    events: 'celebrations',
    countdown: 'countdown',
    venue: 'location',
    travel: 'travelTitle',
    dressCode: 'dressCode',
    family: 'family',
    gallery: 'chapterGallery',
    live: 'watchLive',
    rsvp: 'rsvpTitle',
    wishes: 'wishesTitle',
    shagun: 'shagunTitle',
    closing: 'withLove',
};

// Each chapter's words begin where the travel stretch before it ends.
const travelsIn = (root: HTMLElement | null) =>
    [...(root ?? document).querySelectorAll<HTMLElement>('[data-film-travel]')].sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
    );

interface Props {
    // The first section of each chapter, in order.
    starts: SectionType[];
    scrollRoot: RefObject<HTMLElement | null> | null;
    reading: boolean;
    onRead: (reading: boolean) => void;
}

export function FilmChapters({ starts, scrollRoot, reading, onRead }: Props) {
    const { copy, names } = useInvite();
    const reduced = useReducedMotion() === true;
    const [current, setCurrent] = useState(0);
    // Hidden on the cover, where it would sit on the names; it arrives once the guest scrolls on.
    const [away, setAway] = useState(false);
    const line = useRef<HTMLDivElement>(null);
    const name = (type: SectionType | undefined) => {
        if (!type) return '';
        const key = titles[type];
        return key ? copy(key) : names.title;
    };

    useEffect(() => {
        const root = scrollRoot?.current ?? null;
        const target: HTMLElement | Window = root ?? window;
        let tick = 0;
        const update = () => {
            tick = 0;
            const viewTop = root ? root.getBoundingClientRect().top : 0;
            const vh = root ? root.clientHeight : window.innerHeight;
            const top = root ? root.scrollTop : window.scrollY;
            const height = (root ? root.scrollHeight : document.documentElement.scrollHeight) - vh;
            if (line.current)
                line.current.style.transform = `scaleX(${String(height > 0 ? top / height : 0)})`;
            // A chapter becomes the current one once its words reach the middle of the screen.
            const reached = travelsIn(root).filter(
                (el) => el.getBoundingClientRect().bottom - viewTop < vh * 0.5,
            ).length;
            setCurrent(reached);
            setAway(top > vh * 0.5);
        };
        const onScroll = () => {
            if (!tick) tick = requestAnimationFrame(update);
        };
        tick = requestAnimationFrame(update);
        target.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(tick);
            target.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [scrollRoot]);

    // The ticks sit where each chapter's words begin, as a share of the whole page.
    const [ticks, setTicks] = useState<number[]>([]);
    useEffect(() => {
        const root = scrollRoot?.current ?? null;
        const measure = () => {
            const vh = root ? root.clientHeight : window.innerHeight;
            const top = root ? root.scrollTop : window.scrollY;
            const viewTop = root ? root.getBoundingClientRect().top : 0;
            const height = (root ? root.scrollHeight : document.documentElement.scrollHeight) - vh;
            setTicks(
                travelsIn(root).map((el) =>
                    height > 0 ? (el.getBoundingClientRect().bottom - viewTop + top) / height : 0,
                ),
            );
        };
        // Also measures once straight away: an observer reports on first observing.
        const observer = new ResizeObserver(measure);
        observer.observe(root ?? document.documentElement);
        return () => {
            observer.disconnect();
        };
    }, [scrollRoot, starts.length]);

    const next = () => {
        const root = scrollRoot?.current ?? null;
        const el = travelsIn(root)[current];
        if (!el) return;
        const viewTop = root ? root.getBoundingClientRect().top : 0;
        // Glide through the film to where the next chapter's words begin.
        (root ?? window).scrollBy({
            top: el.getBoundingClientRect().bottom - viewTop,
            behavior: reduced ? 'auto' : 'smooth',
        });
    };

    const last = current >= starts.length - 1;
    const pill =
        'rounded-full bg-black/45 text-[#fff6e2] shadow-[0_6px_24px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md';
    if (reading)
        return (
            <>
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5 bg-white/15"
                >
                    <div
                        ref={line}
                        className="h-full origin-left bg-(--inv-gold) rtl:origin-right"
                        style={{ transform: 'scaleX(0)' }}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => {
                        onRead(false);
                    }}
                    className={`fixed start-4 top-4 z-40 flex h-10 items-center gap-2 ps-3 pe-4 text-xs ${pill}`}
                    data-film-read="back"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="size-4 text-(--inv-gold)"
                        aria-hidden
                        fill="none"
                    >
                        <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
                    </svg>
                    {copy('backToFilm')}
                </button>
            </>
        );
    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5 bg-white/15"
            >
                <div
                    ref={line}
                    className="h-full origin-left bg-(--inv-gold) rtl:origin-right"
                    style={{ transform: 'scaleX(0)' }}
                />
                {ticks.map((at, i) => (
                    <span
                        // Ticks follow the chapters' order.
                        key={i}
                        className="absolute top-0 h-full w-1 -translate-x-1/2 bg-[#fff6e2]/70 rtl:translate-x-1/2"
                        style={{ insetInlineStart: `${String(Math.min(1, at) * 100)}%` }}
                    />
                ))}
            </div>
            <nav
                aria-hidden={!away}
                inert={!away}
                className={`fixed start-4 top-4 z-40 flex max-w-[55vw] flex-col items-start gap-1.5 transition-opacity duration-500 ${away ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                data-film-chapters
            >
                <div className={`flex max-w-full items-center gap-1 py-1 ps-3.5 pe-1 ${pill}`}>
                    <span className="text-[10px] tracking-[0.2em] text-(--inv-gold) tabular-nums">
                        {String(current + 1)}/{String(starts.length)}
                    </span>
                    <span className="min-w-0 truncate ps-1.5 text-xs" aria-live="polite">
                        {name(starts[current])}
                    </span>
                    <button
                        type="button"
                        aria-label={`${copy('nextChapter')}: ${name(starts[current + 1])}`}
                        disabled={last}
                        onClick={next}
                        className="ms-1 grid size-8 shrink-0 place-items-center rounded-full bg-white/10 transition-opacity hover:bg-white/20 disabled:opacity-30"
                    >
                        <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="none">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                    </button>
                </div>
                {!last && (
                    <button
                        type="button"
                        onClick={() => {
                            onRead(true);
                        }}
                        className={`h-7 px-3 text-[11px] ${pill} bg-black/30 hover:bg-black/45`}
                        data-film-read="read"
                    >
                        {copy('readInvitation')}
                    </button>
                )}
            </nav>
        </>
    );
}
