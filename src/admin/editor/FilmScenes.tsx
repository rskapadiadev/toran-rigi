// The scenes of the film behind the invitation: films and stills played one after another, each with
// its camera move and the way it hands over to the next (a cut, a crossfade, or a flight through a door).
import {
    type CameraMove,
    type FilmFrames,
    type FilmScene,
    type Focus,
    frameAt,
    frameCell,
    sceneAt,
    type SceneExit,
    type TimedScene,
    timelineLength,
    timelineOf,
} from '@shared/film';
import { photoUrl } from '@shared/photos';
import { ArrowDown, ArrowUp, Clapperboard, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { type CSSProperties, type MouseEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import { cutFrames } from './film-cut';
import { upload } from './PhotosPanel';

type Film = NonNullable<Draft['design']['film']>;

const cameraLabels: Record<CameraMove, string> = {
    still: 'Hold still',
    push: 'Slow push in',
    pull: 'Slow pull back',
    rise: 'Rise up',
    fall: 'Sink down',
    'drift-left': 'Drift left',
    'drift-right': 'Drift right',
};

const exitLabels: Record<SceneExit, string> = {
    cut: 'Cut',
    fade: 'Crossfade',
    zoom: 'Fly through a door',
};

const cameraIds = Object.keys(cameraLabels) as CameraMove[];
const exitIds = Object.keys(exitLabels) as SceneExit[];
const DOOR: Focus = {
    x: 0.5,
    y: 0.55,
    zoom: 4,
};

// A frame of a film (from its sheet) as a CSS background.
function frameLook(frames: FilmFrames, index: number): CSSProperties {
    const cell = frameCell(frames, index);
    const sheet = frames.sheets[cell.sheet];
    const x = frames.cols > 1 ? (cell.col / (frames.cols - 1)) * 100 : 0;
    const y = frames.rows > 1 ? (cell.row / (frames.rows - 1)) * 100 : 0;
    return {
        backgroundImage: sheet ? `url(${photoUrl(sheet)})` : undefined,
        backgroundSize: `${String(frames.cols * 100)}% ${String(frames.rows * 100)}%`,
        backgroundPosition: `${String(x)}% ${String(y)}%`,
    };
}

// The film at any moment of its timeline, as a CSS background.
export function lookAt(scenes: TimedScene[], seconds: number): CSSProperties {
    const place = sceneAt(scenes, seconds);
    const scene = scenes[place.index];
    if (!scene) return {};
    if (scene.kind === 'still' || !scene.frames) return sceneLook(scene, false);
    return frameLook(scene.frames, frameAt(scene.frames, place.local).index);
}

// What a scene looks like at its start or its end.
function sceneLook(scene: FilmScene, end: boolean): CSSProperties {
    if (scene.kind === 'still' && scene.image)
        return {
            backgroundImage: `url(${photoUrl(scene.image)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    return scene.frames ? frameLook(scene.frames, end ? scene.frames.count - 1 : 0) : {};
}

interface PortalProps {
    scene: FilmScene;
    portal: Focus;
    onChange: (portal: Focus) => void;
}

// Tap the scene's last frame where the camera should fly in (a door, a window), then set how close.
function PortalPicker({ scene, portal, onChange }: PortalProps) {
    const pick = (e: MouseEvent<HTMLButtonElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        onChange({
            ...portal,
            x: Math.round(((e.clientX - r.left) / r.width) * 1000) / 1000,
            y: Math.round(((e.clientY - r.top) / r.height) * 1000) / 1000,
        });
    };
    const marker = {
        insetInlineStart: `${String(portal.x * 100)}%`,
        top: `${String(portal.y * 100)}%`,
        width: `${String(100 / portal.zoom)}%`,
    };
    const look = {
        ...sceneLook(scene, true),
        aspectRatio: '9 / 16',
    };
    return (
        <div className="flex gap-3">
            <button
                type="button"
                aria-label="Choose the door the camera flies through"
                className="relative w-24 shrink-0 overflow-hidden rounded-md bg-black"
                style={look}
                onClick={pick}
            >
                <span
                    aria-hidden
                    className="absolute aspect-[9/16] -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)] rtl:translate-x-1/2"
                    style={marker}
                />
            </button>
            <div className="min-w-0 flex-1 space-y-2">
                <p className="text-xs text-muted-foreground">
                    Tap the picture on the door or window to fly through. The next scene opens out
                    of it.
                </p>
                <Label className="text-[11px] text-muted-foreground uppercase">How close</Label>
                <Slider
                    aria-label="How close the camera flies"
                    min={2}
                    max={10}
                    step={0.5}
                    value={[portal.zoom]}
                    onValueChange={([v]) => {
                        if (v !== undefined)
                            onChange({
                                ...portal,
                                zoom: v,
                            });
                    }}
                />
            </div>
        </div>
    );
}

interface Props {
    invitationId: string;
    film: Film;
    onChange: (film: Film) => void;
}

export function FilmScenes({ invitationId, film, onChange }: Props) {
    const stillInput = useRef<HTMLInputElement>(null);
    const filmInput = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const scenes: FilmScene[] =
        film.scenes ??
        (film.frames
            ? [
                  {
                      kind: 'film',
                      frames: film.frames,
                  },
              ]
            : []);
    const timed = timelineOf({ scenes });
    const set = (next: FilmScene[]) => {
        onChange({
            ...film,
            scenes: next,
        });
    };
    const patch = (i: number, p: Partial<FilmScene>) => {
        set(
            scenes.map((s, k) =>
                k === i
                    ? {
                          ...s,
                          ...p,
                      }
                    : s,
            ),
        );
    };
    const move = (i: number, by: number) => {
        const next = [...scenes];
        const [item] = next.splice(i, 1);
        if (!item) return;
        next.splice(i + by, 0, item);
        set(next);
    };

    const addStill = async (file: File) => {
        setBusy('Adding the still');
        try {
            const image = await upload(invitationId, file);
            set([
                ...scenes,
                {
                    kind: 'still',
                    image,
                    length: 3,
                    camera: 'push',
                },
            ]);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setBusy(null);
        }
    };
    const addFilm = async (file: File) => {
        const local = URL.createObjectURL(file);
        try {
            const frames = await cutFrames(invitationId, local, setBusy);
            set([
                ...scenes,
                {
                    kind: 'film',
                    frames,
                },
            ]);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Could not cut the frames');
        } finally {
            URL.revokeObjectURL(local);
            setBusy(null);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Scenes · {timelineLength(timed).toFixed(1)} s of film
            </p>
            <ol className="space-y-2">
                {scenes.map((scene, i) => {
                    const at = timed[i];
                    const last = i === scenes.length - 1;
                    const exit = scene.exit ?? 'cut';
                    const look = {
                        ...sceneLook(scene, false),
                        aspectRatio: '9 / 16',
                    };
                    return (
                        <li
                            // Scenes have no ids: their place in the list is who they are.
                            key={i}
                            className="space-y-3 rounded-md border p-2.5"
                            data-film-scene={i}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 shrink-0 rounded-sm bg-black" style={look} />
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-1.5 text-[13px] font-medium">
                                        {scene.kind === 'film' ? (
                                            <Clapperboard className="size-3.5" />
                                        ) : (
                                            <ImagePlus className="size-3.5" />
                                        )}
                                        Scene {i + 1} · {scene.kind === 'film' ? 'Film' : 'Still'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {at
                                            ? `Plays ${at.start.toFixed(1)}–${(at.start + at.duration).toFixed(1)} s`
                                            : ''}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Move scene ${String(i + 1)} up`}
                                    disabled={i === 0}
                                    onClick={() => {
                                        move(i, -1);
                                    }}
                                >
                                    <ArrowUp className="size-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Move scene ${String(i + 1)} down`}
                                    disabled={last}
                                    onClick={() => {
                                        move(i, 1);
                                    }}
                                >
                                    <ArrowDown className="size-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Remove scene ${String(i + 1)}`}
                                    disabled={scenes.length === 1}
                                    onClick={() => {
                                        set(scenes.filter((_, k) => k !== i));
                                    }}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                            <div className="grid gap-2">
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-muted-foreground uppercase">
                                        Camera
                                    </Label>
                                    <Select
                                        value={scene.camera ?? 'still'}
                                        onValueChange={(v) => {
                                            patch(i, { camera: v as CameraMove });
                                        }}
                                    >
                                        <SelectTrigger
                                            aria-label={`Scene ${String(i + 1)} camera`}
                                            className="w-full"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cameraIds.map((id) => (
                                                <SelectItem key={id} value={id}>
                                                    {cameraLabels[id]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {!last && (
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-muted-foreground uppercase">
                                            Then
                                        </Label>
                                        <Select
                                            value={exit}
                                            onValueChange={(v) => {
                                                const next = v as SceneExit;
                                                patch(i, {
                                                    exit: next,
                                                    portal:
                                                        next === 'zoom'
                                                            ? (scene.portal ?? DOOR)
                                                            : scene.portal,
                                                });
                                            }}
                                        >
                                            <SelectTrigger
                                                aria-label={`After scene ${String(i + 1)}`}
                                                className="w-full"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exitIds.map((id) => (
                                                    <SelectItem key={id} value={id}>
                                                        {exitLabels[id]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                            {scene.kind === 'still' && (
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-muted-foreground uppercase">
                                        Length · {(scene.length ?? 3).toFixed(1)} s of film
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Slider
                                            aria-label={`Scene ${String(i + 1)} length`}
                                            min={1}
                                            max={12}
                                            step={0.5}
                                            value={[scene.length ?? 3]}
                                            onValueChange={([v]) => {
                                                if (v !== undefined) patch(i, { length: v });
                                            }}
                                        />
                                        <SecondsInput
                                            value={scene.length ?? 3}
                                            min={0.5}
                                            max={30}
                                            label={`Scene ${String(i + 1)} length in seconds`}
                                            onChange={(length) => {
                                                patch(i, { length });
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            {!last && exit === 'zoom' && (
                                <PortalPicker
                                    scene={scene}
                                    portal={scene.portal ?? DOOR}
                                    onChange={(portal) => {
                                        patch(i, { portal });
                                    }}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
            <input
                ref={stillInput}
                type="file"
                accept="image/webp,image/jpeg,image/png,image/avif"
                className="hidden"
                aria-label="Still image file"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) void addStill(file);
                }}
            />
            <input
                ref={filmInput}
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                aria-label="Scene film file"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) void addFilm(file);
                }}
            />
            <div className="flex flex-wrap gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => {
                        stillInput.current?.click();
                    }}
                >
                    <ImagePlus className="size-3.5" />
                    Add a still
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => {
                        filmInput.current?.click();
                    }}
                >
                    <Clapperboard className="size-3.5" />
                    Add a film
                </Button>
            </div>
            {busy && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    {busy}
                </p>
            )}
        </div>
    );
}
