// Everything on a guest list: who is coming to what, the families, their links, who sees which
// function, replies and wishes. The studio and the couple use the same board.
import { latestReplies } from '@shared/guests';
import { Link2, MailCheck, UserCheck, UserX } from 'lucide-react';
import type { ReactNode } from 'react';

import { Panel, StatCard } from '@/admin/kit/page';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GuestList } from '@/shop/guests/model';

import { AudiencePanel } from './AudiencePanel';
import { FamiliesTable } from './FamiliesTable';
import { LinksPanel } from './LinksPanel';
import { ReplyList, ReplySettingsPanel } from './RepliesPanel';
import { type Wish, WishesPanel } from './WishesPanel';

interface GuestsBoardProps {
    invitationId: string;
    // The guest list's API, and the invitation's.
    base: string;
    root: string;
    list: GuestList;
    wishes: Wish[];
    // The couple's side: on phones, families as a list with sending one tap away.
    phoneFamilies?: ReactNode;
    own?: boolean;
}

export function GuestsBoard({
    invitationId,
    base,
    root,
    list,
    wishes,
    phoneFamilies,
    own = false,
}: GuestsBoardProps) {
    const origin = window.location.origin;
    const latest = latestReplies(list.rsvps);
    const attending = latest.filter((r) => r.attending);
    const replied = list.guests.filter((g) => g.rsvped > 0).length;
    const pending = wishes.filter((w) => w.status === 'pending').length;
    const most = Math.max(1, ...list.counts.map((c) => c.coming));
    // Only what a tab edits resets it: a reply arriving must not lose unsaved changes elsewhere.
    const audienceKey = JSON.stringify(list.events.map((e) => [e.id, e.audience]));

    return (
        <>
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
                    {phoneFamilies && <div className="md:hidden">{phoneFamilies}</div>}
                    <div className={phoneFamilies ? 'max-md:hidden' : undefined}>
                        <FamiliesTable list={list} base={base} origin={origin} />
                    </div>
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
                            own={own}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="wishes">
                    <WishesPanel invitationId={invitationId} root={root} wishes={wishes} />
                </TabsContent>
            </Tabs>
        </>
    );
}
