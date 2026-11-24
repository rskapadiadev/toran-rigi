import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ExternalLink, Images, Loader2, PenLine, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { api, ApiError, post } from '@/lib/api';
import { ShopShell } from '@/shop/ShopShell';
import { SignIn } from '@/shop/SignIn';
import type { Me } from '@/shop/types';

export const Route = createFileRoute('/my/')({
    ssr: false,
    head: () => ({
        meta: [
            { title: 'My invitations · Toran' },
            {
                name: 'robots',
                content: 'noindex',
            },
        ],
    }),
    component: () => (
        <ShopShell>
            <MyInvitations />
        </ShopShell>
    ),
});

const statusLabel: Record<string, string> = {
    draft: 'Not published yet',
    preview: 'Not published yet',
    published: 'Live',
    archived: 'Concluded',
};

function MyInvitations() {
    const client = useQueryClient();
    const me = useQuery({
        queryKey: ['me'],
        queryFn: () => api<Me>('/store/me'),
    });

    if (me.isPending)
        return <Loader2 className="mx-auto mt-24 size-6 animate-spin text-muted-foreground" />;

    if (me.error instanceof ApiError && me.error.status === 401)
        return (
            <section className="mx-auto max-w-sm px-4 py-20">
                <h1 className="font-display text-4xl text-ink">My invitations</h1>
                <p className="mt-2 mb-6 text-sm text-muted-foreground">
                    Sign in with the email you used when you bought your invitation.
                </p>
                <SignIn
                    onDone={() => {
                        void client.invalidateQueries({ queryKey: ['me'] });
                    }}
                />
            </section>
        );

    if (!me.data) return <p className="mt-24 text-center text-destructive">Could not load.</p>;
    const { customer, invitations } = me.data;

    return (
        <section className="mx-auto max-w-3xl px-4 py-14">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-4xl text-ink">My invitations</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{customer.email}</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        void post('/store/auth/logout', {}).then(() =>
                            client.invalidateQueries({ queryKey: ['me'] }),
                        );
                    }}
                >
                    Sign out
                </Button>
            </div>
            {invitations.length === 0 ? (
                <div className="mt-10 rounded-3xl border border-dashed p-10 text-center">
                    <p className="text-muted-foreground">You haven’t bought an invitation yet.</p>
                    <Button asChild className="mt-4 rounded-full">
                        <Link to="/collections">Browse the collection</Link>
                    </Button>
                </div>
            ) : (
                <ul className="mt-8 space-y-3">
                    {invitations.map((inv) => {
                        const swatch = `linear-gradient(135deg, ${inv.design.palette.primary}, ${inv.design.palette.gold})`;
                        return (
                            <li
                                key={inv.id}
                                className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4"
                            >
                                <div
                                    className="size-14 shrink-0 rounded-xl ring-1 ring-black/10"
                                    style={{ background: swatch }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-display text-2xl text-ink">
                                        {inv.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {statusLabel[inv.status] ?? inv.status} · Order{' '}
                                        {inv.orderNumber}
                                        {inv.balance > 0 && ' · Payment pending'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to="/my/$id/cards" params={{ id: inv.id }}>
                                            <Images /> Cards
                                        </Link>
                                    </Button>
                                    {inv.status === 'published' && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={`/${inv.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <ExternalLink /> View
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to="/my/$id/guests" params={{ id: inv.id }}>
                                            <Users /> Guests
                                        </Link>
                                    </Button>
                                    <Button size="sm" asChild>
                                        <Link to="/my/$id" params={{ id: inv.id }}>
                                            <PenLine /> Edit
                                        </Link>
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
