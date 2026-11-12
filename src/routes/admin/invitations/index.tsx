import { categoryInfo, occasionCategories, occasionOf } from '@shared/occasions';
import { titleOf } from '@shared/people';
import type { InvitationContent } from '@shared/types';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, Sparkles } from 'lucide-react';

import { DataTable, inFilter, SortHeader } from '@/admin/kit/data-table';
import { OccasionBadge } from '@/admin/kit/occasion';
import { EmptyState, PageHeader, PageSkeleton } from '@/admin/kit/page';
import { InvitationStatusBadge } from '@/admin/kit/status';
import { cultureLabel } from '@/admin/labels';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface InvitationRow {
    id: string;
    slug: string;
    status: string;
    culture: string;
    eventKind: string;
    isDemo: boolean;
    content: InvitationContent;
    updatedAt: string;
    expiresAt: string | null;
    orderNumber: string | null;
    customerName: string | null;
}

export const Route = createFileRoute('/admin/invitations/')({ component: InvitationsPage });

const couple = (inv: InvitationRow) => titleOf(inv.content, 'en');
const family = (inv: InvitationRow) => occasionOf(inv.eventKind).category;
const tradition = (inv: InvitationRow) => inv.culture.split('.')[0] ?? inv.culture;
const displayStatus = (inv: InvitationRow) => (inv.isDemo ? 'demo' : inv.status);

const columns: ColumnDef<InvitationRow>[] = [
    {
        id: 'couple',
        accessorFn: couple,
        header: ({ column }) => <SortHeader column={column} title="Invitation" />,
        cell: ({ row }) => (
            <Link
                to="/admin/invitations/$id"
                params={{ id: row.original.id }}
                className="group flex items-center gap-3"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <span className="flex size-8 items-center justify-center rounded-lg bg-gold/12 text-gold-deep">
                    <Sparkles className="size-4" />
                </span>
                <span>
                    <span className="block font-display text-[17px] leading-tight font-semibold group-hover:underline">
                        {couple(row.original)}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                        /{row.original.slug}
                    </span>
                </span>
            </Link>
        ),
    },
    {
        id: 'occasion',
        accessorFn: family,
        header: 'Occasion',
        filterFn: inFilter,
        cell: ({ row }) => <OccasionBadge id={row.original.eventKind} />,
    },
    {
        id: 'tradition',
        accessorFn: tradition,
        header: 'Tradition',
        filterFn: inFilter,
        cell: ({ row }) => cultureLabel[tradition(row.original)] ?? row.original.culture,
    },
    {
        id: 'order',
        accessorFn: (inv) => `${inv.orderNumber ?? ''} ${inv.customerName ?? ''}`,
        header: 'Order',
        cell: ({ row }) =>
            row.original.orderNumber ? (
                <div>
                    <div className="font-mono text-[13px]">{row.original.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">{row.original.customerName}</div>
                </div>
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
    },
    {
        id: 'status',
        accessorFn: displayStatus,
        header: 'Status',
        filterFn: inFilter,
        cell: ({ row }) => <InvitationStatusBadge status={displayStatus(row.original)} />,
    },
    {
        accessorKey: 'updatedAt',
        header: ({ column }) => <SortHeader column={column} title="Updated" />,
        enableGlobalFilter: false,
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {new Date(row.original.updatedAt).toLocaleDateString('en', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                })}
            </span>
        ),
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">Open</span>,
        cell: ({ row }) =>
            row.original.status === 'published' ? (
                <Button variant="ghost" size="icon-sm" asChild>
                    <a
                        href={`/${row.original.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open live invitation"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <ExternalLink />
                    </a>
                </Button>
            ) : null,
    },
];

function InvitationsPage() {
    const navigate = useNavigate();
    const { data, isPending } = useQuery({
        queryKey: ['invitations'],
        queryFn: () => api<InvitationRow[]>('/admin/invitations'),
    });
    const rows = data ?? [];
    const traditions = [...new Set(rows.map(tradition))];
    return (
        <>
            <PageHeader
                title="Invitations"
                description="Open any invitation in the Composer. New invitations are created from an order."
            />
            {isPending ? (
                <PageSkeleton />
            ) : rows.length === 0 ? (
                <EmptyState
                    icon={Sparkles}
                    title="No invitations yet"
                    description="Create one from an order’s detail page."
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={rows}
                    searchPlaceholder="Search names, links, orders…"
                    initialSorting={[
                        {
                            id: 'updatedAt',
                            desc: true,
                        },
                    ]}
                    facets={[
                        {
                            columnId: 'occasion',
                            title: 'Occasion',
                            options: occasionCategories.map((c) => ({
                                value: c,
                                label: categoryInfo[c].label,
                            })),
                        },
                        {
                            columnId: 'status',
                            title: 'Status',
                            options: ['draft', 'preview', 'published', 'archived', 'demo'].map(
                                (s) => ({
                                    value: s,
                                    label: s.charAt(0).toUpperCase() + s.slice(1),
                                }),
                            ),
                        },
                        {
                            columnId: 'tradition',
                            title: 'Tradition',
                            options: traditions.map((t) => ({
                                value: t,
                                label: cultureLabel[t] ?? t,
                            })),
                        },
                    ]}
                    rowLabel={couple}
                    onRowClick={(inv) => {
                        void navigate({
                            to: '/admin/invitations/$id',
                            params: { id: inv.id },
                        });
                    }}
                />
            )}
        </>
    );
}
