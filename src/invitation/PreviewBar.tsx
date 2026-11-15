// Demo ("template preview") mode: a floating bar to try a design with your own names, then start
// an order. Shown only on demo invitations; never on a couple's real invitation.
import { themeBySlug } from '@shared/themes';
import { type SyntheticEvent, useState } from 'react';

import { formString } from '../motion/hooks';
import type { PublicInvitationData } from './types';

export interface Trial {
    one: string;
    two: string;
    date: string;
}

// "2027-02-11T16:00" moved by whole days, keeping the local time.
function shiftDays(local: string, days: number): string {
    if (!days) return local;
    const d = new Date(`${local.slice(0, 10)}T00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return `${d.toISOString().slice(0, 10)}${local.slice(10)}`;
}

// Puts the visitor's names (every language) and date (first ceremony) into the demo, in the browser only.
export function applyTrial(data: PublicInvitationData, trial: Trial | null): PublicInvitationData {
    if (!trial) return data;
    const named = (text: string, fallback: Record<string, string> | undefined) =>
        text
            ? Object.fromEntries(Object.keys(fallback ?? { en: '' }).map((l) => [l, text]))
            : (fallback ?? {});
    const { people } = data.invitation.content;
    const first = data.events[0];
    const shift =
        first && trial.date
            ? Math.round(
                  (Date.parse(`${trial.date}T00:00Z`) -
                      Date.parse(`${first.startsAt.slice(0, 10)}T00:00Z`)) /
                      86_400_000,
              )
            : 0;
    return {
        ...data,
        invitation: {
            ...data.invitation,
            content: {
                ...data.invitation.content,
                people: {
                    one: {
                        ...people.one,
                        name: named(trial.one, people.one.name),
                    },
                    two: people.two && {
                        ...people.two,
                        name: named(trial.two, people.two.name),
                    },
                },
            },
        },
        // Move the whole schedule by the same number of days, so the order and gaps stay true.
        events: data.events.map((e) => ({
            ...e,
            startsAt: shiftDays(e.startsAt, shift),
            endsAt: e.endsAt ? shiftDays(e.endsAt, shift) : e.endsAt,
        })),
    };
}

type Sheet = 'try' | 'start' | null;

interface PreviewBarProps {
    data: PublicInvitationData;
    trial: Trial | null;
    onTrial: (trial: Trial | null) => void;
}

const field =
    'w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[15px] text-neutral-900 outline-none focus:border-neutral-900';

export function PreviewBar({ data, trial, onTrial }: PreviewBarProps) {
    const [sheet, setSheet] = useState<Sheet>(null);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const theme = data.themeSlug ? themeBySlug(data.themeSlug) : undefined;
    const couple = Boolean(data.invitation.content.people.two);

    const tryIt = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const value = (k: string) => formString(f, k);
        onTrial({
            one: value('one'),
            two: value('two'),
            date: value('date'),
        });
        setSheet(null);
    };

    const start = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const f = new FormData(e.currentTarget);
        const res = await fetch('/api/inquiries', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                name: formString(f, 'name'),
                phone: formString(f, 'phone'),
                email: formString(f, 'email'),
                date: formString(f, 'date'),
                theme: data.themeSlug ?? undefined,
            }),
        });
        if (res.ok) setSent(true);
        else {
            const body = (await res.json().catch(() => ({}))) as { error?: string };
            setError(body.error ?? 'Something went wrong. Please try again.');
        }
    };

    return (
        <>
            <div
                data-preview-bar
                className="fixed inset-x-3 bottom-3 z-[55] mx-auto flex max-w-md items-center gap-2 rounded-full bg-black/60 p-1.5 ps-4 font-sans text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
                <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-sm font-semibold">
                        {theme?.name ?? 'Toran design'}
                    </span>
                </span>
                <button
                    type="button"
                    onClick={() => {
                        setSheet('try');
                    }}
                    className="rounded-full border border-white/40 px-3.5 py-2 text-[13px] font-medium hover:bg-white/10"
                >
                    {trial ? 'Edit' : 'Try it'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setSheet('start');
                    }}
                    className="rounded-full bg-[#d9a441] px-4 py-2 text-[13px] font-semibold text-neutral-900 hover:brightness-105"
                >
                    Create your invite
                </button>
            </div>

            {sheet && (
                <div
                    className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 font-sans"
                    role="presentation"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setSheet(null);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={sheet === 'try' ? 'Try this design' : 'Create your invite'}
                        className="w-full max-w-md space-y-4 rounded-t-3xl bg-[#fbf8f3] p-6 text-neutral-900"
                    >
                        {sheet === 'try' ? (
                            <form onSubmit={tryIt} className="space-y-3">
                                <h2 className="text-lg font-semibold">See it with your names</h2>
                                <p className="text-sm text-neutral-600">
                                    Only you see this preview. Nothing is saved.
                                </p>
                                <input
                                    name="one"
                                    placeholder={couple ? 'First name' : 'Name'}
                                    defaultValue={trial?.one}
                                    className={field}
                                />
                                {couple && (
                                    <input
                                        name="two"
                                        placeholder="Partner’s name"
                                        defaultValue={trial?.two}
                                        className={field}
                                    />
                                )}
                                <input
                                    name="date"
                                    type="date"
                                    defaultValue={trial?.date}
                                    className={field}
                                    aria-label="Date"
                                />
                                <div className="flex gap-2 pt-1">
                                    {trial && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onTrial(null);
                                                setSheet(null);
                                            }}
                                            className="rounded-full border border-black/15 px-4 py-2.5 text-sm"
                                        >
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white"
                                    >
                                        Show me
                                    </button>
                                </div>
                            </form>
                        ) : sent ? (
                            <div className="space-y-2 py-4 text-center">
                                <h2 className="text-lg font-semibold">Thank you ✦</h2>
                                <p className="text-sm text-neutral-600">
                                    We’ll get in touch within a day to start your{' '}
                                    {theme?.name ?? ''} invitation.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={(e) => void start(e)} className="space-y-3">
                                <h2 className="text-lg font-semibold">
                                    Start with {theme?.name ?? 'this design'}
                                </h2>
                                <p className="text-sm text-neutral-600">
                                    Leave your details and we’ll set it up for you.
                                </p>
                                <input
                                    name="name"
                                    required
                                    placeholder="Your name"
                                    className={field}
                                />
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder="WhatsApp number"
                                    className={field}
                                />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Email (optional)"
                                    className={field}
                                />
                                <input
                                    name="date"
                                    type="date"
                                    className={field}
                                    aria-label="Event date"
                                />
                                {error && <p className="text-sm text-red-700">{error}</p>}
                                <button
                                    type="submit"
                                    className="w-full rounded-full bg-[#d9a441] px-4 py-2.5 text-sm font-semibold text-neutral-900"
                                >
                                    Send
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
