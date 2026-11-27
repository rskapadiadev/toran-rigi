import type { Permission } from '@shared/permissions';
import {
    Handshake,
    LayoutDashboard,
    LayoutTemplate,
    Library,
    type LucideIcon,
    Music,
    Receipt,
    ShoppingBag,
    Sparkles,
    Tag,
    Users,
} from 'lucide-react';

export type NavPath =
    | '/admin'
    | '/admin/orders'
    | '/admin/orders/new'
    | '/admin/invitations'
    | '/admin/templates'
    | '/admin/library'
    | '/admin/pricing'
    | '/admin/affiliates'
    | '/admin/music'
    | '/admin/customers'
    | '/admin/billing'
    | '/admin/portraits';

export interface NavChild {
    to: NavPath;
    label: string;
    permission: Permission;
}

export interface NavItem {
    to: NavPath;
    label: string;
    icon: LucideIcon;
    permission: Permission;
    keywords?: string[];
    // Sub-pages shown nested under the item (with a guide line), like Payments → Transactions.
    children?: NavChild[];
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

export const navGroups: NavGroup[] = [
    {
        label: 'Studio',
        items: [
            {
                to: '/admin',
                label: 'Overview',
                icon: LayoutDashboard,
                permission: 'dashboard.view',
                keywords: ['dashboard', 'home'],
            },
            {
                to: '/admin/orders',
                label: 'Orders',
                icon: ShoppingBag,
                permission: 'orders.view',
                keywords: ['projects', 'pipeline'],
                children: [
                    {
                        to: '/admin/orders',
                        label: 'All orders',
                        permission: 'orders.view',
                    },
                    {
                        to: '/admin/orders/new',
                        label: 'New order',
                        permission: 'orders.create',
                    },
                ],
            },
            {
                to: '/admin/invitations',
                label: 'Invitations',
                icon: Sparkles,
                permission: 'orders.view',
                keywords: ['composer', 'design', 'editor'],
            },
        ],
    },
    {
        label: 'Business',
        items: [
            {
                to: '/admin/customers',
                label: 'Customers',
                icon: Users,
                permission: 'customers.view',
                keywords: ['couples', 'clients'],
            },
            {
                to: '/admin/billing',
                label: 'Billing',
                icon: Receipt,
                permission: 'billing.view',
                keywords: ['invoices', 'payments', 'money'],
            },
            {
                to: '/admin/templates',
                label: 'Templates',
                icon: LayoutTemplate,
                permission: 'orders.view',
                keywords: ['designs', 'catalogue', 'starting point', 'samples', 'demos'],
            },
            {
                to: '/admin/pricing',
                label: 'Pricing',
                icon: Tag,
                permission: 'billing.view',
                keywords: ['prices', 'packages', 'sale', 'discount', 'rates'],
            },
            {
                to: '/admin/affiliates',
                label: 'Affiliates',
                icon: Handshake,
                permission: 'orders.view',
                keywords: [
                    'partners',
                    'referral',
                    'planners',
                    'photographers',
                    'reference',
                    'logo',
                ],
            },
            {
                to: '/admin/music',
                label: 'Music',
                icon: Music,
                permission: 'orders.view',
                keywords: ['songs', 'tracks', 'audio', 'background music'],
            },
            {
                to: '/admin/library',
                label: 'Library',
                icon: Library,
                permission: 'orders.view',
                keywords: ['components', 'openings', 'blocks', 'themes'],
            },
            {
                to: '/admin/portraits',
                label: 'AI photo lab',
                icon: Sparkles,
                permission: 'portraits.test',
                keywords: ['ai', 'pre-wedding', 'portraits', 'photos', 'gemini', 'flux'],
            },
        ],
    },
];

export const isActive = (to: NavPath, pathname: string) =>
    to === '/admin'
        ? pathname === '/admin' || pathname === '/admin/'
        : pathname === to || pathname.startsWith(`${to}/`);

export const roleLabel = (role: string) =>
    role
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

export const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w.charAt(0).toUpperCase())
        .join('');

// Among sibling sub-pages, the most specific match wins (/admin/orders/new is not "All orders").
export function activeChild(children: NavChild[], pathname: string): NavPath | undefined {
    return children
        .filter((c) => pathname === c.to || pathname.startsWith(`${c.to}/`))
        .sort((a, b) => b.to.length - a.to.length)[0]?.to;
}

// A parent is "open" when you are on it or on any of its sub-pages.
export const inSection = (item: NavItem, pathname: string) =>
    isActive(item.to, pathname) || (item.children ?? []).some((c) => isActive(c.to, pathname));
