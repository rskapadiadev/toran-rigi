// The couple's guest list as the server sends it (server/api/guest-list.ts), mirrored here because
// the shop never imports server code.
import {
    canSee,
    type EventHeadcount,
    EVERYONE,
    groupKey,
    guestViewer,
    type Side,
} from '@shared/guests';

export interface ListEvent {
    id: string;
    kind: string;
    title: string;
    startsAt: string;
    audience: string[] | null;
}

export interface ListGroup {
    id: string;
    kind: 'group' | 'side';
    name: string;
    side: Side | null;
    token: string;
}

export interface ListGuest {
    id: string;
    displayName: string;
    token: string;
    phone: string | null;
    maxGuests: number | null;
    side: Side | null;
    groupId: string | null;
    note: string | null;
    allowedEventIds: string[] | null;
    sentAt: string | null;
    openedAt: string | null;
    rsvped: number;
}

export interface ListReply {
    id: string;
    guestId: string | null;
    name: string;
    phone: string | null;
    attending: boolean;
    guestCount: number;
    eventIds: string[];
    counts: Record<string, number> | null;
    manual: boolean;
    message: string | null;
    createdAt: string;
    guestName: string | null;
}

export interface FamilyReplySettings {
    enabled: boolean;
    whatsapp: string;
}

export interface ReplySettings {
    enabled: boolean;
    whatsapp: string;
    by: string;
    message: string;
    reminder: string;
    sides: Record<Side, FamilyReplySettings>;
}

export interface GuestList {
    slug: string;
    live: boolean;
    names: {
        one: string;
        two: string | null;
    };
    events: ListEvent[];
    groups: ListGroup[];
    guests: ListGuest[];
    rsvps: ListReply[];
    counts: EventHeadcount[];
    replies: ReplySettings;
    defaults: {
        message: string;
        reminder: string;
    };
    // Each family's links open their own version of the invitation.
    versions: boolean;
}

// The couple's words, or ours until they write some.
export const inviteWords = (list: GuestList) => list.replies.message || list.defaults.message;
export const reminderWords = (list: GuestList) => list.replies.reminder || list.defaults.reminder;

// "Tanya's family": first names read warmer than full names on buttons.
export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

export function sideLabel(list: GuestList, side: Side | null): string {
    const name = side === 'two' ? list.names.two : side === 'one' ? list.names.one : null;
    return name ? `${firstName(name)}’s family` : 'Both families';
}

export interface AudienceOption {
    key: string;
    label: string;
}

// Who a function can be for, in the couple's words.
export function audienceOptions(list: GuestList): AudienceOption[] {
    const { one, two } = list.names;
    const sides: AudienceOption[] = two
        ? [
              {
                  key: 'one',
                  label: `All of ${firstName(one)}’s guests`,
              },
              {
                  key: 'two',
                  label: `All of ${firstName(two)}’s guests`,
              },
          ]
        : [];
    const groups = list.groups
        .filter((g) => g.kind === 'group')
        .map((g) => ({
            key: groupKey(g.id),
            label: g.name,
        }));
    return [
        {
            key: EVERYONE,
            label: 'Everyone',
        },
        ...sides,
        ...groups,
    ];
}

// The functions a family's link shows, by name.
export const functionsFor = (list: GuestList, guest: ListGuest) =>
    list.events.filter((e) => canSee(e.audience, guestViewer(guest), e.id));

export const functionsForLink = (list: GuestList, viewer: Parameters<typeof canSee>[1]) =>
    list.events.filter((e) => canSee(e.audience, viewer, e.id));

export const titles = (events: ListEvent[]) =>
    events.length ? events.map((e) => e.title).join(', ') : 'No functions yet';

export type FamilyStatus = 'new' | 'sent' | 'opened' | 'replied';

export function statusOf(guest: ListGuest): FamilyStatus {
    if (guest.rsvped > 0) return 'replied';
    if (guest.openedAt) return 'opened';
    if (guest.sentAt) return 'sent';
    return 'new';
}

export const statusLabel: Record<FamilyStatus, string> = {
    new: 'Not sent yet',
    sent: 'Sent',
    opened: 'Opened',
    replied: 'Replied',
};

export const dayLabel = (iso: string) =>
    new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    }).format(new Date(iso));
