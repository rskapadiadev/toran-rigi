// Ready words: each set as it reads on an invitation, to copy or to try on a design.
import { localeNames } from '@shared/locales';
import type { LocalizedText } from '@shared/types';
import {
    type Wording,
    wordingLocales,
    type WordingMessage,
    wordingStyleLabel,
} from '@shared/wording/types';
import { Link } from '@tanstack/react-router';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { quietButton } from './kit';

interface CopyButtonProps {
    text: string;
    label: string;
}

function CopyButton({ text, label }: CopyButtonProps) {
    const [done, setDone] = useState(false);
    return (
        <button
            type="button"
            className={quietButton}
            aria-label={label}
            onClick={() => {
                void navigator.clipboard.writeText(text).then(
                    () => {
                        setDone(true);
                        setTimeout(() => {
                            setDone(false);
                        }, 2000);
                    },
                    () => undefined,
                );
            }}
        >
            {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span aria-live="polite">{done ? 'Copied' : 'Copy'}</span>
        </button>
    );
}

interface LanguagesProps {
    options: readonly string[];
    value: string;
    onChange: (locale: string) => void;
}

export function Languages({ options, value, onChange }: LanguagesProps) {
    if (options.length < 2) return null;
    return (
        <div role="group" aria-label="Language" className="flex flex-wrap gap-2">
            {options.map((l) => (
                <button
                    key={l}
                    type="button"
                    lang={l}
                    aria-pressed={value === l}
                    onClick={() => {
                        onChange(l);
                    }}
                    className={cn(
                        'rounded-full border px-4 py-1.5 text-sm transition',
                        value === l
                            ? 'border-gold bg-gold text-night'
                            : 'border-white/15 text-ivory/75 hover:border-white/30 hover:text-ivory',
                    )}
                >
                    {localeNames[l as keyof typeof localeNames]}
                </button>
            ))}
        </div>
    );
}

const lines = (w: Wording, locale: string) =>
    [w.headline[locale], w.welcome[locale], w.closing[locale]].filter(Boolean).join('\n\n');

interface WordingCardProps {
    wording: Wording;
    locale: string;
    sample: string;
    greeting: LocalizedText | null;
    // A design to try these words on; none when the shop has no design for the occasion yet.
    design?: {
        slug: string;
        name: string;
    };
}

// Every language is in the page, so search engines read them all; only the chosen one shows.
export function WordingCard({ wording, locale, sample, greeting, design }: WordingCardProps) {
    const locales = wordingLocales(wording);
    const shown = locales.includes(locale) ? locale : 'en';
    return (
        <article
            id={wording.id}
            className="flex scroll-mt-24 flex-col rounded-[28px] border border-white/10 bg-white/[0.03] p-2"
        >
            <div className="flex flex-1 flex-col items-center rounded-[22px] border border-gold/20 bg-[radial-gradient(circle_at_50%_0%,rgba(195,154,78,0.16),transparent_60%),linear-gradient(180deg,#3a0d1a,#1a0c10)] px-5 py-8 text-center">
                {locales.map((l) => (
                    <div key={l} lang={l} hidden={l !== shown} className="my-auto">
                        {greeting?.[l] && <p className="mb-4 text-sm text-gold">{greeting[l]}</p>}
                        <p className="font-display text-3xl text-gold-bright" lang="en">
                            {sample}
                        </p>
                        <p className="mt-3 font-display text-xl leading-snug text-balance text-ivory">
                            {wording.headline[l]}
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-balance text-ivory/75">
                            {wording.welcome[l]}
                        </p>
                        <p className="mt-4 text-sm text-balance text-gold italic">
                            {wording.closing[l]}
                        </p>
                    </div>
                ))}
            </div>
            <div className="px-3 pt-4 pb-3">
                <h3 className="font-display text-2xl text-ivory">{wording.name}</h3>
                <p className="text-[11px] tracking-[0.2em] text-ivory/50 uppercase">
                    {wordingStyleLabel[wording.style]}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <CopyButton text={lines(wording, shown)} label={`Copy “${wording.name}”`} />
                    {design && (
                        <Link
                            to="/try/$slug"
                            params={{ slug: design.slug }}
                            search={{ words: wording.id }}
                            className="rounded-full bg-gold/90 px-4 py-2 text-sm font-medium text-night transition hover:bg-gold-bright"
                        >
                            Try on {design.name}
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}

interface MessageCardProps {
    message: WordingMessage;
    locale: string;
}

export function MessageCard({ message, locale }: MessageCardProps) {
    const text = message.text[locale] ?? message.text.en ?? '';
    const locales = Object.keys(message.text);
    return (
        <article className="flex flex-col gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-display text-xl text-ivory">{message.name}</h3>
            <div className="flex-1">
                {locales.map((l) => (
                    <p
                        key={l}
                        lang={l}
                        hidden={l !== (message.text[locale] ? locale : 'en')}
                        className="rounded-2xl rounded-ss-sm bg-[#17382f] px-4 py-3 text-sm leading-relaxed text-ivory/90"
                    >
                        {message.text[l]}
                    </p>
                ))}
            </div>
            <div>
                <CopyButton text={text} label={`Copy “${message.name}”`} />
            </div>
        </article>
    );
}
