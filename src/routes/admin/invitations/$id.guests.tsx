import { pickText } from '@shared/cultures';
import { titleOf } from '@shared/people';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
    Check,
    Download,
    EyeOff,
    Heart,
    Link2,
    MailCheck,
    MessageCircle,
    PenLine,
    Trash2,
    UserCheck,
    UserPlus,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { EditableInvitation } from '@/admin/composer/draft';
import { PageHeader, PageSkeleton, Panel, StatCard, ToneBadge } from '@/admin/kit/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { api, ApiError, post } from '@/lib/api';

interface Guest {
    id: string;
    displayName: string;
    token: string;
    phone: string | null;
    maxGuests: number | null;
    rsvped: number;
}

interface Rsvp {
    id: string;
    name: string;
    phone: string | null;
    attending: boolean;
    guestCount: number;
    eventIds: string[];
    dietary: string | null;
    message: string | null;
    createdAt: string;
    guestName: string | null;
}

interface Wish {
    id: string;
    name: string;
    message: string;
    status: 'pending' | 'approved' | 'hidden';
    createdAt: string;
}

interface WishUpdate {
    wishId: string;
    status: Wish['status'];
}

export const Route = createFileRoute('/admin/invitations/$id/guests')({ component: GuestsPage });

const failure = (error: unknown) =>
    error instanceof ApiError ? error.message : 'Something went wrong';
const wishTone = {
    approved: 'success',
    hidden: 'muted',
    pending: 'warning',
} as const;

function GuestsPage() {
    const { id } = Route.useParams();
    const client = useQueryClient();
    const [paste, setPaste] = useState('');
    const { data: inv } = useQuery({
        queryKey: ['invitation', id],
        queryFn: () => api<EditableInvitation>(`/admin/invitations/${id}`),
    });
    const { data: guests = [] } = useQuery({
        queryKey: ['guests', id],
        queryFn: () => api<Guest[]>(`/admin/invitations/${id}/guests`),
    });
    const { data: rsvps = [] } = useQuery({
        queryKey: ['rsvps', id],
        queryFn: () => api<Rsvp[]>(`/admin/invitations/${id}/rsvps`),
    });
    const { data: wishes = [] } = useQuery({
        queryKey: ['wishes', id],
        queryFn: () => api<Wish[]>(`/admin/invitations/${id}/wishes`),
    });
    const refresh = () => client.invalidateQueries();
    const importGuests = useMutation({
        mutationFn: (lines: string) =>
            post<{ added: number }>(`/admin/invitations/${id}/guests`, { lines }),
        onSuccess: (r) => {
            setPaste('');
            toast.success(`${String(r.added)} personal link${r.added === 1 ? '' : 's'} created`);
            void refresh();
        },
        onError: (e) => toast.error(failure(e)),
    });
    const remove = useMutation({
        mutationFn: (guestId: string) =>
            api(`/admin/invitations/${id}/guests/${guestId}`, { method: 'DELETE' }),
        onSuccess: () => {
            toast.success('Guest removed');
            void refresh();
        },
        onError: (e) => toast.error(failure(e)),
    });
    const moderate = useMutation({
        mutationFn: (v: WishUpdate) =>
            api(`/admin/invitations/${id}/wishes/${v.wishId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: v.status }),
            }),
        onSuccess: (_r, v) => {
            toast.success(v.status === 'approved' ? 'Wish approved' : 'Wish hidden');
            void refresh();
        },
        onError: (e) => toast.error(failure(e)),
    });

    if (!inv) return <PageSkeleton />;
    const locale = inv.invitation.locales[0] ?? 'en';
    const couple = titleOf(inv.invitation.content, locale);
    const base = `${window.location.origin}/${inv.invitation.slug}`;
    const attending = rsvps.filter((r) => r.attending);
    const headcount = attending.reduce((sum, r) => sum + r.guestCount, 0);
    const replied = guests.filter((g) => g.rsvped > 0).length;
    const pending = wishes.filter((w) => w.status === 'pending').length;
    const perEvent = inv.events.map((e) => ({
        id: e.id,
        title: pickText(e.title, locale) || e.kind,
        count: attending
            .filter((r) => r.eventIds.includes(e.id))
            .reduce((sum, r) => sum + r.guestCount, 0),
    }));
    const maxEvent = Math.max(1, ...perEvent.map((e) => e.count));
    const waLink = (g: Guest) => {
        const text = `${g.displayName}, you are warmly invited to the wedding of ${couple} ✦ ${base}?g=${g.token}`;
        return g.phone
            ? `https://wa.me/${g.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`
            : `https://wa.me/?text=${encodeURIComponent(text)}`;
    };

    return (
        <>
            <PageHeader
                eyebrow={
                    <span className="font-mono" dir="ltr">
                        /{inv.invitation.slug}
                    </span>
                }
                title={`Guests & RSVPs · ${couple}`}
                actions={
                    <>
                        <Button variant="outline" asChild>
                            <Link to="/admin/invitations/$id" params={{ id }}>
                                <PenLine /> Composer
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`/api/admin/invitations/${id}/rsvps.csv`}>
                                <Download /> Export CSV
                            </a>
                        </Button>
                    </>
                }
            />
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Responses"
                    value={rsvps.length}
                    icon={MailCheck}
                    accent="primary"
                />
                <StatCard
                    label="Attending (people)"
                    value={headcount}
                    icon={UserCheck}
                    accent="success"
                />
                <StatCard
                    label="Declined"
                    value={rsvps.length - attending.length}
                    icon={UserX}
                    accent="danger"
                />
                <StatCard
                    label="Personal links"
                    value={guests.length}
                    icon={Link2}
                    accent="gold"
                    hint={`${String(replied)} replied`}
                />
            </div>
            {perEvent.length > 1 && (
                <Panel title="Headcount per ceremony" className="mb-6">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {perEvent.map((e) => (
                            <div key={e.id} className="space-y-2 rounded-lg border bg-muted/30 p-3">
                                <p className="truncate text-sm text-muted-foreground">{e.title}</p>
                                <p className="text-2xl font-semibold tabular-nums">{e.count}</p>
                                <div className="h-1 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary/70"
                                        style={{ width: `${String((e.count / maxEvent) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <Panel
                    title="Personal guest links"
                    icon={UserPlus}
                    description="Each family gets its own link, so replies are matched automatically."
                >
                    <div className="space-y-2">
                        <Textarea
                            rows={3}
                            value={paste}
                            aria-label="Guests to add, one family per line"
                            className="resize-none font-mono text-xs"
                            onChange={(e) => {
                                setPaste(e.target.value);
                            }}
                            placeholder={
                                'Shah Parivar, +919800000001, 4\nPatel Family, +971500000000, 2'
                            }
                        />
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">
                                One family per line: name, phone, party size (phone and size
                                optional).
                            </p>
                            <Button
                                size="sm"
                                disabled={!paste.trim() || importGuests.isPending}
                                onClick={() => {
                                    importGuests.mutate(paste);
                                }}
                            >
                                <UserPlus /> Add guests
                            </Button>
                        </div>
                    </div>
                    <div className="mt-5 overflow-hidden rounded-lg border">
                        {guests.length === 0 ? (
                            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                                No personal links yet.
                            </p>
                        ) : (
                            <ScrollArea className="max-h-[520px]">
                                <ul className="divide-y">
                                    {guests.map((g) => (
                                        <li
                                            key={g.id}
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">
                                                    {g.displayName}
                                                    {g.maxGuests ? (
                                                        <span className="ms-1.5 text-xs font-normal text-muted-foreground">
                                                            · up to {g.maxGuests}
                                                        </span>
                                                    ) : null}
                                                </p>
                                                <p
                                                    data-guest-link
                                                    className="truncate font-mono text-[11px] text-muted-foreground"
                                                    dir="ltr"
                                                >
                                                    {base}?g={g.token}
                                                </p>
                                            </div>
                                            {g.rsvped > 0 ? (
                                                <ToneBadge tone="success">Replied</ToneBadge>
                                            ) : (
                                                <ToneBadge tone="muted">Waiting</ToneBadge>
                                            )}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm" asChild>
                                                        <a
                                                            href={waLink(g)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            aria-label={`Send to ${g.displayName} on WhatsApp`}
                                                        >
                                                            <MessageCircle className="text-success" />
                                                        </a>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Send on WhatsApp</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label="Remove guest"
                                                        className="text-muted-foreground hover:text-destructive"
                                                        onClick={() => {
                                                            remove.mutate(g.id);
                                                        }}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Remove</TooltipContent>
                                            </Tooltip>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        )}
                    </div>
                </Panel>
                <Tabs defaultValue="rsvps" className="gap-4">
                    <TabsList>
                        <TabsTrigger value="rsvps" className="px-3">
                            RSVPs
                            <Badge variant="muted" className="h-5 rounded-md px-1.5 tabular-nums">
                                {rsvps.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="wishes" className="px-3">
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
                    <TabsContent value="rsvps">
                        <Card className="gap-0 py-0">
                            <CardContent className="p-0">
                                {rsvps.length === 0 ? (
                                    <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                                        No responses yet.
                                    </p>
                                ) : (
                                    <ScrollArea className="max-h-[560px]">
                                        <ul className="divide-y">
                                            {rsvps.map((r) => (
                                                <li
                                                    key={r.id}
                                                    className="space-y-1 px-4 py-3 text-sm"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-medium">
                                                            {r.name}
                                                            {r.guestName && (
                                                                <span className="ms-1.5 text-xs font-normal text-muted-foreground">
                                                                    · {r.guestName}
                                                                </span>
                                                            )}
                                                        </span>
                                                        <ToneBadge
                                                            tone={
                                                                r.attending ? 'success' : 'danger'
                                                            }
                                                        >
                                                            {r.attending
                                                                ? `Coming · ${String(r.guestCount)}`
                                                                : 'Declined'}
                                                        </ToneBadge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {r.eventIds
                                                            .map(
                                                                (eid) =>
                                                                    perEvent.find(
                                                                        (e) => e.id === eid,
                                                                    )?.title,
                                                            )
                                                            .filter(Boolean)
                                                            .join(', ')}
                                                        {r.dietary ? ` · ${r.dietary}` : ''}
                                                    </p>
                                                    {r.message && (
                                                        <p className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs italic">
                                                            “{r.message}”
                                                        </p>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="wishes">
                        <Card className="gap-0 py-0">
                            <CardContent className="p-0">
                                {wishes.length === 0 ? (
                                    <p className="flex flex-col items-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
                                        <Heart className="size-5" />
                                        No wishes yet.
                                    </p>
                                ) : (
                                    <ul className="divide-y">
                                        {wishes.map((w) => (
                                            <li key={w.id} className="space-y-2 px-4 py-3 text-sm">
                                                <p className="leading-relaxed">“{w.message}”</p>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        — {w.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ToneBadge
                                                            tone={wishTone[w.status]}
                                                            className="capitalize"
                                                        >
                                                            {w.status}
                                                        </ToneBadge>
                                                        <Button
                                                            size="icon-sm"
                                                            variant="ghost"
                                                            aria-label="Approve"
                                                            onClick={() => {
                                                                moderate.mutate({
                                                                    wishId: w.id,
                                                                    status: 'approved',
                                                                });
                                                            }}
                                                        >
                                                            <Check className="text-success" />
                                                        </Button>
                                                        <Button
                                                            size="icon-sm"
                                                            variant="ghost"
                                                            aria-label="Hide"
                                                            onClick={() => {
                                                                moderate.mutate({
                                                                    wishId: w.id,
                                                                    status: 'hidden',
                                                                });
                                                            }}
                                                        >
                                                            <EyeOff />
                                                        </Button>
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
