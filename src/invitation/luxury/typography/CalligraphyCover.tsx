// "Calligraphy": a quiet page and the couple's names written across it in gold ink, one after the
// other, as if by hand. Then the "and", the headline and the date settle in beneath. Their
// medallion breathes faintly behind, the only ornament on the page.
import { mixHex } from '@shared/materials';
import { m } from 'motion/react';
import type { CSSProperties } from 'react';

import { GenerativeOrnament } from '../../../motion/GenerativeOrnament';
import { useInvite } from '../../context';
import { Editable, useEditing } from '../../editing';
import { useCoverFacts } from '../../sections/covers';
import { Calligraphy } from './Calligraphy';

export function CalligraphyCover() {
    const { data, tier, t, copy } = useInvite();
    const facts = useCoverFacts();
    const editing = useEditing();
    const { palette, generative } = data.invitation.design;
    const still = tier === 'static';
    const glow = `radial-gradient(ellipse 75% 60% at 50% 42%, ${mixHex(palette.bg, '#ffffff', 0.18)} 0%, ${palette.bg} 70%)`;
    const page: CSSProperties = { background: glow };
    // Written one after the other: the second name waits for the first to dry.
    const second = 2.7;
    const after = facts.two ? second + 2.4 : 2.4;
    const hidden = {
        opacity: 0,
        y: 10,
    };
    const shown = {
        opacity: 1,
        y: 0,
    };
    const settle = (at: number) => ({
        duration: 1,
        delay: at,
        ease: [0.22, 1, 0.36, 1] as const,
    });
    const once = { once: true };
    const Fade = still ? 'div' : m.div;
    const fade = (at: number) =>
        still
            ? {}
            : {
                  initial: hidden,
                  whileInView: shown,
                  viewport: once,
                  transition: settle(at),
              };
    const greeting = facts.guest
        ? `${copy('dearGuest')} ${facts.guest.name}`
        : facts.greeting
          ? t(facts.greeting.text)
          : '';
    const name = 'mx-auto block h-[clamp(4.5rem,24cqw,9rem)] w-[min(92cqw,40rem)]';
    return (
        <section
            className="relative flex min-h-[var(--inv-screen,100svh)] flex-col items-center justify-center overflow-hidden px-6 py-[calc(var(--inv-screen,100svh)*0.1)] text-center"
            style={page}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.12]"
            >
                <GenerativeOrnament
                    kind={generative.kind}
                    seed={data.invitation.seed}
                    className={`w-[120vmin] max-w-none ${still ? '' : 'animate-[spin_160s_linear_infinite] motion-reduce:animate-none'}`}
                    draw={false}
                />
            </div>
            {greeting && (
                <Fade
                    className="relative text-[11px] tracking-[0.42em] uppercase opacity-75"
                    {...fade(0)}
                >
                    {greeting}
                </Fade>
            )}
            <h1 className="relative mt-[calc(var(--inv-screen,100svh)*0.05)]">
                {editing ? (
                    <span className="inv-script block text-[clamp(3rem,15cqw,6rem)] leading-tight text-(--inv-gold)">
                        <Editable path="people.one.name">{facts.one}</Editable>
                    </span>
                ) : (
                    <Calligraphy text={facts.one} delay={0.3} className={name} />
                )}
                {facts.two && (
                    <>
                        <Fade
                            className="inv-display my-1 text-[clamp(1.2rem,5cqw,1.8rem)] italic opacity-70"
                            {...fade(second - 0.4)}
                        >
                            {facts.and}
                        </Fade>
                        {editing ? (
                            <span className="inv-script block text-[clamp(3rem,15cqw,6rem)] leading-tight text-(--inv-gold)">
                                <Editable path="people.two.name">{facts.two}</Editable>
                            </span>
                        ) : (
                            <Calligraphy text={facts.two} delay={second} className={name} />
                        )}
                    </>
                )}
            </h1>
            <Fade className="relative mt-[calc(var(--inv-screen,100svh)*0.05)]" {...fade(after)}>
                <span className="mx-auto block h-px w-16 bg-(--inv-gold)" />
                {facts.headline && (
                    <p className="mx-auto mt-5 max-w-[32ch] text-[clamp(0.9rem,3.6cqw,1.1rem)] leading-relaxed opacity-85">
                        <Editable path="headline" multiline>
                            {facts.headline}
                        </Editable>
                    </p>
                )}
                {facts.dateText && (
                    <p className="mt-5 text-[12px] tracking-[0.4em] uppercase">{facts.dateText}</p>
                )}
            </Fade>
        </section>
    );
}
