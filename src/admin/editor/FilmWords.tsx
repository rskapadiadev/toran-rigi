// Words on the film: short lines placed in a spot of the picture, shown while the film passes a stretch
// of seconds (between chapters, when the screen holds only the film).
import { timelineLength, timelineOf } from '@shared/film';
import { type ContentLocale, localeNames } from '@shared/locales';
import type { FilmMoment } from '@shared/types';
import { Clapperboard, Plus, Trash2, Type } from 'lucide-react';
import type { MouseEvent } from 'react';

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

import type { Draft } from '../composer/draft';
import { SecondsInput } from '../kit/seconds-input';
import { useOpenFilmEditor } from './film-editor-context';
import { lookAt } from './FilmScenes';

type Film = NonNullable<Draft['design']['film']>;
type Style = NonNullable<FilmMoment['style']>;

const styleLabels: Record<Style, string> = {
    kicker: 'Small gold capitals',
    line: 'Serif line',
    script: 'Gold script',
};
const styleIds = Object.keys(styleLabels) as Style[];

interface Props {
    film: Film;
    locales: string[];
    onChange: (film: Film) => void;
}

export function FilmWords({ film, locales, onChange }: Props) {
    const openEditor = useOpenFilmEditor();
    const scenes = timelineOf(film);
    const length = timelineLength(scenes);
    const moments = film.moments ?? [];
    const set = (next: FilmMoment[]) => {
        onChange({
            ...film,
            moments: next,
        });
    };
    const patch = (i: number, p: Partial<FilmMoment>) => {
        set(
            moments.map((m, k) =>
                k === i
                    ? {
                          ...m,
                          ...p,
                      }
                    : m,
            ),
        );
    };
    const add = () => {
        const from = Math.min(Math.max(0, length - 1.5), film.namesAt ?? 0);
        set([
            ...moments,
            {
                text: {},
                from,
                to: Math.min(length, from + 1.5),
                zone: {
                    x: 0.5,
                    y: 0.15,
                    w: 0.8,
                },
                style: 'line',
            },
        ]);
    };

    return (
        <div className="space-y-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Words on the film
            </p>
            <p className="text-xs text-muted-foreground">
                Short lines that appear while the film passes the seconds you choose, best placed in
                the stretches between sections, when the screen shows only the film.
            </p>
            <ol className="space-y-2">
                {moments.map((m, i) => {
                    const pick = (e: MouseEvent<HTMLButtonElement>) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        patch(i, {
                            zone: {
                                ...m.zone,
                                x: Math.round(((e.clientX - r.left) / r.width) * 1000) / 1000,
                                y: Math.round(((e.clientY - r.top) / r.height) * 1000) / 1000,
                            },
                        });
                    };
                    const look = {
                        ...lookAt(scenes, (m.from + m.to) / 2),
                        aspectRatio: '9 / 16',
                    };
                    const box = {
                        insetInlineStart: `${String((m.zone.x - m.zone.w / 2) * 100)}%`,
                        top: `${String(m.zone.y * 100)}%`,
                        width: `${String(m.zone.w * 100)}%`,
                    };
                    const first = locales[0] ?? 'en';
                    return (
                        <li
                            // Moments have no ids: their place in the list is who they are.
                            key={i}
                            className="space-y-3 rounded-md border p-2.5"
                            data-film-words={i}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="flex items-center gap-1.5 text-[13px] font-medium">
                                    <Type className="size-3.5" />
                                    {m.text[first]?.trim() || `Words ${String(i + 1)}`}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Remove words ${String(i + 1)}`}
                                    onClick={() => {
                                        set(moments.filter((_, k) => k !== i));
                                    }}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                            {locales.map((locale) => (
                                <div key={locale} className="space-y-1">
                                    <Label
                                        htmlFor={`film-words-${String(i)}-${locale}`}
                                        className="text-[11px] text-muted-foreground uppercase"
                                    >
                                        {localeNames[locale as ContentLocale]}
                                    </Label>
                                    <Input
                                        id={`film-words-${String(i)}-${locale}`}
                                        className="h-8"
                                        maxLength={120}
                                        dir="auto"
                                        value={m.text[locale] ?? ''}
                                        onChange={(e) => {
                                            patch(i, {
                                                text: {
                                                    ...m.text,
                                                    [locale]: e.target.value,
                                                },
                                            });
                                        }}
                                    />
                                </div>
                            ))}
                            <div className="space-y-1">
                                <Label className="text-[11px] text-muted-foreground uppercase">
                                    Look
                                </Label>
                                <Select
                                    value={m.style ?? 'line'}
                                    onValueChange={(v) => {
                                        patch(i, { style: v as Style });
                                    }}
                                >
                                    <SelectTrigger
                                        aria-label={`Words ${String(i + 1)} look`}
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {styleIds.map((id) => (
                                            <SelectItem key={id} value={id}>
                                                {styleLabels[id]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] text-muted-foreground uppercase">
                                    Shown from … to
                                </Label>
                                <Slider
                                    aria-label={`Words ${String(i + 1)} seconds`}
                                    min={0}
                                    max={Math.max(0.1, length)}
                                    step={0.1}
                                    minStepsBetweenThumbs={3}
                                    value={[m.from, m.to]}
                                    onValueChange={([from, to]) => {
                                        if (from !== undefined && to !== undefined)
                                            patch(i, {
                                                from: Math.round(from * 10) / 10,
                                                to: Math.round(to * 10) / 10,
                                            });
                                    }}
                                />
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <SecondsInput
                                        value={m.from}
                                        min={0}
                                        max={Math.max(0, m.to - 0.3)}
                                        label={`Words ${String(i + 1)} from`}
                                        onChange={(from) => {
                                            patch(i, { from });
                                        }}
                                    />
                                    to
                                    <SecondsInput
                                        value={m.to}
                                        min={Math.min(length, m.from + 0.3)}
                                        max={length}
                                        label={`Words ${String(i + 1)} to`}
                                        onChange={(to) => {
                                            patch(i, { to });
                                        }}
                                    />
                                </div>
                            </div>
                            {openEditor ? (
                                // Placed on the big film in the middle of the screen, not on a thumbnail.
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                        openEditor(i);
                                    }}
                                >
                                    <Clapperboard /> Edit on the film
                                </Button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        aria-label={`Choose where words ${String(i + 1)} sit on the picture`}
                                        className="relative w-24 shrink-0 overflow-hidden rounded-md bg-black"
                                        style={look}
                                        onClick={pick}
                                    >
                                        <span
                                            aria-hidden
                                            className="absolute -translate-y-1/2 truncate rounded-sm border border-white/80 bg-black/40 px-0.5 text-[7px] leading-tight text-white"
                                            style={box}
                                        >
                                            {m.text[first] ?? ''}
                                        </span>
                                    </button>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            Tap the picture where the words should sit.
                                        </p>
                                        <Label className="text-[11px] text-muted-foreground uppercase">
                                            Width
                                        </Label>
                                        <Slider
                                            aria-label={`Words ${String(i + 1)} width`}
                                            min={0.3}
                                            max={1}
                                            step={0.05}
                                            value={[m.zone.w]}
                                            onValueChange={([w]) => {
                                                if (w !== undefined)
                                                    patch(i, {
                                                        zone: {
                                                            ...m.zone,
                                                            w,
                                                        },
                                                    });
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={add}>
                    <Plus className="size-3.5" />
                    Add words
                </Button>
                {openEditor && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            openEditor();
                        }}
                    >
                        <Clapperboard className="size-3.5" />
                        Open the film editor
                    </Button>
                )}
            </div>
        </div>
    );
}
