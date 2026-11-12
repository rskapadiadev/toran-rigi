import type { Permission } from '@shared/permissions';
import {
    LayoutDashboard,
    type LucideIcon,
    Receipt,
    ShoppingBag,
    Sparkles,
    Users,
} from 'lucide-react';

export type NavPath =
    '/admin' | '/admin/orders' | '/admin/invitations' | '/admin/customers' | '/admin/billing';

export interface NavItem {
    to: NavPath;
    label: string;
    icon: LucideIcon;
    permission: Permission;
    keywords?: string[];
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
            },
            {
                to: '/admin/invitations',
                label: 'Invitations',
                icon: Sparkles,
                permission: 'orders.view',
                keywords: ['composer', 'design'],
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
