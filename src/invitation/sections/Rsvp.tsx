import { eventLabel } from '@shared/cultures';
import type { RsvpInput } from '@shared/schemas/guest';
import { type SyntheticEvent, useState } from 'react';

import { formString } from '../../motion/hooks';
import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';
import { dietaryLabels } from '../strings';
import { BreakTheGlass, LightSky } from './Celebration';

type Status = 'idle' | 'sending' | 'done' | 'error';

interface RsvpResponse {
    ok?: boolean;
    lights?: number;
}

const field =
    'w-full rounded-xl border border-(--inv-gold)/40 bg-(--inv-bg)/60 px-4 py-3 text-base outline-none transition focus:border-(--inv-gold) focus:ring-2 focus:ring-(--inv-gold)/30';

export function Rsvp() {
    const { data, t, locale, culture, guest, copy, occasion } = useInvite();
    const { invitation, events } = data;
    const [attending, setAttending] = useState(true);
    const [status, setStatus] = useState<Status>('idle');
    const [lights, setLights] = useState(data.diyaCount);
    const [selected, setSelected] = useState<string[]>(events.map((e) => e.id));

    if (!invitation.rsvpEnabled) return null;

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const body: RsvpInput = {
            name: formString(form, 'name'),
            phone: formString(form, 'phone') || undefined,
            attending,
            guestCount: Number(formString(form, 'guestCount') || 1),
            eventIds: attending ? selected : [],
            dietary: formString(form, 'dietary') || undefined,
            message: formString(form, 'message') || undefined,
            guestToken: guest?.token,
        };
        setStatus('sending');
        const res = await fetch(`/api/i/${invitation.slug}/rsvp`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        }).catch(() => null);
        const json: RsvpResponse | null = res ? await res.json() : null;
        if (json?.ok) {
            setLights(json.lights ?? lights);
            setStatus('done');
            if ('vibrate' in navigator) navigator.vibrate(40);
        } else {
            setStatus('error');
        }
    };

    return (
        <section className="px-5 py-24" id="rsvp">
            <Reveal className="mb-10 text-center">
                <h2 className="inv-display text-[clamp(2rem,6cqw,3.4rem)]">{copy('rsvpTitle')}</h2>
            </Reveal>
            <div className="mx-auto max-w-xl">
                {status === 'done' ? (
                    <div className="space-y-6 text-center">
                        <p className="inv-display text-2xl">
                            {attending ? copy('thanks') : copy('thanksDecline')}
                        </p>
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
                                <label className="block space-y-1.5 text-sm">
                                    <span className="opacity-80">{copy('guests')}</span>
                                    <select name="guestCount" defaultValue="2" className={field}>
                                        {Array.from({ length: 10 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                {events.length > 1 && (
                                    <fieldset className="space-y-2 text-sm">
                                        <legend className="mb-2 opacity-80">
                                            {copy('whichEvents')}
                                        </legend>
                                        <div className="flex flex-wrap gap-2">
                                            {events.map((ev) => {
                                                const on = selected.includes(ev.id);
                                                return (
                                                    <button
                                                        key={ev.id}
                                                        type="button"
                                                        aria-pressed={on}
                                                        onClick={() => {
                                                            setSelected(
                                                                on
                                                                    ? selected.filter(
                                                                          (id) => id !== ev.id,
                                                                      )
                                                                    : [...selected, ev.id],
                                                            );
                                                        }}
                                                        className={`rounded-full border px-4 py-2 transition ${on ? 'border-(--inv-primary) bg-(--inv-primary) text-(--inv-bg)' : 'border-(--inv-gold)/50'}`}
                                                    >
                                                        {t(ev.title) ||
                                                            eventLabel(
                                                                invitation.culture,
                                                                ev.kind,
                                                                locale,
                                                            )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                )}
                                <label className="block space-y-1.5 text-sm">
                                    <span className="opacity-80">{copy('dietary')}</span>
                                    <select name="dietary" className={field} defaultValue="">
                                        <option value="">—</option>
                                        {culture.dietary.map((d) => (
                                            <option key={d} value={d}>
                                                {dietaryLabels[d]?.[locale] ??
                                                    dietaryLabels[d]?.en ??
                                                    d}
                                            </option>
                                        ))}
                                    </select>
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
