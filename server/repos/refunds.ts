// What decides whether a shop purchase can still be refunded, kept on the order's history so the
// studio sees it too.
import { REFUND_DAYS, refundOpen } from '@shared/policies';
import { and, eq, isNotNull } from 'drizzle-orm';

import { checkouts, invitations, orderEvents } from '../db/schema';
import { getPlatform } from '../platform/context';

const DOWNLOADED = `Customer downloaded their cards, PDF or video: the ${String(REFUND_DAYS)}-day refund has ended`;

async function downloadNoted(orderId: string) {
    const row = await getPlatform()
        .db.select({ id: orderEvents.id })
        .from(orderEvents)
        .where(
            and(
                eq(orderEvents.orderId, orderId),
                eq(orderEvents.kind, 'system'),
                eq(orderEvents.body, DOWNLOADED),
            ),
        )
        .get();
    return row !== undefined;
}

// Only designs bought in the shop: the studio's own work follows its quote.
async function purchaseOf(invitationId: string) {
    return getPlatform()
        .db.select({
            orderId: checkouts.orderId,
            paidAt: checkouts.paidAt,
            publishedAt: invitations.publishedAt,
        })
        .from(checkouts)
        .innerJoin(invitations, eq(invitations.id, checkouts.invitationId))
        .where(and(eq(checkouts.invitationId, invitationId), isNotNull(checkouts.templateId)))
        .get();
}

export async function refundIsOpen(invitationId: string): Promise<boolean> {
    const bought = await purchaseOf(invitationId);
    if (!bought?.orderId) return false;
    return refundOpen({
        paidAt: bought.paidAt,
        publishedAt: bought.publishedAt,
        downloaded: await downloadNoted(bought.orderId),
        now: Date.now(),
    });
}

// The first file they take is the one that counts.
export async function noteDownload(invitationId: string) {
    const bought = await purchaseOf(invitationId);
    if (!bought?.orderId || (await downloadNoted(bought.orderId))) return;
    await getPlatform().db.insert(orderEvents).values({
        orderId: bought.orderId,
        kind: 'system',
        body: DOWNLOADED,
    });
}
