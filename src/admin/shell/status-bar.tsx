import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { Lock, Moon, RefreshCw, Sun } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { AdminBreadcrumbs } from './breadcrumbs';
import { type AdminTheme, readAdminTheme, saveAdminTheme } from './theme';

const stamp = (d: Date) =>
    d.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });

interface StatusBarProps {
    // The customers' portal brings its own trail and note.
    crumbs?: ReactNode;
    note?: string;
}

// Thin bar under the page: sidebar toggle, where you are, data freshness, and the theme switch.
export function StatusBar({
    crumbs = <AdminBreadcrumbs />,
    note = 'Authorised users only',
}: StatusBarProps) {
    const client = useQueryClient();
    const fetching = useIsFetching();
    const [refreshed, setRefreshed] = useState(() => new Date());
    const [theme, setTheme] = useState<AdminTheme>(readAdminTheme);

    // Stamp the time whenever any query succeeds: that is how fresh the data on screen is.
    useEffect(
        () =>
            client.getQueryCache().subscribe((event) => {
                if (event.type === 'updated' && event.action.type === 'success')
                    setRefreshed(new Date());
            }),
        [client],
    );

    return (
        <footer className="flex h-9 shrink-0 items-center gap-2 border-t border-sidebar-border bg-sidebar px-3 text-xs text-muted-foreground">
            <SidebarTrigger className="size-7 text-muted-foreground" />
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
            <div className="min-w-0 flex-1 [&_ol]:gap-1 [&_ol]:text-xs">{crumbs}</div>
            <span className="hidden whitespace-nowrap md:inline">
                Last refreshed: {stamp(refreshed)}
            </span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        aria-label="Refresh data"
                        onClick={() => void client.invalidateQueries()}
                        className="rounded p-1 hover:bg-muted hover:text-foreground"
                    >
                        <RefreshCw className={cn('size-3.5', fetching > 0 && 'animate-spin')} />
                    </button>
                </TooltipTrigger>
                <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
            <span className="hidden items-center gap-1.5 whitespace-nowrap sm:flex">
                <Lock className="size-3.5" /> {note}
            </span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        aria-label={
                            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
                        }
                        onClick={() => {
                            const next = theme === 'dark' ? 'light' : 'dark';
                            setTheme(next);
                            saveAdminTheme(next);
                        }}
                        className="rounded p-1 hover:bg-muted hover:text-foreground"
                    >
                        {theme === 'dark' ? (
                            <Sun className="size-3.5" />
                        ) : (
                            <Moon className="size-3.5" />
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</TooltipContent>
            </Tooltip>
        </footer>
    );
}
