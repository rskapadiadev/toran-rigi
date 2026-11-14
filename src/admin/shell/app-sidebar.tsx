import { can } from '@shared/permissions';
import { Link, useLocation } from '@tanstack/react-router';
import { ChevronRight, ChevronsUpDown, LogOut, Mail, Search } from 'lucide-react';

import { ToranSeal } from '@/components/brand/toran-seal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

import type { Me } from '../types';
import {
    activeChild,
    initials,
    inSection,
    isActive,
    navGroups,
    type NavPath,
    roleLabel,
} from './nav';

interface AppSidebarProps {
    user: Me;
    counts: Partial<Record<NavPath, number>>;
    onSearch: () => void;
    onSignOut: () => void;
}

// The full Toran seal, small: the same stamp as the login page, gold on a dark disc.
export function BrandMark() {
    return (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-night text-gold-bright shadow-sm ring-1 ring-gold/30">
            <ToranSeal className="size-[2.15rem]" />
        </span>
    );
}

// Active page: a soft tint with a hairline ring, as in the reference admin.
const activeItem =
    'data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary';

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
                        {/* Brand card: the seal, product and panel name. */}
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            tooltip="Toran Studio"
                            className="bg-sidebar-accent group-data-[collapsible=icon]:bg-transparent hover:bg-sidebar-card-hover"
                        >
                            <Link to="/admin" onClick={close}>
                                <BrandMark />
                                <span className="grid flex-1 leading-tight">
                                    <span className="truncate text-sm font-semibold">
                                        Toran Studio
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Admin panel
                                    </span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Search  ⌘K"
                            onClick={onSearch}
                            className="bg-sidebar-accent text-muted-foreground group-data-[collapsible=icon]:bg-transparent hover:bg-sidebar-card-hover hover:text-foreground"
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
                                    const children = (item.children ?? []).filter((c) =>
                                        can(user.role, c.permission),
                                    );
                                    if (children.length > 0) {
                                        const current = activeChild(children, pathname);
                                        return (
                                            <Collapsible
                                                key={item.to}
                                                asChild
                                                defaultOpen={inSection(item, pathname)}
                                                className="group/collapsible"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton tooltip={item.label}>
                                                            <item.icon />
                                                            <span>{item.label}</span>
                                                            {count ? (
                                                                <span className="ms-auto rounded-md bg-sidebar-card-hover px-1.5 text-[11px] text-muted-foreground">
                                                                    {count}
                                                                </span>
                                                            ) : null}
                                                            <ChevronRight
                                                                className={cn(
                                                                    'transition-transform group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180 rtl:group-data-[state=open]/collapsible:rotate-90',
                                                                    !count && 'ms-auto',
                                                                )}
                                                            />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub className="me-0 pe-0">
                                                            {children.map((child) => (
                                                                <SidebarMenuSubItem key={child.to}>
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        isActive={
                                                                            current === child.to
                                                                        }
                                                                        className={activeItem}
                                                                    >
                                                                        <Link
                                                                            to={child.to}
                                                                            onClick={close}
                                                                        >
                                                                            <span>
                                                                                {child.label}
                                                                            </span>
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            ))}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        );
                                    }
                                    return (
                                        <SidebarMenuItem key={item.to}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive(item.to, pathname)}
                                                tooltip={item.label}
                                                className={activeItem}
                                            >
                                                <Link to={item.to} onClick={close}>
                                                    <item.icon />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                            {count ? (
                                                <SidebarMenuBadge className="rounded-md bg-sidebar-card-hover px-1.5 text-[11px] text-muted-foreground">
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
                                    className="bg-sidebar-accent group-data-[collapsible=icon]:bg-transparent hover:bg-sidebar-card-hover data-[state=open]:bg-sidebar-card-hover"
                                >
                                    <Avatar className="size-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-gold/20 text-xs font-semibold text-gold-deep">
                                            {initials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="grid flex-1 text-start text-sm leading-tight">
                                        <span className="truncate font-medium">{user.name}</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {user.email}
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
