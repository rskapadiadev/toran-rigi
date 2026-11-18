// The Film opening's clip: uploaded by the studio, with stills of its first and last frames drawn
// here in the browser (the server never decodes video), and the moment the names rise.
import { FILM_MAX_BYTES, FILM_STILL_MAX_WIDTH, filmMimes } from '@shared/film';
import { photoUrl } from '@shared/photos';
import { Clapperboard, Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

import type { Draft } from '../composer/draft';
import { FormField } from '../kit/form';
import { cutFrames, seek, send } from './film-cut';
import { FilmScenes } from './FilmScenes';
import { FilmWords } from './FilmWords';

type Film = NonNullable<Draft['design']['film']>;

interface Props {
    invitationId: string;
    film: Film | undefined;
    // The invitation's languages: words on the film are written in each.
    locales: string[];
    onChange: (film: Film | undefined) => void;
}

const DEFAULT_NAMES_AT = 0.55;
const EDGE = 0.05;

interface Stills {
    first: Blob;
    last: Blob;
    duration: number;
}

// Draws the clip's first and last frames to WebP, at the clip's own size (capped).
async function stillsOf(file: File): Promise<Stills> {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = url;
    try {
        await new Promise<void>((resolve, reject) => {
            video.onloadeddata = () => {
                resolve();
            };
            video.onerror = () => {
                reject(new Error('This browser cannot play the film; try an H.264 MP4'));
            };
        });
        const scale = Math.min(1, FILM_STILL_MAX_WIDTH / video.videoWidth);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        const grab = async (time: number) => {
            await seek(video, time);
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
            return new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Could not draw a still'));
                    },
                    'image/webp',
                    0.82,
                );
            });
        };
        const duration = video.duration;
        const first = await grab(EDGE);
        const last = await grab(Math.max(EDGE, duration - EDGE));
        return {
            first,
            last,
            duration,
        };
    } finally {
        URL.revokeObjectURL(url);
    }
}

export function FilmPanel({ invitationId, film, locales, onChange }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const preview = useRef<HTMLVideoElement>(null);
    const [busy, setBusy] = useState(false);
    const [duration, setDuration] = useState(0);
    const [cutting, setCutting] = useState<string | null>(null);

    // Cuts and uploads the frame sheets, returning the film with them attached.
    const withFrames = async (base: Film, src: string): Promise<Film> => {
        const frames = await cutFrames(invitationId, src, setCutting);
        // Scenes that played the old film now play the new one.
        const old = base.frames?.sheets[0];
        return {
            ...base,
            behind: true,
            frames,
            scenes: base.scenes?.map((scene) =>
                scene.kind === 'film' && scene.frames?.sheets[0] === old
                    ? {
                          ...scene,
                          frames,
                      }
                    : scene,
            ),
        };
    };

    const setBehind = async (on: boolean) => {
        if (!film) return;
        if (!on) {
            onChange({
                ...film,
                behind: false,
                frames: undefined,
                scenes: undefined,
            });
            return;
        }
        setBusy(true);
        try {
            onChange(await withFrames(film, photoUrl(film.src)));
            toast.success(
                'The film now plays behind the invitation, and every section shows it through',
            );
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Could not cut the frames');
        } finally {
            setBusy(false);
            setCutting(null);
        }
    };

    const pick = async (file: File) => {
        if (!(filmMimes as readonly string[]).includes(file.type)) {
            toast.error('Use an MP4 or WebM film');
            return;
        }
        if (file.size > FILM_MAX_BYTES) {
            toast.error(
                `This film is ${(file.size / 1048576).toFixed(1)} MB. Keep it under 12 MB so it opens fast on phones.`,
            );
            return;
        }
        setBusy(true);
        try {
            const stills = await stillsOf(file);
            const [src, first, last] = await Promise.all([
                send(`/api/admin/films/${invitationId}`, file, file.name),
                send(`/api/admin/photos/${invitationId}`, stills.first, 'first.webp'),
                send(`/api/admin/photos/${invitationId}`, stills.last, 'last.webp'),
            ]);
            setDuration(stills.duration);
            const next: Film = {
                src,
                first,
                last,
                namesAt: Math.round(stills.duration * DEFAULT_NAMES_AT * 10) / 10,
            };
            // A replaced film behind the invitation needs its frames cut again.
            if (film?.behind) {
                const local = URL.createObjectURL(file);
                try {
                    onChange(await withFrames(next, local));
                } finally {
                    URL.revokeObjectURL(local);
                }
            } else onChange(next);
            toast.success('Film added');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setBusy(false);
            setCutting(null);
        }
    };

    const namesAt = film?.namesAt ?? duration * DEFAULT_NAMES_AT;

    return (
        <div className="space-y-4 rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-[13px] font-medium">
                    <Clapperboard className="size-4 text-gold-deep" />
                    Film
                </p>
                {film && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onChange(undefined);
                        }}
                    >
                        <Trash2 className="size-3.5" />
                        Remove film
                    </Button>
                )}
            </div>
            <input
                ref={input}
                type="file"
                accept={filmMimes.join(',')}
                className="hidden"
                aria-label="Film file"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) void pick(file);
                }}
            />
            {film ? (
                <>
                    <div className="grid grid-cols-3 gap-2">
                        <figure className="space-y-1">
                            <video
                                ref={preview}
                                src={photoUrl(film.src)}
                                poster={film.first ? photoUrl(film.first) : undefined}
                                muted
                                playsInline
                                preload="auto"
                                aria-label="Film at the moment the names rise"
                                className="aspect-[9/16] w-full rounded-md bg-black object-cover"
                                onLoadedMetadata={(e) => {
                                    const clip = e.currentTarget;
                                    setDuration(clip.duration);
                                    clip.currentTime =
                                        film.namesAt ?? clip.duration * DEFAULT_NAMES_AT;
                                }}
                            />
                            <figcaption className="text-[11px] text-muted-foreground uppercase">
                                Names rise
                            </figcaption>
                        </figure>
                        {(['first', 'last'] as const).map((k) => {
                            const key = film[k];
                            return (
                                <figure key={k} className="space-y-1">
                                    {key ? (
                                        <img
                                            src={photoUrl(key)}
                                            alt={k === 'first' ? 'First frame' : 'Last frame'}
                                            data-film-still={k}
                                            className="aspect-[9/16] w-full rounded-md bg-black object-cover"
                                        />
                                    ) : (
                                        <div className="aspect-[9/16] w-full rounded-md bg-muted" />
                                    )}
                                    <figcaption className="text-[11px] text-muted-foreground uppercase">
                                        {k === 'first' ? 'Before the tap' : 'Becomes the cover'}
                                    </figcaption>
                                </figure>
                            );
                        })}
                    </div>
                    <FormField
                        label={`Names rise at ${namesAt.toFixed(1)} s`}
                        description="Line it up with the film's brightest moment."
                    >
                        {(id) => (
                            <Slider
                                id={id}
                                aria-label="Names rise at"
                                min={0}
                                max={Math.max(0.1, duration)}
                                step={0.1}
                                disabled={duration === 0}
                                value={[namesAt]}
                                onValueChange={([v]) => {
                                    if (v === undefined) return;
                                    if (preview.current) preview.current.currentTime = v;
                                    onChange({
                                        ...film,
                                        namesAt: Math.round(v * 10) / 10,
                                    });
                                }}
                            />
                        )}
                    </FormField>
                    <div className="flex items-start justify-between gap-3 rounded-md bg-muted/50 p-2.5">
                        <div className="space-y-0.5">
                            <label htmlFor="film-behind" className="text-[13px] font-medium">
                                Play behind the whole invitation
                            </label>
                            <p className="text-xs text-muted-foreground">
                                {cutting ??
                                    "Scrolling moves the film. Pick each section's moment under Section, Film moment."}
                            </p>
                        </div>
                        <Switch
                            id="film-behind"
                            checked={Boolean(film.behind && film.frames)}
                            disabled={busy}
                            onCheckedChange={(on) => {
                                void setBehind(on);
                            }}
                        />
                    </div>
                    {film.behind && film.frames && (
                        <>
                            <FilmScenes
                                invitationId={invitationId}
                                film={film}
                                onChange={onChange}
                            />
                            <FilmWords film={film} locales={locales} onChange={onChange} />
                            <div className="flex items-start justify-between gap-3 rounded-md bg-muted/50 p-2.5">
                                <div className="space-y-0.5">
                                    <label
                                        htmlFor="film-settle"
                                        className="text-[13px] font-medium"
                                    >
                                        Settle on each moment
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        When a guest stops scrolling halfway, the film eases on to
                                        the nearer moment. Off by default: some guests find it
                                        pushy.
                                    </p>
                                </div>
                                <Switch
                                    id="film-settle"
                                    checked={film.settle === true}
                                    onCheckedChange={(settle) => {
                                        onChange({
                                            ...film,
                                            settle,
                                        });
                                    }}
                                />
                            </div>
                        </>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                            input.current?.click();
                        }}
                    >
                        {busy && <Loader2 className="size-3.5 animate-spin" />}
                        {cutting ?? 'Replace film'}
                    </Button>
                </>
            ) : (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                        An upright (9:16) MP4 of about 8–10 s, under 12 MB. Its first frame waits
                        for the tap; its last frame becomes the cover. Without a film guests see the
                        diya opening.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                            input.current?.click();
                        }}
                    >
                        {busy && <Loader2 className="size-3.5 animate-spin" />}
                        {busy ? 'Reading the film…' : 'Upload film'}
                    </Button>
                </div>
            )}
        </div>
    );
}
