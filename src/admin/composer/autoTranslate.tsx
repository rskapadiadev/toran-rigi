// Auto-translate in the editor. Text typed in one language is written into the invitation's other
// languages a moment after typing stops. A language typed by hand is never overwritten (it is
// remembered in content.handWritten), and adding a language fills it from what is already written.
import type { TranslateItem, TranslateResult } from '@shared/schemas/translate';
import type { LocalizedText } from '@shared/types';
import { useQuery } from '@tanstack/react-query';
import {
    createContext,
    type ReactNode,
    use,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { api, ApiError } from '@/lib/api';

import type { Draft } from './draft';

const DEBOUNCE_MS = 900;

type Path = (string | number)[];

// Every translatable text in the draft, by path ("content.headline", "events.2.title", …).
function collect(d: Draft): Map<string, LocalizedText> {
    const out = new Map<string, LocalizedText>();
    const add = (path: Path, text: LocalizedText | undefined) => {
        if (text) out.set(path.join('.'), text);
    };
    const c = d.content;
    for (const slot of ['one', 'two'] as const) {
        const person = c.people[slot];
        if (!person) continue;
        add(['content', 'people', slot, 'name'], person.name);
        add(['content', 'people', slot, 'honorific'], person.honorific);
        add(['content', 'people', slot, 'parents'], person.parents);
    }
    for (const key of ['headline', 'welcome', 'story', 'family', 'closing'] as const)
        add(['content', key], c[key]);
    for (const side of ['one', 'two'] as const)
        for (const key of ['welcome', 'family', 'closing'] as const)
            add(['content', 'families', side, key], c.families?.[side]?.[key]);
    d.events.forEach((e, i) => {
        add(['events', i, 'title'], e.title);
        add(['events', i, 'description'], e.description);
        add(['events', i, 'dressCode', 'note'], e.dressCode?.note);
    });
    d.extras.travel?.forEach((t, i) => {
        add(['extras', 'travel', i, 'title'], t.title);
        add(['extras', 'travel', i, 'body'], t.body);
    });
    return out;
}

const segments = (path: string): Path =>
    path.split('.').map((s) => (/^\d+$/.test(s) ? Number(s) : s));

function getIn(d: Draft, path: string): LocalizedText | undefined {
    let node: unknown = d;
    for (const key of segments(path)) {
        if (node === null || typeof node !== 'object') return undefined;
        node = (node as Record<string | number, unknown>)[key];
    }
    return node as LocalizedText | undefined;
}

function setIn<T>(node: T, [key, ...rest]: Path, value: unknown): T {
    if (key === undefined) return value as T;
    const child = (node as Record<string | number, unknown> | undefined)?.[key];
    const next = setIn(child, rest, value);
    if (Array.isArray(node)) return (node as unknown[]).map((v, i) => (i === key ? next : v)) as T;
    return {
        ...(node as object),
        [key]: next,
    } as T;
}

function markHandWritten(d: Draft, path: string, locale: string): Draft {
    const hand = d.content.handWritten ?? {};
    if (hand[path]?.includes(locale)) return d;
    return {
        ...d,
        content: {
            ...d.content,
            handWritten: {
                ...hand,
                [path]: [...(hand[path] ?? []), locale],
            },
        },
    };
}

// One text waiting to be translated: from which language, and (for a new language) into which.
interface Job {
    from: string;
    to?: string[];
}

interface Status {
    enabled: boolean;
    busy: boolean;
    error: string | null;
    // Rewrite every other language from this one, hand-written ones included.
    retranslateAll: (from: string) => void;
    // Rewrite every other language of one text (by path, e.g. "content.headline") from this one.
    retranslate: (path: string, from: string) => void;
}

const AutoTranslateContext = createContext<Status | null>(null);

export const useAutoTranslateStatus = () => use(AutoTranslateContext);

interface ProviderProps {
    value: Status;
    children: ReactNode;
}

export function AutoTranslateProvider({ value, children }: ProviderProps) {
    return <AutoTranslateContext value={value}>{children}</AutoTranslateContext>;
}

interface Options {
    draft: Draft | null;
    set: (update: (d: Draft) => Draft) => void;
}

export function useAutoTranslate({ draft, set }: Options) {
    const { data: config } = useQuery({
        queryKey: ['translate-config'],
        queryFn: () => api<{ enabled: boolean }>('/admin/translate'),
        staleTime: Infinity,
    });
    const enabled = config?.enabled ?? false;

    const draftRef = useRef(draft);
    useEffect(() => {
        draftRef.current = draft;
    }, [draft]);
    const seen = useRef<{
        texts: Map<string, LocalizedText>;
        locales: string[];
    } | null>(null);
    // Values this hook wrote, so they are not mistaken for typing.
    const written = useRef(new Map<string, string>());
    const jobs = useRef(new Map<string, Job>());
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const skipNext = useRef(false);
    const [busy, setBusy] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // `force`: rewrite hand-written languages too ("Re-translate all").
    const flush = useCallback(
        async (force = false) => {
            const d = draftRef.current;
            if (!d || jobs.current.size === 0) return;
            const batch = [...jobs.current];
            jobs.current.clear();
            const hand = force ? {} : (d.content.handWritten ?? {});
            const items: TranslateItem[] = [];
            for (const [path, job] of batch) {
                const text = getIn(d, path)?.[job.from] ?? '';
                const to = (job.to ?? d.locales).filter(
                    (l) => l !== job.from && d.locales.includes(l) && !hand[path]?.includes(l),
                );
                if (to.length === 0) continue;
                items.push({
                    id: path,
                    from: job.from as TranslateItem['from'],
                    to: to as TranslateItem['to'],
                    text,
                });
            }
            let results: TranslateResult[] = [];
            if (items.length > 0) {
                setBusy((n) => n + 1);
                try {
                    const res = await api<{ items: TranslateResult[] }>('/admin/translate', {
                        method: 'POST',
                        body: JSON.stringify({ items }),
                    });
                    results = res.items;
                    setError(null);
                } catch (e) {
                    setError(e instanceof ApiError ? e.message : 'Translation failed');
                } finally {
                    setBusy((n) => n - 1);
                }
            }
            const sent = new Map(items.map((item) => [item.id, item]));
            set((cur) => {
                let next = cur;
                // The language typed in is now the hand-written source of that text.
                for (const [path, job] of batch) {
                    if (!job.to) next = markHandWritten(next, path, job.from);
                }
                for (const row of results) {
                    const item = sent.get(row.id);
                    const text = getIn(next, row.id);
                    // Typing carried on while this was in flight: the newer request will land instead.
                    if (!item || !text || (text[item.from] ?? '') !== item.text) continue;
                    const hand = next.content.handWritten?.[row.id] ?? [];
                    let merged: LocalizedText = text;
                    for (const [locale, value] of Object.entries(row.translations)) {
                        if (hand.includes(locale) || !next.locales.includes(locale)) continue;
                        written.current.set(`${row.id}|${locale}`, value);
                        merged = {
                            ...merged,
                            [locale]: value,
                        };
                    }
                    if (merged !== text) next = setIn(next, segments(row.id), merged);
                }
                return next;
            });
        },
        [set],
    );

    const schedule = useCallback(() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), DEBOUNCE_MS);
    }, [flush]);

    useEffect(
        () => () => {
            clearTimeout(timer.current);
        },
        [],
    );

    useEffect(() => {
        if (!draft) return;
        const texts = collect(draft);
        const before = seen.current;
        seen.current = {
            texts,
            locales: draft.locales,
        };
        // First load, or an undo/redo: nothing was typed.
        if (!before || skipNext.current || !enabled) {
            skipNext.current = false;
            return;
        }
        if (draft.locales.length < 2) return;
        let queued = false;

        for (const [path, text] of texts) {
            const old = before.texts.get(path);
            if (!old) continue;
            const typed = draft.locales.filter((l) => {
                const value = text[l] ?? '';
                if (value === (old[l] ?? '')) return false;
                const key = `${path}|${l}`;
                if (written.current.get(key) === value) {
                    written.current.delete(key);
                    return false;
                }
                return true;
            });
            // Exactly one language changed: that is typing. Several at once is a template or
            // occasion swap, a reorder or a paste of a whole draft, so leave it alone.
            if (typed.length === 1 && typed[0]) {
                jobs.current.set(path, { from: typed[0] });
                queued = true;
            }
        }

        // A newly added language is filled from each text's hand-written (or first) language.
        const added = draft.locales.filter((l) => !before.locales.includes(l));
        if (added.length > 0) {
            const hand = draft.content.handWritten ?? {};
            for (const [path, text] of texts) {
                if (jobs.current.has(path)) continue;
                const from =
                    hand[path]?.find((l) => draft.locales.includes(l) && text[l]) ??
                    draft.locales.find((l) => !added.includes(l) && text[l]);
                if (!from || !text[from]?.trim()) continue;
                jobs.current.set(path, {
                    from,
                    to: added,
                });
                queued = true;
            }
        }
        if (queued) schedule();
    }, [draft, enabled, schedule]);

    const retranslateAll = useCallback(
        (from: string) => {
            const d = draftRef.current;
            if (!d) return;
            const texts = collect(d);
            // Clear the hand-written marks of the other languages first, so they are rewritten.
            set((cur) => ({
                ...cur,
                content: {
                    ...cur.content,
                    handWritten: Object.fromEntries(
                        [...texts.keys()].map((path) => [path, [from]]),
                    ),
                },
            }));
            for (const [path, text] of texts) {
                if (!text[from]?.trim()) continue;
                jobs.current.set(path, { from });
            }
            void flush(true);
        },
        [flush, set],
    );

    const retranslate = useCallback(
        (path: string, from: string) => {
            const text = draftRef.current ? getIn(draftRef.current, path) : undefined;
            if (!text?.[from]?.trim()) return;
            set((cur) => ({
                ...cur,
                content: {
                    ...cur.content,
                    handWritten: {
                        ...cur.content.handWritten,
                        [path]: [from],
                    },
                },
            }));
            jobs.current.set(path, { from });
            void flush(true);
        },
        [flush, set],
    );

    const status: Status = {
        enabled,
        busy: busy > 0,
        error,
        retranslateAll,
        retranslate,
    };

    // Call before undo/redo so the jump is not taken for typing.
    const skip = useCallback(() => {
        skipNext.current = true;
    }, []);

    return {
        status,
        skipNext: skip,
    };
}
