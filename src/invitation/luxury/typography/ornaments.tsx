// Engraved ornaments in gold that draw themselves in when they come into view: a scrolling
// flourish (divider) and filigree corners. One stroke style for the whole set, so every page that
// uses them reads as the same engraver's hand. Still devices get them fully drawn.
import { m } from 'motion/react';
import type { ReactNode } from 'react';

import { useInvite } from '../../context';

interface DrawProps {
    d: string;
    width?: number;
    delay?: number;
    opacity?: number;
}

// One engraved line: drawn from end to end with the pen, once, when it scrolls into view.
export function Line({ d, width = 1.2, delay = 0, opacity = 1 }: DrawProps) {
    const { tier } = useInvite();
    const common = {
        d,
        fill: 'none',
        stroke: 'var(--inv-gold)',
        strokeWidth: width,
        strokeLinecap: 'round' as const,
        strokeOpacity: opacity,
        vectorEffect: 'non-scaling-stroke' as const,
    };
    if (tier === 'static') return <path {...common} />;
    const hidden = { pathLength: 0 };
    const drawn = { pathLength: 1 };
    const pen = {
        duration: 1.6,
        delay,
        ease: [0.45, 0, 0.2, 1] as const,
    };
    const once = {
        once: true,
        margin: '-40px',
    };
    return (
        <m.path {...common} initial={hidden} whileInView={drawn} viewport={once} transition={pen} />
    );
}

// A dot of gold that lands after the line reaches it.
export function Bead({
    cx,
    cy,
    r = 2.2,
    delay = 0,
}: {
    cx: number;
    cy: number;
    r?: number;
    delay?: number;
}) {
    const { tier } = useInvite();
    const dot = {
        cx,
        cy,
        r,
        fill: 'var(--inv-gold)',
    };
    if (tier === 'static') return <circle {...dot} />;
    const hidden = {
        scale: 0,
        opacity: 0,
    };
    const shown = {
        scale: 1,
        opacity: 1,
    };
    const pop = {
        duration: 0.4,
        delay,
    };
    const once = { once: true };
    return (
        <m.circle {...dot} initial={hidden} whileInView={shown} viewport={once} transition={pop} />
    );
}

interface FlourishProps {
    className?: string;
}

// A symmetric engraved flourish: a centre lozenge, scrolls curling outward, tapering tails.
export function Flourish({ className = 'mx-auto my-6 w-[min(60cqw,260px)]' }: FlourishProps) {
    const half = (mirror: boolean): ReactNode => (
        <g transform={mirror ? 'matrix(-1 0 0 1 240 0)' : undefined}>
            <Line d="M106 20 C90 20 82 8 70 8 C58 8 56 22 66 24 C74 26 76 16 70 14" delay={0.3} />
            <Line d="M70 14 C54 30 30 30 14 20 C10 18 6 20 4 20" delay={0.7} width={0.9} />
            <Line d="M88 22 C80 32 66 34 58 30" delay={0.9} width={0.8} opacity={0.7} />
            <Bead cx={4} cy={20} r={1.8} delay={1.9} />
        </g>
    );
    return (
        <svg viewBox="0 0 240 40" className={className} aria-hidden>
            <Line d="M120 10 L130 20 L120 30 L110 20 Z" />
            <Bead cx={120} cy={20} r={2.6} delay={0.6} />
            {half(false)}
            {half(true)}
        </svg>
    );
}

interface CornerProps {
    // Which corner; the drawing is the top-left corner, mirrored for the others.
    at: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
    delay?: number;
}

const placement: Record<CornerProps['at'], string> = {
    'top-start': 'start-0 top-0',
    'top-end': 'end-0 top-0 -scale-x-100',
    'bottom-start': 'start-0 bottom-0 -scale-y-100',
    'bottom-end': 'end-0 bottom-0 -scale-100',
};

// Filigree for one corner of a page: two framing rules that meet in a curl, with a leaf and beads.
export function Filigree({ at, delay = 0 }: CornerProps) {
    return (
        <svg
            viewBox="0 0 90 90"
            className={`pointer-events-none absolute size-[clamp(3.6rem,16cqw,5.6rem)] rtl:-scale-x-100 ${placement[at]}`}
            aria-hidden
        >
            <Line d="M8 86 L8 26 C8 14 14 8 26 8 L86 8" delay={delay} />
            <Line
                d="M14 86 L14 30 C14 20 20 14 30 14 L86 14"
                delay={delay + 0.15}
                width={0.7}
                opacity={0.6}
            />
            <Line
                d="M24 24 C34 22 40 30 36 36 C32 42 24 38 26 32 C28 26 36 28 34 32"
                delay={delay + 0.6}
                width={1}
            />
            <Line d="M36 36 C46 46 58 44 66 36" delay={delay + 0.9} width={0.8} opacity={0.75} />
            <Line d="M36 36 C46 46 44 58 36 66" delay={delay + 0.9} width={0.8} opacity={0.75} />
            <Bead cx={70} cy={33} r={1.8} delay={delay + 2} />
            <Bead cx={33} cy={70} r={1.8} delay={delay + 2} />
        </svg>
    );
}
