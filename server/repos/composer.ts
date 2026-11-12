import { applyLayout } from '@shared/blocks';
import { reservedSlugList } from '@shared/catalog';
import { cultureOf } from '@shared/cultures';
import { seedFrom } from '@shared/generative';
import { newToken } from '@shared/ids';
import { defaultSectionsFor, greetingsFor, isCouple, occasionOf } from '@shared/occasions';
import type { SaveInvitationInput } from '@shared/schemas/composer';
import { themeBySlug, themeLayouts } from '@shared/themes';
import type { PackageLimits } from '@shared/types';
import { and, asc, desc, eq, ne, sql } from 'drizzle-orm';

import {
    customers,
    guests,
    invitationEvents,
    invitations,
    orders,
    packages,
    reservedSlugs,
    rsvps,
    themes,
    wishes,
} from '../db/schema';
import { getPlatform } from '../platform/context';
import { invoicesForOrder } from './billing';
import { invalidateInvitationCache } from './invitations';
import { OrderError } from './orders';

const slugify = (text: string) =>
    text
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);

export async function isSlugFree(slug: string, exceptId?: string) {
    const { db } = getPlatform();
    if (reservedSlugList.includes(slug)) return false;
    const [reserved, taken] = await Promise.all([
        db.select().from(reservedSlugs).where(eq(reservedSlugs.slug, slug)).get(),
        db
            .select({ id: invitations.id })
            .from(invitations)
            .where(
                exceptId
                    ? and(eq(invitations.slug, slug), ne(invitations.id, exceptId))
                    : eq(invitations.slug, slug),
            )
            .get(),
    ]);
    return !reserved && !taken;
}

async function uniqueSlug(base: string) {
    const root = slugify(base) || 'celebration';
    for (let i = 0; i < 50; i++) {
        const candidate = i === 0 ? root : `${root}-${i + 1}`;
        if (await isSlugFree(candidate)) return candidate;
    }
    return `${root}-${newToken().slice(0, 6).toLowerCase()}`;
}

// Starts an invitation from the order's occasion, culture and theme; the designer personalises it next.
export async function createInvitationForOrder(orderId: string, themeSlug: string) {
    const { db } = getPlatform();
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) throw new OrderError('Order not found');
    const existing = await db
        .select({ id: invitations.id })
        .from(invitations)
        .where(eq(invitations.orderId, orderId))
        .get();
    if (existing) return existing.id;
    const theme = themeBySlug(themeSlug) ?? themeBySlug('editorial');
    if (!theme) throw new OrderError('Theme not found');
    const customer = await db
        .select()
        .from(customers)
        .where(eq(customers.id, order.customerId))
        .get();
    const culture = cultureOf(order.culture);
    const occasion = occasionOf(order.eventKind);
    const themeRow = await db
        .select({ id: themes.id })
        .from(themes)
        .where(eq(themes.slug, theme.slug))
        .get();
    const slug = await uniqueSlug(customer?.name ?? order.number);
    const [row] = await db
        .insert(invitations)
        .values({
            orderId,
            slug,
            themeId: themeRow?.id,
            culture: order.culture,
            eventKind: occasion.id,
            locales: [customer?.locale ?? 'en'],
            calendars: culture.calendars.filter((c) => c !== 'gregorian'),
            seed: seedFrom(customer?.name ?? slug, order.weddingDate ?? ''),
            design: theme.design,
            content: {
                people: {
                    one: { name: { en: occasion.people.one.label } },
                    ...(isCouple(occasion) && occasion.people.two
                        ? { two: { name: { en: occasion.people.two.label } } }
                        : {}),
                },
                greetingKey: greetingsFor(culture, occasion)[0]?.key,
                ...occasion.starter,
                gallery: [],
            },
            // Remembrance notices take no RSVP by default; the family can still switch it on.
            rsvpEnabled: !occasion.sections.forbidden.includes('rsvp'),
            sections: applyLayout(
                defaultSectionsFor(occasion, culture).map((type) => ({
                    type,
                    enabled: true,
                })),
                themeLayouts[theme.slug],
            ),
            extras: { wishes: { enabled: true } },
            previewToken: newToken(),
            status: 'draft',
        })
        .returning({ id: invitations.id });
    if (!row) throw new OrderError('Could not create invitation');
    return row.id;
}

export async function invitationForEdit(id: string) {
    const { db } = getPlatform();
    const invitation = await db.select().from(invitations).where(eq(invitations.id, id)).get();
    if (!invitation) return null;
    const [events, theme, order, counts] = await Promise.all([
        db
            .select()
            .from(invitationEvents)
            .where(eq(invitationEvents.invitationId, id))
            .orderBy(asc(invitationEvents.sort)),
        invitation.themeId
            ? db
                  .select({ slug: themes.slug })
                  .from(themes)
                  .where(eq(themes.id, invitation.themeId))
                  .get()
            : undefined,
        invitation.orderId
            ? db
                  .select({
                      id: orders.id,
                      number: orders.number,
                      packageCode: orders.packageCode,
                      limits: packages.limits,
                  })
                  .from(orders)
                  .innerJoin(packages, eq(packages.code, orders.packageCode))
                  .where(eq(orders.id, invitation.orderId))
                  .get()
            : undefined,
        db
            .select({
                guests: sql<number>`(select count(*) from ${guests} where ${guests.invitationId} = ${id})`,
                rsvps: sql<number>`(select count(*) from ${rsvps} where ${rsvps.invitationId} = ${id})`,
                pendingWishes: sql<number>`(select count(*) from ${wishes} where ${wishes.invitationId} = ${id} and ${wishes.status} = 'pending')`,
            })
            .from(invitations)
            .where(eq(invitations.id, id))
            .get(),
    ]);
    return {
        invitation,
        events,
        themeSlug: theme?.slug ?? null,
        order: order ?? null,
        counts: counts ?? {
            guests: 0,
            rsvps: 0,
            pendingWishes: 0,
        },
    };
}

function enforceLimits(input: SaveInvitationInput, limits: PackageLimits | undefined) {
    if (!limits) return;
    if (input.events.length > limits.events)
        throw new OrderError(
            `This package allows ${limits.events} ceremonies — add the “Extra ceremony” add-on for more`,
        );
    if (input.locales.length > limits.languages)
        throw new OrderError(`This package allows ${limits.languages} language(s)`);
    if (input.content.gallery.length > limits.photos)
        throw new OrderError(`This package allows ${limits.photos} photos`);
}

export async function saveInvitation(id: string, input: SaveInvitationInput) {
    const { db } = getPlatform();
    const current = await invitationForEdit(id);
    if (!current) throw new OrderError('Invitation not found');
    enforceLimits(input, current.order?.limits);
    const themeRow = input.themeSlug
        ? await db
              .select({ id: themes.id })
              .from(themes)
              .where(eq(themes.slug, input.themeSlug))
              .get()
        : undefined;
    const wasLive = current.invitation.status === 'published';
    // Editing a live invitation bumps the version so guests see the change immediately.
    const version = wasLive ? current.invitation.version + 1 : current.invitation.version;

    await db.batch([
        db
            .update(invitations)
            .set({
                eventKind: input.occasion,
                culture: input.culture,
                themeId: themeRow?.id ?? current.invitation.themeId,
                locales: input.locales,
                calendars: input.calendars,
                seed: input.seed,
                design: input.design,
                content: input.content,
                sections: input.sections,
                extras: input.extras,
                rsvpEnabled: input.rsvpEnabled,
                version,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(invitations.id, id)),
        db.delete(invitationEvents).where(eq(invitationEvents.invitationId, id)),
        ...input.events.map((e, sort) =>
            db.insert(invitationEvents).values({
                id: e.id && e.id.length > 4 ? e.id : undefined,
                invitationId: id,
                kind: e.kind,
                title: e.title,
                startsAt: e.startsAt,
                endsAt: e.endsAt || null,
                timezone: e.timezone,
                venue: e.venue,
                address: e.address,
                mapsUrl: e.mapsUrl || null,
                description: e.description,
                dressCode: e.dressCode,
                sort,
            }),
        ),
    ]);
    if (wasLive)
        await invalidateInvitationCache(current.invitation.slug, current.invitation.version);
    return invitationForEdit(id);
}

export async function setSlug(id: string, slug: string) {
    const { db } = getPlatform();
    if (!(await isSlugFree(slug, id))) throw new OrderError('That link is taken — try another');
    const current = await db.select().from(invitations).where(eq(invitations.id, id)).get();
    if (!current) throw new OrderError('Invitation not found');
    await db
        .update(invitations)
        .set({
            slug,
            version: current.version + 1,
        })
        .where(eq(invitations.id, id));
    await invalidateInvitationCache(current.slug, current.version);
}

export async function setInvitationStatus(
    id: string,
    status: 'draft' | 'preview' | 'published' | 'archived',
    allowBalance = false,
) {
    const { db } = getPlatform();
    const current = await invitationForEdit(id);
    if (!current) throw new OrderError('Invitation not found');
    if (status === 'published' && current.order && !allowBalance) {
        const balance = (await invoicesForOrder(current.order.id))
            .filter((i) => i.status !== 'void')
            .reduce((sum, i) => sum + i.balanceDue, 0);
        if (balance > 0)
            throw new OrderError('Balance outstanding — collect payment before publishing');
    }
    const now = new Date();
    const hostingMonths = current.order?.limits.hostingMonths ?? 12;
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + hostingMonths);
    await db
        .update(invitations)
        .set({
            status,
            version: current.invitation.version + 1,
            publishedAt:
                status === 'published'
                    ? (current.invitation.publishedAt ?? now.toISOString())
                    : current.invitation.publishedAt,
            expiresAt:
                status === 'published'
                    ? (current.invitation.expiresAt ?? expires.toISOString())
                    : current.invitation.expiresAt,
        })
        .where(eq(invitations.id, id));
    await invalidateInvitationCache(current.invitation.slug, current.invitation.version);
}

export async function listInvitations() {
    const { db } = getPlatform();
    return db
        .select({
            id: invitations.id,
            slug: invitations.slug,
            status: invitations.status,
            culture: invitations.culture,
            eventKind: invitations.eventKind,
            isDemo: invitations.isDemo,
            content: invitations.content,
            updatedAt: invitations.updatedAt,
            expiresAt: invitations.expiresAt,
            orderNumber: orders.number,
            customerName: customers.name,
        })
        .from(invitations)
        .leftJoin(orders, eq(orders.id, invitations.orderId))
        .leftJoin(customers, eq(customers.id, orders.customerId))
        .orderBy(asc(invitations.isDemo), desc(invitations.updatedAt))
        .limit(300);
}
