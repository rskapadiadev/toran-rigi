import { z } from 'zod';

// What Razorpay's window gives the page when a payment goes through.
export const razorpayProof = z.object({
    razorpay_order_id: z.string().min(1).max(64),
    razorpay_payment_id: z.string().min(1).max(64),
    razorpay_signature: z.string().min(1).max(256),
});
export type RazorpayProof = z.infer<typeof razorpayProof>;

// The part of a webhook we act on; everything else is read back from Razorpay itself.
export const razorpayEvent = z.object({
    event: z.string(),
    payload: z.object({ payment: z.object({ entity: z.object({ id: z.string() }) }).optional() }),
});

export type PaymentMode = 'razorpay' | 'fake' | 'off';

// Everything the page needs to take one payment.
export interface CheckoutStart {
    id: string;
    provider: 'razorpay' | 'fake';
    amount: number;
    currency: string;
    // Razorpay's public key and order.
    keyId?: string;
    providerOrderId?: string;
}

export interface CheckoutState {
    // The money has arrived…
    paid: boolean;
    // …and what it paid for is ready. Settling an older order may have no new invitation to show.
    done: boolean;
    invitationId: string | null;
}
