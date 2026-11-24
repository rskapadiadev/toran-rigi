// A version of the invitation for each family: its own person's name first, and its own words where
// they differ. The preview beside the form follows the version being edited.
import { type FamilyText, familyTexts } from '@shared/families';
import { type Side, sides } from '@shared/guests';
import { localeNames } from '@shared/locales';
import { peopleOf } from '@shared/people';
import { useId, useState } from 'react';

import type { Draft } from '@/admin/composer/draft';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { firstName } from './guests/model';

interface FamilyVersionsProps {
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
    // The version in the preview; null is the one everyone else sees.
    side: Side | null;
    onSide: (side: Side | null) => void;
    // Words only for sections this design shows.
    texts: readonly FamilyText[];
}

const labels: Record<FamilyText, string> = {
    welcome: 'Their welcome',
    family: 'Their family',
    closing: 'Their closing line',
};

const pill = (on: boolean) =>
    cn('rounded-full px-3 py-1.5 text-xs transition', on ? 'bg-ink text-ivory' : 'text-ink/80');

export function FamilyVersions({ draft, set, side, onSide, texts }: FamilyVersionsProps) {
    const [picked, setLocale] = useState(draft.locales[0] ?? 'en');
    const locale = draft.locales.includes(picked) ? picked : (draft.locales[0] ?? 'en');
    const switchId = useId();
    const families = draft.content.families;
    const people = peopleOf(draft.content);
    const nameOf = (s: Side) => {
        const name = people[s]?.name;
        return firstName(name?.[locale] ?? name?.en ?? '') || (s === 'one' ? 'First' : 'Second');
    };

    const setFamilies = (patch: Partial<NonNullable<typeof families>>) => {
        set((d) => ({
            ...d,
            content: {
                ...d.content,
                families: {
                    enabled: false,
                    ...d.content.families,
                    ...patch,
                },
            },
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <Label htmlFor={switchId} className="block text-sm leading-snug font-normal">
                    Each family’s links open with their own person’s name first. Your main link
                    stays as it is.
                </Label>
                <Switch
                    id={switchId}
                    checked={families?.enabled ?? false}
                    onCheckedChange={(enabled) => {
                        setFamilies({ enabled });
                        onSide(enabled ? 'one' : null);
                    }}
                />
            </div>
            {families?.enabled && (
                <>
                    <div
                        role="group"
                        aria-label="Version"
                        className="flex flex-wrap gap-1 rounded-full bg-black/5 p-1"
                    >
                        {sides.map((s) => (
                            <button
                                key={s}
                                type="button"
                                aria-pressed={side === s}
                                className={cn('flex-1', pill(side === s))}
                                onClick={() => {
                                    onSide(s);
                                }}
                            >
                                {nameOf(s)}’s family
                            </button>
                        ))}
                        <button
                            type="button"
                            aria-pressed={side === null}
                            className={cn('flex-1', pill(side === null))}
                            onClick={() => {
                                onSide(null);
                            }}
                        >
                            Main link
                        </button>
                    </div>
                    {side === null ? (
                        <p className="text-xs text-muted-foreground">
                            The words above are the ones on your main link.
                        </p>
                    ) : (
                        <>
                            {draft.locales.length > 1 && (
                                <div
                                    role="group"
                                    aria-label="Editing language"
                                    className="flex gap-1 rounded-full bg-black/5 p-1"
                                >
                                    {draft.locales.map((l) => (
                                        <button
                                            key={l}
                                            type="button"
                                            aria-pressed={l === locale}
                                            className={cn('flex-1', pill(l === locale))}
                                            onClick={() => {
                                                setLocale(l);
                                            }}
                                        >
                                            {localeNames[l as keyof typeof localeNames]}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {familyTexts
                                .filter((key) => texts.includes(key))
                                .map((key) => (
                                    <FamilyTextField
                                        key={`${side}.${key}`}
                                        label={labels[key]}
                                        shared={draft.content[key]?.[locale] ?? ''}
                                        value={families[side]?.[key]?.[locale] ?? ''}
                                        onChange={(text) => {
                                            const own = families[side];
                                            setFamilies({
                                                [side]: {
                                                    ...own,
                                                    [key]: {
                                                        ...own?.[key],
                                                        [locale]: text,
                                                    },
                                                },
                                            });
                                        }}
                                    />
                                ))}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

interface FamilyTextFieldProps {
    label: string;
    // What this family sees until it writes its own.
    shared: string;
    value: string;
    onChange: (text: string) => void;
}

function FamilyTextField({ label, shared, value, onChange }: FamilyTextFieldProps) {
    const id = useId();
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Textarea
                id={id}
                rows={3}
                dir="auto"
                value={value}
                placeholder={shared}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
            />
            <p className="text-xs text-muted-foreground">Leave it empty to use the same words.</p>
        </div>
    );
}
