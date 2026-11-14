import { blockVariants, isRendered, renderedSections, resolveBlock } from '@shared/blocks';
import { allowedSection, occasionOf } from '@shared/occasions';
import type { SectionType } from '@shared/types';
import { Eye, EyeOff, GripVertical, Plus } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import type { Draft } from '../composer/draft';
import { sectionNames } from '../composer/panels';

interface LayersPanelProps {
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
    selected: SectionType | null;
    onSelect: (type: SectionType) => void;
}

const shortName = (type: SectionType) => sectionNames[type].replace(/\s*\(.*\)$/, '');

// Page structure: drag to reorder, eye to show/hide, click to select on the canvas, add below.
export function LayersPanel({ draft, set, selected, onSelect }: LayersPanelProps) {
    const [dragging, setDragging] = useState<number | null>(null);
    const [over, setOver] = useState<number | null>(null);
    const occasion = occasionOf(draft.occasion);
    const present = new Set(draft.sections.map((s) => s.type));
    // Only sections with their own design; names, venue and dress code live inside other sections.
    const addable = renderedSections.filter((t) => !present.has(t) && allowedSection(occasion, t));

    const move = (from: number, to: number) => {
        if (from === to) return;
        set((d) => {
            const sections = [...d.sections];
            const [item] = sections.splice(from, 1);
            if (item) sections.splice(to, 0, item);
            return {
                ...d,
                sections,
            };
        });
    };

    return (
        <div className="space-y-4">
            <ol className="space-y-1">
                {draft.sections.map((section, i) => {
                    if (!isRendered(section.type)) return null;
                    const variant = resolveBlock(section).variant;
                    const variantLabel =
                        blockVariants[section.type]?.find((v) => v.id === variant)?.label ?? '';
                    const on = selected === section.type;
                    return (
                        <li
                            key={section.type}
                            draggable
                            onDragStart={() => {
                                setDragging(i);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setOver(i);
                            }}
                            onDragEnd={() => {
                                setDragging(null);
                                setOver(null);
                            }}
                            onDrop={() => {
                                if (dragging !== null) move(dragging, i);
                                setDragging(null);
                                setOver(null);
                            }}
                            className={cn(
                                'group flex items-center gap-1.5 rounded-md border border-transparent px-1.5 py-1 transition',
                                on ? 'border-primary/50 bg-primary/10' : 'hover:bg-muted',
                                over === i && dragging !== i && 'border-dashed border-primary',
                                !section.enabled && 'opacity-50',
                            )}
                        >
                            <GripVertical
                                className="size-3.5 shrink-0 cursor-grab text-muted-foreground"
                                aria-hidden
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    onSelect(section.type);
                                }}
                                className="min-w-0 flex-1 text-start"
                            >
                                <span className="block truncate text-[13px] font-medium">
                                    {shortName(section.type)}
                                </span>
                                {variantLabel && (
                                    <span className="block truncate text-[11px] text-muted-foreground">
                                        {variantLabel}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                aria-label={section.enabled ? 'Hide section' : 'Show section'}
                                onClick={() => {
                                    set((d) => ({
                                        ...d,
                                        sections: d.sections.map((s, k) =>
                                            k === i
                                                ? {
                                                      ...s,
                                                      enabled: !s.enabled,
                                                  }
                                                : s,
                                        ),
                                    }));
                                }}
                                className="rounded p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 data-[off=true]:opacity-100"
                                data-off={!section.enabled}
                            >
                                {section.enabled ? (
                                    <Eye className="size-3.5" />
                                ) : (
                                    <EyeOff className="size-3.5" />
                                )}
                            </button>
                        </li>
                    );
                })}
            </ol>
            {addable.length > 0 && (
                <div className="space-y-1.5">
                    <p className="px-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                        Add a section
                    </p>
                    {addable.map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => {
                                set((d) => ({
                                    ...d,
                                    sections: [
                                        ...d.sections,
                                        {
                                            type,
                                            enabled: true,
                                        },
                                    ],
                                }));
                                onSelect(type);
                            }}
                            className="flex w-full items-center gap-2 rounded-md border border-dashed px-2.5 py-1.5 text-start text-[13px] text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
                        >
                            <Plus className="size-3.5" />
                            {shortName(type)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
