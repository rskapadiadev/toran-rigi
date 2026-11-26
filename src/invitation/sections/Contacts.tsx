// The numbers guests can reach at the close of the invitation: seva at a jagran, help on the day at
// a wedding. One tap calls; WhatsApp opens a chat. Nothing shows until the hosts add a number.
import { phoneDigits } from '@shared/guests';

import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';
import { SectionTitle } from '../luxury/typography/SectionTitle';

// A ten-digit Indian mobile typed without its country code still has to reach WhatsApp and dial
// from abroad, so it gets +91; anything else is dialled as typed.
export function dialDigits(phone: string): string {
    const digits = phoneDigits(phone);
    return /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : digits;
}

export function Contacts() {
    const { data, copy } = useInvite();
    const contacts = (data.invitation.extras.contacts ?? []).filter((c) => phoneDigits(c.phone));
    if (contacts.length === 0) return null;
    return (
        <section className="px-6 pt-4 pb-20 text-center" data-contacts>
            <SectionTitle>{copy('contactUs')}</SectionTitle>
            <Reveal className="mx-auto mt-6 grid max-w-md gap-3" delay={120}>
                {contacts.map((c, i) => {
                    const to = dialDigits(c.phone);
                    const who = c.name ?? c.phone;
                    return (
                        <div
                            key={i}
                            className="flex items-center gap-3 rounded-2xl border border-(--inv-gold)/40 bg-(--inv-surface)/60 px-4 py-3 text-start"
                        >
                            <div className="min-w-0 flex-1">
                                {c.name && <p className="truncate text-base">{c.name}</p>}
                                <p
                                    dir="ltr"
                                    className="text-sm tracking-wide text-(--inv-gold) tabular-nums"
                                >
                                    {c.phone}
                                </p>
                            </div>
                            <a
                                href={`tel:+${to}`}
                                aria-label={`${copy('call')} ${who}`}
                                className="rounded-full bg-(--inv-gold) px-4 py-2 text-sm font-medium text-(--inv-bg)"
                            >
                                {copy('call')}
                            </a>
                            <a
                                href={`https://wa.me/${to}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`WhatsApp ${who}`}
                                className="rounded-full border border-(--inv-gold) px-4 py-2 text-sm text-(--inv-gold)"
                            >
                                WhatsApp
                            </a>
                        </div>
                    );
                })}
            </Reveal>
        </section>
    );
}
