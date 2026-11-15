import { formatMoney } from '@shared/money';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { type Draft, toDraft } from '@/admin/composer/draft';
import { upload } from '@/admin/editor/PhotosPanel';
import type { Uploader } from '@/admin/editor/uploader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { api, post } from '@/lib/api';
import { FormEditor } from '@/shop/FormEditor';
import { PriceTag } from '@/shop/landing';
import { localPhotos, mapLocalPhotos, withoutLocalPhotos } from '@/shop/local-photos';
import { ShopShell } from '@/shop/ShopShell';
import { SignIn } from '@/shop/SignIn';
import type { BuyResult, Me, TryTemplate } from '@/shop/types';

export const Route = createFileRoute('/try/$slug')({
    ssr: false,
    loader: ({ params }) => api<TryTemplate>(`/store/templates/${params.slug}`),
    head: ({ loaderData }) => ({
        meta: [
            { title: `Try ${loaderData?.template.name ?? 'a design'} · Toran` },
            {
                name: 'robots',
                content: 'noindex',
            },
        ],
    }),
    errorComponent: () => (
        <ShopShell>
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <h1 className="font-display text-4xl">This design isn’t available</h1>
                <Link to="/collections" className="mt-6 inline-block text-burgundy underline">
                    See the collection
                </Link>
            </div>
        </ShopShell>
    ),
    component: TryPage,
});

// Words typed while trying stay on this device for a day (never photos: those stay in the tab).
const DAY = 86_400_000;
const storeKey = (slug: string) => `toran-try:${slug}`;

interface SavedTry {
    at: number;
    draft: Draft;
}

function readSaved(slug: string): Draft | null {
    try {
        const raw = localStorage.getItem(storeKey(slug));
        if (!raw) return null;
        const saved = JSON.parse(raw) as SavedTry;
        return Date.now() - saved.at < DAY ? saved.draft : null;
    } catch {
        return null;
    }
}

function writeSaved(slug: string, draft: Draft | null) {
    try {
        if (draft) {
            const saved: SavedTry = {
                at: Date.now(),
                draft: withoutLocalPhotos(draft),
            };
            localStorage.setItem(storeKey(slug), JSON.stringify(saved));
        } else localStorage.removeItem(storeKey(slug));
    } catch {
        // Private mode or full storage: trying still works for this visit.
    }
}

function TryPage() {
    const data = Route.useLoaderData();
    const { slug } = Route.useParams();
    const base = data.edit;
    const [saved] = useState(() => readSaved(slug));
    const [draft, setDraft] = useState<Draft>(() => saved ?? toDraft(base));
    const [intro, setIntro] = useState(saved === null);
    const [buying, setBuying] = useState(false);
    const files = useRef(new Map<string, File>());

    const set = (update: (d: Draft) => Draft) => {
        setDraft(update);
    };

    useEffect(() => {
        const t = setTimeout(() => {
            writeSaved(slug, draft);
        }, 400);
        return () => {
            clearTimeout(t);
        };
    }, [slug, draft]);

    const uploader = useMemo<Uploader>(
        () => ({
            upload: (file) => {
                const url = URL.createObjectURL(file);
                files.current.set(url, file);
                return Promise.resolve(url);
            },
            stock: false,
        }),
        [],
    );

    const bar = (
        <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
            <Link
                to="/collections"
                aria-label="Back to the collection"
                className="flex size-9 items-center justify-center rounded-full hover:bg-black/5"
            >
                <ArrowLeft className="size-4" />
            </Link>
            <p className="min-w-0 flex-1 truncate">
                <span className="text-xs text-muted-foreground">Try · </span>
                <span className="font-display text-xl text-ink">{data.template.name}</span>
            </p>
            {data.offer && (
                <PriceTag
                    price={data.offer.price}
                    compare={data.offer.comparePrice}
                    off={data.offer.off}
                    currency={data.offer.currency}
                    tone="light"
                    className="hidden text-sm font-medium sm:inline-flex"
                />
            )}
            <Button
                className="rounded-full bg-gold px-5 text-ink hover:bg-gold-bright"
                onClick={() => {
                    setBuying(true);
                }}
            >
                Buy &amp; keep
            </Button>
        </div>
    );

    return (
        <ShopShell bare>
            <FormEditor
                base={base}
                draft={draft}
                set={set}
                uploader={uploader}
                limits={data.offer?.limits}
                bar={bar}
                notice={
                    <>
                        You’re trying this design. Your words stay on this device for a day; photos
                        you add disappear if you refresh. Buy to keep them for good.
                    </>
                }
            />
            <Dialog open={intro} onOpenChange={setIntro}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <p className="text-xs tracking-[0.25em] text-gold-deep uppercase">
                            Try before you buy
                        </p>
                        <DialogTitle className="font-display text-3xl font-normal">
                            Make {data.template.name} yours, just to see
                        </DialogTitle>
                        <DialogDescription className="sr-only">How trying works</DialogDescription>
                    </DialogHeader>
                    <ul className="space-y-2.5 text-sm text-ink/80">
                        {[
                            'This is only a try-out. Nothing is sent or shared.',
                            'Your words stay on this device for a day, and go into your invitation if you buy.',
                            'Photos are kept only after buying. Ones you add here disappear when you refresh.',
                        ].map((line) => (
                            <li key={line} className="flex gap-2.5">
                                <Sparkles className="mt-0.5 size-4 shrink-0 text-gold" />
                                {line}
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col gap-2 pt-2">
                        <Button
                            size="lg"
                            onClick={() => {
                                setIntro(false);
                            }}
                        >
                            Start trying
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link to="/collections">Not now, go back</Link>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {buying && (
                <BuyDialog
                    data={data}
                    draft={draft}
                    files={files}
                    onClose={() => {
                        setBuying(false);
                    }}
                    onBought={() => {
                        writeSaved(slug, null);
                    }}
                />
            )}
        </ShopShell>
    );
}

interface BuyDialogProps {
    data: TryTemplate;
    draft: Draft;
    files: RefObject<Map<string, File>>;
    onClose: () => void;
    onBought: () => void;
}

type BuyStep = 'loading' | 'signin' | 'review' | 'working';

// Sign in (if needed) → review → buy: the order is made, photos uploaded, payment taken.
function BuyDialog({ data, draft, files, onClose, onBought }: BuyDialogProps) {
    const navigate = useNavigate();
    const client = useQueryClient();
    const meQuery = useQuery({
        queryKey: ['me'],
        queryFn: () => api<Me>('/store/me'),
    });
    const [working, setWorking] = useState(false);
    const [progress, setProgress] = useState('');
    const me = meQuery.data;
    const step: BuyStep = working
        ? 'working'
        : meQuery.isPending
          ? 'loading'
          : me
            ? 'review'
            : 'signin';

    const offer = data.offer;
    const price = offer ? formatMoney(offer.price, offer.currency) : '';
    // Every "blob:" photo in the draft was picked in this tab (stored drafts never keep them).
    const photoCount = localPhotos(draft.content).length;

    const buy = async () => {
        setWorking(true);
        const photos = localPhotos(draft.content).filter((url) => files.current.has(url));
        try {
            setProgress('Saving your invitation…');
            const bought = await post<BuyResult>(`/store/me/buy/${data.template.slug}`, {
                content: withoutLocalPhotos(draft.content),
                events: draft.events,
            });
            onBought();
            if (photos.length > 0) {
                const keys = new Map<string, string>();
                for (const [i, url] of photos.entries()) {
                    setProgress(`Uploading photo ${String(i + 1)} of ${String(photos.length)}…`);
                    const file = files.current.get(url);
                    if (!file) continue;
                    keys.set(
                        url,
                        await upload(
                            bought.invitationId,
                            file,
                            `/api/store/me/invitations/${bought.invitationId}/photos`,
                        ),
                    );
                }
                await api(`/store/me/invitations/${bought.invitationId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        content: mapLocalPhotos(draft.content, (url) => keys.get(url)),
                        events: draft.events,
                    }),
                });
            }
            if (me?.payments === 'fake') {
                setProgress('Taking payment…');
                await post(`/store/me/orders/${bought.orderId}/pay`, {});
                toast.success('Paid. Your invitation is yours to keep');
            } else toast.success('Saved. Complete payment to publish');
            void navigate({
                to: '/my/$id',
                params: { id: bought.invitationId },
            });
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Something went wrong');
            setWorking(false);
        }
    };

    const included = offer
        ? [
              `${String(offer.limits.photos)} photos`,
              `${String(offer.limits.events)} ceremonies`,
              ...(offer.limits.hostingMonths
                  ? [`Online for ${String(offer.limits.hostingMonths)} months`]
                  : []),
              'Edit any time until the celebration',
              'Your own link to share on WhatsApp',
          ]
        : [];

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && step !== 'working') onClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <p className="text-xs tracking-[0.25em] text-gold-deep uppercase">
                        {step === 'signin' ? 'One step before paying' : 'Buy & keep'}
                    </p>
                    <DialogTitle className="font-display text-3xl font-normal">
                        {step === 'signin' ? 'Sign in to keep your invitation' : data.template.name}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'signin'
                            ? 'It’s saved to your account, so you can come back and edit it any time. The words you wrote come with you.'
                            : data.template.description ||
                              'Your own invitation, yours to keep and share'}
                    </DialogDescription>
                </DialogHeader>
                {step === 'loading' && (
                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                )}
                {step === 'signin' && (
                    <SignIn
                        onDone={() => {
                            void client.invalidateQueries({ queryKey: ['me'] });
                        }}
                    />
                )}
                {step === 'review' && (
                    <div className="space-y-4">
                        <ul className="space-y-2 text-sm">
                            {included.map((line) => (
                                <li key={line} className="flex gap-2">
                                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                                    {line}
                                </li>
                            ))}
                        </ul>
                        {photoCount > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Your {photoCount} photo{photoCount === 1 ? '' : 's'} will be
                                uploaded with it.
                            </p>
                        )}
                        <div className="flex items-baseline justify-between border-t pt-4">
                            <span className="text-sm text-muted-foreground">Total</span>
                            {offer ? (
                                <PriceTag
                                    price={offer.price}
                                    compare={offer.comparePrice}
                                    off={offer.off}
                                    currency={offer.currency}
                                    tone="light"
                                    className="font-display text-3xl"
                                />
                            ) : null}
                        </div>
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={() => {
                                void buy();
                            }}
                        >
                            Pay {price}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            {me?.payments === 'fake'
                                ? 'Test checkout: no money is taken.'
                                : 'Secure payment by Razorpay.'}{' '}
                            Signed in as {me?.customer.email}
                        </p>
                    </div>
                )}
                {step === 'working' && (
                    <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground">
                        <Loader2 className="size-6 animate-spin" />
                        {progress}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
