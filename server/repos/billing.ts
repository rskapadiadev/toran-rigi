import { advanceFor, computeInvoice } from '@shared/billing';
import { and, asc, desc, eq, inArray, ne, sql } from 'drizzle-orm';

import {
    counters,
    creditNotes,
    customers,
    invoiceItems,
    invoices,
    orders,
    payments,
    settings,
} from '../db/schema';
import { getPlatform } from '../platform/context';

export interface NewInvoiceItem {
    kind: 'package' | 'addon' | 'extra' | 'discount';
    description: string;
    qty: number;
    unitPrice: number;
}

interface GstSetting {
    enabled: boolean;
    rateBps: number;
    inclusive: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

// Atomic per-key counter (works on D1 and libSQL via UPSERT … RETURNING).
export async function nextNumber(key: string): Promise<number> {
    const { db } = getPlatform();
    const row = await db
        .insert(counters)
        .values({
            key,
            value: 1,
        })
        .onConflictDoUpdate({
            target: counters.key,
            set: { value: sql`${counters.value} + 1` },
        })
        .returning({ value: counters.value })
        .get();
    return row.value;
}

async function gst(): Promise<GstSetting> {
    const row = await getPlatform().db.select().from(settings).where(eq(settings.key, 'gst')).get();
    const value = (row?.value ?? {}) as Partial<GstSetting>;
    return {
        enabled: value.enabled ?? false,
        rateBps: value.rateBps ?? 1800,
        inclusive: value.inclusive ?? true,
    };
}

export async function createInvoice(opts: {
    orderId: string;
    customerId: string;
    currency: string;
    items: NewInvoiceItem[];
    dueInDays?: number;
}) {
    const { db } = getPlatform();
    const year = new Date().getFullYear();
    const number = `TR-INV-${year}-${String(await nextNumber(`invoice:${year}`)).padStart(4, '0')}`;
    const due = new Date(Date.now() + (opts.dueInDays ?? 3) * 86_400_000)
        .toISOString()
        .slice(0, 10);
    const [invoice] = await db
        .insert(invoices)
        .values({
            number,
            orderId: opts.orderId,
            customerId: opts.customerId,
            currency: opts.currency,
            issueDate: today(),
            dueDate: due,
            status: 'issued',
        })
        .returning();
    if (!invoice) throw new Error('Invoice insert failed');
    if (opts.items.length) {
        await db.insert(invoiceItems).values(
            opts.items.map((item, sort) => ({
                ...item,
                invoiceId: invoice.id,
                amount: item.qty * item.unitPrice * (item.kind === 'discount' ? -1 : 1),
                sort,
            })),
        );
    }
    return recalcInvoice(invoice.id);
}

export async function recalcInvoice(invoiceId: string) {
    const { db } = getPlatform();
    const invoice = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).get();
    if (!invoice) throw new Error('Invoice not found');
    const [items, paid, credited, tax] = await Promise.all([
        db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId)),
        db
            .select({ sum: sql<number>`coalesce(sum(${payments.amount}), 0)` })
            .from(payments)
            .where(and(eq(payments.invoiceId, invoiceId), eq(payments.status, 'captured')))
            .get(),
        db
            .select({ sum: sql<number>`coalesce(sum(${creditNotes.amount}), 0)` })
            .from(creditNotes)
            .where(eq(creditNotes.invoiceId, invoiceId))
            .get(),
        gst(),
    ]);
    const totals = computeInvoice({
        items: items.map((i) => ({
            kind: i.kind,
            qty: i.qty,
            unitPrice: Math.abs(i.unitPrice),
        })),
        paid: paid?.sum ?? 0,
        credited: credited?.sum ?? 0,
        taxBps: tax.enabled ? tax.rateBps : 0,
        taxInclusive: tax.inclusive,
        dueDate: invoice.dueDate,
        today: today(),
        isVoid: invoice.status === 'void',
    });
    const [updated] = await db
        .update(invoices)
        .set({
            ...totals,
            taxBps: tax.enabled ? tax.rateBps : 0,
        })
        .where(eq(invoices.id, invoiceId))
        .returning();
    return updated;
}

export async function addInvoiceItem(invoiceId: string, item: NewInvoiceItem) {
    const { db } = getPlatform();
    const count = await db
        .select({ n: sql<number>`count(*)` })
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, invoiceId))
        .get();
    await db.insert(invoiceItems).values({
        ...item,
        invoiceId,
        amount: item.qty * item.unitPrice * (item.kind === 'discount' ? -1 : 1),
        sort: count?.n ?? 0,
    });
    return recalcInvoice(invoiceId);
}

export async function recordPayment(
    invoiceId: string,
    payment: {
        amount: number;
        method: 'upi' | 'cash' | 'bank' | 'card' | 'online';
        reference?: string;
        paidAt?: string;
        userId: string;
    },
) {
    const { db } = getPlatform();
    const invoice = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).get();
    if (!invoice) throw new Error('Invoice not found');
    await db.insert(payments).values({
        invoiceId,
        orderId: invoice.orderId,
        currency: invoice.currency,
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
        status: 'captured',
        paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString() : new Date().toISOString(),
        recordedBy: payment.userId,
    });
    return recalcInvoice(invoiceId);
}

export async function invoiceDetail(invoiceId: string) {
    const { db } = getPlatform();
    const [invoice, items, pays, credits] = await Promise.all([
        db.select().from(invoices).where(eq(invoices.id, invoiceId)).get(),
        db
            .select()
            .from(invoiceItems)
            .where(eq(invoiceItems.invoiceId, invoiceId))
            .orderBy(asc(invoiceItems.sort)),
        db
            .select()
            .from(payments)
            .where(eq(payments.invoiceId, invoiceId))
            .orderBy(asc(payments.createdAt)),
        db.select().from(creditNotes).where(eq(creditNotes.invoiceId, invoiceId)),
    ]);
    return invoice
        ? {
              invoice,
              items,
              payments: pays,
              credits,
          }
        : null;
}

export async function invoicesForOrder(orderId: string) {
    return getPlatform()
        .db.select()
        .from(invoices)
        .where(eq(invoices.orderId, orderId))
        .orderBy(asc(invoices.createdAt));
}

export interface BillingFilter {
    status?: string;
    currency?: string;
}

export async function billingOverview(filter: BillingFilter) {
    const { db } = getPlatform();
    // Refresh overdue flags lazily so the list is always truthful even before the daily cron.
    const stale = await db
        .select({ id: invoices.id })
        .from(invoices)
        .where(
            and(
                inArray(invoices.status, ['issued', 'partially_paid']),
                sql`${invoices.dueDate} < ${today()}`,
            ),
        );
    for (const row of stale) await recalcInvoice(row.id);

    const conditions = [ne(invoices.status, 'void')];
    if (filter.status === 'unpaid')
        conditions.push(inArray(invoices.status, ['issued', 'partially_paid', 'overdue']));
    else if (filter.status) conditions.push(eq(invoices.status, filter.status as 'paid'));
    if (filter.currency) conditions.push(eq(invoices.currency, filter.currency));

    const [rows, totals] = await Promise.all([
        db
            .select({
                id: invoices.id,
                number: invoices.number,
                currency: invoices.currency,
                total: invoices.total,
                amountPaid: invoices.amountPaid,
                balanceDue: invoices.balanceDue,
                dueDate: invoices.dueDate,
                status: invoices.status,
                issueDate: invoices.issueDate,
                orderId: invoices.orderId,
                customerId: customers.id,
                customerName: customers.name,
                customerPhone: customers.phone,
                orderNumber: orders.number,
                packageCode: orders.packageCode,
            })
            .from(invoices)
            .innerJoin(customers, eq(customers.id, invoices.customerId))
            .leftJoin(orders, eq(orders.id, invoices.orderId))
            .where(and(...conditions))
            .orderBy(desc(invoices.issueDate), desc(invoices.number))
            .limit(200),
        db
            .select({
                currency: invoices.currency,
                billed: sql<number>`coalesce(sum(${invoices.total}), 0)`,
                collected: sql<number>`coalesce(sum(${invoices.amountPaid}), 0)`,
                outstanding: sql<number>`coalesce(sum(${invoices.balanceDue}), 0)`,
                overdue: sql<number>`coalesce(sum(case when ${invoices.status} = 'overdue' then ${invoices.balanceDue} else 0 end), 0)`,
            })
            .from(invoices)
            .where(ne(invoices.status, 'void'))
            .groupBy(invoices.currency),
    ]);
    return {
        rows,
        totals,
    };
}

export async function customerLedger(customerId: string) {
    const { db } = getPlatform();
    const [customer, invs, pays] = await Promise.all([
        db.select().from(customers).where(eq(customers.id, customerId)).get(),
        db
            .select()
            .from(invoices)
            .where(and(eq(invoices.customerId, customerId), ne(invoices.status, 'void')))
            .orderBy(asc(invoices.issueDate)),
        db
            .select({
                id: payments.id,
                amount: payments.amount,
                currency: payments.currency,
                method: payments.method,
                reference: payments.reference,
                paidAt: payments.paidAt,
                invoiceNumber: invoices.number,
            })
            .from(payments)
            .innerJoin(invoices, eq(invoices.id, payments.invoiceId))
            .where(and(eq(invoices.customerId, customerId), eq(payments.status, 'captured'))),
    ]);
    if (!customer) return null;
    // Running balance: invoices increase what's owed, payments reduce it, in date order.
    const entries = [
        ...invs.map((i) => ({
            date: i.issueDate,
            kind: 'invoice' as const,
            ref: i.number,
            currency: i.currency,
            debit: i.total,
            credit: 0,
        })),
        ...invs
            .filter((i) => i.amountCredited > 0)
            .map((i) => ({
                date: i.issueDate,
                kind: 'credit' as const,
                ref: i.number,
                currency: i.currency,
                debit: 0,
                credit: i.amountCredited,
            })),
        ...pays.map((p) => ({
            date: (p.paidAt ?? '').slice(0, 10),
            kind: 'payment' as const,
            ref: `${p.invoiceNumber} · ${p.method}${p.reference ? ` · ${p.reference}` : ''}`,
            currency: p.currency,
            debit: 0,
            credit: p.amount,
        })),
    ].sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'invoice' ? -1 : 1));
    const running: Record<string, number> = {};
    const ledger = entries.map((e) => {
        running[e.currency] = (running[e.currency] ?? 0) + e.debit - e.credit;
        return {
            ...e,
            balance: running[e.currency] ?? 0,
        };
    });
    return {
        customer,
        invoices: invs,
        ledger,
        remaining: running,
    };
}

export { advanceFor };
