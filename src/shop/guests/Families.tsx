import { inviteLink, isSide, type Side } from '@shared/guests';
import {
    ClipboardPaste,
    Copy,
    MessageCircle,
    MoreHorizontal,
    PenLine,
    Reply,
    Search,
    Trash2,
    UserPlus,
} from 'lucide-react';
import { type SyntheticEvent, useId, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { copyText, useGuestAction } from './actions';
import { answerOf, answersByFamily, asksAgain, useSend } from './drafts';
import {
    type FamilyStatus,
    firstName,
    functionsFor,
    type GuestList,
    type ListGuest,
    sideLabel,
    statusLabel,
    statusOf,
    titles,
} from './model';

interface FamiliesProps {
    list: GuestList;
    base: string;
    origin: string;
}

type Filter = 'all' | Side | 'new' | 'waiting';

interface FilterOption {
    id: Filter;
    label: string;
}

const statusTone: Record<FamilyStatus, string> = {
    new: 'bg-black/5 text-ink/70',
    sent: 'bg-gold/20 text-gold-deep',
    opened: 'bg-sky-100 text-sky-900',
    replied: 'bg-emerald-100 text-emerald-900',
};

const select =
    'h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function Families({ list, base, origin }: FamiliesProps) {
    const act = useGuestAction(base);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [editing, setEditing] = useState<ListGuest | 'new' | null>(null);
    const [pasting, setPasting] = useState(false);
    const [replying, setReplying] = useState<ListGuest | null>(null);
    const searchId = useId();

    const groupName = useMemo(() => new Map(list.groups.map((g) => [g.id, g.name])), [list.groups]);
    const replyOf = useMemo(() => answersByFamily(list), [list]);

    const shown = list.guests.filter((g) => {
        if (query && !g.displayName.toLowerCase().includes(query.trim().toLowerCase()))
            return false;
        if (isSide(filter)) return g.side === filter;
        if (filter === 'new') return statusOf(g) === 'new';
        if (filter === 'waiting') return g.rsvped === 0;
        return true;
    });

    const send = useSend(list, base, origin);

    const filters: FilterOption[] = [
        {
            id: 'all',
            label: `Everyone (${String(list.guests.length)})`,
        },
        ...(list.names.two
            ? (['one', 'two'] as const).map((s) => ({
                  id: s,
                  label: sideLabel(list, s),
              }))
            : []),
        {
            id: 'new',
            label: 'Not sent yet',
        },
        {
            id: 'waiting',
            label: 'No reply yet',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-0 flex-1 basis-56">
                    <Label htmlFor={searchId} className="sr-only">
                        Find a family
                    </Label>
                    <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id={searchId}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}
                        placeholder="Find a family"
                        className="h-10 rounded-full ps-9"
                    />
                </div>
                <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                        setPasting(true);
                    }}
                >
                    <ClipboardPaste /> Paste a list
                </Button>
                <Button
                    className="rounded-full"
                    onClick={() => {
                        setEditing('new');
                    }}
                >
                    <UserPlus /> Add a family
                </Button>
            </div>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Show">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        type="button"
                        aria-pressed={filter === f.id}
                        onClick={() => {
                            setFilter(f.id);
                        }}
                        className={cn(
                            'rounded-full border px-3 py-1 text-xs transition',
                            filter === f.id
                                ? 'border-ink bg-ink text-ivory'
                                : 'text-ink/80 hover:bg-black/5',
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {list.guests.length === 0 ? (
                <div className="rounded-3xl border border-dashed p-8 text-center">
                    <p className="font-display text-2xl text-ink">Add your first family</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                        Each family gets its own link. Their invite greets them by name and shows
                        only the functions they’re invited to.
                    </p>
                </div>
            ) : shown.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No families match.</p>
            ) : (
                <ul className="divide-y rounded-2xl border bg-card">
                    {shown.map((g) => {
                        const status = statusOf(g);
                        const reply = replyOf.get(g.id);
                        const answered = reply && answerOf(list.events, reply);
                        const meta = [
                            list.names.two && g.side ? sideLabel(list, g.side) : null,
                            g.groupId ? groupName.get(g.groupId) : null,
                            g.maxGuests ? `up to ${String(g.maxGuests)}` : null,
                        ].filter(Boolean);
                        return (
                            <li key={g.id} className="flex flex-wrap items-center gap-3 p-4">
                                <div className="min-w-0 flex-1 basis-52">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate font-medium text-ink">
                                            {g.displayName}
                                        </p>
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-[11px]',
                                                statusTone[status],
                                            )}
                                        >
                                            {reply && !answered
                                                ? 'Can’t come'
                                                : statusLabel[status]}
                                        </span>
                                    </div>
                                    {answered && (
                                        <p className="text-xs text-emerald-900">{answered}</p>
                                    )}
                                    {meta.length > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            {meta.join(' · ')}
                                        </p>
                                    )}
                                    <p className="truncate text-xs text-muted-foreground">
                                        Sees: {titles(functionsFor(list, g))}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        size="sm"
                                        className="rounded-full bg-[#1f7a4d] text-white hover:bg-[#1a6942]"
                                        onClick={() => {
                                            send(g);
                                        }}
                                    >
                                        <MessageCircle /> {asksAgain(list, g) ? 'Remind' : 'Send'}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        aria-label={`Copy ${g.displayName}’s link`}
                                        onClick={() => {
                                            void copyText(inviteLink(origin, list.slug, g.token));
                                        }}
                                    >
                                        <Copy />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                aria-label={`More for ${g.displayName}`}
                                            >
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    setEditing(g);
                                                }}
                                            >
                                                <PenLine /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    setReplying(g);
                                                }}
                                            >
                                                <Reply /> Add a reply from WhatsApp
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onSelect={() => {
                                                    if (
                                                        window.confirm(
                                                            `Remove ${g.displayName}? Their link then shows your main invitation. Any reply they sent stays counted.`,
                                                        )
                                                    )
                                                        void act(
                                                            {
                                                                path: `/families/${g.id}`,
                                                                method: 'DELETE',
                                                            },
                                                            'Removed',
                                                        );
                                                }}
                                            >
                                                <Trash2 /> Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            <p className="text-xs text-muted-foreground">
                Send a few a day from your own phone. WhatsApp can block numbers that send to many
                people at once.
            </p>

            {editing && (
                <FamilyDialog
                    list={list}
                    base={base}
                    guest={editing === 'new' ? null : editing}
                    onClose={() => {
                        setEditing(null);
                    }}
                />
            )}
            {pasting && (
                <PasteDialog
                    list={list}
                    base={base}
                    onClose={() => {
                        setPasting(false);
                    }}
                />
            )}
            {replying && (
                <ReplyDialog
                    list={list}
                    base={base}
                    guest={replying}
                    onClose={() => {
                        setReplying(null);
                    }}
                />
            )}
        </div>
    );
}

interface PlacementProps {
    list: GuestList;
    side: Side | null;
    groupId: string | null;
    onSide: (side: Side | null) => void;
    onGroup: (groupId: string | null) => void;
}

// Whose guests they are and which group they're in: the two things that decide what they see.
function Placement({ list, side, groupId, onSide, onGroup }: PlacementProps) {
    const sideId = useId();
    const groupFieldId = useId();
    const groups = list.groups.filter((g) => g.kind === 'group');
    return (
        <>
            {list.names.two && (
                <div className="space-y-1.5">
                    <Label htmlFor={sideId}>Whose guests</Label>
                    <select
                        id={sideId}
                        className={select}
                        value={side ?? ''}
                        onChange={(e) => {
                            const v = e.target.value;
                            onSide(isSide(v) ? v : null);
                        }}
                    >
                        <option value="">Both families</option>
                        <option value="one">{sideLabel(list, 'one')}</option>
                        <option value="two">{sideLabel(list, 'two')}</option>
                    </select>
                </div>
            )}
            <div className="space-y-1.5">
                <Label htmlFor={groupFieldId}>Group</Label>
                <select
                    id={groupFieldId}
                    className={select}
                    value={groupId ?? ''}
                    onChange={(e) => {
                        onGroup(e.target.value || null);
                    }}
                >
                    <option value="">No group</option>
                    {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.name}
                        </option>
                    ))}
                </select>
                {groups.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        Make groups like Close family on the Links tab.
                    </p>
                )}
            </div>
        </>
    );
}

interface FamilyDialogProps {
    list: GuestList;
    base: string;
    guest: ListGuest | null;
    onClose: () => void;
}

function FamilyDialog({ list, base, guest, onClose }: FamilyDialogProps) {
    const act = useGuestAction(base);
    const [side, setSide] = useState<Side | null>(guest?.side ?? null);
    const [groupId, setGroupId] = useState<string | null>(guest?.groupId ?? null);
    const [busy, setBusy] = useState(false);
    const ids = {
        name: useId(),
        phone: useId(),
        max: useId(),
        note: useId(),
    };

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const text = (key: string) => {
            const v = form.get(key);
            return typeof v === 'string' ? v.trim() : '';
        };
        const max = Number(text('maxGuests'));
        const body = {
            displayName: text('displayName'),
            phone: text('phone') || undefined,
            side,
            groupId,
            maxGuests: max > 0 ? Math.min(20, max) : null,
            note: text('note') || undefined,
        };
        setBusy(true);
        const ok = await act(
            guest
                ? {
                      path: `/families/${guest.id}`,
                      method: 'PATCH',
                      body,
                  }
                : {
                      path: '/families',
                      method: 'POST',
                      body,
                  },
            guest ? 'Saved' : `${body.displayName} added`,
        );
        setBusy(false);
        if (ok) onClose();
    };

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">
                        {guest ? `Edit ${guest.displayName}` : 'Add a family'}
                    </DialogTitle>
                    <DialogDescription>
                        Write their name the way their invite should greet them.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => void submit(e)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor={ids.name}>Name on their invite</Label>
                        <Input
                            id={ids.name}
                            name="displayName"
                            required
                            maxLength={120}
                            defaultValue={guest?.displayName}
                            placeholder="Sharma family, Mama ji, Shreya"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={ids.phone}>WhatsApp number</Label>
                        <Input
                            id={ids.phone}
                            name="phone"
                            type="tel"
                            dir="ltr"
                            maxLength={32}
                            defaultValue={guest?.phone ?? ''}
                            placeholder="+91 98765 43210"
                        />
                        <p className="text-xs text-muted-foreground">
                            With the country code. Leave it empty to pick them in WhatsApp.
                        </p>
                    </div>
                    <Placement
                        list={list}
                        side={side}
                        groupId={groupId}
                        onSide={setSide}
                        onGroup={setGroupId}
                    />
                    <div className="space-y-1.5">
                        <Label htmlFor={ids.max}>Most people from this family</Label>
                        <Input
                            id={ids.max}
                            name="maxGuests"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={20}
                            defaultValue={guest?.maxGuests ?? ''}
                            placeholder="No limit"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={ids.note}>A line just for them</Label>
                        <Textarea
                            id={ids.note}
                            name="note"
                            rows={2}
                            maxLength={500}
                            defaultValue={guest?.note ?? ''}
                            placeholder="Mama ji, it wouldn’t be the same without you."
                        />
                        <p className="text-xs text-muted-foreground">
                            Goes at the top of their WhatsApp message.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={busy} className="rounded-full">
                            {guest ? 'Save' : 'Add family'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface PasteDialogProps {
    list: GuestList;
    base: string;
    onClose: () => void;
}

function PasteDialog({ list, base, onClose }: PasteDialogProps) {
    const act = useGuestAction(base);
    const [lines, setLines] = useState('');
    const [side, setSide] = useState<Side | null>(null);
    const [groupId, setGroupId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const fieldId = useId();
    const count = lines.split(/\r?\n/).filter((l) => l.trim()).length;
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Paste a list</DialogTitle>
                    <DialogDescription>
                        One family per line: name, then their WhatsApp number and how many people,
                        if you have them.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor={fieldId}>One family per line</Label>
                        <Textarea
                            id={fieldId}
                            rows={7}
                            value={lines}
                            onChange={(e) => {
                                setLines(e.target.value);
                            }}
                            placeholder={
                                'Sharma family, +91 98765 43210, 4\nMama ji\nShreya, +44 7700 900123'
                            }
                            dir="auto"
                        />
                    </div>
                    <Placement
                        list={list}
                        side={side}
                        groupId={groupId}
                        onSide={setSide}
                        onGroup={setGroupId}
                    />
                </div>
                <DialogFooter>
                    <Button
                        className="rounded-full"
                        disabled={busy || count === 0}
                        onClick={() => {
                            setBusy(true);
                            void act(
                                {
                                    path: '/families/paste',
                                    method: 'POST',
                                    body: {
                                        lines,
                                        side,
                                        groupId,
                                    },
                                },
                                `${String(count)} ${count === 1 ? 'family' : 'families'} added`,
                            ).then((ok) => {
                                setBusy(false);
                                if (ok) onClose();
                            });
                        }}
                    >
                        Add {count > 0 ? String(count) : ''} {count === 1 ? 'family' : 'families'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ReplyDialogProps {
    list: GuestList;
    base: string;
    guest: ListGuest;
    onClose: () => void;
}

// A reply that came only as a WhatsApp message: typed in here so the headcount stays whole.
function ReplyDialog({ list, base, guest, onClose }: ReplyDialogProps) {
    const act = useGuestAction(base);
    const events = functionsFor(list, guest);
    const [coming, setComing] = useState(true);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [busy, setBusy] = useState(false);
    const noteId = useId();
    const [message, setMessage] = useState('');
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">
                        {firstName(guest.displayName)}’s reply
                    </DialogTitle>
                    <DialogDescription>
                        Replied on WhatsApp instead? Add it here and it’s counted with the rest.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-1 rounded-full bg-black/5 p-1">
                        {[true, false].map((v) => (
                            <button
                                key={String(v)}
                                type="button"
                                aria-pressed={coming === v}
                                onClick={() => {
                                    setComing(v);
                                }}
                                className={cn(
                                    'rounded-full px-3 py-2 text-sm',
                                    coming === v ? 'bg-ink text-ivory' : 'text-ink/80',
                                )}
                            >
                                {v ? 'Coming' : 'Can’t come'}
                            </button>
                        ))}
                    </div>
                    {coming &&
                        events.map((e) => (
                            <CountRow
                                key={e.id}
                                label={e.title}
                                value={counts[e.id] ?? 0}
                                onChange={(n) => {
                                    setCounts((c) => ({
                                        ...c,
                                        [e.id]: n,
                                    }));
                                }}
                            />
                        ))}
                    <div className="space-y-1.5">
                        <Label htmlFor={noteId}>Their message (optional)</Label>
                        <Textarea
                            id={noteId}
                            rows={2}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                            }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        className="rounded-full"
                        disabled={busy}
                        onClick={() => {
                            setBusy(true);
                            void act(
                                {
                                    path: `/families/${guest.id}/reply`,
                                    method: 'POST',
                                    body: {
                                        attending: coming,
                                        counts: coming ? counts : {},
                                        message: message || undefined,
                                    },
                                },
                                'Reply added',
                            ).then((ok) => {
                                setBusy(false);
                                if (ok) onClose();
                            });
                        }}
                    >
                        Add reply
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface CountRowProps {
    label: string;
    value: number;
    onChange: (n: number) => void;
}

function CountRow({ label, value, onChange }: CountRowProps) {
    const id = useId();
    return (
        <div className="grid grid-cols-[1fr_6rem] items-center gap-3">
            <Label htmlFor={id} className="font-normal">
                {label}
            </Label>
            <Input
                id={id}
                type="number"
                inputMode="numeric"
                min={0}
                max={50}
                value={value}
                onChange={(e) => {
                    onChange(Math.max(0, Math.min(50, Number(e.target.value) || 0)));
                }}
            />
        </div>
    );
}
