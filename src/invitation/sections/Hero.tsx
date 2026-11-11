import { formatEventDate, zonedToUtc } from '@shared/time';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';
import { s } from '../strings';

const calendarLabel: Record<string, string> = {
    'islamic-umalqura': 'islamic-umalqura',
    hebrew: 'hebrew',
};

export function Hero() {
    const { data, t, locale, culture, tier, guest } = useInvite();
    const { content, design, seed, calendars } = data.invitation;
    const greeting = culture.greetings.find((g) => g.key === content.greetingKey);
    const first = data.events[0];
    const firstDate = first ? zonedToUtc(first.startsAt, first.timezone) : undefined;

    return (
        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
            <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.22]"
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
                        className="inv-display text-lg text-(--inv-gold) sm:text-xl"
                        lang={greeting.text[locale] ? locale : undefined}
                    >
                        {t(greeting.text)}
                    </p>
                </Reveal>
            )}
            {guest && (
                <Reveal className="relative mb-6 text-xs tracking-[0.35em] uppercase opacity-80">
                    {s('dearGuest', locale)} {guest.name}
                </Reveal>
            )}
            <Reveal className="relative" delay={150}>
                <h2 className="inv-display text-[clamp(3rem,13vw,8.5rem)] leading-[0.9] font-light">
                    <span className="foil-text block">{t(content.couple.one.name)}</span>
                    <span className="inv-script my-3 block text-[0.7em] text-(--inv-primary)">
                        {s('and', locale)}
                    </span>
                    <span className="foil-text block">{t(content.couple.two.name)}</span>
                </h2>
            </Reveal>
            {(content.couple.one.parents ?? content.couple.two.parents) && (
                <Reveal
                    className="relative mt-8 grid gap-1 text-sm opacity-80 sm:grid-cols-2 sm:gap-10"
                    delay={250}
                >
                    <p>{t(content.couple.one.parents)}</p>
                    <p>{t(content.couple.two.parents)}</p>
                </Reveal>
            )}
            <Reveal
                className="relative mt-10 max-w-xl text-lg leading-relaxed sm:text-xl"
                delay={350}
            >
                {t(content.headline)}
            </Reveal>
            {firstDate && first && (
                <Reveal className="relative mt-10 flex flex-col items-center gap-2" delay={450}>
                    <span className="hairline w-40 text-(--inv-gold)" />
                    <p className="inv-display text-xl tracking-wide sm:text-2xl">
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
