// Which way the shop takes money, and what to do when some arrives.
import type { AppConfig } from '@shared/config';
import type { CheckoutState, PaymentMode } from '@shared/schemas/checkout';

import { checkoutByProviderOrder, checkoutPaid } from '../repos/checkouts';
import { collectPayment, PaymentError } from './razorpay';

type PaymentConfig = Pick<
    AppConfig,
    'ENVIRONMENT' | 'PAYMENTS_DRIVER' | 'RAZORPAY_KEY_ID' | 'RAZORPAY_KEY_SECRET'
>;

// 'off' means nobody can buy: better than an invitation nobody paid for.
export function paymentMode(config: PaymentConfig): PaymentMode {
    if (config.PAYMENTS_DRIVER === 'razorpay')
        return config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET ? 'razorpay' : 'off';
    return config.ENVIRONMENT === 'development' ? 'fake' : 'off';
}

// Settles one Razorpay payment, however we heard of it. Razorpay itself is asked what was paid; the
// page's and the webhook's word is only a nudge to look.
export async function takePayment(paymentId: string): Promise<CheckoutState> {
    const payment = await collectPayment(paymentId);
    const checkout = payment.order_id ? await checkoutByProviderOrder(payment.order_id) : undefined;
    if (!checkout) throw new PaymentError('This payment doesn’t match an order here');
    if (payment.status !== 'captured') throw new PaymentError('The payment hasn’t gone through');
    if (payment.amount !== checkout.amount || payment.currency !== checkout.currency) {
        console.error('[payments] amount mismatch', payment.id, checkout.id);
        throw new PaymentError('The payment doesn’t match the price. Please write to us');
    }
    return checkoutPaid(checkout.id, payment.id);
}
