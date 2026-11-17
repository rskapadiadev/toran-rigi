// Letterpress lettering: the text is first pressed into the paper (blind deboss: lit lower edge,
// shadowed upper edge, no ink), then gold foil floods into it from the start of the line. Latin and
// Indic text arrive letter by letter; joined scripts (Arabic, Urdu) arrive as one word so their
// letters never break apart. A sheen follows the pointer when the parent passes `--sheen`.
import { m } from 'motion/react';
import type { CSSProperties } from 'react';

import { useInvite } from '../../context';
import { foil } from '../materials';

interface EmbossedProps {
    text: string;
    // When this line's foil starts, in seconds after it comes into view.
    delay?: number;
    className?: string;
}

// Arabic, Urdu, Hebrew and Syriac join or shape across letters: animate them as whole words.
const joined = /[֐-ࣿיִ-ﻼ]/;

function graphemes(text: string): string[] {
    const Segmenter = (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
    if (!Segmenter) return Array.from(text);
    return Array.from(
        new Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
        (s) => s.segment,
    );
}

export function EmbossedText({ text, delay = 0, className = '' }: EmbossedProps) {
    const { data, tier, dir } = useInvite();
    const gold = data.invitation.design.palette.gold;
    const still = tier === 'static';
    const pressed: CSSProperties = {
        color: 'transparent',
        textShadow: '0 1px 0 rgba(255,255,255,0.85), 0 -1px 0 rgba(60,40,20,0.28)',
    };
    const foiled: CSSProperties = {
        backgroundImage: `linear-gradient(100deg, transparent calc(var(--sheen, 50%) - 14%), rgba(255,255,255,0.75) var(--sheen, 50%), transparent calc(var(--sheen, 50%) + 14%)), ${foil(gold)}`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
    };
    const units = joined.test(text) ? [text] : graphemes(text);
    const once = {
        once: true,
        margin: '-40px',
    };
    // The foil floods in after the last letter is pressed, through a soft-edged mask.
    const floodAt = delay + units.length * 0.07 + 0.3;
    const flood: CSSProperties = {
        ...foiled,
        maskImage: `linear-gradient(${dir === 'rtl' ? 270 : 90}deg, #000 40%, transparent 60%)`,
        WebkitMaskImage: `linear-gradient(${dir === 'rtl' ? 270 : 90}deg, #000 40%, transparent 60%)`,
        maskSize: '250% 100%',
        WebkitMaskSize: '250% 100%',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
    };
    // The opaque end of the mask sweeps across the text from where the line begins.
    const from = dir === 'rtl' ? '0% 0' : '100% 0';
    const to = dir === 'rtl' ? '100% 0' : '0% 0';
    const dry = {
        maskPosition: from,
        WebkitMaskPosition: from,
    };
    const wet = {
        maskPosition: to,
        WebkitMaskPosition: to,
    };
    const pour = {
        duration: 1.4,
        delay: floodAt,
        ease: [0.4, 0, 0.2, 1] as const,
    };
    if (still)
        return (
            <span className={`relative inline-block ${className}`}>
                <span aria-hidden style={pressed}>
                    {text}
                </span>
                <span className="absolute inset-0" style={foiled}>
                    {text}
                </span>
            </span>
        );
    return (
        <span className={`relative inline-block ${className}`}>
            {/* Screen readers hear the words once; the letters below are decoration. */}
            <span className="sr-only">{text}</span>
            {/* The impression in the paper, letter by letter. */}
            <span aria-hidden>
                {units.map((u, i) => {
                    const hidden = {
                        opacity: 0,
                        scale: 1.25,
                    };
                    const shown = {
                        opacity: 1,
                        scale: 1,
                    };
                    const press = {
                        duration: 0.45,
                        delay: delay + i * 0.07,
                        ease: [0.2, 0.7, 0.2, 1] as const,
                    };
                    return (
                        <m.span
                            key={`${u}-${String(i)}`}
                            className="inline-block whitespace-pre"
                            style={pressed}
                            initial={hidden}
                            whileInView={shown}
                            viewport={once}
                            transition={press}
                        >
                            {u}
                        </m.span>
                    );
                })}
            </span>
            {/* Then the foil, poured into the impression. */}
            <m.span
                aria-hidden
                className="absolute inset-0 whitespace-pre"
                style={flood}
                initial={dry}
                whileInView={wet}
                viewport={once}
                transition={pour}
            >
                {text}
            </m.span>
        </span>
    );
}
