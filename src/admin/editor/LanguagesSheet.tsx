// Bottom overlay on the canvas: the selected text in every language of the invitation, side by
// side and editable. Typing in one language re-translates the others (unless typed by hand), and
// each row says whether its text is auto-translated or written by hand.
import { isRtl, localeNames } from '@shared/locales';
import { Languages, Loader2, RefreshCw, X } from 'lucide-react';

import { useAutoTranslateStatus } from '@/admin/composer/autoTranslate';
import type { Draft } from '@/admin/composer/draft';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { TextPath } from '@/invitation/editing';
import { cn } from '@/lib/utils';

import { applyText, draftPath, isLocalized, readText } from './apply-text';
import { textLabel } from './TextStylePanel';

const LONG: TextPath[] = ['welcome', 'story', 'closing', 'family'];

interface Props {
    draft: Draft;
    path: TextPath;
    // The language shown on the canvas right now.
    locale: string;
    set: (update: (d: Draft) => Draft) => void;
    onClose: () => void;
}

const nameOf = (l: string) => (l in localeNames ? localeNames[l as keyof typeof localeNames] : l);

export function LanguagesSheet({ draft, path, locale, set, onClose }: Props) {
    const translate = useAutoTranslateStatus();
    const value = readText(draft, path);
    const long = LONG.includes(path);
    const key = draftPath(path);
    const hand = draft.content.handWritten?.[key] ?? [];

    return (
        <div
            role="dialog"
            aria-label={`${textLabel(path)} in every language`}
            className="pointer-events-auto flex max-h-[min(46svh,440px)] w-[min(680px,calc(100%-2rem))] animate-in flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] ring-1 ring-foreground/10 fade-in slide-in-from-bottom-3"
        >
            <header className="flex h-11 shrink-0 items-center gap-2 border-b ps-4 pe-2">
                <Languages className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-medium">{textLabel(path)}</h2>
                <span className="text-xs text-muted-foreground">
                    {isLocalized(path)
                        ? `${String(draft.locales.length)} language${draft.locales.length === 1 ? '' : 's'}`
                        : 'Same in every language'}
                </span>
                {translate?.busy && (
                    <span className="ms-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" /> Translating…
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="ms-auto"
                    aria-label="Close"
                    onClick={onClose}
                >
                    <X />
                </Button>
            </header>

            <div className="overflow-y-auto p-2">
                {!isLocalized(path) || typeof value === 'string' || value === undefined ? (
                    <div className="space-y-2 p-2">
                        <Input
                            value={typeof value === 'string' ? value : ''}
                            onChange={(e) => {
                                set((d) => applyText(d, path, e.target.value, locale));
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            Venues and addresses are shown as written, in every language.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y">
                        {draft.locales.map((l) => {
                            const text = value[l] ?? '';
                            const own = hand.includes(l);
                            const rtl = isRtl(l);
                            const Field = long ? Textarea : Input;
                            return (
                                <li
                                    key={l}
                                    className={cn(
                                        'grid grid-cols-[112px_1fr] items-start gap-3 rounded-lg px-2 py-2.5',
                                        l === locale && 'bg-muted/50',
                                    )}
                                >
                                    <div className="space-y-1 pt-1.5">
                                        <p className="text-[13px] leading-none font-medium">
                                            {nameOf(l)}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-1">
                                            {l === locale && (
                                                <Badge
                                                    variant="secondary"
                                                    className="h-4 px-1.5 text-[10px]"
                                                >
                                                    On canvas
                                                </Badge>
                                            )}
                                            {text &&
                                                draft.locales.length > 1 &&
                                                (own ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-4 px-1.5 text-[10px]"
                                                    >
                                                        Yours
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-4 px-1.5 text-[10px] text-muted-foreground"
                                                    >
                                                        Auto
                                                    </Badge>
                                                ))}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-1">
                                        <Field
                                            dir={rtl ? 'rtl' : 'ltr'}
                                            lang={l}
                                            value={text}
                                            placeholder={
                                                translate?.enabled
                                                    ? 'Translated when you type in another language'
                                                    : `Empty: guests see the ${nameOf(draft.locales[0] ?? 'en')} text`
                                            }
                                            className={cn('flex-1', long && 'min-h-16 resize-y')}
                                            onChange={(e) => {
                                                set((d) => applyText(d, path, e.target.value, l));
                                            }}
                                        />
                                        {translate?.enabled && draft.locales.length > 1 && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label={`Translate the other languages from ${nameOf(l)}`}
                                                        disabled={!text.trim() || translate.busy}
                                                        onClick={() => {
                                                            translate.retranslate(key, l);
                                                        }}
                                                    >
                                                        <RefreshCw />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Translate the other languages from {nameOf(l)}
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                {isLocalized(path) && draft.locales.length === 1 && (
                    <p className="px-2 pb-2 text-xs text-muted-foreground">
                        Add languages under Details → Languages on the invitation.
                    </p>
                )}
                {translate?.error && (
                    <p className="px-2 pb-2 text-xs text-destructive">{translate.error}</p>
                )}
            </div>
        </div>
    );
}
