import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { ApiError } from '@/lib/api';
import { SignIn } from '@/shop/SignIn';

import { CardsGrid } from './CardsGrid';
import { type CardsChoice, useCards } from './model';

interface CardsPageProps {
    invitationId: string;
}

export function CardsPage({ invitationId }: CardsPageProps) {
    const base = `/store/me/invitations/${invitationId}`;
    const [choice, setChoice] = useState<CardsChoice>({ who: null });
    const cards = useCards(base, choice);
    const client = useQueryClient();

    if (cards.isPending)
        return <Loader2 className="mx-auto mt-24 size-6 animate-spin text-muted-foreground" />;
    if (cards.error instanceof ApiError && cards.error.status === 401)
        return (
            <section className="mx-auto max-w-sm px-4 py-20">
                <h1 className="mb-6 font-display text-4xl text-ink">Sign in to see your cards</h1>
                <SignIn
                    onDone={() => {
                        void client.invalidateQueries({ queryKey: ['cards', base] });
                    }}
                />
            </section>
        );
    if (!cards.data)
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <p className="text-muted-foreground">{cards.error.message}</p>
                <Link to="/my" className="mt-4 inline-block text-burgundy underline">
                    My invitations
                </Link>
            </div>
        );
    return (
        <section className="mx-auto max-w-5xl px-4 pt-6 pb-16">
            <Link
                to="/my/$id"
                params={{ id: invitationId }}
                className="inline-flex items-center gap-1 text-sm text-ink/70 hover:text-ink"
            >
                <ArrowLeft className="size-4" /> Back to your invitation
            </Link>
            <div className="mt-4 mb-8">
                <h1 className="font-display text-4xl text-ink sm:text-5xl">
                    Your matching <em className="text-gold-deep">cards</em>
                </h1>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    Everything that goes with your invitation, in your names. Change a date once and
                    every card changes with it.
                </p>
                {!cards.data.ready && (
                    <p className="mt-4 rounded-2xl bg-gold/15 px-4 py-3 text-sm text-ink">
                        Your cards are ready to download once your invitation is paid for.
                    </p>
                )}
            </div>
            <CardsGrid
                base={base}
                set={cards.data}
                choice={choice}
                onChoice={setChoice}
                buttonClass="rounded-full"
            />
        </section>
    );
}
