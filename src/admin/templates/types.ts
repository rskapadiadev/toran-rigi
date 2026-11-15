import type { PriceMap } from '@shared/pricing';
import type { InvitationDesign } from '@shared/types';

export type TemplateStatus = 'draft' | 'published' | 'archived';

// One row of GET /admin/templates: the catalogue entry plus its sample's look for the thumbnail.
export interface TemplateRow {
    id: string;
    slug: string;
    name: string;
    description: string;
    eventKind: string;
    culture: string;
    fromPackage: string;
    posterKey: string | null;
    prices: PriceMap | null;
    comparePrices: PriceMap | null;
    status: TemplateStatus;
    isFeatured: boolean;
    sort: number;
    updatedAt: string;
    invitationId: string;
    themeSlug: string | null;
    themeName: string | null;
    design: InvitationDesign;
    previewToken: string;
    sampleSlug: string;
}

export const templatesQuery = { queryKey: ['templates'] } as const;
