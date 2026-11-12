import type { Role } from '@shared/permissions';

export interface Me {
    id: string;
    email: string;
    name: string;
    role: Role;
}

export interface OrderRow {
    id: string;
    number: string;
    status: string;
    packageCode: string;
    currency: string;
    totalMinor: number;
    culture: string;
    weddingDate: string | null;
    deliveryDueAt: string | null;
    createdAt: string;
    customerName: string;
    customerPhone: string | null;
    assignee: string | null;
    balanceDue: number;
}

export interface Invoice {
    id: string;
    number: string;
    currency: string;
    issueDate: string;
    dueDate: string;
    subtotal: number;
    discount: number;
    taxAmount: number;
    total: number;
    amountPaid: number;
    amountCredited: number;
    balanceDue: number;
    status: string;
}

export interface InvitationRef {
    id: string;
    slug: string;
    status: string;
    previewToken: string;
}

export interface OrderDetail {
    order: {
        id: string;
        number: string;
        status: string;
        packageCode: string;
        currency: string;
        addons: string[];
        totalMinor: number;
        culture: string;
        weddingDate: string | null;
        contentCompletedAt: string | null;
        deliveryDueAt: string | null;
        revisionCount: number;
        portalToken: string;
        assignedUserId: string | null;
        createdAt: string;
    };
    customer: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        country: string;
    } | null;
    events: {
        id: string;
        kind: string;
        fromStatus: string | null;
        toStatus: string | null;
        body: string | null;
        createdAt: string;
        userName: string | null;
    }[];
    invoices: Invoice[];
    invitation: InvitationRef | null;
    assignee: string | null;
}

export interface Catalog {
    packages: {
        code: string;
        name: string;
        tagline: string | null;
        prices: Record<string, number>;
    }[];
    addons: {
        code: string;
        name: string;
        description: string | null;
        prices: Record<string, number>;
    }[];
}

export interface MoneyRow {
    currency: string;
    billedMonth?: number;
    billed?: number;
    collected: number;
    outstanding: number;
    overdue: number;
}

export interface StatusCount {
    status: string;
    n: number;
}

export interface DueSoonRow {
    id: string;
    number: string;
    deliveryDueAt: string | null;
    customerName: string;
    packageCode: string;
    overdue: boolean;
}

export interface UpcomingRow {
    id: string;
    number: string;
    weddingDate: string | null;
    customerName: string;
    culture: string;
}

export interface RecentRow {
    id: string;
    number: string;
    status: string;
    customerName: string;
    createdAt: string;
}

export interface MonthCount {
    month: string;
    n: number;
}

export interface MonthAmount {
    month: string;
    currency: string;
    amount: number;
}

export interface DashboardTrend {
    orders: MonthCount[];
    billed: MonthAmount[];
    collected: MonthAmount[];
}

export interface Dashboard {
    byStatus: StatusCount[];
    money: MoneyRow[];
    /** Absent on servers older than the trend chart. */
    trend?: DashboardTrend;
    dueSoon: DueSoonRow[];
    upcoming: UpcomingRow[];
    recent: RecentRow[];
}

export const activeStatuses = [
    'ready_to_start',
    'design_in_progress',
    'revision_requested',
    'preview_shared',
    'awaiting_approval',
];
