// Razorpay tells us about payments here, so one that finishes after the buyer closes the page still
// makes their invitation.
import { razorpayEvent } from '@shared/schemas/checkout';
import { Hono } from 'hono';

import type { AppEnv } from '../app';
import { fail } from '../lib/http';
import { takePayment } from '../services/payments';
import { PaymentError, webhookIsGenuine } from '../services/razorpay';

export const webhooksApi = new Hono<AppEnv>();

const handled = ['payment.authorized', 'payment.captured', 'order.paid'];

webhooksApi.post('/razorpay', async (c) => {
    const body = await c.req.text();
    if (!(await webhookIsGenuine(body, c.req.header('x-razorpay-signature'))))
        return fail(c, 401, 'Not from Razorpay');
    let data: unknown;
    try {
        data = JSON.parse(body);
    } catch {
        return fail(c, 400, 'Not JSON');
    }
    const parsed = razorpayEvent.safeParse(data);
    const payment = parsed.data?.payload.payment?.entity.id;
    if (!parsed.data || !payment || !handled.includes(parsed.data.event))
        return c.json({ ok: true });
    try {
        await takePayment(payment);
    } catch (error) {
        // A payment we can't place will not place itself on a retry; anything else is worth one.
        if (!(error instanceof PaymentError)) throw error;
        console.error('[webhook]', payment, error.message);
        return fail(c, 409, error.message);
    }
    return c.json({ ok: true });
});
