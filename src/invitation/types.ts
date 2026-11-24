import type {
    InvitationContent,
    InvitationDesign,
    InvitationExtras,
    LocalizedText,
    SectionConfig,
} from '@shared/types';

// Client-side mirror of server/repos/invitations PublicInvitation (kept structural to respect layering).
export interface PublicDressCode {
    title?: LocalizedText;
    note?: LocalizedText;
    ladies?: LocalizedText;
    gentlemen?: LocalizedText;
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
    // The most people the couple expects from this family.
    max?: number;
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
    // Referring affiliate for the footer ("their logo × Toran"); absent when none.
    affiliate?: PublicAffiliateData | null;
}

export interface PublicAffiliateData {
    name: string;
    logoKey: string | null;
    website: string | null;
}
