import { formatMoney } from '@shared/money';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Check, Copy, ExternalLink, Loader2, Lock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { type Draft, toDraft } from '@/admin/composer/draft';
import { upload } from '@/admin/editor/PhotosPanel';
import type { Uploader } from '@/admin/editor/uploader';
import { Button } from '@/components/ui/button';
import { api, ApiError, post } from '@/lib/api';
import { FormEditor } from '@/shop/FormEditor';
import { ShopShell } from '@/shop/ShopShell';
import { SignIn } from '@/shop/SignIn';
import type { MyInvitation } from '@/shop/types';

export const Route = createFileRoute('/my/$id')({
    ssr: false,
    head: () => ({
        meta: [
            { title: 'Edit your invitation · Toran' },
            {
                name: 'robots',
                content: 'noindex',
            },
        ],
    }),
    component: () => (
        <ShopShell bare>
            <MyEditor />
        </ShopShell>
    ),
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
    if (mine.error instanceof ApiError && mine.error.status === 401)
        return (
            <section className="mx-auto max-w-sm px-4 py-20">
                <h1 className="mb-6 font-display text-4xl text-ink">Sign in to edit</h1>
                <SignIn
                    onDone={() => {
                        void client.invalidateQueries({ queryKey: ['mine', id] });
                    }}
                />
            </section>
        );
    if (!mine.data)
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <p className="text-muted-foreground">{mine.error.message}</p>
                <Link to="/my" className="mt-4 inline-block text-burgundy underline">
                    My invitations
                </Link>
            </div>
        );
    return (
        <Editor
            key={mine.dataUpdatedAt}
            data={mine.data}
            onChanged={() => client.invalidateQueries({ queryKey: ['mine', id] })}
        />
    );
}

interface EditorProps {
    data: MyInvitation;
    onChanged: () => Promise<void>;
}

function Editor({ data, onChanged }: EditorProps) {
    const base = data.edit;
    const id = base.invitation.id;
    const initial = useMemo(() => toDraft(base), [base]);
    const [draft, setDraft] = useState<Draft>(initial);
    const [busy, setBusy] = useState<'save' | 'pay' | 'publish' | null>(null);
    const dirty = draft !== initial;
    // Read once: the lock only matters at the moment the editor opens.
    const [locked] = useState(
        () => data.lockedAfter !== null && Date.now() > Date.parse(data.lockedAfter),
    );
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

    const run = async (
        kind: 'save' | 'pay' | 'publish',
        work: () => Promise<unknown>,
        done: string,
    ) => {
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
            body: JSON.stringify({
                content: draft.content,
                events: draft.events,
            }),
        });

    const bar = (
        <div className="flex min-h-14 flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
            <Link
                to="/my"
                aria-label="My invitations"
                className="flex size-9 items-center justify-center rounded-full hover:bg-black/5"
            >
                <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl text-ink">
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
                        className="flex max-w-full items-center gap-1 truncate text-xs text-burgundy"
                    >
                        <Copy className="size-3" /> {link.replace(/^https?:\/\//, '')}
                    </button>
                )}
            </div>
            {locked ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="size-3.5" /> Editing closed after the celebration
                </span>
            ) : (
                <Button
                    variant={dirty ? 'default' : 'outline'}
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
                    className="bg-gold text-ink hover:bg-gold-bright"
                    disabled={busy !== null}
                    onClick={() => {
                        void run(
                            'pay',
                            () => post(`/store/me/orders/${data.orderId}/pay`, {}),
                            'Paid, thank you',
                        );
                    }}
                >
                    {busy === 'pay' && <Loader2 className="animate-spin" />}
                    Pay {formatMoney(data.balance, data.currency)}
                </Button>
            ) : live ? (
                <Button variant="outline" asChild>
                    <a href={link} target="_blank" rel="noreferrer">
                        <ExternalLink /> View
                    </a>
                </Button>
            ) : (
                <Button
                    className="bg-gold text-ink hover:bg-gold-bright"
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
            notice={
                data.balance > 0
                    ? 'Complete payment to publish your invitation.'
                    : live
                      ? 'Changes you save show on your live invitation straight away.'
                      : 'When it looks right, publish to get your link.'
            }
        />
    );
}
