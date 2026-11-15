import type { InvitationDesign } from '@shared/types';

import type { EditableInvitation, OrderLimits } from '@/admin/composer/draft';

export interface StoreTemplate {
    slug: string;
    name: string;
    description: string;
    eventKind: string;
    culture: string;
    isFeatured: boolean;
    packageCode: string;
    packageName: string;
    price: number | null;
    sampleSlug: string;
    design: InvitationDesign;
    themeName: string | null;
}

export interface StoreCatalogue {
    currency: string;
    templates: StoreTemplate[];
}

export interface StoreOffer {
    code: string;
    name: string;
    limits: OrderLimits & { hostingMonths?: number };
    price: number;
    currency: string;
}

export interface TryTemplate {
    template: {
        slug: string;
        name: string;
        description: string;
    };
    offer: StoreOffer | null;
    edit: EditableInvitation;
}

export interface MyInvitationRow {
    id: string;
    slug: string;
    status: string;
    title: string;
    orderId: string;
    orderNumber: string;
    balance: number;
    design: InvitationDesign;
    createdAt: string;
}

export interface Me {
    customer: {
        id: string;
        name: string;
        email: string | null;
    };
    invitations: MyInvitationRow[];
    payments: 'fake' | 'razorpay';
}

export interface MyInvitation {
    edit: EditableInvitation;
    orderId: string;
    balance: number;
    currency: string;
    price: number;
    lockedAfter: string | null;
}

export interface BuyResult {
    orderId: string;
    invitationId: string;
}
