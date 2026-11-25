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

export const Route = createFileRoute('/admin/invitations/$id/guests')({ component: GuestsPage });

function GuestsPage() {
    const { id } = Route.useParams();
    const base = `/admin/invitations/${id}/guest-list`;
    const { data: list, isPending, error } = useGuestList(base);
    const { data: wishes = [] } = useQuery({
        queryKey: ['wishes', id],
        queryFn: () => api<Wish[]>(`/admin/invitations/${id}/wishes`),
    });

    if (isPending) return <PageSkeleton />;
    if (!list)
        return (
            <PanelCard fill title="Guests & RSVPs">
                <EmptyState
                    icon={Users}
                    title="Couldn’t open this guest list"
                    description={error.message}
                />
            </PanelCard>
        );

    const couple = [list.names.one, list.names.two].filter(Boolean).join(' & ');
    return (
        <>
            <PageHeader
                eyebrow={
                    <span className="font-mono" dir="ltr">
                        /{list.slug}
                    </span>
                }
                title={`Guests & RSVPs · ${couple}`}
                actions={
                    <>
                        <Button variant="outline" asChild>
                            <Link to="/admin/invitations/$id" params={{ id }}>
                                <PenLine /> Editor
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/admin/invitations/$id/cards" params={{ id }}>
                                <Images /> Cards
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`/api/admin/invitations/${id}/rsvps.csv`}>
                                <Download /> Every reply
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`/api${base}/headcount.csv`}>
                                <Download /> Headcount
                            </a>
                        </Button>
                    </>
                }
            />
            <GuestsBoard
                invitationId={id}
                base={base}
                root={`/admin/invitations/${id}`}
                list={list}
                wishes={wishes}
            />
        </>
    );
}
