// "Choose from the wording library": ready words for this occasion and tradition, put into the
// headline, welcome and closing. One step to undo.
import { localeNames } from '@shared/locales';
import {
    applyWording,
    type Wording,
    wordingLocales,
    wordingStyleLabel,
} from '@shared/wording/types';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { api } from '@/lib/api';

import type { Draft } from './draft';

interface WordingPickerProps {
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
}

const nameOf = (l: string) => localeNames[l as keyof typeof localeNames];

export function WordingPicker({ draft, set }: WordingPickerProps) {
    const [open, setOpen] = useState(false);
    const { occasion, culture } = draft;
    const library = useQuery({
        queryKey: ['wording', occasion, culture],
        queryFn: () =>
            api<Wording[]>(
                `/wording?${new URLSearchParams({
                    occasion,
                    culture,
                }).toString()}`,
            ),
        enabled: open,
        staleTime: Infinity,
    });

    const use = (words: Wording) => {
        const { headline, welcome, closing } = draft.content;
        set((d) => ({
            ...d,
            content: applyWording(d.content, words, d.locales),
        }));
        setOpen(false);
        toast.success(`“${words.name}” added`, {
            action: {
                label: 'Undo',
                onClick: () => {
                    set((d) => ({
                        ...d,
                        content: {
                            ...d.content,
                            headline,
                            welcome,
                            closing,
                        },
                    }));
                },
            },
        });
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                    setOpen(true);
                }}
            >
                <BookOpen /> Choose from the wording library
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="w-full gap-0 sm:max-w-md">
                    <SheetHeader className="border-b">
                        <SheetTitle>Wording library</SheetTitle>
                        <SheetDescription>
                            Fills your headline, welcome and closing. Change any word after.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        {library.isPending && (
                            <Loader2 className="mx-auto mt-8 size-5 animate-spin text-muted-foreground" />
                        )}
                        {library.error && (
                            <p className="text-sm text-destructive">{library.error.message}</p>
                        )}
                        {library.data?.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No ready words for this occasion yet.
                            </p>
                        )}
                        <ul className="space-y-3">
                            {library.data?.map((words) => (
                                <WordingOption
                                    key={words.id}
                                    words={words}
                                    locales={draft.locales}
                                    onUse={() => {
                                        use(words);
                                    }}
                                />
                            ))}
                        </ul>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

interface OptionProps {
    words: Wording;
    locales: readonly string[];
    onUse: () => void;
}

function WordingOption({ words, locales, onUse }: OptionProps) {
    const has = wordingLocales(words);
    // Read it in the invitation's first language that has it.
    const shown = locales.find((l) => has.includes(l)) ?? 'en';
    const kept = locales.filter((l) => !has.includes(l));
    const usable = locales.some((l) => has.includes(l));
    return (
        <li className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{words.name}</p>
                <Badge variant="muted">{wordingStyleLabel[words.style]}</Badge>
            </div>
            <div lang={shown} className="space-y-1 text-sm">
                <p>{words.headline[shown]}</p>
                <p className="text-muted-foreground">{words.welcome[shown]}</p>
                <p className="text-muted-foreground italic">{words.closing[shown]}</p>
            </div>
            {usable && kept.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    Not in {kept.map(nameOf).join(', ')}: those words stay as they are.
                </p>
            )}
            <Button type="button" size="sm" variant="outline" disabled={!usable} onClick={onUse}>
                {usable ? 'Use these words' : 'Not in this invitation’s language'}
            </Button>
        </li>
    );
}
