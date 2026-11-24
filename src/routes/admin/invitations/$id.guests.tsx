import { latestReplies } from '@shared/guests';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Download, Images, Link2, MailCheck, PenLine, UserCheck, Users, UserX } from 'lucide-react';

import { AudiencePanel } from '@/admin/guests/AudiencePanel';
import { FamiliesTable } from '@/admin/guests/FamiliesTable';
import { LinksPanel } from '@/admin/guests/LinksPanel';
import { ReplyList, ReplySettingsPanel } from '@/admin/guests/RepliesPanel';
import { type Wish, WishesPanel } from '@/admin/guests/WishesPanel';
import { PanelCard } from '@/admin/kit/card';
import { EmptyState, PageHeader, PageSkeleton, Panel, StatCard } from '@/admin/kit/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

    const origin = window.location.origin;
    const couple = [list.names.one, list.names.two].filter(Boolean).join(' & ');
    const latest = latestReplies(list.rsvps);
    const attending = latest.filter((r) => r.attending);
    const replied = list.guests.filter((g) => g.rsvped > 0).length;
    const pending = wishes.filter((w) => w.status === 'pending').length;
    const most = Math.max(1, ...list.counts.map((c) => c.coming));
    // Only what a tab edits resets it: a reply arriving must not lose unsaved changes elsewhere.
    const audienceKey = JSON.stringify(list.events.map((e) => [e.id, e.audience]));

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
            <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <StatCard
                    label="Replies"
                    value={latest.length}
                    icon={MailCheck}
                    accent="primary"
                    hint={`${String(replied)} of ${String(list.guests.length)} families`}
                />
                <StatCard
                    label="Attending (people)"
                    value={attending.reduce((sum, r) => sum + r.guestCount, 0)}
                    icon={UserCheck}
                    accent="success"
                />
                <StatCard
                    label="Declined"
                    value={latest.length - attending.length}
                    icon={UserX}
                    accent="danger"
                />
                <StatCard label="Families" value={list.guests.length} icon={Link2} accent="gold" />
            </div>
            {list.events.length > 0 && (
                <Panel title="Headcount per function" className="mb-6">
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {list.events.map((e) => {
                            const n = list.counts.find((c) => c.eventId === e.id);
                            const coming = n?.coming ?? 0;
                            const waiting = n?.waiting ?? 0;
                            const invited = waiting + (n?.replied ?? 0);
                            return (
                                <div
                                    key={e.id}
                                    className="space-y-2 rounded-lg border bg-muted/30 p-3"
                                >
                                    <p className="truncate text-sm text-muted-foreground">
                                        {e.title}
                                    </p>
                                    <p className="text-2xl font-semibold tabular-nums">{coming}</p>
                                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary/70"
                                            style={{ width: `${String((coming / most) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {invited === 0
                                            ? 'No families yet'
                                            : waiting === 0
                                              ? 'Every family has replied'
                                              : `${String(waiting)} ${waiting === 1 ? 'family' : 'families'} to reply`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </Panel>
            )}
            <Tabs defaultValue="families" className="gap-4">
                <div className="overflow-x-auto">
                    <TabsList>
                        <TabsTrigger value="families">Families</TabsTrigger>
                        <TabsTrigger value="links">Links</TabsTrigger>
                        <TabsTrigger value="audience">Who sees what</TabsTrigger>
                        <TabsTrigger value="replies">Replies</TabsTrigger>
                        <TabsTrigger value="wishes">
                            Wishes
                            {pending > 0 && (
                                <Badge
                                    variant="warning"
                                    className="h-5 rounded-md px-1.5 tabular-nums"
                                >
                                    {pending}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="families">
                    <FamiliesTable list={list} base={base} origin={origin} />
                </TabsContent>
                <TabsContent value="links">
                    <LinksPanel list={list} base={base} origin={origin} />
                </TabsContent>
                <TabsContent value="audience">
                    <AudiencePanel key={audienceKey} list={list} base={base} />
                </TabsContent>
                <TabsContent value="replies">
                    <div className="grid items-start gap-6 xl:grid-cols-2">
                        <ReplyList list={list} />
                        <ReplySettingsPanel
                            key={JSON.stringify(list.replies)}
                            list={list}
                            base={base}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="wishes">
                    <WishesPanel invitationId={id} wishes={wishes} />
                </TabsContent>
            </Tabs>
        </>
    );
}
