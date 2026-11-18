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
import { type FilmFrames, filmLength, frameAt, frameCell } from '@shared/film';
import { motifLabel } from '@shared/motifs';
import { photoUrl } from '@shared/photos';
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
import { Slider } from '@/components/ui/slider';
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
    petals: 'radial-gradient(ellipse 4px 2.5px at 30% 30%,#e8778f 0 99%,transparent),radial-gradient(ellipse 4px 2.5px at 68% 62%,#f0a636 0 99%,transparent),#fbf4ec',
    rays: 'linear-gradient(115deg,transparent 30%,#f3d58a66 40%,transparent 50%,#f3d58a44 62%,transparent 70%),#15100c',
    confetti:
        'radial-gradient(circle at 20% 25%,#b3261e 0 1.6px,transparent 2px),radial-gradient(circle at 65% 40%,#c18f2f 0 1.6px,transparent 2px),radial-gradient(circle at 40% 75%,#2f6f5e 0 1.6px,transparent 2px),#fffdf8',
    midnight:
        'radial-gradient(circle at 30% 35%,#d9b36a 0 1px,transparent 1.6px),radial-gradient(circle at 70% 70%,#d9b36a 0 1px,transparent 1.6px),#101a3c',
    plain: 'linear-gradient(135deg,#ffffff,#f4f4f4)',
    film: 'linear-gradient(180deg,#1e2c63,#6b4a5e 70%,#e0a050)',
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

interface ThumbProps {
    frames: FilmFrames;
    at: number;
}

// One frame of the film, cut straight from its sprite sheet.
function FilmThumb({ frames, at }: ThumbProps) {
    const cell = frameCell(frames, frameAt(frames, at).index);
    const sheet = frames.sheets[cell.sheet];
    const x = frames.cols > 1 ? (cell.col / (frames.cols - 1)) * 100 : 0;
    const y = frames.rows > 1 ? (cell.row / (frames.rows - 1)) * 100 : 0;
    const look = {
        aspectRatio: `${String(frames.width)} / ${String(frames.height)}`,
        backgroundImage: sheet ? `url(${photoUrl(sheet)})` : undefined,
        backgroundSize: `${String(frames.cols * 100)}% ${String(frames.rows * 100)}%`,
        backgroundPosition: `${String(x)}% ${String(y)}%`,
    };
    return <div className="w-16 shrink-0 rounded-md bg-black" style={look} data-film-thumb />;
}

interface MomentProps {
    frames: FilmFrames;
    value: number | undefined;
    onChange: (at: number | undefined) => void;
}

// Which moment of the film behind the invitation this section rests on while guests read it.
function FilmMoment({ frames, value, onChange }: MomentProps) {
    const length = filmLength(frames);
    const keep = value === undefined;
    return (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">Film moment</Label>
            <div className="flex gap-3">
                <FilmThumb frames={frames} at={value ?? 0} />
                <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="film-keep"
                            checked={keep}
                            onCheckedChange={(on) => {
                                onChange(on === true ? undefined : 0);
                            }}
                        />
                        <Label htmlFor="film-keep" className="text-[13px] font-normal">
                            Keep the previous section&apos;s moment
                        </Label>
                    </div>
                    {!keep && (
                        <>
                            <Slider
                                aria-label="Film moment"
                                min={0}
                                max={length}
                                step={0.1}
                                value={[value]}
                                onValueChange={([v]) => {
                                    if (v !== undefined) onChange(Math.round(v * 10) / 10);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                {value.toFixed(1)} s of {length.toFixed(1)} s. Scrolling moves the
                                film here, then it holds while this section is read.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

interface BlockEditorProps {
    section: SectionConfig;
    previousScene?: SceneKind;
    // Calm motion (chosen, or imposed by a solemn occasion) offers gentle entrances only.
    calm: boolean;
    // The frames of a film playing behind the invitation, when there is one.
    film?: FilmFrames;
    update: (patch: Partial<SectionConfig>) => void;
}

export function BlockEditor({ section, previousScene, calm, film, update }: BlockEditorProps) {
    const hasDivider =
        dividerSections.includes(section.type) &&
        dividerLayouts.includes(resolveBlock(section, previousScene).variant);
    const variants = blockVariants[section.type] ?? [];
    const resolved = resolveBlock(section, previousScene);
    return (
        <div className="space-y-5 pt-2">
            {film && (
                <FilmMoment
                    frames={film}
                    value={section.filmAt}
                    onChange={(filmAt) => {
                        update({ filmAt });
                    }}
                />
            )}
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
