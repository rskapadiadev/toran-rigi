// Section dividers, chosen per section (SectionConfig.divider): the ornament that sits between a
// chapter's title and its words. Each is engraved in gold and draws itself in with the pen, like the
// flourishes; 'medallion' is the couple's own generative ornament, the long-standing default.
import type { DividerKind } from '@shared/types';
import { createContext, type ReactNode, use } from 'react';

import { GenerativeOrnament } from '../../../motion/GenerativeOrnament';
import { useInvite } from '../../context';
import { DiyaGarland } from './DiyaGarland';
import { Bead, Flourish, Line } from './ornaments';

// Set by each section's Scene; undefined means "the layout's own default".
export const DividerContext = createContext<DividerKind | undefined>(undefined);

function Medallion() {
    const { data } = useInvite();
    return (
        <div className="mx-auto my-6 flex w-24 items-center justify-center" aria-hidden>
            <GenerativeOrnament
                kind={data.invitation.design.generative.kind}
                seed={data.invitation.seed + 7}
                className="w-full"
                duration={1800}
            />
        </div>
    );
}

interface FrameProps {
    view: string;
    children: ReactNode;
}

function Frame({ view, children }: FrameProps) {
    return (
        <svg
            viewBox={view}
            className="mx-auto my-6 w-[min(60cqw,240px)] overflow-visible"
            aria-hidden
        >
            {children}
        </svg>
    );
}

// A lotus opening at the centre, its stems running out into fine rules.
function Lotus() {
    return (
        <Frame view="0 0 240 44">
            <Line d="M120 34 C112 26 110 14 120 4 C130 14 128 26 120 34 Z" />
            <Line d="M120 34 C106 32 98 22 100 12 C110 16 116 24 120 34" delay={0.3} />
            <Line d="M120 34 C134 32 142 22 140 12 C130 16 124 24 120 34" delay={0.3} />
            <Line
                d="M120 34 C100 38 88 30 84 22 M120 34 C140 38 152 30 156 22"
                delay={0.6}
                width={0.9}
                opacity={0.8}
            />
            <Line d="M80 34 L8 34 M160 34 L232 34" delay={0.8} width={0.8} opacity={0.7} />
            <Bead cx={6} cy={34} r={1.8} delay={2} />
            <Bead cx={234} cy={34} r={1.8} delay={2} />
        </Frame>
    );
}

// Two paisleys (buta) bowing to a centre bead, a rule flowing from each tail.
function Paisley() {
    const buta = (mirror: boolean) => (
        <g transform={mirror ? 'matrix(-1 0 0 1 240 0)' : undefined}>
            <Line d="M108 22 C108 12 98 6 90 10 C82 14 84 26 94 28 C102 30 108 26 108 22 Z" />
            <Line d="M96 18 C92 18 92 24 96 24" delay={0.6} width={0.8} />
            <Line
                d="M90 10 C80 6 74 14 64 16 C50 19 30 18 10 22"
                delay={0.5}
                width={0.9}
                opacity={0.8}
            />
            <Bead cx={8} cy={22} r={1.6} delay={2} />
        </g>
    );
    return (
        <Frame view="0 0 240 40">
            {buta(false)}
            {buta(true)}
            <Bead cx={120} cy={20} r={2.6} delay={0.9} />
        </Frame>
    );
}

// Art Deco: a stepped fan over a long double rule, Gatsby-era.
function Deco() {
    return (
        <Frame view="0 0 240 44">
            <Line d="M96 36 L120 8 L144 36" />
            <Line d="M104 36 L120 18 L136 36" delay={0.2} width={0.9} />
            <Line d="M112 36 L120 27 L128 36" delay={0.4} width={0.8} />
            <Line d="M120 8 L120 36" delay={0.5} width={0.6} opacity={0.6} />
            <Line d="M10 36 L230 36 M24 40 L216 40" delay={0.7} width={0.8} opacity={0.75} />
            <Line d="M82 36 L74 28 L66 36 M158 36 L166 28 L174 36" delay={1} width={0.8} />
        </Frame>
    );
}

// The quietest: one hairline with a bead at its heart.
function Hairline() {
    return (
        <Frame view="0 0 240 12">
            <Line d="M40 6 L114 6 M126 6 L200 6" width={0.8} />
            <Bead cx={120} cy={6} r={2.2} delay={0.7} />
        </Frame>
    );
}

interface DividerProps {
    // The layout's own choice when the section has not picked one.
    fallback?: DividerKind;
}

export function SectionDivider({ fallback = 'medallion' }: DividerProps) {
    const chosen = use(DividerContext) ?? fallback;
    switch (chosen) {
        case 'flourish':
            return <Flourish />;
        case 'lotus':
            return <Lotus />;
        case 'paisley':
            return <Paisley />;
        case 'deco':
            return <Deco />;
        case 'line':
            return <Hairline />;
        case 'diya':
            return <DiyaGarland />;
        case 'medallion':
            return <Medallion />;
    }
}
