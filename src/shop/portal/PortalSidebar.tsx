import { Link, useLocation, useParams } from '@tanstack/react-router';
import {
    ChevronsUpDown,
    CreditCard,
    ExternalLink,
    Images,
    LayoutTemplate,
    LogOut,
    type LucideIcon,
    PenLine,
    Sparkles,
    Users,
} from 'lucide-react';

import { BrandMark } from '@/admin/shell/app-sidebar';
import { initials } from '@/admin/shell/nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import type { Me } from '@/shop/types';

interface PortalSidebarProps {
    me: Me;
    // Orders waiting to be paid.
    due: number;
    onSignOut: () => void;
}

interface Page {
    to: '/my' | '/my/payments';
    label: string;
    icon: LucideIcon;
    count?: number;
}

interface InvitationPage {
    to: '/my/$id' | '/my/$id/guests' | '/my/$id/cards';
    label: string;
    icon: LucideIcon;
}

const invitationPages: InvitationPage[] = [
    {
        to: '/my/$id',
        label: 'Edit',
        icon: PenLine,
    },
    {
        to: '/my/$id/guests',
        label: 'Guests & replies',
        icon: Users,
    },
    {
        to: '/my/$id/cards',
        label: 'Cards',
        icon: Images,
    },
];

// The studio sidebar's look: soft tint on the open page.
const activeItem =
    'data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary';

export function PortalSidebar({ me, due, onSignOut }: PortalSidebarProps) {
    const { pathname } = useLocation();
    const { id } = useParams({ strict: false });
    const { isMobile, setOpenMobile } = useSidebar();
    const close = () => {
        if (isMobile) setOpenMobile(false);
    };
    const pages: Page[] = [
        {
            to: '/my',
            label: 'My invitations',
            icon: Sparkles,
            count: me.invitations.length,
        },
        {
            to: '/my/payments',
            label: 'Payments',
            icon: CreditCard,
            count: due,
        },
    ];
    const open = me.invitations.find((inv) => inv.id === id);
    const { name, email } = me.customer;
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="pt-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            tooltip="Toran"
                            className="bg-sidebar-accent group-data-[collapsible=icon]:bg-transparent hover:bg-sidebar-card-hover"
                        >
                            <Link to="/" onClick={close}>
                                <BrandMark />
                                <span className="grid flex-1 leading-tight">
                                    <span className="truncate text-sm font-semibold">Toran</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Your celebrations
                                    </span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Account</SidebarGroupLabel>
                    <SidebarMenu>
                        {pages.map((page) => (
                            <SidebarMenuItem key={page.to}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.replace(/\/$/, '') === page.to}
                                    tooltip={page.label}
                                    className={activeItem}
                                >
                                    <Link to={page.to} onClick={close}>
                                        <page.icon />
                                        <span>{page.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {page.count ? (
                                    <SidebarMenuBadge className="rounded-md bg-sidebar-card-hover px-1.5 text-[11px] text-muted-foreground">
                                        {page.count}
                                    </SidebarMenuBadge>
                                ) : null}
                            </SidebarMenuItem>
                        ))}
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Browse designs">
                                <Link to="/collections" onClick={close}>
                                    <LayoutTemplate />
                                    <span>Browse designs</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                {open && (
                    <SidebarGroup>
                        <SidebarGroupLabel>
                            <span className="truncate">{open.title}</span>
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {invitationPages.map((page) => (
                                <SidebarMenuItem key={page.to}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === page.to.replace('$id', open.id)}
                                        tooltip={page.label}
                                        className={activeItem}
                                    >
                                        <Link to={page.to} params={{ id: open.id }} onClick={close}>
                                            <page.icon />
                                            <span>{page.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            {open.status === 'published' && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="View live">
                                        <a
                                            href={`/${open.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink />
                                            <span>View live</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
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
                                            {initials(name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="grid flex-1 text-start text-sm leading-tight">
                                        <span className="truncate font-medium">{name}</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {email}
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
