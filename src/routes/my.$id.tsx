import { canPublishMade, studioHasIt } from '@shared/made';
import { formatMoney } from '@shared/money';
import type { CustomerInput } from '@shared/schemas/composer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
    ArrowLeft,
    Check,
    Copy,
    ExternalLink,
    Images,
    Loader2,
    Lock,
    PenLine,
    Users,
    Wand2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { type Draft, toDraft } from '@/admin/composer/draft';
import { upload } from '@/admin/editor/PhotosPanel';
import type { Uploader } from '@/admin/editor/uploader';
import { EmptyState } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { api, post } from '@/lib/api';
import { FormEditor } from '@/shop/FormEditor';
import { usePayOrder } from '@/shop/portal/data';
import { hasVideo, ShareVideo } from '@/shop/ShareVideo';
import type { MyInvitation } from '@/shop/types';

export const Route = createFileRoute('/my/$id')({
    head: () => ({ meta: [{ title: 'Edit your invitation · Toran' }] }),
    component: MyEditor,
});

function MyEditor() {
    const { id } = Route.useParams();
    const client = useQueryClient();
    const mine = useQuery({
        queryKey: ['mine', id],
        queryFn: () => api<MyInvitation>(`/store/me/invitations/${id}`),
    });

    if (mine.isPending)
        return <Loader2 className="mx-auto mt-24 size-6 animate-spin text-muted-foreground" />;
    if (!mine.data)
        return (
            <div className="flex min-h-dvh items-center justify-center bg-background p-6">
                <EmptyState
                    icon={PenLine}
                    title="Couldn’t open this invitation"
                    description={mine.error.message}
                >
                    <Button asChild>
                        <Link to="/my">My invitations</Link>
                    </Button>
                </EmptyState>
            </div>
        );
    return (
        <Editor
            key={mine.dataUpdatedAt}
            data={mine.data}
            // Cards and the list are drawn from the same invitation.
            onChanged={() => client.invalidateQueries()}
        />
    );
}

// What a customer may change: everything but the look, which the server keeps as it is.
const theirs = (draft: Draft): CustomerInput => ({
    content: draft.content,
    events: draft.events,
    sections: draft.sections.map(({ type, enabled }) => ({
        type,
        enabled,
    })),
    locales: draft.locales as CustomerInput['locales'],
    rsvpEnabled: draft.rsvpEnabled,
    extras: {
        shagun: draft.extras.shagun,
        live: draft.extras.live,
        travel: draft.extras.travel,
        wishes: draft.extras.wishes,
        pdf: draft.extras.pdf,
        music: draft.extras.music,
    },
});

interface EditorProps {
    data: MyInvitation;
    onChanged: () => Promise<void>;
}

function Editor({ data, onChanged }: EditorProps) {
    const base = data.edit;
    const id = base.invitation.id;
    const initial = useMemo(() => toDraft(base), [base]);
    const [draft, setDraft] = useState<Draft>(initial);
    const [busy, setBusy] = useState<'save' | 'publish' | null>(null);
    const pay = usePayOrder();
    const dirty = draft !== initial;
    // Read once: the lock only matters at the moment the editor opens.
    const [over] = useState(
        () => data.lockedAfter !== null && Date.now() > Date.parse(data.lockedAfter),
    );
    // Done-for-you: while the studio has it, theirs is the only hand on it.
    const studioBusy = data.made !== null && studioHasIt(data.made);
    const locked = over || studioBusy;
    const madeWaits = data.made !== null && !canPublishMade(data.made);
    const live = base.invitation.status === 'published';
    const link = `${window.location.origin}/${base.invitation.slug}`;

    // Unsaved words shouldn't vanish with an accidental close.
    useEffect(() => {
        if (!dirty) return;
        const warn = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener('beforeunload', warn);
        return () => {
            window.removeEventListener('beforeunload', warn);
        };
    }, [dirty]);

    const uploader = useMemo<Uploader>(
        () => ({
            upload: (file) => upload(id, file, `/api/store/me/invitations/${id}/photos`),
            stock: false,
        }),
        [id],
    );

    const run = async (kind: 'save' | 'publish', work: () => Promise<unknown>, done: string) => {
        setBusy(kind);
        try {
            await work();
            toast.success(done);
            await onChanged();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Something went wrong');
        } finally {
            setBusy(null);
        }
    };

    const save = () =>
        api(`/store/me/invitations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(theirs(draft)),
        });

    const bar = (
        <div className="flex min-h-14 flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
            <Link
                to="/my"
                aria-label="My invitations"
                className="flex size-8 items-center justify-center rounded-control hover:bg-muted"
            >
                <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium">
                    {live ? 'Your invitation is live' : 'Your invitation'}
                </p>
                {live && (
                    <button
                        type="button"
                        onClick={() => {
                            void navigator.clipboard
                                .writeText(link)
                                .then(() => toast.success('Link copied'));
                        }}
                        className="flex max-w-full items-center gap-1 truncate text-xs text-primary"
                    >
                        <Copy className="size-3" /> {link.replace(/^https?:\/\//, '')}
                    </button>
                )}
            </div>
            <Button variant="outline" asChild>
                <Link to="/my/$id/guests" params={{ id }}>
                    <Users />
                    {/* Phones keep the room for the title; the name stays for screen readers. */}
                    <span className="max-sm:sr-only">Guests</span>
                </Link>
            </Button>
            <Button variant="outline" asChild>
                <Link to="/my/$id/cards" params={{ id }}>
                    <Images />
                    <span className="max-sm:sr-only">Cards</span>
                </Link>
            </Button>
            {locked ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="size-3.5" />{' '}
                    {studioBusy
                        ? 'Our studio is making it'
                        : 'Editing closed after the celebration'}
                </span>
            ) : (
                <Button
                    variant={dirty && live ? 'default' : 'outline'}
                    disabled={!dirty || busy !== null}
                    onClick={() => {
                        void run('save', save, live ? 'Saved. Guests see it now' : 'Saved');
                    }}
                >
                    {busy === 'save' ? <Loader2 className="animate-spin" /> : <Check />}
                    {dirty ? 'Save' : 'Saved'}
                </Button>
            )}
            {data.balance > 0 ? (
                <Button
                    disabled={busy !== null || pay.isPending}
                    onClick={() => {
                        pay.mutate({
                            orderId: data.orderId,
                            item: 'Your invitation',
                        });
                    }}
                >
                    {pay.isPending && <Loader2 className="animate-spin" />}
                    Pay {formatMoney(data.balance, data.currency)}
                </Button>
            ) : madeWaits ? (
                <Button asChild>
                    <Link to="/my/$id/made" params={{ id }}>
                        <Wand2 />
                        <span className="max-sm:sr-only">We make it</span>
                    </Link>
                </Button>
            ) : live ? (
                <>
                    {hasVideo(base) && <ShareVideo base={base} />}
                    <Button variant="outline" asChild>
                        <a href={link} target="_blank" rel="noreferrer">
                            <ExternalLink />
                            <span className="max-sm:sr-only">View</span>
                        </a>
                    </Button>
                </>
            ) : (
                <Button
                    disabled={busy !== null}
                    onClick={() => {
                        void run(
                            'publish',
                            async () => {
                                if (dirty) await save();
                                await post(`/store/me/invitations/${id}/publish`, {});
                            },
                            'Published! Share your link',
                        );
                    }}
                >
                    {busy === 'publish' && <Loader2 className="animate-spin" />}
                    Publish
                </Button>
            )}
        </div>
    );

    return (
        <FormEditor
            base={base}
            draft={draft}
            set={(update) => {
                setDraft(update);
            }}
            uploader={uploader}
            limits={base.order?.limits}
            bar={bar}
            locked={locked}
            owned
            notice={
                studioBusy
                    ? 'Our studio is making your invitation. You can edit it after your first look.'
                    : data.made === 'details'
                      ? 'Send us your details under We make it, or start here yourself.'
                      : data.balance > 0
                        ? 'Complete payment to publish your invitation.'
                        : live
                          ? 'Changes you save show on your live invitation straight away.'
                          : 'When it looks right, publish to get your link.'
            }
        />
    );
}
