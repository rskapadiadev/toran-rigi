// Typing entrances (typewriter, word by word, quill ink) without rewriting the text.
//
// Splitting text into per-letter elements would rip React's text nodes out from under it (and break
// editing and locale switches). Instead the CSS Custom Highlight API styles a *range* of the
// existing text: untyped text is painted transparent, and the range shrinks one character (or word)
// at a time. The DOM is never changed. Browsers without the API fall back to a soft fade.
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useEntrance } from './stage';

export type TypingKind = 'typewriter' | 'words' | 'quill';

interface Registry {
    untyped: Highlight;
    ink: Highlight;
}

let registry: Registry | null | undefined;

// One shared highlight per style, holding every block's range; created on first use.
function highlights(): Registry | null {
    if (registry !== undefined) return registry;
    const css = globalThis.CSS as (typeof CSS & { highlights?: HighlightRegistry }) | undefined;
    if (!css?.highlights || typeof Highlight === 'undefined') {
        registry = null;
        return registry;
    }
    registry = {
        untyped: new Highlight(),
        ink: new Highlight(),
    };
    css.highlights.set('inv-untyped', registry.untyped);
    css.highlights.set('inv-fresh-ink', registry.ink);
    return registry;
}

export const typingSupported = () => highlights() !== null;

interface Spot {
    node: Text;
    offset: number;
}

// Every character position (or every word start) in reading order, plus the very end.
function spots(root: HTMLElement, words: boolean): { list: Spot[];
end: Spot } | null {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) =>
            n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    const list: Spot[] = [];
    let last: Text | null = null;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const node = n as Text;
        const text = node.data;
        for (let i = 0; i < text.length; i++) {
            const starts =
                !words || (/\S/.test(text[i] ?? '') && (i === 0 || /\s/.test(text[i - 1] ?? '')));
            if (starts)
                list.push({
                    node,
                    offset: i,
                });
        }
        last = node;
    }
    if (!last || list.length === 0) return null;
    return {
        list,
        end: {
            node: last,
            offset: last.data.length,
        },
    };
}

interface TypeRevealProps {
    kind: TypingKind;
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function TypeReveal({ kind, children, className, delay = 0 }: TypeRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const caret = useRef<HTMLSpanElement>(null);
    const play = useEntrance(ref);
    const hidden = useRef<Range | null>(null);
    const fresh = useRef<Range | null>(null);
    const [typing, setTyping] = useState<'waiting' | 'typing' | 'done'>('waiting');
    // 'pending' keeps the block invisible until its untyped range is in place: no flash of text.
    // 'type' types through highlights; 'fade' is the fallback; 'show' skips the effect entirely.
    const [mode, setMode] = useState<'pending' | 'type' | 'fade' | 'show'>('pending');

    // Before the first paint, hide all of the block's text so nothing flashes before typing.
    useLayoutEffect(() => {
        const root = ref.current;
        if (!root) return;
        const reg = highlights();
        const found = reg && !root.closest('.inv-editing') ? spots(root, false) : null;
        const first = found?.list[0];
        if (!reg || !found || !first) {
            // Measured from the DOM before paint (editor, no text, or no highlight support), so this
            // cannot be derived during render: one deliberate state update.
             
            setMode(reg ? 'show' : 'fade');
            return;
        }
        const range = document.createRange();
        range.setStart(first.node, first.offset);
        range.setEnd(found.end.node, found.end.offset);
        reg.untyped.add(range);
        hidden.current = range;
        setMode('type');
        return () => {
            reg.untyped.delete(range);
            if (fresh.current) reg.ink.delete(fresh.current);
        };
    }, []);

    useEffect(() => {
        const root = ref.current;
        const reg = highlights();
        const range = hidden.current;
        if (!play || mode !== 'type' || !root || !reg || !range) return;
        const found = spots(root, kind === 'words');
        if (!found) return;
        const { list, end } = found;
        // Long passages type faster, so nothing takes more than a few seconds.
        const step =
            kind === 'words'
                ? Math.min(220, Math.max(70, 3200 / list.length))
                : Math.min(55, Math.max(16, 2800 / list.length));
        const ink = kind === 'quill' ? document.createRange() : null;
        if (ink) {
            ink.setStart(end.node, end.offset);
            reg.ink.add(ink);
            fresh.current = ink;
        }
        let frame = 0;
        let begun = 0;
        const tick = (now: number) => {
            begun ||= now;
            const n = Math.floor((now - begun) / step);
            const at = list[n];
            if (!at) {
                reg.untyped.delete(range);
                if (ink) reg.ink.delete(ink);
                setTyping('done');
                return;
            }
            range.setStart(at.node, at.offset);
            if (ink) {
                // The last few letters are still wet gold; the rest has dried to the ink colour.
                const wet = list[Math.max(0, n - 7)] ?? at;
                ink.setStart(wet.node, wet.offset);
                ink.setEnd(at.node, at.offset);
            }
            const mark = caret.current;
            if (mark) {
                const probe = document.createRange();
                probe.setStart(at.node, at.offset);
                probe.collapse(true);
                const r = probe.getClientRects()[0] ?? probe.getBoundingClientRect();
                const box = root.getBoundingClientRect();
                mark.style.transform = `translate(${String(r.left - box.left)}px, ${String(r.top - box.top)}px)`;
                mark.style.height = `${String(r.height || 18)}px`;
            }
            frame = requestAnimationFrame(tick);
        };
        const timer = setTimeout(() => {
            setTyping('typing');
            frame = requestAnimationFrame(tick);
        }, delay);
        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(frame);
        };
    }, [play, mode, kind, delay]);

    return (
        <div
            ref={ref}
            className={`relative ${className ?? ''} ${mode === 'fade' ? 'transition-opacity duration-[1400ms]' : ''}`}
            style={{ opacity: mode === 'pending' || (mode === 'fade' && !play) ? 0 : 1 }}
        >
            {children}
            {kind === 'typewriter' && mode === 'type' && typing !== 'waiting' && (
                <span
                    ref={caret}
                    aria-hidden
                    // Positioned from the physical left, as the measured offsets are.
                    style={{ left: 0 }}
                    className={`pointer-events-none absolute top-0 w-[2px] bg-current ${typing === 'done' ? 'animate-[caret-out_1.6s_steps(1)_forwards]' : 'animate-[caret-blink_0.9s_steps(1)_infinite]'}`}
                />
            )}
        </div>
    );
}
