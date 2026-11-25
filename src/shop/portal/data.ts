import type { CheckoutStart } from '@shared/schemas/checkout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api, post } from '@/lib/api';
import { pay } from '@/shop/checkout';
import type { Me, MyOrder } from '@/shop/types';

export const meKey = ['me'] as const;
export const ordersKey = ['my-orders'] as const;

export const useMe = () =>
    useQuery({
        queryKey: meKey,
        queryFn: () => api<Me>('/store/me'),
    });

export const useMyOrders = (enabled = true) =>
    useQuery({
        queryKey: ordersKey,
        queryFn: () => api<MyOrder[]>('/store/me/orders'),
        enabled,
    });

interface PayFor {
    orderId: string;
    // What the payment window says they are paying for.
    item: string;
}

// Pays what is left on an order, then refreshes everything that was waiting for it.
export function usePayOrder() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({ orderId, item }: PayFor) => {
            const start = await post<CheckoutStart>(`/store/me/orders/${orderId}/checkout`, {});
            return pay({
                start,
                description: item,
                onConfirming: () => {
                    toast.info('Confirming your payment…');
                },
            });
        },
        onSuccess: async () => {
            toast.success('Paid, thank you');
            await client.invalidateQueries();
        },
        onError: (e) => {
            toast.error(e.message);
        },
    });
}
