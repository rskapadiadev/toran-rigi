import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Download, Images, PenLine, Users } from 'lucide-react';

import { GuestsBoard } from '@/admin/guests/GuestsBoard';
import type { Wish } from '@/admin/guests/WishesPanel';
import { PanelCard } from '@/admin/kit/card';
import { EmptyState, PageHeader, PageSkeleton } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useGuestList } from '@/shop/guests/actions';
import { Families } from '@/shop/guests/Families';

export const Route = createFileRoute('/my/$id_/guests')({
    head: () => ({ meta: [{ title: 'Your guests · Toran' }] }),
    component: MyGuests,
});

function MyGuests() {
    const { id } = Route.useParams();
    const root = `/store/me/invitations/${id}`;
    const base = `${root}/guest-list`;
    const { data: list, isPending, error } = useGuestList(base);
    const { data: wishes = [] } = useQuery({
        queryKey: ['wishes', id, root],
        queryFn: () => api<Wish[]>(`${root}/wishes`),
    });
    if (isPending) return <PageSkeleton />;
    if (!list)
        return (
            <PanelCard fill title="Guests & replies">
                <EmptyState
                    icon={Users}
                    title="Couldn’t open your guest list"
                    description={error.message}
                />
            </PanelCard>
        );
    const couple = [list.names.one, list.names.two].filter(Boolean).join(' & ');
    return (
        <>
            <PageHeader
                title="Guests & replies"
                description={couple}
                actions={
                    <>
                        <Button variant="outline" asChild>
                            <Link to="/my/$id" params={{ id }}>
                                <PenLine /> Edit
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/my/$id/cards" params={{ id }}>
                                <Images /> Cards
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`/api${base}/headcount.csv`}>
                                <Download /> List for the caterer
                            </a>
                        </Button>
                    </>
                }
            />
            {!list.live && (
                <p className="mb-4 rounded-xl bg-warning/10 px-4 py-3 text-sm ring-1 ring-warning/30">
                    You can add families now. Their links start working once your invitation is
                    published.
                </p>
            )}
            <GuestsBoard
                invitationId={id}
                base={base}
                root={root}
                list={list}
                wishes={wishes}
                phoneFamilies={<Families list={list} base={base} origin={window.location.origin} />}
                own
            />
        </>
    );
}
