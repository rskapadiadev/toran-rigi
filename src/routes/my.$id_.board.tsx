import { createFileRoute, Link } from '@tanstack/react-router';
import { Images, PenLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BoardPage } from '@/shop/board/BoardPage';

export const Route = createFileRoute('/my/$id_/board')({
    head: () => ({ meta: [{ title: 'Mood boards · Toran' }] }),
    component: MyBoards,
});

function MyBoards() {
    const { id } = Route.useParams();
    return (
        <BoardPage
            base={`/store/me/invitations/${id}`}
            invitationId={id}
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
                </>
            }
        />
    );
}
