import { formatMoney } from '@shared/money';
import type { PaymentMode } from '@shared/schemas/checkout';
import { CreditCard, Loader2 } from 'lucide-react';

import { Panel } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { PayTerms } from '@/shop/policies/kit';
import type { MyOrder } from '@/shop/types';

import { usePayOrder } from './data';

interface PayButtonProps {
    order: MyOrder;
    mode: PaymentMode;
}

export function PayButton({ order, mode }: PayButtonProps) {
    const pay = usePayOrder();
    if (mode === 'off')
        return <span className="text-xs text-muted-foreground">Online payment opens soon</span>;
    return (
        <Button
            size="sm"
            disabled={pay.isPending}
            onClick={() => {
                pay.mutate({
                    orderId: order.id,
                    item: order.item,
                });
            }}
        >
            {pay.isPending && <Loader2 className="animate-spin" />}
            Pay {formatMoney(order.balance, order.currency)}
        </Button>
    );
}

interface WaitingProps {
    orders: MyOrder[];
    mode: PaymentMode;
}

// Orders with something left to pay. An invitation nobody has paid for isn't listed until it is.
export function WaitingPayments({ orders, mode }: WaitingProps) {
    return (
        <Panel
            title="Waiting for payment"
            icon={CreditCard}
            className="mb-4 shrink-0"
            contentClassName="p-0"
        >
            <ul className="divide-y">
                {orders.map((order) => (
                    <li key={order.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{order.item}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                                {order.number}
                            </p>
                        </div>
                        <PayButton order={order} mode={mode} />
                    </li>
                ))}
            </ul>
            <PayTerms className="border-t px-4 py-2.5 text-xs text-muted-foreground" />
        </Panel>
    );
}
