import { createFileRoute, Link } from '@tanstack/react-router';
import { Images, PenLine, Users } from 'lucide-react';
import { useState } from 'react';

import { PanelCard } from '@/admin/kit/card';
import { EmptyState, PageHeader, PageSkeleton, Panel } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { CardsGrid } from '@/shop/cards/CardsGrid';
import { type CardsChoice, useCards } from '@/shop/cards/model';
import { PostsGrid } from '@/shop/cards/PostsGrid';

export const Route = createFileRoute('/admin/invitations/$id/cards')({ component: CardsPage });

function CardsPage() {
    const { id } = Route.useParams();
    const base = `/admin/invitations/${id}`;
    const [choice, setChoice] = useState<CardsChoice>({ who: null });
    const { data: set, isPending, error } = useCards(base, choice);
    if (isPending) return <PageSkeleton />;
    if (!set)
        return (
            <PanelCard fill title="Cards">
                <EmptyState
                    icon={Images}
                    title="Couldn’t open these cards"
                    description={error.message}
                />
            </PanelCard>
        );
    const couple = [set.names.one, set.names.two].filter(Boolean).join(' & ');
    return (
        <>
            <PageHeader
                eyebrow={
                    <span className="font-mono" dir="ltr">
                        /{set.data.invitation.slug}
                    </span>
                }
                title={`Cards · ${couple}`}
                actions={
                    <>
                        <Button variant="outline" asChild>
                            <Link to="/admin/invitations/$id" params={{ id }}>
                                <PenLine /> Editor
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/admin/invitations/$id/guests" params={{ id }}>
                                <Users /> Guests
                            </Link>
                        </Button>
                    </>
                }
            />
            <Panel
                title="Matching cards"
                description="Drawn from the invitation. The couple have the same set on their Cards page."
            >
                <CardsGrid base={base} set={set} choice={choice} onChoice={setChoice} />
            </Panel>
            <PostsGrid base={base} choice={choice} />
        </>
    );
}
