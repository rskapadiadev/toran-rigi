// Done-for-you on the studio's order page: what the customer sent, whose turn it is, and the two
// things only the studio does (ask for more, share the look).
import { MADE_HOURS, MADE_ROUNDS } from '@shared/made';
import { formatMoney } from '@shared/money';
import type { BriefFile, MadeView } from '@shared/schemas/made';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Check,
    Download,
    Eye,
    FileText,
    HelpCircle,
    ImageIcon,
    ImagePlus,
    Loader2,
    Music,
    Wand2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { upload } from '@/admin/editor/PhotosPanel';
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
    // Where their photos go; none until the order has its invitation.
    invitationId: string | null;
    canCreate: boolean;
}

interface Placing {
    done: number;
    of: number;
}

export function MadePanel({ orderId, invitationId, canCreate }: MadePanelProps) {
    const client = useQueryClient();
    const [text, setText] = useState('');
    const [placing, setPlacing] = useState<Placing | null>(null);
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

    // Shrunk in this browser like any photo the editor takes, then put at the end of the gallery.
    const place = async (files: BriefFile[]) => {
        if (!invitationId) return;
        let added = 0;
        setPlacing({
            done: 0,
            of: files.length,
        });
        for (const [i, f] of files.entries()) {
            try {
                const res = await fetch(`/api/admin/orders/${orderId}/made/files/${f.id}`);
                if (!res.ok) throw new Error('It couldn’t be opened');
                const photo = new File([await res.blob()], f.name, { type: f.mime });
                const key = await upload(invitationId, photo);
                await post(`/admin/orders/${orderId}/made/files/${f.id}/placed`, { key });
                added++;
            } catch (e) {
                const heic = f.mime === 'image/heic' || f.mime === 'image/heif';
                toast.error(
                    heic
                        ? `${f.name} is an iPhone HEIC photo this browser can’t read. Try Safari.`
                        : `${f.name}: ${e instanceof Error ? e.message : 'it didn’t go in'}`,
                );
            }
            setPlacing({
                done: i + 1,
                of: files.length,
            });
        }
        setPlacing(null);
        if (added > 0)
            toast.success(
                `${String(added)} photo${added === 1 ? '' : 's'} added to the gallery. Place them in the editor`,
            );
        await client.invalidateQueries({ queryKey: ['order-made', orderId] });
    };

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
    const waiting = made.files.filter((f) => f.kind === 'photo' && !f.inInvitation);
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
                <div className="mt-4">
                    {waiting.length > 0 && invitationId && (
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={placing !== null}
                                onClick={() => {
                                    void place(waiting);
                                }}
                            >
                                {placing ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                                {placing
                                    ? `Adding ${String(placing.done + 1)} of ${String(placing.of)}…`
                                    : `Add ${waiting.length === 1 ? 'the photo' : `all ${String(waiting.length)} photos`} to the invitation`}
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                They go at the end of the gallery. Reload the editor if it’s open.
                            </span>
                        </div>
                    )}
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {made.files.map((f) => {
                            const Icon = kindIcon[f.kind] ?? FileText;
                            return (
                                <li
                                    key={f.id}
                                    className="flex items-center rounded-lg ring-1 ring-foreground/10"
                                >
                                    <a
                                        href={`/api/admin/orders/${orderId}/made/files/${f.id}`}
                                        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                                    >
                                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                                        <span className="min-w-0 flex-1 truncate">{f.name}</span>
                                        <Download className="size-3.5 shrink-0 text-muted-foreground" />
                                    </a>
                                    {f.kind === 'photo' &&
                                        (f.inInvitation ? (
                                            <span
                                                className="flex shrink-0 items-center gap-1 pe-3 text-xs text-success"
                                                title="In the invitation’s gallery"
                                            >
                                                <Check className="size-3.5" />
                                                <span className="max-sm:sr-only">In it</span>
                                            </span>
                                        ) : (
                                            invitationId && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="me-1 size-7 shrink-0"
                                                    aria-label={`Add ${f.name} to the invitation`}
                                                    disabled={placing !== null}
                                                    onClick={() => {
                                                        void place([f]);
                                                    }}
                                                >
                                                    <ImagePlus />
                                                </Button>
                                            )
                                        ))}
                                </li>
                            );
                        })}
                    </ul>
                </div>
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
