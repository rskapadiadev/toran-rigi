import { pickText } from '@shared/cultures';
import { isSide, type Side, type Viewer, visibleEvents } from '@shared/guests';
import type {
    GuestInput,
    ManualReplyInput,
    RepliesInput,
    RsvpInput,
    WishInput,
} from '@shared/schemas/guest';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';

import { guestGroups, guests, invitationEvents, invitations, rsvps, wishes } from '../db/schema';
import { getPlatform } from '../platform/context';
import { eventAudiences, invalidateInvitationCache } from './invitations';
import { OrderError } from './orders';

export async function findGuest(invitationId: string, token: string | undefined) {
    if (!token) return undefined;
    const { db } = getPlatform();
    return db
        .select()
        .from(guests)
        .where(and(eq(guests.invitationId, invitationId), eq(guests.token, token)))
        .get();
}

export type GuestRow = typeof guests.$inferSelect;
export type GroupRow = typeof guestGroups.$inferSelect;

export interface ResolvedLink {
    guest?: GuestRow;
    group?: GroupRow;
    viewer?: Viewer;
}

// The ?g= token: one family's link, a group's link or a side's main link.
export async function resolveLink(
    invitationId: string,
    token: string | undefined,
): Promise<ResolvedLink> {
    if (!token) return {};
    const guest = await findGuest(invitationId, token);
    if (guest)
        return {
            guest,
            viewer: {
                side: guest.side,
                groupId: guest.groupId,
                eventIds: guest.allowedEventIds,
            },
        };
    const group = await getPlatform()
        .db.select()
        .from(guestGroups)
        .where(and(eq(guestGroups.invitationId, invitationId), eq(guestGroups.token, token)))
        .get();
    if (!group) return {};
    return {
        group,
        viewer: group.kind === 'side' ? { side: group.side } : { groupId: group.id },
    };
}

// The first time a family opens their link, so the couple can see who has looked.
export async function markOpened(guestId: string) {
    await getPlatform()
        .db.update(guests)
        .set({ openedAt: new Date().toISOString() })
        .where(and(eq(guests.id, guestId), isNull(guests.openedAt)));
}

export interface ReplyExtras {
    counts?: Record<string, number>;
    manual?: boolean;
}

export async function createRsvp(
    invitationId: string,
    input: RsvpInput,
    guestId: string | undefined,
    syncToSheet: boolean,
    extra: ReplyExtras = {},
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
            counts: input.attending ? (extra.counts ?? null) : null,
            manual: extra.manual ?? false,
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

// ── Guest lists, RSVP reporting, wish moderation ───────────────────────────
export async function listGuests(invitationId: string) {
    const { db } = getPlatform();
    return db
        .select({
            id: guests.id,
            displayName: guests.displayName,
            token: guests.token,
            phone: guests.phone,
            maxGuests: guests.maxGuests,
            side: guests.side,
            groupId: guests.groupId,
            note: guests.note,
            allowedEventIds: guests.allowedEventIds,
            sentAt: guests.sentAt,
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

export interface GuestPlacement {
    side?: Side | null;
    groupId?: string | null;
}

export async function importGuests(
    invitationId: string,
    rows: ParsedGuest[],
    makeToken: () => string,
    placement: GuestPlacement = {},
) {
    const { db } = getPlatform();
    if (!rows.length) return 0;
    const groupId = await ownGroupId(invitationId, placement.groupId);
    for (let i = 0; i < rows.length; i += 50) {
        await db.insert(guests).values(
            rows.slice(i, i + 50).map((r) => ({
                invitationId,
                displayName: r.displayName,
                phone: r.phone,
                maxGuests: r.maxGuests,
                side: placement.side ?? null,
                groupId,
                token: makeToken(),
            })),
        );
    }
    return rows.length;
}

// A group id from the browser is used only if it is one of this invitation's own groups.
async function ownGroupId(invitationId: string, groupId: string | null | undefined) {
    if (!groupId) return null;
    const row = await getPlatform()
        .db.select({ id: guestGroups.id })
        .from(guestGroups)
        .where(
            and(
                eq(guestGroups.invitationId, invitationId),
                eq(guestGroups.id, groupId),
                eq(guestGroups.kind, 'group'),
            ),
        )
        .get();
    return row?.id ?? null;
}

const cleanPhone = (phone: string | undefined) =>
    phone ? phone.replace(/[^\d+]/g, '').slice(0, 20) || null : null;

export async function addGuest(invitationId: string, input: GuestInput, token: string) {
    const [row] = await getPlatform()
        .db.insert(guests)
        .values({
            invitationId,
            token,
            displayName: input.displayName,
            phone: cleanPhone(input.phone),
            side: input.side ?? null,
            groupId: await ownGroupId(invitationId, input.groupId),
            maxGuests: input.maxGuests ?? null,
            note: input.note || null,
        })
        .returning({ id: guests.id });
    return row;
}

export async function updateGuest(invitationId: string, guestId: string, input: GuestInput) {
    await getPlatform()
        .db.update(guests)
        .set({
            displayName: input.displayName,
            phone: cleanPhone(input.phone),
            side: input.side ?? null,
            groupId: await ownGroupId(invitationId, input.groupId),
            maxGuests: input.maxGuests ?? null,
            note: input.note || null,
        })
        .where(and(eq(guests.invitationId, invitationId), eq(guests.id, guestId)));
}

export async function markSent(invitationId: string, guestId: string) {
    await getPlatform()
        .db.update(guests)
        .set({ sentAt: new Date().toISOString() })
        .where(and(eq(guests.invitationId, invitationId), eq(guests.id, guestId)));
}

export async function deleteGuest(invitationId: string, guestId: string) {
    const { db } = getPlatform();
    // Their replies and wishes stay; they just no longer point at a family on the list.
    await db
        .update(rsvps)
        .set({ guestId: null })
        .where(and(eq(rsvps.invitationId, invitationId), eq(rsvps.guestId, guestId)));
    await db
        .update(wishes)
        .set({ guestId: null })
        .where(and(eq(wishes.invitationId, invitationId), eq(wishes.guestId, guestId)));
    await db
        .delete(guests)
        .where(and(eq(guests.invitationId, invitationId), eq(guests.id, guestId)));
}

// ── Groups and each family's main link ─────────────────────────────────────

export async function listGroups(invitationId: string) {
    return getPlatform()
        .db.select()
        .from(guestGroups)
        .where(eq(guestGroups.invitationId, invitationId))
        .orderBy(asc(guestGroups.sort), asc(guestGroups.createdAt));
}

// Two people, two families: each gets a main link for everyone it invites. Made on first use.
export async function ensureSideLinks(invitationId: string, makeToken: () => string) {
    const { db } = getPlatform();
    const existing = await db
        .select({ side: guestGroups.side })
        .from(guestGroups)
        .where(and(eq(guestGroups.invitationId, invitationId), eq(guestGroups.kind, 'side')));
    const have = new Set(existing.map((r) => r.side));
    const missing = (['one', 'two'] as const).filter((s) => !have.has(s));
    if (missing.length)
        await db
            .insert(guestGroups)
            .values(
                missing.map((side) => ({
                    invitationId,
                    kind: 'side' as const,
                    side,
                    token: makeToken(),
                })),
            )
            .onConflictDoNothing();
}

export async function createGroup(invitationId: string, name: string, token: string) {
    const [row] = await getPlatform()
        .db.insert(guestGroups)
        .values({
            invitationId,
            name,
            token,
        })
        .returning({ id: guestGroups.id });
    return row;
}

export async function renameGroup(invitationId: string, groupId: string, name: string) {
    await getPlatform()
        .db.update(guestGroups)
        .set({ name })
        .where(
            and(
                eq(guestGroups.invitationId, invitationId),
                eq(guestGroups.id, groupId),
                eq(guestGroups.kind, 'group'),
            ),
        );
}

// Its families stay on the list and see what everyone sees; its functions lose it as an audience.
export async function deleteGroup(invitationId: string, groupId: string) {
    const { db } = getPlatform();
    const group = await ownGroupId(invitationId, groupId);
    if (!group) return;
    const events = await db
        .select({
            id: invitationEvents.id,
            kind: invitationEvents.kind,
            title: invitationEvents.title,
            audience: invitationEvents.audience,
        })
        .from(invitationEvents)
        .where(eq(invitationEvents.invitationId, invitationId));
    const key = `g:${group}`;
    const touched = events.filter((e) => e.audience?.includes(key));
    // An empty audience means everyone: removing a function's only group would make it public.
    const alone = touched.find((e) => e.audience?.every((k) => k === key));
    if (alone)
        throw new OrderError(
            `${pickText(alone.title, 'en') || alone.kind} is only for this group. Pick who else it’s for under Who sees what, then remove the group.`,
        );
    await db
        .update(guests)
        .set({ groupId: null })
        .where(and(eq(guests.invitationId, invitationId), eq(guests.groupId, group)));
    if (touched.length)
        await setAudience(
            invitationId,
            Object.fromEntries(
                touched.map((e) => [e.id, (e.audience ?? []).filter((k) => k !== key)]),
            ),
        );
    await db.delete(guestGroups).where(eq(guestGroups.id, group));
}

// ── Who sees each function ─────────────────────────────────────────────────

// Keys are kept only if they name a side or one of this invitation's groups.
export async function setAudience(invitationId: string, audience: Record<string, string[]>) {
    const { db } = getPlatform();
    const groups = await db
        .select({ id: guestGroups.id })
        .from(guestGroups)
        .where(and(eq(guestGroups.invitationId, invitationId), eq(guestGroups.kind, 'group')));
    const known = new Set(groups.map((g) => `g:${g.id}`));
    const valid = (key: string) => isSide(key) || known.has(key);
    const ids = Object.keys(audience);
    if (!ids.length) return;
    const events = await db
        .select({ id: invitationEvents.id })
        .from(invitationEvents)
        .where(
            and(eq(invitationEvents.invitationId, invitationId), inArray(invitationEvents.id, ids)),
        );
    const updates = events.map((e) => {
        const asked = audience[e.id] ?? [];
        const keys = [...new Set(asked.filter(valid))];
        // Never open a function to everyone because the group it was meant for has gone.
        if (asked.length > 0 && keys.length === 0)
            throw new OrderError('One of those groups was removed. Reload and pick again');
        return db
            .update(invitationEvents)
            .set({ audience: keys.length ? keys : null })
            .where(eq(invitationEvents.id, e.id));
    });
    const [first, ...rest] = updates;
    if (first) await db.batch([first, ...rest]);
    await refreshLive(invitationId);
}

// A new version, so the page (cached per data centre), the link preview and the PDF are all made
// again: an older copy of any of them could still show a function that is now private.
async function refreshLive(invitationId: string) {
    const { db } = getPlatform();
    const [row] = await db
        .update(invitations)
        .set({
            version: sql`case when ${invitations.status} = 'published' then ${invitations.version} + 1 else ${invitations.version} end`,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(invitations.id, invitationId))
        .returning({
            slug: invitations.slug,
            version: invitations.version,
            status: invitations.status,
        });
    if (row?.status === 'published') await invalidateInvitationCache(row.slug, row.version - 1);
}

// ── Replies ─────────────────────────────────────────────────────────────────

export async function setReplies(invitationId: string, input: RepliesInput) {
    const { db } = getPlatform();
    const row = await db
        .select({ extras: invitations.extras })
        .from(invitations)
        .where(eq(invitations.id, invitationId))
        .get();
    if (!row) return;
    const number = (phone: string | undefined) => phone?.replace(/[^\d+]/g, '') || undefined;
    const family = (side: Side) => {
        const own = input.sides?.[side];
        return (
            own && {
                enabled: own.enabled,
                whatsapp: number(own.whatsapp),
            }
        );
    };
    const replies = {
        whatsapp: number(input.whatsapp),
        by: input.by || undefined,
        message: input.message || undefined,
        reminder: input.reminder || undefined,
        sides: input.sides && {
            one: family('one'),
            two: family('two'),
        },
    };
    await db
        .update(invitations)
        .set({
            rsvpEnabled: input.enabled,
            extras: {
                ...row.extras,
                replies,
            },
        })
        .where(eq(invitations.id, invitationId));
    await refreshLive(invitationId);
}

export async function addManualReply(
    invitationId: string,
    guestId: string,
    input: ManualReplyInput,
) {
    const guest = await getPlatform()
        .db.select()
        .from(guests)
        .where(and(eq(guests.invitationId, invitationId), eq(guests.id, guestId)))
        .get();
    if (!guest) return false;
    // Only functions this family is invited to, as if they had replied from their own link.
    const shown = new Set(
        visibleEvents(await eventAudiences(invitationId), {
            side: guest.side,
            groupId: guest.groupId,
            eventIds: guest.allowedEventIds,
        }).map((e) => e.id),
    );
    const counts = Object.fromEntries(
        Object.entries(input.counts).filter(([id, n]) => n > 0 && shown.has(id)),
    );
    const coming = input.attending && Object.keys(counts).length > 0;
    await createRsvp(
        invitationId,
        {
            name: guest.displayName,
            attending: coming,
            guestCount: Math.max(1, ...Object.values(counts)),
            eventIds: Object.keys(counts),
            message: input.message,
        },
        guest.id,
        false,
        {
            counts,
            manual: true,
        },
    );
    return true;
}

export async function listRsvps(invitationId: string) {
    const { db } = getPlatform();
    return db
        .select({
            id: rsvps.id,
            guestId: rsvps.guestId,
            name: rsvps.name,
            phone: rsvps.phone,
            attending: rsvps.attending,
            guestCount: rsvps.guestCount,
            eventIds: rsvps.eventIds,
            counts: rsvps.counts,
            manual: rsvps.manual,
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
