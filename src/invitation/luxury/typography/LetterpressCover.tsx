// "Letterpress": the cover as a heavy cotton card on a table. The couple's names are pressed into
// it letter by letter and filled with gold foil, between engraved flourishes and filigree corners;
// a sheen follows the guest's pointer across the foil (on phones it drifts by itself). The date
// and venue sit beneath in small letterpressed capitals.
import { mixHex } from '@shared/materials';
import { type CSSProperties, type PointerEvent, useRef } from 'react';

import { useInvite } from '../../context';
import { Editable, useEditing } from '../../editing';
import { useCoverFacts } from '../../sections/covers';
import { paperGrain } from '../materials';
import { EmbossedText } from './EmbossedText';
import { Filigree, Flourish } from './ornaments';

export function LetterpressCover() {
    const { data, tier, t, copy } = useInvite();
    const facts = useCoverFacts();
    const editing = useEditing();
    const { palette } = data.invitation.design;
    const card = useRef<HTMLDivElement>(null);
    const first = data.events[0];

    // The sheen tracks the pointer across the card; no React state, just one CSS variable.
    const follow = (e: PointerEvent<HTMLDivElement>) => {
        const el = card.current;
        if (!el || e.pointerType !== 'mouse') return;
        const box = el.getBoundingClientRect();
        el.style.setProperty('--sheen', `${String(((e.clientX - box.left) / box.width) * 100)}%`);
    };

    const room = `radial-gradient(ellipse 70% 55% at 50% 45%, ${mixHex(palette.bg, '#ffffff', 0.25)} 0%, ${palette.bg} 60%, ${mixHex(palette.bg, '#000000', 0.12)} 100%)`;
    const table: CSSProperties = { background: room };
    const paper: CSSProperties = {
        backgroundImage: `${paperGrain}, linear-gradient(165deg, #fffdf8 0%, ${mixHex('#f5ecdc', palette.gold, 0.08)} 100%)`,
        color: '#3a2a20',
        boxShadow: '0 40px 70px -30px rgba(0,0,0,0.45), 0 3px 8px rgba(0,0,0,0.08)',
    };
    const small: CSSProperties = {
        color: 'rgba(80,58,40,0.62)',
        textShadow: '0 1px 0 rgba(255,255,255,0.9), 0 -1px 0 rgba(60,40,20,0.35)',
    };
    const ink = { color: mixHex(palette.gold, '#000000', 0.3) };
    return (
        <section
            className="relative flex min-h-[var(--inv-screen,100svh)] items-center justify-center px-[5cqw] py-[calc(var(--inv-screen,100svh)*0.08)]"
            style={table}
        >
            <div
                ref={card}
                onPointerMove={follow}
                className={`relative w-full max-w-xl px-[9cqw] py-[clamp(3.5rem,16cqw,6rem)] text-center ${tier === 'static' ? '' : 'animate-[letterpress-sheen_7s_ease-in-out_infinite_alternate] motion-reduce:animate-none'}`}
                style={paper}
            >
                <Filigree at="top-start" />
                <Filigree at="top-end" delay={0.2} />
                <Filigree at="bottom-start" delay={0.4} />
                <Filigree at="bottom-end" delay={0.6} />
                {(facts.greeting ?? facts.guest) && (
                    <p className="text-[11px] tracking-[0.42em] uppercase" style={ink}>
                        {facts.guest
                            ? `${copy('dearGuest')} ${facts.guest.name}`
                            : facts.greeting
                              ? t(facts.greeting.text)
                              : ''}
                    </p>
                )}
                <Flourish className="mx-auto mt-4 w-[min(46cqw,190px)]" />
                <h1 className="inv-display mt-6 text-[clamp(2.8rem,13cqw,5.4rem)] leading-[1.05]">
                    {editing ? (
                        <Editable path="people.one.name">{facts.one}</Editable>
                    ) : (
                        <EmbossedText text={facts.one} delay={0.3} />
                    )}
                </h1>
                {facts.two && (
                    <>
                        <p className="inv-script my-1 text-[clamp(1.6rem,7cqw,2.4rem)]" style={ink}>
                            {facts.and}
                        </p>
                        <p className="inv-display text-[clamp(2.8rem,13cqw,5.4rem)] leading-[1.05]">
                            {editing ? (
                                <Editable path="people.two.name">{facts.two}</Editable>
                            ) : (
                                <EmbossedText text={facts.two} delay={0.9} />
                            )}
                        </p>
                    </>
                )}
                <Flourish className="mx-auto mt-6 w-[min(46cqw,190px)]" />
                {facts.headline && (
                    <p className="mx-auto mt-5 max-w-[30ch] text-[clamp(0.85rem,3.4cqw,1rem)] leading-relaxed text-[#6b5a4c]">
                        <Editable path="headline" multiline>
                            {facts.headline}
                        </Editable>
                    </p>
                )}
                {facts.dateText && (
                    <p
                        className="mt-6 text-[clamp(0.7rem,2.8cqw,0.85rem)] font-semibold tracking-[0.32em] uppercase"
                        style={small}
                    >
                        {facts.dateText}
                    </p>
                )}
                {first?.venue && (
                    <p
                        className="mt-2 text-[clamp(0.65rem,2.5cqw,0.78rem)] tracking-[0.28em] uppercase"
                        style={ink}
                    >
                        {first.venue}
                    </p>
                )}
            </div>
        </section>
    );
}
