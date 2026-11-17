import { and, eq, sql } from 'drizzle-orm';

import { hearts, invitations, wishes } from '../db/schema';
import { getPlatform } from '../platform/context';

// Every heart count for one invitation, keyed by target ("wish:<id>", "photo:<key>").
export async function heartCounts(invitationId: string): Promise<Record<string, number>> {
    const rows = await getPlatform()
        .db.select({
            target: hearts.target,
            count: hearts.count,
        })
        .from(hearts)
        .where(eq(hearts.invitationId, invitationId));
    return Object.fromEntries(rows.map((r) => [r.target, r.count]));
}

// Hearts only land on things guests can actually see: an approved wish or a gallery photo.
export async function isHeartTarget(invitationId: string, target: string): Promise<boolean> {
    const { db } = getPlatform();
    const [kind, ...rest] = target.split(':');
    const ref = rest.join(':');
    if (kind === 'wish') {
        const wish = await db
            .select({ id: wishes.id })
            .from(wishes)
            .where(
                and(
                    eq(wishes.id, ref),
                    eq(wishes.invitationId, invitationId),
                    eq(wishes.status, 'approved'),
                ),
            )
            .get();
        return Boolean(wish);
    }
    const row = await db
        .select({ content: invitations.content })
        .from(invitations)
        .where(eq(invitations.id, invitationId))
        .get();
    return row?.content.gallery.includes(ref) ?? false;
}

export async function addHeart(invitationId: string, target: string): Promise<number> {
    const row = await getPlatform()
        .db.insert(hearts)
        .values({
            invitationId,
            target,
            count: 1,
        })
        .onConflictDoUpdate({
            target: [hearts.invitationId, hearts.target],
            set: {
                count: sql`${hearts.count} + 1`,
                updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`,
            },
        })
        .returning({ count: hearts.count })
        .get();
    return row.count;
}
