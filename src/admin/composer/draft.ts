import { occasionOf } from '@shared/occasions';
import { peopleOf } from '@shared/people';
import type { EventInput, SaveInvitationInput } from '@shared/schemas/composer';

import type { PublicInvitationData } from '../../invitation/types';

export type Draft = SaveInvitationInput;

export interface OrderLimits {
    events: number;
    languages: number;
    photos: number;
}

export interface InvitationOrder {
    id: string;
    number: string;
    packageCode: string;
    limits: OrderLimits;
}

export interface InvitationCounts {
    guests: number;
    rsvps: number;
    pendingWishes: number;
}

export interface EditableInvitation {
    invitation: {
        id: string;
        slug: string;
        status: string;
        culture: string;
        eventKind: string;
        locales: string[];
        calendars: string[];
        seed: number;
        design: Draft['design'];
        content: Draft['content'];
        sections: Draft['sections'];
        extras: Draft['extras'];
        rsvpEnabled: boolean;
        previewToken: string;
        musicBlobKey: string | null;
        isDemo: boolean;
        publishedAt: string | null;
        expiresAt: string | null;
    };
    events: (Omit<EventInput, 'endsAt' | 'address' | 'mapsUrl' | 'description' | 'dressCode'> & {
        id: string;
        endsAt: string | null;
        address: string | null;
        mapsUrl: string | null;
        description: EventInput['description'] | null;
        dressCode: EventInput['dressCode'] | null;
    })[];
    themeSlug: string | null;
    order: InvitationOrder | null;
    counts: InvitationCounts;
}

const undef = <T>(v: T | null): T | undefined => v ?? undefined;

export function toDraft(data: EditableInvitation): Draft {
    const { invitation } = data;
    const { couple: _legacy, ...content } = invitation.content as Draft['content'] & {
        couple?: unknown;
    };
    return {
        occasion: occasionOf(invitation.eventKind).id,
        culture: invitation.culture,
        themeSlug: data.themeSlug ?? undefined,
        locales: invitation.locales,
        calendars: invitation.calendars.filter(
            (c): c is 'islamic-umalqura' | 'hebrew' => c === 'islamic-umalqura' || c === 'hebrew',
        ),
        seed: invitation.seed,
        design: invitation.design,
        content: {
            ...content,
            people: peopleOf(invitation.content),
        },
        sections: invitation.sections,
        extras: invitation.extras,
        rsvpEnabled: invitation.rsvpEnabled,
        events: data.events.map((e) => ({
            id: e.id,
            kind: e.kind,
            title: e.title,
            startsAt: e.startsAt,
            endsAt: e.endsAt ?? '',
            timezone: e.timezone,
            venue: e.venue,
            address: undef(e.address),
            mapsUrl: e.mapsUrl ?? '',
            description: undef(e.description),
            dressCode: undef(e.dressCode),
        })),
    };
}

// The live preview renders the real invitation engine from the unsaved draft.
export function draftToPreview(draft: Draft, base: EditableInvitation): PublicInvitationData {
    return {
        invitation: {
            id: base.invitation.id,
            slug: base.invitation.slug,
            culture: draft.culture,
            eventKind: draft.occasion,
            locales: draft.locales,
            calendars: draft.calendars,
            seed: draft.seed,
            design: draft.design,
            content: draft.content,
            sections: draft.sections,
            extras: draft.extras,
            rsvpEnabled: draft.rsvpEnabled,
            status: 'preview',
            musicBlobKey: base.invitation.musicBlobKey,
            isDemo: base.invitation.isDemo,
        },
        events: draft.events.map((e, i) => ({
            id: e.id ?? `draft-${i}`,
            kind: e.kind,
            title: e.title,
            startsAt: e.startsAt,
            endsAt: e.endsAt || null,
            timezone: e.timezone,
            venue: e.venue,
            address: e.address ?? null,
            mapsUrl: e.mapsUrl || null,
            description: e.description ?? null,
            dressCode: e.dressCode ?? null,
        })),
        themeSlug: draft.themeSlug ?? null,
        diyaCount: 108,
        wishes: [],
    };
}

export const timezones = [
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Riyadh',
    'Asia/Qatar',
    'Asia/Karachi',
    'Asia/Dhaka',
    'Asia/Singapore',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'America/Toronto',
    'Australia/Sydney',
    'Africa/Nairobi',
    'Asia/Jerusalem',
];
