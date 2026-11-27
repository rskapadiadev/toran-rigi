import type { MadeStage } from '@shared/made';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import {
    CreditCard,
    ExternalLink,
    Images,
    PenLine,
    Plus,
    Sparkles,
    Users,
    Wand2,
} from 'lucide-react';

import { PanelCard } from '@/admin/kit/card';
import { DataTable, SortHeader } from '@/admin/kit/data-table';
import { EmptyState, PageSkeleton, ToneBadge } from '@/admin/kit/page';
import type { Tone } from '@/admin/labels';
import { Button } from '@/components/ui/button';
import { useMe, useMyOrders } from '@/shop/portal/data';
import { WaitingPayments } from '@/shop/portal/WaitingPayments';
import type { MyInvitationRow } from '@/shop/types';

export const Route = createFileRoute('/my/')({
    head: () => ({ meta: [{ title: 'My invitations · Toran' }] }),
    component: MyInvitations,
});

interface Status {
    label: string;
    tone: Tone;
}

const statuses: Record<string, Status> = {
    draft: {
        label: 'Not published yet',
        tone: 'muted',
    },
    preview: {
        label: 'Not published yet',
        tone: 'muted',
    },
    published: {
        label: 'Live',
        tone: 'success',
    },
    archived: {
        label: 'Concluded',
        tone: 'muted',
    },
};

const statusOf = (inv: MyInvitationRow): Status =>
    statuses[inv.status] ?? {
        label: inv.status,
        tone: 'muted',
    };

const day = (iso: string) =>
    new Date(iso).toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

// The design's own colours stand in for a thumbnail.
function Swatch({ inv }: { inv: MyInvitationRow }) {
    const { primary, gold } = inv.design.palette;
    const wash = { background: `linear-gradient(135deg, ${primary}, ${gold})` };
    return (
        <span
            aria-hidden
            className="size-8 shrink-0 rounded-lg ring-1 ring-foreground/10"
            style={wash}
        />
    );
}

// Whose turn it is on one the studio is making.
const madeStatuses: Record<MadeStage, Status | null> = {
    details: {
        label: 'Send us your details',
        tone: 'warning',
    },
    making: {
        label: 'We’re making it',
        tone: 'violet',
    },
    look: {
        label: 'Your first look is ready',
        tone: 'info',
    },
    changes: {
        label: 'Making your changes',
        tone: 'violet',
    },
    done: null,
};

function StatusBadge({ inv }: { inv: MyInvitationRow }) {
    const status = (inv.made && madeStatuses[inv.made]) ?? statusOf(inv);
    return (
        <span className="flex flex-wrap items-center gap-1.5">
            <ToneBadge tone={status.tone}>{status.label}</ToneBadge>
            {inv.balance > 0 && <ToneBadge tone="warning">Balance to pay</ToneBadge>}
        </span>
    );
}

function Actions({ inv }: { inv: MyInvitationRow }) {
    const params = { id: inv.id };
    return (
        <div
            className="flex flex-wrap gap-2 md:justify-end"
            // The row itself opens the editor; its buttons must not.
            onClick={(e) => {
                e.stopPropagation();
            }}
            onKeyDown={(e) => {
                e.stopPropagation();
            }}
            role="presentation"
        >
            {inv.made && inv.made !== 'done' && (
                <Button size="sm" asChild>
                    <Link to="/my/$id/made" params={params}>
                        <Wand2 />{' '}
                        {inv.made === 'look'
                            ? 'See it'
                            : inv.made === 'details'
                              ? 'Send details'
                              : 'Follow it'}
                    </Link>
                </Button>
            )}
            <Button
                size="sm"
                variant={inv.made && inv.made !== 'done' ? 'outline' : 'default'}
                asChild
            >
                <Link to="/my/$id" params={params}>
                    <PenLine /> Edit
                </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
                <Link to="/my/$id/guests" params={params}>
                    <Users /> Guests
                </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
                <Link to="/my/$id/cards" params={params}>
                    <Images /> Cards
                </Link>
            </Button>
            {inv.status === 'published' && (
                <Button variant="outline" size="sm" asChild>
                    <a href={`/${inv.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink /> View
                    </a>
                </Button>
            )}
        </div>
    );
}

const columns: ColumnDef<MyInvitationRow>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => <SortHeader column={column} title="Invitation" />,
        cell: ({ row }) => (
            <span className="flex items-center gap-3">
                <Swatch inv={row.original} />
                <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{row.original.title}</span>
                    <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                        /{row.original.slug}
                    </span>
                </span>
            </span>
        ),
    },
    {
        id: 'status',
        accessorFn: (inv) => statusOf(inv).label,
        header: 'Status',
        cell: ({ row }) => <StatusBadge inv={row.original} />,
    },
    {
        accessorKey: 'orderNumber',
        header: 'Order',
        cell: ({ row }) => (
            <span className="font-mono text-[13px]">{row.original.orderNumber}</span>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <SortHeader column={column} title="Bought" />,
        enableGlobalFilter: false,
        cell: ({ row }) => (
            <span className="text-muted-foreground">{day(row.original.createdAt)}</span>
        ),
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <Actions inv={row.original} />,
    },
];

const TITLE = 'My invitations';
const SUBTITLE = 'Edit your words and photos, send it to your guests and see who is coming.';

function NewInvitation() {
    return (
        <Button asChild>
            <Link to="/collections">
                <Plus /> New invitation
            </Link>
        </Button>
    );
}

function MyInvitations() {
    const me = useMe();
    const orders = useMyOrders();
    const navigate = useNavigate();
    if (!me.data) return <PageSkeleton />;
    const { invitations } = me.data;
    const waiting = (orders.data ?? []).filter((o) => o.balance > 0);

    return (
        <>
            {waiting.length > 0 && <WaitingPayments orders={waiting} mode={me.data.payments} />}
            {invitations.length === 0 ? (
                <PanelCard fill title={TITLE} subtitle={SUBTITLE} actions={<NewInvitation />}>
                    <EmptyState
                        icon={waiting.length > 0 ? CreditCard : Sparkles}
                        title="No invitations yet"
                        description={
                            waiting.length > 0
                                ? 'Your invitation appears here as soon as its payment is complete.'
                                : 'Try any design free with your own names. It appears here once you’ve bought it.'
                        }
                    >
                        <Button asChild>
                            <Link to="/collections">Browse the collection</Link>
                        </Button>
                    </EmptyState>
                </PanelCard>
            ) : (
                <>
                    <DataTable
                        className="max-md:hidden"
                        columns={columns}
                        data={invitations}
                        title={TITLE}
                        subtitle={SUBTITLE}
                        noun="invitations"
                        searchPlaceholder="Search invitations…"
                        actions={<NewInvitation />}
                        rowLabel={(inv) => `Edit ${inv.title}`}
                        onRowClick={(inv) => {
                            void navigate({
                                to: '/my/$id',
                                params: { id: inv.id },
                            });
                        }}
                    />
                    {/* Phones: one card each, so every action is a tap rather than a sideways scroll. */}
                    <div className="md:hidden">
                        <PanelCard title={TITLE} subtitle={SUBTITLE} padded={false}>
                            <ul className="divide-y">
                                {invitations.map((inv) => (
                                    <li key={inv.id} className="space-y-3 p-4">
                                        <div className="flex items-center gap-3">
                                            <Swatch inv={inv} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">{inv.title}</p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {inv.orderNumber} · {day(inv.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <StatusBadge inv={inv} />
                                        <Actions inv={inv} />
                                    </li>
                                ))}
                            </ul>
                        </PanelCard>
                        <div className="mt-4">
                            <NewInvitation />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
