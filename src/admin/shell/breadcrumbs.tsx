import { titleOf } from '@shared/people';
import { useQuery } from '@tanstack/react-query';
import { Link, useMatches } from '@tanstack/react-router';
import { Fragment } from 'react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { api } from '@/lib/api';

import type { EditableInvitation } from '../composer/draft';
import type { OrderDetail } from '../types';

type CrumbPath =
    '/admin/orders' | '/admin/invitations' | '/admin/customers' | '/admin/invitations/$id';

interface Crumb {
    label: string;
    to?: CrumbPath;
}

interface Params {
    id?: string;
}

// Detail crumbs read the same query keys the pages use, so they resolve from cache without extra requests.
function useDetailLabels(routeId: string, id: string | undefined) {
    const order = useQuery({
        queryKey: ['order', id],
        queryFn: () => api<OrderDetail>(`/admin/orders/${id ?? ''}`),
        enabled: routeId === '/admin/orders/$id' && !!id,
    });
    const invitation = useQuery({
        queryKey: ['invitation', id],
        queryFn: () => api<EditableInvitation>(`/admin/invitations/${id ?? ''}`),
        enabled: routeId.startsWith('/admin/invitations/$id') && !!id,
    });
    const couple = invitation.data
        ? titleOf(invitation.data.invitation.content, invitation.data.invitation.locales[0] ?? 'en')
        : undefined;
    return {
        order: order.data ? order.data.order.number : undefined,
        invitation: couple || (invitation.data ? `/${invitation.data.invitation.slug}` : undefined),
    };
}

export function AdminBreadcrumbs() {
    const matches = useMatches();
    const leaf = matches.at(-1);
    const routeId = leaf?.routeId ?? '';
    const { id } = (leaf?.params ?? {}) as Params;
    const labels = useDetailLabels(routeId, id);

    const crumbs: Crumb[] = [];
    if (routeId === '/admin/') crumbs.push({ label: 'Overview' });
    if (routeId.startsWith('/admin/orders')) {
        crumbs.push({
            label: 'Orders',
            to: '/admin/orders',
        });
        if (routeId === '/admin/orders/new') crumbs.push({ label: 'New order' });
        if (routeId === '/admin/orders/$id') crumbs.push({ label: labels.order ?? 'Order' });
    }
    if (routeId.startsWith('/admin/invitations')) {
        crumbs.push({
            label: 'Invitations',
            to: '/admin/invitations',
        });
        if (routeId === '/admin/invitations/$id/')
            crumbs.push({ label: labels.invitation ?? 'Composer' });
        if (routeId === '/admin/invitations/$id/guests') {
            crumbs.push({
                label: labels.invitation ?? 'Invitation',
                to: '/admin/invitations/$id',
            });
            crumbs.push({ label: 'Guests & RSVPs' });
        }
    }
    if (routeId.startsWith('/admin/customers')) {
        crumbs.push({
            label: 'Customers',
            to: '/admin/customers',
        });
        if (routeId === '/admin/customers/$id') crumbs.push({ label: 'Ledger' });
    }
    if (routeId === '/admin/billing') crumbs.push({ label: 'Billing' });
    // The leaf is always the current page, never a link.
    const last = crumbs.at(-1);
    if (last) last.to = undefined;

    return (
        <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem className="hidden md:inline-flex">
                    <BreadcrumbLink asChild>
                        <Link to="/admin">Studio</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {crumbs.map((c, i) => (
                    <Fragment key={`${c.label}-${String(i)}`}>
                        <BreadcrumbSeparator className="hidden md:block rtl:rotate-180" />
                        <BreadcrumbItem className="min-w-0">
                            {c.to ? (
                                <BreadcrumbLink asChild>
                                    {c.to === '/admin/invitations/$id' ? (
                                        <Link to={c.to} params={{ id: id ?? '' }}>
                                            {c.label}
                                        </Link>
                                    ) : (
                                        <Link to={c.to}>{c.label}</Link>
                                    )}
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage className="truncate font-medium">
                                    {c.label}
                                </BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
