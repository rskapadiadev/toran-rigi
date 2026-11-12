import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Users } from 'lucide-react';

import { DataTable, inFilter, SortHeader } from '@/admin/kit/data-table';
import { EmptyState, PageHeader, PageSkeleton, ToneBadge } from '@/admin/kit/page';
import { initials } from '@/admin/shell/nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api';

interface CustomerRow {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    country: string;
    orders: number;
    balanceDue: number;
}

export const Route = createFileRoute('/admin/customers/')({ component: CustomersPage });

const columns: ColumnDef<CustomerRow>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <SortHeader column={column} title="Customer" />,
        cell: ({ row }) => (
            <Link
                to="/admin/customers/$id"
                params={{ id: row.original.id }}
                className="flex items-center gap-3"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/8 text-xs font-semibold text-primary">
                        {initials(row.original.name)}
                    </AvatarFallback>
                </Avatar>
                <span className="font-medium hover:underline">{row.original.name}</span>
            </Link>
        ),
    },
    {
        id: 'contact',
        accessorFn: (c) => `${c.phone ?? ''} ${c.email ?? ''}`,
        header: 'Contact',
        cell: ({ row }) => (
            <div className="text-sm">
                {row.original.phone && <div dir="ltr">{row.original.phone}</div>}
                {row.original.email && (
                    <div className="text-xs text-muted-foreground">{row.original.email}</div>
                )}
                {!row.original.phone && !row.original.email && (
                    <span className="text-muted-foreground">—</span>
                )}
            </div>
        ),
    },
    {
        accessorKey: 'country',
        header: 'Country',
        filterFn: inFilter,
    },
    {
        accessorKey: 'orders',
        header: ({ column }) => <SortHeader column={column} title="Orders" />,
        enableGlobalFilter: false,
        cell: ({ row }) => <span className="tabular-nums">{row.original.orders}</span>,
    },
    {
        id: 'balance',
        accessorFn: (c) => (c.balanceDue > 0 ? 'due' : 'settled'),
        header: 'Balance',
        filterFn: inFilter,
        enableGlobalFilter: false,
        cell: ({ row }) =>
            row.original.balanceDue > 0 ? (
                <ToneBadge tone="danger">Balance due</ToneBadge>
            ) : (
                <ToneBadge tone="success">Settled</ToneBadge>
            ),
    },
];

function CustomersPage() {
    const navigate = useNavigate();
    const { data, isPending } = useQuery({
        queryKey: ['customers', ''],
        queryFn: () => api<CustomerRow[]>('/admin/customers?q='),
    });
    const rows = data ?? [];
    const countries = [...new Set(rows.map((c) => c.country))];
    return (
        <>
            <PageHeader
                title="Customers"
                description={`Every couple and family you’ve worked with${rows.length ? ` · ${String(rows.length)}` : ''}.`}
            />
            {isPending ? (
                <PageSkeleton />
            ) : rows.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No customers yet"
                    description="Customers are created with their first order."
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={rows}
                    searchPlaceholder="Search name, email or phone…"
                    initialSorting={[
                        {
                            id: 'name',
                            desc: false,
                        },
                    ]}
                    facets={[
                        {
                            columnId: 'balance',
                            title: 'Balance',
                            options: [
                                {
                                    value: 'due',
                                    label: 'Balance due',
                                },
                                {
                                    value: 'settled',
                                    label: 'Settled',
                                },
                            ],
                        },
                        {
                            columnId: 'country',
                            title: 'Country',
                            options: countries.map((c) => ({
                                value: c,
                                label: c,
                            })),
                        },
                    ]}
                    rowLabel={(c) => c.name}
                    onRowClick={(c) => {
                        void navigate({
                            to: '/admin/customers/$id',
                            params: { id: c.id },
                        });
                    }}
                />
            )}
        </>
    );
}
