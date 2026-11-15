import { occasionOf } from '@shared/occasions';
import { PHOTO_MAX_EDGE, photosInUse, photoUrl } from '@shared/photos';
import type { StockAsset } from '@shared/stock';
import { ImagePlus, Loader2, Search, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { StockSearch } from '@/admin/stock/StockSearch';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

import type { Draft } from '../composer/draft';
import { useUploader } from './uploader';

// Resizes in the browser (longest edge 2000px, WebP) so uploads are small even on mobile data.
async function shrink(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Could not read this photo'));
            },
            'image/webp',
            0.84,
        );
    });
}

interface UploadResult {
    key: string;
    url: string;
}

export async function upload(
    invitationId: string,
    file: File,
    endpoint = `/api/admin/photos/${invitationId}`,
): Promise<string> {
    const body = new FormData();
    body.append('file', await shrink(file), 'photo.webp');
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

// The credit a free stock pick needs on the page.
export function withCredit(d: Draft, asset: StockAsset): Draft['extras'] {
    return {
        ...d.extras,
        credits: [
            ...(d.extras.credits ?? []).filter((c) => c.blobKey !== asset.blobKey),
            {
                blobKey: asset.blobKey,
                kind: asset.kind,
                provider: asset.provider,
                title: asset.title,
                creator: asset.creator,
                creatorUrl: asset.creatorUrl,
                sourceUrl: asset.sourceUrl,
                license: asset.license,
                licenseUrl: asset.licenseUrl,
            },
        ],
    };
}

// After a photo leaves one place: keep its credit only while another section still shows it.
export function pruneCredit(d: Draft, key: string): Draft {
    if (photosInUse(d.content).includes(key)) return d;
    return {
        ...d,
        extras: {
            ...d.extras,
            credits: d.extras.credits?.filter((c) => c.blobKey !== key),
        },
    };
}

// Photos left in the package, across every section and the gallery; Infinity for demos.
export const photoRoom = (d: Draft, limit?: number) =>
    limit === undefined ? Infinity : Math.max(0, limit - photosInUse(d.content).length);

export const stockQuery = (d: Draft) =>
    occasionOf(d.occasion).id === 'wedding' ? 'indian wedding' : occasionOf(d.occasion).name.en;

interface PhotosPanelProps {
    invitationId: string;
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
    // From the package; undefined for demos.
    limit?: number;
}

// The Gallery section's own photos. Section frames (cover, letter) are filled in PhotoSlots.
export function PhotosPanel({ invitationId, draft, set, limit }: PhotosPanelProps) {
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(0);
    const [stock, setStock] = useState(false);
    const uploader = useUploader();
    const [dragging, setDragging] = useState<number | null>(null);
    const { gallery } = draft.content;
    const room = photoRoom(draft, limit);
    const used = photosInUse(draft.content).length;

    const add = async (files: FileList | null) => {
        const picked = [...(files ?? [])].slice(0, room === Infinity ? undefined : room);
        if (files && files.length > picked.length)
            toast.message(
                `Your package includes ${String(limit)} photos; extra ones were skipped.`,
            );
        setBusy((n) => n + picked.length);
        for (const file of picked) {
            try {
                const key = uploader
                    ? await uploader.upload(file)
                    : await upload(invitationId, file);
                set((d) => ({
                    ...d,
                    content: {
                        ...d.content,
                        gallery: [...d.content.gallery, key],
                    },
                }));
            } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Upload failed');
            } finally {
                setBusy((n) => n - 1);
            }
        }
    };

    // A free stock pick is already in our storage; add it like an upload and keep its credit.
    const addStock = (asset: StockAsset) => {
        if (room === 0) {
            toast.message(`Your package includes ${String(limit)} photos.`);
            return;
        }
        set((d) => ({
            ...d,
            content: {
                ...d.content,
                gallery: d.content.gallery.includes(asset.blobKey)
                    ? d.content.gallery
                    : [...d.content.gallery, asset.blobKey],
            },
            extras: withCredit(d, asset),
        }));
        toast.success('Added to the gallery');
    };

    const remove = (key: string) => {
        set((d) =>
            pruneCredit(
                {
                    ...d,
                    content: {
                        ...d.content,
                        gallery: d.content.gallery.filter((k) => k !== key),
                    },
                },
                key,
            ),
        );
    };

    const move = (from: number, to: number) => {
        set((d) => {
            const next = [...d.content.gallery];
            const [item] = next.splice(from, 1);
            if (item) next.splice(to, 0, item);
            return {
                ...d,
                content: {
                    ...d.content,
                    gallery: next,
                },
            };
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-medium">Gallery photos</p>
                <p className="text-xs text-muted-foreground">
                    Shown only in the Gallery section. Drag to reorder.
                    {limit !== undefined &&
                        ` ${String(used)} of ${String(limit)} photos used across the invitation.`}
                </p>
            </div>
            <input
                ref={input}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                    void add(e.target.files);
                    e.target.value = '';
                }}
            />
            <Button
                variant="outline"
                className="w-full border-dashed"
                disabled={room === 0 || busy > 0}
                onClick={() => input.current?.click()}
            >
                {busy > 0 ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                {busy > 0 ? `Uploading ${String(busy)}…` : 'Add photos'}
            </Button>
            {(uploader?.stock ?? true) && (
                <Button
                    variant={stock ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full"
                    onClick={() => {
                        setStock((v) => !v);
                    }}
                >
                    <Search /> {stock ? 'Hide free stock photos' : 'Free stock photos'}
                </Button>
            )}
            {stock && (
                // StockSearch needs a container (grid breakpoints) and a bounded height (it scrolls).
                <div className="@container h-[420px] overflow-hidden rounded-lg border">
                    <StockSearch
                        kinds={['photo', 'illustration']}
                        initialQuery={stockQuery(draft)}
                        onPick={addStock}
                        className="h-full"
                    />
                </div>
            )}
            {gallery.length > 0 && (
                <ul className="grid grid-cols-3 gap-2">
                    {gallery.map((key, i) => {
                        return (
                            <li
                                key={key}
                                draggable
                                onDragStart={() => {
                                    setDragging(i);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}
                                onDrop={() => {
                                    if (dragging !== null) move(dragging, i);
                                    setDragging(null);
                                }}
                                className={cn(
                                    'group relative aspect-square overflow-hidden rounded-md ring-1 ring-border',
                                    dragging === i && 'opacity-50',
                                )}
                            >
                                <img
                                    src={photoUrl(key)}
                                    alt=""
                                    className="size-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                                    <button
                                        type="button"
                                        aria-label="Remove photo"
                                        onClick={() => {
                                            remove(key);
                                        }}
                                        className="rounded p-1 text-white hover:bg-white/20"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
