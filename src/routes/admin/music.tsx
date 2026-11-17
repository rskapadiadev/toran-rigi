import { cultureIds } from '@shared/cultures';
import { musicMimes } from '@shared/music';
import { can } from '@shared/permissions';
import { PIXABAY_LICENSE_URL } from '@shared/stock';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, Music, Search, Upload } from 'lucide-react';
import { type SyntheticEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { MusicTrack } from '@/admin/composer/MusicPanel';
import { PanelCard } from '@/admin/kit/card';
import { DataTable, inFilter, SortHeader } from '@/admin/kit/data-table';
import { FormField } from '@/admin/kit/form';
import { EmptyState, PageSkeleton, ToneBadge } from '@/admin/kit/page';
import { cultureLabel } from '@/admin/labels';
import { FreeMusicSheet } from '@/admin/music/FreeMusicSheet';
import { PreviewButton, usePreview } from '@/admin/music/preview';
import { useMe } from '@/admin/useMe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { api, ApiError, patch, upload } from '@/lib/api';

export const Route = createFileRoute('/admin/music')({ component: MusicPage });

const TITLE = 'Music';
const SUBTITLE = 'Licensed tracks the studio can add to any invitation.';
const ANY = '__any';

const duration = (s: number | null) =>
    s ? `${String(Math.floor(s / 60))}:${String(s % 60).padStart(2, '0')}` : '—';

// The length of an audio file, read in the browser before upload.
function readDuration(file: File): Promise<number | undefined> {
    return new Promise((resolve) => {
        const audio = new Audio();
        const url = URL.createObjectURL(file);
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve(Number.isFinite(audio.duration) ? Math.round(audio.duration) : undefined);
        };
        audio.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(undefined);
        };
        audio.src = url;
    });
}

function MusicPage() {
    const client = useQueryClient();
    const me = useMe();
    // Everyone can browse and preview; only owners change the library (the API enforces the same).
    const canManage = can(me.data?.role, 'catalog.manage');
    const preview = usePreview();
    const [adding, setAdding] = useState(false);
    const [finding, setFinding] = useState(false);
    const { data, isPending } = useQuery({
        queryKey: ['music-tracks', 'all'],
        queryFn: () => api<MusicTrack[]>('/admin/music?all=1'),
    });
    const { mutate: toggleActive } = useMutation({
        mutationFn: (t: MusicTrack) => patch(`/admin/music/${t.id}`, { isActive: !t.isActive }),
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: ['music-tracks'] });
        },
        onError: (e) =>
            toast.error(e instanceof ApiError ? e.message : 'Could not update the track'),
    });

    const columns = useMemo<ColumnDef<MusicTrack>[]>(
        () => [
            {
                id: 'play',
                header: '',
                enableSorting: false,
                cell: ({ row }) => (
                    <PreviewButton
                        on={preview.playing === row.original.id}
                        label={row.original.title}
                        onClick={() =>
                            void preview.toggle(row.original.id, {
                                kind: 'file',
                                src: `/media/${row.original.blobKey}`,
                            })
                        }
                    />
                ),
            },
            {
                accessorKey: 'title',
                header: ({ column }) => <SortHeader column={column} title="Title" />,
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">{row.original.title}</div>
                        {row.original.artist && (
                            <div className="text-xs text-muted-foreground">
                                {row.original.artist}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                id: 'tradition',
                accessorFn: (t) => t.culture ?? 'any',
                header: 'Tradition',
                filterFn: inFilter,
                cell: ({ row }) =>
                    row.original.culture
                        ? (cultureLabel[row.original.culture] ?? row.original.culture)
                        : 'Any',
            },
            {
                accessorKey: 'durationSec',
                header: 'Length',
                cell: ({ row }) => (
                    <span className="tabular-nums">{duration(row.original.durationSec)}</span>
                ),
            },
            {
                id: 'licence',
                header: 'Licence',
                cell: ({ row }) => (
                    <a
                        href={row.original.licenseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        View <ExternalLink className="size-3.5" />
                    </a>
                ),
            },
            {
                id: 'status',
                accessorFn: (t) => (t.isActive ? 'active' : 'retired'),
                header: 'Status',
                filterFn: inFilter,
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <ToneBadge tone={row.original.isActive ? 'success' : 'muted'}>
                            {row.original.isActive ? 'Active' : 'Retired'}
                        </ToneBadge>
                        {canManage && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    toggleActive(row.original);
                                }}
                            >
                                {row.original.isActive ? 'Retire' : 'Restore'}
                            </Button>
                        )}
                    </div>
                ),
            },
        ],
        [preview, canManage, toggleActive],
    );

    const add = (
        <>
            <Button
                variant="outline"
                onClick={() => {
                    setFinding(true);
                }}
            >
                <Search /> Find free music
            </Button>
            {canManage && (
                <Button
                    onClick={() => {
                        setAdding(true);
                    }}
                >
                    <Upload /> Upload track
                </Button>
            )}
        </>
    );
    const rows = data ?? [];

    return (
        <>
            {isPending || rows.length === 0 ? (
                <PanelCard
                    fill
                    contentClassName="flex min-h-[60svh] flex-col lg:min-h-0"
                    title={TITLE}
                    subtitle={SUBTITLE}
                    actions={add}
                >
                    {isPending ? (
                        <PageSkeleton />
                    ) : (
                        <EmptyState
                            className="flex-1"
                            icon={Music}
                            title="No music yet"
                            description="Upload licensed tracks — from Pixabay Music, Free Music Archive, Artlist or your own recordings — with a link to each licence."
                        />
                    )}
                </PanelCard>
            ) : (
                <DataTable
                    title={TITLE}
                    subtitle={SUBTITLE}
                    noun="tracks"
                    actions={add}
                    columns={columns}
                    data={rows}
                    searchPlaceholder="Search tracks, artists…"
                    initialSorting={[
                        {
                            id: 'title',
                            desc: false,
                        },
                    ]}
                    facets={[
                        {
                            columnId: 'tradition',
                            title: 'Tradition',
                            options: [
                                {
                                    value: 'any',
                                    label: 'Any',
                                },
                                ...cultureIds.map((c) => ({
                                    value: c,
                                    label: cultureLabel[c] ?? c,
                                })),
                            ],
                        },
                        {
                            columnId: 'status',
                            title: 'Status',
                            options: [
                                {
                                    value: 'active',
                                    label: 'Active',
                                },
                                {
                                    value: 'retired',
                                    label: 'Retired',
                                },
                            ],
                        },
                    ]}
                />
            )}
            <FreeMusicSheet open={finding} onOpenChange={setFinding} />
            <AddTrack
                open={adding}
                onOpenChange={setAdding}
                onAdded={async () => {
                    setAdding(false);
                    await client.invalidateQueries({ queryKey: ['music-tracks'] });
                }}
            />
        </>
    );
}

interface AddTrackProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdded: () => Promise<void>;
}

function AddTrack({ open, onOpenChange, onAdded }: AddTrackProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [culture, setCulture] = useState(ANY);
    const [licence, setLicence] = useState('');
    const send = useMutation({
        mutationFn: async (form: FormData) => upload<{ ok: true }>('/admin/music', form),
        onSuccess: async () => {
            toast.success('Track added to the library');
            setFile(null);
            setTitle('');
            setCulture(ANY);
            setLicence('');
            await onAdded();
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Upload failed'),
    });

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        if (file) {
            form.set('file', file);
            const seconds = await readDuration(file);
            if (seconds) form.set('durationSec', String(seconds));
        }
        form.set('culture', culture === ANY ? '' : culture);
        send.mutate(form);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md">
                <form onSubmit={(e) => void submit(e)} className="flex h-full flex-col">
                    <SheetHeader className="border-b">
                        <SheetTitle>Upload track</SheetTitle>
                        <SheetDescription>
                            Only music the studio holds a licence for.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        <FormField
                            label="Audio file"
                            description="MP3, M4A, AAC, OGG, WAV or WebM, up to 15 MB."
                        >
                            {(id) => (
                                <input
                                    id={id}
                                    type="file"
                                    required
                                    accept={musicMimes.join(',')}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0] ?? null;
                                        setFile(f);
                                        // Start from the file name; easy to correct.
                                        if (f && !title)
                                            setTitle(
                                                f.name
                                                    .replace(/\.[a-z0-9]+$/i, '')
                                                    .replace(/[-_]+/g, ' '),
                                            );
                                    }}
                                    className="block w-full text-sm file:me-3 file:h-8 file:rounded-control file:border file:border-border file:bg-background file:px-3 file:text-sm file:font-medium"
                                />
                            )}
                        </FormField>
                        <FormField label="Title">
                            {(id) => (
                                <Input
                                    id={id}
                                    name="title"
                                    required
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                    }}
                                />
                            )}
                        </FormField>
                        <FormField label="Artist" description="Optional.">
                            {(id) => <Input id={id} name="artist" />}
                        </FormField>
                        <FormField
                            label="Tradition"
                            description="Shown first for invitations of this tradition."
                        >
                            {(id) => (
                                <Select value={culture} onValueChange={setCulture}>
                                    <SelectTrigger id={id} className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ANY}>Any tradition</SelectItem>
                                        {cultureIds.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {cultureLabel[c] ?? c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </FormField>
                        <FormField
                            label="Licence link"
                            description="Where the licence for this track can be checked."
                        >
                            {(id) => (
                                <div className="space-y-2">
                                    <Input
                                        id={id}
                                        name="licenseUrl"
                                        type="url"
                                        required
                                        placeholder="https://"
                                        dir="ltr"
                                        value={licence}
                                        onChange={(e) => {
                                            setLicence(e.target.value);
                                        }}
                                    />
                                    {/* Pixabay Music has no API: tracks downloaded by hand share one licence. */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setLicence(PIXABAY_LICENSE_URL);
                                        }}
                                    >
                                        Downloaded from Pixabay Music
                                    </Button>
                                </div>
                            )}
                        </FormField>
                    </div>
                    <SheetFooter className="border-t">
                        <Button type="submit" disabled={!file || send.isPending}>
                            <Upload />
                            {send.isPending ? 'Uploading…' : 'Add to library'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
