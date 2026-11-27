// The customer's portal: the studio's design system (sidebar, graphite ground, white cards) around
// their invitations, guests, cards and payments. Signed out, it is one sign-in card.
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Outlet, useMatches } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { EmptyState, PageSkeleton } from '@/admin/kit/page';
import { BrandMark } from '@/admin/shell/app-sidebar';
import { StatusBar } from '@/admin/shell/status-bar';
import { applyAdminTheme, readAdminTheme } from '@/admin/shell/theme';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ApiError, post } from '@/lib/api';
import { SignIn } from '@/shop/SignIn';

import { meKey, ordersKey, useMe, useMyOrders } from './data';
import { PortalSidebar } from './PortalSidebar';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 15_000,
            retry: false,
            // Leaving to read the sign-in code must not reset the page they were on.
            refetchOnWindowFocus: false,
        },
    },
});

const readSidebarCookie = () => !document.cookie.includes('sidebar_state=false');

export function PortalShell() {
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
                <Portal />
                <Toaster position="top-center" richColors={false} closeButton />
            </TooltipProvider>
        </QueryClientProvider>
    );
}

function Portal() {
    const client = useQueryClient();
    const me = useMe();
    const orders = useMyOrders(me.data !== undefined);
    const [defaultOpen] = useState(readSidebarCookie);
    const matches = useMatches();
    const leaf = matches.at(-1)?.routeId ?? '';

    if (me.isPending)
        return (
            <div className="min-h-svh bg-background p-8">
                <PageSkeleton />
            </div>
        );
    if (me.error instanceof ApiError && me.error.status === 401)
        return (
            <SignInPage
                onDone={() => {
                    void client.invalidateQueries();
                }}
            />
        );
    if (!me.data)
        return (
            <div className="flex min-h-svh items-center justify-center bg-background p-6">
                <EmptyState
                    title="We couldn’t load your account"
                    description="Check your connection and try again."
                >
                    <Button
                        onClick={() => {
                            void me.refetch();
                        }}
                    >
                        Try again
                    </Button>
                </EmptyState>
            </div>
        );

    // Editing fills the window, as in the studio: no sidebar or status bar.
    if (leaf === '/my/$id') return <Outlet />;

    const signOut = async () => {
        await post('/store/auth/logout', {});
        client.removeQueries({ queryKey: ordersKey });
        await client.resetQueries({ queryKey: meKey });
    };
    const due = (orders.data ?? []).filter((o) => o.balance > 0).length;
    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <PortalSidebar
                me={me.data}
                due={due}
                onSignOut={() => {
                    void signOut();
                }}
            />
            <SidebarInset className="isolate flex h-svh min-h-0 min-w-0 flex-col bg-background">
                <main className="admin-page flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-none p-4">
                    <Outlet />
                </main>
                <StatusBar crumbs={<PortalCrumbs leaf={leaf} />} note="Only you can see this" />
            </SidebarInset>
        </SidebarProvider>
    );
}

const pageNames: Record<string, string> = {
    '/my/payments': 'Payments',
    '/my/$id_/guests': 'Guests & replies',
    '/my/$id_/cards': 'Cards',
    '/my/$id_/board': 'Mood boards',
    '/my/$id_/made': 'We make it for you',
};

function PortalCrumbs({ leaf }: { leaf: string }) {
    const page = pageNames[leaf];
    return (
        <Breadcrumb>
            <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                    {page ? (
                        <BreadcrumbLink asChild>
                            <Link to="/my">My invitations</Link>
                        </BreadcrumbLink>
                    ) : (
                        <BreadcrumbPage>My invitations</BreadcrumbPage>
                    )}
                </BreadcrumbItem>
                {page && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="truncate">{page}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

interface SignInPageProps {
    onDone: () => void;
}

function SignInPage({ onDone }: SignInPageProps) {
    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-4">
            <Link to="/" className="flex items-center gap-3">
                <BrandMark />
                <span className="text-lg font-semibold">Toran</span>
            </Link>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>
                        <h1>Sign in to your invitations</h1>
                    </CardTitle>
                    <CardDescription>
                        Use the email you bought with. We’ll send you a code.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignIn onDone={onDone} />
                </CardContent>
            </Card>
        </main>
    );
}
