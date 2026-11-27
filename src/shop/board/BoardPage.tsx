// The couple's mood boards, one per function: a theme, colours, words, notes and pinned photos
// (their own or free stock), laid out as a board to send to the decorator. Private: guests never
// see it. The studio opens the same page for any invitation.
import { BOARD_LIMITS, BOARD_SIZE, boardSearchFor } from '@shared/board';
import { lookPalettes } from '@shared/looks';
import { photoUrl } from '@shared/photos';
import type { BoardInput, BoardPin } from '@shared/schemas/board';
import type { StockPage, StockProvider } from '@shared/stock';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Download,
    FileDown,
    ImagePlus,
    LayoutGrid,
    Loader2,
    Palette,
    Search,
    Shirt,
    Trash2,
    X,
} from 'lucide-react';
import { type ReactNode, useId, useRef, useState } from 'react';
import { toast } from 'sonner';

import { SwatchRow } from '@/admin/composer/LooksPanel';
import { upload } from '@/admin/editor/PhotosPanel';
import { PanelCard } from '@/admin/kit/card';
import { EmptyState, PageHeader, PageSkeleton, Panel } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { PublicDressCode } from '@/invitation/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Scaled } from '@/shop/cards/CardsGrid';
import { saveFile } from '@/shop/cards/model';

import { BoardView } from './BoardView';

interface BoardFunction {
    id: string;
    kind: string;
    title: string;
    startsAt: string;
    venue: string;
    dressCode: PublicDressCode | null;
    board: BoardInput | null;
    updatedAt: string | null;
}

interface CoupleNames {
    one: string;
    two?: string;
}

interface SaveJob {
    eventId: string;
    board: BoardInput;
}

interface Saved {
    board: BoardInput;
}

interface BoardsSet {
    slug: string;
    culture: string;
    names: CoupleNames;
    stock: Record<StockProvider, boolean>;
    functions: BoardFunction[];
}

interface Imported {
    key: string;
    credit: BoardPin['credit'];
}

const emptyBoard: BoardInput = {
    theme: '',
    palette: [],
    words: [],
    notes: '',
    pins: [],
};

// Words a decorator acts on, to start from.
const starterWords = [
    'Marigold',
    'Jasmine',
    'Fairy lights',
    'Brass',
    'Diyas',
    'Floral arch',
    'Pastel drapes',
    'Mirror work',
    'Rangoli',
    'Candles',
    'Low seating',
    'Mehndi corner',
];

interface FieldProps {
    label: string;
    hint?: string;
    children: (id: string) => ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
    const id = useId();
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-[13px] font-medium text-foreground/80">
                {label}
            </Label>
            {children(id)}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}

interface StockSheetProps {
    base: string;
    open: boolean;
    providers: Record<StockProvider, boolean>;
    initial: string;
    full: boolean;
    onClose: () => void;
    onPick: (pin: BoardPin) => Promise<void>;
}

function StockSheet({ base, open, providers, initial, full, onClose, onPick }: StockSheetProps) {
    const [typed, setTyped] = useState(initial);
    const [q, setQ] = useState(initial);
    const [provider, setProvider] = useState<StockProvider>(
        providers.pixabay ? 'pixabay' : 'openverse',
    );
    const [picking, setPicking] = useState<string | null>(null);
    const params = new URLSearchParams({
        provider,
        q,
    });
    const { data, isFetching, error } = useQuery({
        queryKey: ['board-stock', base, provider, q],
        queryFn: () => api<StockPage>(`${base}/boards/stock?${params.toString()}`),
        enabled: open && q.trim().length > 0,
        staleTime: 300_000,
    });
    const pick = async (id: string) => {
        setPicking(id);
        try {
            const got = await api<Imported>(`${base}/boards/stock`, {
                method: 'POST',
                body: JSON.stringify({
                    provider,
                    id,
                }),
            });
            await onPick({
                key: got.key,
                credit: got.credit,
            });
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'That photo couldn’t be added');
        } finally {
            setPicking(null);
        }
    };
    const choices = (['pixabay', 'openverse'] as const).filter((p) => providers[p]);
    return (
        <Sheet
            open={open}
            onOpenChange={(on) => {
                if (!on) onClose();
            }}
        >
            <SheetContent className="w-full gap-0 sm:max-w-xl">
                <SheetHeader className="border-b">
                    <SheetTitle>Find photos</SheetTitle>
                    <SheetDescription>
                        Free photos from{' '}
                        {choices
                            .map((p) => (p === 'pixabay' ? 'Pixabay' : 'Openverse'))
                            .join(' and ')}
                        . Only the words you type are sent to them.
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-3 border-b p-4">
                    <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setQ(typed.trim());
                        }}
                    >
                        <Input
                            aria-label="Search for photos"
                            value={typed}
                            placeholder="Haldi marigold decor"
                            onChange={(e) => {
                                setTyped(e.target.value);
                            }}
                        />
                        <Button type="submit" variant="outline">
                            <Search /> Search
                        </Button>
                    </form>
                    {choices.length > 1 && (
                        <div className="flex gap-1.5">
                            {choices.map((p) => (
                                <Button
                                    key={p}
                                    size="sm"
                                    variant={provider === p ? 'secondary' : 'ghost'}
                                    aria-pressed={provider === p}
                                    onClick={() => {
                                        setProvider(p);
                                    }}
                                >
                                    {p === 'pixabay' ? 'Pixabay' : 'Openverse'}
                                </Button>
                            ))}
                        </div>
                    )}
                    {full && (
                        <p className="text-xs text-warning">
                            This board has {BOARD_LIMITS.pins} photos, the most it holds. Remove one
                            to add another.
                        </p>
                    )}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    {isFetching && !data && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" /> Searching…
                        </p>
                    )}
                    {error && <p className="text-sm text-destructive">{error.message}</p>}
                    {data && data.results.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Nothing for that. Try fewer or simpler words.
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {data?.results.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                disabled={full || picking !== null}
                                aria-label={`Add “${r.title || 'photo'}” by ${r.creator}`}
                                onClick={() => {
                                    void pick(r.id);
                                }}
                                className="group relative aspect-square overflow-hidden rounded-md bg-muted ring-1 ring-foreground/10 disabled:opacity-50"
                            >
                                <img
                                    src={r.thumbnail}
                                    alt=""
                                    loading="lazy"
                                    className="size-full object-cover transition group-hover:scale-105 motion-reduce:transition-none"
                                />
                                {picking === r.id && (
                                    <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <Loader2 className="size-5 animate-spin text-white" />
                                    </span>
                                )}
                                <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-start text-[10px] text-white">
                                    {r.creator} · {r.license}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

interface BoardPageProps {
    // The API path of the invitation: /store/me/invitations/:id or /admin/invitations/:id.
    base: string;
    invitationId: string;
    actions?: ReactNode;
    studio?: boolean;
}

export function BoardPage({ base, invitationId, actions, studio = false }: BoardPageProps) {
    const client = useQueryClient();
    const {
        data: set,
        isPending,
        error,
    } = useQuery({
        queryKey: ['boards', base],
        queryFn: () => api<BoardsSet>(`${base}/boards`),
    });
    const [picked, setPicked] = useState<string | null>(null);
    const [edits, setEdits] = useState<Record<string, BoardInput>>({});
    const [stockOpen, setStockOpen] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const save = useMutation({
        mutationFn: ({ eventId, board }: SaveJob) =>
            api<Saved>(`${base}/boards/${encodeURIComponent(eventId)}`, {
                method: 'PUT',
                body: JSON.stringify(board),
            }),
        onSuccess: async (_, sent) => {
            await client.invalidateQueries({ queryKey: ['boards', base] });
            // Words typed while it saved stay as unsaved changes.
            setEdits((all) =>
                all[sent.eventId] === sent.board
                    ? Object.fromEntries(Object.entries(all).filter(([k]) => k !== sent.eventId))
                    : all,
            );
        },
        onError: (e) => {
            toast.error(e.message);
        },
    });

    if (isPending) return <PageSkeleton />;
    if (!set)
        return (
            <PanelCard fill title="Mood boards">
                <EmptyState
                    icon={LayoutGrid}
                    title="Couldn’t open the mood boards"
                    description={error.message}
                />
            </PanelCard>
        );
    const couple = [set.names.one, set.names.two].filter(Boolean).join(' & ');
    const fn = set.functions.find((f) => f.id === picked) ?? set.functions[0];
    const header = (
        <PageHeader
            title="Mood boards"
            description={
                studio
                    ? `${couple} · private to the couple and the studio`
                    : 'One for each function, for your decorator. Only you and our studio see it.'
            }
            actions={actions}
        />
    );
    if (!fn)
        return (
            <>
                {header}
                <PanelCard fill title="Mood boards">
                    <EmptyState
                        icon={LayoutGrid}
                        title="Add your ceremonies first"
                        description="Each function gets its own board once it’s in your invitation."
                    />
                </PanelCard>
            </>
        );

    const board = edits[fn.id] ?? fn.board ?? emptyBoard;
    const dirty = edits[fn.id] !== undefined;
    const edit = (patch: Partial<BoardInput>) => {
        setEdits((all) => ({
            ...all,
            [fn.id]: {
                ...board,
                ...patch,
            },
        }));
    };
    const saveNow = (next: BoardInput) =>
        save.mutateAsync({
            eventId: fn.id,
            board: next,
        });
    const full = board.pins.length >= BOARD_LIMITS.pins;
    const pinSrc = (key: string) =>
        key.startsWith('public/')
            ? photoUrl(key)
            : `/api${base}/boards/pin?key=${encodeURIComponent(key)}`;
    const addPins = async (pins: BoardPin[]) => {
        const next = {
            ...board,
            pins: [...board.pins, ...pins].slice(0, BOARD_LIMITS.pins),
        };
        edit(next);
        await saveNow(next);
    };
    const onFiles = async (files: FileList | null) => {
        const list = Array.from(files ?? []).slice(0, BOARD_LIMITS.pins - board.pins.length);
        if (list.length === 0) return;
        setBusy('upload');
        try {
            const keys: string[] = [];
            for (const f of list)
                keys.push(await upload(invitationId, f, `/api${base}/boards/pins`));
            await addPins(keys.map((key) => ({ key })));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'That photo couldn’t be added');
        } finally {
            setBusy(null);
            if (fileRef.current) fileRef.current.value = '';
        }
    };
    const download = async (what: 'png' | 'pdf') => {
        setBusy(what);
        try {
            if (dirty) await saveNow(board);
            await saveFile(
                what === 'png'
                    ? `${base}/boards/${encodeURIComponent(fn.id)}/board.png`
                    : `${base}/boards/all.pdf`,
            );
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'The board couldn’t be made');
        } finally {
            setBusy(null);
        }
    };
    const wear = fn.dressCode?.swatches ?? [];

    return (
        <>
            {header}
            <div
                className="mb-4 flex shrink-0 gap-1.5 overflow-x-auto pb-1"
                role="tablist"
                aria-label="Functions"
            >
                {set.functions.map((f) => {
                    const on = f.id === fn.id;
                    return (
                        <button
                            key={f.id}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            onClick={() => {
                                setPicked(f.id);
                            }}
                            className={cn(
                                'flex h-8 shrink-0 items-center gap-2 rounded-control px-3 text-sm ring-1 ring-foreground/10',
                                on ? 'bg-primary text-primary-foreground' : 'bg-card',
                            )}
                        >
                            {f.title}
                            {(edits[f.id] ?? f.board)?.pins.length ? (
                                <span className="text-xs opacity-70">
                                    {(edits[f.id] ?? f.board)?.pins.length}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
                <Panel
                    title={fn.title}
                    description="Saved for you and the studio only"
                    action={
                        <Button
                            size="sm"
                            disabled={!dirty || save.isPending}
                            onClick={() => {
                                void saveNow(board);
                            }}
                        >
                            {save.isPending && <Loader2 className="animate-spin" />}
                            {dirty ? 'Save' : 'Saved'}
                        </Button>
                    }
                    contentClassName="space-y-6"
                >
                    <Field label="Theme" hint="A name for the feel of the day">
                        {(id) => (
                            <Input
                                id={id}
                                value={board.theme}
                                maxLength={80}
                                placeholder="Marigold morning"
                                onChange={(e) => {
                                    edit({ theme: e.target.value });
                                }}
                            />
                        )}
                    </Field>

                    <div className="space-y-2">
                        <p className="flex items-center gap-2 text-[13px] font-medium text-foreground/80">
                            <Palette className="size-4" /> Colours
                        </p>
                        <SwatchRow
                            colors={board.palette}
                            max={BOARD_LIMITS.palette}
                            label="Colour"
                            fresh="#c9a24a"
                            onChange={(palette) => {
                                edit({ palette });
                            }}
                        />
                        <div className="flex flex-wrap gap-1.5">
                            {wear.length > 0 && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        edit({ palette: wear });
                                    }}
                                >
                                    <Shirt /> What guests wear
                                </Button>
                            )}
                            {lookPalettes.slice(0, 8).map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        edit({ palette: p.colors });
                                    }}
                                    className="flex h-8 items-center gap-1.5 rounded-control border bg-card ps-1.5 pe-2.5 text-xs"
                                >
                                    <span className="flex -space-x-1">
                                        {p.colors.map((c) => {
                                            const dot = { background: c };
                                            return (
                                                <span
                                                    key={c}
                                                    className="size-4 rounded-full ring-1 ring-black/10"
                                                    style={dot}
                                                />
                                            );
                                        })}
                                    </span>
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Field
                        label="Words"
                        hint="Flowers, fabrics, lights, food. Press Enter to add each one"
                    >
                        {(id) => (
                            <div className="space-y-2">
                                <Input
                                    id={id}
                                    placeholder="Jasmine strings"
                                    maxLength={40}
                                    disabled={board.words.length >= BOARD_LIMITS.words}
                                    onKeyDown={(e) => {
                                        if (e.key !== 'Enter') return;
                                        e.preventDefault();
                                        const word = e.currentTarget.value.trim();
                                        if (word && !board.words.includes(word))
                                            edit({ words: [...board.words, word] });
                                        e.currentTarget.value = '';
                                    }}
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {board.words.map((w) => (
                                        <span
                                            key={w}
                                            className="flex h-7 items-center gap-1 rounded-full bg-muted ps-3 pe-1 text-xs"
                                        >
                                            {w}
                                            <button
                                                type="button"
                                                aria-label={`Remove ${w}`}
                                                className="rounded-full p-1 hover:bg-foreground/10"
                                                onClick={() => {
                                                    const words = board.words.filter(
                                                        (x) => x !== w,
                                                    );
                                                    edit({ words });
                                                }}
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {starterWords
                                        .filter((w) => !board.words.includes(w))
                                        .slice(0, board.words.length > 6 ? 0 : 8)
                                        .map((w) => (
                                            <button
                                                key={w}
                                                type="button"
                                                className="h-7 rounded-full border border-dashed px-3 text-xs text-muted-foreground hover:text-foreground"
                                                onClick={() => {
                                                    edit({ words: [...board.words, w] });
                                                }}
                                            >
                                                + {w}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </Field>

                    <Field label="Notes for your vendors">
                        {(id) => (
                            <Textarea
                                id={id}
                                rows={4}
                                maxLength={1500}
                                value={board.notes}
                                placeholder="Seating low on the floor, lots of yellow, the swing by the pool…"
                                onChange={(e) => {
                                    edit({ notes: e.target.value });
                                }}
                            />
                        )}
                    </Field>

                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[13px] font-medium text-foreground/80">
                                Photos{' '}
                                <span className="font-normal text-muted-foreground">
                                    {board.pins.length} of {BOARD_LIMITS.pins}
                                </span>
                            </p>
                            <div className="flex gap-2">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    multiple
                                    className="hidden"
                                    aria-label="Upload photos"
                                    onChange={(e) => {
                                        void onFiles(e.target.files);
                                    }}
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={full || busy !== null}
                                    onClick={() => fileRef.current?.click()}
                                >
                                    {busy === 'upload' ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <ImagePlus />
                                    )}
                                    Upload
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={full}
                                    onClick={() => {
                                        setStockOpen(true);
                                    }}
                                >
                                    <Search /> Find photos
                                </Button>
                            </div>
                        </div>
                        {board.pins.length === 0 ? (
                            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                                Add screenshots you’ve saved, photos of a venue, or free photos from
                                the library.
                            </p>
                        ) : (
                            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {board.pins.map((p) => (
                                    <li
                                        key={p.key}
                                        className="relative aspect-square overflow-hidden rounded-md bg-muted ring-1 ring-foreground/10"
                                    >
                                        <img
                                            src={pinSrc(p.key)}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                        <Button
                                            size="icon-sm"
                                            variant="secondary"
                                            aria-label="Remove photo"
                                            className="absolute end-1 top-1 size-7"
                                            onClick={() => {
                                                const next = {
                                                    ...board,
                                                    pins: board.pins.filter((x) => x.key !== p.key),
                                                };
                                                edit(next);
                                                void saveNow(next);
                                            }}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Panel>

                <Panel
                    title="Your board"
                    description="1200 × 1500, ready for WhatsApp"
                    className="lg:sticky lg:top-4"
                    contentClassName="space-y-3"
                >
                    <Scaled size={BOARD_SIZE}>
                        <BoardView
                            board={board}
                            title={fn.title}
                            names={couple}
                            startsAt={fn.startsAt}
                            venue={fn.venue}
                            culture={set.culture}
                            dressCode={fn.dressCode}
                            pinSrc={pinSrc}
                        />
                    </Scaled>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            disabled={busy !== null}
                            onClick={() => {
                                void download('png');
                            }}
                        >
                            {busy === 'png' ? <Loader2 className="animate-spin" /> : <Download />}
                            Download picture
                        </Button>
                        <Button
                            variant="outline"
                            disabled={busy !== null}
                            onClick={() => {
                                void download('pdf');
                            }}
                        >
                            {busy === 'pdf' ? <Loader2 className="animate-spin" /> : <FileDown />}
                            All boards (PDF)
                        </Button>
                    </div>
                </Panel>
            </div>

            <StockSheet
                key={fn.id}
                base={base}
                open={stockOpen}
                providers={set.stock}
                initial={boardSearchFor(fn.kind, board.words)}
                full={full}
                onClose={() => {
                    setStockOpen(false);
                }}
                onPick={(pin) => addPins([pin])}
            />
        </>
    );
}
