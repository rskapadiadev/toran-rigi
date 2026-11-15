// "From the envelope" card section: a couture silk envelope, open, with a brocade lining. The card
// already peeks out of the pocket (names visible at once); scrolling draws it up and out, then the
// envelope sinks away and the card settles. Every surface is a procedural material, so it follows
// the theme's palette and the tradition's motif with no image assets.
import { cultureOf } from '@shared/cultures';
import { materialSvg, mixHex } from '@shared/materials';
import { cultureMotifs, motifs } from '@shared/motifs';
import { m, useMotionTemplate, useTransform } from 'motion/react';
import {
    type CSSProperties,
    type ReactNode,
    type RefObject,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useInvite } from '../context';
import { WaxSeal } from '../openings/EnvelopeOpening';
import { useSectionScroll } from '../scroll';
import { KeepScrolling } from './story';

const dataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

// Drawing units. The envelope is 3:4; the front pocket is its lower 62%.
const W = 300;
const H = 400;
const POCKET_H = 248;
const TOP = H - POCKET_H;
// The pocket's V-cut meets here (pocket units).
const V_Y = 172;
// Inner edge of the brocade band along the V, 15 units in from the cut.
const BAND_Y = 194.8;

const POCKET = `M0 0 L${W / 2} ${V_Y} L${W} 0 L${W} ${POCKET_H} L0 ${POCKET_H} Z`;
const POCKET_CLIP = `polygon(0 0, 50% ${((V_Y / POCKET_H) * 100).toFixed(1)}%, 100% 0, 100% 100%, 0 100%)`;
// Pointed (ogee) bottom flap that the seal holds down.
const FLAP = `M88 ${POCKET_H} C102 222 132 204 ${W / 2} 182 C168 204 198 222 212 ${POCKET_H} Z`;
const FLAP_EDGE = `M88 ${POCKET_H} C102 222 132 204 ${W / 2} 182 C168 204 198 222 212 ${POCKET_H}`;

interface Materials {
    silk: string;
    lining: string;
    band: string;
}

interface SectionMaterials extends Materials {
    cream: string;
    gold: string;
    motifId: keyof typeof motifs;
}

function useMaterials(): SectionMaterials {
    const { data } = useInvite();
    const { design, seed, culture } = data.invitation;
    const p = design.palette;
    const [motifId = 'paisley'] = cultureMotifs[cultureOf(culture).id];
    return useMemo(() => {
        // Ivory couture paper, warmed by the theme's gold and background.
        const cream = mixHex(mixHex('#f4e9d4', p.gold, 0.1), p.bg, 0.12);
        const gold = p.gold;
        return {
            cream,
            gold,
            motifId,
            silk: dataUri(
                materialSvg({
                    kind: 'silk',
                    base: cream,
                    motif: motifId,
                    motifColor: mixHex(gold, cream, 0.12),
                    tile: 118,
                    motifScale: 0.36,
                    seed: seed + 21,
                }),
            ),
            // Deep jewel-tone brocade with a dense small gold butti.
            lining: dataUri(
                materialSvg({
                    kind: 'brocade',
                    base: mixHex(p.primary, '#14040a', 0.38),
                    motif: motifId,
                    motifColor: mixHex(gold, '#ffffff', 0.08),
                    tile: 54,
                    motifScale: 0.42,
                    seed: seed + 3,
                }),
            ),
            // Woven gold border ribbon for the flap edges.
            band: dataUri(
                materialSvg({
                    kind: 'brocade',
                    base: mixHex(gold, cream, 0.45),
                    motif: motifId,
                    motifColor: mixHex(gold, '#5a3a0c', 0.3),
                    tile: 30,
                    motifScale: 0.72,
                    seed: seed + 9,
                }),
            ),
        };
    }, [p.bg, p.gold, p.primary, motifId, seed]);
}

interface PatternProps {
    id: string;
    href: string;
    tile: number;
}

function Pattern({ id, href, tile }: PatternProps) {
    return (
        <pattern id={id} patternUnits="userSpaceOnUse" width={tile} height={tile}>
            <image href={href} width={tile} height={tile} />
        </pattern>
    );
}

// Back of the envelope: paper body and open flap, both lined with brocade and edged in gold.
function EnvelopeBack({ mat }: { mat: ReturnType<typeof useMaterials> }) {
    const id = useId().replace(/:/g, '');
    const pipe = mixHex(mat.gold, '#ffffff', 0.25);
    const liningEdge = `M9 ${TOP + 2} L9 ${TOP - 29} L${W / 2} 33 L${W - 9} ${TOP - 29} L${W - 9} ${TOP + 2}`;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
            <defs>
                <Pattern id={`${id}-silk`} href={mat.silk} tile={118} />
                <Pattern id={`${id}-lining`} href={mat.lining} tile={54} />
                {/* Inside the pocket it gets darker towards the bottom: depth. */}
                <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#000" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity="0.55" />
                </linearGradient>
                {/* Light falls on the open flap from above. */}
                <linearGradient id={`${id}-flapLight`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
                    <stop offset="1" stopColor="#000" stopOpacity="0.2" />
                </linearGradient>
            </defs>
            {/* Paper: open flap + body. */}
            <path
                d={`M0 ${TOP} L0 ${TOP - 34} L${W / 2} 22 L${W} ${TOP - 34} L${W} ${H} L0 ${H} Z`}
                fill={`url(#${id}-silk)`}
            />
            {/* Brocade lining, inset from the paper edge. */}
            <path d={`${liningEdge} L${W - 9} ${H} L9 ${H} Z`} fill={`url(#${id}-lining)`} />
            <path d={`${liningEdge} L${W - 9} ${TOP} L9 ${TOP} Z`} fill={`url(#${id}-flapLight)`} />
            <rect x="9" y={TOP} width={W - 18} height={POCKET_H} fill={`url(#${id}-depth)`} />
            {/* The fold where the flap turns back. */}
            <line
                x1="0"
                y1={TOP}
                x2={W}
                y2={TOP}
                stroke="#000"
                strokeOpacity="0.3"
                strokeWidth="1.2"
            />
            <path
                d={liningEdge}
                fill="none"
                stroke={pipe}
                strokeWidth="1.3"
                strokeLinejoin="miter"
            />
            <path
                d={`M15 ${TOP} L15 ${TOP - 26} L${W / 2} 41 L${W - 15} ${TOP - 26} L${W - 15} ${TOP}`}
                fill="none"
                stroke={pipe}
                strokeOpacity="0.55"
                strokeWidth="0.6"
            />
        </svg>
    );
}

// Front pocket: two side flaps meeting in a V with a woven gold border, and a pointed bottom flap.
function EnvelopePocket({ mat }: { mat: ReturnType<typeof useMaterials> }) {
    const id = useId().replace(/:/g, '');
    const pipe = mixHex(mat.gold, '#ffffff', 0.3);
    const deep = mixHex(mat.gold, '#3a2408', 0.45);
    return (
        <svg
            viewBox={`0 0 ${W} ${POCKET_H}`}
            className="absolute inset-0 size-full overflow-visible"
            style={{
                // The pocket's lip casts a soft shadow up onto the card tucked behind it.
                filter: 'drop-shadow(0 -6px 10px rgba(0,0,0,0.28)) drop-shadow(0 18px 24px rgba(0,0,0,0.35))',
            }}
            aria-hidden
        >
            <defs>
                <Pattern id={`${id}-silk`} href={mat.silk} tile={118} />
                <Pattern id={`${id}-band`} href={mat.band} tile={30} />
                <clipPath id={`${id}-pocket`}>
                    <path d={POCKET} />
                </clipPath>
                <clipPath id={`${id}-flap`}>
                    <path d={FLAP} />
                </clipPath>
                <linearGradient id={`${id}-left`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={`${id}-right`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#000" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity="0.14" />
                </linearGradient>
                <filter id={`${id}-lift`} x="-20%" y="-30%" width="140%" height="160%">
                    <feDropShadow dx="0" dy="-3" stdDeviation="4" floodOpacity="0.3" />
                </filter>
            </defs>

            <g clipPath={`url(#${id}-pocket)`}>
                <path d={POCKET} fill={`url(#${id}-silk)`} />
                {/* Two flaps: the left catches the light, the right falls into shade. */}
                <path
                    d={`M0 0 L${W / 2} ${V_Y} L${W / 2} ${POCKET_H} L0 ${POCKET_H} Z`}
                    fill={`url(#${id}-left)`}
                />
                <path
                    d={`M${W} 0 L${W / 2} ${V_Y} L${W / 2} ${POCKET_H} L${W} ${POCKET_H} Z`}
                    fill={`url(#${id}-right)`}
                />
                <line
                    x1={W / 2}
                    y1={V_Y}
                    x2={W / 2}
                    y2={POCKET_H}
                    stroke="#000"
                    strokeOpacity="0.16"
                    strokeWidth="1"
                />
                {/* Woven border along the V (the stroke is clipped, so only its inner half shows). */}
                <path
                    d={`M0 0 L${W / 2} ${V_Y} L${W} 0`}
                    fill="none"
                    stroke={`url(#${id}-band)`}
                    strokeWidth="30"
                    strokeLinejoin="miter"
                />
                <path
                    d={`M-11.3 9.86 L${W / 2} ${BAND_Y} L${W + 11.3} 9.86`}
                    fill="none"
                    stroke={deep}
                    strokeWidth="1.1"
                />
            </g>
            {/* Gold piping on the cut edge. */}
            <path
                d={`M0 0 L${W / 2} ${V_Y} L${W} 0`}
                fill="none"
                stroke={pipe}
                strokeWidth="1.6"
                strokeLinejoin="miter"
            />

            {/* Bottom flap, lifted slightly off the pocket. */}
            <g filter={`url(#${id}-lift)`}>
                <path d={FLAP} fill={`url(#${id}-silk)`} />
                <g clipPath={`url(#${id}-flap)`}>
                    <path d={FLAP_EDGE} fill="none" stroke={`url(#${id}-band)`} strokeWidth="24" />
                    <path d={FLAP} fill={`url(#${id}-left)`} opacity="0.6" />
                </g>
                <path d={FLAP_EDGE} fill="none" stroke={pipe} strokeWidth="1.4" />
            </g>
        </svg>
    );
}

interface Props {
    children: ReactNode;
}

interface CardFit {
    startY: number;
    riseY: number;
    endY: number;
    scale: number;
}

// Where the card rests (px from its starting place) and how much it shrinks so all of it fits on
// screen, measured from the real card: wording, names and ceremonies vary per invitation.
function useCardFit(
    box: RefObject<HTMLDivElement | null>,
    card: RefObject<HTMLDivElement | null>,
): CardFit {
    const [fit, setFit] = useState<CardFit>({
        startY: 0,
        riseY: 0,
        endY: 0,
        scale: 1,
    });
    useEffect(() => {
        const b = box.current;
        const c = card.current;
        if (!b || !c) return;
        const measure = () => {
            const vh = window.innerHeight;
            const h = c.offsetHeight;
            // The card's top sits 5% down the envelope; the envelope is centred on screen.
            const top = (vh - b.offsetHeight) / 2 + c.offsetTop;
            const scale = Math.min(1, (vh * 0.9) / h);
            setFit({
                startY: h * 0.36,
                riseY: -h * 0.06,
                endY: vh / 2 - (top + h / 2),
                scale,
            });
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(c);
        window.addEventListener('resize', measure);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [box, card]);
    return fit;
}

export function EnvelopeCard({ children }: Props) {
    const { data, tier, names } = useInvite();
    const { seed, design } = data.invitation;
    const mat = useMaterials();
    const ref = useRef<HTMLDivElement>(null);
    const box = useRef<HTMLDivElement>(null);
    const card = useRef<HTMLDivElement>(null);
    const { scrollYProgress: p } = useSectionScroll(ref);
    const fit = useCardFit(box, card);

    // The card starts tucked in with its top showing, rises clear, then settles centred on the
    // screen, scaled down if its words make it taller than the screen.
    const cardY = useTransform(p, [0.04, 0.5, 0.8], [fit.startY, fit.riseY, fit.endY]);
    const cardScale = useTransform(p, [0.42, 0.8], [0.92, fit.scale]);
    // Clipped at the pocket while the card is inside it; the clip drops away with the envelope so
    // a long card is never cut off.
    const clipBottom = useTransform(p, [0.5, 0.7], [0, -400]);
    const clip = useMotionTemplate`inset(-80% -20% ${clipBottom}% -20%)`;
    const envY = useTransform(p, [0.5, 0.8], ['0%', '72%']);
    const envFade = useTransform(p, [0.6, 0.85], [1, 0]);
    // A slow sheen travels across the silk as guests scroll.
    const sheen = useTransform(p, [0, 0.5], ['130% 0%', '-30% 0%']);
    const hint = useTransform(p, [0, 0.12], [1, 0]);
    const wax = mixHex(design.palette.primary, '#5e0815', 0.72);

    if (tier === 'static') return <div className="px-5 py-16">{children}</div>;

    return (
        <section ref={ref} className="relative h-[260svh]">
            <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
                {/* A pool of warm light behind the envelope. */}
                <m.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        opacity: envFade,
                        background: `radial-gradient(60% 45% at 50% 52%, ${mixHex(mat.gold, '#ffffff', 0.3)}33, transparent 70%)`,
                    }}
                />
                <m.div
                    ref={box}
                    className="relative aspect-[3/4] w-[min(84cqw,440px)]"
                    style={{ clipPath: clip }}
                >
                    <m.div
                        className="absolute inset-0"
                        style={{
                            y: envY,
                            opacity: envFade,
                        }}
                    >
                        <EnvelopeBack mat={mat} />
                    </m.div>

                    <m.div
                        ref={card}
                        className="absolute inset-x-0 top-[5%] z-10 origin-center"
                        style={{
                            y: cardY,
                            scale: cardScale,
                        }}
                    >
                        {children}
                    </m.div>

                    <m.div
                        className="absolute inset-x-0 bottom-0 z-20 h-[62%]"
                        style={{
                            y: envY,
                            opacity: envFade,
                        }}
                    >
                        <EnvelopePocket mat={mat} />
                        <m.div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                            style={{
                                clipPath: POCKET_CLIP,
                                backgroundImage:
                                    'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.55) 50%, transparent 62%)',
                                backgroundSize: '260% 100%',
                                backgroundPosition: sheen,
                            }}
                        />
                        {/* The couple's seal holds the bottom flap. */}
                        <div
                            className="absolute start-1/2 top-[84%] w-[19%] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
                            style={{ '--wax': wax } as CSSProperties}
                        >
                            <div className="aspect-square">
                                <WaxSeal
                                    seed={seed}
                                    initials={names.initials.join('')}
                                    motif={motifs[mat.motifId]}
                                />
                            </div>
                        </div>
                    </m.div>
                </m.div>
                <m.div
                    className="absolute inset-x-0 bottom-[4svh] flex justify-center"
                    style={{ opacity: hint }}
                >
                    <KeepScrolling />
                </m.div>
            </div>
        </section>
    );
}
