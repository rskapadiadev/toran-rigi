import { sides } from '@shared/guests';
import { Check, Loader2 } from 'lucide-react';
import { useId } from 'react';

import { FormField } from '@/admin/kit/form';
import { Panel, ToneBadge } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { answerOf, useReplyDraft } from '@/shop/guests/drafts';
import { foodLabel, type GuestList, sideLabel, whenLabel } from '@/shop/guests/model';

interface RepliesPanelProps {
    list: GuestList;
    base: string;
    // The couple looking at their own settings.
    own?: boolean;
}

export function ReplyList({ list }: Pick<RepliesPanelProps, 'list'>) {
    return (
        <Panel title="Every reply" description="Newest first. A family’s latest reply is counted.">
            {list.rsvps.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No replies yet.</p>
            ) : (
                <ul className="divide-y">
                    {list.rsvps.map((r) => {
                        const answer = answerOf(list.events, r);
                        return (
                            <li key={r.id} className="space-y-1 py-3 text-sm first:pt-0 last:pb-0">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-medium">
                                        {r.guestName ?? r.name}
                                        {r.guestName && r.guestName !== r.name && (
                                            <span className="ms-1.5 text-xs font-normal text-muted-foreground">
                                                · {r.name}
                                            </span>
                                        )}
                                    </span>
                                    <ToneBadge tone={r.attending ? 'success' : 'danger'}>
                                        {r.attending ? 'Coming' : 'Can’t come'}
                                    </ToneBadge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {[
                                        answer ||
                                            (r.attending ? `${String(r.guestCount)} coming` : ''),
                                        r.dietary ? foodLabel(r.dietary) : '',
                                        r.phone,
                                        r.manual ? 'Added by hand' : '',
                                        whenLabel(r.createdAt),
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>
                                {r.message && (
                                    <p className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs italic">
                                        “{r.message}”
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </Panel>
    );
}

export function ReplySettingsPanel({ list, base, own = false }: RepliesPanelProps) {
    const { form, set, setSide, save, busy, dirty, example } = useReplyDraft(list, base);
    const onId = useId();
    return (
        <Panel
            title="Reply settings"
            description={
                own
                    ? 'How guests reply, and the words you send.'
                    : 'The couple can change these on their own Guests page too.'
            }
            action={
                <Button
                    disabled={!dirty || busy}
                    onClick={() => {
                        void save();
                    }}
                >
                    {busy ? <Loader2 className="animate-spin" /> : <Check />}
                    {dirty ? 'Save' : 'Saved'}
                </Button>
            }
            contentClassName="space-y-4"
        >
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={onId}>Ask guests to reply</Label>
                <Switch
                    id={onId}
                    checked={form.enabled}
                    onCheckedChange={(enabled) => {
                        set({ enabled });
                    }}
                />
            </div>
            {form.enabled && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="WhatsApp for replies">
                        {(id) => (
                            <Input
                                id={id}
                                type="tel"
                                dir="ltr"
                                maxLength={32}
                                value={form.whatsapp}
                                placeholder="+91 98765 43210"
                                onChange={(e) => {
                                    set({ whatsapp: e.target.value });
                                }}
                            />
                        )}
                    </FormField>
                    <FormField label="Reply by">
                        {(id) => (
                            <Input
                                id={id}
                                type="date"
                                value={form.by}
                                onChange={(e) => {
                                    set({ by: e.target.value });
                                }}
                            />
                        )}
                    </FormField>
                    {list.names.two &&
                        sides.map((s) => {
                            const own = form.sides[s];
                            return (
                                <div key={s} className="space-y-3 rounded-lg border p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <Label htmlFor={`${onId}-${s}`}>
                                            {sideLabel(list, s)}’s guests reply
                                        </Label>
                                        <Switch
                                            id={`${onId}-${s}`}
                                            checked={own.enabled}
                                            onCheckedChange={(enabled) => {
                                                setSide(s, {
                                                    ...own,
                                                    enabled,
                                                });
                                            }}
                                        />
                                    </div>
                                    {own.enabled && (
                                        <FormField label={`${sideLabel(list, s)}’s WhatsApp`}>
                                            {(id) => (
                                                <Input
                                                    id={id}
                                                    type="tel"
                                                    dir="ltr"
                                                    maxLength={32}
                                                    value={own.whatsapp}
                                                    placeholder="Same as above"
                                                    onChange={(e) => {
                                                        setSide(s, {
                                                            ...own,
                                                            whatsapp: e.target.value,
                                                        });
                                                    }}
                                                />
                                            )}
                                        </FormField>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}
            <FormField
                label="The message sent with each link"
                description="{name} becomes the family’s name and {link} their link."
            >
                {(id) => (
                    <Textarea
                        id={id}
                        rows={3}
                        maxLength={1000}
                        value={form.message}
                        placeholder={list.defaults.message}
                        onChange={(e) => {
                            set({ message: e.target.value });
                        }}
                    />
                )}
            </FormField>
            <p className="rounded-md bg-muted/50 px-2.5 py-2 text-xs whitespace-pre-line text-muted-foreground">
                {example}
            </p>
            {form.enabled && (
                <FormField label="The reminder">
                    {(id) => (
                        <Textarea
                            id={id}
                            rows={3}
                            maxLength={1000}
                            value={form.reminder}
                            placeholder={list.defaults.reminder}
                            onChange={(e) => {
                                set({ reminder: e.target.value });
                            }}
                        />
                    )}
                </FormField>
            )}
        </Panel>
    );
}
