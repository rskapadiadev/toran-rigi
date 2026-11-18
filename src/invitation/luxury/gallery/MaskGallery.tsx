// "Shaped windows": the gallery as an editorial spread. Photos are hung down the page in turn
// from either side, each seen through a window cut in the paper: a jharokha arch, a full moon, a
// lotus. As a photo scrolls in, its window opens from a small gold seed to its full shape, the
// picture settling behind it, and a fine gold outline draws itself around the opening.
import { photoUrl } from '@shared/photos';
import {
    m,
    type MotionValue,
    useMotionValue,
    useMotionValueEvent,
    useTransform,
} from 'motion/react';
import { type CSSProperties, useId, useRef, useState } from 'react';

import { useInvite } from '../../context';
import { useHearts } from '../../hearts';
import { usePrint } from '../../print';
import { useSectionScroll } from '../../scroll';
import { type GalleryHearts, GalleryTap, GalleryViewer } from './Reel';

interface Shape {
    // Outline in the window's own box, 0 → 1 on both axes.
    d: string;
    // Height over width.
    ratio: number;
    // Where the seed sits and the window opens from.
    originX: number;
    originY: number;
}

// A jharokha: straight jambs rising to a softly pointed arch.
const ARCH: Shape = {
    d: 'M0,1 L0,0.38 C0,0.2 0.2,0.08 0.5,0 C0.8,0.08 1,0.2 1,0.38 L1,1 Z',
    ratio: 4.3 / 3,
    originX: 0.5,
    originY: 0.62,
};

const SHAPES: Shape[] = [
    ARCH,
    // A full moon.
    {
        d: 'M0.5,0 C0.7761,0 1,0.2239 1,0.5 C1,0.7761 0.7761,1 0.5,1 C0.2239,1 0,0.7761 0,0.5 C0,0.2239 0.2239,0 0.5,0 Z',
        ratio: 1,
        originX: 0.5,
        originY: 0.5,
    },
    // A lotus: a tall centre petal between two that open to the sides.
    {
        d: 'M0.5,1 C0.18,1 0,0.78 0,0.4 C0.12,0.42 0.23,0.47 0.3,0.54 C0.3,0.27 0.39,0.11 0.5,0 C0.61,0.11 0.7,0.27 0.7,0.54 C0.77,0.47 0.88,0.42 1,0.4 C1,0.78 0.82,1 0.5,1 Z',
        ratio: 1.02,
        originX: 0.5,
        originY: 0.7,
    },
];

// The outline in true proportions (100 wide), so its stroke is even and draws as one line.
const outlinePath = (shape: Shape) =>
    shape.d.replace(
        /(-?[\d.]+),(-?[\d.]+)/g,
        (_, x: string, y: string) =>
            `${String(Number(x) * 100)},${String(Number(y) * 100 * shape.ratio)}`,
    );

const clipTransform = (shape: Shape, s: number) => {
    const { originX: ox, originY: oy } = shape;
    return `translate(${String(ox)} ${String(oy)}) scale(${String(s)}) translate(${String(-ox)} ${String(-oy)})`;
};

interface WindowProps {
    photo: string;
    index: number;
    // 0 while the photo waits below the fold, 1 once its window is fully open.
    p: MotionValue<number>;
    hearts: GalleryHearts;
    onOpen: (photo: string) => void;
}

function ShapedWindow({ photo, index, p, hearts, onOpen }: WindowProps) {
    const shape = SHAPES[index % SHAPES.length] ?? ARCH;
    const id = `window-${useId().replace(/:/g, '')}`;
    const clipRef = useRef<SVGPathElement>(null);
    const open = useTransform(p, [0, 0.85], [0.05, 1], { ease: (t) => 1 - (1 - t) ** 3 });
    // The clip itself scales, not the picture, so the photo never blurs as the window opens.
    useMotionValueEvent(open, 'change', (v) => {
        clipRef.current?.setAttribute('transform', clipTransform(shape, v));
    });
    const settle = useTransform(p, [0, 1], [1.22, 1]);
    const seed = useTransform(p, [0, 0.25], [1, 0]);
    const outline = useTransform(p, [0.35, 1], [0, 1]);
    const box: CSSProperties = { aspectRatio: `1 / ${String(shape.ratio)}` };
    const clipped: CSSProperties = {
        clipPath: `url(#${id})`,
        WebkitClipPath: `url(#${id})`,
    };
    const picture = { scale: settle };
    const seedPlace = {
        insetInlineStart: `${String(shape.originX * 100)}%`,
        top: `${String(shape.originY * 100)}%`,
        opacity: seed,
    };
    const draw = { pathLength: outline };
    return (
        <GalleryTap
            photo={photo}
            hearts={hearts}
            onOpen={onOpen}
            className="relative block w-full"
            style={box}
            pill="end-[6%] bottom-[6%]"
        >
            <svg aria-hidden className="absolute size-0">
                <clipPath id={id} clipPathUnits="objectBoundingBox">
                    <path ref={clipRef} d={shape.d} transform={clipTransform(shape, open.get())} />
                </clipPath>
            </svg>
            <span
                className="absolute inset-0 block overflow-hidden bg-(--inv-surface)"
                style={clipped}
            >
                <m.img
                    src={photoUrl(photo)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                    style={picture}
                    draggable={false}
                />
            </span>
            {/* A fine gold line drawn just outside the window. */}
            <svg
                aria-hidden
                viewBox={`0 0 100 ${String(100 * shape.ratio)}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute -inset-[3.5%] size-[107%] overflow-visible"
            >
                <m.path
                    d={outlinePath(shape)}
                    fill="none"
                    stroke="var(--inv-gold)"
                    strokeWidth={0.4}
                    style={draw}
                />
            </svg>
            <m.span
                aria-hidden
                className="absolute size-2.5 -translate-1/2 rotate-45 bg-(--inv-gold) rtl:translate-x-1/2"
                style={seedPlace}
            />
        </GalleryTap>
    );
}

interface ItemProps {
    photo: string;
    index: number;
    total: number;
    hearts: GalleryHearts;
    onOpen: (photo: string) => void;
    still: boolean;
}

function Item({ photo, index, total, hearts, onOpen, still }: ItemProps) {
    const ref = useRef<HTMLLIElement>(null);
    const { scrollYProgress } = useSectionScroll(ref, ['start 0.95', 'start 0.3']);
    const end = index % 2 === 1;
    const full = useMotionValue(1);
    const progress = still ? full : scrollYProgress;
    const label = useTransform(progress, [0.4, 1], [0, 1]);
    const lift = useTransform(progress, [0.4, 1], [18, 0]);
    const caption = {
        opacity: label,
        y: lift,
    };
    const number = String(index + 1).padStart(2, '0');
    return (
        <li
            ref={ref}
            data-print-page={still ? '' : undefined}
            className={`relative flex items-center gap-[6cqw] py-[calc(var(--inv-screen,100svh)*0.09)] ${end ? 'flex-row-reverse' : ''} ${still ? 'min-h-[var(--inv-screen,100svh)]' : ''}`}
        >
            <div className="w-[min(66cqw,26rem)] shrink-0">
                <ShapedWindow
                    photo={photo}
                    index={index}
                    p={progress}
                    hearts={hearts}
                    onOpen={onOpen}
                />
            </div>
            <m.div
                className={`flex min-w-0 flex-1 flex-col gap-3 ${end ? 'items-end text-end' : 'items-start text-start'}`}
                style={caption}
            >
                <span className="inv-display text-[clamp(2.4rem,11cqw,4.5rem)] leading-none text-(--inv-gold)/80 italic">
                    {number}
                </span>
                <span className="h-px w-[min(14cqw,5rem)] bg-(--inv-gold)/60" />
                <span
                    dir="ltr"
                    className="text-[10px] tracking-[0.3em] whitespace-nowrap text-(--inv-muted) uppercase tabular-nums"
                >
                    {number} · {String(total).padStart(2, '0')}
                </span>
            </m.div>
        </li>
    );
}

export function MaskGallery() {
    const { data, tier, names } = useInvite();
    const print = usePrint();
    const photos = data.invitation.content.gallery;
    const hearts = useHearts();
    const [open, setOpen] = useState<string | null>(null);
    if (photos.length === 0) return null;
    const still = print || tier === 'static';
    const close = () => {
        setOpen(null);
    };
    return (
        <section
            className="relative overflow-hidden px-[7cqw] py-[calc(var(--inv-screen,100svh)*0.1)]"
            data-masks
        >
            <header className="mb-[calc(var(--inv-screen,100svh)*0.02)] flex flex-col items-center gap-3 text-center">
                <span className="h-10 w-px bg-(--inv-gold)/60" />
                <p className="inv-script text-[clamp(1.6rem,7cqw,2.6rem)] leading-none text-(--inv-gold)">
                    {names.initials.join(' & ')}
                </p>
            </header>
            <ol className="mx-auto max-w-3xl">
                {photos.map((key, i) => (
                    <Item
                        key={key}
                        photo={key}
                        index={i}
                        total={photos.length}
                        hearts={hearts}
                        onOpen={setOpen}
                        still={still}
                    />
                ))}
            </ol>
            {open && <GalleryViewer photo={open} hearts={hearts} onClose={close} />}
        </section>
    );
}
