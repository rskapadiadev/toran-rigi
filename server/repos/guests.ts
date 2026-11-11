import type { RsvpInput, WishInput } from '@shared/schemas/guest';
import { and, eq, sql } from 'drizzle-orm';

import { guests, rsvps, wishes } from '../db/schema';
import { getPlatform } from '../platform/context';

export async function findGuest(invitationId: string, token: string | undefined) {
    if (!token) return undefined;
    const { db } = getPlatform();
    return db
        .select()
        .from(guests)
        .where(and(eq(guests.invitationId, invitationId), eq(guests.token, token)))
        .get();
}

export async function createRsvp(
    invitationId: string,
    input: RsvpInput,
    guestId: string | undefined,
    syncToSheet: boolean,
) {
    const { db } = getPlatform();
    const [row] = await db
        .insert(rsvps)
        .values({
            invitationId,
            guestId,
            name: input.name,
            phone: input.phone,
            attending: input.attending,
            guestCount: input.attending ? input.guestCount : 0,
            eventIds: input.eventIds,
            dietary: input.dietary,
            message: input.message,
            sheetSyncStatus: syncToSheet ? 'pending' : 'off',
        })
        .returning();
    return row;
}

export async function totalAttending(invitationId: string) {
    const { db } = getPlatform();
    const row = await db
        .select({ total: sql<number>`coalesce(sum(${rsvps.guestCount}), 0)` })
        .from(rsvps)
        .where(and(eq(rsvps.invitationId, invitationId), eq(rsvps.attending, true)))
        .get();
    return row?.total ?? 0;
}

export async function createWish(
    invitationId: string,
    input: WishInput,
    guestId: string | undefined,
) {
    const { db } = getPlatform();
    await db.insert(wishes).values({
        invitationId,
        guestId,
        name: input.name,
        message: input.message,
    });
}
