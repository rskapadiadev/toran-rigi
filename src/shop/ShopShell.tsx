import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { type ReactNode, useEffect } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { FloatingHeader } from '@/shop/landing';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 15_000,
            retry: false,
        },
    },
});

interface ShopShellProps {
    children: ReactNode;
    // The try and edit screens bring their own top bar and fill the window.
    bare?: boolean;
    // Landing and collections: the night-and-gold editorial look.
    tone?: 'light' | 'dark';
}

export function ShopShell({ children, bare = false, tone = 'light' }: ShopShellProps) {
    const dark = tone === 'dark';
    useEffect(() => {
        document.documentElement.classList.add('shop-ui');
        return () => {
            document.documentElement.classList.remove('shop-ui');
        };
    }, []);
    return (
        <QueryClientProvider client={queryClient}>
            <div
                className={cn(
                    'shop min-h-dvh',
                    bare && 'h-dvh overflow-hidden',
                    dark && 'shop-dark bg-night text-ivory',
                )}
            >
                {!bare && (dark ? <FloatingHeader /> : <ShopHeader />)}
                {children}
                {!bare && <ShopFooter dark={dark} />}
            </div>
            <Toaster position="top-center" />
        </QueryClientProvider>
    );
}

export function Wordmark({ className }: { className?: string }) {
    return (
        <Link to="/" className={cn('font-display text-2xl tracking-wide text-burgundy', className)}>
            Toran
        </Link>
    );
}

function ShopHeader() {
    const item = 'rounded-full px-3 py-1.5 text-sm text-ink/80 transition hover:bg-black/5';
    return (
        <header className="sticky top-0 z-30 border-b border-black/5 bg-ivory/85 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <Wordmark />
                <nav className="flex items-center gap-1">
                    <Link
                        to="/collections"
                        className={item}
                        activeProps={{ className: 'bg-black/5' }}
                    >
                        Collections
                    </Link>
                    <Link to="/my" className={item} activeProps={{ className: 'bg-black/5' }}>
                        My invitations
                    </Link>
                </nav>
            </div>
        </header>
    );
}

function ShopFooter({ dark }: { dark: boolean }) {
    return (
        <footer className={cn('mt-24 border-t', dark ? 'border-white/10' : 'border-black/5')}>
            <div
                className={cn(
                    'mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm sm:flex-row sm:justify-between',
                    dark ? 'text-ivory/45' : 'text-smoke',
                )}
            >
                <p>
                    <span
                        className={cn(
                            'font-display text-lg',
                            dark ? 'text-gold-bright' : 'text-burgundy',
                        )}
                    >
                        Toran
                    </span>{' '}
                    · Every celebration begins at the Toran.
                </p>
                <p>Toran by Rigi</p>
            </div>
        </footer>
    );
}
