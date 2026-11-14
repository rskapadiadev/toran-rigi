import type { CultureId } from '@shared/cultures';
import { greetingFits } from '@shared/occasions';
import { formatEventDate, zonedToUtc } from '@shared/time';
import { m } from 'motion/react';
import { use } from 'react';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { EnterContext, Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';

export function useCoverFacts() {
    const { data, t, locale, culture, guest, copy, names, occasion } = useInvite();
    const { content } = data.invitation;
    const first = data.events[0];
    const date = first ? zonedToUtc(first.startsAt, first.timezone) : undefined;
    const greeting = culture.greetings.find((g) => g.key === content.greetingKey);
    return {
        one: names.one,
        two: names.two,
        honorific: names.honorific,
        lifeSpan: names.lifeSpan,
        headline: t(content.headline),
        // An auspicious invocation never heads a condolence notice, even if one was saved earlier.
        greeting: greeting && greetingFits(greeting, occasion) ? greeting : undefined,
        dateText: date && first ? formatEventDate(date, first.timezone, locale) : '',
        year:
            date && first
                ? date.toLocaleDateString(locale, {
                      year: 'numeric',
                      timeZone: first.timezone,
                  })
                : '',
        guest,
        and: copy('and'),
    };
}

// Huge display names shrink to fit their longest word, so "Northwind" never splits into "Northwin / d".
export function fitDisplay(names: string[], maxCqw: number, budget: number, maxRem = 11): string {
    const longest = Math.max(
        4,
        ...names.flatMap((n) => n.split(/\s+/)).map((w) => Array.from(w).length),
    );
    return `clamp(2rem, ${String(Math.min(maxCqw, budget / longest))}cqw, ${String(maxRem)}rem)`;
}

const initial = (name: string) => Array.from(name.trim())[0] ?? '';

// Doorway silhouettes per tradition: jharokha, mihrab, lancet, gurdwara dome, chuppah canopy.
export function archPath(culture: CultureId): string {
    switch (culture) {
        case 'hindu':
        case 'jain': {
            // Cusped (multifoil) jharokha: seven lobes along a semicircle.
            const cx = 150;
            const cy = 200;
            const r = 130;
            const lobes = 7;
            const points = Array.from({ length: lobes + 1 }, (_, i) => {
                const a = Math.PI - (Math.PI / lobes) * i;
                return [cx + r * Math.cos(a), cy - r * Math.sin(a)] as const;
            });
            const arcs = points
                .slice(1)
                .map(([x, y]) => `A30 30 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`)
                .join(' ');
            return `M20 470 V200 ${arcs} V470`;
        }
        case 'islamic':
            return 'M20 470 V220 C20 130 85 98 118 66 C138 46 148 24 150 8 C152 24 162 46 182 66 C215 98 280 130 280 220 V470';
        case 'christian':
            return 'M20 470 V210 Q20 70 150 8 Q280 70 280 210 V470';
        case 'sikh':
            return 'M20 470 V230 C20 165 58 140 96 122 C128 106 132 70 150 30 C168 70 172 106 204 122 C242 140 280 165 280 230 V470';
        case 'jewish':
            return 'M20 470 V70 Q85 92 150 70 Q215 92 280 70 V470';
        case 'universal':
            return 'M20 470 V180 A130 130 0 0 1 280 180 V470';
    }
}

interface DrawnPathProps {
    d: string;
    width: number;
    opacity?: number;
}

function DrawnPath({ d, width, opacity = 1 }: DrawnPathProps) {
    const { tier } = use(EnterContext);
    if (tier === 'static')
        return (
            <path
                d={d}
                fill="none"
                stroke="var(--inv-gold)"
                strokeWidth={width}
                opacity={opacity}
            />
        );
    return (
        <m.path
            d={d}
            fill="none"
            stroke="var(--inv-gold)"
            strokeWidth={width}
            opacity={opacity}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{
                duration: 2.6,
                ease: [0.65, 0, 0.35, 1],
            }}
        />
    );
}

// "Late Shri", "Dr." — set small above the name.
export function Honorific() {
    const { names } = useInvite();
    if (!names.honorific) return null;
    return (
        <p className="mb-2 text-xs tracking-[0.35em] text-(--inv-gold) uppercase">
            {names.honorific}
        </p>
    );
}

// Birth and passing years under the name, for remembrance occasions.
export function LifeSpan() {
    const { names } = useInvite();
    if (!names.lifeSpan) return null;
    return <p className="inv-display mt-3 text-lg tracking-[0.2em] opacity-80">{names.lifeSpan}</p>;
}

function Greeting() {
    const { t, locale } = useInvite();
    const { greeting } = useCoverFacts();
    if (!greeting) return null;
    return (
        // Sacred text keeps a calm entrance whatever the block preset.
        <Reveal from="blur">
            <p
                className="inv-display text-base text-(--inv-gold) @2xl:text-lg"
                lang={greeting.text[locale] ? locale : undefined}
            >
                {t(greeting.text)}
            </p>
        </Reveal>
    );
}

export function ArchCover() {
    const { culture, data, tier } = useInvite();
    const facts = useCoverFacts();
    const d = archPath(culture.id);
    return (
        <section className="relative flex min-h-svh items-center justify-center px-5 py-16">
            {/* Its own container: names size to the arch, not to a 1900px-wide desktop page. */}
            <div className="[container-type:inline-size] relative aspect-[300/470] w-[min(88cqw,440px,62svh)]">
                <svg
                    viewBox="0 0 300 470"
                    className="absolute inset-0 size-full overflow-visible"
                    aria-hidden
                >
                    <path d={d} fill="var(--inv-bg)" opacity="0.72" />
                    <DrawnPath d={d} width={2.2} />
                    <g transform="translate(150 235) scale(0.92) translate(-150 -235)">
                        <DrawnPath d={d} width={0.8} opacity={0.6} />
                    </g>
                    {culture.id === 'jewish' && (
                        <>
                            <DrawnPath d="M20 70 V470 M280 70 V470" width={5} opacity={0.5} />
                            {Array.from({ length: 13 }, (_, i) => (
                                <circle
                                    key={i}
                                    cx={20 + i * 21.6}
                                    cy={84 + (i % 2) * 4}
                                    r="2.4"
                                    fill="var(--inv-gold)"
                                    opacity="0.8"
                                />
                            ))}
                        </>
                    )}
                    {culture.id === 'sikh' && (
                        <circle cx="150" cy="18" r="6" fill="var(--inv-gold)" opacity="0.9" />
                    )}
                </svg>
                <div
                    className="pointer-events-none absolute inset-x-[30%] top-[13%] opacity-60"
                    aria-hidden
                >
                    <GenerativeOrnament
                        kind={data.invitation.design.generative.kind}
                        seed={data.invitation.seed + 3}
                        className="w-full"
                        spin={tier === 'full'}
                        duration={3000}
                    />
                </div>
                <div className="absolute inset-x-[11%] top-[35%] bottom-[7%] flex flex-col items-center text-center">
                    <Greeting />
                    {facts.guest && (
                        <Reveal className="mt-3 text-[10px] tracking-[0.35em] uppercase opacity-80">
                            {facts.guest.name}
                        </Reveal>
                    )}
                    <Reveal delay={150} className="mt-auto">
                        <Honorific />
                        <h2
                            className="inv-display leading-[0.95] break-normal hyphens-none"
                            style={{ fontSize: fitDisplay([facts.one, facts.two], 11, 84) }}
                        >
                            <span className="foil-text block">{facts.one}</span>
                            {facts.two && (
                                <>
                                    <span className="inv-script my-2 block text-[0.6em] text-(--inv-primary)">
                                        {facts.and}
                                    </span>
                                    <span className="foil-text block">{facts.two}</span>
                                </>
                            )}
                        </h2>
                        <LifeSpan />
                    </Reveal>
                    <Reveal
                        delay={300}
                        className="mt-5 max-w-[30ch] text-sm leading-relaxed opacity-85"
                    >
                        {facts.headline}
                    </Reveal>
                    <Reveal delay={420} className="mt-auto pt-4">
                        <p className="inv-display text-lg tracking-wide">{facts.dateText}</p>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

export function MonogramCover() {
    const { tier, data } = useInvite();
    const facts = useCoverFacts();
    const ring = `${facts.one} · ${facts.two} · ${facts.dateText} · `;
    const id = `ring-${data.invitation.seed}`;
    return (
        <section className="relative flex min-h-svh flex-col items-center justify-center px-6 py-20 text-center">
            <Greeting />
            <Reveal delay={100} className="relative mt-8 size-[min(78cqw,380px)]">
                <svg viewBox="0 0 300 300" className="absolute inset-0 size-full" aria-hidden>
                    <defs>
                        <path
                            id={id}
                            d="M150 150 m-122 0 a122 122 0 1 1 244 0 a122 122 0 1 1 -244 0"
                        />
                    </defs>
                    <circle
                        cx="150"
                        cy="150"
                        r="140"
                        fill="none"
                        stroke="var(--inv-gold)"
                        strokeWidth="1.5"
                    />
                    <circle
                        cx="150"
                        cy="150"
                        r="104"
                        fill="none"
                        stroke="var(--inv-gold)"
                        strokeWidth="0.7"
                        opacity="0.7"
                    />
                    <g
                        className={
                            tier === 'full'
                                ? 'origin-center animate-[spin_60s_linear_infinite]'
                                : ''
                        }
                    >
                        <text
                            fill="var(--inv-gold)"
                            fontSize="13"
                            letterSpacing="4"
                            className="uppercase"
                        >
                            <textPath href={`#${id}`}>{ring.repeat(2)}</textPath>
                        </text>
                    </g>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="inv-display foil-text text-[clamp(4rem,22cqw,8rem)] leading-none">
                        {initial(facts.one)}
                        {facts.two && (
                            <>
                                <span className="inv-script mx-1 text-[0.45em] text-(--inv-primary)">
                                    {facts.and}
                                </span>
                                {initial(facts.two)}
                            </>
                        )}
                    </p>
                </div>
            </Reveal>
            <Reveal delay={260} className="mt-10">
                <Honorific />
                <h2 className="inv-display text-[clamp(2rem,8cqw,3.6rem)] leading-tight">
                    {facts.one}
                    {facts.two && (
                        <>
                            {' '}
                            <span className="inv-script text-(--inv-primary)">
                                {facts.and}
                            </span>{' '}
                            {facts.two}
                        </>
                    )}
                </h2>
                <LifeSpan />
            </Reveal>
            <Reveal delay={380} className="mt-4 max-w-xl text-base opacity-85">
                {facts.headline}
            </Reveal>
        </section>
    );
}

export function EditorialCover() {
    const { copy } = useInvite();
    const facts = useCoverFacts();
    return (
        <section className="relative flex min-h-svh flex-col justify-between px-[7cqw] py-[8svh]">
            <Reveal className="flex items-center justify-between text-[10px] tracking-[0.4em] uppercase opacity-75">
                <span>{copy('saveTheDate')}</span>
                <span>{facts.year}</span>
            </Reveal>
            <div className="relative">
                <Greeting />
                <Reveal delay={120}>
                    <h2
                        className="inv-display mt-6 leading-[0.82] font-light tracking-tight break-normal hyphens-none"
                        style={{ fontSize: fitDisplay([facts.one, facts.two], 21, 150) }}
                    >
                        <span className="block">{facts.one}</span>
                        {facts.two && (
                            <>
                                <span className="inv-script block ps-[18cqw] text-[0.5em] leading-[1.3] text-(--inv-primary)">
                                    {facts.and}
                                </span>
                                <span className="block text-end">{facts.two}</span>
                            </>
                        )}
                    </h2>
                    <LifeSpan />
                </Reveal>
            </div>
            <Reveal
                delay={260}
                className="grid grid-cols-[1fr_auto] items-end gap-6 border-t border-(--inv-gold) pt-5"
            >
                <p className="max-w-[34ch] text-sm leading-relaxed opacity-85">{facts.headline}</p>
                <p className="inv-display text-end text-xl leading-tight">{facts.dateText}</p>
            </Reveal>
        </section>
    );
}
