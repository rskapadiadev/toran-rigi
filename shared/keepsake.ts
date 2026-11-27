// When a design's months online are over, the invitation stays as a keepsake: the names, the day,
// the story and the photos, with a thank-you. Replies, contacts, venues and gifts come off.
import type { SectionType } from './types';

const kept: readonly SectionType[] = ['cover', 'card', 'story', 'family', 'gallery', 'closing'];

export const hasEnded = (expiresAt: string | null | undefined, now = new Date()): boolean =>
    Boolean(expiresAt && expiresAt <= now.toISOString());

interface KeepsakeEvent {
    venue: string;
    address: string | null;
    mapsUrl: string | null;
    description: unknown;
    dressCode: unknown;
}

interface KeepsakeSection {
    type: SectionType;
    enabled: boolean;
}

interface KeepsakeSource<E extends KeepsakeEvent> {
    invitation: {
        rsvpEnabled: boolean;
        sections: readonly KeepsakeSection[];
        extras: Record<string, unknown>;
    };
    events: readonly E[];
}

export function asKeepsake<E extends KeepsakeEvent, T extends KeepsakeSource<E>>(full: T): T {
    const { invitation } = full;
    // Only what a guest would keep: no way to reply, call, travel or send a gift any more.
    const extras = Object.fromEntries(
        Object.entries(invitation.extras).filter(
            ([key]) => !['shagun', 'live', 'travel', 'contacts', 'replies', 'wishes'].includes(key),
        ),
    );
    return {
        ...full,
        invitation: {
            ...invitation,
            rsvpEnabled: false,
            ended: true,
            extras: {
                ...extras,
                wishes: { enabled: false },
            },
            sections: invitation.sections.filter((s) => kept.includes(s.type)),
        },
        events: full.events.map((e) => ({
            ...e,
            venue: '',
            address: null,
            mapsUrl: null,
            description: null,
            dressCode: null,
        })),
    };
}
