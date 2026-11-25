import { formatMoney } from '@shared/money';
import type { PaymentMode } from '@shared/schemas/checkout';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { CreditCard } from 'lucide-react';

import { PanelCard } from '@/admin/kit/card';
import { DataTable, inFilter, SortHeader } from '@/admin/kit/data-table';
import { EmptyState, PageSkeleton, ToneBadge } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { PayTerms } from '@/shop/policies/kit';
import { useMe, useMyOrders } from '@/shop/portal/data';
import { PayButton } from '@/shop/portal/WaitingPayments';
import type { MyOrder } from '@/shop/types';

export const Route = createFileRoute('/my/payments')({
    head: () => ({ meta: [{ title: 'Payments · Toran' }] }),
    component: Payments,
});

const day = (iso: string) =>
    new Date(iso).toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

const stateOf = (o: MyOrder) =>
    o.balance <= 0 ? 'Paid' : o.balance < o.total ? 'Part paid' : 'To pay';

function StateBadge({ order }: { order: MyOrder }) {
    const state = stateOf(order);
    return <ToneBadge tone={state === 'Paid' ? 'success' : 'warning'}>{state}</ToneBadge>;
}

const columns = (mode: PaymentMode): ColumnDef<MyOrder>[] => [
    {
        accessorKey: 'item',
        header: ({ column }) => <SortHeader column={column} title="For" />,
        cell: ({ row }) => (
            <div>
                <p className="text-sm font-medium">{row.original.item}</p>
                <p className="font-mono text-xs text-muted-foreground">{row.original.number}</p>
            </div>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <SortHeader column={column} title="Date" />,
        enableGlobalFilter: false,
        cell: ({ row }) => (
            <span className="text-muted-foreground">{day(row.original.createdAt)}</span>
        ),
    },
    {
        accessorKey: 'total',
        header: ({ column }) => <SortHeader column={column} title="Total" />,
        enableGlobalFilter: false,
        cell: ({ row }) => (
            <span className="tnum">{formatMoney(row.original.total, row.original.currency)}</span>
        ),
    },
    {
        id: 'state',
        accessorFn: stateOf,
        header: 'Status',
        filterFn: inFilter,
        cell: ({ row }) => <StateBadge order={row.original} />,
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">Pay</span>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                {row.original.balance > 0 && <PayButton order={row.original} mode={mode} />}
            </div>
        ),
    },
];

const TITLE = 'Payments';
const SUBTITLE = 'What you have bought, and anything left to pay.';

function Payments() {
    const me = useMe();
    const orders = useMyOrders();
    if (!me.data || orders.isPending) return <PageSkeleton />;
    const rows = orders.data ?? [];
    const mode = me.data.payments;
    if (rows.length === 0)
        return (
            <PanelCard fill title={TITLE} subtitle={SUBTITLE}>
                <EmptyState
                    icon={CreditCard}
                    title={orders.error ? 'We couldn’t load your payments' : 'No payments yet'}
                    description={
                        orders.error?.message ??
                        'Designs you buy appear here with their receipt number.'
                    }
                >
                    <Button asChild>
                        <Link to="/collections">Browse the collection</Link>
                    </Button>
                </EmptyState>
            </PanelCard>
        );
    return (
        <>
            <DataTable
                className="max-md:hidden"
                columns={columns(mode)}
                data={rows}
                title={TITLE}
                subtitle={SUBTITLE}
                noun="payments"
                searchPlaceholder="Search payments…"
                rowLabel={(o) => `${o.item}, ${o.number}`}
            />
            <div className="md:hidden">
                <PanelCard title={TITLE} subtitle={SUBTITLE} padded={false}>
                    <ul className="divide-y">
                        {rows.map((o) => (
                            <li key={o.id} className="space-y-2 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{o.item}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {o.number} · {day(o.createdAt)}
                                        </p>
                                    </div>
                                    <p className="tnum font-medium">
                                        {formatMoney(o.total, o.currency)}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <StateBadge order={o} />
                                    {o.balance > 0 && <PayButton order={o} mode={mode} />}
                                </div>
                            </li>
                        ))}
                    </ul>
                </PanelCard>
            </div>
            {mode !== 'off' && rows.some((o) => o.balance > 0) && (
                <PayTerms className="mt-3 text-xs text-muted-foreground" />
            )}
        </>
    );
}
