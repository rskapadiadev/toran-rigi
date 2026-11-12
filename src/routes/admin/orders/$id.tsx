import { can } from '@shared/permissions';
import { themeCatalog } from '@shared/themes';
import { orderStatuses } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
    ArrowRightLeft,
    BookOpen,
    Clock,
    ExternalLink,
    Mail,
    MessageCircle,
    Phone,
    Sparkles,
    StickyNote,
    Users,
} from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';
import { toast } from 'sonner';

import { InvoicePanel } from '@/admin/InvoicePanel';
import { CopyField, FormField } from '@/admin/kit/form';
import { PageHeader, PageSkeleton, Panel, ToneBadge } from '@/admin/kit/page';
import { InvitationStatusBadge, OrderStatusBadge, slaFor } from '@/admin/kit/status';
import { cultureLabel, statusLabel } from '@/admin/labels';
import { initials } from '@/admin/shell/nav';
import type { InvitationRef, OrderDetail } from '@/admin/types';
import { useMe } from '@/admin/useMe';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { api, ApiError, patch, post } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formString, useNow } from '@/motion/hooks';

export const Route = createFileRoute('/admin/orders/$id')({ component: OrderPage });

interface StaffMember {
    id: string;
    name: string;
}

interface StatusBody {
    status: string;
    note?: string;
}

const failure = (error: unknown) =>
    error instanceof ApiError ? error.message : 'Something went wrong';
const UNASSIGNED = '__none__';

function OrderPage() {
    const { id } = Route.useParams();
    const client = useQueryClient();
    const me = useMe().data;
    const now = useNow(30_000) ?? 0;
    const { data } = useQuery({
        queryKey: ['order', id],
        queryFn: () => api<OrderDetail>(`/admin/orders/${id}`),
    });
    const { data: staff = [] } = useQuery({
        queryKey: ['staff'],
        queryFn: () => api<StaffMember[]>('/admin/staff'),
    });
    const [override, setOverride] = useState(false);
    const refresh = () => client.invalidateQueries();
    const setStatus = useMutation({
        mutationFn: (body: StatusBody) =>
            patch(`/admin/orders/${id}/status${override ? '?override=1' : ''}`, body),
        onSuccess: (_r, body) => {
            toast.success(`Moved to ${statusLabel[body.status] ?? body.status}`);
            void refresh();
        },
        onError: (e) => toast.error(failure(e)),
    });
    const addNote = useMutation({
        mutationFn: (body: string) => post(`/admin/orders/${id}/notes`, { body }),
        onSuccess: () => {
            toast.success('Note added');
            void refresh();
        },
        onError: (e) => toast.error(failure(e)),
    });
    const assign = useMutation({
        mutationFn: (userId: string | null) => patch(`/admin/orders/${id}/assign`, { userId }),
        onSuccess: () => {
            toast.success('Assignment updated');
            void refresh();
        },
        onError: (e) => toast.error(failure(e)),
    });

    if (!data) return <PageSkeleton />;
    const { order, customer, events, invoices } = data;
    const sla = ['published', 'completed', 'cancelled'].includes(order.status)
        ? null
        : slaFor(order.deliveryDueAt, now);
    const canBill = can(me?.role, 'billing.view');
    const portalUrl = `${window.location.origin}/portal/${order.portalToken}`;

    const submitStatus = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setStatus.mutate({
            status: formString(f, 'status'),
            note: formString(f, 'note') || undefined,
        });
    };
    const submitNote = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const body = formString(new FormData(form), 'body');
        if (body)
            addNote.mutate(body, {
                onSuccess: () => {
                    form.reset();
                },
            });
    };

    return (
        <>
            <PageHeader
                eyebrow={<span className="font-mono">{order.number}</span>}
                title={customer?.name ?? order.number}
                description={
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="capitalize">{order.packageCode}</span>
                        <span aria-hidden>·</span>
                        <span>{cultureLabel[order.culture] ?? order.culture}</span>
                        {order.weddingDate && (
                            <>
                                <span aria-hidden>·</span>
                                <span>Wedding {order.weddingDate}</span>
                            </>
                        )}
                        <span aria-hidden>·</span>
                        <span>
                            {order.revisionCount} revision{order.revisionCount === 1 ? '' : 's'}
                        </span>
                    </span>
                }
                actions={<OrderStatusBadge status={order.status} className="h-7 px-3 text-xs" />}
            />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                <div className="min-w-0 space-y-6">
                    {sla && (
                        <Alert
                            variant={sla.late ? 'destructive' : 'default'}
                            className={cn(
                                !sla.late && 'border-gold/40 bg-gold/5 [&>svg]:text-gold-deep',
                                sla.late && 'border-destructive/30 bg-destructive/5',
                            )}
                        >
                            <Clock />
                            <AlertTitle>Delivery {sla.label}</AlertTitle>
                            <AlertDescription>
                                The clock started when content was complete · due{' '}
                                {new Date(order.deliveryDueAt ?? '').toLocaleString('en', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })}
                            </AlertDescription>
                        </Alert>
                    )}
                    <Panel
                        title="Move order"
                        icon={ArrowRightLeft}
                        description={`“Ready to start” starts the delivery clock (${order.packageCode === 'signature' ? '48h' : 'per package'}).`}
                    >
                        <form
                            onSubmit={submitStatus}
                            className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)_auto] sm:items-end"
                        >
                            <FormField label="Status">
                                {(fieldId) => (
                                    <Select
                                        name="status"
                                        defaultValue={order.status}
                                        key={order.status}
                                    >
                                        <SelectTrigger id={fieldId} className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orderStatuses.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {statusLabel[s]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </FormField>
                            <FormField label="Note (optional)">
                                {(fieldId) => (
                                    <Input
                                        id={fieldId}
                                        name="note"
                                        placeholder="e.g. All photos received on WhatsApp"
                                    />
                                )}
                            </FormField>
                            <Button type="submit" disabled={setStatus.isPending}>
                                Update
                            </Button>
                        </form>
                        {can(me?.role, 'orders.publishWithBalance') && (
                            <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed px-3 py-2.5">
                                <Switch
                                    id="override"
                                    checked={override}
                                    onCheckedChange={setOverride}
                                />
                                <Label
                                    htmlFor="override"
                                    className="text-xs font-normal text-muted-foreground"
                                >
                                    Owner override: allow publishing with balance due (logged)
                                </Label>
                            </div>
                        )}
                    </Panel>
                    <Panel title="Timeline & notes" icon={StickyNote}>
                        <form onSubmit={submitNote} className="mb-6 space-y-2">
                            <Textarea
                                name="body"
                                rows={2}
                                aria-label="Internal note"
                                placeholder="Add an internal note…"
                                className="resize-none"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="outline"
                                    disabled={addNote.isPending}
                                >
                                    Add note
                                </Button>
                            </div>
                        </form>
                        <ol className="relative space-y-5 ps-6 before:absolute before:inset-y-1 before:start-[7px] before:w-px before:bg-border">
                            {events.map((ev) => (
                                <li key={ev.id} className="relative">
                                    <span
                                        className={cn(
                                            'absolute -start-6 top-1 size-[15px] rounded-full border-[3px] border-background',
                                            ev.kind === 'status'
                                                ? 'bg-gold'
                                                : 'bg-muted-foreground/40',
                                        )}
                                    />
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        {ev.kind === 'status' && ev.toStatus ? (
                                            <>
                                                <span className="text-muted-foreground">
                                                    Moved to
                                                </span>
                                                <OrderStatusBadge status={ev.toStatus} />
                                            </>
                                        ) : null}
                                        {ev.body && (
                                            <span
                                                className={
                                                    ev.kind === 'status'
                                                        ? 'text-muted-foreground'
                                                        : ''
                                                }
                                            >
                                                {ev.body}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {new Date(ev.createdAt).toLocaleString('en', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}{' '}
                                        · {ev.userName ?? 'System'}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </Panel>
                </div>
                <div className="space-y-6">
                    <InvitationCard order={order} invitation={data.invitation} />
                    <Card className="gap-0 py-0">
                        <CardContent className="space-y-4 p-5">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                    <AvatarFallback className="bg-primary/8 text-sm font-semibold text-primary">
                                        {initials(customer?.name ?? '?')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{customer?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Customer · {customer?.country}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1.5 text-sm">
                                {customer?.phone && (
                                    <p className="flex items-center gap-2" dir="ltr">
                                        <Phone className="size-3.5 text-muted-foreground" />
                                        {customer.phone}
                                    </p>
                                )}
                                {customer?.email && (
                                    <p className="flex items-center gap-2">
                                        <Mail className="size-3.5 text-muted-foreground" />
                                        {customer.email}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {customer?.phone && (
                                    <Button size="sm" variant="outline" asChild>
                                        <a
                                            href={`https://wa.me/${customer.phone.replace(/[^\d]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MessageCircle className="text-success" /> WhatsApp
                                        </a>
                                    </Button>
                                )}
                                {customer && canBill && (
                                    <Button size="sm" variant="ghost" asChild>
                                        <Link
                                            to="/admin/customers/$id"
                                            params={{ id: customer.id }}
                                        >
                                            <BookOpen /> Ledger
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            <Separator />
                            <FormField label="Assigned designer">
                                {(fieldId) => (
                                    <Select
                                        value={order.assignedUserId ?? UNASSIGNED}
                                        onValueChange={(v) => {
                                            assign.mutate(v === UNASSIGNED ? null : v);
                                        }}
                                        disabled={!can(me?.role, 'orders.create')}
                                    >
                                        <SelectTrigger id={fieldId} className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                                            {staff.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </FormField>
                            <div className="space-y-2">
                                <p className="text-[13px] font-medium text-foreground/80">
                                    Customer portal (details & uploads)
                                </p>
                                <CopyField value={portalUrl} label="Portal link" />
                            </div>
                        </CardContent>
                    </Card>
                    {canBill ? (
                        invoices.map((inv) => (
                            <InvoicePanel
                                key={inv.id}
                                invoiceId={inv.id}
                                customerName={customer?.name}
                                customerPhone={customer?.phone}
                            />
                        ))
                    ) : (
                        <Card className="py-4">
                            <CardContent>
                                <ToneBadge
                                    tone={
                                        invoices.every((i) => i.status === 'paid')
                                            ? 'success'
                                            : 'warning'
                                    }
                                >
                                    {invoices.every((i) => i.status === 'paid')
                                        ? 'Paid'
                                        : 'Payment pending'}
                                </ToneBadge>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

interface InvitationCardProps {
    order: OrderDetail['order'];
    invitation: InvitationRef | null;
}

function InvitationCard({ order, invitation }: InvitationCardProps) {
    const navigate = useNavigate();
    const suggested = themeCatalog.find((t) => t.culture === order.culture)?.slug ?? 'editorial';
    const [theme, setTheme] = useState(suggested);
    const create = useMutation({
        mutationFn: () =>
            post<{ id: string }>('/admin/invitations', {
                orderId: order.id,
                themeSlug: theme,
            }),
        onSuccess: ({ id }) => {
            toast.success('Invitation created');
            return navigate({
                to: '/admin/invitations/$id',
                params: { id },
            });
        },
        onError: (e) => toast.error(failure(e)),
    });
    return (
        <Card className="relative gap-0 overflow-hidden border-gold/40 bg-linear-to-br from-card via-card to-gold/10 py-0">
            <div className="pointer-events-none absolute -end-10 -top-10 size-36 rounded-full bg-gold/15 blur-2xl" />
            <CardContent className="relative space-y-4 p-5">
                <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-gold/15 text-gold-deep">
                            <Sparkles className="size-4" />
                        </span>
                        Invitation
                    </p>
                    {invitation && <InvitationStatusBadge status={invitation.status} />}
                </div>
                {invitation ? (
                    <>
                        <p className="font-mono text-sm text-muted-foreground" dir="ltr">
                            /{invitation.slug}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" asChild>
                                <Link to="/admin/invitations/$id" params={{ id: invitation.id }}>
                                    Open Composer
                                </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                                <Link
                                    to="/admin/invitations/$id/guests"
                                    params={{ id: invitation.id }}
                                >
                                    <Users /> Guests & RSVPs
                                </Link>
                            </Button>
                            {invitation.status === 'published' && (
                                <Button size="sm" variant="ghost" asChild>
                                    <a
                                        href={`/${invitation.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink /> Live
                                    </a>
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <FormField label="Starting theme">
                            {(fieldId) => (
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger id={fieldId} className="w-full bg-card">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {themeCatalog.map((t) => (
                                            <SelectItem key={t.slug} value={t.slug}>
                                                {t.name}
                                                <span className="text-muted-foreground">
                                                    {cultureLabel[t.culture]}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </FormField>
                        <Button
                            variant="gold"
                            className="w-full"
                            onClick={() => {
                                create.mutate();
                            }}
                            disabled={create.isPending}
                        >
                            <Sparkles /> Create invitation & open Composer
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
