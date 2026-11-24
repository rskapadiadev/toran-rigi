// The self-serve shop: customers browse published templates, try one, buy it and then edit their own
// copy (words, photos, ceremonies only; the design stays as the studio made it).
import { cultureOf } from '@shared/cultures';
import { type RateSnapshot, shopCurrencyFor } from '@shared/fx';
import { occasionOf } from '@shared/occasions';
import { shopPrice } from '@shared/pricing';
import type { EventInput, SaveInvitationInput } from '@shared/schemas/composer';
import type { InvitationContent } from '@shared/types';
import { and, asc, desc, eq, gt } from 'drizzle-orm';

import {
    customers,
    invitations,
    orderEvents,
    orders,
    packages,
    sessions,
    templates,
    themes,
} from '../db/schema';
import { getPlatform } from '../platform/context';
import { usdRates } from '../services/fx';
import { invoicesForOrder, recordPayment } from './billing';
import {
    createInvitationForOrder,
    invitationForEdit,
    saveInvitation,
    setInvitationStatus,
} from './composer';
import { createOrder, OrderError } from './orders';

export interface StoreCustomer {
    id: string;
    name: string;
    email: string | null;
}

// ── Customer sessions ───────────────────────────────────────────────────────

export async function createCustomerSession(
    tokenHash: string,
    customerId: string,
    expiresAt: string,
) {
    await getPlatform().db.insert(sessions).values({
        id: tokenHash,
        kind: 'customer',
        subjectId: customerId,
        expiresAt,
    });
}

export async function customerForSession(tokenHash: string): Promise<StoreCustomer | undefined> {
    const { db } = getPlatform();
    return db
        .select({
            id: customers.id,
            name: customers.name,
            email: customers.email,
        })
        .from(sessions)
        .innerJoin(customers, eq(customers.id, sessions.subjectId))
        .where(
            and(
                eq(sessions.id, tokenHash),
                eq(sessions.kind, 'customer'),
                gt(sessions.expiresAt, new Date().toISOString()),
            ),
        )
        .get();
}

// Signing in is also signing up: the first code verified for an email makes the customer.
export async function customerByEmail(email: string) {
    const { db } = getPlatform();
    const existing = await db.select().from(customers).where(eq(customers.email, email)).get();
    if (existing) return existing;
    const [created] = await db
        .insert(customers)
        .values({
            name: email.split('@')[0] ?? email,
            email,
            source: 'website',
        })
        .returning();
    if (!created) throw new OrderError('Could not create your account');
    return created;
}

// ── Catalogue ───────────────────────────────────────────────────────────────

// The visitor's shop currency: rupees in India, otherwise their own currency when the rate snapshot
// has it (else dollars). A currency they picked in the switcher wins when the shop can price it.
export async function shopCurrency(country: string | null | undefined, picked?: string | null) {
    const rates = await usdRates();
    const choice = picked?.toUpperCase();
    const currency =
        choice && (choice === 'INR' || choice === 'USD' || rates?.rates[choice])
            ? choice
            : shopCurrencyFor(country, rates);
    return {
        currency,
        rates,
    };
}

export async function listStoreTemplates(currency: string, rates: RateSnapshot | null) {
    const { db } = getPlatform();
    const rows = await db
        .select({
            slug: templates.slug,
            name: templates.name,
            description: templates.description,
            eventKind: templates.eventKind,
            culture: templates.culture,
            isFeatured: templates.isFeatured,
            prices: templates.prices,
            comparePrices: templates.comparePrices,
            sampleSlug: invitations.slug,
            posterKey: templates.posterKey,
            design: invitations.design,
            themeName: themes.name,
        })
        .from(templates)
        .innerJoin(invitations, eq(invitations.id, templates.invitationId))
        .leftJoin(themes, eq(themes.id, templates.themeId))
        .where(eq(templates.status, 'published'))
        .orderBy(desc(templates.isFeatured), asc(templates.sort), asc(templates.name));
    return rows.map(({ prices, comparePrices, ...row }) => {
        const shop = shopPrice(prices, comparePrices, currency, rates);
        return {
            ...row,
            price: shop?.price ?? null,
            comparePrice: shop?.compare ?? null,
            off: shop?.off ?? null,
        };
    });
}

async function publishedTemplate(slug: string) {
    const { db } = getPlatform();
    const template = await db
        .select()
        .from(templates)
        .where(and(eq(templates.slug, slug), eq(templates.status, 'published')))
        .get();
    if (!template) throw new OrderError('This design is no longer available');
    return template;
}

// What a purchase includes (photos, ceremonies, hosting). Never shown to customers as a package.
async function includedLimits(code: string) {
    const { db } = getPlatform();
    return db
        .select({
            code: packages.code,
            limits: packages.limits,
        })
        .from(packages)
        .where(eq(packages.code, code))
        .get();
}

// Everything the try page needs: the sample invitation as the editor loads it, plus the price.
export async function storeTemplate(slug: string, currency: string, rates: RateSnapshot | null) {
    const template = await publishedTemplate(slug);
    const edit = await invitationForEdit(template.invitationId);
    if (!edit) throw new OrderError('This design is no longer available');
    const pkg = await includedLimits(template.fromPackage);
    const shop = shopPrice(template.prices, template.comparePrices, currency, rates);
    const offer =
        pkg && shop
            ? {
                  ...pkg,
                  price: shop.price,
                  comparePrice: shop.compare,
                  off: shop.off,
              }
            : null;
    return {
        template: {
            slug: template.slug,
            name: template.name,
            description: template.description,
        },
        offer: offer
            ? {
                  ...offer,
                  currency,
              }
            : null,
        edit: {
            ...edit,
            order: offer
                ? {
                      id: '',
                      number: '',
                      packageCode: offer.code,
                      limits: offer.limits,
                  }
                : null,
            template: null,
        },
    };
}

// ── The customer's own words ────────────────────────────────────────────────

export interface ShopWhere {
    currency: string;
    rates: RateSnapshot | null;
    country?: string | null;
}

export interface CustomerContent {
    content: InvitationContent;
    events: EventInput[];
}

// Edits close the day after the last ceremony, like a printed card that has already gone out.
export function lockedAfter(events: readonly { startsAt: string }[]): string | null {
    const last = events
        .map((e) => e.startsAt.slice(0, 10))
        .sort()
        .at(-1);
    if (!last) return null;
    const d = new Date(`${last}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 2);
    return d.toISOString();
}

async function applyContent(invitationId: string, input: CustomerContent) {
    const current = await invitationForEdit(invitationId);
    if (!current) throw new OrderError('Invitation not found');
    const { invitation } = current;
    // A ceremony keeps its id only if it is one of this invitation's own: ones typed while trying
    // still carry the template's ids, which belong to the template.
    const own = new Set(current.events.map((e) => e.id));
    const events = input.events.map(({ id, ...event }) =>
        id && own.has(id)
            ? {
                  id,
                  ...event,
              }
            : event,
    );
    // Only words, photos and ceremonies come from the customer; the design is kept as stored.
    const save: SaveInvitationInput = {
        occasion: occasionOf(invitation.eventKind).id,
        culture: invitation.culture,
        themeSlug: current.themeSlug ?? undefined,
        locales: invitation.locales,
        calendars: invitation.calendars.filter(
            (c): c is 'islamic-umalqura' | 'hebrew' => c === 'islamic-umalqura' || c === 'hebrew',
        ),
        seed: invitation.seed,
        design: invitation.design,
        content: input.content,
        sections: invitation.sections,
        extras: invitation.extras,
        rsvpEnabled: invitation.rsvpEnabled,
        events,
    };
    await saveInvitation(invitationId, save);
}

const coupleName = (content: InvitationContent) =>
    [content.people.one.name.en, content.people.two?.name.en]
        .map((n) => n?.trim())
        .filter(Boolean)
        .join(' & ');

// "Buy & keep": an order and invoice for the template's package, and the customer's own copy of the
// template carrying the words they wrote while trying it. Payment follows.
export async function buyTemplate(
    customer: StoreCustomer,
    slug: string,
    input: CustomerContent,
    where: ShopWhere,
) {
    const { db } = getPlatform();
    const { currency, rates, country } = where;
    const template = await publishedTemplate(slug);
    const name = coupleName(input.content) || customer.name;
    // Charged exactly what the shop showed, in the currency it showed.
    const own = shopPrice(template.prices, template.comparePrices, currency, rates)?.price;
    if (own === undefined) throw new OrderError('This design can’t be bought in your currency yet');
    const firstDate = input.events.map((e) => e.startsAt.slice(0, 10)).sort()[0];
    const order = await createOrder(
        {
            customer: {
                name,
                email: customer.email ?? undefined,
                country: country?.toUpperCase() ?? (currency === 'INR' ? 'IN' : 'US'),
            },
            packageCode: template.fromPackage,
            addons: [],
            currency,
            occasion: occasionOf(template.eventKind).id,
            culture: cultureOf(template.culture).id,
            weddingDate: firstDate,
            notes: `Ordered online from the “${template.name}” template.`,
        },
        null,
        {
            packagePrice: own,
            packageLine: `${template.name} invitation`,
        },
    );
    // The account was made from an email; the invitation's names are a better label for the studio.
    if (customer.name === customer.email?.split('@')[0] && name !== customer.name)
        await db.update(customers).set({ name }).where(eq(customers.id, customer.id));
    const invitationId = await createInvitationForOrder(order.id, { templateId: template.id });
    await applyContent(invitationId, input);
    return {
        orderId: order.id,
        invitationId,
    };
}

async function ownedOrder(customerId: string, orderId: string) {
    const { db } = getPlatform();
    const order = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.customerId, customerId)))
        .get();
    if (!order) throw new OrderError('Order not found');
    return order;
}

const balanceOf = async (orderId: string) =>
    (await invoicesForOrder(orderId))
        .filter((i) => i.status !== 'void')
        .reduce((sum, i) => sum + i.balanceDue, 0);

interface OrderRef {
    id: string;
    status: string;
}

async function setOrderStatus(
    order: OrderRef,
    status: typeof orders.$inferSelect.status,
    body: string,
) {
    const { db } = getPlatform();
    if (order.status === status) return;
    await db.batch([
        db.update(orders).set({ status }).where(eq(orders.id, order.id)),
        db.insert(orderEvents).values({
            orderId: order.id,
            kind: 'status',
            fromStatus: order.status,
            toStatus: status,
            body,
        }),
    ]);
}

// Test checkout (PAYMENTS_DRIVER=fake): settles every open invoice as if the card went through.
export async function payOrderFake(customerId: string, orderId: string) {
    const order = await ownedOrder(customerId, orderId);
    for (const invoice of await invoicesForOrder(orderId)) {
        if (invoice.status === 'void' || invoice.balanceDue <= 0) continue;
        await recordPayment(invoice.id, {
            amount: invoice.balanceDue,
            method: 'online',
            reference: 'Test checkout',
            userId: null,
        });
    }
    await setOrderStatus(order, 'payment_received', 'Paid online (test checkout)');
}

export async function myInvitations(customerId: string) {
    const { db } = getPlatform();
    const rows = await db
        .select({
            id: invitations.id,
            slug: invitations.slug,
            status: invitations.status,
            content: invitations.content,
            design: invitations.design,
            orderId: orders.id,
            orderNumber: orders.number,
            createdAt: invitations.createdAt,
        })
        .from(invitations)
        .innerJoin(orders, eq(orders.id, invitations.orderId))
        .where(eq(orders.customerId, customerId))
        .orderBy(desc(invitations.createdAt));
    return Promise.all(
        rows.map(async ({ content, ...row }) => ({
            ...row,
            title: coupleName(content) || 'Your invitation',
            balance: await balanceOf(row.orderId),
        })),
    );
}

async function owned(customerId: string, invitationId: string) {
    const edit = await invitationForEdit(invitationId);
    if (!edit?.order) throw new OrderError('Invitation not found');
    await ownedOrder(customerId, edit.order.id);
    return edit;
}

export async function myInvitation(customerId: string, invitationId: string) {
    const edit = await owned(customerId, invitationId);
    const order = await ownedOrder(customerId, edit.order?.id ?? '');
    return {
        edit,
        orderId: order.id,
        balance: await balanceOf(order.id),
        currency: order.currency,
        price: order.totalMinor,
        lockedAfter: lockedAfter(edit.events),
    };
}

export async function saveMyContent(
    customerId: string,
    invitationId: string,
    input: CustomerContent,
) {
    const edit = await owned(customerId, invitationId);
    const lock = lockedAfter(edit.events);
    if (lock && Date.now() > Date.parse(lock))
        throw new OrderError(
            'The celebration has passed, so this invitation can no longer be edited',
        );
    await applyContent(invitationId, input);
}

export async function publishMine(customerId: string, invitationId: string) {
    const edit = await owned(customerId, invitationId);
    if (!edit.order) throw new OrderError('Invitation not found');
    // Refuses while anything is unpaid.
    await setInvitationStatus(invitationId, 'published');
    await setOrderStatus(
        await ownedOrder(customerId, edit.order.id),
        'published',
        'Published by the customer',
    );
}

export const ownsInvitation = async (customerId: string, invitationId: string) => {
    await owned(customerId, invitationId);
};
