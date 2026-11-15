// Free stock search for anywhere in the studio: photos, illustrations, vectors and videos from
// Pixabay, Creative Commons photos and music from Openverse. Picking imports the item into our own
// storage (with its credit) and hands the stored asset back:
//
//     <StockSearch kinds={['photo', 'vector']} onPick={(asset) => …} />
import {
    providersFor,
    type StockAsset,
    type StockKind,
    type StockPage,
    type StockProvider,
    type StockResult,
} from '@shared/stock';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ExternalLink, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { api, ApiError, post } from '@/lib/api';
import { cn } from '@/lib/utils';

import { PreviewButton, usePreview } from '../music/preview';

const kindLabel: Record<StockKind, string> = {
    photo: 'Photos',
    illustration: 'Illustrations',
    vector: 'Vectors',
    video: 'Videos',
    audio: 'Music',
};

const providerLabel: Record<StockProvider, string> = {
    pixabay: 'Pixabay',
    openverse: 'Openverse',
};

const minutes = (s?: number) =>
    s ? `${String(Math.floor(s / 60))}:${String(s % 60).padStart(2, '0')}` : '';

function useDebounced<T>(value: T, ms: number): T {
    const [settled, setSettled] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => {
            setSettled(value);
        }, ms);
        return () => {
            clearTimeout(t);
        };
    }, [value, ms]);
    return settled;
}

interface StockSearchProps {
    kinds: StockKind[];
    onPick: (asset: StockAsset) => void;
    /** Starting words, e.g. the occasion: "wedding", "diya". */
    initialQuery?: string;
    className?: string;
}

export function StockSearch({ kinds, onPick, initialQuery = '', className }: StockSearchProps) {
    const [kind, setKind] = useState<StockKind>(kinds[0] ?? 'photo');
    const [query, setQuery] = useState(initialQuery);
    const q = useDebounced(query.trim(), 400);
    const providers = useQuery({
        queryKey: ['stock-providers'],
        queryFn: () => api<Record<StockProvider, boolean>>('/admin/stock/providers'),
        staleTime: Infinity,
    });
    const available = providersFor[kind];
    // Pixabay first when its key is set; otherwise the first provider that is on.
    const [chosen, setChosen] = useState<StockProvider | null>(null);
    const provider: StockProvider =
        chosen && available.includes(chosen)
            ? chosen
            : (available.find((p) => providers.data?.[p] !== false) ?? available[0] ?? 'openverse');
    const providerOn = providers.data?.[provider] !== false;
    const preview = usePreview();

    const search = useInfiniteQuery({
        queryKey: ['stock', provider, kind, q],
        enabled: providerOn && q.length > 0,
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            api<StockPage>(
                `/admin/stock/search?${new URLSearchParams({
                    provider,
                    kind,
                    q,
                    page: String(pageParam),
                }).toString()}`,
            ),
        getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    });
    const results = search.data?.pages.flatMap((p) => p.results) ?? [];

    const pick = useMutation({
        mutationFn: (r: StockResult) =>
            post<{ asset: StockAsset }>('/admin/stock/import', {
                provider: r.provider,
                kind: r.kind,
                id: r.id,
            }),
        onSuccess: ({ asset }) => {
            preview.stop();
            onPick(asset);
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Import failed'),
    });
    const busyId = pick.isPending ? pick.variables.id : null;

    return (
        <div className={cn('flex min-h-0 flex-col gap-3', className)}>
            {kinds.length > 1 && (
                <Tabs
                    value={kind}
                    onValueChange={(v) => {
                        preview.stop();
                        setKind(v as StockKind);
                    }}
                >
                    <TabsList className="w-full">
                        {kinds.map((k) => (
                            <TabsTrigger key={k} value={k}>
                                {kindLabel[k]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}
            <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="min-w-0 flex-1">
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        aria-label={`Search free ${kindLabel[kind].toLowerCase()}`}
                        placeholder={`Search free ${kindLabel[kind].toLowerCase()}…`}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}
                    />
                </InputGroup>
                {available.length > 1 && (
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={provider}
                        onValueChange={(v) => {
                            if (v) setChosen(v as StockProvider);
                        }}
                    >
                        {available.map((p) => (
                            <ToggleGroupItem key={p} value={p} className="px-3">
                                {providerLabel[p]}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                )}
            </div>

            <div className="min-h-48 flex-1 overflow-y-auto">
                {!providerOn ? (
                    <p className="rounded-control border border-dashed p-4 text-sm text-muted-foreground">
                        Pixabay search needs a free API key. Add <code>PIXABAY_API_KEY</code> to the
                        server settings (find yours at{' '}
                        <a
                            href="https://pixabay.com/api/docs/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline underline-offset-4"
                        >
                            pixabay.com/api/docs
                        </a>
                        ).{available.length > 1 ? ' Openverse works now.' : ''}
                    </p>
                ) : q.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                        Type to search free {kindLabel[kind].toLowerCase()}.
                    </p>
                ) : search.isPending ? (
                    <p className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> Searching…
                    </p>
                ) : search.isError ? (
                    <p className="p-4 text-sm text-destructive">
                        {search.error instanceof ApiError ? search.error.message : 'Search failed'}
                    </p>
                ) : results.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                        Nothing found — try a simpler word.
                    </p>
                ) : kind === 'audio' ? (
                    <ul className="grid gap-1.5">
                        {results.map((r) => (
                            <li
                                key={r.id}
                                className="flex items-center gap-3 rounded-control border p-2"
                            >
                                <PreviewButton
                                    on={preview.playing === r.id}
                                    label={r.title}
                                    onClick={() =>
                                        void preview.toggle(r.id, {
 kind: 'file',
src: r.preview 
})
                                    }
                                />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium">
                                        {r.title}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                        {r.creator} · {r.license}
                                        {r.durationSec ? ` · ${minutes(r.durationSec)}` : ''}
                                    </span>
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={busyId !== null}
                                    onClick={() => {
                                        pick.mutate(r);
                                    }}
                                >
                                    {busyId === r.id ? <Loader2 className="animate-spin" /> : null}
                                    Use
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="grid grid-cols-2 gap-2 @md:grid-cols-3 @2xl:grid-cols-4">
                        {results.map((r) => (
                            <li key={`${r.provider}-${r.id}`}>
                                <button
                                    type="button"
                                    disabled={busyId !== null}
                                    onClick={() => {
                                        pick.mutate(r);
                                    }}
                                    title={`${r.title} — ${r.creator} · ${r.license}`}
                                    className="group relative block aspect-[4/3] w-full overflow-hidden rounded-control bg-muted ring-1 ring-foreground/10 transition hover:ring-2 hover:ring-primary disabled:opacity-60"
                                >
                                    {kind === 'video' ? (
                                        <video
                                            src={r.preview}
                                            poster={r.thumbnail || undefined}
                                            muted
                                            loop
                                            playsInline
                                            preload="none"
                                            onMouseEnter={(e) =>
                                                void e.currentTarget.play().catch(() => undefined)
                                            }
                                            onMouseLeave={(e) => {
                                                e.currentTarget.pause();
                                            }}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={r.thumbnail || r.preview}
                                            alt={r.title}
                                            loading="lazy"
                                            className={cn(
                                                'size-full',
                                                kind === 'vector' || kind === 'illustration'
                                                    ? 'object-contain p-2'
                                                    : 'object-cover',
                                            )}
                                        />
                                    )}
                                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-1 text-start text-[11px] text-white opacity-0 transition group-hover:opacity-100">
                                        {r.creator}
                                        {r.durationSec ? ` · ${minutes(r.durationSec)}` : ''}
                                    </span>
                                    {busyId === r.id && (
                                        <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                                            <Loader2 className="size-5 animate-spin" />
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {search.hasNextPage && (
                    <div className="flex justify-center p-3">
                        <Button
                            variant="outline"
                            disabled={search.isFetchingNextPage}
                            onClick={() => void search.fetchNextPage()}
                        >
                            {search.isFetchingNextPage ? 'Loading…' : 'Load more'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Both providers ask to be credited where their results are shown. */}
            <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
                Free media via
                <a
                    href={
                        provider === 'pixabay' ? 'https://pixabay.com/' : 'https://openverse.org/'
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 font-medium text-foreground hover:underline"
                >
                    {providerLabel[provider]} <ExternalLink className="size-3" />
                </a>
                · each pick keeps its creator and licence for the credits.
            </p>
        </div>
    );
}
