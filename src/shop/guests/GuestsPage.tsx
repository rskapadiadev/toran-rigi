import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError } from '@/lib/api';
import { SignIn } from '@/shop/SignIn';

import { guestListKey, useGuestList } from './actions';
import { Audience } from './Audience';
import { Families } from './Families';
import { Links } from './Links';
import { dayLabel, firstName, type GuestList } from './model';
import { Replies } from './Replies';

interface GuestsPageProps {
    invitationId: string;
}

export function GuestsPage({ invitationId }: GuestsPageProps) {
    const base = `/store/me/invitations/${invitationId}/guest-list`;
    const list = useGuestList(base);
    const client = useQueryClient();

    if (list.isPending)
        return <Loader2 className="mx-auto mt-24 size-6 animate-spin text-muted-foreground" />;
    if (list.error instanceof ApiError && list.error.status === 401)
        return (
            <section className="mx-auto max-w-sm px-4 py-20">
                <h1 className="mb-6 font-display text-4xl text-ink">Sign in to see your guests</h1>
                <SignIn
                    onDone={() => {
                        void client.invalidateQueries({ queryKey: guestListKey(base) });
                    }}
                />
            </section>
        );
    if (!list.data)
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <p className="text-muted-foreground">{list.error.message}</p>
                <Link to="/my" className="mt-4 inline-block text-burgundy underline">
                    My invitations
                </Link>
            </div>
        );
    return (
        <Guests invitationId={invitationId} base={base} list={list.data} />
    );
}

interface GuestsProps {
    invitationId: string;
    base: string;
    list: GuestList;
}

function Guests({ invitationId, base, list }: GuestsProps) {
    const origin = window.location.origin;
    // Only what a tab edits resets it: adding a family must not lose the tab, search or an open form.
    const audienceKey = JSON.stringify(list.events.map((e) => [e.id, e.audience]));
    const couple = [list.names.one, list.names.two].filter(Boolean).map((n) => firstName(n ?? ''));
    return (
        <section className="mx-auto max-w-3xl px-4 pt-6 pb-16">
            <Link
                to="/my/$id"
                params={{ id: invitationId }}
                className="inline-flex items-center gap-1 text-sm text-ink/70 hover:text-ink"
            >
                <ArrowLeft className="size-4" /> Back to your invitation
            </Link>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-display text-4xl text-ink sm:text-5xl">
                        Your <em className="text-gold-deep">guests</em>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {couple.join(' & ')} · {list.guests.length}{' '}
                        {list.guests.length === 1 ? 'family' : 'families'}
                    </p>
                </div>
                <Button variant="outline" className="rounded-full" asChild>
                    <a href={`/api${base}/headcount.csv`}>
                        <Download /> List for the caterer
                    </a>
                </Button>
            </div>
            {!list.live && (
                <p className="mt-4 rounded-2xl bg-gold/15 px-4 py-3 text-sm text-ink">
                    You can add families now. Their links start working once your invitation is
                    published.
                </p>
            )}

            {list.events.length > 0 && (
                <ul
                    className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
                    aria-label="Who’s coming"
                >
                    {list.events.map((e) => {
                        const n = list.counts.find((c) => c.eventId === e.id);
                        return (
                            <li key={e.id} className="rounded-2xl border bg-card p-3">
                                <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {dayLabel(e.startsAt)}
                                </p>
                                <p className="mt-2 font-display text-3xl text-ink">
                                    {n?.coming ?? 0}
                                    <span className="ms-1 font-sans text-xs text-muted-foreground">
                                        coming
                                    </span>
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {n?.waiting
                                        ? `${String(n.waiting)} ${n.waiting === 1 ? 'family' : 'families'} to reply`
                                        : n?.replied
                                          ? 'Every family has replied'
                                          : 'No families yet'}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            )}

            <Tabs defaultValue="families" className="mt-8">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="families">Families</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                    <TabsTrigger value="audience">Who sees what</TabsTrigger>
                    <TabsTrigger value="replies">Replies</TabsTrigger>
                </TabsList>
                <TabsContent value="families" className="mt-5">
                    <Families list={list} base={base} origin={origin} />
                </TabsContent>
                <TabsContent value="links" className="mt-5">
                    <Links list={list} base={base} origin={origin} />
                </TabsContent>
                <TabsContent value="audience" className="mt-5">
                    <Audience key={audienceKey} list={list} base={base} />
                </TabsContent>
                <TabsContent value="replies" className="mt-5">
                    <Replies key={JSON.stringify(list.replies)} list={list} base={base} />
                </TabsContent>
            </Tabs>
        </section>
    );
}
