// A small toran (door garland) strung across the top of the branding block, dressed for the
// occasion: marigold and mango leaves for weddings, pastel blooms and bells for joyful days,
// jasmine for prayers, a gold chain for formal events and white tuberose, held still, for remembrance.
import type { OccasionTone } from '@shared/occasions';
import { type CSSProperties, type RefObject, useEffect, useRef, useState } from 'react';

import { useInvite } from './context';

interface Look {
    beads: [string, string];
    stroke: string;
    leaf: string | null;
    drop: 'bell' | 'leaf' | 'tassel' | 'bud';
    dropColor: string;
    // Remembrance holds still.
    calm?: boolean;
}

const looks: Record<OccasionTone, Look> = {
    festive: {
        beads: ['#e8780c', '#f6b10a'],
        stroke: '#b85a06',
        leaf: '#4f7d2a',
        drop: 'bell',
        dropColor: '#d9a63c',
    },
    joyful: {
        beads: ['#f28fb0', '#ffd36b'],
        stroke: '#c2668a',
        leaf: '#7fae5a',
        drop: 'bell',
        dropColor: '#e2b84f',
    },
    serene: {
        beads: ['#fbf6ea', '#f6a10a'],
        stroke: '#b8ad98',
        leaf: '#5f8a3a',
        drop: 'leaf',
        dropColor: '#5f8a3a',
    },
    formal: {
        beads: ['#d9b25f', '#f1e4c0'],
        stroke: '#8a6a24',
        leaf: null,
        drop: 'tassel',
        dropColor: '#c9a24a',
    },
    solemn: {
        beads: ['#f7f3ea', '#e6dfd0'],
        stroke: '#b8ad98',
        leaf: '#7d8a5a',
        drop: 'bud',
        dropColor: '#efe8da',
        calm: true,
    },
};

// One swag of cord between two nails, 80px wide at its natural size, with two strands per swag.
const SWAG = 80;

function strandsFor(swags: number) {
    const width = swags * SWAG;
    return Array.from({ length: swags * 2 + 1 }, (_, i) => {
        const x = i * (SWAG / 2);
        // Longer in the middle, like a real toran over a doorway.
        const centre = Math.abs(x - width / 2) / (width / 2);
        return {
            x,
            beads: Math.round(5 - centre * 2),
            y0: i % 2 === 0 ? 8 : 18,
        };
    });
}

// How many swags fill the width; more on wider screens instead of stretching the garland.
function useSwagCount(ref: RefObject<HTMLDivElement | null>) {
    const [count, setCount] = useState(6);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const measure = () => {
            setCount(Math.max(3, Math.ceil(el.clientWidth / SWAG)));
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, [ref]);
    return count;
}

const swag = (a: number, b: number) => `M${String(a)} 8 Q${String((a + b) / 2)} 30 ${String(b)} 8`;

interface DropProps {
    look: Look;
    y: number;
}

function Drop({ look, y }: DropProps) {
    switch (look.drop) {
        case 'bell':
            return (
                <path
                    d={`M-4 ${String(y)} Q-4 ${String(y - 7)} 0 ${String(y - 7)} Q4 ${String(y - 7)} 4 ${String(y)} Z M-1 ${String(y + 1)} a1 1 0 1 0 2 0`}
                    fill={look.dropColor}
                />
            );
        case 'leaf':
            return (
                <path
                    d={`M0 ${String(y - 4)} Q5 ${String(y + 2)} 0 ${String(y + 9)} Q-5 ${String(y + 2)} 0 ${String(y - 4)} Z`}
                    fill={look.dropColor}
                />
            );
        case 'tassel':
            return <path d={`M-1 ${String(y - 3)} h2 l3 10 h-8 Z`} fill={look.dropColor} />;
        case 'bud':
            return <ellipse cx="0" cy={y + 2} rx="2.6" ry="4" fill={look.dropColor} />;
    }
}

export function BrandingToran() {
    const { occasion, tier } = useInvite();
    const look = looks[occasion.tone];
    const still = look.calm === true || tier === 'static';
    const box = useRef<HTMLDivElement>(null);
    const swags = useSwagCount(box);
    const W = swags * SWAG;
    const ANCHORS = Array.from({ length: swags + 1 }, (_, i) => i * SWAG);
    const STRANDS = strandsFor(swags);
    const size = {
        width: W + 24,
        height: 84,
    };
    return (
        <div ref={box} className="pointer-events-none flex w-full justify-center overflow-hidden">
            {/* Drawn at its natural size and centred; extra swags fill wider screens. */}
            <svg
                viewBox={`-12 6 ${String(W + 24)} 84`}
                className="block shrink-0"
                style={size}
                aria-hidden
            >
                {/* The cord, swagging between its nails, with a mango leaf tied at each nail. */}
                {ANCHORS.slice(0, -1).map((a, i) => (
                    <path
                        key={a}
                        d={swag(a, ANCHORS[i + 1] ?? W)}
                        fill="none"
                        stroke={look.stroke}
                        strokeWidth="1.4"
                    />
                ))}
                {look.leaf &&
                    ANCHORS.map((a) => (
                        <path
                            key={a}
                            d={`M${String(a)} 6 q-7 6 -2 16 q7 -6 2 -16 Z`}
                            fill={look.leaf ?? undefined}
                        />
                    ))}
                {STRANDS.map((s, i) => {
                    const style = {
                        transformOrigin: `${String(s.x)}px ${String(s.y0)}px`,
                        animationDelay: `${String((i % 4) * -0.6)}s`,
                        animationDuration: `${String(2.8 + (i % 3) * 0.5)}s`,
                    } as CSSProperties;
                    const end = s.y0 + s.beads * 8 + 6;
                    return (
                        <g key={s.x} className={still ? undefined : 'bt-strand'} style={style}>
                            <line
                                x1={s.x}
                                y1={s.y0}
                                x2={s.x}
                                y2={end - 6}
                                stroke={look.stroke}
                                strokeWidth="0.8"
                            />
                            {Array.from({ length: s.beads }, (_, k) => (
                                <circle
                                    key={k}
                                    cx={s.x}
                                    cy={s.y0 + 6 + k * 8}
                                    r="3.6"
                                    fill={look.beads[k % 2]}
                                    stroke={look.stroke}
                                    strokeOpacity="0.55"
                                    strokeWidth="0.6"
                                />
                            ))}
                            <g transform={`translate(${String(s.x)} 0)`}>
                                <Drop look={look} y={end} />
                            </g>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
