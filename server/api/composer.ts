import { toCsv } from '@shared/csv';
import { newToken } from '@shared/ids';
import { can } from '@shared/permissions';
import {
    guestImportInput,
    saveInvitationInput,
    slugInput,
    wishModerationInput,
} from '@shared/schemas/composer';
import { Hono } from 'hono';
import { z } from 'zod';

import { fail } from '../lib/http';
import { type AdminEnv, requireAdmin, requirePermission } from '../middleware/auth';
import {
    createInvitationForOrder,
    invitationForEdit,
    listInvitations,
    saveInvitation,
    setInvitationStatus,
    setSlug,
} from '../repos/composer';
import {
    deleteGuest,
    importGuests,
    listGuests,
    listRsvps,
    listWishes,
    moderateWish,
    parseGuestLines,
} from '../repos/guests';
import { OrderError } from '../repos/orders';

export const composerApi = new Hono<AdminEnv>();

composerApi.use('*', requireAdmin, requirePermission('orders.update'));
composerApi.onError((error, c) => {
    if (error instanceof OrderError) return fail(c, 409, error.message);
    console.error('[composer]', error);
    return c.json(
        {
            ok: false,
            error: 'Something went wrong',
        },
        500,
    );
});

const json = async (c: { req: { json: () => Promise<unknown> } }) => c.req.json().catch(() => null);

composerApi.get('/', async (c) => c.json(await listInvitations()));

composerApi.post('/', async (c) => {
    const parsed = z
        .object({
            orderId: z.string(),
            themeSlug: z.string().max(40),
        })
        .safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, 'Pick an order and a theme');
    return c.json({
        ok: true,
        id: await createInvitationForOrder(parsed.data.orderId, parsed.data.themeSlug),
    });
});

composerApi.get('/:id', async (c) => {
    const data = await invitationForEdit(c.req.param('id'));
    return data ? c.json(data) : fail(c, 404, 'Invitation not found');
});

composerApi.put('/:id', async (c) => {
    const parsed = saveInvitationInput.safeParse(await json(c));
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return fail(
            c,
            422,
            issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid invitation',
        );
    }
    return c.json({
        ok: true,
        data: await saveInvitation(c.req.param('id'), parsed.data),
    });
});

composerApi.patch('/:id/slug', async (c) => {
    const parsed = slugInput.safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, parsed.error.issues[0]?.message ?? 'Invalid link');
    await setSlug(c.req.param('id'), parsed.data.slug);
    return c.json({ ok: true });
});

composerApi.patch('/:id/status', async (c) => {
    const parsed = z
        .object({
            status: z.enum(['draft', 'preview', 'published', 'archived']),
            override: z.boolean().optional(),
        })
        .safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, 'Invalid status');
    const allow =
        Boolean(parsed.data.override) && can(c.get('user').role, 'orders.publishWithBalance');
    await setInvitationStatus(c.req.param('id'), parsed.data.status, allow);
    return c.json({ ok: true });
});

composerApi.get('/:id/guests', async (c) => c.json(await listGuests(c.req.param('id'))));

composerApi.post('/:id/guests', async (c) => {
    const parsed = guestImportInput.safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, 'Paste one guest per line');
    const added = await importGuests(c.req.param('id'), parseGuestLines(parsed.data.lines), () =>
        newToken().slice(0, 12),
    );
    return c.json({
        ok: true,
        added,
    });
});

composerApi.delete('/:id/guests/:guestId', async (c) => {
    await deleteGuest(c.req.param('id'), c.req.param('guestId'));
    return c.json({ ok: true });
});

composerApi.get('/:id/rsvps', async (c) => c.json(await listRsvps(c.req.param('id'))));

composerApi.get('/:id/rsvps.csv', async (c) => {
    const [rows, detail] = await Promise.all([
        listRsvps(c.req.param('id')),
        invitationForEdit(c.req.param('id')),
    ]);
    const eventName = new Map(
        detail?.events.map((e) => [e.id, e.title.en ?? Object.values(e.title)[0] ?? e.kind]),
    );
    const csv = toCsv([
        [
            'Name',
            'Guest link',
            'Phone',
            'Attending',
            'Guests',
            'Ceremonies',
            'Food',
            'Message',
            'Received',
        ],
        ...rows.map((r) => [
            r.name,
            r.guestName,
            r.phone,
            r.attending ? 'Yes' : 'No',
            r.guestCount,
            r.eventIds.map((id) => eventName.get(id) ?? id).join(' | '),
            r.dietary,
            r.message,
            r.createdAt,
        ]),
    ]);
    return new Response(csv, {
        headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition': `attachment; filename="rsvps-${detail?.invitation.slug ?? 'invite'}.csv"`,
        },
    });
});

composerApi.get('/:id/wishes', async (c) => c.json(await listWishes(c.req.param('id'))));

composerApi.patch('/:id/wishes/:wishId', async (c) => {
    const parsed = wishModerationInput.safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, 'Invalid status');
    await moderateWish(c.req.param('id'), c.req.param('wishId'), parsed.data.status);
    const detail = await invitationForEdit(c.req.param('id'));
    // Approved wishes show on the live page, so refresh its cache.
    if (detail?.invitation.status === 'published')
        await setInvitationStatus(c.req.param('id'), 'published', true);
    return c.json({ ok: true });
});
