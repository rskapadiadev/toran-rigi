import { openingChoiceFor, openingChoices } from '@shared/blocks';
import { cultureIds, cultureOf, eventLabel } from '@shared/cultures';
import { type FontKey, fonts, fontStack } from '@shared/fonts';
import { seedFrom } from '@shared/generative';
import { contentLocales, localeNames } from '@shared/locales';
import {
    allowedSection,
    cappedMotion,
    categoryInfo,
    eventVocabFor,
    greetingsFor,
    isCouple,
    isSolemn,
    type OccasionId,
    occasionOf,
    type OccasionPack,
} from '@shared/occasions';
import { generatePalette } from '@shared/palette';
import { generativeKinds } from '@shared/schemas/invitation';
import { themeCatalog, type ThemeDefinition } from '@shared/themes';
import type { LocalizedText, Palette, SectionType } from '@shared/types';
import {
    ArrowDown,
    ArrowUp,
    Brush,
    CalendarClock,
    Check,
    Coins,
    Dices,
    DoorOpen,
    Droplets,
    Flame,
    Flower,
    Flower2,
    Grid3x3,
    Heart,
    Lamp,
    type LucideIcon,
    Mail,
    MapPin,
    Music,
    PartyPopper,
    Plus,
    Radio,
    Rocket,
    Shapes,
    Sparkles,
    Tent,
    Trash2,
    Type,
    Wand2,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { FormField } from '../kit/form';
import { OccasionSelect } from '../kit/occasion';
import { cultureLabel } from '../labels';
import type { Draft } from './draft';
import { timezones } from './draft';

export interface PanelProps {
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
}

const paletteKeys: (keyof Palette)[] = [
    'bg',
    'surface',
    'ink',
    'muted',
    'primary',
    'accent',
    'gold',
];
const paletteNames: Record<keyof Palette, string> = {
    bg: 'Background',
    surface: 'Surface',
    ink: 'Text',
    muted: 'Muted text',
    primary: 'Primary',
    accent: 'Accent',
    gold: 'Gold / foil',
};

export const sectionNames: Record<SectionType, string> = {
    cover: 'Cover & names',
    names: 'Names (in cover)',
    card: 'Invitation card (stacked stationery)',
    countdown: 'Countdown',
    welcome: 'Welcome',
    story: 'Our story',
    gallery: 'Gallery',
    events: 'Ceremonies',
    venue: 'Venue (in ceremonies)',
    family: 'Family',
    dressCode: 'Dress code (in ceremonies)',
    travel: 'Travel & stay',
    live: 'Live stream',
    rsvp: 'RSVP',
    wishes: 'Wishes wall',
    shagun: 'Shagun / gifts',
    photoWall: 'Guest photo wall',
    closing: 'Closing & share',
};

const NONE = '__none__';

const setText = (
    text: LocalizedText | undefined,
    locale: string,
    value: string,
): LocalizedText => ({
    ...(text ?? {}),
    [locale]: value,
});

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

// ── Small building blocks shared by every panel ───────────────────────────────

export interface Option {
    value: string;
    label: ReactNode;
}

interface SelectFieldProps {
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    className?: string;
}

export function SelectField({ label, value, options, onChange, className }: SelectFieldProps) {
    return (
        <FormField label={label} className={className}>
            {(id) => (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger id={id} className="w-full bg-card">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </FormField>
    );
}

// Native-script specimens: script fonts are judged on their own letters, not on Latin fallbacks.
const fontSpecimen: Record<FontKey, string> = {
    cormorant: 'Riya & Kabir',
    fraunces: 'Riya & Kabir',
    cinzel: 'Riya & Kabir',
    marcellus: 'Riya & Kabir',
    pinyon: 'Riya & Kabir',
    manrope: 'Riya & Kabir',
    devanagari: 'शुभ विवाह',
    gujarati: 'શુભ લગ્ન',
    amiri: 'بسم الله',
    kufi: 'زفاف سعيد',
    ruqaa: 'زفاف سعيد',
    nastaliq: 'شادی مبارک',
    hebrew: 'מזל טוב',
    gurmukhi: 'ਸ਼ੁਭ ਵਿਆਹ',
};

function FontSample({ font }: { font: FontKey }) {
    return (
        <span className="inline-grid grid-cols-[7.5rem_auto] items-baseline gap-3">
            <span className="text-[15px]" style={{ fontFamily: fontStack(font) }}>
                {titleCase(font)}
            </span>
            <span
                dir="auto"
                className="text-base text-muted-foreground"
                style={{ fontFamily: fontStack(font) }}
            >
                {fontSpecimen[font]}
            </span>
        </span>
    );
}

interface TextFieldProps {
    label: string;
    value: string | undefined;
    onChange: (value: string) => void;
    long?: boolean;
    dir?: 'auto' | 'ltr';
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    type?: string;
}

export function TextField({
    label,
    value,
    onChange,
    long = false,
    dir = 'auto',
    placeholder,
    className,
    disabled,
    type,
}: TextFieldProps) {
    return (
        <FormField label={label} className={className}>
            {(id) =>
                long ? (
                    <Textarea
                        id={id}
                        rows={3}
                        value={value ?? ''}
                        dir={dir}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="bg-card"
                        onChange={(e) => {
                            onChange(e.target.value);
                        }}
                    />
                ) : (
                    <Input
                        id={id}
                        type={type}
                        value={value ?? ''}
                        dir={dir}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="bg-card"
                        onChange={(e) => {
                            onChange(e.target.value);
                        }}
                    />
                )
            }
        </FormField>
    );
}

interface SwitchRowProps {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon?: ReactNode;
}

export function SwitchRow({ id, label, description, checked, onChange, icon }: SwitchRowProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card px-3.5 py-3">
            {icon && (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
                    {icon}
                </span>
            )}
            <Label htmlFor={id} className="flex-1 flex-col items-start gap-0.5 font-normal">
                <span className="text-sm font-medium">{label}</span>
                {description && (
                    <span className="text-xs text-muted-foreground">{description}</span>
                )}
            </Label>
            <Switch id={id} checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

interface ColorSwatchProps {
    value: string;
    label: string;
    onChange: (value: string) => void;
    className?: string;
}

/** Native colour picker dressed as a swatch, so it stays keyboard and screen-reader friendly. */
function ColorSwatch({ value, label, onChange, className }: ColorSwatchProps) {
    return (
        <span
            className={cn(
                'relative inline-flex size-9 shrink-0 overflow-hidden rounded-lg border shadow-xs ring-offset-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring',
                className,
            )}
            style={{ background: value }}
        >
            <input
                type="color"
                aria-label={label}
                value={value}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                onChange={(e) => {
                    onChange(e.target.value);
                }}
            />
        </span>
    );
}

const sectionTrigger = 'py-3.5 text-[13px] font-semibold hover:no-underline';

// ── Design ───────────────────────────────────────────────────────────────────

const openingIcon: Record<string, LucideIcon> = {
    doors: DoorOpen,
    mashrabiya: Grid3x3,
    'garden-arch': Flower,
    envelope: Mail,
    curtain: Type,
    lotus: Flower2,
    lantern: Lamp,
    chuppah: Tent,
    diya: Flame,
    scratch: Coins,
    'liquid-gold': Droplets,
    ink: Brush,
    origami: Shapes,
    warp: Rocket,
    fireworks: PartyPopper,
};

interface OpeningPickerProps {
    value: Draft['design']['opening'];
    // Remembrance: festive entries are hidden, not merely discouraged.
    gentleOnly: boolean;
    onChange: (value: Draft['design']['opening']) => void;
}

// Picking an entry replays it in the phone preview, so the designer sees it at once.
function OpeningPicker({ value, gentleOnly, onChange }: OpeningPickerProps) {
    const selected = openingChoiceFor(value);
    const choices = openingChoices.filter((c) => !gentleOnly || c.gentle);
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                {choices.map((c) => {
                    const Icon = openingIcon[c.id] ?? Sparkles;
                    const on = selected === c.id;
                    return (
                        <button
                            key={c.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                                onChange(c.id);
                            }}
                            className={cn(
                                'flex flex-col gap-2 rounded-lg border bg-card p-3 text-start text-xs transition outline-none hover:border-gold/60 focus-visible:ring-2 focus-visible:ring-ring',
                                on && 'border-primary bg-primary/5 ring-1 ring-primary',
                            )}
                        >
                            <span className="flex items-center justify-between">
                                <span className="flex size-8 items-center justify-center rounded-md bg-gold/12 text-gold-deep">
                                    <Icon className="size-4" />
                                </span>
                                {on && <Check className="size-3.5 text-primary" />}
                            </span>
                            <span>
                                <span className="block text-[13px] font-medium">{c.label}</span>
                                <span className="text-muted-foreground">{c.hint}</span>
                            </span>
                            <Badge variant="outline" className="w-fit font-normal">
                                {c.gesture}
                            </Badge>
                        </button>
                    );
                })}
            </div>
            {gentleOnly && (
                <p className="text-xs text-muted-foreground">
                    Remembrance occasions show gentle entries only.
                </p>
            )}
        </div>
    );
}

interface ThemeGridProps {
    title: string;
    themes: ThemeDefinition[];
    selected: string | undefined;
    onPick: (theme: ThemeDefinition) => void;
}

function ThemeGrid({ title, themes, selected, onPick }: ThemeGridProps) {
    return (
        <div className="mb-4 space-y-2 last:mb-0">
            <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                {themes.map((theme) => {
                    const on = selected === theme.slug;
                    const p = theme.design.palette;
                    return (
                        <button
                            key={theme.slug}
                            type="button"
                            aria-pressed={on}
                            title={theme.description}
                            onClick={() => {
                                onPick(theme);
                            }}
                            className={cn(
                                'group relative flex flex-col overflow-hidden rounded-lg border bg-card text-start text-xs transition-all outline-none hover:border-gold/60 focus-visible:ring-2 focus-visible:ring-ring',
                                on && 'border-primary ring-1 ring-primary',
                            )}
                        >
                            <span className="flex h-10" style={{ background: p.bg }}>
                                {[p.primary, p.accent, p.gold].map((c, i) => (
                                    <span
                                        key={`${c}-${String(i)}`}
                                        className="mt-auto h-3 flex-1"
                                        style={{ background: c }}
                                    />
                                ))}
                            </span>
                            <span className="flex items-center justify-between gap-1 px-2.5 py-2">
                                <span className="min-w-0">
                                    <span className="block truncate font-medium">{theme.name}</span>
                                    <span className="text-muted-foreground">
                                        {cultureLabel[theme.culture]}
                                    </span>
                                </span>
                                {on && <Check className="size-3.5 shrink-0 text-primary" />}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function DesignPanel({ draft, set }: PanelProps) {
    const [colors, setColors] = useState<string[]>([
        draft.design.palette.primary,
        draft.design.palette.accent,
        draft.design.palette.gold,
    ]);
    const setDesign = (patch: Partial<Draft['design']>) => {
        set((d) => ({
            ...d,
            design: {
                ...d.design,
                ...patch,
            },
        }));
    };
    const occasion = occasionOf(draft.occasion);
    const suited = themeCatalog.filter((t) => t.suits.includes(occasion.category));
    const others = themeCatalog.filter((t) => !t.suits.includes(occasion.category));
    const pickTheme = (theme: ThemeDefinition) => {
        set((d) => ({
            ...d,
            themeSlug: theme.slug,
            design: {
                ...theme.design,
                motion: cappedMotion(theme.design.motion, occasion),
            },
        }));
    };
    const fontOptions = (Object.keys(fonts) as FontKey[]).map((f) => ({
        value: f,
        label: <FontSample font={f} />,
    }));
    return (
        <Accordion
            type="multiple"
            defaultValue={['opening', 'theme', 'palette', 'type']}
            className="w-full"
        >
            <AccordionItem value="opening">
                <AccordionTrigger className={sectionTrigger}>
                    Opening · the entry screen guests see first
                </AccordionTrigger>
                <AccordionContent>
                    <OpeningPicker
                        value={draft.design.opening}
                        gentleOnly={isSolemn(occasion)}
                        onChange={(opening) => {
                            setDesign({ opening });
                        }}
                    />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="theme">
                <AccordionTrigger className={sectionTrigger}>Start from a theme</AccordionTrigger>
                <AccordionContent>
                    <ThemeGrid
                        title={`Made for ${categoryInfo[occasion.category].label.toLowerCase()}`}
                        themes={suited}
                        selected={draft.themeSlug}
                        onPick={pickTheme}
                    />
                    {others.length > 0 && (
                        <ThemeGrid
                            title="More designs"
                            themes={others}
                            selected={draft.themeSlug}
                            onPick={pickTheme}
                        />
                    )}
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="palette">
                <AccordionTrigger className={sectionTrigger}>Palette</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div className="rounded-lg border border-gold/30 bg-gold/5 p-3.5">
                        <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                            <Wand2 className="size-4 text-gold-deep" /> Your colours → palette
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            {colors.map((c, i) => (
                                <ColorSwatch
                                    key={i}
                                    value={c}
                                    label={`Colour ${String(i + 1)}`}
                                    onChange={(v) => {
                                        setColors(colors.map((x, k) => (k === i ? v : x)));
                                    }}
                                />
                            ))}
                            <div className="ms-auto flex gap-2">
                                <Button
                                    size="sm"
                                    variant="gold"
                                    onClick={() => {
                                        setDesign({palette: generatePalette(colors, { mode: 'light' }),});
                                    }}
                                >
                                    Light palette
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setDesign({palette: generatePalette(colors, { mode: 'dark' }),});
                                    }}
                                >
                                    Dark palette
                                </Button>
                            </div>
                        </div>
                        <p className="mt-2.5 text-xs text-muted-foreground">
                            Contrast is checked automatically, so text always stays readable.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {paletteKeys.map((key) => (
                            <div
                                key={key}
                                className="flex items-center gap-2 rounded-lg border bg-card p-1.5 pe-2.5"
                            >
                                <ColorSwatch
                                    value={draft.design.palette[key]}
                                    label={paletteNames[key]}
                                    className="size-7 rounded-md"
                                    onChange={(v) => {
                                        setDesign({
                                            palette: {
                                                ...draft.design.palette,
                                                [key]: v,
                                            },
                                        });
                                    }}
                                />
                                <span className="min-w-0">
                                    <span className="block truncate text-xs font-medium">
                                        {paletteNames[key]}
                                    </span>
                                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                                        {draft.design.palette[key]}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="type">
                <AccordionTrigger className={sectionTrigger}>Typography & ritual</AccordionTrigger>
                <AccordionContent className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                        label="Display font"
                        value={draft.design.fonts.display}
                        options={fontOptions}
                        onChange={(v) => {
                            setDesign({
                                fonts: {
                                    ...draft.design.fonts,
                                    display: v,
                                },
                            });
                        }}
                    />
                    <SelectField
                        label="Body font"
                        value={draft.design.fonts.body}
                        options={fontOptions}
                        onChange={(v) => {
                            setDesign({
                                fonts: {
                                    ...draft.design.fonts,
                                    body: v,
                                },
                            });
                        }}
                    />
                    <div className="space-y-2">
                        <p className="text-[13px] font-medium text-foreground/80">Motion</p>
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            size="sm"
                            className="w-full bg-card"
                            aria-label="Motion"
                            value={draft.design.motion}
                            onValueChange={(v) => {
                                if (v === 'calm' || v === 'rich' || v === 'cinematic')
                                    setDesign({ motion: v });
                            }}
                        >
                            {(['calm', 'rich', 'cinematic'] as const).map((m) => (
                                <ToggleGroupItem
                                    key={m}
                                    value={m}
                                    // The occasion caps motion: a prayer meet stays calm.
                                    disabled={cappedMotion(m, occasion) !== m}
                                    className="flex-1 text-xs"
                                >
                                    {titleCase(m)}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                        {occasion.motion.ceiling !== 'cinematic' && (
                            <p className="text-xs text-muted-foreground">
                                {occasion.name.en} keeps motion {occasion.motion.ceiling} or
                                gentler.
                            </p>
                        )}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <p className="text-[13px] font-medium text-foreground/80">Paper texture</p>
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            size="sm"
                            className="w-full bg-card"
                            aria-label="Paper texture"
                            value={draft.design.texture}
                            onValueChange={(v) => {
                                if (v === 'paper' || v === 'silk' || v === 'linen' || v === 'none')
                                    setDesign({ texture: v });
                            }}
                        >
                            {(['paper', 'silk', 'linen', 'none'] as const).map((t) => (
                                <ToggleGroupItem key={t} value={t} className="flex-1 text-xs">
                                    {titleCase(t)}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="art">
                <AccordionTrigger className={sectionTrigger}>Generative art</AccordionTrigger>
                <AccordionContent className="space-y-5">
                    <SelectField
                        label="Pattern"
                        value={draft.design.generative.kind}
                        options={generativeKinds.map((k) => ({
                            value: k,
                            label: titleCase(k),
                        }))}
                        onChange={(v) => {
                            const kind = generativeKinds.find((k) => k === v);
                            if (kind)
                                setDesign({
                                    generative: {
                                        ...draft.design.generative,
                                        kind,
                                    },
                                });
                        }}
                    />
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="density" className="text-[13px] text-foreground/80">
                                Density
                            </Label>
                            <span className="font-mono text-xs text-muted-foreground">
                                {Math.round(draft.design.generative.density * 100)}%
                            </span>
                        </div>
                        <Slider
                            id="density"
                            min={0.2}
                            max={1}
                            step={0.05}
                            value={[draft.design.generative.density]}
                            onValueChange={([v]) => {
                                if (v !== undefined)
                                    setDesign({
                                        generative: {
                                            ...draft.design.generative,
                                            density: v,
                                        },
                                    });
                            }}
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            set((d) => ({
                                ...d,
                                seed: seedFrom(String(Date.now()), String(Math.random())),
                            }));
                        }}
                    >
                        <Dices /> Shuffle the generative art
                    </Button>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

// ── Words ────────────────────────────────────────────────────────────────────

// Changing occasion re-fits everything that depends on it: greeting, forbidden sections, motion, RSVP.
function switchOccasion(d: Draft, next: OccasionId): Draft {
    const occasion = occasionOf(next);
    const greetings = greetingsFor(cultureOf(d.culture), occasion);
    const keepGreeting = greetings.some((g) => g.key === d.content.greetingKey);
    const solemnNow = !occasion.motion.burst && occasion.motion.ceiling === 'calm';
    return {
        ...d,
        occasion: next,
        content: {
            ...d.content,
            greetingKey: keepGreeting ? d.content.greetingKey : greetings[0]?.key,
        },
        sections: d.sections.filter((x) => allowedSection(occasion, x.type)),
        design: {
            ...d.design,
            motion: cappedMotion(d.design.motion, occasion),
        },
        rsvpEnabled: allowedSection(occasion, 'rsvp') && (d.rsvpEnabled || !solemnNow),
    };
}

type Person = Draft['content']['people']['one'];

interface PeopleFieldsProps {
    occasion: OccasionPack;
    people: Draft['content']['people'];
    locale: string;
    onChange: (people: Draft['content']['people']) => void;
}

// Name fields follow the occasion: two partners, a baby with parents, or the departed with life dates.
function PeopleFields({ occasion, people, locale, onChange }: PeopleFieldsProps) {
    const slots = occasion.people.two ? (['one', 'two'] as const) : (['one'] as const);
    const update = (slot: 'one' | 'two', patch: Partial<Person>) => {
        onChange({
            ...people,
            [slot]: {
                ...(people[slot] ?? { name: {} }),
                ...patch,
            },
        });
    };
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {slots.map((slot) => {
                const role = slot === 'one' ? occasion.people.one : occasion.people.two;
                const person = people[slot];
                if (!role) return null;
                return (
                    <div key={slot} className="contents">
                        {occasion.fields.honorific && slot === 'one' && (
                            <TextField
                                label="Honorific"
                                placeholder="Late Shri / Smt. / Dr."
                                value={person?.honorific?.[locale]}
                                onChange={(v) => {
                                    update(slot, {honorific: setText(person?.honorific, locale, v),});
                                }}
                            />
                        )}
                        <TextField
                            label={role.label}
                            placeholder={role.placeholder}
                            value={person?.name[locale]}
                            onChange={(v) => {
                                update(slot, { name: setText(person?.name, locale, v) });
                            }}
                        />
                        {occasion.fields.parents && (
                            <TextField
                                label={`Parents (${role.label.toLowerCase()})`}
                                placeholder="Son of Mr & Mrs Shah"
                                value={person?.parents?.[locale]}
                                onChange={(v) => {
                                    update(slot, { parents: setText(person?.parents, locale, v) });
                                }}
                            />
                        )}
                        {occasion.fields.lifeDates && slot === 'one' && (
                            <>
                                <TextField
                                    label="Born"
                                    type="date"
                                    dir="ltr"
                                    value={person?.born}
                                    onChange={(v) => {
                                        update(slot, { born: v || undefined });
                                    }}
                                />
                                <TextField
                                    label="Passed away"
                                    type="date"
                                    dir="ltr"
                                    value={person?.passed}
                                    onChange={(v) => {
                                        update(slot, { passed: v || undefined });
                                    }}
                                />
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function ContentPanel({ draft, set }: PanelProps) {
    const [picked, setLocale] = useState(draft.locales[0] ?? 'en');
    const locale = draft.locales.includes(picked) ? picked : (draft.locales[0] ?? 'en');
    const culture = cultureOf(draft.culture);
    const occasion = occasionOf(draft.occasion);
    const c = draft.content;
    const setContent = (patch: Partial<Draft['content']>) => {
        set((d) => ({
            ...d,
            content: {
                ...d.content,
                ...patch,
            },
        }));
    };
    return (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Occasion">
                    {(id) => (
                        <OccasionSelect
                            id={id}
                            value={occasion.id}
                            onChange={(next) => {
                                set((d) => switchOccasion(d, next));
                            }}
                        />
                    )}
                </FormField>
                <SelectField
                    label="Tradition"
                    value={draft.culture.split('.')[0] ?? draft.culture}
                    options={cultureIds.map((id) => ({
                        value: id,
                        label: cultureLabel[id],
                    }))}
                    onChange={(value) => {
                        const next = cultureOf(value);
                        set((d) => ({
                            ...d,
                            culture: value,
                            calendars: next.calendars.filter(
                                (x): x is 'islamic-umalqura' | 'hebrew' => x !== 'gregorian',
                            ),
                            content: {
                                ...d.content,
                                greetingKey: greetingsFor(next, occasionOf(d.occasion))[0]?.key,
                            },
                        }));
                    }}
                />
                <SelectField
                    label="Sacred greeting (vetted)"
                    value={c.greetingKey ?? NONE}
                    options={[
                        {
                            value: NONE,
                            label: 'None',
                        },
                        ...greetingsFor(culture, occasion).map((g) => ({
                            value: g.key,
                            label: g.transliteration ?? g.text.en ?? g.key,
                        })),
                    ]}
                    onChange={(v) => {
                        setContent({ greetingKey: v === NONE ? undefined : v });
                    }}
                />
            </div>
            <div className="space-y-2">
                <p className="text-[13px] font-medium text-foreground/80">
                    Languages on the invitation
                </p>
                <ToggleGroup
                    type="multiple"
                    variant="outline"
                    size="sm"
                    spacing={2}
                    aria-label="Languages on the invitation"
                    className="flex-wrap"
                    value={draft.locales}
                    onValueChange={(next) => {
                        if (next.length === 0) return;
                        set((d) => ({
                            ...d,
                            locales: [
                                ...d.locales.filter((l) => next.includes(l)),
                                ...next.filter((l) => !d.locales.includes(l)),
                            ],
                        }));
                    }}
                >
                    {contentLocales.map((l) => (
                        <ToggleGroupItem
                            key={l}
                            value={l}
                            className="rounded-full bg-card px-3 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                            {localeNames[l]}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
            {draft.locales.length > 1 && (
                <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-1 ps-3">
                    <span className="text-xs text-muted-foreground">Editing</span>
                    <ToggleGroup
                        type="single"
                        size="sm"
                        aria-label="Editing language"
                        className="flex-1"
                        value={locale}
                        onValueChange={(v) => {
                            if (v) setLocale(v);
                        }}
                    >
                        {draft.locales.map((l) => (
                            <ToggleGroupItem
                                key={l}
                                value={l}
                                className="flex-1 text-xs data-[state=on]:bg-card data-[state=on]:shadow-xs"
                            >
                                {localeNames[l as keyof typeof localeNames]}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
            )}
            <Accordion type="multiple" defaultValue={['people', 'messages']}>
                <AccordionItem value="people">
                    <AccordionTrigger className={sectionTrigger}>
                        {isCouple(occasion) ? 'The couple' : `Who it’s for · ${occasion.name.en}`}
                    </AccordionTrigger>
                    <AccordionContent>
                        <PeopleFields
                            occasion={occasion}
                            people={c.people}
                            locale={locale}
                            onChange={(people) => {
                                setContent({ people });
                            }}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="messages">
                    <AccordionTrigger className={sectionTrigger}>Messages</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <TextField
                            label="Headline"
                            value={c.headline[locale]}
                            onChange={(v) => {
                                setContent({ headline: setText(c.headline, locale, v) });
                            }}
                        />
                        <TextField
                            label="Welcome message"
                            long
                            value={c.welcome[locale]}
                            onChange={(v) => {
                                setContent({ welcome: setText(c.welcome, locale, v) });
                            }}
                        />
                        <TextField
                            label="Closing"
                            long
                            value={c.closing[locale]}
                            onChange={(v) => {
                                setContent({ closing: setText(c.closing, locale, v) });
                            }}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="story">
                    <AccordionTrigger className={sectionTrigger}>
                        Story, family & hashtag
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <TextField
                            label="Our story"
                            long
                            value={c.story?.[locale]}
                            onChange={(v) => {
                                setContent({ story: setText(c.story, locale, v) });
                            }}
                        />
                        <TextField
                            label="Family"
                            value={c.family?.[locale]}
                            onChange={(v) => {
                                setContent({ family: setText(c.family, locale, v) });
                            }}
                        />
                        <TextField
                            label="Hashtag"
                            value={c.hashtag}
                            dir="ltr"
                            placeholder="#RiyaWedsKabir"
                            onChange={(v) => {
                                setContent({ hashtag: v || undefined });
                            }}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

// ── Ceremonies ───────────────────────────────────────────────────────────────

const formatWhen = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
        ? iso
        : d.toLocaleString('en', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
          });
};

export function EventsPanel({ draft, set }: PanelProps) {
    const culture = cultureOf(draft.culture);
    // Ceremony names for this occasion in this tradition (besnu, aqiqah, pheras…).
    const vocab = eventVocabFor(occasionOf(draft.occasion), culture);
    const locale = draft.locales[0] ?? 'en';
    const [open, setOpen] = useState<string[]>([]);
    const keyOf = (e: Draft['events'][number], i: number) => e.id ?? `new-${String(i)}`;
    const update = (i: number, patch: Partial<Draft['events'][number]>) => {
        set((d) => ({
            ...d,
            events: d.events.map((e, k) =>
                k === i
                    ? {
                          ...e,
                          ...patch,
                      }
                    : e,
            ),
        }));
    };
    const move = (i: number, dir: -1 | 1) => {
        set((d) => {
            const events = [...d.events];
            const [item] = events.splice(i, 1);
            if (item) events.splice(Math.max(0, Math.min(events.length, i + dir)), 0, item);
            return {
                ...d,
                events,
            };
        });
    };
    const kindOptions = [
        ...vocab.map((v) => ({
            value: v.kind,
            label: v.label.en ?? v.kind,
        })),
        {
            value: 'custom',
            label: 'Custom',
        },
    ];
    return (
        <div className="space-y-3">
            {draft.events.length === 0 && (
                <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    No ceremonies yet. Add the first one below.
                </p>
            )}
            <Accordion type="multiple" value={open} onValueChange={setOpen} className="space-y-2">
                {draft.events.map((e, i) => (
                    <AccordionItem
                        key={keyOf(e, i)}
                        value={keyOf(e, i)}
                        className="overflow-hidden rounded-lg border bg-card last:border-b"
                    >
                        <div className="flex items-center gap-1 pe-2">
                            <AccordionTrigger className="min-w-0 flex-1 items-center px-3.5 py-3 hover:no-underline">
                                <span className="flex min-w-0 items-center gap-3">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gold/12 font-mono text-xs font-semibold text-gold-deep">
                                        {i + 1}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold">
                                            {e.title[locale] ||
                                                eventLabel(draft.culture, e.kind, locale)}
                                        </span>
                                        <span className="flex items-center gap-1.5 truncate text-xs font-normal text-muted-foreground">
                                            <CalendarClock className="size-3" />{' '}
                                            {formatWhen(e.startsAt)}
                                            <span aria-hidden>·</span>
                                            <MapPin className="size-3" /> {e.venue}
                                        </span>
                                    </span>
                                </span>
                            </AccordionTrigger>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        aria-label="Move up"
                                        disabled={i === 0}
                                        onClick={() => {
                                            move(i, -1);
                                        }}
                                    >
                                        <ArrowUp />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Move up</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        aria-label="Move down"
                                        disabled={i === draft.events.length - 1}
                                        onClick={() => {
                                            move(i, 1);
                                        }}
                                    >
                                        <ArrowDown />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Move down</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        aria-label="Remove"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => {
                                            set((d) => ({
                                                ...d,
                                                events: d.events.filter((_, k) => k !== i),
                                            }));
                                        }}
                                    >
                                        <Trash2 />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove ceremony</TooltipContent>
                            </Tooltip>
                        </div>
                        <AccordionContent className="grid gap-4 border-t bg-muted/20 p-3.5 sm:grid-cols-2">
                            <SelectField
                                label="Ceremony"
                                value={e.kind}
                                options={kindOptions}
                                onChange={(v) => {
                                    update(i, { kind: v });
                                }}
                            />
                            <TextField
                                label={`Title (${locale})`}
                                value={e.title[locale]}
                                onChange={(v) => {
                                    update(i, { title: setText(e.title, locale, v) });
                                }}
                            />
                            <TextField
                                label="Starts"
                                type="datetime-local"
                                value={e.startsAt}
                                dir="ltr"
                                onChange={(v) => {
                                    update(i, { startsAt: v });
                                }}
                            />
                            <SelectField
                                label="Time zone"
                                value={e.timezone}
                                options={timezones.map((tz) => ({
                                    value: tz,
                                    label: tz.replace('_', ' '),
                                }))}
                                onChange={(v) => {
                                    update(i, { timezone: v });
                                }}
                            />
                            <TextField
                                label="Venue"
                                value={e.venue}
                                onChange={(v) => {
                                    update(i, { venue: v });
                                }}
                            />
                            <TextField
                                label="Address"
                                value={e.address}
                                onChange={(v) => {
                                    update(i, { address: v });
                                }}
                            />
                            <TextField
                                label="Google Maps link"
                                className="sm:col-span-2"
                                value={e.mapsUrl}
                                dir="ltr"
                                onChange={(v) => {
                                    update(i, { mapsUrl: v });
                                }}
                            />
                            <TextField
                                label="Dress code note"
                                value={e.dressCode?.note?.[locale]}
                                onChange={(v) => {
                                    update(i, {
                                        dressCode: {
                                            swatches: e.dressCode?.swatches ?? [],
                                            note: setText(e.dressCode?.note, locale, v),
                                        },
                                    });
                                }}
                            />
                            <div className="space-y-2">
                                <p className="text-[13px] font-medium text-foreground/80">
                                    Dress colours
                                </p>
                                <div className="flex items-center gap-1.5">
                                    {(e.dressCode?.swatches ?? []).map((sw, k) => (
                                        <ColorSwatch
                                            key={k}
                                            value={sw}
                                            label={`Dress colour ${String(k + 1)}`}
                                            onChange={(v) => {
                                                update(i, {
                                                    dressCode: {
                                                        ...e.dressCode,
                                                        swatches: (e.dressCode?.swatches ?? []).map(
                                                            (x, j) => (j === k ? v : x),
                                                        ),
                                                    },
                                                });
                                            }}
                                        />
                                    ))}
                                    {(e.dressCode?.swatches.length ?? 0) < 4 && (
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            aria-label="Add colour"
                                            className="border-dashed"
                                            onClick={() => {
                                                update(i, {
                                                    dressCode: {
                                                        ...e.dressCode,
                                                        swatches: [
                                                            ...(e.dressCode?.swatches ?? []),
                                                            '#c39a4e',
                                                        ],
                                                    },
                                                });
                                            }}
                                        >
                                            <Plus />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => {
                    const kind =
                        vocab[draft.events.length % Math.max(1, vocab.length)]?.kind ?? 'ceremony';
                    setOpen([...open, `new-${String(draft.events.length)}`]);
                    set((d) => ({
                        ...d,
                        events: [
                            ...d.events,
                            {
                                kind,
                                title: { [locale]: eventLabel(d.culture, kind, locale) },
                                startsAt: '2027-01-01T18:00',
                                endsAt: '',
                                timezone: d.events.at(-1)?.timezone ?? 'Asia/Kolkata',
                                venue: 'Venue name',
                                mapsUrl: '',
                            },
                        ],
                    }));
                }}
            >
                <Plus /> Add ceremony
            </Button>
        </div>
    );
}

// ── Extras ───────────────────────────────────────────────────────────────────

export function ExtrasPanel({ draft, set }: PanelProps) {
    const x = draft.extras;
    const setExtras = (patch: Partial<Draft['extras']>) => {
        set((d) => ({
            ...d,
            extras: {
                ...d.extras,
                ...patch,
            },
        }));
    };
    return (
        <Accordion type="multiple" defaultValue={['guests', 'gifts', 'live']}>
            <AccordionItem value="guests">
                <AccordionTrigger className={sectionTrigger}>Guest interactions</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <SwitchRow
                        id="rsvp-enabled"
                        icon={<Check />}
                        label="RSVP form"
                        description="Guests confirm attendance per ceremony."
                        checked={draft.rsvpEnabled}
                        onChange={(rsvpEnabled) => {
                            set((d) => ({
                                ...d,
                                rsvpEnabled,
                            }));
                        }}
                    />
                    <SwitchRow
                        id="wishes-enabled"
                        icon={<Heart />}
                        label="Wishes wall"
                        description="Blessings appear after you approve them."
                        checked={x.wishes?.enabled !== false}
                        onChange={(enabled) => {
                            setExtras({ wishes: { enabled } });
                        }}
                    />
                    <SwitchRow
                        id="music-offer"
                        icon={<Music />}
                        label="Offer background music"
                        description="Guests are invited to play the chosen track."
                        checked={x.music?.allowAutoOffer ?? false}
                        onChange={(allowAutoOffer) => {
                            setExtras({ music: { allowAutoOffer } });
                        }}
                    />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="gifts">
                <AccordionTrigger className={sectionTrigger}>
                    <span className="flex items-center gap-2">
                        Shagun via UPI
                        {x.shagun && (
                            <Badge variant="success" className="font-normal">
                                On
                            </Badge>
                        )}
                    </span>
                </AccordionTrigger>
                <AccordionContent className="grid gap-4 sm:grid-cols-2">
                    <TextField
                        label="UPI ID"
                        value={x.shagun?.upiId}
                        placeholder="name@bank"
                        dir="ltr"
                        onChange={(v) => {
                            setExtras({
                                shagun: v
                                    ? {
                                          upiId: v,
                                          payeeName: x.shagun?.payeeName ?? '',
                                      }
                                    : undefined,
                            });
                        }}
                    />
                    <TextField
                        label="Payee name"
                        value={x.shagun?.payeeName}
                        disabled={!x.shagun}
                        onChange={(v) => {
                            if (x.shagun)
                                setExtras({
                                    shagun: {
                                        ...x.shagun,
                                        payeeName: v,
                                    },
                                });
                        }}
                    />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="live">
                <AccordionTrigger className={sectionTrigger}>
                    <span className="flex items-center gap-2">
                        <Radio className="size-4 text-muted-foreground" /> Live stream
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <TextField
                        label="YouTube live link (event-day live mode)"
                        value={x.live?.youtubeUrl}
                        dir="ltr"
                        placeholder="https://youtube.com/live/…"
                        onChange={(v) => {
                            setExtras({ live: v ? { youtubeUrl: v } : undefined });
                        }}
                    />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
