// What to wear, function by function: a colour story, colours to avoid, the drawn outfits and a few
// words for guests. Shared by the couple's form and the studio's editor.
import { eventLabel } from '@shared/cultures';
import {
    colourName,
    lookPalettes,
    MAX_AVOID,
    MAX_OUTFITS,
    MAX_SWATCHES,
    outfitIds,
    outfitInfo,
    outfitsFor,
    suggestedPalette,
    type Wearer,
} from '@shared/looks';
import { allowedSection, occasionOf } from '@shared/occasions';
import { Plus, Shirt, X } from 'lucide-react';
import { useId } from 'react';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Outfit } from '@/invitation/looks/Outfit';
import { cn } from '@/lib/utils';

import type { Draft } from './draft';
import { ColorSwatch, setText, SwitchRow, TextField } from './panels';

type Look = NonNullable<Draft['events'][number]['dressCode']>;

interface LooksPanelProps {
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
    // The couple choose whether the page shows; in the studio the section itself is open.
    sectionSwitch?: boolean;
}

const emptyLook: Look = { swatches: [] };

// Quick picks for "please avoid": the colours people most often ask guests to leave to the family.
const avoidPicks = ['#d62e4b', '#ffffff', '#111111'];

interface WearerRow {
    who: Wearer;
    label: string;
}

const wearers: WearerRow[] = [
    {
        who: 'ladies',
        label: 'Ladies',
    },
    {
        who: 'gentlemen',
        label: 'Gentlemen',
    },
];

interface SwatchRowProps {
    colors: string[];
    max: number;
    label: string;
    fresh: string;
    onChange: (colors: string[]) => void;
}

export function SwatchRow({ colors, max, label, fresh, onChange }: SwatchRowProps) {
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {colors.map((c, k) => (
                <span key={k} className="group relative">
                    <ColorSwatch
                        value={c}
                        label={`${label} ${String(k + 1)}: ${colourName(c)}`}
                        onChange={(v) => {
                            onChange(colors.map((x, j) => (j === k ? v : x)));
                        }}
                    />
                    <button
                        type="button"
                        aria-label={`Remove ${colourName(c)}`}
                        className="absolute -end-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-background shadow"
                        onClick={() => {
                            onChange(colors.filter((_, j) => j !== k));
                        }}
                    >
                        <X className="size-2.5" />
                    </button>
                </span>
            ))}
            {colors.length < max && (
                <Button
                    size="icon"
                    variant="outline"
                    aria-label={`Add ${label.toLowerCase()}`}
                    className="border-dashed"
                    onClick={() => {
                        onChange([...colors, fresh]);
                    }}
                >
                    <Plus />
                </Button>
            )}
        </div>
    );
}

interface LookEditorProps {
    event: Draft['events'][number];
    culture: string;
    locale: string;
    onChange: (look: Look | null) => void;
}

function LookEditor({ event, culture, locale, onChange }: LookEditorProps) {
    const look = event.dressCode ?? emptyLook;
    const suggested = suggestedPalette(event.kind);
    const palettes = [suggested, ...lookPalettes.filter((p) => p.id !== suggested.id)];
    const picked = look.outfits ?? [];
    const shown = outfitsFor(picked, culture);
    const hasGentlemen = shown.some((o) => outfitInfo[o].who === 'gentlemen');
    const change = (patch: Partial<Look>) => {
        onChange({
            ...look,
            ...patch,
        });
    };
    const toggleOutfit = (id: (typeof outfitIds)[number]) => {
        const next = picked.includes(id) ? picked.filter((o) => o !== id) : [...picked, id];
        change({ outfits: next.slice(0, MAX_OUTFITS) });
    };
    const main = look.swatches[0] ?? suggested.colors[0] ?? '#c9a24a';

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <p className="text-[13px] font-medium text-foreground/80">
                    Start from a colour story
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {palettes.map((p, i) => {
                        const on = p.colors.join() === look.swatches.join();
                        return (
                            <button
                                key={p.id}
                                type="button"
                                aria-pressed={on}
                                onClick={() => {
                                    change({ swatches: p.colors });
                                }}
                                className={cn(
                                    'flex h-8 items-center gap-1.5 rounded-control border bg-card ps-1.5 pe-2.5 text-xs',
                                    on && 'border-primary ring-1 ring-primary',
                                )}
                            >
                                <span className="flex -space-x-1">
                                    {p.colors.map((c) => (
                                        <span
                                            key={c}
                                            className="size-4 rounded-full ring-1 ring-black/10"
                                            style={{ background: c }}
                                        />
                                    ))}
                                </span>
                                {p.name}
                                {i === 0 && (
                                    <span className="text-muted-foreground">· suits it</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-4 @md:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/80">Colours to wear</p>
                    <SwatchRow
                        colors={look.swatches}
                        max={MAX_SWATCHES}
                        label="Colour"
                        fresh="#c9a24a"
                        onChange={(swatches) => {
                            change({ swatches });
                        }}
                    />
                </div>
                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/80">Please avoid</p>
                    <SwatchRow
                        colors={look.avoid ?? []}
                        max={MAX_AVOID}
                        label="Colour to avoid"
                        fresh={avoidPicks.find((c) => !(look.avoid ?? []).includes(c)) ?? '#d62e4b'}
                        onChange={(avoid) => {
                            change({ avoid });
                        }}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[13px] font-medium text-foreground/80">
                    What to wear{' '}
                    <span className="font-normal text-muted-foreground">
                        (up to {MAX_OUTFITS}; none picked shows two that suit your tradition)
                    </span>
                </p>
                {wearers.map(({ who, label }) => (
                    <div key={who} className="flex flex-wrap items-center gap-1.5">
                        <span className="w-20 text-xs text-muted-foreground">{label}</span>
                        {outfitIds
                            .filter((o) => outfitInfo[o].who === who)
                            .map((o) => {
                                const on = picked.includes(o);
                                return (
                                    <button
                                        key={o}
                                        type="button"
                                        aria-pressed={on}
                                        disabled={!on && picked.length >= MAX_OUTFITS}
                                        onClick={() => {
                                            toggleOutfit(o);
                                        }}
                                        className={cn(
                                            'h-8 rounded-control border bg-card px-2.5 text-xs disabled:opacity-40',
                                            on && 'border-primary bg-primary/10 font-medium',
                                        )}
                                    >
                                        {outfitInfo[o].label}
                                    </button>
                                );
                            })}
                    </div>
                ))}
                <div
                    className="flex items-end justify-center gap-2 rounded-lg bg-[#f6efe0] px-3 pt-3"
                    aria-hidden
                >
                    {shown.map((o, k) => (
                        <Outfit
                            key={o}
                            id={o}
                            main={look.swatches[k % Math.max(1, look.swatches.length)] ?? main}
                            second={
                                look.swatches[(k + 1) % Math.max(1, look.swatches.length)] ?? main
                            }
                            trim="#b08a3e"
                            turban={look.turban}
                            className="h-36 w-auto"
                        />
                    ))}
                </div>
                {hasGentlemen && (
                    <SwitchRow
                        id={`turban-${event.id ?? event.kind}`}
                        label="Safa or turban"
                        description="Gentlemen are drawn with a tied safa"
                        checked={look.turban ?? false}
                        onChange={(turban) => {
                            change({ turban });
                        }}
                    />
                )}
            </div>

            <div className="grid gap-4 @md:grid-cols-2">
                <TextField
                    label={`Theme name (${locale})`}
                    placeholder="Marigold morning"
                    value={look.title?.[locale]}
                    onChange={(v) => {
                        change({ title: setText(look.title, locale, v) });
                    }}
                />
                <TextField
                    label={`A note for everyone (${locale})`}
                    placeholder="Yellows you don’t mind staining"
                    value={look.note?.[locale]}
                    onChange={(v) => {
                        change({ note: setText(look.note, locale, v) });
                    }}
                />
                <TextField
                    label={`Ladies (${locale})`}
                    placeholder="Light cotton saris or lehengas"
                    value={look.ladies?.[locale]}
                    onChange={(v) => {
                        change({ ladies: setText(look.ladies, locale, v) });
                    }}
                />
                <TextField
                    label={`Gentlemen (${locale})`}
                    placeholder="Kurta pyjama, nothing too precious"
                    value={look.gentlemen?.[locale]}
                    onChange={(v) => {
                        change({ gentlemen: setText(look.gentlemen, locale, v) });
                    }}
                />
            </div>
            {event.dressCode && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                        onChange(null);
                    }}
                >
                    Clear this look
                </Button>
            )}
        </div>
    );
}

export function LooksPanel({ draft, set, sectionSwitch = false }: LooksPanelProps) {
    const base = useId();
    const locale = draft.locales[0] ?? 'en';
    const culture = draft.culture;
    const section = draft.sections.find((s) => s.type === 'dressCode');
    const canAdd = allowedSection(occasionOf(draft.occasion), 'dressCode');
    const update = (i: number, look: Look | null) => {
        set((d) => ({
            ...d,
            events: d.events.map((e, k) =>
                k === i
                    ? {
                          ...e,
                          dressCode: look ?? undefined,
                      }
                    : e,
            ),
        }));
    };
    const showPage = (on: boolean) => {
        set((d) => {
            const present = d.sections.some((s) => s.type === 'dressCode');
            const page = {
                type: 'dressCode' as const,
                enabled: true,
            };
            return {
                ...d,
                sections: present
                    ? d.sections.map((s) =>
                          s.type === 'dressCode'
                              ? {
                                    ...s,
                                    enabled: on,
                                }
                              : s,
                      )
                    : on
                      ? afterCeremonies(d.sections, page)
                      : d.sections,
            };
        });
    };

    if (draft.events.length === 0)
        return (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Add your ceremonies first, then choose what guests wear to each.
            </p>
        );

    return (
        <div className="space-y-3">
            {sectionSwitch && (canAdd || section) && (
                <SwitchRow
                    id={`${base}-page`}
                    icon={<Shirt />}
                    label="Show ‘What to wear’ in the invitation"
                    description="A page with each function’s colours and outfits"
                    checked={section?.enabled ?? false}
                    onChange={showPage}
                />
            )}
            <Accordion type="multiple" className="space-y-2">
                {draft.events.map((e, i) => {
                    const title = e.title[locale] || eventLabel(draft.culture, e.kind, locale);
                    return (
                        <AccordionItem
                            key={e.id ?? `new-${String(i)}`}
                            value={e.id ?? `new-${String(i)}`}
                            className="overflow-hidden rounded-lg border bg-card last:border-b"
                        >
                            <AccordionTrigger className="items-center px-3.5 py-3 hover:no-underline">
                                <span className="flex min-w-0 flex-1 items-center gap-3">
                                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                                        {title}
                                    </span>
                                    {e.dressCode && e.dressCode.swatches.length > 0 ? (
                                        <span className="flex -space-x-1">
                                            {e.dressCode.swatches.map((c, k) => (
                                                <span
                                                    key={k}
                                                    className="size-4 rounded-full ring-1 ring-black/10"
                                                    style={{ background: c }}
                                                />
                                            ))}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-normal text-muted-foreground">
                                            Not set
                                        </span>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="border-t bg-muted/20 p-3.5">
                                <LookEditor
                                    event={e}
                                    culture={culture}
                                    locale={locale}
                                    onChange={(look) => {
                                        update(i, look);
                                    }}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}

// A new page goes just after the ceremonies, where guests look for it.
function afterCeremonies(
    sections: Draft['sections'],
    page: Draft['sections'][number],
): Draft['sections'] {
    const at = sections.findIndex((s) => s.type === 'events');
    if (at < 0) return [...sections, page];
    return [...sections.slice(0, at + 1), page, ...sections.slice(at + 1)];
}
