import {
    applyLayout,
    blockVariants,
    calmEntrances,
    edgeInfo,
    enterInfo,
    resolveBlock,
    sceneInfo,
    settleEnter,
    type VariantInfo,
} from '@shared/blocks';
import { allowedSection, cappedMotion, occasionOf } from '@shared/occasions';
import { motifIds, sectionTypes } from '@shared/schemas/invitation';
import { themeCatalog, themeLayouts } from '@shared/themes';
import type { EdgeKind, EnterPreset, SceneKind, SectionConfig, SectionType } from '@shared/types';
import { ArrowDown, ArrowUp, Dices, LayoutTemplate, Plus } from 'lucide-react';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/cn';

import { type PanelProps, sectionNames } from './panels';

const enterIds = Object.keys(enterInfo) as EnterPreset[];
const sceneIds = Object.keys(sceneInfo) as SceneKind[];
const edgeIds = Object.keys(edgeInfo) as EdgeKind[];
const AUTO = '__auto';

// Swatches hint at each backdrop without rendering the full material in the list.
const sceneSwatch: Record<SceneKind, string> = {
    silk: 'linear-gradient(135deg,#e9d6b0,#c9a35d)',
    jacquard: 'linear-gradient(135deg,#6e1a2e,#3d0d19)',
    paper: 'linear-gradient(135deg,#fbf6ec,#efe4cf)',
    blush: 'linear-gradient(135deg,#f6dfe2,#e8c4ca)',
    velvet: 'linear-gradient(135deg,#3a0f1c,#140509)',
    night: 'radial-gradient(circle at 30% 30%,#fff 0 1px,transparent 2px),linear-gradient(135deg,#141a3a,#05030c)',
    plain: 'linear-gradient(135deg,#ffffff,#f4f4f4)',
};

const swatchOf = (scene: SceneKind) => sceneSwatch[scene];

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)] as T;

interface OptionPickerProps<T extends string> {
    label: string;
    value: T | undefined;
    options: readonly T[];
    describe: (id: T) => VariantInfo;
    onChange: (value: T | undefined) => void;
    swatch?: (id: T) => string;
    allowAuto?: string;
}

// Visual chip grid: every option shows its name and what it does.
function OptionPicker<T extends string>({
    label,
    value,
    options,
    describe,
    onChange,
    swatch,
    allowAuto,
}: OptionPickerProps<T>) {
    return (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">{label}</Label>
            <div className="grid grid-cols-2 gap-2">
                {allowAuto && (
                    <button
                        type="button"
                        aria-pressed={value === undefined}
                        onClick={() => {
                            onChange(undefined);
                        }}
                        className={cn(
                            'rounded-lg border px-3 py-2 text-start text-xs transition',
                            value === undefined
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'hover:bg-muted',
                        )}
                    >
                        <span className="block font-medium">Auto</span>
                        <span className="text-muted-foreground">{allowAuto}</span>
                    </button>
                )}
                {options.map((id) => {
                    const info = describe(id);
                    return (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={value === id}
                            onClick={() => {
                                onChange(id);
                            }}
                            className={cn(
                                'flex items-start gap-2 rounded-lg border px-3 py-2 text-start text-xs transition',
                                value === id
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'hover:bg-muted',
                            )}
                        >
                            {swatch && (
                                <span
                                    className="mt-0.5 size-4 shrink-0 rounded-full border"
                                    style={{ background: swatch(id) }}
                                />
                            )}
                            <span>
                                <span className="block font-medium">{info.label}</span>
                                <span className="text-muted-foreground">{info.hint}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

interface BlockEditorProps {
    section: SectionConfig;
    previousScene?: SceneKind;
    // Calm motion (chosen, or imposed by a solemn occasion) offers gentle entrances only.
    calm: boolean;
    update: (patch: Partial<SectionConfig>) => void;
}

function BlockEditor({ section, previousScene, calm, update }: BlockEditorProps) {
    const variants = blockVariants[section.type] ?? [];
    const resolved = resolveBlock(section, previousScene);
    return (
        <div className="space-y-5 pt-2">
            {variants.length > 1 && (
                <OptionPicker
                    label="Layout"
                    value={resolved.variant}
                    options={variants.map((v) => v.id)}
                    describe={(id) =>
                        variants.find((v) => v.id === id) ?? {
                            id,
                            label: id,
                            hint: '',
                        }
                    }
                    onChange={(variant) => {
                        update({ variant });
                    }}
                />
            )}
            <OptionPicker
                label={calm ? 'Entrance animation · calm only' : 'Entrance animation'}
                value={section.enter && settleEnter(section.enter, calm)}
                options={calm ? enterIds.filter((id) => calmEntrances.includes(id)) : enterIds}
                describe={(id) => enterInfo[id]}
                allowAuto={`Default: ${enterInfo[settleEnter(resolved.enter, calm)].label}`}
                onChange={(enter) => {
                    update({ enter });
                }}
            />
            <OptionPicker
                label="Backdrop"
                value={section.scene}
                options={sceneIds}
                describe={(id) => sceneInfo[id]}
                swatch={(id) => sceneSwatch[id]}
                allowAuto={`Default: ${sceneInfo[resolved.scene].label}`}
                onChange={(scene) => {
                    update({ scene });
                }}
            />
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase">Top edge</Label>
                    <Select
                        value={section.edge ?? AUTO}
                        onValueChange={(v) => {
                            update({ edge: v === AUTO ? undefined : (v as EdgeKind) });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={AUTO}>Auto (seam on change)</SelectItem>
                            {edgeIds.map((id) => (
                                <SelectItem key={id} value={id}>
                                    {edgeInfo[id].label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase">Motif</Label>
                    <Select
                        value={section.motif ?? AUTO}
                        onValueChange={(v) => {
                            const motif = v === AUTO ? undefined : (v as SectionConfig['motif']);
                            update({ motif });
                        }}
                    >
                        <SelectTrigger className="w-full capitalize">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={AUTO}>From culture</SelectItem>
                            {motifIds.map((id) => (
                                <SelectItem key={id} value={id} className="capitalize">
                                    {id}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

export function SectionsPanel({ draft, set }: PanelProps) {
    const occasion = occasionOf(draft.occasion);
    const calm = cappedMotion(draft.design.motion, occasion) === 'calm';
    const present = new Set(draft.sections.map((s) => s.type));
    // A prayer meet can't gain a countdown or a gifting section, whatever the designer clicks.
    const missing = sectionTypes.filter(
        (t) => !present.has(t) && t in sectionNames && allowedSection(occasion, t),
    );

    const patchAt = (i: number, patch: Partial<SectionConfig>) => {
        set((d) => ({
            ...d,
            sections: d.sections.map((x, k) =>
                k === i
                    ? {
                          ...x,
                          ...patch,
                      }
                    : x,
            ),
        }));
    };
    const move = (i: number, dir: -1 | 1) => {
        set((d) => {
            const sections = [...d.sections];
            const [item] = sections.splice(i, 1);
            if (item) sections.splice(Math.max(0, Math.min(sections.length, i + dir)), 0, item);
            return {
                ...d,
                sections,
            };
        });
    };
    const shuffle = () => {
        set((d) => ({
            ...d,
            sections: d.sections.map((x) => {
                const variants = blockVariants[x.type];
                return {
                    ...x,
                    variant: variants ? pick(variants).id : x.variant,
                    enter: pick(enterIds.filter((e) => e !== 'none')),
                    edge: pick(edgeIds),
                };
            }),
        }));
    };

    // Scenes resolved in order, so each editor knows what sits above it.
    const scenes: (SceneKind | undefined)[] = [];
    for (const section of draft.sections) {
        const prev = scenes.findLast((s) => s !== undefined);
        scenes.push(section.enabled ? resolveBlock(section, prev).scene : undefined);
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/40 p-3">
                <LayoutTemplate className="size-4 text-muted-foreground" />
                <Select
                    onValueChange={(slug) => {
                        set((d) => ({
                            ...d,
                            sections: applyLayout(
                                d.sections.map((x) => ({
                                    type: x.type,
                                    enabled: x.enabled,
                                })),
                                themeLayouts[slug],
                            ),
                        }));
                    }}
                >
                    <SelectTrigger className="h-8 flex-1 bg-background">
                        <SelectValue placeholder="Apply a theme layout…" />
                    </SelectTrigger>
                    <SelectContent>
                        {themeCatalog.map((theme) => (
                            <SelectItem key={theme.slug} value={theme.slug}>
                                {theme.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={shuffle}>
                    <Dices className="size-4" /> Shuffle
                </Button>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
                {draft.sections.map((section, i) => {
                    const prev = scenes.slice(0, i).findLast((s) => s !== undefined);
                    const resolved = resolveBlock(section, prev);
                    const variantLabel = blockVariants[section.type]?.find(
                        (v) => v.id === resolved.variant,
                    )?.label;
                    return (
                        <AccordionItem
                            key={section.type}
                            value={section.type}
                            className="rounded-xl border bg-card px-3 last:border-b"
                        >
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={section.enabled}
                                    aria-label={`Show ${sectionNames[section.type]}`}
                                    onCheckedChange={(enabled) => {
                                        patchAt(i, { enabled });
                                    }}
                                />
                                <AccordionTrigger className="flex-1 py-3 hover:no-underline">
                                    <span className="flex flex-1 flex-wrap items-center gap-2">
                                        <span
                                            className={cn(
                                                'text-sm font-medium',
                                                !section.enabled &&
                                                    'text-muted-foreground line-through',
                                            )}
                                        >
                                            {sectionNames[section.type]}
                                        </span>
                                        {section.enabled && (
                                            <>
                                                {variantLabel && (
                                                    <Badge variant="secondary">
                                                        {variantLabel}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline">
                                                    {enterInfo[resolved.enter].label}
                                                </Badge>
                                                <span
                                                    title={sceneInfo[resolved.scene].label}
                                                    className="size-3 rounded-full border"
                                                    style={{ background: swatchOf(resolved.scene) }}
                                                />
                                            </>
                                        )}
                                    </span>
                                </AccordionTrigger>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7"
                                    aria-label="Move up"
                                    disabled={i === 0}
                                    onClick={() => {
                                        move(i, -1);
                                    }}
                                >
                                    <ArrowUp className="size-3.5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7"
                                    aria-label="Move down"
                                    disabled={i === draft.sections.length - 1}
                                    onClick={() => {
                                        move(i, 1);
                                    }}
                                >
                                    <ArrowDown className="size-3.5" />
                                </Button>
                            </div>
                            <AccordionContent>
                                <BlockEditor
                                    section={section}
                                    previousScene={prev}
                                    calm={calm}
                                    update={(patch) => {
                                        patchAt(i, patch);
                                    }}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {missing.length > 0 && (
                <Select
                    value=""
                    onValueChange={(v) => {
                        const type = v as SectionType;
                        set((d) => ({
                            ...d,
                            sections: [
                                ...d.sections.slice(0, -1),
                                {
                                    type,
                                    enabled: true,
                                },
                                ...d.sections.slice(-1),
                            ],
                        }));
                    }}
                >
                    <SelectTrigger className="w-full border-dashed">
                        <Plus className="size-4" />
                        <SelectValue placeholder="Add a section" />
                    </SelectTrigger>
                    <SelectContent>
                        {missing.map((t) => (
                            <SelectItem key={t} value={t}>
                                {sectionNames[t]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
