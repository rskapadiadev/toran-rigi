// The guest list behind an invitation: families and their links, groups, who sees each function,
// replies and the caterer's headcount. Mounted for the couple (store) and for the studio (admin),
// each with its own check that the caller may touch this invitation.
import { toCsv } from '@shared/csv';
import { pickText } from '@shared/cultures';
import {
    countsOf,
    DEFAULT_INVITE_MESSAGE,
    DEFAULT_REMINDER,
    headcounts,
    latestReplies,
    SOLEMN_INVITE_MESSAGE,
} from '@shared/guests';
import { newToken } from '@shared/ids';
import { isSolemn, occasionOf } from '@shared/occasions';
import {
    audienceInput,
    groupInput,
    guestInput,
    guestPasteInput,
    manualReplyInput,
    repliesInput,
} from '@shared/schemas/guest';
import type { Context, Env } from 'hono';
import { Hono } from 'hono';

import { fail } from '../lib/http';
import { invitationForEdit } from '../repos/composer';
import {
    addGuest,
    addManualReply,
    createGroup,
    deleteGroup,
    deleteGuest,
    ensureSideLinks,
    importGuests,
    listGroups,
    listGuests,
    listRsvps,
    markSent,
    parseGuestLines,
    renameGroup,
    setAudience,
    setReplies,
    updateGuest,
} from '../repos/guests';

const linkToken = () => newToken().slice(0, 12);

const body = async (c: Context): Promise<unknown> => c.req.json<unknown>().catch(() => null);

const firstIssue = (issues: { message: string }[], fallback: string) =>
    issues[0]?.message ?? fallback;

interface FamilySettings {
    enabled?: boolean;
    whatsapp?: string;
}

const familySettings = (own: FamilySettings | undefined) => ({
    enabled: own?.enabled !== false,
    whatsapp: own?.whatsapp ?? '',
});

async function summary(invitationId: string) {
    const edit = await invitationForEdit(invitationId);
    if (!edit) return null;
    const { invitation } = edit;
    const locale = invitation.locales[0] ?? 'en';
    const two = invitation.content.people.two;
    const replies = invitation.extras.replies;
    // Two people, two families: each family's guests can be told apart and get a main link.
    if (two) await ensureSideLinks(invitationId, linkToken);
    const [guests, groups, rsvps] = await Promise.all([
        listGuests(invitationId),
        listGroups(invitationId),
        listRsvps(invitationId),
    ]);
    const events = edit.events.map((e) => ({
        id: e.id,
        kind: e.kind,
        title: pickText(e.title, locale) || e.kind,
        startsAt: e.startsAt,
        audience: e.audience,
    }));
    return {
        slug: invitation.slug,
        live: invitation.status === 'published',
        names: {
            one: pickText(invitation.content.people.one.name, locale),
            two: two ? pickText(two.name, locale) : null,
        },
        events,
        groups,
        guests,
        rsvps,
        counts: headcounts(events, guests, rsvps),
        replies: {
            enabled: invitation.rsvpEnabled,
            whatsapp: replies?.whatsapp ?? '',
            by: replies?.by ?? '',
            message: replies?.message ?? '',
            reminder: replies?.reminder ?? '',
            sides: {
                one: familySettings(replies?.sides?.one),
                two: familySettings(replies?.sides?.two),
            },
        },
        // The words used until the couple writes their own.
        defaults: {
            message: isSolemn(occasionOf(invitation.eventKind))
                ? SOLEMN_INVITE_MESSAGE
                : DEFAULT_INVITE_MESSAGE,
            reminder: DEFAULT_REMINDER,
        },
        versions: Boolean(two && invitation.content.families?.enabled),
    };
}

export type GuestListSummary = NonNullable<Awaited<ReturnType<typeof summary>>>;

// What the access check needs from a request: the signed-in caller, whoever they are.
export type CallerOf<E extends Env> = Pick<Context<E>, 'get'>;

export function guestListApi<E extends Env>(
    allowed: (c: CallerOf<E>, invitationId: string) => Promise<unknown>,
) {
    const app = new Hono<E>();
    app.use('/:id/guest-list/*', async (c, next) => {
        await allowed(c, c.req.param('id'));
        await next();
    });
    app.use('/:id/guest-list', async (c, next) => {
        await allowed(c, c.req.param('id'));
        await next();
    });

    app.get('/:id/guest-list', async (c) => {
        const result = await summary(c.req.param('id'));
        return result ? c.json(result) : fail(c, 404, 'Invitation not found');
    });

    app.post('/:id/guest-list/families', async (c) => {
        const parsed = guestInput.safeParse(await body(c));
        if (!parsed.success)
            return fail(c, 422, firstIssue(parsed.error.issues, 'Check the family’s details'));
        const row = await addGuest(c.req.param('id'), parsed.data, linkToken());
        return c.json(
            {
                ok: true,
                id: row?.id,
            },
            201,
        );
    });

    app.post('/:id/guest-list/families/paste', async (c) => {
        const parsed = guestPasteInput.safeParse(await body(c));
        if (!parsed.success) return fail(c, 422, 'Paste one family per line');
        const added = await importGuests(
            c.req.param('id'),
            parseGuestLines(parsed.data.lines),
            linkToken,
            {
                side: parsed.data.side,
                groupId: parsed.data.groupId,
            },
        );
        return c.json({
            ok: true,
            added,
        });
    });

    app.patch('/:id/guest-list/families/:guestId', async (c) => {
        const parsed = guestInput.safeParse(await body(c));
        if (!parsed.success)
            return fail(c, 422, firstIssue(parsed.error.issues, 'Check the family’s details'));
        await updateGuest(c.req.param('id'), c.req.param('guestId'), parsed.data);
        return c.json({ ok: true });
    });

    app.delete('/:id/guest-list/families/:guestId', async (c) => {
        await deleteGuest(c.req.param('id'), c.req.param('guestId'));
        return c.json({ ok: true });
    });

    app.post('/:id/guest-list/families/:guestId/sent', async (c) => {
        await markSent(c.req.param('id'), c.req.param('guestId'));
        return c.json({ ok: true });
    });

    app.post('/:id/guest-list/families/:guestId/reply', async (c) => {
        const parsed = manualReplyInput.safeParse(await body(c));
        if (!parsed.success) return fail(c, 422, 'Check the numbers');
        const ok = await addManualReply(c.req.param('id'), c.req.param('guestId'), parsed.data);
        return ok ? c.json({ ok: true }) : fail(c, 404, 'That family isn’t on the list');
    });

    app.post('/:id/guest-list/groups', async (c) => {
        const parsed = groupInput.safeParse(await body(c));
        if (!parsed.success) return fail(c, 422, firstIssue(parsed.error.issues, 'Name the group'));
        const row = await createGroup(c.req.param('id'), parsed.data.name, linkToken());
        return c.json(
            {
                ok: true,
                id: row?.id,
            },
            201,
        );
    });

    app.patch('/:id/guest-list/groups/:groupId', async (c) => {
        const parsed = groupInput.safeParse(await body(c));
        if (!parsed.success) return fail(c, 422, firstIssue(parsed.error.issues, 'Name the group'));
        await renameGroup(c.req.param('id'), c.req.param('groupId'), parsed.data.name);
        return c.json({ ok: true });
    });

    app.delete('/:id/guest-list/groups/:groupId', async (c) => {
        await deleteGroup(c.req.param('id'), c.req.param('groupId'));
        return c.json({ ok: true });
    });

    app.put('/:id/guest-list/audience', async (c) => {
        const parsed = audienceInput.safeParse(await body(c));
        if (!parsed.success) return fail(c, 422, 'Check who sees each function');
        await setAudience(c.req.param('id'), parsed.data.audience);
        return c.json({ ok: true });
    });

    app.put('/:id/guest-list/replies', async (c) => {
        const parsed = repliesInput.safeParse(await body(c));
        if (!parsed.success)
            return fail(c, 422, firstIssue(parsed.error.issues, 'Check the reply settings'));
        await setReplies(c.req.param('id'), parsed.data);
        return c.json({ ok: true });
    });

    // For the caterer and the hotel: the number for every function, then each family's answer.
    app.get('/:id/guest-list/headcount.csv', async (c) => {
        const result = await summary(c.req.param('id'));
        if (!result) return fail(c, 404, 'Invitation not found');
        const { events, counts, rsvps, guests } = result;
        const family = new Map(guests.map((g) => [g.id, g.displayName]));
        const csv = toCsv([
            ['Function', 'Date', 'Coming', 'Families replied', 'Families still to reply'],
            ...events.map((e) => {
                const n = counts.find((x) => x.eventId === e.id);
                return [e.title, e.startsAt.slice(0, 10), n?.coming, n?.replied, n?.waiting];
            }),
            [],
            ['Family', 'Coming', ...events.map((e) => e.title), 'Message', 'Replied on'],
            ...latestReplies(rsvps).map((r) => {
                const per = countsOf(r);
                return [
                    (r.guestId && family.get(r.guestId)) || r.name,
                    r.attending ? 'Yes' : 'No',
                    ...events.map((e) => per[e.id] ?? 0),
                    r.message,
                    r.createdAt.slice(0, 10),
                ];
            }),
        ]);
        return new Response(csv, {
            headers: {
                'content-type': 'text/csv; charset=utf-8',
                'content-disposition': `attachment; filename="${result.slug}-headcount.csv"`,
                'cache-control': 'private, max-age=0',
            },
        });
    });

    return app;
}
