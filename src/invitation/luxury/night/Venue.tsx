// Location: the city in spaced capitals, the venue and its address, a gold "Open in Google Maps"
// button, and the studio's painting of the venue running edge to edge at the foot of the page.
import { eventLabel } from '@shared/cultures';
import { photoUrl } from '@shared/photos';

import { Reveal } from '../../../motion/Reveal';
import { useInvite } from '../../context';
import type { PublicInvitationEvent } from '../../types';
import { SectionTitle } from '../typography/SectionTitle';

const mapsFor = (e: PublicInvitationEvent) =>
    e.mapsUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.venue, e.address].filter(Boolean).join(', '))}`;

export function Venue() {
    const { data, copy, t, locale } = useInvite();
    const art = data.invitation.design.art?.venue;
    // One entry per distinct place; most weddings hold every ceremony at the same venue.
    const places = data.events.filter(
        (e, i, all) => all.findIndex((x) => x.venue === e.venue) === i,
    );
    if (places.length === 0) return null;
    const several = places.length > 1;
    return (
        <section className="pt-20 text-center">
            <div className="px-6">
                <SectionTitle>{copy('location')}</SectionTitle>
                <div className="mx-auto max-w-md space-y-12">
                    {places.map((e, i) => {
                        const city = e.address?.split(',').at(-1)?.trim();
                        return (
                            <Reveal key={e.id} delay={i * 100}>
                                {several && (
                                    <p className="mb-2 text-[11px] tracking-[0.35em] text-(--inv-gold) uppercase">
                                        {t(e.title) ||
                                            eventLabel(data.invitation.culture, e.kind, locale)}
                                    </p>
                                )}
                                {city && (
                                    <p className="inv-display text-[clamp(1.6rem,8cqw,2.4rem)] tracking-[0.25em] uppercase">
                                        {city}
                                    </p>
                                )}
                                <p className="mt-1 text-[clamp(1.15rem,5cqw,1.5rem)]">{e.venue}</p>
                                {e.address && (
                                    <p className="mx-auto mt-2 max-w-[28ch] text-[clamp(0.95rem,4cqw,1.1rem)] leading-relaxed opacity-70">
                                        {e.address}
                                    </p>
                                )}
                                <a
                                    href={mapsFor(e)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-7 inline-block rounded-full bg-linear-to-r from-[color-mix(in_oklab,var(--inv-gold)_55%,black)] via-[color-mix(in_oklab,var(--inv-gold)_85%,black)] to-[color-mix(in_oklab,var(--inv-gold)_60%,black)] px-[clamp(1.6rem,8cqw,2.6rem)] py-3.5 text-[clamp(0.7rem,3cqw,0.85rem)] font-semibold tracking-[0.3em] text-(--inv-ink) uppercase shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)] ring-1 ring-(--inv-gold)/50"
                                >
                                    {copy('openInMaps')}
                                </a>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
            {art ? (
                <Reveal from="blur" className="mt-14">
                    <img
                        src={photoUrl(art)}
                        alt=""
                        loading="lazy"
                        className="block w-full [mask-image:linear-gradient(to_bottom,transparent,black_18%)]"
                    />
                </Reveal>
            ) : (
                <div className="h-20" />
            )}
        </section>
    );
}
