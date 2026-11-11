import { and, asc, count, eq, sql } from 'drizzle-orm';

import { invitationEvents, invitations, rsvps, themes, wishes } from '../db/schema';
import { getPlatform } from '../platform/context';

export type InvitationRow = typeof invitations.$inferSelect;
export type InvitationEventRow = typeof invitationEvents.$inferSelect;

export interface PublicWish {
    id: string;
    name: string;
    message: string;
    createdAt: string;
}

export interface PublicInvitation {
    invitation: Omit<InvitationRow, 'previewToken' | 'sheetId' | 'orderId'>;
    events: InvitationEventRow[];
    themeSlug: string | null;
    diyaCount: number;
    wishes: PublicWish[];
}

const cacheKey = (slug: string, version: number) => `inv:${slug}:v${version}`;

async function loadFull(row: InvitationRow): Promise<PublicInvitation> {
    const { db } = getPlatform();
    const [events, theme, diya, approvedWishes] = await Promise.all([
        db
            .select()
            .from(invitationEvents)
            .where(eq(invitationEvents.invitationId, row.id))
            .orderBy(asc(invitationEvents.sort)),
        row.themeId
            ? db.select({ slug: themes.slug }).from(themes).where(eq(themes.id, row.themeId)).get()
            : undefined,
        db
            .select({ total: sql<number>`coalesce(sum(${rsvps.guestCount}), 0)` })
            .from(rsvps)
            .where(and(eq(rsvps.invitationId, row.id), eq(rsvps.attending, true)))
            .get(),
        db
            .select({
                id: wishes.id,
                name: wishes.name,
                message: wishes.message,
                createdAt: wishes.createdAt,
            })
            .from(wishes)
            .where(and(eq(wishes.invitationId, row.id), eq(wishes.status, 'approved')))
            .orderBy(asc(wishes.createdAt))
            .limit(60),
    ]);
    const { previewToken: _p, sheetId: _s, orderId: _o, ...publicRow } = row;
    return {
        invitation: publicRow,
        events,
        themeSlug: theme?.slug ?? null,
        diyaCount: diya?.total ?? 0,
        wishes: approvedWishes,
    };
}

// Cache-aside by version: publishing bumps `version`, so stale entries are never read again.
export async function getPublishedInvitation(slug: string): Promise<PublicInvitation | null> {
    const { db, cache } = getPlatform();
    const head = await db
        .select({
            id: invitations.id,
            version: invitations.version,
            status: invitations.status,
        })
        .from(invitations)
        .where(eq(invitations.slug, slug))
        .get();
    if (!head || (head.status !== 'published' && head.status !== 'archived')) return null;

    const key = cacheKey(slug, head.version);
    const cached = await cache.get<PublicInvitation>(key);
    if (cached) return cached;

    const row = await db.select().from(invitations).where(eq(invitations.id, head.id)).get();
    if (!row) return null;
    const full = await loadFull(row);
    await cache.set(key, full, 300);
    return full;
}

export async function getInvitationByPreviewToken(token: string): Promise<PublicInvitation | null> {
    const { db } = getPlatform();
    const row = await db
        .select()
        .from(invitations)
        .where(eq(invitations.previewToken, token))
        .get();
    return row ? loadFull(row) : null;
}

export async function getInvitationIdBySlug(slug: string) {
    const { db } = getPlatform();
    return db
        .select({
            id: invitations.id,
            status: invitations.status,
            rsvpEnabled: invitations.rsvpEnabled,
            extras: invitations.extras,
            slug: invitations.slug,
            version: invitations.version,
        })
        .from(invitations)
        .where(eq(invitations.slug, slug))
        .get();
}

export async function listDemoInvitations() {
    const { db } = getPlatform();
    return db
        .select({
            slug: invitations.slug,
            culture: invitations.culture,
            design: invitations.design,
            content: invitations.content,
            seed: invitations.seed,
            themeId: invitations.themeId,
        })
        .from(invitations)
        .where(eq(invitations.isDemo, true));
}

export async function countRsvps(invitationId: string) {
    const { db } = getPlatform();
    const row = await db
        .select({ n: count() })
        .from(rsvps)
        .where(eq(rsvps.invitationId, invitationId))
        .get();
    return row?.n ?? 0;
}

export async function invalidateInvitationCache(slug: string, version: number) {
    await getPlatform().cache.delete(cacheKey(slug, version));
}
