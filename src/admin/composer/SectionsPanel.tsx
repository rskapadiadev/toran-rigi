import {
    blockVariants,
    calmEntrances,
    edgeInfo,
    enterInfo,
    resolveBlock,
    sceneInfo,
    settleEnter,
    type VariantInfo,
} from '@shared/blocks';
import { motifIds } from '@shared/schemas/invitation';
import type { EdgeKind, EnterPreset, SceneKind, SectionConfig } from '@shared/types';

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
