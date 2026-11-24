import { familyReplies } from '@shared/families';
import { visibleEvents } from '@shared/guests';
import { heartInput, openedInput, rsvpInput, wishInput } from '@shared/schemas/guest';
import { Hono } from 'hono';

import type { AppEnv } from '../app';
import { clientIp, fail } from '../lib/http';
import { verifyTurnstile } from '../lib/turnstile';
import {
    createRsvp,
    createWish,
    findGuest,
    markOpened,
    resolveLink,
    totalAttending,
} from '../repos/guests';
import { addHeart, heartCounts, isHeartTarget } from '../repos/hearts';
import { eventAudiences, getInvitationIdBySlug, pdfSource } from '../repos/invitations';
import { invitationPdf, pdfResponse } from '../services/pdf';

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

    const { guest, viewer } = await resolveLink(invitation.id, parsed.data.guestToken);
    if (!familyReplies(invitation.extras, invitation.rsvpEnabled, viewer?.side).enabled)
        return fail(c, 404, 'Invitation not found');
    const maxGuests = guest?.maxGuests ?? 20;
    // Only functions this link shows can be answered, and no more people than the family has.
    const shown = new Set(
        visibleEvents(await eventAudiences(invitation.id), viewer).map((e) => e.id),
    );
    const sent = parsed.data.counts;
    const counts = sent
        ? Object.fromEntries(
              Object.entries(sent)
                  .filter(([id, n]) => shown.has(id) && n > 0)
                  .map(([id, n]) => [id, Math.min(n, maxGuests)]),
          )
        : undefined;
    const eventIds = counts
        ? Object.keys(counts)
        : parsed.data.eventIds.filter((id) => shown.has(id));
    const attending = parsed.data.attending && (!counts || eventIds.length > 0);
    const input = {
        ...parsed.data,
        attending,
        guestCount: Math.min(
            counts ? Math.max(1, ...Object.values(counts)) : parsed.data.guestCount,
            maxGuests,
        ),
        eventIds: attending ? eventIds : [],
    };
    await createRsvp(invitation.id, input, guest?.id, false, { counts });
    return c.json({
        ok: true,
        lights: await totalAttending(invitation.id),
    });
});

// Sent by the guest's own browser, so WhatsApp's link preview never counts as "opened".
invitationsApi.post('/:slug/opened', async (c) => {
    const parsed = openedInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ ok: false });
    const invitation = await getInvitationIdBySlug(c.req.param('slug'));
    if (!invitation || invitation.status !== 'published') return c.json({ ok: false });
    const guest = await findGuest(invitation.id, parsed.data.token);
    if (guest && !guest.openedAt) await markOpened(guest.id);
    return c.json({ ok: true });
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

// Heart counts are read live (the invitation itself is cached until the next publish).
invitationsApi.get('/:slug/hearts', async (c) => {
    const invitation = await getInvitationIdBySlug(c.req.param('slug'));
    if (!invitation || invitation.status !== 'published') return c.json({});
    return c.json(await heartCounts(invitation.id));
});

// A double-tap heart. Each device sends one per target; the rate limit stops a tap storm.
invitationsApi.post('/:slug/hearts', async (c) => {
    const slug = c.req.param('slug');
    if (!(await c.env.rateLimit.limit(`heart:${slug}:${clientIp(c)}`)).success)
        return fail(c, 429, 'Too many requests');
    const parsed = heartInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return fail(c, 422, 'Invalid heart');
    const invitation = await getInvitationIdBySlug(slug);
    if (!invitation || invitation.status !== 'published')
        return fail(c, 404, 'Invitation not found');
    if (!(await isHeartTarget(invitation.id, parsed.data.target)))
        return fail(c, 404, 'Nothing to heart here');
    return c.json({
        ok: true,
        count: await addHeart(invitation.id, parsed.data.target),
    });
});

// Guests' "Download PDF": only for published invitations whose couple has the PDF add-on.
invitationsApi.get('/:slug/pdf', async (c) => {
    const src = await pdfSource({ slug: c.req.param('slug') });
    if (!src || src.status !== 'published' || !src.enabled) return fail(c, 404, 'Not available');
    if (!(await c.env.rateLimit.limit(`pdf:${clientIp(c)}`)).success)
        return fail(c, 429, 'Too many requests');
    try {
        return pdfResponse(await invitationPdf(src, new URL(c.req.url).origin), src.slug);
    } catch (error) {
        console.error('[pdf]', error);
        return fail(c, 409, 'The PDF couldn’t be made just now. Please try again in a minute.');
    }
});
