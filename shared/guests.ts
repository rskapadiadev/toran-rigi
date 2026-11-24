// Guest lists, links and replies, shared by the server, the couple's Guests page and the invitation.
// A function's audience says who sees it: everyone, one family's guests (a side), or a group.

export const sides = ['one', 'two'] as const;
export type Side = (typeof sides)[number];

// Audience keys stored on a function: 'all', a side, or "g:<group id>". Empty or missing = everyone.
export const EVERYONE = 'all';
export const groupKey = (groupId: string) => `g:${groupId}`;

// Who a link is for. A family's link has its side and group; a group's link only the group; a
// side's main link only the side; the bare link nothing. `eventIds` is the studio's per-guest list.
export interface Viewer {
    side?: Side | null;
    groupId?: string | null;
    eventIds?: readonly string[] | null;
}

export const isSide = (value: unknown): value is Side => value === 'one' || value === 'two';

export function canSee(
    audience: readonly string[] | null | undefined,
    viewer: Viewer | undefined,
    eventId: string,
): boolean {
    if (viewer?.eventIds && !viewer.eventIds.includes(eventId)) return false;
    if (!audience || audience.length === 0 || audience.includes(EVERYONE)) return true;
    if (viewer?.side && audience.includes(viewer.side)) return true;
    return Boolean(viewer?.groupId && audience.includes(groupKey(viewer.groupId)));
}

export interface AudienceEvent {
    id: string;
    audience?: readonly string[] | null;
}

export const visibleEvents = <T extends AudienceEvent>(events: readonly T[], viewer?: Viewer) =>
    events.filter((e) => canSee(e.audience, viewer, e.id));

// ── Replies ─────────────────────────────────────────────────────────────────

export type Counts = Record<string, number>;

export interface ReplyLike {
    guestId: string | null;
    name: string;
    phone?: string | null;
    attending: boolean;
    guestCount: number;
    eventIds: readonly string[];
    counts: Counts | null;
    createdAt: string;
}

// Older replies held one number for every function they picked.
export function countsOf(reply: ReplyLike): Counts {
    if (!reply.attending) return {};
    if (reply.counts) return reply.counts;
    return Object.fromEntries(reply.eventIds.map((id) => [id, reply.guestCount]));
}

// A family that replies twice has changed its answer: only its latest reply counts.
export function latestReplies<T extends ReplyLike>(replies: readonly T[]): T[] {
    const byWho = new Map<string, T>();
    for (const r of replies) {
        // Group links carry no family, so two people can share a name: a phone number tells them apart.
        const who =
            r.guestId ?? `name:${r.name.trim().toLowerCase()}|${phoneDigits(r.phone)}`;
        const seen = byWho.get(who);
        if (!seen || r.createdAt > seen.createdAt) byWho.set(who, r);
    }
    return [...byWho.values()];
}

export interface GuestLike {
    id: string;
    side: Side | null;
    groupId: string | null;
    allowedEventIds: readonly string[] | null;
}

export interface EventHeadcount {
    eventId: string;
    coming: number;
    // Families on the list who are invited to it and have replied, or not yet.
    replied: number;
    waiting: number;
}

export const guestViewer = (g: GuestLike): Viewer => ({
    side: g.side,
    groupId: g.groupId,
    eventIds: g.allowedEventIds,
});

export function headcounts(
    events: readonly AudienceEvent[],
    guests: readonly GuestLike[],
    replies: readonly ReplyLike[],
): EventHeadcount[] {
    const latest = latestReplies(replies);
    const answered = new Set(latest.map((r) => r.guestId).filter(Boolean));
    return events.map((e) => {
        const invited = guests.filter((g) => canSee(e.audience, guestViewer(g), e.id));
        return {
            eventId: e.id,
            coming: latest.reduce((sum, r) => sum + (countsOf(r)[e.id] ?? 0), 0),
            replied: invited.filter((g) => answered.has(g.id)).length,
            waiting: invited.filter((g) => !answered.has(g.id)).length,
        };
    });
}

// ── Sending ─────────────────────────────────────────────────────────────────

// Plain greetings: the same words go out for every tradition, and quietly for a solemn gathering.
export const DEFAULT_INVITE_MESSAGE =
    'Hello {name}! We’d love to have you with us. Everything you need, and your reply, are on your invite: {link}';
export const SOLEMN_INVITE_MESSAGE =
    'Hello {name}. We would be grateful for your presence. The details are here: {link}';
export const DEFAULT_REMINDER =
    'Hello {name}. We’re putting the numbers together and would love to know how many of you can come. You can reply here: {link}';

export interface MessageFill {
    name: string;
    link: string;
}

// The couple's own words with the family's name and link dropped in; the link is never left out.
// With no name (a group's link) "Namaste {name}!" reads "Namaste!".
export function inviteMessage(words: string, fill: MessageFill): string {
    const named = fill.name
        ? words.replaceAll('{name}', fill.name)
        : words.replace(/[ \t]*\{name\}[ \t]*([!,.?:])?/g, '$1');
    const text = named.replaceAll('{link}', fill.link);
    return words.includes('{link}') ? text : `${text}\n${fill.link}`;
}

// Digits only, keeping the country code; WhatsApp links need it and can't guess it.
export const phoneDigits = (phone: string | null | undefined) => (phone ?? '').replace(/\D/g, '');

export function whatsappLink(phone: string | null | undefined, text: string): string {
    const to = phoneDigits(phone);
    return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}

// The link a guest opens: the bare one for everyone, or with the family's, group's or side's token.
export const inviteLink = (origin: string, slug: string, token?: string) =>
    token ? `${origin}/${slug}?g=${encodeURIComponent(token)}` : `${origin}/${slug}`;
