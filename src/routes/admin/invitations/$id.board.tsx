import { createFileRoute, Link } from '@tanstack/react-router';
import { Images, PenLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BoardPage } from '@/shop/board/BoardPage';

export const Route = createFileRoute('/admin/invitations/$id/board')({ component: StudioBoards });

// The couple's own boards, so the studio can help fill them or send them on to a decorator.
function StudioBoards() {
    const { id } = Route.useParams();
    return (
        <BoardPage
            base={`/admin/invitations/${id}`}
            invitationId={id}
            studio
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
                </>
            }
        />
    );
}
