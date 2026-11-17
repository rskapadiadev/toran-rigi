import { applyLayout } from '@shared/blocks';
import { PDF_ADDON } from '@shared/catalog';
import { cultureOf } from '@shared/cultures';
import { seedFrom } from '@shared/generative';
import { newToken } from '@shared/ids';
import { defaultSectionsFor, occasionOf } from '@shared/occasions';
import { photosInUse } from '@shared/photos';
import type { SaveInvitationInput } from '@shared/schemas/composer';
import { themeBySlug, themeLayouts } from '@shared/themes';
import type { PackageLimits } from '@shared/types';
import { asc, desc, eq, sql } from 'drizzle-orm';

import {
    customers,
    guests,
    invitationEvents,
    invitations,
    orders,
    packages,
    rsvps,
    themes,
    wishes,
} from '../db/schema';
import { getPlatform } from '../platform/context';
import { invoicesForOrder, setOrderAddon } from './billing';
import { invalidateInvitationCache } from './invitations';
import { resolveMusic } from './music';
import { OrderError } from './orders';
import { isSlugFree, starterContent, uniqueSlug } from './slugs';
import {
    copyInvitation,
    getTemplate,
    syncTemplateFromInvitation,
    templateForInvitation,
} from './templates';

export { isSlugFree };

export type InvitationSource = { templateId: string } | { themeSlug: string };

// Starts an invitation for an order, from a template (its design, sample text, sections and
// ceremonies) or from a bare theme. The designer personalises it next.
export async function createInvitationForOrder(orderId: string, source: InvitationSource) {
    const { db } = getPlatform();
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) throw new OrderError('Order not found');
    const existing = await db
        .select({ id: invitations.id })
        .from(invitations)
        .where(eq(invitations.orderId, orderId))
        .get();
    if (existing) return existing.id;
    const customer = await db
        .select()
        .from(customers)
        .where(eq(customers.id, order.customerId))
        .get();
    const culture = cultureOf(order.culture);
    const occasion = occasionOf(order.eventKind);
    const slug = await uniqueSlug(customer?.name ?? order.number);
    const personal = {
        orderId,
        slug,
        culture: order.culture,
        eventKind: occasion.id,
        locales: [customer?.locale ?? 'en'],
        seed: seedFrom(customer?.name ?? slug, order.weddingDate ?? ''),
        isDemo: false,
    };

    if ('templateId' in source) {
        const template = await getTemplate(source.templateId);
        if (!template || template.status === 'archived') throw new OrderError('Template not found');
        // A wedding template's sections (couple, families…) do not fit a birthday or a prayer meet.
        if (occasionOf(template.eventKind).category !== occasion.category)
            throw new OrderError(
                `“${template.name}” is made for ${occasionOf(template.eventKind).name.en}; pick a template for ${occasion.name.en}`,
            );
        return copyInvitation(template.invitationId, {
            keepPeople: false,
            overrides: personal,
        });
    }

    const theme = themeBySlug(source.themeSlug) ?? themeBySlug('editorial');
    if (!theme) throw new OrderError('Theme not found');
    const themeRow = await db
        .select({ id: themes.id })
        .from(themes)
        .where(eq(themes.slug, theme.slug))
        .get();
    const [row] = await db
        .insert(invitations)
        .values({
            ...personal,
            themeId: themeRow?.id,
            calendars: culture.calendars.filter((c) => c !== 'gregorian'),
            design: theme.design,
            content: starterContent(occasion, culture),
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
    const [events, theme, order, counts, template] = await Promise.all([
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
        invitation.isDemo ? templateForInvitation(id) : undefined,
    ]);
    return {
        invitation,
        events,
        themeSlug: theme?.slug ?? null,
        order: order ?? null,
        template: template ?? null,
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
    if (photosInUse(input.content).length > limits.photos)
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
    // The PDF download is a paid add-on: switching it puts it on (or takes it off) the invoice.
    const pdfBefore = current.invitation.extras.pdf?.enabled ?? false;
    const pdfAfter = input.extras.pdf?.enabled ?? false;
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
                // The server picks the file to play (see resolveMusic): never a key the browser sent.
                ...(await resolveMusic(id, input.extras.music)),
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
    if (current.template) await syncTemplateFromInvitation(id);
    if (current.order && pdfBefore !== pdfAfter)
        await setOrderAddon(current.order.id, PDF_ADDON, pdfAfter);
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
    return (
        db
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
            // Template samples live under Templates, not with real customers' invitations.
            .where(eq(invitations.isDemo, false))
            .orderBy(desc(invitations.updatedAt))
            .limit(300)
    );
}
