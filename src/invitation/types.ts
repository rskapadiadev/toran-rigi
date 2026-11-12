import type {
    InvitationContent,
    InvitationDesign,
    InvitationExtras,
    LocalizedText,
    SectionConfig,
} from '@shared/types';

// Client-side mirror of server/repos/invitations PublicInvitation (kept structural to respect layering).
export interface PublicDressCode {
    note?: LocalizedText;
    swatches: string[];
}

export interface PublicWishData {
    id: string;
    name: string;
    message: string;
    createdAt: string;
}

export interface GuestIdentity {
    name: string;
    token: string;
}

export interface PublicInvitationEvent {
    id: string;
    kind: string;
    title: LocalizedText;
    startsAt: string;
    endsAt: string | null;
    timezone: string;
    venue: string;
    address: string | null;
    mapsUrl: string | null;
    description: LocalizedText | null;
    dressCode: PublicDressCode | null;
}

export interface PublicInvitationData {
    invitation: {
        id: string;
        slug: string;
        culture: string;
        // Occasion id (wedding, naming, prayer_meet…); stored in the `event_kind` column.
        eventKind: string;
        locales: string[];
        calendars: string[];
        seed: number;
        design: InvitationDesign;
        content: InvitationContent;
        sections: SectionConfig[];
        extras: InvitationExtras;
        rsvpEnabled: boolean;
        status: string;
        musicBlobKey: string | null;
        isDemo: boolean;
    };
    events: PublicInvitationEvent[];
    themeSlug: string | null;
    diyaCount: number;
    wishes: PublicWishData[];
}
