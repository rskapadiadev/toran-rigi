// Names written in ink: the pen first traces every letter's outline in gold, then the ink floods
// in. Works for any script, since it draws the font's own outlines (Latin script, Devanagari,
// Gujarati, Nastaliq…). The drawing is measured after the fonts load so long names always fit.
import { m } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';

import { useInvite } from '../../context';

interface CalligraphyProps {
    text: string;
    // When the pen starts, in seconds after the line comes into view.
    delay?: number;
    // How long the pen takes to trace the outline.
    duration?: number;
    // 'script' for flowing names, 'display' for engraved capitals.
    face?: 'script' | 'display';
    className?: string;
}

// The pen's ink: long enough to cover any outline, so the trace always reaches the end.
const DASH = 4000;

export function Calligraphy({
    text,
    delay = 0,
    duration = 2.6,
    face = 'script',
    className = '',
}: CalligraphyProps) {
    const { tier, dir } = useInvite();
    const ref = useRef<SVGTextElement>(null);
    const [box, setBox] = useState('0 0 1000 240');

    // Fit the drawing to the written word once its font is ready.
    useLayoutEffect(() => {
        let live = true;
        const fit = () => {
            const el = ref.current;
            if (!el || !live) return;
            const b = el.getBBox();
            if (b.width > 0)
                setBox(
                    `${String(b.x - 20)} ${String(b.y - 10)} ${String(b.width + 40)} ${String(b.height + 20)}`,
                );
        };
        fit();
        void document.fonts.ready.then(fit);
        return () => {
            live = false;
        };
    }, [text]);

    const font = face === 'script' ? 'inv-script' : 'inv-display';
    const shape = {
        x: 0,
        y: 180,
        fontSize: 190,
        direction: dir,
        stroke: 'var(--inv-gold)',
        strokeWidth: 2.2,
        strokeLinejoin: 'round' as const,
    };
    if (tier === 'static')
        return (
            <svg viewBox={box} className={className} role="img" aria-label={text}>
                <text ref={ref} className={font} {...shape} fill="var(--inv-gold)">
                    {text}
                </text>
            </svg>
        );
    const blank = {
        strokeDashoffset: DASH,
        fillOpacity: 0,
    };
    const written = {
        strokeDashoffset: 0,
        fillOpacity: 1,
    };
    const pen = {
        strokeDashoffset: {
            duration,
            delay,
            ease: [0.45, 0.05, 0.35, 1] as const,
        },
        fillOpacity: {
            duration: 1.1,
            delay: delay + duration * 0.7,
            ease: 'easeOut' as const,
        },
    };
    const once = {
        once: true,
        margin: '-30px',
    };
    return (
        <svg viewBox={box} className={className} role="img" aria-label={text}>
            <m.text
                ref={ref}
                className={font}
                {...shape}
                fill="var(--inv-gold)"
                strokeDasharray={DASH}
                initial={blank}
                whileInView={written}
                viewport={once}
                transition={pen}
            >
                {text}
            </m.text>
        </svg>
    );
}
