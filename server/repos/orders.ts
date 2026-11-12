import { newToken } from '@shared/ids';
import type { CreateOrderInput } from '@shared/schemas/admin';
import type { OrderStatus } from '@shared/types';
import { and, asc, desc, eq, gte, inArray, isNotNull, lte, or, sql } from 'drizzle-orm';

import {
    customers,
    invitations,
    invoices,
    orderEvents,
    orders,
    payments,
    users,
} from '../db/schema';
import { getPlatform } from '../platform/context';
import { createInvoice, invoicesForOrder, nextNumber } from './billing';
import { priceLines } from './catalog';

export class OrderError extends Error {}

async function findOrCreateCustomer(input: CreateOrderInput['customer']) {
    const { db } = getPlatform();
    const email = input.email ? input.email.toLowerCase() : undefined;
    const matchers = [
        email ? eq(customers.email, email) : undefined,
        input.phone ? eq(customers.phone, input.phone) : undefined,
    ].filter((m) => m !== undefined);
    const existing = matchers.length
        ? await db
              .select()
              .from(customers)
              .where(or(...matchers))
              .get()
        : undefined;
    if (existing) return existing;
    const [created] = await db
        .insert(customers)
        .values({
            name: input.name,
            email,
            phone: input.phone,
            country: input.country,
            city: input.city,
        })
        .returning();
    if (!created) throw new OrderError('Could not create customer');
    return created;
}

export async function createOrder(input: CreateOrderInput, userId: string) {
    const { db } = getPlatform();
    const pricing = await priceLines(input.packageCode, input.addons, input.currency);
    if (!pricing)
        throw new OrderError(`No ${input.currency} price for package ${input.packageCode}`);
    const customer = await findOrCreateCustomer(input.customer);
    const year = new Date().getFullYear();
    const number = `TR-${year}-${String(await nextNumber(`order:${year}`)).padStart(4, '0')}`;
    const total = pricing.pkg.amount + pricing.addons.reduce((sum, a) => sum + a.amount, 0);

    const [order] = await db
        .insert(orders)
        .values({
            number,
            customerId: customer.id,
            packageCode: input.packageCode,
            currency: input.currency,
            addons: pricing.addons.map((a) => a.code),
            totalMinor: total,
            status: 'awaiting_advance',
            eventKind: input.occasion,
            culture: input.culture,
            weddingDate: input.weddingDate || null,
            couponCode: input.couponCode,
            portalToken: newToken(),
        })
        .returning();
    if (!order) throw new OrderError('Order insert failed');

    await createInvoice({
        orderId: order.id,
        customerId: customer.id,
        currency: input.currency,
        items: [
            {
                kind: 'package',
                description: `${pricing.pkg.name} package`,
                qty: 1,
                unitPrice: pricing.pkg.amount,
            },
            ...pricing.addons.map((a) => ({
                kind: 'addon' as const,
                description: a.name,
                qty: 1,
                unitPrice: a.amount,
            })),
        ],
    });
    await db.insert(orderEvents).values([
        {
            orderId: order.id,
            kind: 'system',
            toStatus: 'awaiting_advance',
            body: 'Order created',
            userId,
        },
        ...(input.notes
            ? [
                  {
                      orderId: order.id,
                      kind: 'note' as const,
                      body: input.notes,
                      userId,
                  },
              ]
            : []),
    ]);
    return order;
}

export interface OrderFilter {
    status?: OrderStatus[];
    assignedTo?: string;
}

export async function listOrders(filter: OrderFilter) {
    const { db } = getPlatform();
    const conditions = [];
    if (filter.status?.length) conditions.push(inArray(orders.status, filter.status));
    if (filter.assignedTo) conditions.push(eq(orders.assignedUserId, filter.assignedTo));
    return db
        .select({
            id: orders.id,
            number: orders.number,
            status: orders.status,
            packageCode: orders.packageCode,
            currency: orders.currency,
            totalMinor: orders.totalMinor,
            culture: orders.culture,
            weddingDate: orders.weddingDate,
            deliveryDueAt: orders.deliveryDueAt,
            createdAt: orders.createdAt,
            customerName: customers.name,
            customerPhone: customers.phone,
            assignee: users.name,
            balanceDue: sql<number>`coalesce((select sum(${invoices.balanceDue}) from ${invoices} where ${invoices.orderId} = ${orders.id} and ${invoices.status} != 'void'), 0)`,
        })
        .from(orders)
        .innerJoin(customers, eq(customers.id, orders.customerId))
        .leftJoin(users, eq(users.id, orders.assignedUserId))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(orders.createdAt))
        .limit(300);
}

export async function orderDetail(orderId: string) {
    const { db } = getPlatform();
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) return null;
    const [customer, events, invs, invitation, assignee] = await Promise.all([
        db.select().from(customers).where(eq(customers.id, order.customerId)).get(),
        db
            .select({
                id: orderEvents.id,
                kind: orderEvents.kind,
                fromStatus: orderEvents.fromStatus,
                toStatus: orderEvents.toStatus,
                body: orderEvents.body,
                createdAt: orderEvents.createdAt,
                userName: users.name,
            })
            .from(orderEvents)
            .leftJoin(users, eq(users.id, orderEvents.userId))
            .where(eq(orderEvents.orderId, orderId))
            .orderBy(desc(orderEvents.createdAt)),
        invoicesForOrder(orderId),
        db
            .select({
                id: invitations.id,
                slug: invitations.slug,
                status: invitations.status,
                previewToken: invitations.previewToken,
            })
            .from(invitations)
            .where(eq(invitations.orderId, orderId))
            .get(),
        order.assignedUserId
            ? db
                  .select({ name: users.name })
                  .from(users)
                  .where(eq(users.id, order.assignedUserId))
                  .get()
            : undefined,
    ]);
    return {
        order,
        customer,
        events,
        invoices: invs,
        invitation,
        assignee: assignee?.name ?? null,
    };
}

export interface StatusOptions {
    note?: string;
    allowBalance: boolean;
}

const deliveryHours: Record<string, number> = {
    signature: 48,
    essential: 72,
    premium: 120,
    luxury: 240,
    bespoke: 336,
};

export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string,
    opts: StatusOptions,
) {
    const { db } = getPlatform();
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) throw new OrderError('Order not found');
    const balance = (await invoicesForOrder(orderId))
        .filter((i) => i.status !== 'void')
        .reduce((sum, i) => sum + i.balanceDue, 0);
    // Plan rule: never publish while money is owed (owner override is logged).
    if (status === 'published' && balance > 0 && !opts.allowBalance)
        throw new OrderError('Balance outstanding — collect payment before publishing');

    const now = new Date();
    const patch: Partial<typeof orders.$inferInsert> = {
        status,
        updatedAt: now.toISOString(),
    };
    // The delivery clock starts only when all content is in (plan §8.4).
    if (status === 'ready_to_start' && !order.contentCompletedAt) {
        patch.contentCompletedAt = now.toISOString();
        patch.deliveryDueAt = new Date(
            now.getTime() + (deliveryHours[order.packageCode] ?? 72) * 3_600_000,
        ).toISOString();
    }
    if (status === 'revision_requested') patch.revisionCount = order.revisionCount + 1;

    await db.batch([
        db.update(orders).set(patch).where(eq(orders.id, orderId)),
        db.insert(orderEvents).values({
            orderId,
            kind: 'status',
            fromStatus: order.status,
            toStatus: status,
            body:
                [
                    opts.note,
                    status === 'published' && balance > 0
                        ? 'Published with outstanding balance (owner override)'
                        : undefined,
                ]
                    .filter(Boolean)
                    .join(' · ') || null,
            userId,
        }),
    ]);
}

export async function addOrderNote(orderId: string, body: string, userId: string) {
    await getPlatform().db.insert(orderEvents).values({
        orderId,
        kind: 'note',
        body,
        userId,
    });
}

export async function assignOrder(orderId: string, assigneeId: string | null) {
    await getPlatform()
        .db.update(orders)
        .set({ assignedUserId: assigneeId })
        .where(eq(orders.id, orderId));
}

export async function listStaff() {
    return getPlatform()
        .db.select({
            id: users.id,
            name: users.name,
            role: users.role,
        })
        .from(users)
        .where(eq(users.isActive, true))
        .orderBy(asc(users.name));
}

export async function dashboardStats() {
    const { db } = getPlatform();
    const nowIso = new Date().toISOString();
    const soon = new Date(Date.now() + 24 * 3_600_000).toISOString();
    const today = nowIso.slice(0, 10);
    const in60 = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);
    const monthStart = `${today.slice(0, 7)}-01`;
    // Six calendar months (current included) for the dashboard trend chart.
    const trendStart = new Date();
    trendStart.setUTCDate(1);
    trendStart.setUTCMonth(trendStart.getUTCMonth() - 5);
    const trendFrom = trendStart.toISOString().slice(0, 7);
    const [byStatus, money, dueSoon, upcoming, recent, ordersByMonth, billedByMonth, paidByMonth] =
        await Promise.all([
            db
                .select({
                    status: orders.status,
                    n: sql<number>`count(*)`,
                })
                .from(orders)
                .groupBy(orders.status),
            db
                .select({
                    currency: invoices.currency,
                    billedMonth: sql<number>`coalesce(sum(case when ${invoices.issueDate} >= ${monthStart} then ${invoices.total} else 0 end), 0)`,
                    collected: sql<number>`coalesce(sum(${invoices.amountPaid}), 0)`,
                    outstanding: sql<number>`coalesce(sum(${invoices.balanceDue}), 0)`,
                    overdue: sql<number>`coalesce(sum(case when ${invoices.status} = 'overdue' then ${invoices.balanceDue} else 0 end), 0)`,
                })
                .from(invoices)
                .where(sql`${invoices.status} != 'void'`)
                .groupBy(invoices.currency),
            db
                .select({
                    id: orders.id,
                    number: orders.number,
                    deliveryDueAt: orders.deliveryDueAt,
                    customerName: customers.name,
                    packageCode: orders.packageCode,
                })
                .from(orders)
                .innerJoin(customers, eq(customers.id, orders.customerId))
                .where(
                    and(
                        isNotNull(orders.deliveryDueAt),
                        lte(orders.deliveryDueAt, soon),
                        inArray(orders.status, [
                            'ready_to_start',
                            'design_in_progress',
                            'revision_requested',
                        ]),
                    ),
                )
                .orderBy(asc(orders.deliveryDueAt)),
            db
                .select({
                    id: orders.id,
                    number: orders.number,
                    weddingDate: orders.weddingDate,
                    customerName: customers.name,
                    culture: orders.culture,
                })
                .from(orders)
                .innerJoin(customers, eq(customers.id, orders.customerId))
                .where(
                    and(
                        isNotNull(orders.weddingDate),
                        gte(orders.weddingDate, today),
                        lte(orders.weddingDate, in60),
                    ),
                )
                .orderBy(asc(orders.weddingDate))
                .limit(8),
            db
                .select({
                    id: orders.id,
                    number: orders.number,
                    status: orders.status,
                    customerName: customers.name,
                    createdAt: orders.createdAt,
                })
                .from(orders)
                .innerJoin(customers, eq(customers.id, orders.customerId))
                .orderBy(desc(orders.createdAt))
                .limit(6),
            db
                .select({
                    month: sql<string>`substr(${orders.createdAt}, 1, 7)`,
                    n: sql<number>`count(*)`,
                })
                .from(orders)
                .where(gte(orders.createdAt, trendFrom))
                .groupBy(sql`substr(${orders.createdAt}, 1, 7)`),
            db
                .select({
                    month: sql<string>`substr(${invoices.issueDate}, 1, 7)`,
                    currency: invoices.currency,
                    amount: sql<number>`coalesce(sum(${invoices.total}), 0)`,
                })
                .from(invoices)
                .where(and(sql`${invoices.status} != 'void'`, gte(invoices.issueDate, trendFrom)))
                .groupBy(sql`substr(${invoices.issueDate}, 1, 7)`, invoices.currency),
            db
                .select({
                    month: sql<string>`substr(coalesce(${payments.paidAt}, ${payments.createdAt}), 1, 7)`,
                    currency: payments.currency,
                    amount: sql<number>`coalesce(sum(${payments.amount}), 0)`,
                })
                .from(payments)
                .where(
                    and(
                        eq(payments.status, 'captured'),
                        gte(sql`coalesce(${payments.paidAt}, ${payments.createdAt})`, trendFrom),
                    ),
                )
                .groupBy(
                    sql`substr(coalesce(${payments.paidAt}, ${payments.createdAt}), 1, 7)`,
                    payments.currency,
                ),
        ]);
    return {
        byStatus,
        money,
        trend: {
            orders: ordersByMonth,
            billed: billedByMonth,
            collected: paidByMonth,
        },
        dueSoon: dueSoon.map((o) => ({
            ...o,
            overdue: (o.deliveryDueAt ?? '') < nowIso,
        })),
        upcoming,
        recent,
    };
}

export async function listCustomers(q?: string) {
    const { db } = getPlatform();
    const like = q ? `%${q.toLowerCase()}%` : undefined;
    return db
        .select({
            id: customers.id,
            name: customers.name,
            email: customers.email,
            phone: customers.phone,
            country: customers.country,
            createdAt: customers.createdAt,
            orders: sql<number>`(select count(*) from ${orders} where ${orders.customerId} = ${customers.id})`,
            balanceDue: sql<number>`coalesce((select sum(${invoices.balanceDue}) from ${invoices} where ${invoices.customerId} = ${customers.id} and ${invoices.status} != 'void'), 0)`,
        })
        .from(customers)
        .where(
            like
                ? or(
                      sql`lower(${customers.name}) like ${like}`,
                      sql`lower(coalesce(${customers.email}, '')) like ${like}`,
                      sql`coalesce(${customers.phone}, '') like ${like}`,
                  )
                : undefined,
        )
        .orderBy(desc(customers.createdAt))
        .limit(200);
}
