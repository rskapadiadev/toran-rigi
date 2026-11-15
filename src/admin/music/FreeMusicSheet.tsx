// Find free music (Openverse, commercial-use licences only) and add it to the studio library.
import type { StockAsset } from '@shared/stock';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { MusicTrack } from '@/admin/composer/MusicPanel';
import { StockSearch } from '@/admin/stock/StockSearch';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { ApiError, post } from '@/lib/api';

interface FreeMusicSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Called with the library track once the pick is stored. */
    onAdded?: (track: MusicTrack) => void;
    initialQuery?: string;
}

export function FreeMusicSheet({ open, onOpenChange, onAdded, initialQuery }: FreeMusicSheetProps) {
    const client = useQueryClient();
    const add = useMutation({
        mutationFn: (asset: StockAsset) =>
            post<{ track: MusicTrack }>('/admin/music/from-stock', { id: asset.providerId }),
        onSuccess: async ({ track }) => {
            toast.success(`“${track.title}” added to the library`);
            await client.invalidateQueries({ queryKey: ['music-tracks'] });
            onAdded?.(track);
            onOpenChange(false);
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not add the track'),
    });
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full gap-0 sm:max-w-lg">
                <SheetHeader className="border-b">
                    <SheetTitle>Find free music</SheetTitle>
                    <SheetDescription>
                        Creative Commons music cleared for commercial use. The artist and licence
                        are kept with the track.
                    </SheetDescription>
                </SheetHeader>
                <div className="@container min-h-0 flex-1 p-4">
                    {open && (
                        <StockSearch
                            kinds={['audio']}
                            initialQuery={initialQuery}
                            onPick={(asset) => {
                                add.mutate(asset);
                            }}
                            className="h-full"
                        />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
