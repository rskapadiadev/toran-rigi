// Razorpay: takes the money. Only an amount, a currency and our own reference are sent; the buyer
// gives their contact details to Razorpay themselves, in its own window.
import { z } from 'zod';

import { hmacSha256, timingSafeEqual } from '../lib/crypto';
import { getPlatform } from '../platform/context';

export class PaymentError extends Error {}

const TIMEOUT_MS = 15_000;

const orderSchema = z.object({ id: z.string() });

const paymentSchema = z.object({
    id: z.string(),
    order_id: z.string().nullable(),
    amount: z.number().int(),
    currency: z.string(),
    // created | authorized | captured | refunded | failed
    status: z.string(),
});
export type RazorpayPayment = z.infer<typeof paymentSchema>;

function keys() {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = getPlatform().config;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET)
        throw new PaymentError('Online payment isn’t set up yet');
    return {
        id: RAZORPAY_KEY_ID,
        secret: RAZORPAY_KEY_SECRET,
    };
}

async function call<T>(path: string, schema: z.ZodType<T>, body?: unknown): Promise<T> {
    const { id, secret } = keys();
    let res: Response;
    try {
        res = await fetch(`${getPlatform().config.RAZORPAY_API_URL}${path}`, {
            method: body === undefined ? 'GET' : 'POST',
            headers: {
                authorization: `Basic ${btoa(`${id}:${secret}`)}`,
                'content-type': 'application/json',
            },
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (error) {
        console.error('[razorpay]', path, error);
        throw new PaymentError('The payment service isn’t answering. Please try again in a minute');
    }
    if (!res.ok) {
        console.error('[razorpay]', path, res.status, await res.text());
        throw new PaymentError('The payment service couldn’t do that just now. Please try again');
    }
    return schema.parse(await res.json());
}

export const razorpayKeyId = () => keys().id;

interface NewOrder {
    amount: number;
    currency: string;
    reference: string;
}

export async function createRazorpayOrder({ amount, currency, reference }: NewOrder) {
    return call('/orders', orderSchema, {
        amount,
        currency,
        receipt: reference,
    });
}

// The payment as Razorpay has it, collected if the bank has only approved it so far.
export async function collectPayment(paymentId: string): Promise<RazorpayPayment> {
    const path = `/payments/${encodeURIComponent(paymentId)}`;
    const payment = await call(path, paymentSchema);
    if (payment.status !== 'authorized') return payment;
    const { amount, currency } = payment;
    try {
        return await call(`${path}/capture`, paymentSchema, {
            amount,
            currency,
        });
    } catch (error) {
        // The page and the webhook often arrive together: the other one may have collected it.
        const now = await call(path, paymentSchema);
        if (now.status === 'captured') return now;
        throw error;
    }
}

interface CheckoutProof {
    orderId: string;
    paymentId: string;
    signature: string;
}

// What Razorpay's window hands back to the page, proven to come from Razorpay.
export async function checkoutIsGenuine({ orderId, paymentId, signature }: CheckoutProof) {
    const expected = await hmacSha256(keys().secret, `${orderId}|${paymentId}`);
    return timingSafeEqual(expected, signature);
}

export async function webhookIsGenuine(body: string, signature: string | undefined) {
    const secret = getPlatform().config.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || !signature) return false;
    return timingSafeEqual(await hmacSha256(secret, body), signature);
}
