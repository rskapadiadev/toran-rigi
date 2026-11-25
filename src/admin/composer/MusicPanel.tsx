// Background music for one invitation: none, a licensed studio track, the customer's own song, or
// music generated from the invitation's seed. Every option can be auditioned before choosing.
import { cultureOf } from '@shared/cultures';
import {
    musicMimes,
    type MusicSource,
    type MusicStyle,
    musicStyleInfo,
    musicStyles,
    musicUrl,
} from '@shared/music';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Check, Search, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { api, ApiError, upload } from '@/lib/api';
import { cn } from '@/lib/utils';

import { cultureLabel } from '../labels';
import { FreeMusicSheet } from '../music/FreeMusicSheet';
import { PreviewButton, usePreview } from '../music/preview';
import type { Draft } from './draft';

export interface MusicTrack {
    id: string;
    title: string;
    artist: string | null;
    culture: string | null;
    blobKey: string;
    licenseUrl: string;
    durationSec: number | null;
    isActive: boolean;
}

type Music = NonNullable<Draft['extras']['music']>;

interface SourceOption {
    id: MusicSource;
    label: string;
}

const sources: SourceOption[] = [
    {
        id: 'none',
        label: 'None',
    },
    {
        id: 'library',
        label: 'Library',
    },
    {
        id: 'upload',
        label: 'Their song',
    },
    {
        id: 'generated',
        label: 'Generated',
    },
];

// Where tracks come from and songs go: the studio's, or the customer's own invitation.
export interface MusicHome {
    tracks: string;
    upload: string;
    // The studio can search free music and add it to its library.
    studio: boolean;
}

interface MusicPanelProps {
    invitationId: string;
    draft: Draft;
    setMusic: (music: Music) => void;
    home?: MusicHome;
}

export function MusicPanel({ invitationId, draft, setMusic, home }: MusicPanelProps) {
    const at = home ?? {
        tracks: '/admin/music',
        upload: `/admin/invitations/${invitationId}/music`,
        studio: true,
    };
    const music = draft.extras.music ?? {};
    const source: MusicSource = music.source ?? (music.blobKey ? 'upload' : 'none');
    const culture = cultureOf(draft.culture).id;
    const preview = usePreview();
    const [finding, setFinding] = useState(false);
    const tracks = useQuery({
        queryKey: ['music-tracks', at.tracks],
        queryFn: () => api<MusicTrack[]>(at.tracks),
    });

    // The invitation's own tradition first, then everything else.
    const sortedTracks = [...(tracks.data ?? [])].sort(
        (a, b) => Number(b.culture === culture) - Number(a.culture === culture),
    );
    const sortedStyles = [...musicStyles].sort(
        (a, b) =>
            Number(musicStyleInfo[b].suits.includes(culture)) -
            Number(musicStyleInfo[a].suits.includes(culture)),
    );

    return (
        <div className="space-y-4">
            <ToggleGroup
                type="single"
                variant="outline"
                value={source}
                onValueChange={(v) => {
                    if (!v) return;
                    preview.stop();
                    setMusic({
                        ...music,
                        source: v as MusicSource,
                    });
                }}
                className="w-full"
            >
                {/* Labels only: four segments with icons do not fit the Composer's narrow column. */}
                {sources.map(({ id, label }) => (
                    <ToggleGroupItem key={id} value={id} className="flex-1 px-1">
                        {id === 'upload' && !at.studio ? 'My song' : label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>

            {source === 'none' && (
                <p className="text-sm text-muted-foreground">
                    No background music. The music button stays hidden.
                </p>
            )}

            {source === 'library' && at.studio && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                        setFinding(true);
                    }}
                >
                    <Search /> Find free music
                </Button>
            )}
            <FreeMusicSheet
                open={finding}
                onOpenChange={setFinding}
                onAdded={(track) => {
                    setMusic({
                        ...music,
                        source: 'library',
                        trackId: track.id,
                        blobKey: track.blobKey,
                        title: track.title,
                    });
                }}
            />
            {source === 'library' &&
                (sortedTracks.length === 0 ? (
                    <p className="rounded-control border border-dashed p-4 text-sm text-muted-foreground">
                        No tracks in the library yet.
                        {at.studio && (
                            <>
                                {' '}
                                <Link
                                    to="/admin/music"
                                    className="text-primary underline underline-offset-4"
                                >
                                    Add licensed music
                                </Link>
                                .
                            </>
                        )}
                    </p>
                ) : (
                    <ul className="grid gap-2">
                        {sortedTracks.map((track) => {
                            const chosen = music.trackId === track.id;
                            return (
                                <li key={track.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMusic({
                                                ...music,
                                                source: 'library',
                                                trackId: track.id,
                                                blobKey: track.blobKey,
                                                title: track.title,
                                            });
                                        }}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-control border p-2 text-start transition-colors hover:bg-muted',
                                            chosen && 'border-primary bg-primary/5',
                                        )}
                                    >
                                        <PreviewButton
                                            on={preview.playing === track.id}
                                            label={track.title}
                                            onClick={() =>
                                                void preview.toggle(track.id, {
                                                    kind: 'file',
                                                    src: musicUrl(track.blobKey),
                                                })
                                            }
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium">
                                                {track.title}
                                            </span>
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {[
                                                    track.artist,
                                                    track.culture
                                                        ? cultureLabel[track.culture]
                                                        : 'Any tradition',
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </span>
                                        </span>
                                        {chosen && <Check className="size-4 text-primary" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ))}

            {source === 'upload' && (
                <OwnSong
                    uploadTo={at.upload}
                    studio={at.studio}
                    music={music}
                    playing={preview.playing === 'upload'}
                    onPreview={(src) =>
                        void preview.toggle('upload', {
                            kind: 'file',
                            src,
                        })
                    }
                    onUploaded={(next) => {
                        preview.stop();
                        setMusic(next);
                    }}
                />
            )}

            {source === 'generated' && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                        Played live from this invitation’s seed: every couple’s tune is their own,
                        and there is nothing to license.
                    </p>
                    <ul className="grid gap-2 @md:grid-cols-2">
                        {sortedStyles.map((style: MusicStyle) => {
                            const info = musicStyleInfo[style];
                            const chosen = music.style === style;
                            return (
                                <li key={style}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMusic({
                                                ...music,
                                                source: 'generated',
                                                style,
                                            });
                                        }}
                                        className={cn(
                                            'flex w-full items-start gap-3 rounded-control border p-2.5 text-start transition-colors hover:bg-muted',
                                            chosen && 'border-primary bg-primary/5',
                                        )}
                                    >
                                        <PreviewButton
                                            on={preview.playing === style}
                                            label={info.label}
                                            onClick={() =>
                                                void preview.toggle(style, {
                                                    kind: 'generated',
                                                    style,
                                                    seed: draft.seed,
                                                })
                                            }
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2 text-sm font-medium">
                                                {info.label}
                                                {info.gentle && (
                                                    <Badge variant="muted" className="font-normal">
                                                        Gentle
                                                    </Badge>
                                                )}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {info.hint}
                                            </span>
                                        </span>
                                        {chosen && <Check className="mt-1 size-4 text-primary" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {source !== 'none' && (
                <p className="text-xs text-muted-foreground">
                    Starts on the guest’s first tap. Muslim invitations and remembrance occasions
                    start silent; guests can still tap the music button.
                </p>
            )}
        </div>
    );
}

interface OwnSongProps {
    uploadTo: string;
    studio: boolean;
    music: Music;
    playing: boolean;
    onPreview: (src: string) => void;
    onUploaded: (music: Music) => void;
}

interface StoredSong {
    blobKey: string;
    title: string;
    rightsConfirmedAt: string;
}

// B: the couple's own song. Shared invitations are public, so the rights are confirmed first.
function OwnSong({ uploadTo, studio, music, playing, onPreview, onUploaded }: OwnSongProps) {
    const [file, setFile] = useState<File | null>(null);
    const [rights, setRights] = useState(false);
    const send = useMutation({
        mutationFn: () => {
            const form = new FormData();
            if (file) form.set('file', file);
            form.set('rights', rights ? 'yes' : 'no');
            return upload<StoredSong>(uploadTo, form);
        },
        onSuccess: (res) => {
            toast.success('Song uploaded — save to keep it');
            setFile(null);
            onUploaded({
                ...music,
                source: 'upload',
                trackId: undefined,
                blobKey: res.blobKey,
                title: res.title,
                rightsConfirmedAt: res.rightsConfirmedAt,
            });
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Upload failed'),
    });
    const current = music.source === 'upload' || !music.source ? music.blobKey : undefined;

    return (
        <div className="space-y-3">
            {current && (
                <div className="flex items-center gap-3 rounded-control border p-2">
                    <PreviewButton
                        on={playing}
                        label={music.title ?? 'this song'}
                        onClick={() => {
                            onPreview(musicUrl(current));
                        }}
                    />
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                            {music.title ?? (studio ? 'Their song' : 'Your song')}
                        </span>
                        {music.rightsConfirmedAt && (
                            <span className="block text-xs text-muted-foreground">
                                Rights confirmed{' '}
                                {new Date(music.rightsConfirmedAt).toLocaleDateString()}
                            </span>
                        )}
                    </span>
                </div>
            )}
            <input
                type="file"
                accept={musicMimes.join(',')}
                aria-label="Choose a song"
                onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                }}
                className="block w-full text-sm file:me-3 file:h-8 file:rounded-control file:border file:border-border file:bg-background file:px-3 file:text-sm file:font-medium"
            />
            <Label className="flex items-start gap-2.5 text-sm leading-snug font-normal">
                <Checkbox
                    checked={rights}
                    onCheckedChange={(v) => {
                        setRights(v === true);
                    }}
                    className="mt-0.5"
                />
                {studio
                    ? 'The couple or the studio holds the right to use this song in a shared, public invitation.'
                    : 'I have the right to use this song in an invitation I share.'}
            </Label>
            <Button
                type="button"
                disabled={!file || !rights || send.isPending}
                onClick={() => {
                    send.mutate();
                }}
            >
                <Upload />
                {send.isPending ? 'Uploading…' : current ? 'Replace song' : 'Upload song'}
            </Button>
            <p className="text-xs text-muted-foreground">
                MP3, M4A, AAC, OGG, WAV or WebM, up to 15 MB.
            </p>
        </div>
    );
}
