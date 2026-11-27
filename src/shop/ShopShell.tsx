import { brand } from '@shared/brand';
import { featuredCurrencies } from '@shared/fx';
import { policyPages } from '@shared/policies';
import { SHOW_SHOP_PRICES } from '@shared/pricing';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { type ReactNode, useEffect } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { FloatingHeader } from '@/shop/landing';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 15_000,
            retry: false,
            // Guests switch to their mail app for the sign-in code; coming back must not reload
            // (and reset) the page they were on.
            refetchOnWindowFocus: false,
        },
    },
});

interface ShopShellProps {
    children: ReactNode;
    // The try and edit screens bring their own top bar and fill the window.
    bare?: boolean;
    // Landing and collections: the night-and-gold editorial look.
    tone?: 'light' | 'dark';
    // The currency prices are shown in; the footer's switcher changes it.
    currency?: string;
}

export function ShopShell({ children, bare = false, tone = 'light', currency }: ShopShellProps) {
    const dark = tone === 'dark';
    useEffect(() => {
        document.documentElement.classList.add('shop-ui');
        return () => {
            document.documentElement.classList.remove('shop-ui');
        };
    }, []);
    return (
        <QueryClientProvider client={queryClient}>
            {/* The shared editor panels (ceremonies, photos) use tooltips, as in the studio. */}
            <TooltipProvider>
                <div
                    className={cn(
                        'shop min-h-dvh',
                        bare && 'h-dvh overflow-hidden',
                        dark && 'shop-dark overflow-x-clip bg-night text-ivory',
                    )}
                >
                    {!bare && (dark ? <FloatingHeader /> : <ShopHeader />)}
                    {children}
                    {!bare && <ShopFooter dark={dark} currency={currency} />}
                </div>
                <Toaster position="top-center" />
            </TooltipProvider>
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

interface FooterProps {
    dark: boolean;
    currency?: string;
}

// Remembered for a year; the server prices everything in it from the next page load.
function pickCurrency(code: string) {
    document.cookie = `toran_currency=${code}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
}

interface SwitcherProps {
    currency: string;
    dark: boolean;
}

function CurrencySwitcher({ currency, dark }: SwitcherProps) {
    const options = [...new Set([currency, ...featuredCurrencies])];
    return (
        <label className="flex items-center gap-2">
            <span>Currency</span>
            <select
                value={currency}
                onChange={(e) => {
                    pickCurrency(e.target.value);
                }}
                className={cn(
                    'rounded-full border px-3 py-1 text-sm',
                    dark
                        ? 'border-white/15 bg-white/5 text-ivory'
                        : 'border-black/10 bg-white text-ink',
                )}
            >
                {options.map((c) => (
                    <option key={c} value={c} className="text-ink">
                        {c}
                    </option>
                ))}
            </select>
        </label>
    );
}

function ShopFooter({ dark, currency }: FooterProps) {
    return (
        <footer className={cn('mt-24 border-t', dark ? 'border-white/10' : 'border-black/5')}>
            <div
                className={cn(
                    'mx-auto flex max-w-6xl flex-col gap-4 px-5 pt-10 text-sm sm:flex-row sm:justify-between',
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
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    {/* Currency only matters while prices are shown. */}
                    {SHOW_SHOP_PRICES && currency && (
                        <CurrencySwitcher currency={currency} dark={dark} />
                    )}
                    <Link to="/invitations" className="hover:underline">
                        Designs by occasion
                    </Link>
                    <Link to="/wording" className="hover:underline">
                        Wording
                    </Link>
                    <Link to="/made-for-you" className="hover:underline">
                        We make it for you
                    </Link>
                    <p>Toran by Rigi</p>
                </div>
            </div>
            <div
                className={cn(
                    'mx-auto flex max-w-6xl flex-col gap-3 px-5 pt-5 pb-10 text-xs sm:flex-row sm:justify-between',
                    dark ? 'text-ivory/60' : 'text-smoke',
                )}
            >
                <p>
                    {brand.legalName} · {brand.address}
                </p>
                <nav aria-label="Policies" className="flex flex-wrap gap-x-5 gap-y-2">
                    {policyPages.map((p) => (
                        <Link key={p.path} to={p.path} className="hover:underline">
                            {p.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
