import { can } from '@shared/permissions';
import {
    createOrderInput,
    invoiceItemInput,
    noteInput,
    recordPaymentInput,
    updateStatusInput,
} from '@shared/schemas/admin';
import { type OrderStatus, orderStatuses } from '@shared/types';
import { Hono } from 'hono';
import { z } from 'zod';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import {
    addInvoiceItem,
    billingOverview,
    customerLedger,
    invoiceDetail,
    recordPayment,
} from '../repos/billing';
import { listCatalog } from '../repos/catalog';
import {
    addOrderNote,
    assignOrder,
    createOrder,
    dashboardStats,
    listCustomers,
    listOrders,
    listStaff,
    orderDetail,
    OrderError,
    updateOrderStatus,
} from '../repos/orders';

export const adminApi = new Hono<AdminEnv>();

adminApi.use('*', requireAdmin);

adminApi.onError((error, c) => {
    if (error instanceof OrderError) return fail(c, 409, error.message);
    console.error('[admin]', error);
    return c.json(
        {
            ok: false,
            error: 'Something went wrong',
        },
        500,
    );
});

const body = async <T extends z.ZodType>(c: { req: { json: () => Promise<unknown> } }, schema: T) =>
    schema.safeParse(await c.req.json().catch(() => null));

adminApi.get('/dashboard', requirePermission('dashboard.view'), async (c) => {
    const stats = await dashboardStats();
    // Designers see workload, never money.
    return c.json(
        can(c.get('user').role, 'revenue.view')
            ? stats
            : {
                  ...stats,
                  money: [],
                  trend: {
                      ...stats.trend,
                      billed: [],
                      collected: [],
                  },
              },
    );
});

adminApi.get('/catalog', async (c) => c.json(await listCatalog()));
adminApi.get('/staff', async (c) => c.json(await listStaff()));

adminApi.get('/orders', requirePermission('orders.view'), async (c) => {
    const statusParam = c.req.query('status');
    const status = statusParam
        ? (statusParam
              .split(',')
              .filter((s) => (orderStatuses as readonly string[]).includes(s)) as OrderStatus[])
        : undefined;
    const mine = c.req.query('mine') === '1' || c.get('user').role === 'designer';
    return c.json(
        await listOrders({
            status,
            assignedTo: mine ? c.get('user').id : undefined,
        }),
    );
});

adminApi.post('/orders', requirePermission('orders.create'), async (c) => {
    const parsed = await body(c, createOrderInput);
    if (!parsed.success) return fail(c, 422, parsed.error.issues[0]?.message ?? 'Invalid order');
    const order = await createOrder(parsed.data, c.get('user').id);
    return c.json({
        ok: true,
        id: order.id,
    });
});

adminApi.get('/orders/:id', requirePermission('orders.view'), async (c) => {
    const detail = await orderDetail(c.req.param('id'));
    if (!detail) return fail(c, 404, 'Order not found');
    const showMoney = can(c.get('user').role, 'billing.view');
    return c.json({
        ...detail,
        invoices: showMoney
            ? detail.invoices
            : detail.invoices.map((i) => ({
                  id: i.id,
                  status: i.status,
              })),
    });
});

adminApi.patch('/orders/:id/status', requirePermission('orders.update'), async (c) => {
    const parsed = await body(c, updateStatusInput);
    if (!parsed.success) return fail(c, 422, 'Invalid status');
    await updateOrderStatus(c.req.param('id'), parsed.data.status, c.get('user').id, {
        note: parsed.data.note,
        allowBalance:
            can(c.get('user').role, 'orders.publishWithBalance') && c.req.query('override') === '1',
    });
    return c.json({ ok: true });
});

adminApi.post('/orders/:id/notes', requirePermission('orders.update'), async (c) => {
    const parsed = await body(c, noteInput);
    if (!parsed.success) return fail(c, 422, 'Empty note');
    await addOrderNote(c.req.param('id'), parsed.data.body, c.get('user').id);
    return c.json({ ok: true });
});

adminApi.patch('/orders/:id/assign', requirePermission('orders.create'), async (c) => {
    const parsed = await body(c, z.object({ userId: z.string().nullable() }));
    if (!parsed.success) return fail(c, 422, 'Invalid assignee');
    await assignOrder(c.req.param('id'), parsed.data.userId);
    return c.json({ ok: true });
});

adminApi.get('/customers', requirePermission('customers.view'), async (c) =>
    c.json(await listCustomers(c.req.query('q'))),
);

adminApi.get('/customers/:id', requirePermission('customers.view'), async (c) => {
    const ledger = await customerLedger(c.req.param('id'));
    return ledger ? c.json(ledger) : fail(c, 404, 'Customer not found');
});

adminApi.get('/billing', requirePermission('billing.view'), async (c) =>
    c.json(
        await billingOverview({
            status: c.req.query('status'),
            currency: c.req.query('currency'),
        }),
    ),
);

adminApi.get('/invoices/:id', requirePermission('billing.view'), async (c) => {
    const detail = await invoiceDetail(c.req.param('id'));
    return detail ? c.json(detail) : fail(c, 404, 'Invoice not found');
});

adminApi.post('/invoices/:id/payments', requirePermission('billing.manage'), async (c) => {
    const parsed = await body(c, recordPaymentInput);
    if (!parsed.success) return fail(c, 422, 'Invalid payment');
    const invoice = await recordPayment(c.req.param('id'), {
        ...parsed.data,
        userId: c.get('user').id,
    });
    return c.json({
        ok: true,
        invoice,
    });
});

adminApi.post('/invoices/:id/items', requirePermission('billing.manage'), async (c) => {
    const parsed = await body(c, invoiceItemInput);
    if (!parsed.success) return fail(c, 422, 'Invalid line item');
    const invoice = await addInvoiceItem(c.req.param('id'), parsed.data);
    return c.json({
        ok: true,
        invoice,
    });
});
