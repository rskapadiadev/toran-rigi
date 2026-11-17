// "Illuminated": a text chapter set like a page from an illuminated manuscript. Filigree corners
// engrave themselves in, the kicker sits between drawn flourishes, the first letter is painted in
// gold foil on a tile of the couple's own medallion, and the words settle in from the top like ink
// soaking into cotton paper. For Latin scripts only the initial is illuminated; every script gets
// the page, the ornaments and the ink.
import { mixHex } from '@shared/materials';
import { m } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';

import { GenerativeOrnament } from '../../../motion/GenerativeOrnament';
import { useInvite } from '../../context';
import { useEditing } from '../../editing';
import { foilInk, paperGrain } from '../materials';
import { SectionDivider } from './dividers';
import { Filigree } from './ornaments';

interface InitialProps {
    letter: string;
}

// The painted initial: a square tile of the couple's medallion, a foil letter, a fine gold frame.
function IlluminatedInitial({ letter }: InitialProps) {
    const { data } = useInvite();
    const { palette, generative } = data.invitation.design;
    const tile: CSSProperties = {
        background: `radial-gradient(circle at 35% 30%, ${mixHex(palette.primary, '#ffffff', 0.12)}, ${mixHex(palette.primary, '#000000', 0.35)})`,
        boxShadow: `inset 0 0 0 1px ${palette.gold}, inset 0 0 0 4px ${mixHex(palette.primary, '#000000', 0.35)}, inset 0 0 0 5px ${palette.gold}88, 0 6px 14px -6px rgba(0,0,0,0.45)`,
    };
    return (
        <span
            aria-hidden
            className="relative float-start me-3 mt-1 mb-1 flex size-[clamp(3.6rem,15cqw,4.8rem)] items-center justify-center overflow-hidden rounded-[2px]"
            style={tile}
        >
            <GenerativeOrnament
                kind={generative.kind}
                seed={data.invitation.seed + 5}
                draw={false}
                className="absolute inset-[-20%] size-[140%] opacity-35"
            />
            <span
                className="inv-display relative text-[clamp(2.6rem,11cqw,3.6rem)] leading-none"
                style={foilInk(palette.gold)}
            >
                {letter}
            </span>
        </span>
    );
}

interface IlluminatedProps {
    kicker?: string;
    // The chapter's words, plain (for the initial) and as rendered (editable in the studio).
    raw: string;
    body: ReactNode;
    large?: boolean;
    // Prose gets the painted initial; a list of names (the family) keeps its first letter.
    initial?: boolean;
}

export function Illuminated({
    kicker,
    raw,
    body,
    large = false,
    initial = true,
}: IlluminatedProps) {
    const { data, locale, tier } = useInvite();
    const editing = useEditing();
    const { palette } = data.invitation.design;
    // Initials join correctly only in Latin scripts; Indic and Arabic text keeps its first letter.
    const first = Array.from(raw.trim())[0] ?? '';
    // In the studio the whole text stays editable, so the initial waits for guests.
    const illuminate = initial && !editing && locale === 'en' && /[A-Za-z]/.test(first);
    const rest = raw.trim().slice(first.length);
    const page: CSSProperties = {
        backgroundImage: `${paperGrain}, linear-gradient(170deg, ${mixHex('#fdf8ee', palette.surface, 0.2)}, ${mixHex('#f1e6d1', palette.surface, 0.2)})`,
        color: '#2d2018',
        boxShadow: '0 30px 60px -28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.08)',
    };
    const text = `${large ? 'inv-display text-[clamp(1.3rem,4.6cqw,2.1rem)] leading-snug' : 'text-[clamp(1rem,3.8cqw,1.2rem)] leading-relaxed'} text-start`;
    const ink = {
        clipPath: 'inset(0 0 100% 0)',
        opacity: 0.2,
    };
    const dry = {
        clipPath: 'inset(0 0 -10% 0)',
        opacity: 1,
    };
    const soak = {
        duration: 1.8,
        delay: 0.5,
        ease: [0.3, 0, 0.2, 1] as const,
    };
    const once = {
        once: true,
        margin: '-60px',
    };
    const words = illuminate ? (
        <p className={text} dir="auto">
            <span className="sr-only">{raw}</span>
            <span aria-hidden>
                <IlluminatedInitial letter={first.toUpperCase()} />
                <span className="whitespace-pre-line">{rest}</span>
            </span>
        </p>
    ) : (
        <p className={`${text} whitespace-pre-line`} dir="auto">
            {body}
        </p>
    );
    return (
        <section className="px-[5cqw] py-20">
            <div
                className="relative mx-auto max-w-2xl px-[10cqw] py-[clamp(3rem,14cqw,5rem)]"
                style={page}
            >
                <Filigree at="top-start" />
                <Filigree at="top-end" delay={0.2} />
                <Filigree at="bottom-start" delay={0.4} />
                <Filigree at="bottom-end" delay={0.6} />
                {kicker && (
                    <div className="text-center">
                        <SectionDivider fallback="flourish" />
                        <p
                            className="my-3 text-[11px] tracking-[0.45em] uppercase"
                            style={{ color: mixHex(palette.gold, '#000000', 0.2) }}
                        >
                            {kicker}
                        </p>
                    </div>
                )}
                {tier === 'static' ? (
                    words
                ) : (
                    <m.div initial={ink} whileInView={dry} viewport={once} transition={soak}>
                        {words}
                    </m.div>
                )}
                <SectionDivider fallback="flourish" />
            </div>
        </section>
    );
}
