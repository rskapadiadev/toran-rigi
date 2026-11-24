import { EVERYONE } from '@shared/guests';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useGuestAction } from './actions';
import { audienceOptions, dayLabel, type GuestList } from './model';

interface AudienceProps {
    list: GuestList;
    base: string;
}

const keysOf = (audience: string[] | null) =>
    audience && audience.length > 0 ? audience : [EVERYONE];

export function Audience({ list, base }: AudienceProps) {
    const act = useGuestAction(base);
    const options = audienceOptions(list);
    const [picked, setPicked] = useState<Record<string, string[]>>(() =>
        Object.fromEntries(list.events.map((e) => [e.id, keysOf(e.audience)])),
    );
    const [busy, setBusy] = useState(false);
    const dirty = list.events.some(
        (e) => keysOf(e.audience).join() !== (picked[e.id] ?? [EVERYONE]).join(),
    );

    // Everyone stands alone; picking a family or a group narrows the function to them.
    const toggle = (eventId: string, key: string) => {
        setPicked((all) => {
            const now = all[eventId] ?? [EVERYONE];
            let next: string[];
            if (key === EVERYONE) next = [EVERYONE];
            else if (now.includes(key)) next = now.filter((k) => k !== key);
            else next = [...now.filter((k) => k !== EVERYONE), key];
            return {
                ...all,
                [eventId]: next.length ? next : [EVERYONE],
            };
        });
    };

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
                    const keys = picked[e.id] ?? [EVERYONE];
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
                                                toggle(e.id, o.key);
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
                    disabled={!dirty || busy}
                    onClick={() => {
                        setBusy(true);
                        const audience = Object.fromEntries(
                            Object.entries(picked).map(([id, keys]) => [
                                id,
                                keys.includes(EVERYONE) ? [] : keys,
                            ]),
                        );
                        void act(
                            {
                                path: '/audience',
                                method: 'PUT',
                                body: { audience },
                            },
                            list.live ? 'Saved. Guests see it now' : 'Saved',
                        ).then(() => {
                            setBusy(false);
                        });
                    }}
                >
                    {busy ? <Loader2 className="animate-spin" /> : <Check />}
                    {dirty ? 'Save' : 'Saved'}
                </Button>
            </div>
        </div>
    );
}
