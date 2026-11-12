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

// ── Admin: guest lists, RSVP reporting, wish moderation ────────────────────
export async function listGuests(invitationId: string) {
    const { db } = getPlatform();
    return db
        .select({
            id: guests.id,
            displayName: guests.displayName,
            token: guests.token,
            phone: guests.phone,
            maxGuests: guests.maxGuests,
            openedAt: guests.openedAt,
            // Qualified by hand: drizzle renders single-table columns unqualified, which would bind "id" to rsvps.
            rsvped: sql<number>`(select count(*) from ${rsvps} where ${rsvps.guestId} = "guests"."id")`,
        })
        .from(guests)
        .where(eq(guests.invitationId, invitationId))
        .orderBy(guests.displayName);
}

export interface ParsedGuest {
    displayName: string;
    phone?: string;
    maxGuests?: number;
}

// "Shah Parivar, +91 98xxxxxx, 4" — name required, phone and party size optional.
export function parseGuestLines(text: string): ParsedGuest[] {
    return text
        .split(/\r?\n/)
        .map((line) => line.split(/[,\t;]/).map((part) => part.trim()))
        .filter(([name]) => Boolean(name))
        .slice(0, 2000)
        .map(([name = '', phone, size]) => ({
            displayName: name.slice(0, 120),
            phone: phone ? phone.replace(/[^\d+]/g, '').slice(0, 20) || undefined : undefined,
            maxGuests: size && /^\d+$/.test(size) ? Math.min(20, Number(size)) : undefined,
        }));
}

export async function importGuests(
    invitationId: string,
    rows: ParsedGuest[],
    makeToken: () => string,
) {
    const { db } = getPlatform();
    if (!rows.length) return 0;
    for (let i = 0; i < rows.length; i += 50) {
        await db.insert(guests).values(
            rows.slice(i, i + 50).map((r) => ({
                invitationId,
                displayName: r.displayName,
                phone: r.phone,
                maxGuests: r.maxGuests,
                token: makeToken(),
            })),
        );
    }
    return rows.length;
}

export async function deleteGuest(invitationId: string, guestId: string) {
    await getPlatform()
        .db.delete(guests)
        .where(and(eq(guests.invitationId, invitationId), eq(guests.id, guestId)));
}

export async function listRsvps(invitationId: string) {
    const { db } = getPlatform();
    return db
        .select({
            id: rsvps.id,
            name: rsvps.name,
            phone: rsvps.phone,
            attending: rsvps.attending,
            guestCount: rsvps.guestCount,
            eventIds: rsvps.eventIds,
            dietary: rsvps.dietary,
            message: rsvps.message,
            createdAt: rsvps.createdAt,
            guestName: guests.displayName,
        })
        .from(rsvps)
        .leftJoin(guests, eq(guests.id, rsvps.guestId))
        .where(eq(rsvps.invitationId, invitationId))
        .orderBy(sql`${rsvps.createdAt} desc`);
}

export async function listWishes(invitationId: string) {
    return getPlatform()
        .db.select()
        .from(wishes)
        .where(eq(wishes.invitationId, invitationId))
        .orderBy(sql`${wishes.createdAt} desc`);
}

export async function moderateWish(
    invitationId: string,
    wishId: string,
    status: 'approved' | 'hidden' | 'pending',
) {
    await getPlatform()
        .db.update(wishes)
        .set({ status })
        .where(and(eq(wishes.invitationId, invitationId), eq(wishes.id, wishId)));
}
