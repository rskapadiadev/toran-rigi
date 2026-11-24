import { toCsv } from '@shared/csv';
import { can } from '@shared/permissions';
import { saveInvitationInput, slugInput, wishModerationInput } from '@shared/schemas/composer';
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
import { listRsvps, listWishes, moderateWish } from '../repos/guests';
import { pdfSource } from '../repos/invitations';
import { OrderError } from '../repos/orders';
import { invitationPdf, pdfResponse } from '../services/pdf';
import { guestListApi } from './guest-list';
import { uploadInvitationMusic } from './music';

export const composerApi = new Hono<AdminEnv>();

composerApi.use('*', requireAdmin, requirePermission('orders.update'));

// The same guest list the couple sees, so the studio can set it up or fix it for them.
composerApi.route(
    '/',
    guestListApi<AdminEnv>(() => Promise.resolve()),
);
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

// The studio can always make the PDF (drafts too, add-on or not) to proof it or send it by hand.
composerApi.get('/:id/pdf', async (c) => {
    const src = await pdfSource({ id: c.req.param('id') });
    if (!src) return fail(c, 404, 'Invitation not found');
    try {
        return pdfResponse(await invitationPdf(src, new URL(c.req.url).origin), src.slug);
    } catch (error) {
        console.error('[pdf]', error);
        return fail(c, 409, 'The PDF couldn’t be made just now. Please try again in a minute.');
    }
});

composerApi.post('/', async (c) => {
    const parsed = z
        .union([
            z.object({
                orderId: z.string(),
                templateId: z.string().max(40),
            }),
            z.object({
                orderId: z.string(),
                themeSlug: z.string().max(40),
            }),
        ])
        .safeParse(await json(c));
    if (!parsed.success) return fail(c, 422, 'Pick an order and a template');
    const { orderId, ...source } = parsed.data;
    return c.json({
        ok: true,
        id: await createInvitationForOrder(orderId, source),
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

// B: the customer's own song for this invitation (rights confirmed in the same request).
composerApi.post('/:id/music', uploadInvitationMusic);

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
