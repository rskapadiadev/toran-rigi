import { createFileRoute, Link } from '@tanstack/react-router';
import { Images, PenLine, Wand2 } from 'lucide-react';

import { PanelCard } from '@/admin/kit/card';
import { EmptyState, PageHeader, PageSkeleton } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { useMade } from '@/shop/made/data';
import { MadeBody } from '@/shop/made/MadePage';

export const Route = createFileRoute('/my/$id_/made')({
    head: () => ({ meta: [{ title: 'We make it for you · Toran' }] }),
    component: MyMade,
});

function MyMade() {
    const { id } = Route.useParams();
    const { data: view, isPending, error } = useMade(id);
    if (isPending) return <PageSkeleton />;
    if (!view)
        return (
            <PanelCard fill title="We make it for you">
                <EmptyState icon={Wand2} title="Couldn’t open this" description={error.message} />
            </PanelCard>
        );
    return (
        <>
            <PageHeader
                title="We make it for you"
                description={
                    view.made
                        ? 'Our studio makes your invitation from what you send.'
                        : 'Or make it yourself in Edit.'
                }
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
            <MadeBody id={id} view={view} />
        </>
    );
}
