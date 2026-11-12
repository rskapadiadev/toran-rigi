import { can } from '@shared/permissions';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, Mail, PanelLeft, Plus, ShoppingBag } from 'lucide-react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import { useSidebar } from '@/components/ui/sidebar';
import { api } from '@/lib/api';

import { statusLabel } from '../labels';
import type { Me, OrderRow } from '../types';
import { navGroups } from './nav';

interface CommandMenuProps {
    user: Me;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSignOut: () => void;
}

export function CommandMenu({ user, open, onOpenChange, onSignOut }: CommandMenuProps) {
    const navigate = useNavigate();
    const { toggleSidebar } = useSidebar();
    const { data: orders = [] } = useQuery({
        queryKey: ['orders'],
        queryFn: () => api<OrderRow[]>('/admin/orders'),
        enabled: open && can(user.role, 'orders.view'),
    });
    const run = (action: () => unknown) => {
        onOpenChange(false);
        void action();
    };

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Command menu"
            description="Jump to a page, an order or run an action"
            className="sm:max-w-xl"
        >
            <CommandInput placeholder="Type a command or search orders…" />
            <CommandList className="max-h-[420px]">
                <CommandEmpty>Nothing found.</CommandEmpty>
                <CommandGroup heading="Actions">
                    {can(user.role, 'orders.create') && (
                        <CommandItem
                            value="New order create"
                            onSelect={() => {
                                run(() => navigate({ to: '/admin/orders/new' }));
                            }}
                        >
                            <Plus />
                            New order
                        </CommandItem>
                    )}
                    <CommandItem
                        value="Toggle sidebar"
                        onSelect={() => {
                            run(toggleSidebar);
                        }}
                    >
                        <PanelLeft className="rtl:rotate-180" />
                        Toggle sidebar
                        <CommandShortcut>⌘B</CommandShortcut>
                    </CommandItem>
                    {import.meta.env.DEV && (
                        <CommandItem
                            value="Dev mail inbox"
                            onSelect={() => {
                                run(() => window.open('/dev-mail', '_blank', 'noopener'));
                            }}
                        >
                            <Mail />
                            Open dev mail
                        </CommandItem>
                    )}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Go to">
                    {navGroups
                        .flatMap((g) => g.items)
                        .filter((item) => can(user.role, item.permission))
                        .map((item) => (
                            <CommandItem
                                key={item.to}
                                value={`${item.label} ${(item.keywords ?? []).join(' ')}`}
                                onSelect={() => {
                                    run(() => navigate({ to: item.to }));
                                }}
                            >
                                <item.icon />
                                {item.label}
                            </CommandItem>
                        ))}
                </CommandGroup>
                {orders.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Orders">
                            {orders.slice(0, 50).map((o) => (
                                <CommandItem
                                    key={o.id}
                                    value={`${o.number} ${o.customerName} ${o.customerPhone ?? ''}`}
                                    onSelect={() => {
                                        run(() =>
                                            navigate({
                                                to: '/admin/orders/$id',
                                                params: { id: o.id },
                                            }),
                                        );
                                    }}
                                >
                                    <ShoppingBag />
                                    <span className="font-medium">{o.number}</span>
                                    <span className="truncate text-muted-foreground">
                                        {o.customerName}
                                    </span>
                                    <CommandShortcut className="tracking-normal">
                                        {statusLabel[o.status]}
                                    </CommandShortcut>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}
                <CommandSeparator />
                <CommandGroup heading="Account">
                    <CommandItem
                        value="Sign out log out"
                        onSelect={() => {
                            run(onSignOut);
                        }}
                    >
                        <LogOut />
                        Sign out
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
