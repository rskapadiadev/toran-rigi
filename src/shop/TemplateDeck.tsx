// Phones browse the collection as a deck of cards: swipe the top design away to see the next,
// or use the arrows. Wider screens keep the grid.
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    animate,
    motion,
    type PanInfo,
    useMotionValue,
    useReducedMotion,
    useTransform,
} from 'motion/react';
import { type MouseEvent, useRef, useState } from 'react';

import { TemplateTile } from './landing';
import type { StoreTemplate } from './types';

// How far, or how fast, a card must travel to count as a swipe.
const SWIPE_DISTANCE = 90;
const SWIPE_SPEED = 500;
// Cards visible in the stack behind the top one.
const DEPTH = 3;

interface DeckProps {
    templates: StoreTemplate[];
    currency: string;
}

export function TemplateDeck({ templates, currency }: DeckProps) {
    const [index, setIndex] = useState(0);
    const count = templates.length;
    const go = (step: number) => {
        setIndex((i) => (i + step + count) % count);
    };
    if (count === 0) return null;
    const stack = Array.from({ length: Math.min(DEPTH, count) }, (_, depth) => ({
        depth,
        template: templates[(index + depth) % count],
    }));
    const position = `${String(index + 1)} / ${String(count)}`;
    return (
        <div>
            <div className="relative h-[480px]">
                {stack
                    .slice()
                    .reverse()
                    .map(({ depth, template }) =>
                        template ? (
                            <DeckCard
                                key={template.slug}
                                template={template}
                                currency={currency}
                                depth={depth}
                                onSwiped={go}
                            />
                        ) : null,
                    )}
            </div>
            <div className="mt-4 flex items-center justify-between">
                <button
                    type="button"
                    aria-label="Previous design"
                    onClick={() => {
                        go(-1);
                    }}
                    className="flex size-10 items-center justify-center rounded-full border border-white/15 text-ivory/80 transition hover:border-gold/50 hover:text-ivory"
                >
                    <ChevronLeft className="size-5 rtl:rotate-180" />
                </button>
                <p className="text-sm text-ivory/55" aria-live="polite">
                    <span className="tabular-nums">{position}</span>
                    <span className="ms-2 text-ivory/35">Swipe to browse</span>
                </p>
                <button
                    type="button"
                    aria-label="Next design"
                    onClick={() => {
                        go(1);
                    }}
                    className="flex size-10 items-center justify-center rounded-full border border-white/15 text-ivory/80 transition hover:border-gold/50 hover:text-ivory"
                >
                    <ChevronRight className="size-5 rtl:rotate-180" />
                </button>
            </div>
        </div>
    );
}

interface CardProps {
    template: StoreTemplate;
    currency: string;
    depth: number;
    onSwiped: (step: number) => void;
}

function DeckCard({ template, currency, depth, onSwiped }: CardProps) {
    const reduce = useReducedMotion();
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-240, 240], [-10, 10]);
    // A drag ends with a click on whatever link is under the finger; swallow that one click.
    const dragged = useRef(false);
    const top = depth === 0;

    const release = (_: PointerEvent, info: PanInfo) => {
        const far = Math.abs(info.offset.x) > SWIPE_DISTANCE;
        const fast = Math.abs(info.velocity.x) > SWIPE_SPEED;
        if (!far && !fast) {
            void animate(x, 0, {
                type: 'spring',
                bounce: 0.3,
                visualDuration: 0.35,
            });
            return;
        }
        // Swipe left for the next design, right for the previous one.
        const direction = (info.offset.x || info.velocity.x) < 0 ? -1 : 1;
        if (reduce) {
            x.set(0);
            onSwiped(-direction);
            return;
        }
        void animate(x, direction * 480, { duration: 0.22 }).then(() => {
            x.set(0);
            onSwiped(-direction);
        });
    };

    const place = {
        scale: 1 - depth * 0.05,
        y: depth * 16,
        opacity: depth === DEPTH - 1 ? 0.6 : 1,
    };
    const spring = {
        type: 'spring' as const,
        bounce: 0.2,
        visualDuration: 0.4,
    };
    const tilt =
        top && !reduce
            ? {
                  x,
                  rotate,
              }
            : { x };
    return (
        <motion.div
            className="absolute inset-x-0 top-0 origin-top"
            style={tilt}
            initial={false}
            animate={place}
            transition={spring}
            drag={top ? 'x' : false}
            dragSnapToOrigin={false}
            onPointerDownCapture={() => {
                dragged.current = false;
            }}
            onDragStart={() => {
                dragged.current = true;
            }}
            onDragEnd={release}
            onClickCapture={(e: MouseEvent) => {
                if (!dragged.current) return;
                e.preventDefault();
                e.stopPropagation();
            }}
            aria-hidden={!top}
            inert={!top}
        >
            <TemplateTile template={template} currency={currency} />
        </motion.div>
    );
}
