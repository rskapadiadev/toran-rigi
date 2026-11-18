// "Story reel": the gallery as a film's reel. The section pins full-screen and the guest's scroll
// carries the photos sideways past the lens, one framed print at a time. Each print leans and
// settles as it reaches the centre, the picture drifting more slowly than its frame, between two
// rows of gold sprockets. A counter in small caps and a hairline tell guests where they are.
import { mixHex } from '@shared/materials';
import { photoUrl } from '@shared/photos';
import { m, type MotionValue, useTransform } from 'motion/react';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

import { useInvite } from '../../context';
import { HeartBurst, HeartIcon, HeartPill, useDoubleTap, useHearts } from '../../hearts';
import { usePrint } from '../../print';
import { useSectionScroll } from '../../scroll';

export type GalleryHearts = ReturnType<typeof useHearts>;

// One print's width: a tall card that still leaves its neighbours peeking in at the edges.
const FRAME_W = 'min(60cqw, 21rem, calc(var(--inv-screen,100svh) * 0.42))';
const FRAME_GAP = 'min(10cqw, 4rem)';
const STEP = `(${FRAME_W} + ${FRAME_GAP})`;

const two = (n: number) => String(n).padStart(2, '0');
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
// Eases each step so a print lingers at the centre before the next one glides in.
const settle = (v: number) => {
    const i = Math.floor(v);
    const f = v - i;
    return i + f * f * (3 - 2 * f);
};

interface TapProps {
    photo: string;
    hearts: GalleryHearts;
    onOpen: (photo: string) => void;
    className: string;
    style?: CSSProperties;
    // Where the heart pill sits; omitted, it sits at the bottom end corner.
    pill?: string;
    children: ReactNode;
}

// One tap opens the photo; a double tap sends it a heart instead.
export function GalleryTap({ photo, hearts, onOpen, className, style, pill, children }: TapProps) {
    const target = `photo:${photo}`;
    const [burst, setBurst] = useState(0);
    const open = () => {
        onOpen(photo);
    };
    const tap = useDoubleTap(() => {
        setBurst((b) => b + 1);
        void hearts.send(target);
    }, open);
    return (
        <button
            type="button"
            onClick={hearts.enabled ? tap : open}
            className={`${className} cursor-zoom-in touch-manipulation`}
            style={style}
        >
            {children}
            <span className={`absolute ${pill ?? 'end-3 bottom-3'}`}>
                <HeartPill count={hearts.count(target)} liked={hearts.isLiked(target)} />
            </span>
            <HeartBurst burst={burst} />
        </button>
    );
}

interface ViewerProps {
    photo: string;
    hearts: GalleryHearts;
    onClose: () => void;
}

// The photo full-screen on a dark field: tap outside or press Escape to close, double-tap to love it.
export function GalleryViewer({ photo, hearts, onClose }: ViewerProps) {
    const { copy } = useInvite();
    const target = `photo:${photo}`;
    const [burst, setBurst] = useState(0);
    const love = () => {
        setBurst((b) => b + 1);
        void hearts.send(target);
    };
    const tap = useDoubleTap(love);
    const liked = hearts.isLiked(target);
    useEffect(() => {
        const key = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', key);
        return () => {
            window.removeEventListener('keydown', key);
        };
    }, [onClose]);
    const fadeIn = { opacity: 1 };
    const fadeFrom = { opacity: 0 };
    const timing = { duration: 0.35 };
    return (
        <m.div
            initial={fadeFrom}
            animate={fadeIn}
            transition={timing}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/90 p-4"
        >
            <button
                type="button"
                aria-label={copy('closePhoto')}
                className="absolute inset-0 cursor-zoom-out"
                onClick={onClose}
            />
            <div
                className="relative touch-manipulation p-2 ring-1 ring-(--inv-gold)/40 select-none"
                onPointerUp={hearts.enabled ? tap : undefined}
            >
                <img
                    src={photoUrl(photo)}
                    alt=""
                    className="max-h-[calc(var(--inv-screen,100svh)*0.78)] max-w-full"
                    draggable={false}
                />
                <HeartBurst burst={burst} />
            </div>
            {hearts.enabled && (
                <button
                    type="button"
                    aria-label={copy('sendLove')}
                    aria-pressed={liked}
                    onClick={love}
                    className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white tabular-nums transition hover:bg-white/20"
                >
                    <HeartIcon
                        filled={liked}
                        className={`size-5 ${liked ? 'text-[#ff6b81]' : ''}`}
                    />
                    {hearts.count(target)}
                </button>
            )}
        </m.div>
    );
}

// The print itself: an ivory mat, a fine gold rule inside it, the photograph within.
interface PrintCardProps {
    photo: string;
    children?: ReactNode;
}

// Warm ivory card and a deep gold ink for its caption, both from the invitation's own gold.
function usePrintTones() {
    const { palette } = useInvite().data.invitation.design;
    const mat: CSSProperties = { backgroundColor: mixHex(palette.gold, '#fffdf8', 0.86) };
    const ink: CSSProperties = { color: mixHex(palette.gold, '#1a1008', 0.55) };
    return {
        mat,
        ink,
    };
}

function PrintCard({ photo, children }: PrintCardProps) {
    const { mat } = usePrintTones();
    return (
        <span
            className="relative block size-full p-[5%] pb-[14%] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.85)]"
            style={mat}
        >
            <span className="relative block size-full overflow-hidden ring-1 ring-(--inv-gold)/60">
                {children ?? (
                    <img
                        src={photoUrl(photo)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover"
                        draggable={false}
                    />
                )}
            </span>
        </span>
    );
}

interface FrameProps {
    photo: string;
    index: number;
    total: number;
    pos: MotionValue<number>;
    sign: number;
    hearts: GalleryHearts;
    onOpen: (photo: string) => void;
}

function Frame({ photo, index, total, pos, sign, hearts, onOpen }: FrameProps) {
    const { ink } = usePrintTones();
    // Signed distance from the centre of the lens, in prints.
    const d = useTransform(pos, (v) => index - v);
    const scale = useTransform(d, (v) => 1 - 0.12 * Math.min(Math.abs(v), 1));
    const rotate = useTransform(d, (v) => clamp(v, -1, 1) * 3.5 * sign);
    const opacity = useTransform(d, (v) => 1 - 0.55 * Math.min(Math.abs(v), 1));
    // The picture travels against its frame, so it seems to move more slowly than the print.
    const drift = useTransform(d, (v) => `${String(clamp(v, -1, 1) * -9 * sign)}%`);
    const frame = {
        width: FRAME_W,
        scale,
        rotate,
        opacity,
    };
    const picture = { x: drift };
    return (
        <m.div className="aspect-[3/4.4] shrink-0" style={frame}>
            <GalleryTap
                photo={photo}
                hearts={hearts}
                onOpen={onOpen}
                className="relative block size-full"
                pill="end-[8%] bottom-[16%]"
            >
                <PrintCard photo={photo}>
                    <m.img
                        src={photoUrl(photo)}
                        alt=""
                        loading={index < 3 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="absolute inset-y-0 -start-[12%] h-full w-[124%] max-w-none object-cover"
                        style={picture}
                        draggable={false}
                    />
                </PrintCard>
                <span
                    className="absolute inset-x-0 bottom-[4%] text-center text-[10px] tracking-[0.4em] uppercase tabular-nums"
                    style={ink}
                >
                    No. {two(index + 1)} · {two(total)}
                </span>
            </GalleryTap>
        </m.div>
    );
}

// Two rows of sprocket holes in gold, edged by hairlines, running the length of the reel.
function Sprockets({ edge }: { edge: 'top' | 'bottom' }) {
    const holes: CSSProperties = {
        backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0 13px, var(--inv-gold) 13px 19px)',
    };
    const place =
        edge === 'top'
            ? 'bottom-[calc(100%+min(6cqw,2.25rem))]'
            : 'top-[calc(100%+min(6cqw,2.25rem))]';
    return (
        <span
            aria-hidden
            className={`absolute -inset-x-[60cqw] ${place} flex h-3.5 flex-col justify-between opacity-40`}
        >
            <span className="h-px bg-(--inv-gold)/70" />
            <span className="h-1 w-full opacity-70" style={holes} />
            <span className="h-px bg-(--inv-gold)/70" />
        </span>
    );
}

interface StageProps {
    photos: string[];
    p: MotionValue<number>;
    hearts: GalleryHearts;
    onOpen: (photo: string) => void;
}

function ReelStage({ photos, p, hearts, onOpen }: StageProps) {
    const { data, dir, names } = useInvite();
    const { palette } = data.invitation.design;
    const total = photos.length;
    const sign = dir === 'rtl' ? -1 : 1;
    // A short lead-in and lead-out so the first and last prints rest at the centre.
    const pos = useTransform(p, [0.06, 0.94], [0, total - 1], { clamp: true });
    const eased = useTransform(pos, settle);
    const x = useTransform(eased, (v) => `calc(${String(-v * sign)} * ${STEP})`);
    const counter = useTransform(pos, (v) => two(Math.round(v) + 1));
    const night = mixHex(palette.primary, '#050303', 0.84);
    const glow = mixHex(palette.primary, night, 0.55);
    const background = `radial-gradient(ellipse 70% 55% at 50% 48%, ${glow} 0%, ${night} 70%, #050303 100%)`;
    const stage: CSSProperties = { background };
    const track = {
        x,
        gap: FRAME_GAP,
        marginInlineStart: `calc(50% - ${FRAME_W} / 2)`,
    };
    const fill = { scaleX: p };
    const monogram = names.initials.join(' & ');
    return (
        <div className="absolute inset-0 flex items-center overflow-hidden" style={stage}>
            <div className="pointer-events-none absolute inset-x-0 top-[calc(var(--inv-screen,100svh)*0.1)] text-center">
                <p className="inv-script text-[clamp(1.4rem,6cqw,2.2rem)] leading-none text-(--inv-gold)">
                    {monogram}
                </p>
                <span className="mx-auto mt-3 block h-px w-10 bg-(--inv-gold)/60" />
            </div>
            <m.div className="relative flex w-max shrink-0" style={track}>
                <Sprockets edge="top" />
                {photos.map((key, i) => (
                    <Frame
                        key={key}
                        photo={key}
                        index={i}
                        total={total}
                        pos={eased}
                        sign={sign}
                        hearts={hearts}
                        onOpen={onOpen}
                    />
                ))}
                <Sprockets edge="bottom" />
            </m.div>
            <div className="pointer-events-none absolute inset-x-[10%] bottom-[calc(var(--inv-screen,100svh)*0.07)] flex items-center gap-4 text-[#fbf5ea]">
                <p dir="ltr" className="text-[11px] tracking-[0.35em] tabular-nums">
                    <m.span className="text-(--inv-gold)">{counter}</m.span>
                    <span className="opacity-60"> / {two(total)}</span>
                </p>
                <span className="relative h-px flex-1 bg-white/15">
                    <m.span
                        className="absolute inset-0 origin-left bg-(--inv-gold) rtl:origin-right"
                        style={fill}
                    />
                </span>
            </div>
        </div>
    );
}

// The PDF, reduced motion, still devices: the prints laid out two by two, one page per four.
function ReelStill({ photos, hearts, onOpen }: Omit<StageProps, 'p'>) {
    const { ink } = usePrintTones();
    const pages: string[][] = [];
    for (let i = 0; i < photos.length; i += 4) pages.push(photos.slice(i, i + 4));
    return (
        <>
            {pages.map((page, n) => (
                <div
                    key={page.join()}
                    data-print-page
                    className="flex min-h-[var(--inv-screen,100svh)] items-center justify-center bg-(--inv-bg) px-6 py-12"
                >
                    <div className="grid w-full max-w-2xl grid-cols-2 gap-x-5 gap-y-8">
                        {page.map((key, i) => (
                            <GalleryTap
                                key={key}
                                photo={key}
                                hearts={hearts}
                                onOpen={onOpen}
                                className={`relative block aspect-[3/4.4] ${i % 2 ? 'translate-y-6' : ''}`}
                                pill="end-[8%] bottom-[16%]"
                            >
                                <PrintCard photo={key} />
                                <span
                                    className="absolute inset-x-0 bottom-[4%] text-center text-[10px] tracking-[0.4em] uppercase tabular-nums"
                                    style={ink}
                                >
                                    No. {two(n * 4 + i + 1)} · {two(photos.length)}
                                </span>
                            </GalleryTap>
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
}

export function Reel() {
    const { data, tier } = useInvite();
    const print = usePrint();
    const photos = data.invitation.content.gallery;
    const hearts = useHearts();
    const [open, setOpen] = useState<string | null>(null);
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress: p } = useSectionScroll(ref);
    if (photos.length === 0) return null;
    const close = () => {
        setOpen(null);
    };
    const viewer = open && <GalleryViewer photo={open} hearts={hearts} onClose={close} />;
    if (print || tier === 'static')
        return (
            <section className="relative" data-reel>
                <ReelStill photos={photos} hearts={hearts} onOpen={setOpen} />
                {viewer}
            </section>
        );
    // Roughly two-thirds of a screen of scrolling carries each print past the lens.
    const screens = String(1.4 + photos.length * 0.65);
    const height: CSSProperties = { height: `calc(var(--inv-screen,100svh) * ${screens})` };
    return (
        <section ref={ref} className="relative" style={height} data-reel>
            <div className="sticky top-0 h-[var(--inv-screen,100svh)] overflow-hidden">
                <ReelStage photos={photos} p={p} hearts={hearts} onOpen={setOpen} />
            </div>
            {viewer}
        </section>
    );
}
