import { sides } from '@shared/guests';
import { Check, Loader2 } from 'lucide-react';
import { useId } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { answerOf, useReplyDraft } from './drafts';
import { type FamilyReplySettings, foodLabel, type GuestList, sideLabel, whenLabel } from './model';

interface RepliesProps {
    list: GuestList;
    base: string;
}

export function Replies({ list, base }: RepliesProps) {
    const { form, set, setSide, save, busy, dirty, example } = useReplyDraft(list, base);
    const ids = {
        on: useId(),
        wa: useId(),
        by: useId(),
        msg: useId(),
        again: useId(),
    };

    return (
        <div className="space-y-8">
            <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Label htmlFor={ids.on} className="font-display text-xl text-ink">
                            Ask guests to reply
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Guests pick how many are coming to each function.
                        </p>
                    </div>
                    <Switch
                        id={ids.on}
                        checked={form.enabled}
                        onCheckedChange={(enabled) => {
                            set({ enabled });
                        }}
                    />
                </div>
                {form.enabled && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor={ids.wa}>Your WhatsApp for replies</Label>
                            <Input
                                id={ids.wa}
                                type="tel"
                                dir="ltr"
                                value={form.whatsapp}
                                maxLength={32}
                                onChange={(e) => {
                                    set({ whatsapp: e.target.value });
                                }}
                                placeholder="+91 98765 43210"
                            />
                            <p className="text-xs text-muted-foreground">
                                After replying, guests can send it to you on WhatsApp too.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor={ids.by}>Reply by</Label>
                            <Input
                                id={ids.by}
                                type="date"
                                value={form.by}
                                onChange={(e) => {
                                    set({ by: e.target.value });
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                A week or two before the first function works well.
                            </p>
                        </div>
                    </div>
                )}
                {form.enabled && list.names.two && (
                    <fieldset className="space-y-3 border-t pt-4">
                        <legend className="sr-only">Replies for each family</legend>
                        <p className="text-sm text-muted-foreground">
                            Each family can take its own replies. Their number shows only to their
                            own guests.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {sides.map((s) => (
                                <FamilyReply
                                    key={s}
                                    label={sideLabel(list, s)}
                                    value={form.sides[s]}
                                    onChange={(own) => {
                                        setSide(s, own);
                                    }}
                                />
                            ))}
                        </div>
                    </fieldset>
                )}
                <div className="space-y-1.5">
                    <Label htmlFor={ids.msg}>The message sent with each family’s link</Label>
                    <Textarea
                        id={ids.msg}
                        rows={3}
                        maxLength={1000}
                        value={form.message}
                        placeholder={list.defaults.message}
                        onChange={(e) => {
                            set({ message: e.target.value });
                        }}
                    />
                    <p className="text-xs text-muted-foreground">
                        {'{name}'} becomes the family’s name and {'{link}'} their link.
                    </p>
                    <p className="rounded-xl bg-[#e7f6e9] p-3 text-sm whitespace-pre-line text-ink">
                        {example}
                    </p>
                </div>
                {form.enabled && (
                    <div className="space-y-1.5">
                        <Label htmlFor={ids.again}>The reminder, when they haven’t replied</Label>
                        <Textarea
                            id={ids.again}
                            rows={3}
                            maxLength={1000}
                            value={form.reminder}
                            placeholder={list.defaults.reminder}
                            onChange={(e) => {
                                set({ reminder: e.target.value });
                            }}
                        />
                    </div>
                )}
                <div className="flex justify-end">
                    <Button
                        className="rounded-full"
                        disabled={!dirty || busy}
                        onClick={() => {
                            void save();
                        }}
                    >
                        {busy ? <Loader2 className="animate-spin" /> : <Check />}
                        {dirty ? 'Save' : 'Saved'}
                    </Button>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="font-display text-2xl text-ink">
                    Every reply{' '}
                    <span className="text-base text-muted-foreground">
                        ({String(list.rsvps.length)})
                    </span>
                </h2>
                {list.rsvps.length === 0 ? (
                    <p className="rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Replies show here the moment a family sends one.
                    </p>
                ) : (
                    <ul className="divide-y rounded-2xl border bg-card">
                        {list.rsvps.map((r) => {
                            const answer = answerOf(list.events, r);
                            return (
                                <li key={r.id} className="space-y-1 p-4">
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <p className="font-medium text-ink">
                                            {r.guestName ?? r.name}
                                            {r.guestName && r.guestName !== r.name && (
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    {' '}
                                                    · {r.name}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {r.manual ? 'Added by you · ' : ''}
                                            {whenLabel(r.createdAt)}
                                        </p>
                                    </div>
                                    <p className={answer ? 'text-sm text-emerald-900' : 'text-sm'}>
                                        {answer || 'Can’t come'}
                                        {r.dietary && ` · ${foodLabel(r.dietary)}`}
                                    </p>
                                    {r.message && (
                                        <p className="text-sm text-muted-foreground italic">
                                            “{r.message}”
                                        </p>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}

interface FamilyReplyProps {
    label: string;
    value: FamilyReplySettings;
    onChange: (value: FamilyReplySettings) => void;
}

function FamilyReply({ label, value, onChange }: FamilyReplyProps) {
    const on = useId();
    const phone = useId();
    return (
        <div className="space-y-3 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={on}>{label}’s guests reply</Label>
                <Switch
                    id={on}
                    checked={value.enabled}
                    onCheckedChange={(enabled) => {
                        onChange({
                            ...value,
                            enabled,
                        });
                    }}
                />
            </div>
            {value.enabled && (
                <div className="space-y-1.5">
                    <Label htmlFor={phone} className="text-xs font-normal">
                        {label}’s WhatsApp
                    </Label>
                    <Input
                        id={phone}
                        type="tel"
                        dir="ltr"
                        maxLength={32}
                        value={value.whatsapp}
                        placeholder="Same as above"
                        onChange={(e) => {
                            onChange({
                                ...value,
                                whatsapp: e.target.value,
                            });
                        }}
                    />
                </div>
            )}
        </div>
    );
}
