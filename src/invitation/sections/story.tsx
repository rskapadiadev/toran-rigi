// Storytelling layouts: scroll-driven photo cover, a card drawn out of its envelope, a handwritten
// note, a blessings card and a rangoli closing. Original Toran designs built on the block system.
import { cultureOf } from '@shared/cultures';
import { rng } from '@shared/generative';
import { materialBackground, mixHex } from '@shared/materials';
import { cultureMotifs, motifs } from '@shared/motifs';
import { COVER_SLOT, photoSlots, photoUrl, slotPhoto } from '@shared/photos';
import { m, useTransform } from 'motion/react';
import { type CSSProperties, useRef } from 'react';

import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';
import { Editable, useEditing } from '../editing';
import { WaxSeal } from '../openings/EnvelopeOpening';
import { useReplayOpening, useSectionScroll } from '../scroll';
import { useCoverFacts } from './covers';

// Deckled / torn-paper outline as a clip-path polygon, unique per seed.
export function tornEdge(seed: number, depth = 1.4, step = 2.5): string {
    const r = rng(seed);
    const pts: string[] = [];
    const jag = () => r.range(0, depth);
    for (let x = 0; x <= 100; x += step) pts.push(`${x.toFixed(1)}% ${jag().toFixed(2)}%`);
    for (let y = 0; y <= 100; y += step) pts.push(`${(100 - jag()).toFixed(2)}% ${y.toFixed(1)}%`);
    for (let x = 100; x >= 0; x -= step) pts.push(`${x.toFixed(1)}% ${(100 - jag()).toFixed(2)}%`);
    for (let y = 100; y >= 0; y -= step) pts.push(`${jag().toFixed(2)}% ${y.toFixed(1)}%`);
    return `polygon(${pts.join(', ')})`;
}

const paperStyle = (seed: number): CSSProperties => ({
    backgroundImage: materialBackground({
        kind: 'paper',
        base: '#f7f0e3',
        seed,
    }),
    clipPath: tornEdge(seed),
});

// A section's own frame (never the gallery): see photoSlots.
function useSlotPhoto(slot: string): string | undefined {
    const { data } = useInvite();
    const key = slotPhoto(data.invitation.content, slot);
    return key ? photoUrl(key) : undefined;
}

interface PolaroidProps {
    slot: string;
    tilt: number;
    className?: string;
    style?: CSSProperties;
}

// Instant photo with a white border and a strip of washi tape.
function Polaroid({ slot, tilt, className, style }: PolaroidProps) {
    const src = useSlotPhoto(slot);
    const editing = useEditing();
    // Empty frames show only in the editor, labelled, so it is clear which photo goes where.
    if (!src && !editing) return null;
    const label = Object.values(photoSlots)
        .flatMap((byVariant) => Object.values(byVariant).flat())
        .find((s) => s.id === slot)?.label;
    return (
        <figure
            className={`absolute bg-white p-[3%] pb-[12%] shadow-[0_14px_30px_-10px_rgba(0,0,0,0.45)] ${className ?? ''}`}
            style={{
                rotate: `${String(tilt)}deg`,
                ...style,
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt=""
                    loading="lazy"
                    data-photo-slot={slot}
                    className="aspect-square w-full object-cover"
                />
            ) : (
                <div
                    data-photo
                    data-photo-slot={slot}
                    className="flex aspect-square w-full flex-col items-center justify-center gap-1 border border-dashed border-neutral-400 bg-neutral-100 p-2 text-center font-sans text-[10px] leading-tight text-neutral-500"
                >
                    <span className="text-base leading-none">＋</span>
                    {label}
                </div>
            )}
            <span className="absolute inset-x-0 -top-2 mx-auto h-4 w-12 rotate-[-4deg] bg-[#f3e2b8]/80" />
        </figure>
    );
}

// Bob-and-fade cue telling guests there is more below the cover.
export function KeepScrolling() {
    const { copy } = useInvite();
    return (
        <div className="flex flex-col items-center gap-1 text-[10px] tracking-[0.4em] uppercase opacity-80">
            {copy('keepScrolling')}
            <span aria-hidden className="animate-bounce text-base leading-none">
                ⌄
            </span>
        </div>
    );
}

// Cover: the couple's photo fills the screen, then (scroll-scrubbed) shrinks into a torn-paper
// frame while polaroids slide in and the names write themselves underneath.
export function PhotoCover() {
    const { data, tier, copy, occasion } = useInvite();
    const facts = useCoverFacts();
    const cover = useSlotPhoto(COVER_SLOT);
    const editing = useEditing();
    const kicker = occasion.id === 'wedding' ? copy('theWeddingOf') : copy('saveTheDate');
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress: p } = useSectionScroll(ref);
    const still = tier === 'static';
    const inset = useTransform(p, [0, 0.45], ['0%', '12%']);
    const lift = useTransform(p, [0, 0.45], ['0%', '-14%']);
    const tilt = useTransform(p, [0.1, 0.45], [0, -2.5]);
    const frame = useTransform(p, [0.25, 0.45], [0, 1]);
    const hello = useTransform(p, [0, 0.22], [1, 0]);
    const names = useTransform(p, [0.42, 0.6], [0, 1]);
    const left = useTransform(p, [0.45, 0.7], ['-60%', '0%']);
    const right = useTransform(p, [0.5, 0.75], ['60%', '0%']);
    const seed = data.invitation.seed;

    const { gold, primary } = data.invitation.design.palette;
    const placeholderGlow = `radial-gradient(circle at 50% 35%, ${mixHex(gold, '#ffffff', 0.5)}, ${primary})`;
    const photo = cover ? (
        <img src={cover} alt="" data-photo-slot={COVER_SLOT} className="size-full object-cover" />
    ) : (
        // No photo yet: an elegant placeholder keeps the layout honest in demos and the editor.
        <div
            data-photo
            data-photo-slot={COVER_SLOT}
            className="flex size-full items-center justify-center"
            style={{ background: placeholderGlow }}
        >
            <span className="text-[11px] tracking-[0.4em] text-white/70 uppercase">
                {editing ? 'Main photo · click to add' : ''}
            </span>
        </div>
    );

    if (still)
        return (
            <section className="relative flex min-h-svh flex-col items-center justify-center gap-8 px-6 py-16 text-center">
                <div
                    className="aspect-[4/5] w-[min(78cqw,420px)] bg-white p-3"
                    style={paperStyle(seed)}
                >
                    {photo}
                </div>
                <h2 className="inv-script text-[clamp(2.6rem,12cqw,4.4rem)] leading-tight text-(--inv-gold)">
                    {facts.one} {facts.two && `& ${facts.two}`}
                </h2>
                <p className="text-xs tracking-[0.35em] uppercase opacity-80">{facts.dateText}</p>
            </section>
        );

    return (
        <section ref={ref} className="relative h-[230svh]">
            <div className="sticky top-0 h-svh overflow-hidden">
                <m.div
                    className="absolute"
                    style={{
                        inset,
                        y: lift,
                        rotate: tilt,
                    }}
                >
                    <m.div
                        className="absolute -inset-3 bg-[#f7f0e3]"
                        style={{
                            opacity: frame,
                            ...paperStyle(seed),
                        }}
                    />
                    <div className="absolute inset-0 overflow-hidden">{photo}</div>
                    <m.div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 text-white"
                        style={{ opacity: hello }}
                    >
                        <p className="text-[11px] tracking-[0.5em] uppercase">{kicker}</p>
                        <p className="inv-script mt-3 text-[clamp(2.8rem,13cqw,5rem)] leading-none">
                            {facts.one}
                        </p>
                        {facts.two && (
                            <p className="inv-script text-[clamp(2.8rem,13cqw,5rem)] leading-none">
                                &amp; {facts.two}
                            </p>
                        )}
                    </m.div>
                </m.div>
                <m.div className="absolute start-[6%] bottom-[22%] w-[34%]" style={{ x: left }}>
                    <Polaroid slot="cover.left" tilt={-6} className="relative w-full" />
                </m.div>
                <m.div className="absolute end-[6%] bottom-[24%] w-[36%]" style={{ x: right }}>
                    <Polaroid slot="cover.right" tilt={5} className="relative w-full" />
                </m.div>
                <m.div
                    className="absolute inset-x-0 bottom-[5%] flex flex-col items-center gap-3 px-6 text-center"
                    style={{ opacity: names }}
                >
                    <h2 className="inv-script text-[clamp(2.4rem,11cqw,4rem)] leading-tight text-(--inv-gold)">
                        <Editable path="people.one.name">{facts.one}</Editable>
                        {facts.two && (
                            <>
                                <span className="mx-2 text-[0.5em]">&amp;</span>
                                <Editable path="people.two.name">{facts.two}</Editable>
                            </>
                        )}
                    </h2>
                    <p className="text-[11px] tracking-[0.4em] uppercase opacity-85">
                        {facts.dateText}
                    </p>
                    <KeepScrolling />
                </m.div>
            </div>
        </section>
    );
}

// "A note from us": the story set as a handwritten letter on torn paper, signed by the couple.
export function LetterChapter({ text }: { text: string }) {
    const { data, copy } = useInvite();
    const facts = useCoverFacts();
    const seed = data.invitation.seed + 7;
    return (
        <section className="relative px-5 py-20">
            <div className="relative mx-auto max-w-lg">
                <Polaroid slot="story.top" tilt={7} className="end-[-4%] -top-10 z-10 w-[34%]" />
                <Reveal>
                    <div className="relative px-[9%] py-12" style={paperStyle(seed)}>
                        <h2 className="inv-script text-[clamp(2rem,8cqw,2.8rem)] text-(--inv-primary)">
                            {copy('noteFromUs')}
                        </h2>
                        <p className="inv-script mt-4 text-[clamp(1.2rem,5cqw,1.6rem)] leading-relaxed whitespace-pre-line text-[#3b2a1f]">
                            <Editable path="story" multiline>
                                {text}
                            </Editable>
                        </p>
                        <p className="mt-8 text-sm text-[#5b463a]">{copy('withLove')},</p>
                        <p className="inv-script text-[clamp(1.8rem,8cqw,2.6rem)] leading-tight text-[#3b2a1f]">
                            {facts.one}
                            {facts.two && ` & ${facts.two}`}
                        </p>
                    </div>
                </Reveal>
                {/* Bottom right, clear of the signature (which sits on the left). */}
                <Polaroid
                    slot="story.bottom"
                    tilt={6}
                    className="end-[-4%] -bottom-12 w-[36%]"
                />
                {/* Tucked under the bottom-left corner, off the writing. */}
                <PressedSprig className="pointer-events-none absolute start-[6%] -bottom-16 w-14 -rotate-[65deg] opacity-80 rtl:rotate-[65deg]" />
            </div>
        </section>
    );
}

function PressedSprig({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 60 120" className={className} aria-hidden>
            <path d="M30 118 C28 80 32 50 30 6" stroke="#7d8a5a" strokeWidth="1.6" fill="none" />
            {[20, 38, 56, 74, 92].map((y, i) => (
                <ellipse
                    key={y}
                    cx={i % 2 ? 20 : 40}
                    cy={y}
                    rx="9"
                    ry="4.5"
                    fill={i % 2 ? '#c99aa0' : '#9aa77a'}
                    transform={`rotate(${String(i % 2 ? -35 : 35)} ${String(i % 2 ? 20 : 40)} ${String(y)})`}
                    opacity="0.85"
                />
            ))}
        </svg>
    );
}

// "With the blessings of": family names on gold-cornered stationery.
export function BlessingsCard({ text }: { text: string }) {
    const { copy } = useInvite();
    const lines = text.split(/\s*[·\n]\s*/).filter(Boolean);
    return (
        <section className="px-5 py-16">
            <Reveal className="relative mx-auto max-w-md bg-(--inv-surface) px-8 py-10 text-center shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)]">
                {(
                    [
                        'start-2 top-2',
                        'end-2 top-2 rotate-90',
                        'end-2 bottom-2 rotate-180',
                        'start-2 bottom-2 -rotate-90',
                    ] as const
                ).map((pos) => (
                    <span
                        key={pos}
                        aria-hidden
                        className={`absolute ${pos} size-6 border-s-2 border-t-2 border-(--inv-gold)`}
                    />
                ))}
                <h2 className="inv-script text-[clamp(1.8rem,7cqw,2.4rem)] text-(--inv-gold)">
                    {copy('blessingsOf')}
                </h2>
                <div className="mt-4 space-y-1.5 text-[15px] leading-relaxed">
                    {lines.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>
            </Reveal>
        </section>
    );
}

// A marigold rangoli: rings of flowers and leaves around the couple's wax seal.
interface RangoliProps {
    seed: number;
    initials: string;
    motif: string[];
}

function Rangoli({ seed, initials, motif }: RangoliProps) {
    const rings = [
        {
            r: 140,
            n: 22,
            size: 14,
            colors: ['#2f6b23', '#3f7d2e'],
            leaf: true,
        },
        {
            r: 122,
            n: 26,
            size: 13,
            colors: ['#f57c00', '#ff9800'],
        },
        {
            r: 100,
            n: 24,
            size: 12,
            colors: ['#fbc02d', '#ffd54f'],
        },
        {
            r: 82,
            n: 18,
            size: 9,
            colors: ['#d81b60', '#ec407a'],
        },
        {
            r: 68,
            n: 30,
            size: 4,
            colors: ['#fff8e1', '#ffffff'],
        },
    ];
    return (
        <div className="relative mx-auto aspect-square w-[min(84cqw,420px)]">
            <svg viewBox="0 0 300 300" className="absolute inset-0 size-full" aria-hidden>
                {rings.map((ring) =>
                    Array.from({ length: ring.n }, (_, i) => {
                        const a = (Math.PI * 2 * i) / ring.n;
                        const x = 150 + ring.r * Math.cos(a);
                        const y = 150 + ring.r * Math.sin(a);
                        const fill = ring.colors[i % 2] ?? '#fff';
                        return ring.leaf ? (
                            <ellipse
                                key={`${String(ring.r)}-${String(i)}`}
                                cx={x}
                                cy={y}
                                rx={ring.size}
                                ry={ring.size / 2.4}
                                fill={fill}
                                transform={`rotate(${String((a * 180) / Math.PI)} ${String(x)} ${String(y)})`}
                            />
                        ) : (
                            <g key={`${String(ring.r)}-${String(i)}`}>
                                <circle cx={x} cy={y} r={ring.size} fill={fill} />
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={ring.size * 0.45}
                                    fill="#000"
                                    opacity="0.12"
                                />
                            </g>
                        );
                    }),
                )}
            </svg>
            <div className="absolute inset-[30%]">
                <WaxSeal seed={seed} initials={initials} motif={motif} />
            </div>
        </div>
    );
}

// Closing: rangoli seal, a last line, the names, and the envelope can be sealed and opened again.
export function RangoliClosing({ closing }: { closing: string }) {
    const { data, names, copy } = useInvite();
    const replay = useReplayOpening();
    const { seed, culture, design } = data.invitation;
    const [motifId = 'paisley'] = cultureMotifs[cultureOf(culture).id];
    const wax = mixHex(design.palette.primary, '#5e0815', 0.72);
    return (
        <section className="px-5 pt-16 pb-28 text-center" style={{ '--wax': wax } as CSSProperties}>
            <Reveal preset="bloom">
                <Rangoli seed={seed} initials={names.initials.join('')} motif={motifs[motifId]} />
            </Reveal>
            <Reveal delay={150} className="mx-auto mt-8 max-w-md opacity-85">
                <Editable path="closing" multiline>
                    {closing}
                </Editable>
            </Reveal>
            <Reveal delay={250}>
                <h2 className="inv-script mt-4 text-[clamp(2.6rem,12cqw,4.4rem)] leading-tight">
                    {names.one}
                    {names.two && (
                        <>
                            <span className="block text-[0.4em] text-(--inv-gold)">&amp;</span>
                            {names.two}
                        </>
                    )}
                </h2>
            </Reveal>
            {replay && (
                <button
                    type="button"
                    onClick={replay}
                    className="mt-8 inline-flex items-center gap-2 border-b border-dotted border-current pb-0.5 text-sm opacity-80 hover:opacity-100"
                >
                    ↻ {copy('sealAgain')}
                </button>
            )}
        </section>
    );
}
