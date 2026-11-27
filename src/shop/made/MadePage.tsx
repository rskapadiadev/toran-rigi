// The customer's side of a done-for-you invitation: send details, wait for the first look, then
// publish or ask for changes. One clear thing to do at each step.
import { brand } from '@shared/brand';
import { whatsappLink } from '@shared/guests';
import { MADE_HOURS, MADE_NAME, MADE_ROUNDS, madeRequest, type MadeStage } from '@shared/made';
import { formatMoney } from '@shared/money';
import type { CheckoutStart } from '@shared/schemas/checkout';
import type { MyMadeView } from '@shared/schemas/made';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
    Check,
    Clock,
    ExternalLink,
    Eye,
    Loader2,
    MessageCircle,
    PenLine,
    Rocket,
    Wand2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { FormField } from '@/admin/kit/form';
import { Panel } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { post } from '@/lib/api';
import { cn } from '@/lib/utils';
import { pay } from '@/shop/checkout';
import { PayTerms } from '@/shop/policies/kit';
import { PayButton } from '@/shop/portal/WaitingPayments';

import { BriefForm } from './BriefForm';
import { askChanges, useMadeAction } from './data';

const when = (iso: string) =>
    new Date(iso).toLocaleString('en', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
    });

interface Step {
    title: string;
    stages: MadeStage[];
}

const steps: Step[] = [
    {
        title: 'You send your details',
        stages: ['details'],
    },
    {
        title: `We make it in ${String(MADE_HOURS)} hours`,
        stages: ['making'],
    },
    {
        title: 'Your first look',
        stages: ['look', 'changes'],
    },
    {
        title: 'You publish it',
        stages: ['done'],
    },
];

function Steps({ stage }: { stage: MadeStage }) {
    const at = steps.findIndex((s) => s.stages.includes(stage));
    return (
        <ol className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {steps.map((step, i) => (
                <li
                    key={step.title}
                    aria-current={i === at ? 'step' : undefined}
                    className={cn(
                        'flex items-center gap-2.5 rounded-xl bg-card px-3 py-2.5 text-sm ring-1 ring-foreground/10',
                        i === at && 'ring-2 ring-primary',
                    )}
                >
                    <span
                        className={cn(
                            'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                            i < at || stage === 'done'
                                ? 'bg-success/15 text-success'
                                : i === at
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground',
                        )}
                    >
                        {i < at || stage === 'done' ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className={cn(i > at && 'text-muted-foreground')}>{step.title}</span>
                </li>
            ))}
        </ol>
    );
}

// The studio's words to them: what was asked for, and what came with each look.
function Messages({ view }: { view: MyMadeView }) {
    if (view.messages.length === 0) return null;
    return (
        <Panel title="Between you and us" icon={MessageCircle} className="mt-4">
            <ol className="space-y-3">
                {view.messages.map((m) => (
                    <li
                        key={m.id}
                        className={cn(
                            'max-w-xl rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-line',
                            m.from === 'studio'
                                ? 'bg-primary/8'
                                : 'ms-auto bg-muted text-foreground/90',
                        )}
                    >
                        <p className="mb-1 text-xs text-muted-foreground">
                            {m.from === 'studio' ? 'Toran studio' : 'You'} · {when(m.at)}
                        </p>
                        {m.text}
                    </li>
                ))}
            </ol>
        </Panel>
    );
}

const whatsapp = (text: string) => whatsappLink(brand.whatsapp, text);

interface OfferProps {
    id: string;
    view: MyMadeView;
}

// Not bought with it: what it is, and a way to add it while the invitation isn't live.
function Offer({ id, view }: OfferProps) {
    const client = useQueryClient();
    const buy = useMutation({
        mutationFn: async () => {
            const start = await post<CheckoutStart>(
                `/store/me/invitations/${id}/made/checkout`,
                {},
            );
            return pay({
                start,
                description: MADE_NAME,
                onConfirming: () => {
                    toast.info('Confirming your payment…');
                },
            });
        },
        onSuccess: async () => {
            toast.success('Paid. Now send us your details');
            await client.invalidateQueries();
        },
        onError: (e) => toast.error(e.message),
    });
    if (view.price === null)
        return (
            <Panel title="We make it for you">
                <p className="text-sm text-muted-foreground">
                    Our studio can only make an invitation before it goes live. For changes to a
                    live one, message us on WhatsApp.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                    <a href={whatsapp(madeRequest())} target="_blank" rel="noreferrer">
                        <MessageCircle /> Message us
                    </a>
                </Button>
            </Panel>
        );
    return (
        <Panel
            title="Rather have us make it?"
            icon={Wand2}
            description="Send us your details or a photo of your printed card, and our studio makes your invitation for you."
        >
            <ul className="space-y-2 text-sm">
                {[
                    `Your first look within ${String(MADE_HOURS)} hours of your details`,
                    `${String(MADE_ROUNDS)} rounds of changes`,
                    'Your words, photos, ceremonies and languages, set by us',
                ].map((line) => (
                    <li key={line} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        {line}
                    </li>
                ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3">
                {view.payments === 'off' ? (
                    <Button asChild>
                        <a href={whatsapp(madeRequest())} target="_blank" rel="noreferrer">
                            <MessageCircle /> Ask us on WhatsApp
                        </a>
                    </Button>
                ) : (
                    <Button
                        disabled={buy.isPending}
                        onClick={() => {
                            buy.mutate();
                        }}
                    >
                        {buy.isPending && <Loader2 className="animate-spin" />}
                        Add it for {formatMoney(view.price, view.currency)}
                    </Button>
                )}
                <span className="text-sm text-muted-foreground">
                    Paid once, on top of your design
                </span>
            </div>
            {view.payments !== 'off' && <PayTerms className="mt-3 text-xs text-muted-foreground" />}
        </Panel>
    );
}

interface LookProps {
    id: string;
    view: MyMadeView;
}

function Look({ id, view }: LookProps) {
    const client = useQueryClient();
    const [text, setText] = useState('');
    const changes = useMadeAction(id, askChanges);
    const publish = useMutation({
        mutationFn: () => post(`/store/me/invitations/${id}/publish`, {}),
        onSuccess: async () => {
            toast.success('Published! Share your link');
            await client.invalidateQueries();
        },
        onError: (e) => toast.error(e.message),
    });
    const preview = view.previewToken ? `/p/${view.previewToken}` : null;
    const frame = {
        width: 375,
        height: 740,
    };
    return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
            <Panel
                title="Your first look"
                icon={Eye}
                description="This is your invitation as guests will see it. Nobody else can open it yet."
                action={
                    preview && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={preview} target="_blank" rel="noreferrer">
                                <ExternalLink /> Open
                            </a>
                        </Button>
                    )
                }
            >
                {preview ? (
                    <div className="flex justify-center rounded-xl bg-muted/60 p-4 max-md:hidden">
                        <iframe
                            src={preview}
                            title="Your invitation"
                            className="rounded-[28px] bg-background ring-8 ring-black"
                            style={frame}
                        />
                    </div>
                ) : null}
                {preview && (
                    <Button className="w-full md:hidden" asChild>
                        <a href={preview} target="_blank" rel="noreferrer">
                            <Eye /> See your invitation
                        </a>
                    </Button>
                )}
            </Panel>
            <div className="space-y-4">
                <Panel title="Love it?" icon={Rocket}>
                    <p className="text-sm text-muted-foreground">
                        Publish to get your link. You can still fix small things yourself in Edit.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                            disabled={publish.isPending || view.balance > 0}
                            onClick={() => {
                                publish.mutate();
                            }}
                        >
                            {publish.isPending && <Loader2 className="animate-spin" />}
                            Publish it
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/my/$id" params={{ id }}>
                                <PenLine /> Edit it myself
                            </Link>
                        </Button>
                    </div>
                    {view.balance > 0 && (
                        <p className="mt-3 text-sm text-muted-foreground">
                            Pay what’s left to publish it.
                        </p>
                    )}
                </Panel>
                <Panel
                    title="Want changes?"
                    description={
                        view.roundsLeft > 0
                            ? `${String(view.roundsLeft)} of ${String(MADE_ROUNDS)} rounds left. Put all your changes in one message.`
                            : 'Your rounds of changes are used. Message us and we’ll tell you the price first.'
                    }
                >
                    {view.roundsLeft > 0 ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                changes.mutate(text, {
                                    onSuccess: () => {
                                        setText('');
                                        toast.success(
                                            'Sent. We’ll write when your changes are ready',
                                        );
                                    },
                                    onError: (err) => toast.error(err.message),
                                });
                            }}
                            className="space-y-3"
                        >
                            <FormField label="What to change">
                                {(fieldId) => (
                                    <Textarea
                                        id={fieldId}
                                        rows={5}
                                        value={text}
                                        maxLength={4000}
                                        placeholder="The Haldi starts at 11, not 10. Please use the second photo on the cover…"
                                        onChange={(e) => {
                                            setText(e.target.value);
                                        }}
                                    />
                                )}
                            </FormField>
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={text.trim().length < 3 || changes.isPending}
                            >
                                {changes.isPending && <Loader2 className="animate-spin" />}
                                Send my changes
                            </Button>
                        </form>
                    ) : (
                        <Button variant="outline" asChild>
                            <a
                                href={whatsapp(
                                    'Hello, I’d like a few more changes to my invitation.',
                                )}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <MessageCircle /> Message us
                            </a>
                        </Button>
                    )}
                </Panel>
            </div>
        </div>
    );
}

interface WaitingProps {
    view: MyMadeView;
    title: string;
    line: string;
}

function Waiting({ view, title, line }: WaitingProps) {
    return (
        <Panel title={title} icon={Clock}>
            <p className="text-sm">{line}</p>
            {view.dueAt && (
                <p className="mt-2 text-sm text-muted-foreground">
                    Expect it by{' '}
                    <span className="font-medium text-foreground">{when(view.dueAt)}</span>. We’ll
                    email you.
                </p>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
                Remembered something? Message us on WhatsApp at {brand.phone}.
            </p>
        </Panel>
    );
}

interface MadePageProps {
    id: string;
    view: MyMadeView;
}

export function MadeBody({ id, view }: MadePageProps) {
    if (!view.made) return <Offer id={id} view={view} />;
    if (!view.paid)
        return (
            <Panel title="Complete payment to begin">
                <p className="text-sm text-muted-foreground">
                    Once it’s paid, send us your details here and we’ll start.
                </p>
                <div className="mt-4">
                    <PayButton
                        order={{
                            id: view.orderId,
                            number: '',
                            currency: view.currency,
                            total: view.balance,
                            balance: view.balance,
                            createdAt: '',
                            item: MADE_NAME,
                            invitationId: id,
                        }}
                        mode={view.payments}
                    />
                </div>
            </Panel>
        );
    return (
        <>
            <Steps stage={view.stage} />
            {view.stage === 'details' && <BriefForm id={id} view={view} />}
            {view.stage === 'making' && (
                <Waiting
                    view={view}
                    title="We’re making your invitation"
                    line="Our studio has everything and is at work on it."
                />
            )}
            {view.stage === 'changes' && (
                <Waiting
                    view={view}
                    title="We’re making your changes"
                    line="We have your list and are working through it."
                />
            )}
            {view.stage === 'look' && <Look id={id} view={view} />}
            {view.stage === 'done' && (
                <Panel title={view.live ? 'Your invitation is live' : 'All done'} icon={Check}>
                    {view.live && view.slug ? (
                        <Button asChild>
                            <a href={`/${view.slug}`} target="_blank" rel="noreferrer">
                                <ExternalLink /> Open it
                            </a>
                        </Button>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nothing more to do here.</p>
                    )}
                </Panel>
            )}
            <Messages view={view} />
        </>
    );
}
