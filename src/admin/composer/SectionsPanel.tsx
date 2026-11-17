import {
    blockVariants,
    calmEntrances,
    dividerInfo,
    edgeInfo,
    enterInfo,
    resolveBlock,
    sceneInfo,
    settleEnter,
    type VariantInfo,
} from '@shared/blocks';
import { motifLabel } from '@shared/motifs';
import { motifIds } from '@shared/schemas/invitation';
import type { DividerKind, EdgeKind, EnterPreset, SceneKind, SectionConfig } from '@shared/types';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/cn';

const enterIds = Object.keys(enterInfo) as EnterPreset[];
const sceneIds = Object.keys(sceneInfo) as SceneKind[];
const edgeIds = Object.keys(edgeInfo) as EdgeKind[];
const dividerIds = Object.keys(dividerInfo) as DividerKind[];
// Only the words-only chapters, in the layouts that draw one, carry a divider.
const dividerSections: readonly string[] = ['welcome', 'story', 'family'];
const dividerLayouts: readonly string[] = ['centered', 'framed', 'illuminated'];
const AUTO = '__auto';

// Swatches hint at each backdrop without rendering the full material in the list.
const sceneSwatch: Record<SceneKind, string> = {
    silk: 'linear-gradient(135deg,#e9d6b0,#c9a35d)',
    jacquard: 'linear-gradient(135deg,#6e1a2e,#3d0d19)',
    paper: 'linear-gradient(135deg,#fbf6ec,#efe4cf)',
    blush: 'linear-gradient(135deg,#f6dfe2,#e8c4ca)',
    velvet: 'linear-gradient(135deg,#3a0f1c,#140509)',
    night: 'radial-gradient(circle at 30% 30%,#fff 0 1px,transparent 2px),linear-gradient(135deg,#141a3a,#05030c)',
    terrazzo:
        'radial-gradient(circle at 25% 30%,#b3261e 0 2px,transparent 3px),radial-gradient(circle at 70% 60%,#c18f2f 0 2.5px,transparent 3.5px),radial-gradient(circle at 45% 78%,#2f6f5e 0 2px,transparent 3px),#f1ede6',
    watercolor:
        'radial-gradient(circle at 30% 35%,#e8b4bc88,transparent 55%),radial-gradient(circle at 70% 65%,#b9d4c888,transparent 55%),#fbf7f0',
    leheriya:
        'repeating-linear-gradient(135deg,#e9a8b4 0 4px,#efd08c 4px 8px,#9fcfbf 8px 12px,#fbf3e4 12px 16px)',
    aurora: 'radial-gradient(circle at 25% 30%,#b3261eaa,transparent 60%),radial-gradient(circle at 75% 70%,#2f6f5eaa,transparent 60%),#0d0610',
    confetti:
        'radial-gradient(circle at 20% 25%,#b3261e 0 1.6px,transparent 2px),radial-gradient(circle at 65% 40%,#c18f2f 0 1.6px,transparent 2px),radial-gradient(circle at 40% 75%,#2f6f5e 0 1.6px,transparent 2px),#fffdf8',
    plain: 'linear-gradient(135deg,#ffffff,#f4f4f4)',
};

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

export function BlockEditor({ section, previousScene, calm, update }: BlockEditorProps) {
    const hasDivider =
        dividerSections.includes(section.type) &&
        dividerLayouts.includes(resolveBlock(section, previousScene).variant);
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
                    {/* One switch for every edge: drift, breathe, walk or pulse. */}
                    <Label className="flex items-center gap-2 text-sm font-normal">
                        <Checkbox
                            checked={section.edgeMotion ?? false}
                            disabled={(section.edge ?? 'seam') === 'none'}
                            onCheckedChange={(checked) => {
                                update({ edgeMotion: checked === true ? true : undefined });
                            }}
                        />
                        Animate edge
                    </Label>
                </div>
                {hasDivider && (
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase">Divider</Label>
                        <Select
                            value={section.divider ?? AUTO}
                            onValueChange={(v) => {
                                const divider = v === AUTO ? undefined : (v as DividerKind);
                                update({ divider });
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AUTO}>Layout default</SelectItem>
                                {dividerIds.map((id) => (
                                    <SelectItem key={id} value={id}>
                                        {dividerInfo[id].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
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
                                <SelectItem key={id} value={id}>
                                    {motifLabel(id)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
