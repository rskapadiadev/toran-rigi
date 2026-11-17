// One row of GET /admin/affiliates (see server/repos/affiliates.ts).
export interface Affiliate {
    id: string;
    name: string;
    code: string;
    details: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    commissionBps: number;
    isActive: boolean;
    logoKey: string | null;
    createdAt: string;
    invitations: number;
}

export const affiliatesQuery = { queryKey: ['affiliates'] } as const;
