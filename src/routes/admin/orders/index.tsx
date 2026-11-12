import { formatMoney } from '@shared/money';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Columns3, List, Plus, ShoppingBag } from 'lucide-react';
import { useMemo } from 'react';
import { z } from 'zod';

import { DataTable, inFilter, SortHeader } from '@/admin/kit/data-table';
import { EmptyState, PageHeader, PageSkeleton, ToneBadge } from '@/admin/kit/page';
import { OrderStatusBadge, slaFor } from '@/admin/kit/status';
import { boardColumns, cultureLabel, statusLabel } from '@/admin/labels';
import type { OrderRow } from '@/admin/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useNow } from '@/motion/hooks';

export const Route = createFileRoute('/admin/orders/')({
    validateSearch: z.object({ view: z.enum(['board', 'table']).optional() }),
    component: OrdersPage,
});

const closed = ['published', 'completed', 'cancelled'];

function OrdersPage() {
    const { view = 'board' } = Route.useSearch();
    const navigate = useNavigate({ from: '/admin/orders/' });
    const now = useNow(60_000) ?? 0;
    const { data, isPending } = useQuery({
        queryKey: ['orders'],
        queryFn: () => api<OrderRow[]>('/admin/orders'),
    });
    const columns = useMemo(() => orderColumns(now), [now]);
    const orders = data ?? [];
    const packages = [...new Set(orders.map((o) => o.packageCode))];

    return (
        <Tabs
            value={view}
            onValueChange={(v) => {
                void navigate({ search: { view: v === 'table' ? 'table' : undefined } });
            }}
        >
            <PageHeader
                title="Orders"
                description={
                    isPending
                        ? 'Loading…'
                        : `${String(orders.length)} orders · ${String(orders.filter((o) => !closed.includes(o.status)).length)} open`
                }
                actions={
                    <>
                        <TabsList>
                            <TabsTrigger value="board" className="px-3">
                                <Columns3 /> Board
                            </TabsTrigger>
                            <TabsTrigger value="table" className="px-3">
                                <List /> Table
                            </TabsTrigger>
                        </TabsList>
                    </>
                }
            />
            {isPending ? (
                <PageSkeleton />
            ) : orders.length === 0 ? (
                <EmptyState
                    icon={ShoppingBag}
                    title="No orders yet"
                    description="Create the first order to start the studio pipeline."
                >
                    <Button asChild size="sm">
                        <Link to="/admin/orders/new">
                            <Plus /> New order
                        </Link>
                    </Button>
                </EmptyState>
            ) : (
                <>
                    <TabsContent value="board">
                        <Board orders={orders} now={now} />
                    </TabsContent>
                    <TabsContent value="table">
                        <DataTable
                            columns={columns}
                            data={orders}
                            searchPlaceholder="Search orders, customers…"
                            initialSorting={[
                                {
                                    id: 'createdAt',
                                    desc: true,
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
                                {
                                    columnId: 'packageCode',
                                    title: 'Package',
                                    options: packages.map((p) => ({
                                        value: p,
                                        label: p.charAt(0).toUpperCase() + p.slice(1),
                                    })),
                                },
                            ]}
                            rowLabel={(o) => `Order ${o.number}`}
                            onRowClick={(o) => {
                                void navigate({
                                    to: '/admin/orders/$id',
                                    params: { id: o.id },
                                });
                            }}
                        />
                    </TabsContent>
                </>
            )}
        </Tabs>
    );
}

function orderColumns(now: number): ColumnDef<OrderRow>[] {
    return [
        {
            accessorKey: 'number',
            header: ({ column }) => <SortHeader column={column} title="Order" />,
            cell: ({ row }) => (
                <Link
                    to="/admin/orders/$id"
                    params={{ id: row.original.id }}
                    className="font-mono text-[13px] font-medium text-primary hover:underline"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    {row.original.number}
                </Link>
            ),
        },
        {
            accessorKey: 'customerName',
            header: ({ column }) => <SortHeader column={column} title="Customer" />,
            cell: ({ row }) => (
                <div className="min-w-0">
                    <div className="font-medium">{row.original.customerName}</div>
                    {row.original.customerPhone && (
                        <div className="text-xs text-muted-foreground" dir="ltr">
                            {row.original.customerPhone}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'packageCode',
            header: 'Package',
            filterFn: inFilter,
            cell: ({ row }) => (
                <span className="capitalize">
                    {row.original.packageCode}
                    <span className="ms-1.5 text-xs text-muted-foreground">
                        {cultureLabel[row.original.culture] ?? row.original.culture}
                    </span>
                </span>
            ),
        },
        {
            accessorKey: 'weddingDate',
            header: ({ column }) => <SortHeader column={column} title="Event date" />,
            sortUndefined: 'last',
            cell: ({ row }) =>
                row.original.weddingDate ?? <span className="text-muted-foreground">—</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            filterFn: inFilter,
            cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
        },
        {
            id: 'sla',
            header: 'Delivery',
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const o = row.original;
                const sla = closed.includes(o.status) ? null : slaFor(o.deliveryDueAt, now);
                return sla ? (
                    <ToneBadge tone={sla.tone}>{sla.label}</ToneBadge>
                ) : (
                    <span className="text-muted-foreground">—</span>
                );
            },
        },
        {
            accessorKey: 'totalMinor',
            header: ({ column }) => <SortHeader column={column} title="Total" />,
            enableGlobalFilter: false,
            cell: ({ row }) => (
                <span className="tabular-nums">
                    {formatMoney(row.original.totalMinor, row.original.currency)}
                </span>
            ),
        },
        {
            accessorKey: 'balanceDue',
            header: ({ column }) => <SortHeader column={column} title="Balance" />,
            enableGlobalFilter: false,
            cell: ({ row }) =>
                row.original.balanceDue > 0 ? (
                    <span className="font-medium text-destructive tabular-nums">
                        {formatMoney(row.original.balanceDue, row.original.currency)}
                    </span>
                ) : (
                    <ToneBadge tone="success">Paid</ToneBadge>
                ),
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => <SortHeader column={column} title="Created" />,
            enableGlobalFilter: false,
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {new Date(row.original.createdAt).toLocaleDateString('en', {
                        day: 'numeric',
                        month: 'short',
                    })}
                </span>
            ),
        },
    ];
}

interface BoardProps {
    orders: OrderRow[];
    now: number;
}

function Board({ orders, now }: BoardProps) {
    return (
        <ScrollArea className="-mx-4 px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex gap-4 pb-2">
                {boardColumns.map((col) => {
                    const items = orders.filter((o) => col.statuses.includes(o.status));
                    return (
                        <section
                            key={col.title}
                            aria-label={col.title}
                            className="flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 p-2"
                        >
                            <h2 className="flex items-center justify-between px-2 py-1.5 text-[13px] font-semibold">
                                {col.title}
                                <Badge variant="muted" className="rounded-md px-1.5 tabular-nums">
                                    {items.length}
                                </Badge>
                            </h2>
                            <div className="mt-1 flex flex-col gap-2">
                                {items.length === 0 && (
                                    <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                                        Nothing here
                                    </p>
                                )}
                                {items.map((o) => (
                                    <OrderCard key={o.id} o={o} now={now} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

interface OrderCardProps {
    o: OrderRow;
    now: number;
}

function OrderCard({ o, now }: OrderCardProps) {
    const sla = closed.includes(o.status) ? null : slaFor(o.deliveryDueAt, now);
    return (
        <Link to="/admin/orders/$id" params={{ id: o.id }} className="group block">
            <Card
                className={cn(
                    'gap-2.5 p-3.5 shadow-xs transition-all group-hover:border-gold/50 group-hover:shadow-md',
                    sla?.late && 'border-destructive/40',
                )}
            >
                <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{o.number}</span>
                    <OrderStatusBadge status={o.status} className="text-[11px]" />
                </div>
                <p className="leading-tight font-medium">{o.customerName}</p>
                <p className="text-xs text-muted-foreground">
                    <span className="capitalize">{o.packageCode}</span> ·{' '}
                    {cultureLabel[o.culture] ?? o.culture}
                    {o.weddingDate && ` · ${o.weddingDate}`}
                </p>
                <div className="flex items-center justify-between border-t pt-2.5 text-xs">
                    {o.balanceDue > 0 ? (
                        <span className="font-medium text-destructive">
                            {formatMoney(o.balanceDue, o.currency)} due
                        </span>
                    ) : (
                        <span className="font-medium text-success">Paid in full</span>
                    )}
                    {sla && <ToneBadge tone={sla.tone}>{sla.label}</ToneBadge>}
                </div>
            </Card>
        </Link>
    );
}
