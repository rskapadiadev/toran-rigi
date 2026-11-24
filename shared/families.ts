// What one link shows: its own functions, and its own family's version of the invitation.
// A couple can send two versions: each family's has its own person's name first and may have its own
// words and its own WhatsApp number for replies. The bare link shows the shared one.
import { type AudienceEvent, type Side, type Viewer, visibleEvents } from './guests';
import type { InvitationContent, InvitationExtras, LocalizedText } from './types';

export const familyTexts = ['welcome', 'family', 'closing'] as const;
export type FamilyText = (typeof familyTexts)[number];

// A family's own words, language by language; a language it left empty keeps the shared words.
function ownWords(shared: LocalizedText | undefined, own: LocalizedText | undefined) {
    const written = Object.entries(own ?? {}).filter(([, text]) => text.trim());
    return written.length
        ? {
              ...shared,
              ...Object.fromEntries(written),
          }
        : shared;
}

// Portrait frames belong to a person, so they change places along with the names.
function swapPortraits(slots: Record<string, string> | undefined) {
    if (!slots) return undefined;
    const other: Record<string, string> = {
        'story.one': 'story.two',
        'story.two': 'story.one',
    };
    return Object.fromEntries(Object.entries(slots).map(([id, key]) => [other[id] ?? id, key]));
}

export function familyContent(
    content: InvitationContent,
    side: Side | null | undefined,
): InvitationContent {
    // The other family's words never travel with this one's page.
    const { families, ...shared } = content;
    const { one, two } = shared.people;
    if (!side || !families?.enabled || !two) return shared;
    const own = families[side];
    const named: InvitationContent =
        side === 'two'
            ? {
                  ...shared,
                  people: {
                      one: two,
                      two: one,
                  },
                  photoSlots: swapPortraits(shared.photoSlots),
              }
            : shared;
    return {
        ...named,
        welcome: ownWords(shared.welcome, own?.welcome) ?? shared.welcome,
        family: ownWords(shared.family, own?.family),
        closing: ownWords(shared.closing, own?.closing) ?? shared.closing,
    };
}

export interface FamilyReplies {
    enabled: boolean;
    whatsapp?: string;
    by?: string;
}

// Each family may take its own replies, or none; what it leaves empty follows the shared settings.
export function familyReplies(
    extras: InvitationExtras,
    enabled: boolean,
    side: Side | null | undefined,
): FamilyReplies {
    const replies = extras.replies;
    const own = side ? replies?.sides?.[side] : undefined;
    return {
        enabled: enabled && own?.enabled !== false,
        whatsapp: own?.whatsapp ?? replies?.whatsapp,
        by: replies?.by,
    };
}

interface Tailored {
    invitation: {
        content: InvitationContent;
        extras: InvitationExtras;
        rsvpEnabled: boolean;
    };
    events: AudienceEvent[];
}

// The only way an invitation leaves the server for a guest: page, link preview and reply all use it.
export function forViewer<T extends Tailored>(data: T, viewer: Viewer | undefined) {
    const { invitation } = data;
    const { enabled, whatsapp, by } = familyReplies(
        invitation.extras,
        invitation.rsvpEnabled,
        viewer?.side,
    );
    const shown = visibleEvents<T['events'][number]>(data.events, viewer);
    return {
        ...data,
        invitation: {
            ...invitation,
            content: familyContent(invitation.content, viewer?.side),
            rsvpEnabled: enabled,
            extras: {
                ...invitation.extras,
                replies: {
                    whatsapp,
                    by,
                },
            },
        } as T['invitation'],
        events: shown.map(({ audience: _audience, ...event }) => event),
    };
}
