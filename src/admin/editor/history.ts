import { useCallback, useState } from 'react';

import type { Draft } from '../composer/draft';

interface History {
    past: Draft[];
    present: Draft | null;
    future: Draft[];
    // The gesture the last change came from: its later changes merge into the same undo step.
    gesture?: string;
}

const LIMIT = 80;

// Undo/redo over whole drafts. `present === null` means "the saved server copy".
export function useDraftHistory(base: Draft | null) {
    const [h, setH] = useState<History>({
        past: [],
        present: null,
        future: [],
    });
    const draft = h.present ?? base;

    // `gesture` names one drag: all its moves become a single step to undo.
    const set = useCallback(
        (update: (d: Draft) => Draft, gesture?: string) => {
            setH((cur) => {
                const from = cur.present ?? base;
                if (!from) return cur;
                const next = update(from);
                if (next === from) return cur;
                if (gesture && cur.gesture === gesture)
                    return {
                        past: cur.past,
                        present: next,
                        future: [],
                        gesture,
                    };
                return {
                    past: [...cur.past, from].slice(-LIMIT),
                    present: next,
                    future: [],
                    gesture,
                };
            });
        },
        [base],
    );

    const undo = useCallback(() => {
        setH((cur) => {
            const prev = cur.past.at(-1);
            const now = cur.present ?? base;
            if (!prev || !now) return cur;
            const past = cur.past.slice(0, -1);
            return {
                past,
                // Undoing every edit lands back on the saved copy, so nothing is unsaved.
                present: past.length === 0 && cur.present !== null ? null : prev,
                future: [now, ...cur.future],
            };
        });
    }, [base]);

    const redo = useCallback(() => {
        setH((cur) => {
            const [next, ...rest] = cur.future;
            const now = cur.present ?? base;
            if (!next || !now) return cur;
            return {
                past: [...cur.past, now],
                present: next,
                future: rest,
            };
        });
    }, [base]);

    // After a save the server copy is the new baseline, and undo starts again from there
    // (so "nothing left to undo" always means "matches what is saved").
    const markSaved = useCallback(() => {
        setH({
            past: [],
            present: null,
            future: [],
        });
    }, []);

    return {
        draft,
        set,
        undo,
        redo,
        markSaved,
        canUndo: h.past.length > 0,
        canRedo: h.future.length > 0,
        dirty: h.present !== null,
    };
}
