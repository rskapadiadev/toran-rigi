import { Check, Loader2 } from 'lucide-react';

import { Panel } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { useAudienceDraft } from '@/shop/guests/drafts';
import { audienceOptions, dayLabel, type GuestList } from '@/shop/guests/model';

interface AudiencePanelProps {
    list: GuestList;
    base: string;
}

export function AudiencePanel({ list, base }: AudiencePanelProps) {
    const draft = useAudienceDraft(list, base);
    const options = audienceOptions(list);
    return (
        <Panel
            title="Who sees what"
            description="A family sees a function that is for everyone, for their side, or for a group they’re in."
            action={
                <Button
                    disabled={!draft.dirty || draft.busy}
                    onClick={() => {
                        void draft.save();
                    }}
                >
                    {draft.busy ? <Loader2 className="animate-spin" /> : <Check />}
                    {draft.dirty ? 'Save' : 'Saved'}
                </Button>
            }
        >
            {list.events.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    Add functions in the editor first.
                </p>
            ) : (
                <ul className="divide-y">
                    {list.events.map((e) => (
                        <li
                            key={e.id}
                            className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[12rem_1fr] sm:items-center"
                        >
                            <div>
                                <p className="text-sm font-medium">{e.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {dayLabel(e.startsAt)}
                                </p>
                            </div>
                            <div
                                role="group"
                                aria-label={`Who ${e.title} is for`}
                                className="flex flex-wrap gap-1.5"
                            >
                                {options.map((o) => {
                                    const on = draft.keys(e.id).includes(o.key);
                                    return (
                                        <Button
                                            key={o.key}
                                            size="sm"
                                            variant={on ? 'default' : 'outline'}
                                            aria-pressed={on}
                                            onClick={() => {
                                                draft.toggle(e.id, o.key);
                                            }}
                                        >
                                            {on && <Check />}
                                            {o.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}
