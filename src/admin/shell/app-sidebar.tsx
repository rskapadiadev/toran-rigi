import { can } from '@shared/permissions';
import { Link, useLocation } from '@tanstack/react-router';
import { ChevronsUpDown, LogOut, Mail, Search } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';

import type { Me } from '../types';
import { initials, isActive, navGroups, type NavPath, roleLabel } from './nav';

interface AppSidebarProps {
    user: Me;
    counts: Partial<Record<NavPath, number>>;
    onSearch: () => void;
    onSignOut: () => void;
}

export function BrandMark() {
    return (
        <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground shadow-sm ring-1 ring-gold/40">
            <span className="absolute inset-x-0 top-0 h-px bg-gold/70" />
            <span className="font-display text-lg leading-none font-semibold text-gold-bright">
                T
            </span>
        </span>
    );
}

export function AppSidebar({ user, counts, onSearch, onSignOut }: AppSidebarProps) {
    const { pathname } = useLocation();
    const { isMobile, setOpenMobile } = useSidebar();
    const close = () => {
        if (isMobile) setOpenMobile(false);
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="gap-3 pt-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild tooltip="Toran Studio">
                            <Link to="/admin" onClick={close}>
                                <BrandMark />
                                <span className="grid flex-1 leading-tight">
                                    <span className="font-display text-lg font-semibold text-primary">
                                        Toran
                                    </span>
                                    <span className="text-[10px] font-medium tracking-[0.24em] text-gold-deep uppercase">
                                        Studio
                                    </span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Search  ⌘K"
                            onClick={onSearch}
                            className="border bg-background text-muted-foreground shadow-xs group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none hover:bg-background hover:text-foreground"
                        >
                            <Search />
                            <span>Search…</span>
                            <kbd className="pointer-events-none ms-auto hidden rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline">
                                ⌘K
                            </kbd>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {navGroups.map((group) => {
                    const items = group.items.filter((item) => can(user.role, item.permission));
                    if (items.length === 0) return null;
                    return (
                        <SidebarGroup key={group.label}>
                            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                            <SidebarMenu>
                                {items.map((item) => {
                                    const count = counts[item.to];
                                    return (
                                        <SidebarMenuItem key={item.to}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive(item.to, pathname)}
                                                tooltip={item.label}
                                                className="data-[active=true]:bg-background data-[active=true]:text-primary data-[active=true]:shadow-xs data-[active=true]:ring-1 data-[active=true]:ring-sidebar-border"
                                            >
                                                <Link to={item.to} onClick={close}>
                                                    <item.icon />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                            {count ? (
                                                <SidebarMenuBadge className="rounded-full bg-sidebar-accent px-1.5 text-[11px] text-muted-foreground">
                                                    {count}
                                                </SidebarMenuBadge>
                                            ) : null}
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroup>
                    );
                })}
                {import.meta.env.DEV && (
                    <SidebarGroup className="mt-auto">
                        <SidebarGroupLabel>Developer</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Dev mail">
                                    <a href="/dev-mail" target="_blank" rel="noopener noreferrer">
                                        <Mail />
                                        <span>Dev mail</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    aria-label="Account menu"
                                    className="data-[state=open]:bg-sidebar-accent"
                                >
                                    <Avatar className="size-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-gold/20 text-xs font-semibold text-gold-deep">
                                            {initials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="grid flex-1 text-start text-sm leading-tight">
                                        <span className="truncate font-medium">{user.name}</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {roleLabel(user.role)}
                                        </span>
                                    </span>
                                    <ChevronsUpDown className="ms-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side={isMobile ? 'bottom' : 'right'}
                                align="end"
                                sideOffset={6}
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex items-center gap-2 py-1">
                                        <Avatar className="size-8 rounded-lg">
                                            <AvatarFallback className="rounded-lg bg-gold/20 text-xs font-semibold text-gold-deep">
                                                {initials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-sm leading-tight">
                                            <span className="truncate font-medium">
                                                {user.name}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem disabled>
                                        Role
                                        <DropdownMenuShortcut className="tracking-normal">
                                            {roleLabel(user.role)}
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={onSearch}>
                                        <Search />
                                        Command menu
                                        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onSelect={onSignOut}>
                                    <LogOut />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
