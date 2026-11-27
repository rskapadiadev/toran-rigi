// Done-for-you on the studio's order page: what the customer sent, whose turn it is, and the two
// things only the studio does (ask for more, share the look).
import { MADE_HOURS, MADE_ROUNDS } from '@shared/made';
import { formatMoney } from '@shared/money';
import type { MadeView } from '@shared/schemas/made';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Eye, FileText, HelpCircle, ImageIcon, Music, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { FormField } from '@/admin/kit/form';
import { Panel, ToneBadge } from '@/admin/kit/page';
import type { Tone } from '@/admin/labels';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api, post } from '@/lib/api';

interface StudioMade extends MadeView {
    canAdd: boolean;
    price: number | null;
}

interface StageLabel {
    label: string;
    tone: Tone;
}

const stageLabels: Record<MadeView['stage'], StageLabel> = {
    details: {
        label: 'Waiting for their details',
        tone: 'warning',
    },
    making: {
        label: 'Ours: first look due',
        tone: 'violet',
    },
    changes: {
        label: 'Ours: changes asked for',
        tone: 'danger',
    },
    look: {
        label: 'With the customer',
        tone: 'info',
    },
    done: {
        label: 'Done',
        tone: 'success',
    },
};

const fields = [
    ['names', 'Names'],
    ['functions', 'Ceremonies'],
    ['families', 'Family'],
    ['words', 'Words'],
    ['languages', 'Languages'],
    ['notes', 'Anything else'],
] as const;

const kindIcon: Partial<Record<string, typeof FileText>> = {
    photo: ImageIcon,
    music: Music,
    document: FileText,
};

interface MadePanelProps {
    orderId: string;
    canCreate: boolean;
}

export function MadePanel({ orderId, canCreate }: MadePanelProps) {
    const client = useQueryClient();
    const [text, setText] = useState('');
    const { data: made } = useQuery({
        queryKey: ['order-made', orderId],
        queryFn: () => api<StudioMade>(`/admin/orders/${orderId}/made`),
    });
    const done = async (message: string) => {
        toast.success(message);
        setText('');
        await client.invalidateQueries();
    };
    const failed = (e: Error) => toast.error(e.message);
    const add = useMutation({
        mutationFn: () => post(`/admin/orders/${orderId}/made`, {}),
        onSuccess: () => done('Added, with its own bill'),
        onError: failed,
    });
    const share = useMutation({
        mutationFn: () => post(`/admin/orders/${orderId}/made/look`, { text }),
        onSuccess: () => done('Shared. The customer has an email'),
        onError: failed,
    });
    const ask = useMutation({
        mutationFn: () => post(`/admin/orders/${orderId}/made/details`, { text }),
        onSuccess: () => done('Asked. The clock stops until they send it'),
        onError: failed,
    });

    if (!made) return null;
    if (!made.made)
        return made.canAdd && canCreate && made.price !== null ? (
            <Panel title="Done-for-you" icon={Wand2}>
                <p className="text-sm text-muted-foreground">
                    The customer asked us to make it? Add it on its own bill of{' '}
                    {formatMoney(made.price, made.currency)}; they send their details once it’s
                    paid.
                </p>
                <Button
                    variant="outline"
                    className="mt-3"
                    disabled={add.isPending}
                    onClick={() => {
                        add.mutate();
                    }}
                >
                    <Wand2 /> Add done-for-you
                </Button>
            </Panel>
        ) : null;

    const stage = stageLabels[made.stage];
    const ours = made.stage === 'making' || made.stage === 'changes';
    const lastAsk = made.messages.filter((m) => m.from === 'customer').at(-1);
    return (
        <Panel
            title="Done-for-you"
            icon={Wand2}
            description={`First look within ${String(MADE_HOURS)} hours of their details · ${String(MADE_ROUNDS - made.roundsLeft)} of ${String(MADE_ROUNDS)} rounds used`}
            action={<ToneBadge tone={stage.tone}>{stage.label}</ToneBadge>}
        >
            {!made.paid && (
                <p className="mb-4 rounded-lg bg-warning/10 px-3 py-2 text-sm ring-1 ring-warning/30">
                    Not paid yet: the customer can send details once something is paid.
                </p>
            )}
            {made.stage === 'changes' && lastAsk && (
                <div className="mb-4 rounded-lg bg-destructive/5 px-3 py-2.5 text-sm ring-1 ring-destructive/20">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                        What they asked for
                    </p>
                    <p className="whitespace-pre-line">{lastAsk.text}</p>
                </div>
            )}
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {fields.map(([key, label]) => (
                    <div
                        key={key}
                        className={key === 'functions' || key === 'notes' ? 'sm:col-span-2' : ''}
                    >
                        <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            {label}
                        </dt>
                        <dd className="mt-0.5 whitespace-pre-line">
                            {made.brief[key] || <span className="text-muted-foreground">—</span>}
                        </dd>
                    </div>
                ))}
            </dl>
            {made.files.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {made.files.map((f) => {
                        const Icon = kindIcon[f.kind] ?? FileText;
                        return (
                            <li key={f.id}>
                                <a
                                    href={`/api/admin/orders/${orderId}/made/files/${f.id}`}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10 hover:bg-muted"
                                >
                                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                                    <Download className="size-3.5 shrink-0 text-muted-foreground" />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            )}
            {ours && (
                <div className="mt-5 space-y-3 border-t pt-4">
                    <FormField
                        label="Message to the customer (optional)"
                        description="Sent with the look, or as your question. They get an email to come and read it."
                    >
                        {(fieldId) => (
                            <Textarea
                                id={fieldId}
                                rows={2}
                                value={text}
                                maxLength={2000}
                                className="resize-none"
                                onChange={(e) => {
                                    setText(e.target.value);
                                }}
                            />
                        )}
                    </FormField>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            disabled={share.isPending}
                            onClick={() => {
                                share.mutate();
                            }}
                        >
                            <Eye />{' '}
                            {made.stage === 'changes' ? 'Share the changes' : 'Share first look'}
                        </Button>
                        {made.stage === 'making' && (
                            <Button
                                variant="outline"
                                disabled={ask.isPending || !text.trim()}
                                onClick={() => {
                                    ask.mutate();
                                }}
                            >
                                <HelpCircle /> Ask for more details
                            </Button>
                        )}
                    </div>
                </div>
            )}
            {made.stage === 'details' && made.paid && (
                <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">
                    Details came on WhatsApp instead? Move the order to Ready to start and the{' '}
                    {String(MADE_HOURS)} hours begin.
                </p>
            )}
        </Panel>
    );
}
