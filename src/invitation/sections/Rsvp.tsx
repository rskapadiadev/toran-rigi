import { eventLabel } from '@shared/cultures';
import { whatsappLink } from '@shared/guests';
import type { RsvpInput } from '@shared/schemas/guest';
import { formatEventDate } from '@shared/time';
import { type ComponentProps, type SyntheticEvent, useState } from 'react';

import { formString } from '../../motion/hooks';
import { Reveal } from '../../motion/Reveal';
import { Confetti } from '../Confetti';
import { useInvite } from '../context';
import { SectionTitle, useScriptTitles } from '../luxury/typography/SectionTitle';
import { dietaryLabels } from '../strings';
import { BreakTheGlass, LightSky } from './Celebration';

type Status = 'idle' | 'sending' | 'done' | 'error';

interface RsvpResponse {
    ok?: boolean;
    lights?: number;
}

const field =
    'w-full rounded-xl border border-(--inv-gold)/40 bg-(--inv-bg)/60 px-4 py-3 text-base outline-none transition focus:border-(--inv-gold) focus:ring-2 focus:ring-(--inv-gold)/30';

// Native selects ignore padding for their OS chevron and open a light-themed list on dark invitations;
// this one draws its own gold chevron and paints the options in the invitation's palette.
function Select({ className = '', children, ...props }: ComponentProps<'select'>) {
    return (
        <span className="relative block">
            <select
                {...props}
                className={`${field} cursor-pointer appearance-none pe-11 [&>option]:bg-(--inv-surface) [&>option]:text-(--inv-ink) ${className}`}
            >
                {children}
            </select>
            <svg
                viewBox="0 0 20 20"
                aria-hidden
                className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-(--inv-gold)"
            >
                <path
                    d="M5 7.5 10 12.5 15 7.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}

// A group's or a family side's link carries its token in the address, though it greets no one.
const linkToken = () =>
    typeof window === 'undefined'
        ? undefined
        : (new URLSearchParams(window.location.search).get('g') ?? undefined);

// Written the way the invitation writes its own dates, in the guest's language.
const replyDate = (iso: string, locale: string) =>
    formatEventDate(new Date(`${iso}T12:00:00Z`), 'UTC', locale);

interface PeopleSelectProps {
    value: number;
    max: number;
    min?: number;
    onChange: (n: number) => void;
}

function PeopleSelect({ value, max, min = 0, onChange }: PeopleSelectProps) {
    return (
        <Select
            value={String(value)}
            onChange={(e) => {
                onChange(Number(e.target.value));
            }}
        >
            {Array.from({ length: max - min + 1 }, (_, i) => (
                <option key={i + min} value={i + min}>
                    {i + min === 0 ? '—' : i + min}
                </option>
            ))}
        </Select>
    );
}

export function Rsvp() {
    const { data, t, locale, culture, guest, copy, occasion } = useInvite();
    const script = useScriptTitles();
    const { invitation, events } = data;
    const max = Math.min(20, guest?.max ?? 10);
    const [attending, setAttending] = useState(true);
    const [status, setStatus] = useState<Status>('idle');
    const [lights, setLights] = useState(data.diyaCount);
    const [counts, setCounts] = useState<Record<string, number>>(() =>
        Object.fromEntries(events.map((e) => [e.id, Math.min(2, max)])),
    );
    const [party, setParty] = useState(() => Math.min(2, max));
    const [sentText, setSentText] = useState('');

    if (!invitation.rsvpEnabled) return null;
    const replies = invitation.extras.replies;
    const titleOf = (id: string) => {
        const ev = events.find((e) => e.id === id);
        return ev ? t(ev.title) || eventLabel(invitation.culture, ev.kind, locale) : '';
    };

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const picked = Object.fromEntries(
            Object.entries(counts).filter(([id, n]) => n > 0 && events.some((ev) => ev.id === id)),
        );
        // With no functions listed there is one number for the whole celebration.
        const unlisted = events.length === 0;
        const coming = attending && (unlisted || Object.keys(picked).length > 0);
        const name = formString(form, 'name');
        const body: RsvpInput = {
            name,
            phone: formString(form, 'phone') || undefined,
            attending: coming,
            guestCount: unlisted ? party : Math.max(1, ...Object.values(picked)),
            eventIds: coming ? Object.keys(picked) : [],
            counts: unlisted ? undefined : coming ? picked : {},
            dietary: formString(form, 'dietary') || undefined,
            message: formString(form, 'message') || undefined,
            guestToken: guest?.token ?? linkToken(),
        };
        setStatus('sending');
        const res = await fetch(`/api/i/${invitation.slug}/rsvp`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        }).catch(() => null);
        const json: RsvpResponse | null = res ? await res.json() : null;
        if (json?.ok) {
            setAttending(coming);
            // The same answer, ready to send to the couple's WhatsApp in the guest's language.
            const lines = coming
                ? Object.entries(picked).map(([id, n]) => `${titleOf(id)}: ${String(n)}`)
                : [];
            setSentText(
                [coming ? copy('attending') : copy('declining'), ...lines, `— ${name}`].join('\n'),
            );
            setLights(json.lights ?? lights);
            setStatus('done');
            if ('vibrate' in navigator) navigator.vibrate(40);
        } else {
            setStatus('error');
        }
    };

    return (
        <section className="px-5 py-24" id="rsvp">
            {script ? (
                <SectionTitle className="mb-10 text-center">{copy('rsvpTitle')}</SectionTitle>
            ) : (
                <Reveal className="mb-10 text-center">
                    <h2 className="inv-display text-[clamp(2rem,6cqw,3.4rem)]">
                        {copy('rsvpTitle')}
                    </h2>
                </Reveal>
            )}
            {replies?.by && status !== 'done' && (
                <p className="-mt-6 mb-8 text-center text-sm opacity-80">
                    {copy('replyBy')} {replyDate(replies.by, locale)}
                </p>
            )}
            <div className="mx-auto max-w-xl">
                {status === 'done' ? (
                    <div className="space-y-6 text-center">
                        <p className="inv-display text-2xl">
                            {attending ? copy('thanks') : copy('thanksDecline')}
                        </p>
                        {replies?.whatsapp && (
                            <a
                                href={whatsappLink(replies.whatsapp, sentText)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-(--inv-gold)/60 px-5 py-3 text-sm transition hover:bg-(--inv-gold)/10"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden
                                    className="size-4 fill-current"
                                >
                                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
                                </svg>
                                {copy('sendWhatsapp')}
                            </a>
                        )}
                        {attending && <Confetti />}
                        {/* Breaking the glass belongs to the Jewish wedding only. */}
                        {culture.id === 'jewish' && occasion.id === 'wedding' ? (
                            <BreakTheGlass />
                        ) : (
                            <LightSky count={lights} highlight={attending} />
                        )}
                    </div>
                ) : (
                    <form
                        onSubmit={(e) => void submit(e)}
                        className="inv-card space-y-5 rounded-3xl p-6 @2xl:p-8"
                    >
                        <div
                            className="grid grid-cols-2 gap-2 rounded-full bg-(--inv-bg)/50 p-1"
                            role="radiogroup"
                        >
                            {[true, false].map((value) => (
                                <button
                                    key={String(value)}
                                    type="button"
                                    role="radio"
                                    aria-checked={attending === value}
                                    onClick={() => {
                                        setAttending(value);
                                    }}
                                    className={`rounded-full px-3 py-3 text-sm transition ${attending === value ? 'bg-(--inv-primary) text-(--inv-bg) shadow-lg' : 'opacity-70'}`}
                                >
                                    {value ? copy('attending') : copy('declining')}
                                </button>
                            ))}
                        </div>
                        <label className="block space-y-1.5 text-sm">
                            <span className="opacity-80">{copy('yourName')}</span>
                            <input
                                name="name"
                                required
                                maxLength={120}
                                defaultValue={guest?.name}
                                className={field}
                                autoComplete="name"
                            />
                        </label>
                        <label className="block space-y-1.5 text-sm">
                            <span className="opacity-80">{copy('phone')}</span>
                            <input
                                name="phone"
                                type="tel"
                                maxLength={32}
                                className={field}
                                autoComplete="tel"
                                dir="ltr"
                            />
                        </label>
                        {attending && (
                            <>
                                {events.length > 1 ? (
                                    <fieldset className="space-y-2 text-sm">
                                        <legend className="mb-2 opacity-80">
                                            {copy('howMany')}
                                        </legend>
                                        {events.map((ev) => (
                                            <label
                                                key={ev.id}
                                                className="grid grid-cols-[1fr_6.5rem] items-center gap-3"
                                            >
                                                <span>{titleOf(ev.id)}</span>
                                                <PeopleSelect
                                                    max={max}
                                                    value={counts[ev.id] ?? 0}
                                                    onChange={(n) => {
                                                        setCounts((c) => ({
                                                            ...c,
                                                            [ev.id]: n,
                                                        }));
                                                    }}
                                                />
                                            </label>
                                        ))}
                                    </fieldset>
                                ) : (
                                    <label className="block space-y-1.5 text-sm">
                                        <span className="opacity-80">{copy('guests')}</span>
                                        <PeopleSelect
                                            max={max}
                                            min={1}
                                            value={events[0] ? (counts[events[0].id] ?? 1) : party}
                                            onChange={(n) => {
                                                const only = events[0]?.id;
                                                if (only) setCounts({ [only]: n });
                                                else setParty(n);
                                            }}
                                        />
                                    </label>
                                )}
                                <label className="block space-y-1.5 text-sm">
                                    <span className="opacity-80">{copy('dietary')}</span>
                                    <Select name="dietary" defaultValue="">
                                        <option value="">—</option>
                                        {culture.dietary.map((d) => (
                                            <option key={d} value={d}>
                                                {dietaryLabels[d]?.[locale] ??
                                                    dietaryLabels[d]?.en ??
                                                    d}
                                            </option>
                                        ))}
                                    </Select>
                                </label>
                            </>
                        )}
                        <label className="block space-y-1.5 text-sm">
                            <span className="opacity-80">{copy('note')}</span>
                            <textarea name="message" rows={3} maxLength={1000} className={field} />
                        </label>
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full rounded-full bg-(--inv-primary) px-6 py-4 text-sm tracking-[0.25em] text-(--inv-bg) uppercase shadow-xl transition hover:brightness-110 disabled:opacity-60"
                        >
                            {status === 'sending' ? copy('sending') : copy('send')}
                        </button>
                        {status === 'error' && (
                            <p role="alert" className="text-center text-sm text-(--inv-primary)">
                                Something went wrong — please try again.
                            </p>
                        )}
                    </form>
                )}
            </div>
        </section>
    );
}
