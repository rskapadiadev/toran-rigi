// The film editor: the film big in the middle of the screen, its words placed right on the picture,
// and a timeline below like a video editor's: a filmstrip, the playhead, and tracks for the chapters,
// the words and the scenes, all dragged to change when things happen.
import { momentAlpha, type TimedScene, timelineLength, timelineOf } from '@shared/film';
import { type ContentLocale, localeNames } from '@shared/locales';
import type { FilmMoment, SectionType } from '@shared/types';
import { ArrowLeft, Pause, Play, Plus, Trash2 } from 'lucide-react';
import {
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

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
import { momentLook } from '@/invitation/film/FilmStage';
import { filmLoader } from '@/invitation/film/loader';
import { paintFilm } from '@/invitation/film/paint';
import { designStyle } from '@/invitation/tokens';
import { cn } from '@/lib/utils';

import type { Draft } from '../composer/draft';
import { sectionNames } from '../composer/panels';
import { SecondsInput } from '../kit/seconds-input';
import { lookAt } from './FilmScenes';

type Film = NonNullable<Draft['design']['film']>;
type Style = NonNullable<FilmMoment['style']>;

const styleLabels: Record<Style, string> = {
    kicker: 'Small gold capitals',
    line: 'Serif line',
    script: 'Gold script',
};
const styleIds = Object.keys(styleLabels) as Style[];
const round = (v: number, step: number) => Math.round(v / step) * step;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const shortName = (type: SectionType) => sectionNames[type].replace(/\s*\(.*\)$/, '');
const fmt = (s: number) => `${s.toFixed(1)} s`;

// Follow a pointer from where it went down: `move` gets how far it has travelled, in pixels.
function follow(e: ReactPointerEvent, move: (dx: number, dy: number) => void) {
    e.preventDefault();
    e.stopPropagation();
    const x0 = e.clientX;
    const y0 = e.clientY;
    const onMove = (ev: PointerEvent) => {
        move(ev.clientX - x0, ev.clientY - y0);
    };
    const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
}

interface Props {
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
    locale: string;
    selected: number | null;
    onSelect: (word: number | null) => void;
    onClose: () => void;
}

export function FilmEditor({ draft, set, locale, selected, onSelect, onClose }: Props) {
    const film = draft.design.film;
    // Only the film's scenes decide its pictures: editing words must not reload the frames.
    const scenesKey = JSON.stringify(film ? timelineOf(film) : []);
    const scenes = useMemo(() => JSON.parse(scenesKey) as TimedScene[], [scenesKey]);
    const length = Math.max(0.1, timelineLength(scenes));
    const moments = useMemo(() => film?.moments ?? [], [film?.moments]);
    const [t, setT] = useState(() => film?.namesAt ?? 0);
    const [playing, setPlaying] = useState(false);
    const time = clamp(t, 0, length);

    const setFilm = (update: (f: Film) => Film) => {
        set((d) =>
            d.design.film
                ? {
                      ...d,
                      design: {
                          ...d.design,
                          film: update(d.design.film),
                      },
                  }
                : d,
        );
    };
    const patch = (i: number, p: Partial<FilmMoment>) => {
        setFilm((f) => ({
            ...f,
            moments: (f.moments ?? []).map((m, k) =>
                k === i
                    ? {
                          ...m,
                          ...p,
                      }
                    : m,
            ),
        }));
    };
    const addWords = () => {
        const from = round(clamp(time, 0, Math.max(0, length - 1.2)), 0.1);
        const next = moments.length;
        setFilm((f) => ({
            ...f,
            moments: [
                ...(f.moments ?? []),
                {
                    text: { [locale]: 'Your words' },
                    from,
                    to: round(Math.min(length, from + 1.2), 0.1),
                    zone: {
                        x: 0.5,
                        y: 0.2,
                        w: 0.8,
                    },
                    style: 'line',
                },
            ],
        }));
        onSelect(next);
    };
    const remove = (i: number) => {
        setFilm((f) => ({
            ...f,
            moments: (f.moments ?? []).filter((_, k) => k !== i),
        }));
        onSelect(null);
    };

    // The player: the film drawn exactly as guests see it, at the playhead.
    const canvas = useRef<HTMLCanvasElement>(null);
    const drawRef = useRef<() => void>(() => undefined);
    const [loader, setLoader] = useState<ReturnType<typeof filmLoader> | null>(null);
    useEffect(() => {
        const made = filmLoader(scenes, () => {
            drawRef.current();
        });
        setLoader(made);
        return () => {
            made.close();
        };
    }, [scenes]);
    useEffect(() => {
        drawRef.current = () => {
            const el = canvas.current;
            const ctx = el?.getContext('2d');
            if (!el || !ctx || !loader) return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.round(el.clientWidth * dpr);
            const h = Math.round(el.clientHeight * dpr);
            if (el.width !== w || el.height !== h) {
                el.width = w;
                el.height = h;
            }
            const column = {
                x: 0,
                y: 0,
                w,
                h,
            };
            paintFilm(ctx, column, scenes, time, loader.pictures, false);
        };
        drawRef.current();
    }, [loader, scenes, time]);

    // Play in real time from the playhead; stop at the end.
    const now = useRef(time);
    useEffect(() => {
        now.current = time;
    }, [time]);
    useEffect(() => {
        if (!playing) return;
        const from = now.current;
        const began = performance.now();
        let frame = 0;
        const step = (at: number) => {
            const v = from + (at - began) / 1000;
            if (v >= length) {
                setT(length);
                setPlaying(false);
                return;
            }
            setT(v);
            frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => {
            cancelAnimationFrame(frame);
        };
    }, [playing, length]);

    // Dragging words on the picture, measured from the picture they sit on.
    const pictureBox = (e: ReactPointerEvent) =>
        (e.currentTarget as HTMLElement).closest('[data-film-picture]')?.getBoundingClientRect();
    const moveWords = (e: ReactPointerEvent, i: number) => {
        const m = moments[i];
        const box = pictureBox(e);
        if (!m || !box) return;
        onSelect(i);
        setPlaying(false);
        const zone = m.zone;
        follow(e, (dx, dy) => {
            patch(i, {
                zone: {
                    ...zone,
                    x: round(clamp(zone.x + dx / box.width, zone.w / 2, 1 - zone.w / 2), 0.001),
                    y: round(clamp(zone.y + dy / box.height, 0.03, 0.97), 0.001),
                },
            });
        });
    };
    const widen = (e: ReactPointerEvent, i: number, side: -1 | 1) => {
        const m = moments[i];
        const box = pictureBox(e);
        if (!m || !box) return;
        const zone = m.zone;
        follow(e, (dx) => {
            const w = clamp(zone.w + (2 * side * dx) / box.width, 0.2, 1);
            patch(i, {
                zone: {
                    ...zone,
                    w: round(w, 0.01),
                    x: round(clamp(zone.x, w / 2, 1 - w / 2), 0.001),
                },
            });
        });
    };

    // Space plays and pauses; arrows step a frame; Delete removes the chosen words.
    const removeRef = useRef(remove);
    useEffect(() => {
        removeRef.current = remove;
    });
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (
                (e.target as HTMLElement).closest(
                    'input, textarea, [contenteditable], [role="combobox"]',
                )
            )
                return;
            if (e.key === ' ') {
                e.preventDefault();
                setPlaying((p) => !p);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                setPlaying(false);
                setT((v) => clamp(v + (e.key === 'ArrowLeft' ? -1 : 1) / 12, 0, length));
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && selected !== null) {
                e.preventDefault();
                removeRef.current(selected);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
        };
    }, [length, selected]);

    const chosen = selected !== null ? moments[selected] : undefined;
    const wordsLayer = {
        ...designStyle(draft.design),
        containerType: 'size',
    } as CSSProperties;

    return (
        <div className="flex h-full flex-col" data-film-editor>
            <div className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <ArrowLeft /> Back to the invitation
                </Button>
                <span className="mx-2 h-5 w-px bg-border" />
                <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={playing ? 'Pause' : 'Play'}
                    onClick={() => {
                        if (!playing && time >= length) setT(0);
                        setPlaying((p) => !p);
                    }}
                >
                    {playing ? <Pause /> : <Play />}
                </Button>
                <span className="w-28 text-xs text-muted-foreground tabular-nums" data-film-clock>
                    {fmt(time)} / {fmt(length)}
                </span>
                <Button variant="outline" size="sm" onClick={addWords}>
                    <Plus /> Add words here
                </Button>
                <p className="ms-auto hidden text-xs text-muted-foreground xl:block">
                    Drag words on the film · Space plays · ← → step a frame
                </p>
            </div>

            <div className="flex min-h-0 flex-1 gap-4 p-4">
                <div className="flex min-w-0 flex-1 justify-center">
                    <div
                        role="presentation"
                        data-film-picture
                        className="relative aspect-[9/16] h-full max-w-full overflow-hidden rounded-md bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
                        onPointerDown={(e) => {
                            const el = e.target as HTMLElement;
                            if (el === e.currentTarget || el.tagName === 'CANVAS') onSelect(null);
                        }}
                    >
                        <canvas
                            ref={canvas}
                            aria-label="The film at the playhead"
                            className="absolute inset-0 size-full"
                        />
                        <div className="absolute inset-0" style={wordsLayer}>
                            {moments.map((m, i) => {
                                const a = momentAlpha(m, time);
                                const on = i === selected;
                                if (a <= 0 && !on) return null;
                                const text = m.text[locale] ?? Object.values(m.text)[0] ?? '';
                                const place = {
                                    insetInlineStart: `${String((m.zone.x - m.zone.w / 2) * 100)}%`,
                                    top: `${String(m.zone.y * 100)}%`,
                                    width: `${String(m.zone.w * 100)}%`,
                                    transform: 'translateY(-50%)',
                                    opacity: on ? Math.max(0.55, a) : a,
                                };
                                return (
                                    <div
                                        // Moments have no ids: their place in the list is who they are.
                                        key={i}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Move words: ${text}`}
                                        className={cn(
                                            'absolute cursor-move rounded-sm text-center text-balance select-none [text-shadow:0_2px_18px_rgba(0,0,0,0.65)]',
                                            momentLook[m.style ?? 'line'],
                                            on
                                                ? 'outline-2 outline-offset-4 outline-white/85 outline-dashed'
                                                : 'hover:outline-1 hover:outline-offset-4 hover:outline-white/50 hover:outline-dashed',
                                        )}
                                        style={place}
                                        onPointerDown={(e) => {
                                            moveWords(e, i);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onSelect(i);
                                        }}
                                        data-film-word={i}
                                    >
                                        {text || 'Words'}
                                        {on &&
                                            ([-1, 1] as const).map((side) => (
                                                <span
                                                    key={side}
                                                    aria-hidden
                                                    className={cn(
                                                        'absolute top-1/2 size-3.5 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-white bg-primary',
                                                        side < 0 ? '-start-5' : '-end-5',
                                                    )}
                                                    onPointerDown={(e) => {
                                                        widen(e, i, side);
                                                    }}
                                                    data-film-handle={side}
                                                />
                                            ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <aside className="w-64 shrink-0 space-y-4 overflow-y-auto">
                    {chosen && selected !== null ? (
                        <WordsInspector
                            moment={chosen}
                            index={selected}
                            locales={draft.locales}
                            length={length}
                            onChange={(p) => {
                                patch(selected, p);
                            }}
                            onSeek={() => {
                                setPlaying(false);
                                setT((chosen.from + chosen.to) / 2);
                            }}
                            onRemove={() => {
                                remove(selected);
                            }}
                        />
                    ) : (
                        <div className="space-y-3 text-xs text-muted-foreground">
                            <p className="text-[11px] font-medium uppercase">Film editor</p>
                            <p>
                                Click words on the film to choose them, drag them to move, and pull
                                the round handles to widen.
                            </p>
                            <p>
                                Below, drag the playhead to look through the film. Slide a chapter
                                mark to change where its section rests, and slide or stretch the
                                words to change when they show.
                            </p>
                            <Button variant="outline" size="sm" onClick={addWords}>
                                <Plus /> Add words at {fmt(time)}
                            </Button>
                        </div>
                    )}
                </aside>
            </div>

            <Timeline
                draft={draft}
                set={set}
                scenes={scenes}
                length={length}
                time={time}
                moments={moments}
                locale={locale}
                selected={selected}
                onSeek={(v) => {
                    setPlaying(false);
                    setT(v);
                }}
                onSelect={onSelect}
                onMoment={patch}
            />
        </div>
    );
}

interface InspectorProps {
    moment: FilmMoment;
    index: number;
    locales: string[];
    length: number;
    onChange: (p: Partial<FilmMoment>) => void;
    onSeek: () => void;
    onRemove: () => void;
}

function WordsInspector({
    moment: m,
    index,
    locales,
    length,
    onChange,
    onSeek,
    onRemove,
}: InspectorProps) {
    return (
        <div className="space-y-3" data-film-inspector>
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">
                    Words {String(index + 1)}
                </p>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove these words"
                    onClick={onRemove}
                >
                    <Trash2 />
                </Button>
            </div>
            {locales.map((locale) => (
                <div key={locale} className="space-y-1">
                    <Label
                        htmlFor={`film-edit-${String(index)}-${locale}`}
                        className="text-[11px] text-muted-foreground uppercase"
                    >
                        {localeNames[locale as ContentLocale]}
                    </Label>
                    <Input
                        id={`film-edit-${String(index)}-${locale}`}
                        className="h-8"
                        maxLength={120}
                        dir="auto"
                        value={m.text[locale] ?? ''}
                        onChange={(e) => {
                            onChange({
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
                <Label className="text-[11px] text-muted-foreground uppercase">Look</Label>
                <Select
                    value={m.style ?? 'line'}
                    onValueChange={(v) => {
                        onChange({ style: v as Style });
                    }}
                >
                    <SelectTrigger aria-label="Look of the words" className="w-full">
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
            <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground uppercase">
                    Shown from … to
                </Label>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <SecondsInput
                        value={m.from}
                        min={0}
                        max={Math.max(0, m.to - 0.3)}
                        label="Words from"
                        onChange={(from) => {
                            onChange({ from });
                        }}
                    />
                    to
                    <SecondsInput
                        value={m.to}
                        min={Math.min(length, m.from + 0.3)}
                        max={length}
                        label="Words to"
                        onChange={(to) => {
                            onChange({ to });
                        }}
                    />
                </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={onSeek}>
                Go to these words
            </Button>
        </div>
    );
}

interface TimelineProps {
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
    scenes: TimedScene[];
    length: number;
    time: number;
    moments: FilmMoment[];
    locale: string;
    selected: number | null;
    onSeek: (t: number) => void;
    onSelect: (word: number | null) => void;
    onMoment: (i: number, p: Partial<FilmMoment>) => void;
}

const TRACK = 'relative h-8 rounded-md bg-muted/40';

function Timeline({
    draft,
    set,
    scenes,
    length,
    time,
    moments,
    locale,
    selected,
    onSeek,
    onSelect,
    onMoment,
}: TimelineProps) {
    const lane = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(600);
    useEffect(() => {
        const el = lane.current;
        if (!el) return;
        const observer = new ResizeObserver(() => {
            setWidth(el.clientWidth);
        });
        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, []);
    const perSecond = width / length;
    const at = (seconds: number) => `${String((seconds / length) * 100)}%`;
    const secondsAt = (clientX: number) => {
        const box = lane.current?.getBoundingClientRect();
        return box ? clamp(((clientX - box.left) / box.width) * length, 0, length) : 0;
    };
    const scrub = (e: ReactPointerEvent) => {
        onSeek(secondsAt(e.clientX));
        const x0 = e.clientX;
        const t0 = secondsAt(x0);
        follow(e, (dx) => {
            onSeek(clamp(t0 + dx / perSecond, 0, length));
        });
    };

    // The chapters: sections that rest on a moment of the film.
    const chapters = draft.sections.flatMap((s, index) =>
        s.enabled && s.filmAt !== undefined
            ? [
                  {
                      index,
                      type: s.type,
                      at: s.filmAt,
                  },
              ]
            : [],
    );
    const moveChapter = (e: ReactPointerEvent, index: number, start: number) => {
        onSeek(start);
        follow(e, (dx) => {
            const v = round(clamp(start + dx / perSecond, 0, length), 0.1);
            onSeek(v);
            set((d) => ({
                ...d,
                sections: d.sections.map((s, k) =>
                    k === index
                        ? {
                              ...s,
                              filmAt: v,
                          }
                        : s,
                ),
            }));
        });
    };
    const moveWords = (e: ReactPointerEvent, i: number, edge: 'from' | 'to' | 'both') => {
        const m = moments[i];
        if (!m) return;
        onSelect(i);
        const { from, to } = m;
        follow(e, (dx) => {
            const d = dx / perSecond;
            if (edge === 'both') {
                const shift = clamp(d, -from, length - to);
                onMoment(i, {
                    from: round(from + shift, 0.1),
                    to: round(to + shift, 0.1),
                });
                onSeek((from + to) / 2 + shift);
            } else if (edge === 'from') {
                const v = round(clamp(from + d, 0, to - 0.3), 0.1);
                onMoment(i, { from: v });
                onSeek(v + 0.15);
            } else {
                const v = round(clamp(to + d, from + 0.3, length), 0.1);
                onMoment(i, { to: v });
                onSeek(v - 0.15);
            }
        });
    };

    const thumbs = Math.max(4, Math.floor(width / 40));
    const ticks = Array.from({ length: Math.floor(length) + 1 }, (_, s) => s);
    const playhead = { insetInlineStart: at(time) };

    return (
        <div className="shrink-0 border-t bg-background/60 px-3 pt-2 pb-3" data-film-timeline>
            <div className="flex gap-2">
                <div className="w-20 shrink-0 space-y-1.5 pt-6 text-[11px] text-muted-foreground uppercase">
                    <p className="flex h-14 items-center">Film</p>
                    <p className="flex h-8 items-center">Chapters</p>
                    <p className="flex h-8 items-center">Words</p>
                    <p className="flex h-8 items-center">Scenes</p>
                </div>
                <div ref={lane} className="relative min-w-0 flex-1 space-y-1.5 select-none">
                    {/* Ruler: click or drag to move the playhead. */}
                    <div
                        className="relative h-5 cursor-pointer border-b"
                        onPointerDown={scrub}
                        role="presentation"
                    >
                        {ticks.map((s) => (
                            <span
                                key={s}
                                className="absolute bottom-0 h-1.5 w-px bg-muted-foreground/50"
                                style={{ insetInlineStart: at(s) }}
                            >
                                {s % 2 === 0 && (
                                    <span className="absolute -top-3.5 -translate-x-1/2 text-[10px] whitespace-nowrap text-muted-foreground tabular-nums rtl:translate-x-1/2">
                                        {s}
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                    {/* Filmstrip */}
                    <div
                        className="flex h-14 cursor-pointer overflow-hidden rounded-md"
                        onPointerDown={scrub}
                        role="presentation"
                    >
                        {Array.from({ length: thumbs }, (_, k) => (
                            <div
                                key={k}
                                className="h-full flex-1 border-e border-black/40 bg-black"
                                style={lookAt(scenes, ((k + 0.5) / thumbs) * length)}
                            />
                        ))}
                    </div>
                    {/* Chapters */}
                    <div className={TRACK}>
                        {chapters.map((c) => (
                            <button
                                key={c.index}
                                type="button"
                                aria-label={`${shortName(c.type)} rests at ${fmt(c.at)}`}
                                className={cn(
                                    'absolute top-1/2 flex -translate-y-1/2 cursor-ew-resize items-center gap-1 rounded-full bg-primary/90 py-0.5 ps-1.5 pe-2 text-[10px] whitespace-nowrap text-primary-foreground shadow',
                                    // Near the ends the label sits inside the track instead of off it.
                                    c.at > length - 1.2
                                        ? '-translate-x-full rtl:translate-x-full'
                                        : c.at < 1.2
                                          ? ''
                                          : '-translate-x-1/2 rtl:translate-x-1/2',
                                )}
                                style={{ insetInlineStart: at(c.at) }}
                                onPointerDown={(e) => {
                                    moveChapter(e, c.index, c.at);
                                }}
                                data-film-chapter={c.type}
                            >
                                <span className="size-1.5 rotate-45 bg-current" />
                                {shortName(c.type)}
                            </button>
                        ))}
                    </div>
                    {/* Words */}
                    <div className={TRACK}>
                        {moments.map((m, i) => {
                            const bar = {
                                insetInlineStart: at(m.from),
                                width: at(m.to - m.from),
                            };
                            const text = m.text[locale] ?? Object.values(m.text)[0] ?? '';
                            return (
                                <div
                                    // Moments have no ids: their place in the list is who they are.
                                    key={i}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Words ${String(i + 1)}, ${fmt(m.from)} to ${fmt(m.to)}`}
                                    className={cn(
                                        'absolute inset-y-1 cursor-grab overflow-hidden rounded-sm px-2 text-[10px] leading-6 whitespace-nowrap',
                                        i === selected
                                            ? 'bg-amber-300 text-black ring-2 ring-white'
                                            : 'bg-amber-300/60 text-black/80 hover:bg-amber-300/80',
                                    )}
                                    style={bar}
                                    onPointerDown={(e) => {
                                        moveWords(e, i, 'both');
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') onSelect(i);
                                    }}
                                    data-film-bar={i}
                                >
                                    {text}
                                    {(['from', 'to'] as const).map((edge) => (
                                        <span
                                            key={edge}
                                            aria-hidden
                                            className={cn(
                                                'absolute inset-y-0 w-2 cursor-ew-resize bg-black/25',
                                                edge === 'from' ? 'start-0' : 'end-0',
                                            )}
                                            onPointerDown={(e) => {
                                                moveWords(e, i, edge);
                                            }}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    {/* Scenes */}
                    <div className={TRACK}>
                        {scenes.map((s, i) => {
                            const clip = {
                                insetInlineStart: at(s.start),
                                width: at(s.duration),
                            };
                            return (
                                <div
                                    // Scenes are in timeline order.
                                    key={i}
                                    className="absolute inset-y-1 overflow-hidden rounded-sm bg-sky-400/40 px-2 text-[10px] leading-6 whitespace-nowrap text-foreground"
                                    style={clip}
                                >
                                    {s.kind === 'film' ? 'Film' : 'Still'} {String(i + 1)}
                                    {s.exit && s.exit !== 'cut' ? ` · ${s.exit} out` : ''}
                                </div>
                            );
                        })}
                    </div>
                    {/* Playhead, across every track; its knob on the ruler drags it. */}
                    <div
                        className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-red-400"
                        style={playhead}
                        data-film-playhead
                    >
                        <span
                            className="pointer-events-auto absolute start-1/2 -top-1 size-3 -translate-x-1/2 cursor-ew-resize rounded-sm bg-red-400 rtl:translate-x-1/2"
                            onPointerDown={scrub}
                            role="presentation"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
