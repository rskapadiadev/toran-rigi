import { inviteLink } from '@shared/guests';
import type { ColumnDef } from '@tanstack/react-table';
import {
    ClipboardPaste,
    Copy,
    MessageCircle,
    MoreHorizontal,
    PenLine,
    Plus,
    Reply,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTable, inFilter, SortHeader } from '@/admin/kit/data-table';
import { ToneBadge } from '@/admin/kit/page';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { copyText, useGuestAction } from '@/shop/guests/actions';
import { answerOf, answersByFamily, asksAgain, useSend } from '@/shop/guests/drafts';
import {
    type FamilyStatus,
    functionsFor,
    type GuestList,
    type ListGuest,
    sideLabel,
    statusLabel,
    statusOf,
    titles,
} from '@/shop/guests/model';

import { FamilySheet, PasteSheet, ReplySheet } from './FamilySheets';

interface FamiliesTableProps {
    list: GuestList;
    base: string;
    origin: string;
}

type Open =
    | { kind: 'add' }
    | { kind: 'paste' }
    | {
          kind: 'edit' | 'reply' | 'remove';
          guest: ListGuest;
      };

interface Row {
    guest: ListGuest;
    status: FamilyStatus;
    declined: boolean;
    answer: string;
    side: string;
    group: string;
    sees: string;
}

const tone = {
    new: 'muted',
    sent: 'warning',
    opened: 'info',
    replied: 'success',
} as const;

export function FamiliesTable({ list, base, origin }: FamiliesTableProps) {
    const act = useGuestAction(base);
    const send = useSend(list, base, origin);
    const [open, setOpen] = useState<Open | null>(null);
    const close = () => {
        setOpen(null);
    };

    const rows = useMemo<Row[]>(() => {
        const replies = answersByFamily(list);
        const groups = new Map(list.groups.map((g) => [g.id, g.name]));
        return list.guests.map((guest) => {
            const reply = replies.get(guest.id);
            const answer = reply ? answerOf(list.events, reply) : '';
            return {
                guest,
                status: statusOf(guest),
                declined: Boolean(reply) && !answer,
                answer,
                side: sideLabel(list, guest.side),
                group: (guest.groupId && groups.get(guest.groupId)) ?? '',
                sees: titles(functionsFor(list, guest)),
            };
        });
    }, [list]);

    const columns: ColumnDef<Row>[] = [
        {
            id: 'name',
            accessorFn: (r) => r.guest.displayName,
            header: ({ column }) => <SortHeader column={column} title="Family" />,
            cell: ({ row: { original: r } }) => (
                <div>
                    <p className="font-medium">{r.guest.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                        {[
                            r.guest.phone,
                            r.guest.maxGuests ? `up to ${String(r.guest.maxGuests)}` : null,
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                </div>
            ),
        },
        ...(list.names.two
            ? [
                  {
                      accessorKey: 'side',
                      header: 'Whose guests',
                      filterFn: inFilter,
                  } satisfies ColumnDef<Row>,
              ]
            : []),
        {
            accessorKey: 'group',
            header: 'Group',
            filterFn: inFilter,
            cell: ({ row }) =>
                row.original.group || <span className="text-muted-foreground">—</span>,
        },
        {
            accessorKey: 'sees',
            header: 'Sees',
            enableGlobalFilter: false,
            cell: ({ row }) => (
                <span className="block max-w-56 truncate text-muted-foreground">
                    {row.original.sees}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            filterFn: inFilter,
            enableGlobalFilter: false,
            cell: ({ row: { original: r } }) =>
                r.declined ? (
                    <ToneBadge tone="danger">Can’t come</ToneBadge>
                ) : (
                    <div>
                        <ToneBadge tone={tone[r.status]}>{statusLabel[r.status]}</ToneBadge>
                        {r.answer && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{r.answer}</p>
                        )}
                    </div>
                ),
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            enableGlobalFilter: false,
            cell: ({ row: { original: r } }) => (
                // The row itself opens the family, by click and by Enter.
                <div
                    role="presentation"
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        aria-label={`${asksAgain(list, r.guest) ? 'Remind' : 'Send to'} ${r.guest.displayName} on WhatsApp`}
                        onClick={() => {
                            send(r.guest);
                        }}
                    >
                        <MessageCircle className="text-success" />
                        {asksAgain(list, r.guest) ? 'Remind' : 'Send'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Copy ${r.guest.displayName}’s link`}
                        data-guest-link={inviteLink(origin, list.slug, r.guest.token)}
                        onClick={() => {
                            void copyText(inviteLink(origin, list.slug, r.guest.token));
                        }}
                    >
                        <Copy />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`More for ${r.guest.displayName}`}
                            >
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onSelect={() => {
                                    setOpen({
                                        kind: 'edit',
                                        guest: r.guest,
                                    });
                                }}
                            >
                                <PenLine /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    setOpen({
                                        kind: 'reply',
                                        guest: r.guest,
                                    });
                                }}
                            >
                                <Reply /> Add a reply
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => {
                                    setOpen({
                                        kind: 'remove',
                                        guest: r.guest,
                                    });
                                }}
                            >
                                <Trash2 /> Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    const groups = [...new Set(rows.map((r) => r.group).filter(Boolean))];
    const option = (value: string) => ({
        value,
        label: value,
    });
    return (
        <>
            <DataTable
                title="Families"
                subtitle="Each has its own link, showing only its own functions."
                noun="families"
                fill={false}
                columns={columns}
                data={rows}
                searchPlaceholder="Search families…"
                initialSorting={[
                    {
                        id: 'name',
                        desc: false,
                    },
                ]}
                facets={[
                    {
                        columnId: 'status',
                        title: 'Status',
                        options: Object.entries(statusLabel).map(([value, label]) => ({
                            value,
                            label,
                        })),
                    },
                    ...(list.names.two
                        ? [
                              {
                                  columnId: 'side',
                                  title: 'Whose guests',
                                  options: [null, 'one' as const, 'two' as const].map((s) =>
                                      option(sideLabel(list, s)),
                                  ),
                              },
                          ]
                        : []),
                    ...(groups.length
                        ? [
                              {
                                  columnId: 'group',
                                  title: 'Group',
                                  options: groups.map(option),
                              },
                          ]
                        : []),
                ]}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpen({ kind: 'paste' });
                            }}
                        >
                            <ClipboardPaste /> Paste a list
                        </Button>
                        <Button
                            onClick={() => {
                                setOpen({ kind: 'add' });
                            }}
                        >
                            <Plus /> Add a family
                        </Button>
                    </>
                }
                empty="No families yet. Add one, or paste the couple’s list."
                rowLabel={(r) => r.guest.displayName}
                onRowClick={(r) => {
                    setOpen({
                        kind: 'edit',
                        guest: r.guest,
                    });
                }}
            />
            {open?.kind === 'add' && (
                <FamilySheet list={list} base={base} guest={null} onClose={close} />
            )}
            {open?.kind === 'edit' && (
                <FamilySheet list={list} base={base} guest={open.guest} onClose={close} />
            )}
            {open?.kind === 'paste' && <PasteSheet list={list} base={base} onClose={close} />}
            {open?.kind === 'reply' && (
                <ReplySheet list={list} base={base} guest={open.guest} onClose={close} />
            )}
            {open?.kind === 'remove' && (
                <AlertDialog
                    open
                    onOpenChange={(next) => {
                        if (!next) close();
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove {open.guest.displayName}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Their link stops greeting them and shows the main invitation. Any
                                reply or wish they sent stays.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    void act(
                                        {
                                            path: `/families/${open.guest.id}`,
                                            method: 'DELETE',
                                        },
                                        'Family removed',
                                    );
                                }}
                            >
                                Remove
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}
