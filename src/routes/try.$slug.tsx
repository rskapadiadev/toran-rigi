import { brand } from '@shared/brand';
import { whatsappLink } from '@shared/guests';
import { MADE_HOURS, MADE_NAME, MADE_ROUNDS, madeRequest } from '@shared/made';
import { formatMoney } from '@shared/money';
import type { CheckoutStart } from '@shared/schemas/checkout';
import { applyWording, type Wording } from '@shared/wording/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { type Draft, toDraft } from '@/admin/composer/draft';
import { upload } from '@/admin/editor/PhotosPanel';
import type { Uploader } from '@/admin/editor/uploader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { api, ApiError, post } from '@/lib/api';
import { pay } from '@/shop/checkout';
import { FormEditor } from '@/shop/FormEditor';
import { PriceTag } from '@/shop/landing';
import { localPhotos, mapLocalPhotos, withoutLocalPhotos } from '@/shop/local-photos';
import { PayTerms } from '@/shop/policies/kit';
import { ShopShell } from '@/shop/ShopShell';
import { SignIn } from '@/shop/SignIn';
import type { Me, TryTemplate } from '@/shop/types';

export const Route = createFileRoute('/try/$slug')({
    validateSearch: z.object({ words: z.string().max(80).optional() }),
    // ?words=…: a set from the wording pages, put on this design.
    ssr: false,
    loader: async ({ params, location }) => {
        const { words } = location.search as { words?: string };
        const [template, wording] = await Promise.all([
            api<TryTemplate>(`/store/templates/${params.slug}`),
            // Words that are no longer in the library just aren't used.
            words
                ? api<Wording>(`/wording/${encodeURIComponent(words)}`).catch(() => null)
                : Promise.resolve(null),
        ]);
        return {
            ...template,
            wording,
        };
    },
    head: ({ loaderData }) => ({
        meta: [
            { title: `Try ${loaderData?.template.name ?? 'a design'} · Toran` },
            {
                name: 'robots',
                content: 'noindex',
            },
        ],
    }),
    errorComponent: TryError,
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

// "Not available" only when the design really is gone; anything else gets a reload, never a
// misleading dead end.
function TryError({ error }: { error: unknown }) {
    const missing = error instanceof ApiError && (error.status === 404 || error.status === 409);
    return (
        <ShopShell>
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <h1 className="font-display text-4xl">
                    {missing ? 'This design isn’t available' : 'Something went wrong'}
                </h1>
                {!missing && (
                    <p className="mt-3 text-sm text-muted-foreground">
                        Your words are kept on this device, so reloading won’t lose them.
                    </p>
                )}
                <div className="mt-6 flex justify-center gap-4">
                    {!missing && (
                        <Button
                            className="rounded-full"
                            onClick={() => {
                                window.location.reload();
                            }}
                        >
                            Reload
                        </Button>
                    )}
                    <Link to="/collections" className="self-center text-burgundy underline">
                        See the collection
                    </Link>
                </div>
            </div>
        </ShopShell>
    );
}

function TryPage() {
    const data = Route.useLoaderData();
    const { slug } = Route.useParams();
    const base = data.edit;
    const [saved] = useState(() => readSaved(slug));
    const { wording } = data;
    const navigate = useNavigate();
    const [draft, setDraft] = useState<Draft>(() => {
        const start = saved ?? toDraft(base);
        return wording?.occasion === base.invitation.eventKind
            ? {
                  ...start,
                  content: applyWording(start.content, wording, start.locales),
              }
            : start;
    });
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

    // They are in the draft now: a reload must not put them back over what is typed next.
    useEffect(() => {
        if (wording)
            void navigate({
                to: '/try/$slug',
                params: { slug },
                search: {},
                replace: true,
            });
    }, [wording, navigate, slug]);

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

// Sign in (if needed) → review → pay. Only then is the invitation made and the photos stored.
function BuyDialog({ data, draft, files, onClose, onBought }: BuyDialogProps) {
    const navigate = useNavigate();
    const client = useQueryClient();
    const meQuery = useQuery({
        queryKey: ['me'],
        queryFn: () => api<Me>('/store/me'),
    });
    const [working, setWorking] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState<string | null>(null);
    // Razorpay's own window is on screen: ours steps aside so it can take the keyboard.
    const [paying, setPaying] = useState(false);
    const me = meQuery.data;
    // Spinner only before the first answer; later re-checks keep the sign-in form on screen.
    const step: BuyStep = working
        ? 'working'
        : me
          ? 'review'
          : meQuery.isFetched
            ? 'signin'
            : 'loading';

    const offer = data.offer;
    // Done-for-you: a tick here once payments are on; until then they ask us on WhatsApp.
    const [made, setMade] = useState(false);
    const madeAmount = offer?.madePrice ?? null;
    const madeOn = made && madeAmount !== null;
    const total = offer ? offer.price + (madeOn ? madeAmount : 0) : 0;
    const price = offer ? formatMoney(total, offer.currency) : '';
    // Every "blob:" photo in the draft was picked in this tab (stored drafts never keep them).
    const photoCount = localPhotos(draft.content).length;

    const buy = async () => {
        setWorking(true);
        setError(null);
        const photos = localPhotos(draft.content).filter((url) => files.current.has(url));
        try {
            setProgress('Opening the payment window…');
            const start = await post<CheckoutStart>(`/store/me/checkout/${data.template.slug}`, {
                content: withoutLocalPhotos(draft.content),
                events: draft.events,
                made: madeOn,
            });
            const { invitationId } = await pay({
                start,
                description: `${data.template.name} invitation${madeOn ? `, ${MADE_NAME.toLowerCase()}` : ''}`,
                onConfirming: () => {
                    setPaying(false);
                    setProgress('Confirming your payment…');
                },
                onWindow: () => {
                    setPaying(true);
                },
            });
            if (!invitationId) throw new Error('Your invitation is on its way to My invitations.');
            onBought();
            await keepPhotos(invitationId, photos);
            toast.success(
                madeOn
                    ? 'Paid. Now send us your details'
                    : 'Paid. Your invitation is yours to keep',
            );
            void navigate({
                to: madeOn ? '/my/$id/made' : '/my/$id',
                params: { id: invitationId },
            });
        } catch (e) {
            setPaying(false);
            setError(e instanceof Error ? e.message : 'Something went wrong');
            setWorking(false);
        }
    };

    // Photos picked while trying live in this tab; they can be stored now that the invitation exists.
    const keepPhotos = async (invitationId: string, photos: string[]) => {
        if (photos.length === 0) return;
        const keys = new Map<string, string>();
        for (const [i, url] of photos.entries()) {
            setProgress(`Uploading photo ${String(i + 1)} of ${String(photos.length)}…`);
            const file = files.current.get(url);
            if (!file) continue;
            // One photo that won't upload mustn't hide an invitation that is paid for.
            const key = await upload(
                invitationId,
                file,
                `/api/store/me/invitations/${invitationId}/photos`,
            ).catch(() => undefined);
            if (key) keys.set(url, key);
        }
        if (keys.size < photos.length)
            toast.error('Some photos didn’t upload. You can add them again in your invitation.');
        await api(`/store/me/invitations/${invitationId}`, {
            method: 'PUT',
            body: JSON.stringify({
                content: mapLocalPhotos(draft.content, (url) => keys.get(url)),
                events: draft.events,
            }),
        }).catch(() => undefined);
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
            open={!paying}
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
                        {madeAmount !== null && offer && me?.payments !== 'off' && (
                            <label
                                htmlFor="made"
                                className="flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary/[0.03]"
                            >
                                <Checkbox
                                    id="made"
                                    checked={made}
                                    onCheckedChange={(v) => {
                                        setMade(v === true);
                                    }}
                                    className="mt-0.5"
                                />
                                <span className="grid gap-0.5 text-sm">
                                    <span className="flex justify-between gap-3 font-medium">
                                        {MADE_NAME}
                                        <span className="tabular-nums">
                                            +{formatMoney(madeAmount, offer.currency)}
                                        </span>
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Send us your details and our studio sets it all. First look
                                        within {String(MADE_HOURS)} hours, {String(MADE_ROUNDS)}{' '}
                                        rounds of changes.
                                    </span>
                                </span>
                            </label>
                        )}
                        {madeAmount !== null && me?.payments === 'off' && (
                            <p className="text-sm text-muted-foreground">
                                Rather have us make it?{' '}
                                <a
                                    href={whatsappLink(
                                        brand.whatsapp,
                                        madeRequest(data.template.name),
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-foreground underline underline-offset-2"
                                >
                                    Ask us on WhatsApp
                                </a>
                            </p>
                        )}
                        <div className="flex items-baseline justify-between border-t pt-4">
                            <span className="text-sm text-muted-foreground">Total</span>
                            {offer && (
                                <span className="inline-flex items-baseline gap-2 font-display text-3xl text-ink">
                                    {offer.comparePrice !== null && !madeOn && (
                                        <s className="text-[0.6em] text-muted-foreground">
                                            <span className="sr-only">Was </span>
                                            {formatMoney(offer.comparePrice, offer.currency)}
                                        </s>
                                    )}
                                    {price}
                                </span>
                            )}
                        </div>
                        {error && (
                            <p role="alert" className="text-sm text-destructive">
                                {error}
                            </p>
                        )}
                        <Button
                            size="lg"
                            className="w-full"
                            disabled={!offer || me?.payments === 'off'}
                            onClick={() => {
                                void buy();
                            }}
                        >
                            Pay {price}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            {me?.payments === 'fake'
                                ? 'Test checkout: no money is taken.'
                                : me?.payments === 'off'
                                  ? 'Online payment opens soon. Your words stay on this device for a day.'
                                  : 'Secure payment by Razorpay: UPI, cards and net banking.'}{' '}
                            Signed in as {me?.customer.email}
                        </p>
                        <PayTerms className="text-center text-xs text-muted-foreground" />
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
