// The Film opening's clip: uploaded by the studio, with stills of its first and last frames drawn
// here in the browser (the server never decodes video), and the moment the names rise.
import { FILM_MAX_BYTES, FILM_STILL_MAX_WIDTH, filmMimes } from '@shared/film';
import { photoUrl } from '@shared/photos';
import { Clapperboard, Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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

export function FilmPanel({ invitationId, film, onChange }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const preview = useRef<HTMLVideoElement>(null);
    const [busy, setBusy] = useState(false);
    const [duration, setDuration] = useState(0);

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
            onChange({
                src,
                first,
                last,
                namesAt: Math.round(stills.duration * DEFAULT_NAMES_AT * 10) / 10,
            });
            toast.success('Film added');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setBusy(false);
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
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                            input.current?.click();
                        }}
                    >
                        {busy && <Loader2 className="size-3.5 animate-spin" />}
                        Replace film
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
