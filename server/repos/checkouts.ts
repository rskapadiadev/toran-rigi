// Paying for a design. A checkout holds the buyer's words while they pay; the order, the invoice and
// the invitation are made only after the payment has arrived, whichever hears of it first: the
// buyer's page, the payment service's webhook, or the job that picks up anything left half done.
import type { CheckoutState } from '@shared/schemas/checkout';
import { and, eq, isNull, lt, or } from 'drizzle-orm';

import { checkouts } from '../db/schema';
import { getPlatform } from '../platform/context';
import { OrderError } from './orders';
import {
    balanceOf,
    type CustomerContent,
    invitationForDesign,
    orderForDesign,
    ownedOrder,
    settleOrder,
    type ShopWhere,
    templateOffer,
} from './store';

type Checkout = typeof checkouts.$inferSelect;
type Provider = Checkout['provider'];

// Long enough for one request to finish, short enough that a crashed one is picked up soon.
const LOCK_MS = 60_000;
const ABANDONED_DAYS = 30;

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

export async function startDesignCheckout(
    customerId: string,
    slug: string,
    input: CustomerContent,
    where: ShopWhere,
    provider: Provider,
): Promise<Checkout> {
    const { templateId, price } = await templateOffer(slug, where);
    const [row] = await getPlatform()
        .db.insert(checkouts)
        .values({
            customerId,
            templateId,
            content: input.content,
            events: input.events,
            country: where.country,
            currency: where.currency,
            amount: price,
            provider,
        })
        .returning();
    if (!row) throw new OrderError('Could not start the payment');
    return row;
}

// What is left to pay on an order that already exists (made by the studio, or before this flow).
export async function startOrderCheckout(
    customerId: string,
    orderId: string,
    provider: Provider,
): Promise<Checkout> {
    const order = await ownedOrder(customerId, orderId);
    const amount = await balanceOf(order.id);
    if (amount <= 0) throw new OrderError('This order is already paid');
    const [row] = await getPlatform()
        .db.insert(checkouts)
        .values({
            customerId,
            orderId: order.id,
            currency: order.currency,
            amount,
            provider,
        })
        .returning();
    if (!row) throw new OrderError('Could not start the payment');
    return row;
}

export async function setProviderOrder(id: string, providerOrderId: string) {
    await getPlatform().db.update(checkouts).set({ providerOrderId }).where(eq(checkouts.id, id));
}

export async function ownedCheckout(customerId: string, id: string): Promise<Checkout> {
    const row = await getPlatform()
        .db.select()
        .from(checkouts)
        .where(and(eq(checkouts.id, id), eq(checkouts.customerId, customerId)))
        .get();
    if (!row) throw new OrderError('Payment not found');
    return row;
}

export const checkoutByProviderOrder = (providerOrderId: string) =>
    getPlatform()
        .db.select()
        .from(checkouts)
        .where(eq(checkouts.providerOrderId, providerOrderId))
        .get();

export const checkoutState = (row: Checkout): CheckoutState => ({
    paid: row.status !== 'open',
    done: row.status === 'done',
    invitationId: row.invitationId,
});

// The money has arrived: remember that first, then make what it paid for.
export async function checkoutPaid(id: string, providerPaymentId: string): Promise<CheckoutState> {
    const { db } = getPlatform();
    await db
        .update(checkouts)
        .set({
            status: 'paid',
            providerPaymentId,
            paidAt: new Date().toISOString(),
        })
        .where(and(eq(checkouts.id, id), eq(checkouts.status, 'open')));
    return fulfil(id);
}

async function fulfil(id: string): Promise<CheckoutState> {
    const { db } = getPlatform();
    const [row] = await db
        .update(checkouts)
        .set({ lockedAt: new Date().toISOString() })
        .where(
            and(
                eq(checkouts.id, id),
                eq(checkouts.status, 'paid'),
                or(isNull(checkouts.lockedAt), lt(checkouts.lockedAt, ago(LOCK_MS))),
            ),
        )
        .returning();
    if (!row) {
        // Done already, or another request is on it right now.
        const now = await db.select().from(checkouts).where(eq(checkouts.id, id)).get();
        if (!now) throw new OrderError('Payment not found');
        return checkoutState(now);
    }
    const { templateId, content } = row;
    const words: CustomerContent | null = content
        ? {
              content,
              events: row.events ?? [],
          }
        : null;
    let orderId = row.orderId;
    if (!orderId) {
        if (!templateId || !words) throw new OrderError('Nothing to make for this payment');
        orderId = await orderForDesign(
            {
                customerId: row.customerId,
                templateId,
                currency: row.currency,
                price: row.amount,
                country: row.country,
            },
            words,
        );
        await db.update(checkouts).set({ orderId }).where(eq(checkouts.id, id));
    }
    await settleOrder(orderId, {
        amount: row.amount,
        provider: row.provider,
        ref: row.providerPaymentId ?? row.id,
    });
    const invitationId =
        templateId && words ? await invitationForDesign(orderId, templateId, words) : null;
    const [done] = await db
        .update(checkouts)
        .set({
            status: 'done',
            invitationId,
            // Their words live in the invitation now.
            content: null,
            events: null,
        })
        .where(eq(checkouts.id, id))
        .returning();
    return done
        ? checkoutState(done)
        : {
              paid: true,
              done: true,
              invitationId,
          };
}

// Paid but not finished (a crash, a lost connection): finish it. Run by the frequent job.
export async function finishPaidCheckouts() {
    const waiting = await getPlatform()
        .db.select({ id: checkouts.id })
        .from(checkouts)
        .where(eq(checkouts.status, 'paid'))
        .limit(20);
    for (const { id } of waiting) {
        try {
            await fulfil(id);
        } catch (error) {
            console.error('[checkout]', id, error);
        }
    }
}

// Words from payments that never happened aren't kept. A month, so a slow bank can't outlast it.
export async function forgetAbandonedCheckouts() {
    await getPlatform()
        .db.delete(checkouts)
        .where(
            and(
                eq(checkouts.status, 'open'),
                lt(checkouts.createdAt, ago(ABANDONED_DAYS * 86_400_000)),
            ),
        );
}
