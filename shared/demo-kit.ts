// Shared shapes and helpers for demo invitations (wedding demos in demo.ts, others in demo-occasions.ts).
import type { OccasionId } from './occasions';
import type { InvitationContent, InvitationExtras, LocalizedText, SectionConfig } from './types';

export interface DemoDressCode {
    note?: LocalizedText;
    swatches: string[];
}

export interface DemoEvent {
    kind: string;
    title: LocalizedText;
    startsAt: string;
    endsAt?: string;
    timezone: string;
    venue: string;
    address: string;
    mapsUrl: string;
    description?: LocalizedText;
    dressCode?: DemoDressCode;
}

export interface DemoInvitation {
    slug: string;
    themeSlug: string;
    // Omitted on the wedding demos; every other occasion names itself.
    occasion?: OccasionId;
    culture: string;
    locales: string[];
    calendars: string[];
    seed: number;
    content: InvitationContent;
    events: DemoEvent[];
    extras: InvitationExtras;
    sections: SectionConfig[];
}

// t('English', 'gu', 'ગુજરાતી', 'hi', 'हिन्दी') → { en, gu, hi }
export function t(en: string, ...pairs: string[]): LocalizedText {
    const text: LocalizedText = { en };
    for (let i = 0; i + 1 < pairs.length; i += 2) text[pairs[i] ?? ''] = pairs[i + 1] ?? '';
    return text;
}

export const maps = (q: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
