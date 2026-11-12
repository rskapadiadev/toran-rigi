import { can } from '@shared/permissions';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, Navigate, Outlet, useLocation } from '@tanstack/react-router';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AppSidebar, BrandMark } from '@/admin/shell/app-sidebar';
import { AdminBreadcrumbs } from '@/admin/shell/breadcrumbs';
import { CommandMenu } from '@/admin/shell/command-menu';
import { activeStatuses, type Dashboard } from '@/admin/types';
import { useMe } from '@/admin/useMe';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { api, post } from '@/lib/api';

export const Route = createFileRoute('/admin')({
    ssr: false,
    head: () => ({
        meta: [
            { title: 'Toran Studio' },
            {
                name: 'robots',
                content: 'noindex',
            },
        ],
    }),
    component: AdminRoot,
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 15_000,
            retry: 1,
        },
    },
});

function AdminRoot() {
    // shadcn's global border/outline defaults are scoped to the admin (see app.css), never invitations.
    useEffect(() => {
        document.documentElement.classList.add('admin-ui');
        return () => {
            document.documentElement.classList.remove('admin-ui');
        };
    }, []);
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={200}>
                <AdminShell />
                <Toaster position="bottom-right" richColors={false} closeButton />
            </TooltipProvider>
        </QueryClientProvider>
    );
}

function readSidebarCookie() {
    return !document.cookie.includes('sidebar_state=false');
}

function AdminShell() {
    const location = useLocation();
    const client = useQueryClient();
    const [commandOpen, setCommandOpen] = useState(false);
    const [defaultOpen] = useState(readSidebarCookie);
    const isLogin = location.pathname.startsWith('/admin/login');
    const me = useMe();
    const user = me.data;
    const { data: dashboard } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => api<Dashboard>('/admin/dashboard'),
        enabled: !!user && !isLogin && can(user.role, 'dashboard.view'),
    });

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandOpen((open) => !open);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
        };
    }, []);

    if (isLogin) return <Outlet />;
    if (me.isPending || (me.isFetching && !me.data)) return <ShellSkeleton />;
    if (!user) return <Navigate to="/admin/login" search={{ next: location.pathname }} replace />;

    const logout = async () => {
        await post('/auth/logout', {});
        client.clear();
        window.location.href = '/admin/login';
    };
    const active = (dashboard?.byStatus ?? [])
        .filter((s) => activeStatuses.includes(s.status))
        .reduce((sum, s) => sum + s.n, 0);
    // The Composer is a full-bleed workspace; every other page sits in a centred column.
    const fullBleed = /^\/admin\/invitations\/[^/]+\/?$/.test(location.pathname);

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar
                user={user}
                counts={{ '/admin/orders': active }}
                onSearch={() => {
                    setCommandOpen(true);
                }}
                onSignOut={() => void logout()}
            />
            <SidebarInset className="min-w-0 bg-background">
                <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sm:px-6">
                    <SidebarTrigger className="-ms-1.5 text-muted-foreground" />
                    <Separator
                        orientation="vertical"
                        className="me-1 data-[orientation=vertical]:h-4"
                    />
                    <AdminBreadcrumbs />
                    <div className="ms-auto flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden h-8 w-56 justify-start gap-2 bg-card px-2.5 font-normal text-muted-foreground shadow-none lg:flex"
                            onClick={() => {
                                setCommandOpen(true);
                            }}
                        >
                            <Search />
                            Search or jump to…
                            <Kbd className="ms-auto">⌘K</Kbd>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="lg:hidden"
                            aria-label="Open command menu"
                            onClick={() => {
                                setCommandOpen(true);
                            }}
                        >
                            <Search />
                        </Button>
                        {can(user.role, 'orders.create') && (
                            <Button size="sm" className="h-8" asChild>
                                <Link to="/admin/orders/new">
                                    <Plus />
                                    <span className="hidden sm:inline">New order</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </header>
                <main
                    className={
                        fullBleed
                            ? 'min-w-0 flex-1'
                            : 'mx-auto w-full max-w-[1400px] min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'
                    }
                >
                    <Outlet />
                </main>
            </SidebarInset>
            <CommandMenu
                user={user}
                open={commandOpen}
                onOpenChange={setCommandOpen}
                onSignOut={() => void logout()}
            />
        </SidebarProvider>
    );
}

function ShellSkeleton() {
    return (
        <div className="flex min-h-svh bg-background">
            <div className="hidden w-64 flex-col gap-3 border-e bg-sidebar p-3 md:flex">
                <div className="flex items-center gap-2 p-2">
                    <BrandMark />
                    <Skeleton className="h-4 w-20" />
                </div>
                {[0, 1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                ))}
            </div>
            <div className="flex-1 space-y-6 p-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    );
}
