import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
    CalendarHeart,
    Check,
    ExternalLink,
    Gift,
    Globe,
    LayoutList,
    Loader2,
    Lock,
    Palette,
    Play,
    Rocket,
    Save,
    Smartphone,
    Type,
    Users,
} from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
    type Draft,
    draftToPreview,
    type EditableInvitation,
    toDraft,
} from '@/admin/composer/draft';
import { ContentPanel, DesignPanel, EventsPanel, ExtrasPanel } from '@/admin/composer/panels';
import { SectionsPanel } from '@/admin/composer/SectionsPanel';
import { CopyField } from '@/admin/kit/form';
import { PageSkeleton } from '@/admin/kit/page';
import { InvitationStatusBadge } from '@/admin/kit/status';
import { useMe } from '@/admin/useMe';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InvitationView } from '@/invitation/InvitationView';
import { api, ApiError, patch } from '@/lib/api';

export const Route = createFileRoute('/admin/invitations/$id/')({ component: ComposerPage });

interface TabDef {
    value: string;
    label: string;
    icon: ReactNode;
}

const tabs: TabDef[] = [
    {
        value: 'design',
        label: 'Design',
        icon: <Palette />,
    },
    {
        value: 'words',
        label: 'Words',
        icon: <Type />,
    },
    {
        value: 'ceremonies',
        label: 'Ceremonies',
        icon: <CalendarHeart />,
    },
    {
        value: 'sections',
        label: 'Sections',
        icon: <LayoutList />,
    },
    {
        value: 'extras',
        label: 'Extras',
        icon: <Gift />,
    },
    {
        value: 'publish',
        label: 'Publish',
        icon: <Rocket />,
    },
];

interface StatusChange {
    status: string;
    override?: boolean;
}

const failure = (error: unknown) =>
    error instanceof ApiError ? error.message : 'Something went wrong';

function ComposerPage() {
    const { id } = Route.useParams();
    const client = useQueryClient();
    const me = useMe().data;
    const { data } = useQuery({
        queryKey: ['invitation', id],
        queryFn: () => api<EditableInvitation>(`/admin/invitations/${id}`),
    });
    // Unsaved edits live here; without edits the draft is derived straight from the server copy.
    const [edits, setEdits] = useState<Draft | null>(null);
    const draft = edits ?? (data ? toDraft(data) : null);
    const dirty = edits !== null;
    const [tab, setTab] = useState('design');
    const [replay, setReplay] = useState(0);
    const [showOpening, setShowOpening] = useState(false);

    // Choosing a different entry screen replays it in the phone straight away.
    const opening = draft?.design.opening;
    const [shownOpening, setShownOpening] = useState(opening);
    if (opening !== shownOpening) {
        setShownOpening(opening);
        if (shownOpening !== undefined) {
            setShowOpening(true);
            setReplay((r) => r + 1);
        }
    }

    const save = useMutation({
        mutationFn: (body: Draft) =>
            api(`/admin/invitations/${id}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            }),
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: ['invitation', id] });
            setEdits(null);
            toast.success('Changes saved');
        },
        onError: (e) => toast.error(failure(e)),
    });
    const status = useMutation({
        mutationFn: (body: StatusChange) => patch(`/admin/invitations/${id}/status`, body),
        onSuccess: (_r, body) => {
            toast.success(
                body.status === 'published' ? 'Invitation is live ✦' : 'Invitation unpublished',
            );
            return client.invalidateQueries({ queryKey: ['invitation', id] });
        },
        onError: (e) => toast.error(failure(e)),
    });
    const slug = useMutation({
        mutationFn: (value: string) => patch(`/admin/invitations/${id}/slug`, { slug: value }),
        onSuccess: () => {
            toast.success('Link updated');
            return client.invalidateQueries({ queryKey: ['invitation', id] });
        },
        onError: (e) => toast.error(failure(e)),
    });

    const preview = useMemo(
        () => (draft && data ? draftToPreview(draft, data) : null),
        [draft, data],
    );
    if (!data || !draft || !preview)
        return (
            <div className="p-8">
                <PageSkeleton />
            </div>
        );

    const set = (update: (d: Draft) => Draft) => {
        setEdits((current) => update(current ?? draft));
    };
    const origin = window.location.origin;
    const liveUrl = `${origin}/${data.invitation.slug}`;
    const previewUrl = `${origin}/p/${data.invitation.previewToken}`;
    const error = status.error ?? slug.error;
    const published = data.invitation.status === 'published';

    return (
        <Tabs value={tab} onValueChange={setTab} className="gap-0">
            <div className="sticky top-14 z-20 border-b bg-background/85 backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="truncate text-lg font-semibold tracking-tight">
                                Composer
                            </h1>
                            <InvitationStatusBadge status={data.invitation.status} />
                            {dirty && (
                                <Badge variant="warning" className="font-normal">
                                    Unsaved
                                </Badge>
                            )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                            <span className="font-mono" dir="ltr">
                                /{data.invitation.slug}
                            </span>
                            {data.order
                                ? ` · ${data.order.number} · ${data.order.packageCode} · up to ${String(data.order.limits.events)} ceremonies, ${String(data.order.limits.languages)} language(s)`
                                : ' · Demo invitation'}
                        </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                        <Link to="/admin/invitations/$id/guests" params={{ id }}>
                            <Users /> Guests & RSVPs
                            <Badge variant="muted" className="h-5 rounded-md px-1.5 tabular-nums">
                                {data.counts.rsvps}
                            </Badge>
                        </Link>
                    </Button>
                    {data.order && (
                        <Button size="sm" variant="ghost" asChild>
                            <Link to="/admin/orders/$id" params={{ id: data.order.id }}>
                                Order
                            </Link>
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={() => {
                            save.mutate(draft);
                        }}
                        disabled={!dirty || save.isPending}
                    >
                        {save.isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : dirty ? (
                            <Save />
                        ) : (
                            <Check />
                        )}
                        {save.isPending ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
                    </Button>
                </div>
                <div className="overflow-x-auto px-4 sm:px-6 lg:px-8">
                    <TabsList variant="line" className="h-10 gap-1 bg-transparent p-0">
                        {tabs.map((t) => (
                            <TabsTrigger key={t.value} value={t.value} className="px-3 text-[13px]">
                                {t.icon}
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
            </div>
            <div className="grid gap-8 p-4 sm:p-6 lg:p-8 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0">
                    <Card className="gap-0 py-0">
                        <CardContent className="p-5 sm:p-6">
                            <TabsContent value="design">
                                <DesignPanel draft={draft} set={set} />
                            </TabsContent>
                            <TabsContent value="words">
                                <ContentPanel draft={draft} set={set} />
                            </TabsContent>
                            <TabsContent value="ceremonies">
                                <EventsPanel draft={draft} set={set} />
                            </TabsContent>
                            <TabsContent value="sections">
                                <SectionsPanel draft={draft} set={set} />
                            </TabsContent>
                            <TabsContent value="extras">
                                <ExtrasPanel draft={draft} set={set} />
                            </TabsContent>
                            <TabsContent value="publish" className="space-y-6">
                                <form
                                    className="space-y-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const value = new FormData(e.currentTarget).get('slug');
                                        if (typeof value === 'string')
                                            slug.mutate(value.trim().toLowerCase());
                                    }}
                                >
                                    <Label
                                        htmlFor="slug"
                                        className="text-[13px] text-foreground/80"
                                    >
                                        Invitation link
                                    </Label>
                                    <InputGroup dir="ltr">
                                        <InputGroupAddon>
                                            <Globe />
                                            <InputGroupText>
                                                {origin.replace(/^https?:\/\//, '')}/
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            id="slug"
                                            name="slug"
                                            defaultValue={data.invitation.slug}
                                            key={data.invitation.slug}
                                            className="ps-0.5 font-mono"
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton
                                                type="submit"
                                                variant="secondary"
                                                size="xs"
                                            >
                                                Change
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </form>
                                <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                                    <p className="flex items-center gap-2 text-sm font-medium">
                                        <Lock className="size-3.5 text-muted-foreground" /> Private
                                        preview for the family
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <CopyField
                                            value={previewUrl}
                                            label="Preview link"
                                            className="bg-card"
                                        />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="icon" asChild>
                                                    <a
                                                        href={previewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label="Open preview"
                                                    >
                                                        <ExternalLink />
                                                    </a>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Open preview</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                <Separator />
                                {dirty && (
                                    <Alert className="border-gold/40 bg-gold/5">
                                        <Save />
                                        <AlertTitle>Unsaved changes</AlertTitle>
                                        <AlertDescription>
                                            Save your changes before publishing.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {error && (
                                    <Alert
                                        variant="destructive"
                                        className="border-destructive/30 bg-destructive/5"
                                    >
                                        <AlertTitle>Couldn’t update</AlertTitle>
                                        <AlertDescription>{failure(error)}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="flex flex-wrap items-center gap-2">
                                    {!published ? (
                                        <Button
                                            size="lg"
                                            disabled={dirty || status.isPending}
                                            onClick={() => {
                                                status.mutate({ status: 'published' });
                                            }}
                                        >
                                            <Rocket /> Publish invitation
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="lg" variant="gold" asChild>
                                                <a
                                                    href={liveUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink /> Open live invitation
                                                </a>
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                onClick={() => {
                                                    status.mutate({ status: 'draft' });
                                                }}
                                            >
                                                Unpublish
                                            </Button>
                                        </>
                                    )}
                                    {!published && me?.role !== 'designer' && (
                                        <Button
                                            size="lg"
                                            variant="ghost"
                                            disabled={dirty}
                                            onClick={() => {
                                                status.mutate({
                                                    status: 'published',
                                                    override: true,
                                                });
                                            }}
                                        >
                                            Publish with balance due (owner)
                                        </Button>
                                    )}
                                </div>
                                {data.invitation.expiresAt && (
                                    <p className="text-xs text-muted-foreground">
                                        Hosting until{' '}
                                        {new Date(data.invitation.expiresAt).toLocaleDateString()}.
                                    </p>
                                )}
                            </TabsContent>
                        </CardContent>
                    </Card>
                </div>
                <aside className="xl:sticky xl:top-[9.5rem] xl:self-start">
                    <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium text-muted-foreground">
                            <Smartphone className="size-4" /> Live preview
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setShowOpening(true);
                                setReplay((r) => r + 1);
                            }}
                        >
                            <Play /> Replay opening
                        </Button>
                    </div>
                    {/* transform makes the invitation's fixed-position layers stay inside the phone frame */}
                    <div className="mx-auto w-[min(100%,390px)] rounded-[2.75rem] bg-night p-2.5 shadow-[0_30px_80px_-30px_rgba(29,20,22,0.55)] ring-1 ring-black/10">
                        <div className="relative h-[min(760px,calc(100svh-13rem))] [transform:translateZ(0)] overflow-y-auto overscroll-contain rounded-[2.2rem]">
                            <InvitationView
                                key={`${String(replay)}-${draft.locales.join()}`}
                                data={preview}
                                embedded
                                skipOpening={!showOpening}
                            />
                        </div>
                    </div>
                </aside>
            </div>
        </Tabs>
    );
}
