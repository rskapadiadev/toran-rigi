// Taking a payment: Razorpay's own window, or the test checkout while developing. Either way the
// invitation exists only once the server has seen the money.
import type { CheckoutStart, CheckoutState, RazorpayProof } from '@shared/schemas/checkout';

import { api, ApiError, post } from '@/lib/api';

const SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

interface RazorpayOptions {
    key: string;
    order_id: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    theme: { color: string };
    handler: (proof: RazorpayProof) => void;
    modal: { ondismiss: () => void };
}

interface RazorpayWindow {
    open: () => void;
}

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayOptions) => RazorpayWindow;
    }
}

export class PaymentClosed extends Error {
    constructor() {
        super('Payment wasn’t completed, so nothing was bought or charged.');
    }
}

const razorpay = () => window.Razorpay;

// Loaded only when someone pays: Razorpay sees nobody who is just looking around.
async function loadRazorpay() {
    const here = razorpay();
    if (here) return here;
    await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SCRIPT;
        script.onload = () => {
            resolve();
        };
        script.onerror = () => {
            script.remove();
            reject(
                new Error('The payment window didn’t load. Check your connection and try again.'),
            );
        };
        document.head.appendChild(script);
    });
    const loaded = razorpay();
    if (!loaded) throw new Error('The payment window didn’t load. Please try again.');
    return loaded;
}

const wait = (ms: number) =>
    new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });

const stateOf = (id: string) => api<CheckoutState>(`/store/me/checkouts/${id}`);

// The bank can be a few seconds ahead of us, or our answer can get lost on the way back.
async function whenPaid(id: string): Promise<CheckoutState> {
    for (let i = 0; i < 12; i++) {
        const state = await stateOf(id).catch(() => null);
        if (state?.done) return state;
        await wait(2000);
    }
    throw new Error(
        'Your payment is being confirmed. Your invitation will appear in My invitations in a few minutes.',
    );
}

interface PayOptions {
    start: CheckoutStart;
    // What the payment window says they are buying.
    description: string;
    // The payment service's window is about to open over the page.
    onWindow?: () => void;
    // It is closed and the money is being confirmed.
    onConfirming: () => void;
}

// Opens the payment and resolves once it has been confirmed by the server.
export async function pay({
    start,
    description,
    onWindow,
    onConfirming,
}: PayOptions): Promise<CheckoutState> {
    const confirm = `/store/me/checkouts/${start.id}/confirm`;
    const { keyId, providerOrderId } = start;
    if (start.provider === 'fake') {
        onConfirming();
        return post<CheckoutState>(confirm, {});
    }
    if (!keyId || !providerOrderId) throw new Error('The payment could not be started.');
    const Razorpay = await loadRazorpay();
    onWindow?.();
    const proof = await new Promise<RazorpayProof | null>((resolve) => {
        new Razorpay({
            key: keyId,
            order_id: providerOrderId,
            amount: start.amount,
            currency: start.currency,
            name: 'Toran by Rigi',
            description,
            theme: { color: '#4a0f1f' },
            handler: resolve,
            modal: {
                ondismiss: () => {
                    resolve(null);
                },
            },
        }).open();
    });
    if (!proof) {
        // Closed, but a UPI app may have paid in the meantime.
        const state = await stateOf(start.id).catch(() => null);
        if (!state?.paid) throw new PaymentClosed();
    }
    onConfirming();
    if (proof) {
        try {
            const state = await post<CheckoutState>(confirm, proof);
            if (state.done) return state;
        } catch (e) {
            // A refusal is final; a dropped connection is not, as the payment itself went through.
            if (e instanceof ApiError && e.status === 422) throw e;
        }
    }
    return whenPaid(start.id);
}
