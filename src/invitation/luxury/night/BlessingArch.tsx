// The blessing: a cusped jharokha arch, its frame a band of the night paper edged in gold, holding
// the studio's vetted sacred art. Without art it holds the invitation's vetted greeting and a lamp,
// so nothing sacred is ever invented here.
import { photoUrl } from '@shared/photos';
import { useId } from 'react';

import { Reveal } from '../../../motion/Reveal';
import { useInvite } from '../../context';
import { useCoverFacts } from '../../sections/covers';
import { DiyaLamp } from '../typography/DiyaGarland';

interface Point {
    x: number;
    y: number;
}

// The arch's left edge from the spring of the arch up to its crown; the right edge mirrors it.
const SPINE: Point[] = [
    {
        x: 0,
        y: 64,
    },
    {
        x: 8,
        y: 47,
    },
    {
        x: 18,
        y: 33,
    },
    {
        x: 30,
        y: 21,
    },
    {
        x: 42,
        y: 11,
    },
    {
        x: 50,
        y: 0,
    },
];
const HEIGHT = 140;
const LOBE = 4.2;

// Each step between two points bows inward as a lobe, which is what makes the arch "cusped".
function lobes(points: Point[]) {
    let d = '';
    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        if (!a || !b) continue;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        // Perpendicular, pointing into the opening (down and towards the centre).
        const nx = (b.y - a.y) / len;
        const ny = -(b.x - a.x) / len;
        const flip = ny < 0 ? -1 : 1;
        d += ` Q${(mx + nx * LOBE * flip).toFixed(2)} ${(my + ny * LOBE * flip).toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
    }
    return d;
}

const mirror = (points: Point[]) =>
    [...points].reverse().map((p) => ({
        x: 100 - p.x,
        y: p.y,
    }));
// Open at the foot for the frame, like an arch standing on two legs; closed for the clip.
const OUTLINE = `M0 ${String(HEIGHT)} V64${lobes(SPINE)}${lobes(mirror(SPINE))} V${String(HEIGHT)}`;
const ARCH = `${OUTLINE} Z`;

export function BlessingArch() {
    const { data, t, locale } = useInvite();
    const { greeting } = useCoverFacts();
    const { palette, art } = data.invitation.design;
    const clip = useId();
    const band = `color-mix(in oklab, ${palette.bg} 72%, white)`;
    return (
        <section className="px-5 py-16">
            <Reveal from="blur" className="relative mx-auto w-[min(88cqw,420px)]">
                <svg
                    viewBox={`-6 -10 112 ${String(HEIGHT + 12)}`}
                    className="w-full overflow-visible"
                >
                    <defs>
                        <clipPath id={clip}>
                            <path d={ARCH} transform="translate(9 12) scale(0.82)" />
                        </clipPath>
                    </defs>
                    <path
                        d={OUTLINE}
                        fill="none"
                        stroke={band}
                        strokeWidth={7}
                        strokeLinejoin="round"
                    />
                    <path
                        d={OUTLINE}
                        fill="none"
                        stroke="var(--inv-gold)"
                        strokeWidth={0.5}
                        transform="translate(4 6) scale(0.92)"
                        strokeLinejoin="round"
                    />
                    <circle cx={50} cy={-6} r={1.6} fill="var(--inv-gold)" />
                    <g clipPath={`url(#${clip})`}>
                        {art?.blessing ? (
                            <image
                                href={photoUrl(art.blessing)}
                                x={12}
                                y={28}
                                width={76}
                                height={112}
                                preserveAspectRatio="xMidYMax meet"
                            />
                        ) : (
                            <DiyaLamp x={50} y={104} size={1.6} />
                        )}
                    </g>
                </svg>
                {!art?.blessing && greeting && (
                    <p
                        className="inv-display absolute inset-x-[20%] top-[46%] text-center text-[clamp(1rem,4.6cqw,1.35rem)] leading-snug text-(--inv-gold)"
                        lang={greeting.text[locale] ? locale : undefined}
                    >
                        {t(greeting.text)}
                    </p>
                )}
            </Reveal>
        </section>
    );
}
