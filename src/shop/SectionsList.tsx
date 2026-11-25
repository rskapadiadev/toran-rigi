// The customer's sections: what their guests see, in what order. How each one looks is the design's.
import { isRendered } from '@shared/blocks';
import { occasionOf } from '@shared/occasions';
import { alwaysShown, missingSections } from '@shared/sections';
import type { SectionType } from '@shared/types';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import { useId } from 'react';

import type { Draft } from '@/admin/composer/draft';
import { sectionNames } from '@/admin/composer/panels';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SectionsListProps {
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
}

const shortName = (type: SectionType) => sectionNames[type].replace(/\s*\(.*\)$/, '');

// What switching a section off changes beyond the invitation itself.
const offNote: Partial<Record<SectionType, string>> = {
    events: 'Off: each function’s card leaves your Cards page too',
    rsvp: 'Off: guests can’t reply on the invitation',
};

function swap<T>(list: readonly T[], a: number, b: number): T[] {
    const next = [...list];
    const [x, y] = [next[a], next[b]];
    if (x === undefined || y === undefined) return next;
    next[a] = y;
    next[b] = x;
    return next;
}

export function SectionsList({ draft, set }: SectionsListProps) {
    const base = useId();
    const occasion = occasionOf(draft.occasion);
    // A film is cut to its sections' order, so there they can only be switched on and off.
    const canMove = !draft.design.film;
    const rows = draft.sections
        .map((section, index) => ({
            section,
            index,
        }))
        .filter(({ section }) => isRendered(section.type));
    const missing = canMove ? missingSections(draft.sections, occasion) : [];
    const setSections = (change: (sections: Draft['sections']) => Draft['sections']) => {
        set((d) => ({
            ...d,
            sections: change(d.sections),
        }));
    };

    return (
        <div className="space-y-4">
            <ul className="divide-y rounded-lg border">
                {rows.map(({ section, index }, i) => {
                    const { type, enabled } = section;
                    const name = shortName(type);
                    const locked = alwaysShown(type);
                    const before = rows[i - 1];
                    const after = rows[i + 1];
                    const id = `${base}-${type}`;
                    const note = enabled ? undefined : offNote[type];
                    return (
                        <li key={type} className="flex min-h-12 items-center gap-2 px-3 py-1.5">
                            <label htmlFor={id} className="min-w-0 flex-1">
                                <span
                                    className={cn(
                                        'block truncate text-sm font-medium',
                                        !enabled && 'text-muted-foreground line-through',
                                    )}
                                >
                                    {name}
                                </span>
                                {(locked || note) && (
                                    <span className="block text-xs text-muted-foreground">
                                        {locked ? 'Always shown' : note}
                                    </span>
                                )}
                            </label>
                            {canMove && !locked && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Move ${name} up`}
                                        disabled={!before || alwaysShown(before.section.type)}
                                        onClick={() => {
                                            if (before)
                                                setSections((all) =>
                                                    swap(all, index, before.index),
                                                );
                                        }}
                                    >
                                        <ArrowUp />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Move ${name} down`}
                                        disabled={!after}
                                        onClick={() => {
                                            if (after)
                                                setSections((all) => swap(all, index, after.index));
                                        }}
                                    >
                                        <ArrowDown />
                                    </Button>
                                </>
                            )}
                            <Switch
                                id={id}
                                checked={enabled}
                                disabled={locked}
                                onCheckedChange={(on) => {
                                    setSections((all) =>
                                        all.map((s, k) =>
                                            k === index
                                                ? {
                                                      ...s,
                                                      enabled: on,
                                                  }
                                                : s,
                                        ),
                                    );
                                }}
                            />
                        </li>
                    );
                })}
            </ul>
            {missing.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Add a section</p>
                    <div className="flex flex-wrap gap-2">
                        {missing.map((type) => (
                            <Button
                                key={type}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSections((all) => [
                                        ...all,
                                        {
                                            type,
                                            enabled: true,
                                        },
                                    ]);
                                }}
                            >
                                <Plus /> {shortName(type)}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
