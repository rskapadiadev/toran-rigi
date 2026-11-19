// The film editor: one screen for a film invitation. The real invitation plays in the middle, its
// film behind it, sections and words clicked and edited right there; beside it, the chosen thing's
// settings; below, a timeline like a video editor's: a filmstrip, the playhead, and tracks for the
// sections, the words and the scenes, all dragged to change when things happen.
import { renderedSections } from '@shared/blocks';
import { pickText } from '@shared/cultures';
import {
    MOMENT_FADE,
    momentAlpha,
    type TimedScene,
    timelineLength,
    timelineOf,
} from '@shared/film';
import { type ContentLocale, localeNames } from '@shared/locales';
import { type MotifId, motifs } from '@shared/motifs';
import { allowedSection, occasionOf } from '@shared/occasions';
import { peopleOf } from '@shared/people';
import { photoUrl } from '@shared/photos';
import { motifIds } from '@shared/schemas/invitation';
import type { FilmLayer, FilmMoment, LayerKey, SectionType } from '@shared/types';
import {
    ArrowLeft,
    Diamond,
    Eye,
    Layers,
    Loader2,
    Pause,
    Play,
    Plus,
    Trash2,
    Upload,
} from 'lucide-react';
import { type MotionValue, motionValue } from 'motion/react';
import {
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { EditContext, type EditSettings } from '@/invitation/editing';
import { LayerArt } from '@/invitation/film/FilmLayers';
import { momentLook } from '@/invitation/film/FilmStage';
import { poseAt, withKey } from '@/invitation/film/layers';
import { InvitationView } from '@/invitation/InvitationView';
import { designStyle } from '@/invitation/tokens';
import type { PublicInvitationData } from '@/invitation/types';
import { cn } from '@/lib/utils';

import type { Draft } from '../composer/draft';
import { sectionNames } from '../composer/panels';
import { SecondsInput } from '../kit/seconds-input';
import { addAt, retime, sectionTimes } from './film-sections';
import { lookAt } from './FilmScenes';
import { upload } from './PhotosPanel';

type Film = NonNullable<Draft['design']['film']>;
type Style = NonNullable<FilmMoment['style']>;

const styleLabels: Record<Style, string> = {
    kicker: 'Small gold capitals',
    line: 'Serif line',
    script: 'Gold script',
};
const styleIds = Object.keys(styleLabels) as Style[];

type LayerKind = FilmLayer['kind'];
type Effect = NonNullable<FilmLayer['effect']>;
type Enter = NonNullable<FilmLayer['enter']>;
type Shape = NonNullable<FilmLayer['shape']>;
const kindLabels: Record<LayerKind, string> = {
    photo: 'Photo',
    monogram: 'Monogram',
    ornament: 'Ornament',
    effect: 'Effect',
};
const effectLabels: Record<Effect, string> = {
    petals: 'Rose petals falling',
    marigold: 'Marigold petals falling',
    sparkles: 'Sparkles',
    fireworks: 'Fireworks',
    lanterns: 'Sky lanterns rising',
};
const enterLabels: Record<Enter, string> = {
    fade: 'Fade in',
    rise: 'Rise in',
    zoom: 'Zoom in',
    blur: 'Blur in',
};
const shapeLabels: Record<Shape, string> = {
    arch: 'Arch',
    circle: 'Circle',
    frame: 'Framed',
};
const kindColour: Record<LayerKind, string> = {
    photo: 'bg-sky-300',
    monogram: 'bg-yellow-200',
    ornament: 'bg-rose-300',
    effect: 'bg-violet-300',
};
const isMotif = (id: string | undefined): id is MotifId => id !== undefined && id in motifs;
// Rounded to the step, without float dust (15.2, not 15.200000000000001).
const round = (v: number, step: number) => Number((Math.round(v / step) * step).toFixed(3));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const shortName = (type: SectionType) => sectionNames[type].replace(/\s*\(.*\)$/, '');
const fmt = (s: number) => `${s.toFixed(1)} s`;

// Follow a pointer from where it went down: `move` gets how far it has travelled, in pixels.
// At most once a frame, so a fast mouse never queues more redraws than the screen can show;
// `end` runs when it lets go.
function follow(e: ReactPointerEvent, move: (dx: number, dy: number) => void, end?: () => void) {
    e.preventDefault();
    e.stopPropagation();
    const x0 = e.clientX;
    const y0 = e.clientY;
    let dx = 0;
    let dy = 0;
    let frame = 0;
    const flush = () => {
        frame = 0;
        move(dx, dy);
    };
    const onMove = (ev: PointerEvent) => {
        dx = ev.clientX - x0;
        dy = ev.clientY - y0;
        if (!frame) frame = requestAnimationFrame(flush);
    };
    const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (frame) {
            cancelAnimationFrame(frame);
            flush();
        }
        end?.();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
}

type SetDraft = (update: (d: Draft) => Draft, gesture?: string) => void;

interface Span {
    from: number;
    to: number;
}

// A keyframe mid-drag on its layer's bar.
interface KeyGhost {
    i: number;
    n: number;
    at: number;
}

// A words or layer bar mid-drag on the timeline.
interface Bar extends Span {
    kind: 'words' | 'layer';
    i: number;
}

// Where a dragged section would land, shown until it's let go.
interface Ghost {
    type: SectionType;
    at: number;
}

// A chosen layer, and the section chosen when it was: choosing another section lets it go.
interface Picked {
    i: number;
    section: SectionType | null;
}

interface Travel {
    from: number;
    to: number;
    top: number;
    height: number;
}

// The invitation's travel stretches, where scrolling moves the film from one second to the next.
function travelsIn(root: HTMLElement): Travel[] {
    const base = root.getBoundingClientRect().top - root.scrollTop;
    return [...root.querySelectorAll<HTMLElement>('[data-film-travel]')]
        .map((el) => ({
            from: Number(el.dataset.filmFrom),
            to: Number(el.dataset.filmTo),
            top: el.getBoundingClientRect().top - base,
            height: el.offsetHeight,
        }))
        .sort((a, b) => a.top - b.top);
}

// Where the page must scroll for the film to show second t (on the stretch that passes it).
function scrollFor(root: HTMLElement, t: number) {
    const vh = root.clientHeight;
    const list = travelsIn(root);
    for (const s of list) {
        if (s.to === s.from) continue;
        const p = (t - s.from) / (s.to - s.from);
        if (p >= -1e-3 && p <= 1 + 1e-3) return s.top + clamp(p, 0, 1) * Math.max(0, s.height - vh);
    }
    const last = list.at(-1);
    if (!last || t <= (list[0]?.from ?? 0)) return 0;
    return last.top + Math.max(0, last.height - vh);
}

interface Props {
    draft: Draft;
    set: SetDraft;
    preview: PublicInvitationData;
    invitationId: string;
    editing: EditSettings;
    locale: string;
    selected: number | null;
    onSelect: (word: number | null) => void;
    section: SectionType | null;
    onSection: (type: SectionType) => void;
    // The chosen section's settings (layout, entrance, backdrop, edge…), as the page view shows them.
    settings: ReactNode;
    onClose: () => void;
}

export function FilmEditor({
    draft,
    set,
    preview,
    invitationId,
    editing,
    locale,
    selected,
    onSelect,
    section,
    onSection,
    settings,
    onClose,
}: Props) {
    const film = draft.design.film;
    // Only the film's scenes decide its filmstrip: editing words must not rebuild it.
    const scenesKey = JSON.stringify(film ? timelineOf(film) : []);
    const scenes = useMemo(() => JSON.parse(scenesKey) as TimedScene[], [scenesKey]);
    const length = Math.max(0.1, timelineLength(scenes));
    const first = film?.namesAt ?? 0;
    const moments = useMemo(() => film?.moments ?? [], [film?.moments]);
    const layers = useMemo(() => film?.layers ?? [], [film?.layers]);
    // The chosen layer, until something else is chosen (words, or a section on the film).
    const [picked, setPicked] = useState<Picked | null>(null);
    const layer = picked && picked.section === section && selected === null ? picked.i : null;
    const people = peopleOf(draft.content);
    const one = pickText(people.one.name, locale);
    const two = pickText(people.two?.name, locale);
    const photos = [
        ...new Set(
            [
                draft.content.coverPhotoKey,
                ...draft.content.gallery,
                ...Object.values(draft.content.photoSlots ?? {}),
            ].filter((k): k is string => Boolean(k)),
        ),
    ];
    // The film's second at the playhead: a value, not state, so its ticking re-renders only the
    // playhead, the clock and the handles that follow it.
    const clock = useMemo(() => motionValue(first), [first]);
    const [playing, setPlaying] = useState(false);
    // The add menus close once something is chosen.
    const [menu, setMenu] = useState<'section' | 'layer' | null>(null);
    const now = () => clamp(clock.get(), 0, length);
    // Words or a layer mid-drag (see Handles); saved once, when it's let go.
    const [live, setLive] = useState<Live | null>(null);
    const frame = useRef<HTMLDivElement>(null);

    const setFilm = (update: (f: Film) => Film, g?: string) => {
        set(
            (d) =>
                d.design.film
                    ? {
                          ...d,
                          design: {
                              ...d.design,
                              film: update(d.design.film),
                          },
                      }
                    : d,
            g,
        );
    };
    const patch = (i: number, p: Partial<FilmMoment>, g?: string) => {
        setFilm(
            (f) => ({
                ...f,
                moments: (f.moments ?? []).map((m, k) =>
                    k === i
                        ? {
                              ...m,
                              ...p,
                          }
                        : m,
                ),
            }),
            g,
        );
    };
    const addWords = () => {
        // Faded in by the playhead, so what's added shows straight away.
        const from = round(clamp(now() - MOMENT_FADE, 0, Math.max(0, length - 1.2)), 0.1);
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

    const patchLayer = (i: number, p: Partial<FilmLayer>, g?: string) => {
        setFilm(
            (f) => ({
                ...f,
                layers: (f.layers ?? []).map((l, k) =>
                    k === i
                        ? {
                              ...l,
                              ...p,
                          }
                        : l,
                ),
            }),
            g,
        );
    };
    const pickLayer = (i: number) => {
        onSelect(null);
        setPicked({
            i,
            section,
        });
    };
    const addLayer = (kind: LayerKind) => {
        const from = round(clamp(now() - MOMENT_FADE, 0, Math.max(0, length - 2)), 0.1);
        const starts: Record<LayerKind, Omit<FilmLayer, 'kind' | 'from' | 'to'>> = {
            photo: {
                zone: {
                    x: 0.5,
                    y: 0.42,
                    w: 0.5,
                },
                enter: 'rise',
                shape: 'arch',
                photo: photos[0],
            },
            monogram: {
                zone: {
                    x: 0.5,
                    y: 0.3,
                    w: 0.34,
                },
                enter: 'zoom',
            },
            ornament: {
                zone: {
                    x: 0.5,
                    y: 0.22,
                    w: 0.3,
                },
                enter: 'fade',
                motif: 'lotus',
            },
            effect: {
                zone: {
                    x: 0.5,
                    y: 0.5,
                    w: 1,
                },
                enter: 'fade',
                effect: 'petals',
            },
        };
        const next = layers.length;
        setFilm((f) => ({
            ...f,
            layers: [
                ...(f.layers ?? []),
                {
                    kind,
                    from,
                    to: round(Math.min(length, from + 2), 0.1),
                    ...starts[kind],
                },
            ],
        }));
        pickLayer(next);
    };
    const removeLayer = (i: number) => {
        setFilm((f) => ({
            ...f,
            layers: (f.layers ?? []).filter((_, k) => k !== i),
        }));
        setPicked(null);
    };

    // The playhead follows the film the invitation is showing, wherever its page is scrolled.
    useEffect(() => {
        const root = frame.current;
        if (!root) return;
        const observer = new MutationObserver(() => {
            const v = Number(
                root.querySelector('[data-film-stage]')?.getAttribute('data-film-time'),
            );
            if (Number.isFinite(v)) clock.set(v);
        });
        observer.observe(root, {
            attributes: true,
            subtree: true,
            attributeFilter: ['data-film-time'],
        });
        return () => {
            observer.disconnect();
        };
    }, [clock]);
    // Moving the playhead scrolls the page to where the film shows that second.
    const seek = (v: number) => {
        setPlaying(false);
        const root = frame.current;
        if (root) root.scrollTop = scrollFor(root, clamp(v, first, length));
    };
    // Choosing a section brings it to the top of the player.
    const showSection = (type: SectionType) => {
        onSection(type);
        setPlaying(false);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const root = frame.current;
                const el = root?.querySelector<HTMLElement>(`[data-block^="${type}:"]`);
                if (!root || !el) return;
                root.scrollTo({
                    top:
                        el.getBoundingClientRect().top -
                        root.getBoundingClientRect().top +
                        root.scrollTop,
                    behavior: 'smooth',
                });
            });
        });
    };

    // Play as a guest would: the film moves at its own speed through each stretch, and the page
    // scrolls on steadily over the sections resting between them.
    useEffect(() => {
        const root = frame.current;
        if (!playing || !root) return;
        let y = root.scrollTop;
        let last = performance.now();
        let tick = 0;
        const step = (now: number) => {
            const dt = Math.min(0.1, (now - last) / 1000);
            last = now;
            const vh = root.clientHeight;
            const on = travelsIn(root).find((s) => y >= s.top - 1 && y <= s.top + s.height - vh);
            const speed = on
                ? Math.max(0, on.height - vh) / Math.max(0.1, Math.abs(on.to - on.from))
                : vh * 1.2;
            y += speed * dt;
            root.scrollTop = y;
            if (y + vh >= root.scrollHeight - 2) {
                setPlaying(false);
                return;
            }
            tick = requestAnimationFrame(step);
        };
        tick = requestAnimationFrame(step);
        return () => {
            cancelAnimationFrame(tick);
        };
    }, [playing]);

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
        let next = zone;
        follow(
            e,
            (dx, dy) => {
                next = {
                    ...zone,
                    x: round(clamp(zone.x + dx / box.width, zone.w / 2, 1 - zone.w / 2), 0.001),
                    y: round(clamp(zone.y + dy / box.height, 0.03, 0.97), 0.001),
                };
                setLive({
                    kind: 'words',
                    i,
                    zone: next,
                });
            },
            () => {
                setLive(null);
                if (next !== zone) patch(i, { zone: next });
            },
        );
    };
    const widen = (e: ReactPointerEvent, i: number, side: -1 | 1) => {
        const m = moments[i];
        const box = pictureBox(e);
        if (!m || !box) return;
        const zone = m.zone;
        let next = zone;
        follow(
            e,
            (dx) => {
                const w = clamp(zone.w + (2 * side * dx) / box.width, 0.2, 1);
                next = {
                    ...zone,
                    w: round(w, 0.01),
                    x: round(clamp(zone.x, w / 2, 1 - w / 2), 0.001),
                };
                setLive({
                    kind: 'words',
                    i,
                    zone: next,
                });
            },
            () => {
                setLive(null);
                if (next !== zone) patch(i, { zone: next });
            },
        );
    };

    const moveLayer = (e: ReactPointerEvent, i: number) => {
        const l = layers[i];
        const box = pictureBox(e);
        if (!l || !box) return;
        pickLayer(i);
        setPlaying(false);
        const at = round(now(), 0.01);
        const pose = poseAt(l, at);
        const zone = {
            x: pose.x,
            y: pose.y,
            w: pose.w,
        };
        let next = zone;
        follow(
            e,
            (dx, dy) => {
                next = {
                    ...zone,
                    x: round(clamp(zone.x + dx / box.width, 0, 1), 0.001),
                    y: round(clamp(zone.y + dy / box.height, 0.02, 0.98), 0.001),
                };
                setLive({
                    kind: 'layer',
                    i,
                    zone: next,
                });
            },
            () => {
                setLive(null);
                if (next !== zone) placeLayer(i, at, next);
            },
        );
    };
    const resizeLayer = (e: ReactPointerEvent, i: number, side: -1 | 1) => {
        const l = layers[i];
        const box = pictureBox(e);
        if (!l || !box) return;
        const at = round(now(), 0.01);
        const pose = poseAt(l, at);
        const zone = {
            x: pose.x,
            y: pose.y,
            w: pose.w,
        };
        let next = zone;
        follow(
            e,
            (dx) => {
                next = {
                    ...zone,
                    w: round(clamp(zone.w + (2 * side * dx) / box.width, 0.08, 1), 0.01),
                };
                setLive({
                    kind: 'layer',
                    i,
                    zone: next,
                });
            },
            () => {
                setLive(null);
                if (next !== zone) placeLayer(i, at, next);
            },
        );
    };
    // A layer with keyframes is placed in a keyframe at the playhead (made there if it's new);
    // one without is simply moved.
    const placeLayer = (i: number, at: number, zone: FilmLayer['zone']) => {
        const l = layers[i];
        if (!l) return;
        if (l.keys?.length) patchLayer(i, { keys: withKey(l, at, zone) });
        else patchLayer(i, { zone });
    };

    // Space plays and pauses; arrows step a frame; Delete removes the chosen words or layer.
    const removeRef = useRef(remove);
    const removeLayerRef = useRef(removeLayer);
    const seekRef = useRef(seek);
    useEffect(() => {
        removeRef.current = remove;
        removeLayerRef.current = removeLayer;
        seekRef.current = seek;
    });
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const el = e.target as HTMLElement;
            if (el.closest('input, textarea, [contenteditable], [role="combobox"]')) return;
            if (e.key === ' ') {
                e.preventDefault();
                setPlaying((p) => !p);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                seekRef.current(clock.get() + (e.key === 'ArrowLeft' ? -1 : 1) / 12);
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && selected !== null) {
                e.preventDefault();
                removeRef.current(selected);
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && layer !== null) {
                e.preventDefault();
                removeLayerRef.current(layer);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
        };
    }, [selected, layer, clock]);

    // Sections to add: ones this occasion allows that aren't on the page, and hidden ones.
    const occasion = occasionOf(draft.occasion);
    const present = new Set(draft.sections.map((s) => s.type));
    const addable = renderedSections.filter((x) => !present.has(x) && allowedSection(occasion, x));
    const hidden = draft.sections.filter((s) => !s.enabled).map((s) => s.type);
    const addSection = (type: SectionType) => {
        const at = round(clamp(now(), first, length), 0.1);
        set((d) => {
            const existing = d.sections.findIndex((s) => s.type === type);
            if (existing >= 0) {
                const shown = d.sections.map((s, k) =>
                    k === existing
                        ? {
                              ...s,
                              enabled: true,
                          }
                        : s,
                );
                return {
                    ...d,
                    sections: retime(shown, existing, at, first),
                };
            }
            return {
                ...d,
                sections: addAt(
                    d.sections,
                    {
                        type,
                        enabled: true,
                        scene: 'film',
                        edge: 'none',
                    },
                    at,
                    first,
                ),
            };
        });
        showSection(type);
    };

    // The invitation in the player redraws only when the design or the language changes, never on
    // the clock's every tick while the film plays or the playhead moves.
    const player = useMemo(
        () => (
            <EditContext value={editing}>
                <div
                    ref={frame}
                    className="inv-editing absolute inset-0 [transform:translateZ(0)] [scrollbar-width:none] overflow-y-auto overscroll-contain"
                    // Links (maps, calendar) must not navigate away while editing.
                    onClickCapture={(e) => {
                        if ((e.target as HTMLElement).closest('a')) e.preventDefault();
                    }}
                    data-film-player
                >
                    <InvitationView
                        key={locale}
                        data={preview}
                        initialLocale={locale}
                        embedded
                        skipOpening
                    />
                </div>
            </EditContext>
        ),
        [editing, preview, locale],
    );

    const chosen = selected !== null ? moments[selected] : undefined;
    const wordsLayer = {
        ...designStyle(draft.design),
        containerType: 'size',
    } as CSSProperties;

    return (
        <div className="flex h-full flex-col" data-film-editor>
            <div className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <ArrowLeft /> Page view
                </Button>
                <span className="mx-2 h-5 w-px bg-border" />
                <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={playing ? 'Pause' : 'Play'}
                    onClick={() => {
                        const root = frame.current;
                        if (
                            !playing &&
                            root &&
                            root.scrollTop + root.clientHeight >= root.scrollHeight - 2
                        )
                            root.scrollTop = 0;
                        setPlaying((p) => !p);
                    }}
                >
                    {playing ? <Pause /> : <Play />}
                </Button>
                <Clock clock={clock} length={length} />
                <Popover
                    open={menu === 'section'}
                    onOpenChange={(open) => {
                        setMenu(open ? 'section' : null);
                    }}
                >
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus /> Add section
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-64 p-1.5">
                        <p className="px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase">
                            Rests at {fmt(clamp(now(), first, length))}
                        </p>
                        <div className="max-h-72 overflow-y-auto">
                            {hidden.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-[13px] hover:bg-muted"
                                    onClick={() => {
                                        setMenu(null);
                                        addSection(type);
                                    }}
                                >
                                    <Eye className="size-3.5" /> {shortName(type)}
                                    <span className="ms-auto text-[10px] text-muted-foreground">
                                        hidden
                                    </span>
                                </button>
                            ))}
                            {addable.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-[13px] hover:bg-muted"
                                    onClick={() => {
                                        setMenu(null);
                                        addSection(type);
                                    }}
                                >
                                    <Plus className="size-3.5" /> {shortName(type)}
                                </button>
                            ))}
                            {hidden.length + addable.length === 0 && (
                                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                                    Every section is already on the page.
                                </p>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm" onClick={addWords}>
                    <Plus /> Add words
                </Button>
                <Popover
                    open={menu === 'layer'}
                    onOpenChange={(open) => {
                        setMenu(open ? 'layer' : null);
                    }}
                >
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Layers /> Add layer
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-56 p-1.5">
                        <p className="px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase">
                            On the film from {fmt(now())}
                        </p>
                        {(Object.keys(kindLabels) as LayerKind[]).map((kind) => (
                            <button
                                key={kind}
                                type="button"
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-[13px] hover:bg-muted"
                                onClick={() => {
                                    setMenu(null);
                                    addLayer(kind);
                                }}
                            >
                                <span className={cn('size-2.5 rounded-full', kindColour[kind])} />
                                {kindLabels[kind]}
                            </button>
                        ))}
                    </PopoverContent>
                </Popover>
                <p className="ms-auto hidden text-xs text-muted-foreground 2xl:block">
                    Click anything on the film to edit it · Space plays · ← → step a frame
                </p>
            </div>

            <div className="flex min-h-0 flex-1 gap-4 p-4">
                <div className="flex min-w-0 flex-1 justify-center">
                    <div
                        className="relative aspect-[9/16] h-full max-w-full overflow-hidden rounded-md bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
                        data-film-picture
                    >
                        {player}
                        <Handles
                            clock={clock}
                            style={wordsLayer}
                            moments={moments}
                            layers={layers}
                            selected={selected}
                            layer={layer}
                            live={live}
                            locale={locale}
                            one={one}
                            two={two}
                            onWords={moveWords}
                            onWiden={widen}
                            onLayer={moveLayer}
                            onResize={resizeLayer}
                            onPickWords={onSelect}
                            onPickLayer={pickLayer}
                        />
                    </div>
                </div>

                <aside className="w-80 shrink-0 space-y-4 overflow-y-auto pe-1" data-film-side>
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
                                seek((chosen.from + chosen.to) / 2);
                            }}
                            onRemove={() => {
                                remove(selected);
                            }}
                        />
                    ) : layer !== null && layers[layer] ? (
                        <LayerInspector
                            layer={layers[layer]}
                            index={layer}
                            length={length}
                            photos={photos}
                            invitationId={invitationId}
                            onChange={(p) => {
                                patchLayer(layer, p);
                            }}
                            onSeek={() => {
                                const l = layers[layer];
                                if (l) seek((l.from + l.to) / 2);
                            }}
                            onRemove={() => {
                                removeLayer(layer);
                            }}
                            now={now}
                            onSeekTo={seek}
                        />
                    ) : settings && section ? (
                        settings
                    ) : (
                        <div className="space-y-3 text-xs text-muted-foreground">
                            <p className="text-[11px] font-medium uppercase">Film editor</p>
                            <p>
                                Click a section on the film to choose its layout, entrance
                                animation, backdrop and edge here. Click any text to type on it.
                            </p>
                            <p>
                                Below, drag the playhead through the film. Slide a section along the
                                Sections track to change when it shows, and slide or stretch words
                                to change when they appear.
                            </p>
                        </div>
                    )}
                </aside>
            </div>

            <Timeline
                draft={draft}
                set={set}
                scenes={scenes}
                length={length}
                first={first}
                clock={clock}
                moments={moments}
                locale={locale}
                selected={selected}
                section={section}
                onSeek={seek}
                onSelect={onSelect}
                onSection={showSection}
                onMoment={patch}
                layers={layers}
                layer={layer}
                onLayer={pickLayer}
                onLayerChange={patchLayer}
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
    set: SetDraft;
    scenes: TimedScene[];
    length: number;
    first: number;
    clock: MotionValue<number>;
    moments: FilmMoment[];
    locale: string;
    selected: number | null;
    section: SectionType | null;
    onSeek: (t: number) => void;
    onSelect: (word: number | null) => void;
    onSection: (type: SectionType) => void;
    onMoment: (i: number, p: Partial<FilmMoment>, gesture?: string) => void;
    layers: FilmLayer[];
    layer: number | null;
    onLayer: (i: number) => void;
    onLayerChange: (i: number, p: Partial<FilmLayer>, gesture?: string) => void;
}

const TRACK = 'relative h-8 rounded-md bg-muted/40';
const ROW = 22;

function Timeline({
    draft,
    set,
    scenes,
    length,
    first,
    clock,
    moments,
    locale,
    selected,
    section,
    onSeek,
    onSelect,
    onSection,
    onMoment,
    layers,
    layer,
    onLayer,
    onLayerChange,
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
        const t0 = secondsAt(e.clientX);
        onSeek(t0);
        follow(e, (dx) => {
            onSeek(clamp(t0 + dx / perSecond, 0, length));
        });
    };

    // Sections: each at its second; those sharing a second (a chapter) stack up.
    const times = sectionTimes(draft.sections, first);
    const placed = draft.sections.flatMap((s, index) => {
        if (!s.enabled) return [];
        const second = times[index] ?? first;
        const row = draft.sections
            .slice(0, index)
            .filter((x, k) => x.enabled && Math.abs((times[k] ?? first) - second) < 1e-6).length;
        return [
            {
                type: s.type,
                at: second,
                row,
                starts: row === 0,
            },
        ];
    });
    const rows = Math.max(1, ...placed.map((p) => p.row + 1));
    const sectionsTrack = { height: `${String(rows * ROW + 8)}px` };
    // A section being dragged shows where it will land; the page reorders once, when it's let go.
    const [ghost, setGhost] = useState<Ghost | null>(null);
    const moveSection = (e: ReactPointerEvent, type: SectionType, start: number) => {
        onSection(type);
        let v = start;
        follow(
            e,
            (dx) => {
                v = round(clamp(start + dx / perSecond, first, length), 0.1);
                setGhost({
                    type,
                    at: v,
                });
            },
            () => {
                setGhost(null);
                if (Math.abs(v - start) < 1e-6) return;
                set((d) => {
                    const index = d.sections.findIndex((s) => s.type === type);
                    return index < 0
                        ? d
                        : {
                              ...d,
                              sections: retime(d.sections, index, v, first),
                          };
                });
            },
        );
    };
    // Slide a bar (words or a layer) along the timeline, or stretch it from either end.
    // While a bar is dragged it shows where it will be; the change is saved once, when it's let go.
    const [bar, setBar] = useState<Bar | null>(null);
    // A keyframe being slid along its layer's bar.
    const [keyAt, setKeyAt] = useState<KeyGhost | null>(null);
    const moveKey = (e: ReactPointerEvent, i: number, n: number, start: number, span: Span) => {
        onLayer(i);
        let v = start;
        follow(
            e,
            (dx) => {
                v = round(clamp(start + dx / perSecond, span.from, span.to), 0.01);
                setKeyAt({
                    i,
                    n,
                    at: v,
                });
                onSeek(v);
            },
            () => {
                setKeyAt(null);
                const l = layers[i];
                if (Math.abs(v - start) < 1e-6 || !l) {
                    onSeek(start);
                    return;
                }
                onLayerChange(i, {
                    keys: (l.keys ?? [])
                        .map((k, m) =>
                            m === n
                                ? {
                                      ...k,
                                      at: v,
                                  }
                                : k,
                        )
                        .sort((a, b) => a.at - b.at),
                });
            },
        );
    };
    const moveSpan = (
        e: ReactPointerEvent,
        kind: Bar['kind'],
        i: number,
        span: Span,
        edge: 'from' | 'to' | 'both',
        change: (p: Span) => void,
    ) => {
        const { from, to } = span;
        let next: Span = {
            from,
            to,
        };
        follow(
            e,
            (dx) => {
                const d = dx / perSecond;
                if (edge === 'both') {
                    const shift = clamp(d, -from, length - to);
                    next = {
                        from: round(from + shift, 0.1),
                        to: round(to + shift, 0.1),
                    };
                    onSeek((from + to) / 2 + shift);
                } else if (edge === 'from') {
                    next = {
                        from: round(clamp(from + d, 0, to - 0.3), 0.1),
                        to,
                    };
                    onSeek(next.from + 0.15);
                } else {
                    next = {
                        from,
                        to: round(clamp(to + d, from + 0.3, length), 0.1),
                    };
                    onSeek(next.to - 0.15);
                }
                setBar({
                    kind,
                    i,
                    ...next,
                });
            },
            () => {
                setBar(null);
                if (next.from !== from || next.to !== to) change(next);
            },
        );
    };
    const moveWords = (e: ReactPointerEvent, i: number, edge: 'from' | 'to' | 'both') => {
        const m = moments[i];
        if (!m) return;
        onSelect(i);
        moveSpan(e, 'words', i, m, edge, (p) => {
            onMoment(i, p);
        });
    };
    const moveLayer = (e: ReactPointerEvent, i: number, edge: 'from' | 'to' | 'both') => {
        const l = layers[i];
        if (!l) return;
        onLayer(i);
        moveSpan(e, 'layer', i, l, edge, (p) => {
            onLayerChange(i, p);
        });
    };

    // Layers that overlap in time stack into rows, so each one can be picked.
    const layerRows: number[] = [];
    const ends: number[] = [];
    layers.forEach((l, i) => {
        const row = ends.findIndex((end) => end <= l.from + 1e-6);
        const at2 = row < 0 ? ends.length : row;
        ends[at2] = l.to;
        layerRows[i] = at2;
    });
    const layerTrack = { height: `${String(Math.max(1, ends.length) * ROW + 8)}px` };

    const thumbs = Math.max(4, Math.floor(width / 40));
    const ticks = Array.from({ length: Math.floor(length) + 1 }, (_, s) => s);
    const opening = { width: at(first) };
    const labels = { height: `${String(rows * ROW + 8)}px` };

    return (
        // Capped, so the player keeps most of the screen however many sections and layers there are.
        <div
            className="max-h-[45%] shrink-0 overflow-y-auto border-t bg-background/60 px-3 pt-2 pb-3"
            data-film-timeline
        >
            <div className="flex gap-2">
                <div className="w-20 shrink-0 space-y-1.5 pt-6 text-[11px] text-muted-foreground uppercase">
                    <p className="flex h-14 items-center">Film</p>
                    <p className="flex items-start pt-2" style={labels}>
                        Sections
                    </p>
                    <p className="flex h-8 items-center">Words</p>
                    <p className="flex items-start pt-2" style={layerTrack}>
                        Layers
                    </p>
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
                    {/* Filmstrip; the opening's stretch plays on the tap, before the page. */}
                    <div
                        className="relative flex h-14 cursor-pointer overflow-hidden rounded-md"
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
                        <div
                            className="pointer-events-none absolute inset-y-0 start-0 flex items-end bg-black/45 p-1 text-[9px] text-white/80 uppercase"
                            style={opening}
                        >
                            Opening
                        </div>
                    </div>
                    {/* Sections */}
                    <div className="relative rounded-md bg-muted/40" style={sectionsTrack}>
                        {placed.map((p) => {
                            const dragging = ghost?.type === p.type;
                            const pill = {
                                insetInlineStart: at(dragging ? ghost.at : p.at),
                                top: `${String(4 + p.row * ROW)}px`,
                            };
                            return (
                                <button
                                    key={p.type}
                                    type="button"
                                    aria-label={`${shortName(p.type)} rests at ${fmt(p.at)}`}
                                    className={cn(
                                        'absolute flex h-5 max-w-40 cursor-grab items-center gap-1 truncate rounded-full py-0.5 ps-1.5 pe-2 text-[10px] whitespace-nowrap shadow',
                                        p.at > length - 1.5
                                            ? '-translate-x-full rtl:translate-x-full'
                                            : p.at < 0.8
                                              ? ''
                                              : '-translate-x-1/2 rtl:translate-x-1/2',
                                        dragging
                                            ? 'z-10 bg-white text-black ring-2 ring-primary ring-offset-2 ring-offset-background'
                                            : p.type === section
                                              ? 'bg-white text-black ring-2 ring-primary'
                                              : p.starts
                                                ? 'bg-primary/90 text-primary-foreground hover:bg-primary'
                                                : 'bg-primary/45 text-primary-foreground hover:bg-primary/70',
                                    )}
                                    style={pill}
                                    onPointerDown={(e) => {
                                        moveSection(e, p.type, p.at);
                                    }}
                                    data-film-section={p.type}
                                >
                                    {p.starts && (
                                        <Diamond className="size-2.5 shrink-0 fill-current" />
                                    )}
                                    {shortName(p.type)}
                                </button>
                            );
                        })}
                    </div>
                    {/* Words */}
                    <div className={TRACK}>
                        {moments.map((m, i) => {
                            const span = bar?.kind === 'words' && bar.i === i ? bar : m;
                            const place = {
                                insetInlineStart: at(span.from),
                                width: at(span.to - span.from),
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
                                    style={place}
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
                    {/* Layers */}
                    <div className="relative rounded-md bg-muted/40" style={layerTrack}>
                        {layers.map((l, i) => {
                            const span = bar?.kind === 'layer' && bar.i === i ? bar : l;
                            const place = {
                                insetInlineStart: at(span.from),
                                width: at(span.to - span.from),
                                top: `${String(4 + (layerRows[i] ?? 0) * ROW)}px`,
                            };
                            return (
                                <div
                                    // Layers have no ids: their place in the list is who they are.
                                    key={i}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${kindLabels[l.kind]} ${String(i + 1)}, ${fmt(l.from)} to ${fmt(l.to)}`}
                                    className={cn(
                                        'absolute h-5 cursor-grab overflow-hidden rounded-sm px-2 text-[10px] leading-5 whitespace-nowrap text-black/80',
                                        kindColour[l.kind],
                                        i === layer
                                            ? 'ring-2 ring-white'
                                            : 'opacity-75 hover:opacity-100',
                                    )}
                                    style={place}
                                    onPointerDown={(e) => {
                                        moveLayer(e, i, 'both');
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') onLayer(i);
                                    }}
                                    data-film-layer-bar={i}
                                >
                                    {l.kind === 'effect'
                                        ? effectLabels[l.effect ?? 'petals']
                                        : kindLabels[l.kind]}
                                    {(l.keys ?? []).map((k, n) => {
                                        const when =
                                            keyAt?.i === i && keyAt.n === n ? keyAt.at : k.at;
                                        if (when < span.from || when > span.to) return null;
                                        const share =
                                            (when - span.from) /
                                            Math.max(0.01, span.to - span.from);
                                        const left = `${String(share * 100)}%`;
                                        const spot = { insetInlineStart: left };
                                        return (
                                            <span
                                                // Keyframes are kept in time order.
                                                key={n}
                                                role="button"
                                                tabIndex={0}
                                                aria-label={`Keyframe at ${fmt(when)}`}
                                                className="absolute top-1/2 z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 cursor-ew-resize border border-black/60 bg-amber-200 rtl:translate-x-1/2"
                                                style={spot}
                                                onPointerDown={(e) => {
                                                    moveKey(e, i, n, k.at, span);
                                                }}
                                                data-film-keyframe={`${String(i)}-${String(n)}`}
                                            />
                                        );
                                    })}
                                    {(['from', 'to'] as const).map((edge) => (
                                        <span
                                            key={edge}
                                            aria-hidden
                                            className={cn(
                                                'absolute inset-y-0 w-2 cursor-ew-resize bg-black/25',
                                                edge === 'from' ? 'start-0' : 'end-0',
                                            )}
                                            onPointerDown={(e) => {
                                                moveLayer(e, i, edge);
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
                    <Playhead clock={clock} length={length} onScrub={scrub} />
                </div>
            </div>
        </div>
    );
}

interface LayerInspectorProps {
    layer: FilmLayer;
    index: number;
    length: number;
    photos: string[];
    invitationId: string;
    onChange: (p: Partial<FilmLayer>) => void;
    onSeek: () => void;
    onRemove: () => void;
    now: () => number;
    onSeekTo: (t: number) => void;
}

function LayerInspector({
    layer: l,
    index,
    length,
    photos,
    invitationId,
    onChange,
    onSeek,
    onRemove,
    now,
    onSeekTo,
}: LayerInspectorProps) {
    const [busy, setBusy] = useState(false);
    const addPhoto = async (file: File) => {
        setBusy(true);
        try {
            onChange({ photo: await upload(invitationId, file) });
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'The photo couldn’t be added');
        } finally {
            setBusy(false);
        }
    };
    return (
        <div className="space-y-3" data-film-layer-inspector>
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">
                    {kindLabels[l.kind]} {String(index + 1)}
                </p>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove this ${kindLabels[l.kind].toLowerCase()}`}
                    onClick={onRemove}
                >
                    <Trash2 />
                </Button>
            </div>

            {l.kind === 'photo' && (
                <>
                    <div className="space-y-1.5">
                        <Label className="text-[11px] text-muted-foreground uppercase">Photo</Label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {photos.map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    aria-label="Use this photo"
                                    aria-pressed={l.photo === key}
                                    className={cn(
                                        'aspect-square overflow-hidden rounded-md ring-1 ring-border',
                                        l.photo === key && 'ring-2 ring-primary',
                                    )}
                                    onClick={() => {
                                        onChange({ photo: key });
                                    }}
                                >
                                    <img
                                        src={photoUrl(key)}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                </button>
                            ))}
                            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-[10px] text-muted-foreground hover:text-foreground">
                                {busy ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Upload className="size-4" />
                                )}
                                Upload
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) void addPhoto(file);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground uppercase">Shape</Label>
                        <Select
                            value={l.shape ?? 'arch'}
                            onValueChange={(v) => {
                                onChange({ shape: v as Shape });
                            }}
                        >
                            <SelectTrigger aria-label="Photo shape" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(shapeLabels) as Shape[]).map((id) => (
                                    <SelectItem key={id} value={id}>
                                        {shapeLabels[id]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}

            {l.kind === 'monogram' && (
                <p className="text-xs text-muted-foreground">
                    The couple’s initials in a gold ring, in the invitation’s script.
                </p>
            )}

            {l.kind === 'ornament' && (
                <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase">Ornament</Label>
                    <div className="grid grid-cols-6 gap-1.5">
                        {motifIds.map((id) => (
                            <button
                                key={id}
                                type="button"
                                aria-label={`Use the ${id} ornament`}
                                aria-pressed={l.motif === id}
                                className={cn(
                                    'grid aspect-square place-items-center rounded-md ring-1 ring-border hover:bg-muted',
                                    l.motif === id && 'ring-2 ring-primary',
                                )}
                                onClick={() => {
                                    onChange({ motif: id });
                                }}
                            >
                                <svg viewBox="0 0 100 100" className="size-6 text-gold" aria-hidden>
                                    {(isMotif(id) ? motifs[id] : []).map((d, k) => (
                                        <path
                                            key={k}
                                            d={d}
                                            fill="currentColor"
                                            fillRule="evenodd"
                                        />
                                    ))}
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {l.kind === 'effect' && (
                <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground uppercase">Effect</Label>
                    <Select
                        value={l.effect ?? 'petals'}
                        onValueChange={(v) => {
                            onChange({ effect: v as Effect });
                        }}
                    >
                        <SelectTrigger aria-label="Effect" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(effectLabels) as Effect[]).map((id) => (
                                <SelectItem key={id} value={id}>
                                    {effectLabels[id]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {l.kind !== 'effect' && (
                <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground uppercase">Entrance</Label>
                    <Select
                        value={l.enter ?? 'fade'}
                        onValueChange={(v) => {
                            onChange({ enter: v as Enter });
                        }}
                    >
                        <SelectTrigger aria-label="Entrance" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(enterLabels) as Enter[]).map((id) => (
                                <SelectItem key={id} value={id}>
                                    {enterLabels[id]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground uppercase">
                    Shown from … to
                </Label>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <SecondsInput
                        value={l.from}
                        min={0}
                        max={Math.max(0, l.to - 0.3)}
                        label="Layer from"
                        onChange={(from) => {
                            onChange({ from });
                        }}
                    />
                    to
                    <SecondsInput
                        value={l.to}
                        min={Math.min(length, l.from + 0.3)}
                        max={length}
                        label="Layer to"
                        onChange={(to) => {
                            onChange({ to });
                        }}
                    />
                </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={onSeek}>
                Go to this {kindLabels[l.kind].toLowerCase()}
            </Button>

            {l.kind !== 'effect' && (
                <Motion layer={l} onChange={onChange} now={now} onSeekTo={onSeekTo} />
            )}
        </div>
    );
}

interface MotionProps {
    layer: FilmLayer;
    onChange: (p: Partial<FilmLayer>) => void;
    now: () => number;
    onSeekTo: (t: number) => void;
}

// Keyframes: the layer's place, size, fade and turn at chosen seconds, eased in between.
function Motion({ layer: l, onChange, now, onSeekTo }: MotionProps) {
    const keys = l.keys ?? [];
    const set = (i: number, p: Partial<LayerKey>) => {
        onChange({
            keys: keys.map((k, n) =>
                n === i
                    ? {
                          ...k,
                          ...p,
                      }
                    : k,
            ),
        });
    };
    return (
        <div className="space-y-2 border-t pt-3" data-film-motion>
            <p className="text-[11px] font-medium text-muted-foreground uppercase">Motion</p>
            {keys.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    Add a keyframe, move the playhead, then drag the{' '}
                    {kindLabels[l.kind].toLowerCase()} on the film: it glides between the two.
                </p>
            )}
            <ol className="space-y-2">
                {keys.map((k, i) => (
                    <li
                        // Keyframes are kept in time order: their place is who they are.
                        key={i}
                        className="space-y-1.5 rounded-md border p-2"
                        data-film-key={i}
                    >
                        <div className="flex items-center gap-1.5 text-xs">
                            <Diamond className="size-3 fill-current text-amber-300" />
                            <span className="tabular-nums">{fmt(k.at)}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ms-auto h-6 px-2 text-[11px]"
                                onClick={() => {
                                    onSeekTo(k.at);
                                }}
                            >
                                Go
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Remove the keyframe at ${fmt(k.at)}`}
                                onClick={() => {
                                    onChange({ keys: keys.filter((_, n) => n !== i) });
                                }}
                            >
                                <Trash2 />
                            </Button>
                        </div>
                        <KeySlider
                            label="Fade"
                            value={k.opacity}
                            min={0}
                            max={1}
                            step={0.05}
                            show={(v) => `${String(Math.round(v * 100))}%`}
                            onCommit={(opacity) => {
                                set(i, { opacity });
                            }}
                        />
                        <KeySlider
                            label="Turn"
                            value={k.rotate}
                            min={-45}
                            max={45}
                            step={1}
                            show={(v) => `${String(v)}°`}
                            onCommit={(rotate) => {
                                set(i, { rotate });
                            }}
                        />
                    </li>
                ))}
            </ol>
            <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                    onChange({ keys: withKey(l, round(now(), 0.01), {}) });
                }}
            >
                <Diamond /> Add a keyframe at the playhead
            </Button>
        </div>
    );
}

interface KeySliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    show: (v: number) => string;
    onCommit: (v: number) => void;
}

// A slider that saves when it's let go: dragging it never redraws the whole invitation.
function KeySlider({ label, value, min, max, step, show, onCommit }: KeySliderProps) {
    const [v, setV] = useState(value);
    const [was, setWas] = useState(value);
    if (value !== was) {
        setWas(value);
        setV(value);
    }
    return (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="w-8">{label}</span>
            <Slider
                aria-label={label}
                className="flex-1"
                min={min}
                max={max}
                step={step}
                value={[v]}
                onValueChange={([n]) => {
                    if (n !== undefined) setV(n);
                }}
                onValueCommit={([n]) => {
                    if (n !== undefined) onCommit(n);
                }}
            />
            <span className="w-9 text-end tabular-nums">{show(v)}</span>
        </div>
    );
}

interface Live {
    kind: 'words' | 'layer';
    i: number;
    zone: FilmMoment['zone'];
}

interface HandlesProps {
    clock: MotionValue<number>;
    style: CSSProperties;
    moments: FilmMoment[];
    layers: FilmLayer[];
    selected: number | null;
    layer: number | null;
    // Words or a layer mid-drag: drawn here at its new place, hidden on the invitation till let go.
    live: Live | null;
    locale: string;
    one: string;
    two: string;
    onWords: (e: ReactPointerEvent, i: number) => void;
    onWiden: (e: ReactPointerEvent, i: number, side: -1 | 1) => void;
    onLayer: (e: ReactPointerEvent, i: number) => void;
    onResize: (e: ReactPointerEvent, i: number, side: -1 | 1) => void;
    onPickWords: (i: number) => void;
    onPickLayer: (i: number) => void;
}

// The handles over the film: one for each word and layer showing at the playhead. They follow the
// clock themselves, so the rest of the editor stays still while the film plays.
function Handles({
    clock,
    style,
    moments,
    layers,
    selected,
    layer,
    live,
    locale,
    one,
    two,
    onWords,
    onWiden,
    onLayer,
    onResize,
    onPickWords,
    onPickLayer,
}: HandlesProps) {
    const [t, setT] = useState(() => clock.get());
    useEffect(
        () =>
            clock.on('change', (v) => {
                setT(v);
            }),
        [clock],
    );
    const hide = live
        ? `[data-film-player] [data-film-${live.kind === 'words' ? 'moment' : 'layer'}="${String(live.i)}"]{visibility:hidden!important}`
        : '';
    return (
        <div className="pointer-events-none absolute inset-0" style={style}>
            {hide && <style>{hide}</style>}
            {layers.map((l, i) => {
                const a = momentAlpha(l, t);
                const on = i === layer;
                const dragging = live?.kind === 'layer' && live.i === i;
                // Where its keyframes have it now (or where it's being dragged to).
                const pose = poseAt(l, t);
                const zone = dragging ? live.zone : pose;
                if (a <= 0 && !on) return null;
                if (l.kind === 'effect')
                    return on ? (
                        <div
                            key={`layer-${String(i)}`}
                            className="absolute inset-2 rounded-md outline-2 outline-white/70 outline-dashed"
                            data-film-layer-handle={i}
                        >
                            <span className="absolute start-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                                {effectLabels[l.effect ?? 'petals']}
                            </span>
                        </div>
                    ) : null;
                const place = {
                    insetInlineStart: `${String((zone.x - zone.w / 2) * 100)}%`,
                    top: `${String(zone.y * 100)}%`,
                    width: `${String(zone.w * 100)}%`,
                    transform: `translateY(-50%) rotate(${String(pose.rotate)}deg)`,
                };
                return (
                    <div
                        key={`layer-${String(i)}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Move the ${kindLabels[l.kind].toLowerCase()}`}
                        className={cn(
                            'pointer-events-auto absolute cursor-move rounded-sm select-none',
                            on
                                ? 'z-10 outline-2 outline-offset-4 outline-white/85 outline-dashed'
                                : 'hover:outline-1 hover:outline-offset-4 hover:outline-white/50 hover:outline-dashed',
                        )}
                        style={place}
                        onPointerDown={(e) => {
                            onLayer(e, i);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onPickLayer(i);
                        }}
                        data-film-layer-handle={i}
                    >
                        {/* The invitation draws the layer; this is the handle over it. */}
                        <div className={dragging ? '' : a > 0 ? 'opacity-0' : 'opacity-55'}>
                            <LayerArt layer={l} one={one} two={two} />
                        </div>
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
                                        onResize(e, i, side);
                                    }}
                                />
                            ))}
                    </div>
                );
            })}
            {moments.map((m, i) => {
                const a = momentAlpha(m, t);
                const on = i === selected;
                const dragging = live?.kind === 'words' && live.i === i;
                const zone = dragging ? live.zone : m.zone;
                if (a <= 0 && !on) return null;
                const text = m.text[locale] ?? Object.values(m.text)[0] ?? '';
                const place = {
                    insetInlineStart: `${String((zone.x - zone.w / 2) * 100)}%`,
                    top: `${String(zone.y * 100)}%`,
                    width: `${String(zone.w * 100)}%`,
                    transform: 'translateY(-50%)',
                    opacity: on && a <= 0 ? 0.55 : 1,
                };
                return (
                    <div
                        // Moments have no ids: their place in the list is who they are.
                        key={i}
                        role="button"
                        tabIndex={0}
                        aria-label={`Move words: ${text}`}
                        className={cn(
                            'pointer-events-auto absolute cursor-move rounded-sm text-center text-balance select-none',
                            momentLook[m.style ?? 'line'],
                            // The invitation draws the words; this is the handle over them.
                            a > 0 && !dragging && 'text-transparent',
                            on
                                ? 'z-10 outline-2 outline-offset-4 outline-white/85 outline-dashed'
                                : 'hover:outline-1 hover:outline-offset-4 hover:outline-white/50 hover:outline-dashed',
                        )}
                        style={place}
                        onPointerDown={(e) => {
                            onWords(e, i);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onPickWords(i);
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
                                        onWiden(e, i, side);
                                    }}
                                    data-film-handle={side}
                                />
                            ))}
                    </div>
                );
            })}
        </div>
    );
}

interface ClockProps {
    clock: MotionValue<number>;
    length: number;
}

// The playhead's second, kept current without re-rendering anything.
function Clock({ clock, length }: ClockProps) {
    const el = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const show = (v: number) => {
            if (el.current) el.current.textContent = `${fmt(v)} / ${fmt(length)}`;
        };
        show(clock.get());
        return clock.on('change', show);
    }, [clock, length]);
    return (
        <span
            ref={el}
            className="w-28 text-xs text-muted-foreground tabular-nums"
            data-film-clock
        />
    );
}

interface PlayheadProps extends ClockProps {
    onScrub: (e: ReactPointerEvent) => void;
}

// The playhead, across every track; it follows the clock itself, and its knob on the ruler drags it.
function Playhead({ clock, length, onScrub }: PlayheadProps) {
    const el = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const place = (v: number) => {
            if (el.current)
                el.current.style.insetInlineStart = `${String((clamp(v, 0, length) / length) * 100)}%`;
        };
        place(clock.get());
        return clock.on('change', place);
    }, [clock, length]);
    return (
        <div
            ref={el}
            className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-red-400 rtl:translate-x-1/2"
            data-film-playhead
        >
            <span
                className="pointer-events-auto absolute start-1/2 -top-1 size-3 -translate-x-1/2 cursor-ew-resize rounded-sm bg-red-400 rtl:translate-x-1/2"
                onPointerDown={onScrub}
                role="presentation"
            />
        </div>
    );
}
