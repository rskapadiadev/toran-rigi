// What to wear: the studio's painting of the family dressed for the day, then a page for each
// function: its colour story, the outfits drawn in those colours, notes for ladies and gentlemen,
// and any colours the family would rather guests left to them.
import { eventLabel } from '@shared/cultures';
import { colourName, outfitInfo, outfitsFor } from '@shared/looks';
import { photoUrl } from '@shared/photos';

import { Reveal } from '../../../motion/Reveal';
import { useInvite } from '../../context';
import { useEditing } from '../../editing';
import { Outfit } from '../../looks/Outfit';
import type { PublicDressCode, PublicInvitationEvent } from '../../types';
import { SectionTitle } from '../typography/SectionTitle';

type Dressed = PublicInvitationEvent & { dressCode: PublicDressCode };

const isDressed = (e: PublicInvitationEvent): e is Dressed =>
    Boolean(e.dressCode && (e.dressCode.swatches.length > 0 || e.dressCode.outfits?.length));

// Figure k wears colour k with the next one as its second, so a row shows the whole story.
export const outfitColours = (swatches: readonly string[], k: number) => {
    const n = Math.max(1, swatches.length);
    const fallback = 'var(--inv-primary)';
    return {
        main: swatches[k % n] ?? fallback,
        second: swatches[(k + 1) % n] ?? swatches[0] ?? fallback,
    };
};

interface LookProps {
    event: Dressed;
    index: number;
    second: string | undefined;
}

function Look({ event, index, second }: LookProps) {
    const { data, copy, t, locale } = useInvite();
    const look = event.dressCode;
    const culture = data.invitation.culture;
    const title = t(event.title) || eventLabel(culture, event.kind, locale);
    const native = second ? eventLabel(culture, event.kind, second) : '';
    const figures = outfitsFor(look.outfits, culture);
    const theme = look.title ? t(look.title) : '';
    const note = look.note ? t(look.note) : '';
    const ladies = look.ladies ? t(look.ladies) : '';
    const gentlemen = look.gentlemen ? t(look.gentlemen) : '';
    const avoid = look.avoid ?? [];
    return (
        <li className="py-10 first:pt-2">
            <Reveal delay={index * 80}>
                <p className="text-[clamp(1.35rem,6cqw,1.8rem)] leading-tight">
                    {title}
                    {native && native !== title && (
                        <span className="ms-2 text-[0.7em] text-(--inv-gold)">{native}</span>
                    )}
                </p>
                {theme && (
                    <p className="mt-1 text-[clamp(1.05rem,4.6cqw,1.3rem)] text-(--inv-gold) italic">
                        {theme}
                    </p>
                )}
            </Reveal>
            <Reveal from="blur" delay={index * 80 + 60}>
                <div className="relative mx-auto mt-6 flex max-w-sm items-end justify-center gap-[clamp(0.25rem,2cqw,1rem)]">
                    <span
                        aria-hidden
                        className="absolute inset-x-6 -bottom-2 h-6 rounded-[50%] bg-(--inv-gold)/15 blur-md"
                    />
                    {figures.map((o, k) => (
                        <Outfit
                            key={o}
                            id={o}
                            {...outfitColours(look.swatches, k)}
                            turban={look.turban}
                            title={outfitInfo[o].label}
                            className="relative h-[clamp(9rem,46cqw,13rem)] w-auto"
                        />
                    ))}
                </div>
            </Reveal>
            {look.swatches.length > 0 && (
                <ul className="mt-7 flex flex-wrap justify-center gap-2.5">
                    {look.swatches.map((c, k) => (
                        <li
                            key={`${c}-${String(k)}`}
                            title={colourName(c)}
                            aria-label={colourName(c)}
                            className="size-[clamp(1.7rem,7.5cqw,2.2rem)] rounded-full shadow-[inset_0_-3px_6px_rgba(0,0,0,0.25)] ring-2 ring-white/35"
                            style={{ background: c }}
                        />
                    ))}
                </ul>
            )}
            {note && (
                <p className="mx-auto mt-4 max-w-sm text-[clamp(0.98rem,4.2cqw,1.12rem)] opacity-80">
                    {note}
                </p>
            )}
            {(ladies || gentlemen) && (
                <dl className="mx-auto mt-5 grid max-w-md gap-4 text-[clamp(0.92rem,4cqw,1.05rem)] @md:grid-cols-2">
                    {ladies && (
                        <div>
                            <dt className="text-[0.72em] tracking-[0.25em] text-(--inv-gold) uppercase">
                                {copy('ladies')}
                            </dt>
                            <dd className="mt-1 opacity-80">{ladies}</dd>
                        </div>
                    )}
                    {gentlemen && (
                        <div>
                            <dt className="text-[0.72em] tracking-[0.25em] text-(--inv-gold) uppercase">
                                {copy('gentlemen')}
                            </dt>
                            <dd className="mt-1 opacity-80">{gentlemen}</dd>
                        </div>
                    )}
                </dl>
            )}
            {avoid.length > 0 && (
                <div className="mt-5 flex items-center justify-center gap-2.5 text-[clamp(0.85rem,3.6cqw,0.95rem)] opacity-80">
                    <span>{copy('pleaseAvoid')}</span>
                    {avoid.map((c) => (
                        <span
                            key={c}
                            role="img"
                            aria-label={colourName(c)}
                            className="relative size-6 overflow-hidden rounded-full ring-1 ring-(--inv-ink)/30"
                            style={{ background: c }}
                        >
                            <span className="absolute inset-x-[-20%] top-1/2 h-[1.5px] -rotate-45 bg-(--inv-ink)" />
                        </span>
                    ))}
                </div>
            )}
        </li>
    );
}

export function DressCode() {
    const { data, copy, locale } = useInvite();
    const editing = useEditing();
    const art = data.invitation.design.art?.dress;
    const looks = data.events.filter(isDressed);
    if (looks.length === 0 && !editing) return null;
    const second = data.invitation.locales.find((l) => l !== locale);
    return (
        <section className="px-6 py-20 text-center">
            <SectionTitle>{copy('whatToWear')}</SectionTitle>
            {art && (
                <Reveal from="blur" className="mx-auto mb-6 max-w-md">
                    <img src={photoUrl(art)} alt="" loading="lazy" className="w-full" />
                </Reveal>
            )}
            <ul className="mx-auto max-w-lg divide-y divide-(--inv-gold)/35">
                {looks.map((e, i) => (
                    <Look key={e.id} event={e} index={i} second={second} />
                ))}
            </ul>
        </section>
    );
}
