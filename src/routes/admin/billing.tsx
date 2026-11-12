import { ageingBucket } from '@shared/billing';
import { formatMoney } from '@shared/money';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import {
    AlertTriangle,
    CircleDollarSign,
    Clock,
    MessageCircle,
    Receipt,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { InvoicePanel } from '@/admin/InvoicePanel';
import { DataTable, inFilter, SortHeader } from '@/admin/kit/data-table';
import { PageHeader, PageSkeleton, StatCard } from '@/admin/kit/page';
import { InvoiceStatusBadge } from '@/admin/kit/status';
import { invoiceLabel } from '@/admin/labels';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@/lib/api';

interface BillingRow {
    id: string;
    number: string;
    currency: string;
    total: number;
    amountPaid: number;
    balanceDue: number;
    dueDate: string;
    status: string;
    issueDate: string;
    orderId: string | null;
    customerId: string;
    customerName: string;
    customerPhone: string | null;
    orderNumber: string | null;
    packageCode: string | null;
}

interface BillingTotals {
    currency: string;
    billed: number;
    collected: number;
    outstanding: number;
    overdue: number;
}

interface BillingData {
    rows: BillingRow[];
    totals: BillingTotals[];
}

const filters = [
    {
        key: 'unpaid',
        label: 'Still to collect',
    },
    {
        key: 'overdue',
        label: 'Overdue',
    },
    {
        key: 'partially_paid',
        label: 'Partially paid',
    },
    {
        key: 'paid',
        label: 'Paid',
    },
    {
        key: 'all',
        label: 'All',
    },
] as const;

type FilterKey = (typeof filters)[number]['key'];

export const Route = createFileRoute('/admin/billing')({
    validateSearch: z.object({status: z.enum(['unpaid', 'overdue', 'partially_paid', 'paid', 'all']).optional(),}),
    component: BillingPage,
});

const reminderUrl = (r: BillingRow) =>
    r.customerPhone
        ? `https://wa.me/${r.customerPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Namaste ${r.customerName}! A gentle reminder from Toran: ${formatMoney(r.balanceDue, r.currency)} is remaining on invoice ${r.number}. Thank you ✦`)}`
        : null;

function BillingPage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const status: FilterKey = search.status ?? 'unpaid';
    const [open, setOpen] = useState<BillingRow | null>(null);
    const { data, isPending } = useQuery({
        queryKey: ['billing', status],
        queryFn: () => api<BillingData>(`/admin/billing?status=${status === 'all' ? '' : status}`),
        placeholderData: keepPreviousData,
    });
    const columns = useMemo(() => billingColumns(), []);
    const currencies = [...new Set((data?.rows ?? []).map((r) => r.currency))];

    return (
        <>
            <PageHeader
                title="Billing"
                description="What every customer owes, what’s paid and what’s still remaining."
            />
            {isPending || !data ? (
                <PageSkeleton />
            ) : (
                <div className="space-y-6">
                    {data.totals.map((t) => (
                        <div key={t.currency} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                label={`Total billed · ${t.currency}`}
                                value={formatMoney(t.billed, t.currency)}
                                icon={CircleDollarSign}
                                accent="primary"
                            />
                            <StatCard
                                label="Collected"
                                value={formatMoney(t.collected, t.currency)}
                                icon={Wallet}
                                accent="success"
                                hint={
                                    t.billed
                                        ? `${String(Math.round((t.collected / t.billed) * 100))}% of billed`
                                        : undefined
                                }
                            />
                            <StatCard
                                label="Still to collect"
                                value={formatMoney(t.outstanding, t.currency)}
                                icon={Clock}
                                accent="gold"
                            />
                            <StatCard
                                label="Overdue"
                                value={formatMoney(t.overdue, t.currency)}
                                icon={AlertTriangle}
                                accent={t.overdue > 0 ? 'danger' : 'muted'}
                            />
                        </div>
                    ))}
                    <Tabs
                        value={status}
                        onValueChange={(v) => {
                            const next = filters.find((f) => f.key === v)?.key;
                            void navigate({search: { status: next === 'unpaid' ? undefined : next },});
                        }}
                    >
                        <ScrollArea className="w-full">
                            <TabsList>
                                {filters.map((f) => (
                                    <TabsTrigger key={f.key} value={f.key} className="px-3">
                                        {f.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </ScrollArea>
                    </Tabs>
                    <DataTable
                        columns={columns}
                        data={data.rows}
                        searchPlaceholder="Search invoices, customers…"
                        initialSorting={[
                            {
                                id: 'issueDate',
                                desc: true,
                            },
                        ]}
                        facets={[
                            {
                                columnId: 'status',
                                title: 'Status',
                                options: Object.entries(invoiceLabel).map(([value, label]) => ({
                                    value,
                                    label,
                                })),
                            },
                            ...(currencies.length > 1
                                ? [
                                      {
                                          columnId: 'currency',
                                          title: 'Currency',
                                          options: currencies.map((c) => ({
                                              value: c,
                                              label: c,
                                          })),
                                      },
                                  ]
                                : []),
                        ]}
                        empty="Nothing here — all settled ✦"
                        rowLabel={(r) => `Invoice ${r.number} for ${r.customerName}`}
                        isRowActive={(r) => r.id === open?.id}
                        onRowClick={setOpen}
                    />
                </div>
            )}
            <Sheet
                open={open !== null}
                onOpenChange={(o) => {
                    if (!o) setOpen(null);
                }}
            >
                <SheetContent className="w-full gap-0 sm:max-w-md">
                    <SheetHeader className="border-b">
                        <SheetTitle className="flex items-center gap-2">
                            <Receipt className="size-4 text-muted-foreground" />
                            {open?.customerName}
                        </SheetTitle>
                        <SheetDescription>
                            {open?.orderNumber ? (
                                <Link
                                    to="/admin/orders/$id"
                                    params={{ id: open.orderId ?? '' }}
                                    className="font-mono text-primary hover:underline"
                                >
                                    {open.orderNumber} · {open.packageCode}
                                </Link>
                            ) : (
                                'Invoice detail'
                            )}
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="min-h-0 flex-1">
                        <div className="p-4">
                            {open && (
                                <InvoicePanel
                                    key={open.id}
                                    invoiceId={open.id}
                                    customerName={open.customerName}
                                    customerPhone={open.customerPhone}
                                    className="shadow-none"
                                />
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </>
    );
}

function billingColumns(): ColumnDef<BillingRow>[] {
    const today = new Date().toISOString().slice(0, 10);
    return [
        {
            accessorKey: 'number',
            header: ({ column }) => <SortHeader column={column} title="Invoice" />,
            cell: ({ row }) => (
                <div>
                    <div className="font-mono text-[13px] font-medium">{row.original.number}</div>
                    {row.original.orderId && (
                        <Link
                            to="/admin/orders/$id"
                            params={{ id: row.original.orderId }}
                            className="text-xs text-primary hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            {row.original.orderNumber} ·{' '}
                            <span className="capitalize">{row.original.packageCode}</span>
                        </Link>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'customerName',
            header: ({ column }) => <SortHeader column={column} title="Customer" />,
            cell: ({ row }) => (
                <Link
                    to="/admin/customers/$id"
                    params={{ id: row.original.customerId }}
                    className="font-medium hover:underline"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    {row.original.customerName}
                </Link>
            ),
        },
        {
            accessorKey: 'currency',
            header: 'Cur.',
            filterFn: inFilter,
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">{row.original.currency}</span>
            ),
        },
        {
            accessorKey: 'total',
            header: ({ column }) => <SortHeader column={column} title="Total" />,
            enableGlobalFilter: false,
            cell: ({ row }) => (
                <span className="tabular-nums">
                    {formatMoney(row.original.total, row.original.currency)}
                </span>
            ),
        },
        {
            accessorKey: 'amountPaid',
            header: ({ column }) => <SortHeader column={column} title="Paid" />,
            enableGlobalFilter: false,
            cell: ({ row }) => (
                <span className="text-success tabular-nums">
                    {formatMoney(row.original.amountPaid, row.original.currency)}
                </span>
            ),
        },
        {
            accessorKey: 'balanceDue',
            header: ({ column }) => <SortHeader column={column} title="Remaining" />,
            enableGlobalFilter: false,
            cell: ({ row }) =>
                row.original.balanceDue > 0 ? (
                    <span className="font-medium text-destructive tabular-nums">
                        {formatMoney(row.original.balanceDue, row.original.currency)}
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'dueDate',
            header: ({ column }) => <SortHeader column={column} title="Due" />,
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const r = row.original;
                const bucket = r.balanceDue > 0 ? ageingBucket(r.dueDate, today) : 'current';
                return (
                    <span className="whitespace-nowrap">
                        {r.dueDate}
                        {bucket !== 'current' && (
                            <span className="ms-1.5 text-xs font-medium text-destructive">
                                {bucket} days
                            </span>
                        )}
                    </span>
                );
            },
        },
        {
            accessorKey: 'issueDate',
            header: ({ column }) => <SortHeader column={column} title="Issued" />,
            enableGlobalFilter: false,
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.issueDate}</span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            filterFn: inFilter,
            cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => {
                const url = row.original.balanceDue > 0 ? reminderUrl(row.original) : null;
                return url ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon-sm" asChild>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="WhatsApp reminder"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <MessageCircle className="text-success" />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send WhatsApp reminder</TooltipContent>
                    </Tooltip>
                ) : null;
            },
        },
    ];
}
