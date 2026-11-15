import { COVER_SLOT, type PhotoSlot, photoUrl, slotPhoto } from '@shared/photos';
import type { StockAsset } from '@shared/stock';
import { ImagePlus, Loader2, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { StockSearch } from '@/admin/stock/StockSearch';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import type { Draft } from '../composer/draft';
import { photoRoom, pruneCredit, stockQuery, upload, withCredit } from './PhotosPanel';
import { useUploader } from './uploader';

// Puts one photo in one frame (undefined empties it).
function placeIn(d: Draft, slot: string, key: string | undefined): Draft {
    if (slot === COVER_SLOT)
        return {
            ...d,
            content: {
                ...d.content,
                coverPhotoKey: key,
            },
        };
    const slots = Object.fromEntries(
        Object.entries(d.content.photoSlots ?? {}).filter(([id]) => id !== slot),
    );
    if (key) slots[slot] = key;
    return {
        ...d,
        content: {
            ...d.content,
            photoSlots: slots,
        },
    };
}

interface PhotoSlotsProps {
    invitationId: string;
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
    slots: readonly PhotoSlot[];
    limit?: number;
    // The frame clicked on the canvas: highlighted and scrolled to.
    focus?: string;
}

// One labelled card per frame of a section ("Left polaroid", "Top-right photo"…), each its own photo.
export function PhotoSlots({ invitationId, draft, set, slots, limit, focus }: PhotoSlotsProps) {
    const [busy, setBusy] = useState<string | null>(null);
    const [stockFor, setStockFor] = useState<PhotoSlot | null>(null);
    const input = useRef<HTMLInputElement>(null);
    const target = useRef<string | null>(null);
    const focused = useRef<HTMLLIElement>(null);
    const uploader = useUploader();

    useEffect(() => {
        focused.current?.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth',
        });
    }, [focus]);

    // Replacing a frame's photo frees its place, so only empty frames need room in the package.
    const hasRoom = (slot: string) =>
        Boolean(slotPhoto(draft.content, slot)) || photoRoom(draft, limit) > 0;

    const put = (slot: string, key: string | undefined) => {
        set((d) => {
            const old = slotPhoto(d.content, slot);
            const next = placeIn(d, slot, key);
            return old && old !== key ? pruneCredit(next, old) : next;
        });
    };

    const onFile = async (file: File | undefined) => {
        const slot = target.current;
        if (!file || !slot) return;
        setBusy(slot);
        try {
            put(slot, uploader ? await uploader.upload(file) : await upload(invitationId, file));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setBusy(null);
        }
    };

    const pickStock = (asset: StockAsset) => {
        if (!stockFor) return;
        const slot = stockFor.id;
        set((d) => {
            const old = slotPhoto(d.content, slot);
            const placed = placeIn(d, slot, asset.blobKey);
            const next = {
                ...placed,
                extras: withCredit(placed, asset),
            };
            return old && old !== asset.blobKey ? pruneCredit(next, old) : next;
        });
        setStockFor(null);
    };

    const full = () => {
        toast.message(`Your package includes ${String(limit)} photos.`);
    };

    return (
        <>
            <input
                ref={input}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                    void onFile(e.target.files?.[0]);
                    e.target.value = '';
                }}
            />
            <ul className="space-y-2">
                {slots.map((slot) => {
                    const key = slotPhoto(draft.content, slot.id);
                    const active = focus === slot.id;
                    return (
                        <li
                            key={slot.id}
                            ref={active ? focused : undefined}
                            className={cn(
                                'flex gap-3 rounded-lg border p-2 transition',
                                active && 'border-primary ring-2 ring-primary/30',
                            )}
                        >
                            <button
                                type="button"
                                aria-label={`${key ? 'Replace' : 'Add'} ${slot.label}`}
                                disabled={busy !== null}
                                onClick={() => {
                                    if (!hasRoom(slot.id)) {
                                        full();
                                        return;
                                    }
                                    target.current = slot.id;
                                    input.current?.click();
                                }}
                                className={cn(
                                    'flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md',
                                    key
                                        ? 'ring-1 ring-border'
                                        : 'border border-dashed text-muted-foreground hover:bg-muted',
                                )}
                            >
                                {busy === slot.id ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : key ? (
                                    <img
                                        src={photoUrl(key)}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <ImagePlus className="size-5" />
                                )}
                            </button>
                            <div className="flex min-w-0 flex-1 flex-col">
                                <p className="text-sm font-medium">{slot.label}</p>
                                <p className="text-xs text-muted-foreground">{slot.hint}</p>
                                <div className="mt-auto flex gap-1 pt-1">
                                    {(uploader?.stock ?? true) && (
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={() => {
                                                if (!hasRoom(slot.id)) {
                                                    full();
                                                    return;
                                                }
                                                setStockFor(slot);
                                            }}
                                        >
                                            <Search /> Free stock
                                        </Button>
                                    )}
                                    {key && (
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            className="text-destructive"
                                            onClick={() => {
                                                put(slot.id, undefined);
                                            }}
                                        >
                                            <Trash2 /> Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <Dialog
                open={stockFor !== null}
                onOpenChange={(open) => {
                    if (!open) setStockFor(null);
                }}
            >
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{stockFor?.label}</DialogTitle>
                        <DialogDescription>
                            Free photos, credited on the invitation as their licence asks.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="@container h-[60vh]">
                        <StockSearch
                            kinds={['photo', 'illustration']}
                            initialQuery={stockQuery(draft)}
                            onPick={pickStock}
                            className="h-full"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
