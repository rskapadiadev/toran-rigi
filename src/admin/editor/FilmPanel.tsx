// The Film opening's clip: uploaded by the studio, with stills of its first and last frames drawn
// here in the browser (the server never decodes video), and the moment the names rise.
import {
    FILM_MAX_BYTES,
    FILM_STILL_MAX_WIDTH,
    filmMimes,
    FRAME_WIDTH,
    FRAMES_FPS,
    FRAMES_GRID,
} from '@shared/film';
import { photoUrl } from '@shared/photos';
import { Clapperboard, Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ApiError } from '@/lib/api';

import type { Draft } from '../composer/draft';
import { FormField } from '../kit/form';

type Film = NonNullable<Draft['design']['film']>;

interface Props {
    invitationId: string;
    film: Film | undefined;
    onChange: (film: Film | undefined) => void;
}

const DEFAULT_NAMES_AT = 0.55;
const EDGE = 0.05;

interface UploadResult {
    key: string;
}

async function send(endpoint: string, file: Blob, name: string) {
    const body = new FormData();
    body.append('file', file, name);
    const res = await fetch(endpoint, {
        method: 'POST',
        body,
        credentials: 'include',
    });
    if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new ApiError(err.error ?? 'Upload failed', res.status);
    }
    return (await res.json<UploadResult>()).key;
}

function seek(video: HTMLVideoElement, time: number) {
    return new Promise<void>((resolve, reject) => {
        video.onseeked = () => {
            resolve();
        };
        video.onerror = () => {
            reject(new Error('This browser cannot read the film'));
        };
        video.currentTime = time;
    });
}

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

function loadVideo(src: string) {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = src;
    return new Promise<HTMLVideoElement>((resolve, reject) => {
        video.onloadeddata = () => {
            resolve(video);
        };
        video.onerror = () => {
            reject(new Error('This browser cannot play the film; try an H.264 MP4'));
        };
    });
}

const toWebp = (canvas: HTMLCanvasElement) =>
    new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Could not draw the frames'));
            },
            'image/webp',
            0.8,
        );
    });

interface CutFrames {
    sheets: Blob[];
    count: number;
    height: number;
}

// Cuts the film into frames (15 a second, 540 wide) packed 3×3 per sheet, for the film behind the
// invitation: guests scroll through pictures, which every phone handles smoothly.
async function framesOf(src: string, progress: (done: number, total: number) => void) {
    const video = await loadVideo(src);
    const count = Math.max(1, Math.floor(video.duration * FRAMES_FPS));
    const height = Math.round((FRAME_WIDTH * video.videoHeight) / video.videoWidth);
    const per = FRAMES_GRID * FRAMES_GRID;
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_WIDTH * FRAMES_GRID;
    canvas.height = height * FRAMES_GRID;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not draw the frames');
    const sheets: Blob[] = [];
    for (let s = 0; s * per < count; s++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let k = 0; k < per && s * per + k < count; k++) {
            const i = s * per + k;
            await seek(video, i / FRAMES_FPS);
            ctx.drawImage(
                video,
                (k % FRAMES_GRID) * FRAME_WIDTH,
                Math.floor(k / FRAMES_GRID) * height,
                FRAME_WIDTH,
                height,
            );
            progress(i + 1, count);
        }
        sheets.push(await toWebp(canvas));
    }
    const cut: CutFrames = {
        sheets,
        count,
        height,
    };
    return cut;
}

export function FilmPanel({ invitationId, film, onChange }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const preview = useRef<HTMLVideoElement>(null);
    const [busy, setBusy] = useState(false);
    const [duration, setDuration] = useState(0);
    const [cutting, setCutting] = useState<string | null>(null);

    // Cuts and uploads the frame sheets, returning the film with them attached.
    const withFrames = async (base: Film, src: string): Promise<Film> => {
        const cut = await framesOf(src, (done, total) => {
            setCutting(`Cutting frames ${String(done)} of ${String(total)}`);
        });
        setCutting('Uploading frames');
        const sheets: string[] = [];
        for (const [i, blob] of cut.sheets.entries())
            sheets.push(
                await send(`/api/admin/photos/${invitationId}`, blob, `frames-${String(i)}.webp`),
            );
        return {
            ...base,
            behind: true,
            frames: {
                sheets,
                fps: FRAMES_FPS,
                count: cut.count,
                cols: FRAMES_GRID,
                rows: FRAMES_GRID,
                width: FRAME_WIDTH,
                height: cut.height,
            },
        };
    };

    const setBehind = async (on: boolean) => {
        if (!film) return;
        if (!on) {
            onChange({
                ...film,
                behind: false,
                frames: undefined,
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
