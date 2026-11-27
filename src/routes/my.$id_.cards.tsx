import { REFUND_DAYS } from '@shared/policies';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Images, PenLine, Users } from 'lucide-react';
import { useState } from 'react';

import { PanelCard } from '@/admin/kit/card';
import { EmptyState, PageHeader, PageSkeleton, Panel } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { CardsGrid } from '@/shop/cards/CardsGrid';
import { type CardsChoice, useCards } from '@/shop/cards/model';
import { PostsGrid } from '@/shop/cards/PostsGrid';

export const Route = createFileRoute('/my/$id_/cards')({
    head: () => ({ meta: [{ title: 'Your cards · Toran' }] }),
    component: MyCards,
});

function MyCards() {
    const { id } = Route.useParams();
    const base = `/store/me/invitations/${id}`;
    const [choice, setChoice] = useState<CardsChoice>({ who: null });
    const { data: set, isPending, error } = useCards(base, choice);
    if (isPending) return <PageSkeleton />;
    if (!set)
        return (
            <PanelCard fill title="Cards">
                <EmptyState
                    icon={Images}
                    title="Couldn’t open your cards"
                    description={error.message}
                />
            </PanelCard>
        );
    const couple = [set.names.one, set.names.two].filter(Boolean).join(' & ');
    return (
        <>
            <PageHeader
                title="Cards"
                description={couple}
                actions={
                    <>
                        <Button variant="outline" asChild>
                            <Link to="/my/$id" params={{ id }}>
                                <PenLine /> Edit
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/my/$id/guests" params={{ id }}>
                                <Users /> Guests
                            </Link>
                        </Button>
                    </>
                }
            />
            {!set.ready && (
                <p className="mb-4 rounded-xl bg-warning/10 px-4 py-3 text-sm ring-1 ring-warning/30">
                    Your cards are ready to download once your invitation is paid for.
                </p>
            )}
            {set.refundable && (
                <p className="mb-4 rounded-xl bg-warning/10 px-4 py-3 text-sm ring-1 ring-warning/30">
                    Look at every card and post here first: downloading one, the PDF or the story
                    video ends your {REFUND_DAYS}-day refund.
                </p>
            )}
            <Panel
                title="Matching cards"
                description="Everything that goes with your invitation, in your names. Change a date once and every card changes with it."
            >
                <CardsGrid base={base} set={set} choice={choice} onChoice={setChoice} />
            </Panel>
            <PostsGrid base={base} choice={choice} />
        </>
    );
}
