import { can } from '@shared/permissions';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Navigate, Outlet, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { AppSidebar, BrandMark } from '@/admin/shell/app-sidebar';
import { CommandMenu } from '@/admin/shell/command-menu';
import { StatusBar } from '@/admin/shell/status-bar';
import { applyAdminTheme, readAdminTheme } from '@/admin/shell/theme';
import { activeStatuses, type Dashboard } from '@/admin/types';
import { useMe } from '@/admin/useMe';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
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
        applyAdminTheme(readAdminTheme());
        return () => {
            document.documentElement.classList.remove('admin-ui', 'dark');
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

    // An invitation opens in the full-screen visual editor: no sidebar, header or page chrome.
    if (/^\/admin\/invitations\/(?!new\b)[^/]+\/?$/.test(location.pathname)) return <Outlet />;

    const logout = async () => {
        await post('/auth/logout', {});
        client.clear();
        window.location.href = '/admin/login';
    };
    const active = (dashboard?.byStatus ?? [])
        .filter((s) => activeStatuses.includes(s.status))
        .reduce((sum, s) => sum + s.n, 0);

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
            {/* PayD's inset: pages sit on the grey ground with 16px around them; main is the only
                scroller, so a page that fills fits it exactly. */}
            <SidebarInset className="isolate flex h-svh min-h-0 min-w-0 flex-col bg-background">
                <main className="admin-page flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-none p-4">
                    <Outlet />
                </main>
                <StatusBar />
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
