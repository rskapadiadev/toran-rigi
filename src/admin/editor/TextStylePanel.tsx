import {
    type Fill,
    fillCss,
    textAnimationInfo,
    textAnimations,
    type TextFont,
    type TextStyle,
} from '@shared/text-style';
import { Bold, CaseUpper, Italic, RotateCcw, Underline } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { TextPath } from '@/invitation/editing';
import { cn } from '@/lib/utils';

// "events.2.title" → "Ceremony 3 · title"
export function textLabel(path: TextPath): string {
    const named: Record<string, string> = {
        headline: 'Headline',
        welcome: 'Welcome message',
        story: 'Story',
        family: 'Family',
        closing: 'Closing',
        'people.one.name': 'Name (first)',
        'people.two.name': 'Name (second)',
    };
    const event = /^events\.(\d+)\.(\w+)$/.exec(path);
    if (event) return `Ceremony ${String(Number(event[1]) + 1)} · ${event[2] ?? ''}`;
    return named[path] ?? path;
}

interface RowProps {
    label: string;
    children: ReactNode;
    value?: string;
}

function Row({ label, children, value }: RowProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
                {value && (
                    <span className="text-xs text-muted-foreground tabular-nums">{value}</span>
                )}
            </div>
            {children}
        </div>
    );
}

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
    return (
        <label className="flex flex-1 items-center gap-2 rounded-md border px-2 py-1.5 text-xs">
            <input
                type="color"
                aria-label={label}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <span className="font-mono uppercase">{value}</span>
        </label>
    );
}

interface FillEditorProps {
    label: string;
    value?: Fill;
    fallback: string;
    onChange: (fill: Fill | undefined) => void;
}

// None / solid / gradient, with colour pickers and the gradient's angle.
function FillEditor({ label, value, fallback, onChange }: FillEditorProps) {
    const kind = value?.kind ?? 'none';
    const from = value?.kind === 'gradient' ? value.from : (value?.color ?? fallback);
    const to = value?.kind === 'gradient' ? value.to : '#c2185b';
    const angle = value?.kind === 'gradient' ? value.angle : 90;
    return (
        <Row label={label}>
            <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                className="w-full"
                value={kind}
                onValueChange={(v) => {
                    if (v === 'none') onChange(undefined);
                    else if (v === 'solid')
                        onChange({
                            kind: 'solid',
                            color: from,
                        });
                    else if (v === 'gradient')
                        onChange({
                            kind: 'gradient',
                            from,
                            to,
                            angle,
                        });
                }}
            >
                <ToggleGroupItem value="none" className="flex-1 text-xs">
                    None
                </ToggleGroupItem>
                <ToggleGroupItem value="solid" className="flex-1 text-xs">
                    Solid
                </ToggleGroupItem>
                <ToggleGroupItem value="gradient" className="flex-1 text-xs">
                    Gradient
                </ToggleGroupItem>
            </ToggleGroup>
            {value?.kind === 'solid' && (
                <ColorInput
                    label={`${label} colour`}
                    value={value.color}
                    onChange={(color) => {
                        onChange({
                            kind: 'solid',
                            color,
                        });
                    }}
                />
            )}
            {value?.kind === 'gradient' && (
                <div className="space-y-2">
                    <div
                        className="h-6 rounded-md ring-1 ring-border"
                        style={{ background: fillCss(value) }}
                    />
                    <div className="flex gap-2">
                        <ColorInput
                            label={`${label} start colour`}
                            value={from}
                            onChange={(c) => {
                                onChange({
                                    ...value,
                                    from: c,
                                });
                            }}
                        />
                        <ColorInput
                            label={`${label} end colour`}
                            value={to}
                            onChange={(c) => {
                                onChange({
                                    ...value,
                                    to: c,
                                });
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="shrink-0 text-xs text-muted-foreground">Angle</span>
                        <Slider
                            min={0}
                            max={360}
                            step={15}
                            value={[angle]}
                            aria-label={`${label} gradient angle`}
                            onValueChange={([a]) => {
                                onChange({
                                    ...value,
                                    angle: a ?? angle,
                                });
                            }}
                        />
                        <span className="w-9 text-end text-xs tabular-nums">{String(angle)}°</span>
                    </div>
                </div>
            )}
        </Row>
    );
}

interface FontOption {
    value: TextFont;
    label: string;
    className: string;
}

interface TextStylePanelProps {
    path: TextPath;
    style: TextStyle;
    palette: {
        primary: string;
        gold: string;
    };
    onChange: (style: TextStyle) => void;
    onReset: () => void;
}

// Right pane while a text is selected on the canvas: everything about how that text looks and moves.
export function TextStylePanel({ path, style, palette, onChange, onReset }: TextStylePanelProps) {
    const patch = (next: Partial<TextStyle>) => {
        onChange({
            ...style,
            ...next,
        });
    };
    const marks = [
        style.bold && 'bold',
        style.italic && 'italic',
        style.underline && 'underline',
        style.caps && 'caps',
    ].filter((m): m is string => Boolean(m));
    const fonts: FontOption[] = [
        {
            value: 'inherit',
            label: 'Design',
            className: '',
        },
        {
            value: 'display',
            label: 'Display',
            className: 'font-serif',
        },
        {
            value: 'script',
            label: 'Script',
            className: 'font-serif italic',
        },
        {
            value: 'body',
            label: 'Body',
            className: 'font-sans',
        },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                        Text
                    </p>
                    <h2 className="text-base font-semibold">{textLabel(path)}</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onReset}>
                    <RotateCcw /> Reset
                </Button>
            </div>

            <Row label="Style">
                <ToggleGroup
                    type="multiple"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    value={marks}
                    onValueChange={(v) => {
                        patch({
                            bold: v.includes('bold') || undefined,
                            italic: v.includes('italic') || undefined,
                            underline: v.includes('underline') || undefined,
                            caps: v.includes('caps') || undefined,
                        });
                    }}
                >
                    <ToggleGroupItem value="bold" aria-label="Bold" className="flex-1">
                        <Bold />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic" aria-label="Italic" className="flex-1">
                        <Italic />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline" aria-label="Underline" className="flex-1">
                        <Underline />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="caps" aria-label="All caps" className="flex-1">
                        <CaseUpper />
                    </ToggleGroupItem>
                </ToggleGroup>
            </Row>

            <Row label="Font">
                <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    value={style.font ?? 'inherit'}
                    onValueChange={(v) => {
                        if (v) patch({ font: v === 'inherit' ? undefined : (v as TextFont) });
                    }}
                >
                    {fonts.map((f) => (
                        <ToggleGroupItem
                            key={f.value}
                            value={f.value}
                            className={cn('flex-1 text-xs', f.className)}
                        >
                            {f.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </Row>

            <Row label="Size" value={`${String(Math.round((style.size ?? 1) * 100))}%`}>
                <Slider
                    min={0.5}
                    max={2}
                    step={0.05}
                    value={[style.size ?? 1]}
                    aria-label="Text size"
                    onValueChange={([v]) => {
                        patch({ size: v === undefined || v === 1 ? undefined : v });
                    }}
                />
            </Row>

            <Row label="Letter spacing" value={(style.tracking ?? 0).toFixed(2)}>
                <Slider
                    min={-0.05}
                    max={0.5}
                    step={0.01}
                    value={[style.tracking ?? 0]}
                    aria-label="Letter spacing"
                    onValueChange={([v]) => {
                        patch({ tracking: v ? v : undefined });
                    }}
                />
            </Row>

            <FillEditor
                label="Text colour"
                value={style.color}
                fallback={palette.primary}
                onChange={(color) => {
                    patch({ color });
                }}
            />

            <FillEditor
                label="Highlight behind text"
                value={style.background}
                fallback={palette.gold}
                onChange={(background) => {
                    patch({ background });
                }}
            />
            {style.background && (
                <Row label="Highlight corners" value={(style.radius ?? 0.2).toFixed(2)}>
                    <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={[style.radius ?? 0.2]}
                        aria-label="Highlight corner rounding"
                        onValueChange={([v]) => {
                            patch({ radius: v });
                        }}
                    />
                </Row>
            )}

            <Row label="Animation">
                <div className="grid grid-cols-3 gap-1.5">
                    {textAnimations.map((a) => {
                        const active = (style.animation ?? 'none') === a;
                        return (
                            <button
                                key={a}
                                type="button"
                                title={textAnimationInfo[a].hint}
                                aria-pressed={active}
                                onClick={() => {
                                    patch({ animation: a === 'none' ? undefined : a });
                                }}
                                className={cn(
                                    'rounded-md border px-2 py-2 text-xs transition',
                                    active
                                        ? 'border-primary bg-primary/10 font-medium'
                                        : 'hover:bg-muted',
                                )}
                            >
                                {textAnimationInfo[a].label}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-muted-foreground">
                    {textAnimationInfo[style.animation ?? 'none'].hint}
                </p>
            </Row>
        </div>
    );
}
