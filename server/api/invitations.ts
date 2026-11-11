import { rsvpInput, wishInput } from '@shared/schemas/guest';
import { Hono } from 'hono';

import type { AppEnv } from '../app';
import { clientIp, fail } from '../lib/http';
import { verifyTurnstile } from '../lib/turnstile';
import { createRsvp, createWish, findGuest, totalAttending } from '../repos/guests';
import { getInvitationIdBySlug } from '../repos/invitations';

export const invitationsApi = new Hono<AppEnv>();

invitationsApi.post('/:slug/rsvp', async (c) => {
    const slug = c.req.param('slug');
    const ip = clientIp(c);
    if (!(await c.env.rateLimit.limit(`rsvp:${slug}:${ip}`)).success)
        return fail(c, 429, 'Too many requests');
    const parsed = rsvpInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return fail(c, 422, 'Invalid RSVP');
    const invitation = await getInvitationIdBySlug(slug);
    if (!invitation || invitation.status !== 'published' || !invitation.rsvpEnabled)
        return fail(c, 404, 'Invitation not found');
    if (!(await verifyTurnstile(parsed.data.turnstileToken, ip)))
        return fail(c, 403, 'Verification failed');

    const guest = await findGuest(invitation.id, parsed.data.guestToken);
    const maxGuests = guest?.maxGuests ?? 20;
    const input = {
        ...parsed.data,
        guestCount: Math.min(parsed.data.guestCount, maxGuests),
        eventIds: guest?.allowedEventIds
            ? parsed.data.eventIds.filter((id) => guest.allowedEventIds?.includes(id))
            : parsed.data.eventIds,
    };
    await createRsvp(invitation.id, input, guest?.id, false);
    return c.json({
        ok: true,
        lights: await totalAttending(invitation.id),
    });
});

invitationsApi.post('/:slug/wishes', async (c) => {
    const slug = c.req.param('slug');
    const ip = clientIp(c);
    if (!(await c.env.rateLimit.limit(`wish:${slug}:${ip}`)).success)
        return fail(c, 429, 'Too many requests');
    const parsed = wishInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return fail(c, 422, 'Invalid wish');
    const invitation = await getInvitationIdBySlug(slug);
    if (
        !invitation ||
        invitation.status !== 'published' ||
        invitation.extras.wishes?.enabled === false
    )
        return fail(c, 404, 'Invitation not found');
    if (!(await verifyTurnstile(parsed.data.turnstileToken, ip)))
        return fail(c, 403, 'Verification failed');
    const guest = await findGuest(invitation.id, parsed.data.guestToken);
    await createWish(invitation.id, parsed.data, guest?.id);
    return c.json({ ok: true });
});
