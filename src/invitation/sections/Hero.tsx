import { peopleOf } from '@shared/people';
import { formatEventDate, zonedToUtc } from '@shared/time';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';
import {
    ArchCover,
    EditorialCover,
    fitDisplay,
    Honorific,
    LifeSpan,
    MonogramCover,
    useCoverFacts,
} from './covers';

const calendarLabel: Record<string, string> = {
    'islamic-umalqura': 'islamic-umalqura',
    hebrew: 'hebrew',
};

export function Hero({ variant }: { variant: string }) {
    if (variant === 'arch') return <ArchCover />;
    if (variant === 'monogram') return <MonogramCover />;
    if (variant === 'editorial') return <EditorialCover />;
    return <SpotlightCover />;
}

function SpotlightCover() {
    const { data, t, locale, tier, guest, copy, names } = useInvite();
    const { content, design, seed, calendars } = data.invitation;
    const { greeting } = useCoverFacts();
    const people = peopleOf(content);
    const first = data.events[0];
    const firstDate = first ? zonedToUtc(first.startsAt, first.timezone) : undefined;

    return (
        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
            <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.1]"
                aria-hidden
            >
                <GenerativeOrnament
                    kind={design.generative.kind}
                    seed={seed}
                    className="w-[150vmin] max-w-none"
                    spin={tier === 'full'}
                    duration={4200}
                />
            </div>
            {greeting && (
                // Sacred text: rendered calmly, never animated destructively.
                <Reveal from="blur" className="relative mb-10">
                    <p
                        className="inv-display text-lg text-(--inv-gold) @2xl:text-xl"
                        lang={greeting.text[locale] ? locale : undefined}
                    >
                        {t(greeting.text)}
                    </p>
                </Reveal>
            )}
            {guest && (
                <Reveal className="relative mb-6 text-xs tracking-[0.35em] uppercase opacity-80">
                    {copy('dearGuest')} {guest.name}
                </Reveal>
            )}
            <Reveal className="relative" delay={150}>
                <Honorific />
                <h2
                    className="inv-display leading-[0.9] font-light break-normal hyphens-none"
                    style={{ fontSize: fitDisplay([names.one, names.two], 13, 110, 8.5) }}
                >
                    <span className="foil-text block">{names.one}</span>
                    {names.two && (
                        <>
                            <span className="inv-script my-3 block text-[0.7em] text-(--inv-primary)">
                                {copy('and')}
                            </span>
                            <span className="foil-text block">{names.two}</span>
                        </>
                    )}
                </h2>
                <LifeSpan />
            </Reveal>
            {(people.one.parents ?? people.two?.parents) && (
                <Reveal
                    className={`relative mt-8 grid gap-1 text-sm opacity-80 ${people.two?.parents ? '@2xl:grid-cols-2 @2xl:gap-10' : ''}`}
                    delay={250}
                >
                    <p>{t(people.one.parents)}</p>
                    {people.two?.parents && <p>{t(people.two.parents)}</p>}
                </Reveal>
            )}
            <Reveal
                className="relative mt-10 max-w-xl text-lg leading-relaxed @2xl:text-xl"
                delay={350}
            >
                {t(content.headline)}
            </Reveal>
            {firstDate && first && (
                <Reveal className="relative mt-10 flex flex-col items-center gap-2" delay={450}>
                    <span className="hairline w-40 text-(--inv-gold)" />
                    <p className="inv-display text-xl tracking-wide @2xl:text-2xl">
                        {formatEventDate(firstDate, first.timezone, locale)}
                    </p>
                    {calendars.map((cal) => (
                        <p key={cal} className="text-sm opacity-70">
                            {formatEventDate(firstDate, first.timezone, locale, calendarLabel[cal])}
                        </p>
                    ))}
                    <span className="hairline w-40 text-(--inv-gold)" />
                </Reveal>
            )}
            <div
                className="absolute bottom-8 flex flex-col items-center gap-2 text-[10px] tracking-[0.4em] uppercase opacity-60"
                aria-hidden
            >
                <span className="h-10 w-px animate-pulse bg-(--inv-gold)" />
            </div>
        </section>
    );
}
