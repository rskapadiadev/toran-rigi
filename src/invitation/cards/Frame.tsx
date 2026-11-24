// The ground and frames the cards share, drawn from the invitation's own design: its colours, the
// family's motif woven into the paper, the tradition's archway, engraved corners.
import { archPath } from '@shared/arches';
import { isDark, mixHex } from '@shared/materials';
import { cultureMotifs, motifs } from '@shared/motifs';
import { type ReactNode, useEffect, useId, useRef } from 'react';

import { useInvite } from '../context';
import { paperGrain } from '../luxury/materials';

export interface Box {
    width: number;
    height: number;
}

// How far apart two colours are, 0 to 441.
function distance(a: string, b: string): number {
    const channels = (hex: string) =>
        [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) || 0);
    const [x, y] = [channels(a), channels(b)];
    return Math.hypot(...x.map((v, i) => v - (y[i] ?? 0)));
}

// Colours worked out once from the palette, readable on light and dark designs alike.
export function useTones() {
    const { data } = useInvite();
    const { palette } = data.invitation.design;
    const dark = isDark(palette.bg);
    // On a dark design a gold main colour makes a muddy frame: the surface colour stands in.
    const main =
        dark && distance(palette.primary, palette.gold) < 90 ? palette.surface : palette.primary;
    return {
        dark,
        bg: palette.bg,
        ink: palette.ink,
        gold: palette.gold,
        // Gold letters fade into a pale card: there they are struck deeper.
        goldInk: dark ? palette.gold : mixHex(palette.gold, '#3a2503', 0.38),
        // The frame round the arch: the main colour, deepened.
        frame: dark
            ? mixHex(main, palette.bg, main === palette.surface ? 0.1 : 0.62)
            : mixHex(main, '#ffffff', 0.12),
        onFrame: dark ? palette.gold : mixHex(palette.gold, '#ffffff', 0.35),
        muted: mixHex(palette.ink, palette.bg, 0.28),
    };
}

export function useMotif(): string[] {
    const { culture } = useInvite();
    const [first] = cultureMotifs[culture.id];
    return first ? motifs[first] : [];
}

interface MotifProps {
    x: number;
    y: number;
    size: number;
    fill: string;
    opacity?: number;
}

export function Motif({ x, y, size, fill, opacity = 1 }: MotifProps) {
    const paths = useMotif();
    const place = `translate(${String(x - size / 2)} ${String(y - size / 2)}) scale(${String(size / 100)})`;
    return (
        <g transform={place} fill={fill} opacity={opacity} fillRule="evenodd">
            {paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </g>
    );
}

// The paper: a soft glow of the main colour, the motif woven in, and a fine grain.
export function Ground({ width, height }: Box) {
    const tones = useTones();
    const { data } = useInvite();
    const { palette } = data.invitation.design;
    const id = useId();
    const glow = `radial-gradient(90% 55% at 50% 0%, ${palette.primary}${tones.dark ? '4d' : '24'}, transparent 70%), radial-gradient(80% 45% at 50% 100%, ${palette.gold}${tones.dark ? '24' : '2e'}, transparent 70%)`;
    return (
        <>
            <div
                className="absolute inset-0"
                style={{ background: `${glow}, ${tones.bg}` }}
                aria-hidden
            />
            <svg
                viewBox={`0 0 ${String(width)} ${String(height)}`}
                className="absolute inset-0 size-full"
                aria-hidden
            >
                <defs>
                    <pattern id={id} width="92" height="92" patternUnits="userSpaceOnUse">
                        <Motif x={23} y={23} size={26} fill={tones.gold} />
                        <Motif x={69} y={69} size={26} fill={tones.gold} />
                    </pattern>
                </defs>
                <rect
                    width={width}
                    height={height}
                    fill={`url(#${id})`}
                    opacity={tones.dark ? 0.07 : 0.1}
                />
            </svg>
            <div className="absolute inset-0" style={{ backgroundImage: paperGrain }} aria-hidden />
        </>
    );
}

// One corner's engraving (top-left), mirrored into the others.
function Corner() {
    const { gold } = useTones();
    const line = {
        fill: 'none',
        stroke: gold,
        strokeLinecap: 'round' as const,
    };
    return (
        <g>
            <path {...line} strokeWidth="1.6" d="M2 96 L2 24 C2 10 10 2 24 2 L96 2" />
            <path
                {...line}
                strokeWidth="0.8"
                opacity="0.65"
                d="M9 96 L9 30 C9 17 17 9 30 9 L96 9"
            />
            <path
                {...line}
                strokeWidth="1.2"
                d="M20 20 C32 17 40 27 35 35 C30 42 20 37 23 29 C26 22 35 25 33 32"
            />
            <path
                {...line}
                strokeWidth="1"
                opacity="0.8"
                d="M35 35 C47 48 63 45 74 34 M35 35 C48 47 45 63 34 74"
            />
            <path {...line} strokeWidth="0.8" opacity="0.6" d="M74 34 C82 27 88 28 94 24" />
            <path {...line} strokeWidth="0.8" opacity="0.6" d="M34 74 C27 82 28 88 24 94" />
            <circle cx="78" cy="29" r="2.4" fill={gold} />
            <circle cx="29" cy="78" r="2.4" fill={gold} />
        </g>
    );
}

interface RuledProps extends Box {
    inset: number;
}

// Two fine rules all round, with engraved corners and the motif at the middle of each long side.
export function RuledFrame({ width, height, inset }: RuledProps) {
    const tones = useTones();
    const size = 96;
    const at = (x: number, y: number, sx: number, sy: number) =>
        `translate(${String(x)} ${String(y)}) scale(${String(sx)} ${String(sy)})`;
    const far = {
        x: width - inset,
        y: height - inset,
    };
    return (
        <svg
            viewBox={`0 0 ${String(width)} ${String(height)}`}
            className="absolute inset-0 size-full"
            aria-hidden
        >
            <g stroke={tones.gold} fill="none">
                {[
                    [0, 1.6, 1],
                    [7, 0.8, 0.65],
                ].map(([off = 0, w = 1, o = 1]) => {
                    const d = inset + 2 + off;
                    const run = `M${String(inset + size)} ${String(d)} H${String(far.x - size)} M${String(inset + size)} ${String(height - d)} H${String(far.x - size)} M${String(d)} ${String(inset + size)} V${String(far.y - size)} M${String(width - d)} ${String(inset + size)} V${String(far.y - size)}`;
                    return <path key={off} d={run} strokeWidth={w} opacity={o} />;
                })}
            </g>
            <g transform={at(inset, inset, 1, 1)}>
                <Corner />
            </g>
            <g transform={at(far.x, inset, -1, 1)}>
                <Corner />
            </g>
            <g transform={at(inset, far.y, 1, -1)}>
                <Corner />
            </g>
            <g transform={at(far.x, far.y, -1, -1)}>
                <Corner />
            </g>
        </svg>
    );
}

interface ArchProps extends Box {
    // Where the arch's opening sits on the card.
    left: number;
    top: number;
    right: number;
}

// The tradition's doorway: everything round it in the frame colour, woven with the motif.
export function ArchFrame({ width, height, left, top, right }: ArchProps) {
    const { culture } = useInvite();
    const tones = useTones();
    const id = useId();
    const d = archPath(culture.id);
    // Arch drawings run from 20 to 280 across and 8 to 470 down; the legs run off the card's foot.
    const sx = (right - left) / 260;
    const sy = (height + 40 - top) / 462;
    const place = `translate(${String(left - 20 * sx)} ${String(top - 8 * sy)}) scale(${String(sx)} ${String(sy)})`;
    return (
        <svg
            viewBox={`0 0 ${String(width)} ${String(height)}`}
            className="absolute inset-0 size-full"
            aria-hidden
        >
            <defs>
                <mask id={`${id}m`}>
                    <rect width={width} height={height} fill="#fff" />
                    <path d={`${d} Z`} transform={place} fill="#000" />
                </mask>
                <pattern id={`${id}p`} width="56" height="56" patternUnits="userSpaceOnUse">
                    <Motif x={14} y={14} size={20} fill={tones.onFrame} />
                    <Motif x={42} y={42} size={20} fill={tones.onFrame} />
                </pattern>
            </defs>
            <g mask={`url(#${id}m)`}>
                <rect width={width} height={height} fill={tones.frame} />
                <rect width={width} height={height} fill={`url(#${id}p)`} opacity="0.4" />
            </g>
            <g fill="none" stroke={tones.gold}>
                <path d={d} transform={place} strokeWidth="3" vectorEffect="non-scaling-stroke" />
                <path
                    d={d}
                    transform={`translate(${String(width / 2)} ${String(height)}) scale(0.955 0.968) translate(${String(-width / 2)} ${String(-height)}) ${place}`}
                    strokeWidth="1"
                    opacity="0.75"
                    vectorEffect="non-scaling-stroke"
                />
            </g>
        </svg>
    );
}

// A woven border along the foot of a card: motifs between two rules.
export function MotifBand({ width, height, y }: Box & { y: number }) {
    const tones = useTones();
    const step = 42;
    const count = Math.ceil(width / step) + 1;
    const start = (width - (count - 1) * step) / 2;
    return (
        <svg
            viewBox={`0 0 ${String(width)} ${String(height)}`}
            className="absolute inset-0 size-full"
            aria-hidden
        >
            <rect y={y} width={width} height={height - y} fill={tones.frame} />
            <path
                d={`M0 ${String(y)} H${String(width)} M0 ${String(y + 5)} H${String(width)}`}
                stroke={tones.gold}
                strokeWidth="1.4"
            />
            {Array.from({ length: count }, (_, i) => (
                <Motif
                    key={i}
                    x={start + i * step}
                    y={y + 5 + (height - y - 5) / 2}
                    size={26}
                    fill={tones.onFrame}
                    opacity={0.9}
                />
            ))}
        </svg>
    );
}

// An engraved divider: a lozenge, two scrolls and tapering tails.
export function Divider({ width = 190 }: { width?: number }) {
    const tones = useTones();
    const half = (
        <g>
            <path d="M106 20 C90 20 82 8 70 8 C58 8 56 22 66 24 C74 26 76 16 70 14" />
            <path d="M70 14 C54 30 30 30 14 20 C10 18 6 20 4 20" strokeWidth="0.9" />
            <path d="M88 22 C80 32 66 34 58 30" strokeWidth="0.8" opacity="0.7" />
            <circle cx="4" cy="20" r="1.8" fill={tones.goldInk} stroke="none" />
        </g>
    );
    return (
        <svg viewBox="0 0 240 40" width={width} className="mx-auto block" aria-hidden>
            <g
                fill="none"
                stroke={tones.goldInk}
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M120 10 L130 20 L120 30 L110 20 Z" />
                <circle cx="120" cy="20" r="2.6" fill={tones.goldInk} stroke="none" />
                {half}
                <g transform="matrix(-1 0 0 1 240 0)">{half}</g>
            </g>
        </svg>
    );
}

interface FitProps {
    className?: string;
    children: ReactNode;
}

// Words always fit their space: a long list or a long name shrinks, and is never cut off.
export function Fit({ className = '', children }: FitProps) {
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const room = outer.current;
        const words = inner.current;
        if (!room || !words) return;
        const fit = () => {
            words.style.transform = '';
            const scale = Math.min(
                1,
                room.clientHeight / words.scrollHeight,
                room.clientWidth / words.scrollWidth,
            );
            if (scale < 1) words.style.transform = `scale(${String(scale)})`;
            room.dataset.fit = scale.toFixed(2);
        };
        fit();
        let live = true;
        void document.fonts.ready.then(() => {
            if (live) fit();
        });
        return () => {
            live = false;
        };
    });
    return (
        <div
            ref={outer}
            className={`absolute flex flex-col items-center justify-center overflow-hidden text-center ${className}`}
        >
            <div ref={inner} className="flex w-full shrink-0 flex-col items-center">
                {children}
            </div>
        </div>
    );
}
