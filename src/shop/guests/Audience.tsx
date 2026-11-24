import { Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useAudienceDraft } from './drafts';
import { audienceOptions, dayLabel, type GuestList } from './model';

interface AudienceProps {
    list: GuestList;
    base: string;
}

export function Audience({ list, base }: AudienceProps) {
    const draft = useAudienceDraft(list, base);
    const options = audienceOptions(list);

    if (list.events.length === 0)
        return (
            <p className="rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Add your functions in the editor first.
            </p>
        );

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Pick who each function is for. A family sees a function when it’s for everyone, for
                their family’s guests, or for a group they’re in.
            </p>
            <ul className="divide-y rounded-2xl border bg-card">
                {list.events.map((e) => {
                    const keys = draft.keys(e.id);
                    return (
                        <li key={e.id} className="space-y-2 p-4">
                            <p className="font-medium text-ink">
                                {e.title}{' '}
                                <span className="text-xs font-normal text-muted-foreground">
                                    {dayLabel(e.startsAt)}
                                </span>
                            </p>
                            <div
                                className="flex flex-wrap gap-1.5"
                                role="group"
                                aria-label={`Who ${e.title} is for`}
                            >
                                {options.map((o) => {
                                    const on = keys.includes(o.key);
                                    return (
                                        <button
                                            key={o.key}
                                            type="button"
                                            aria-pressed={on}
                                            onClick={() => {
                                                draft.toggle(e.id, o.key);
                                            }}
                                            className={cn(
                                                'flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition',
                                                on
                                                    ? 'border-burgundy bg-burgundy text-ivory'
                                                    : 'text-ink/80 hover:bg-black/5',
                                            )}
                                        >
                                            {on && <Check className="size-3" />}
                                            {o.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </li>
                    );
                })}
            </ul>
            {options.length <= 1 && (
                <p className="text-xs text-muted-foreground">
                    Make a group like Close family on the Links tab to keep a function just for
                    them.
                </p>
            )}
            <div className="flex justify-end">
                <Button
                    className="rounded-full"
                    disabled={!draft.dirty || draft.busy}
                    onClick={() => {
                        void draft.save();
                    }}
                >
                    {draft.busy ? <Loader2 className="animate-spin" /> : <Check />}
                    {draft.dirty ? 'Save' : 'Saved'}
                </Button>
            </div>
        </div>
    );
}
