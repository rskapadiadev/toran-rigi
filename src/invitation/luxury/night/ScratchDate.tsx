// "The date": three gold-foil cards (day, month, year) that guests scratch away with a finger to
// find the wedding date beneath, like a lottery card. A tap reveals each one too, and still devices
// and reduced motion skip the scratching altogether.
import { mainEvent } from '@shared/cards';
import { zonedToUtc } from '@shared/time';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { Reveal } from '../../../motion/Reveal';
import { useInvite } from '../../context';
import { usePrint } from '../../print';
import type { StringKey } from '../../strings';
import { SectionTitle } from '../typography/SectionTitle';

const BRUSH = 22;
// Share of the foil that must be gone before the rest falls away by itself.
const DONE = 0.42;

function paintFoil(canvas: HTMLCanvasElement, gold: string) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    const sheen = ctx.createLinearGradient(0, 0, w, h);
    sheen.addColorStop(0, '#f3dc9c');
    sheen.addColorStop(0.35, gold);
    sheen.addColorStop(0.55, '#fbeec4');
    sheen.addColorStop(0.8, gold);
    sheen.addColorStop(1, '#b98d3e');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);
    // Fine glitter, seeded by the card's size so it doesn't change between paints.
    let seed = w * 31 + h;
    const next = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };
    for (let i = 0; i < (w * h) / 90; i++) {
        ctx.fillStyle = next() > 0.5 ? 'rgba(255,255,255,0.55)' : 'rgba(120,80,20,0.25)';
        ctx.fillRect(next() * w, next() * h, 1.2, 1.2);
    }
    const inset = w * 0.07;
    ctx.strokeStyle = 'rgba(255,250,230,0.7)';
    ctx.lineWidth = Math.max(1, w / 160);
    ctx.beginPath();
    ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, w * 0.06);
    ctx.stroke();
    // A four-point star at the centre: the "scratch me" mark.
    const cx = w / 2;
    const cy = h / 2;
    const r = w * 0.1;
    ctx.fillStyle = 'rgba(255,252,240,0.9)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.quadraticCurveTo(cx, cy, cx + r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + r);
    ctx.quadraticCurveTo(cx, cy, cx - r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - r);
    ctx.fill();
}

interface CardProps {
    value: string;
    label: StringKey;
    scratch: boolean;
}

function FoilCard({ value, label, scratch }: CardProps) {
    const { data, copy } = useInvite();
    const canvas = useRef<HTMLCanvasElement>(null);
    // Paper can't be scratched: the PDF shows the date.
    const [shown, setShown] = useState(usePrint());
    const moves = useRef(0);
    const gold = data.invitation.design.palette.gold;

    useEffect(() => {
        const el = canvas.current;
        if (!el) return;
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        el.width = Math.round(el.offsetWidth * ratio);
        el.height = Math.round(el.offsetHeight * ratio);
        paintFoil(el, gold);
    }, [gold]);

    const cleared = (el: HTMLCanvasElement) => {
        const ctx = el.getContext('2d');
        if (!ctx) return 0;
        const { data: px } = ctx.getImageData(0, 0, el.width, el.height);
        let clear = 0;
        let total = 0;
        // Every 16th pixel is plenty to judge how much foil is gone.
        for (let i = 3; i < px.length; i += 64) {
            total++;
            if ((px[i] ?? 255) < 40) clear++;
        }
        return total ? clear / total : 0;
    };

    const rub = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const el = canvas.current;
        if (!el || shown || (e.pointerType === 'mouse' && e.buttons !== 1)) return;
        const ctx = el.getContext('2d');
        if (!ctx) return;
        const box = el.getBoundingClientRect();
        const sx = el.width / box.width;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(
            (e.clientX - box.left) * sx,
            (e.clientY - box.top) * sx,
            BRUSH * sx,
            0,
            Math.PI * 2,
        );
        ctx.fill();
        moves.current++;
        if (moves.current % 8 === 0 && cleared(el) > DONE) setShown(true);
    };

    const name = copy(label);
    return (
        <div className="flex flex-1 flex-col items-center gap-3">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[clamp(10px,3cqw,18px)] bg-[color-mix(in_oklab,var(--inv-bg)_80%,white)] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.8)]">
                <span
                    className={`inv-display absolute inset-0 flex items-center justify-center px-1 text-center leading-none text-(--inv-gold) ${value.length > 4 ? 'text-[clamp(0.95rem,4.6cqw,1.6rem)]' : 'text-[clamp(1.6rem,9cqw,2.8rem)]'}`}
                >
                    {value}
                </span>
                <canvas
                    ref={canvas}
                    aria-hidden
                    onPointerDown={scratch ? rub : undefined}
                    onPointerMove={scratch ? rub : undefined}
                    className={`absolute inset-0 size-full touch-none transition-opacity duration-700 ${shown ? 'pointer-events-none opacity-0' : ''} ${scratch ? 'cursor-grab' : ''}`}
                />
                {!shown && (
                    <button
                        type="button"
                        onClick={() => {
                            setShown(true);
                        }}
                        aria-label={`${copy('reveal')}: ${name}`}
                        className={`absolute inset-0 ${scratch ? 'pointer-events-none opacity-0 focus-visible:pointer-events-auto' : ''} focus-visible:outline-2 focus-visible:outline-(--inv-gold)`}
                    />
                )}
            </div>
            <span className="text-[clamp(0.62rem,2.8cqw,0.8rem)] tracking-[0.4em] uppercase opacity-70">
                {name}
            </span>
        </div>
    );
}

export function ScratchDate() {
    const { data, locale, copy, tier } = useInvite();
    const print = usePrint();
    const reduced = useReducedMotion();
    const event = mainEvent(data.events);
    if (!event) return null;
    const at = zonedToUtc(event.startsAt, event.timezone);
    const part = (options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(locale, {
            ...options,
            timeZone: event.timezone,
        }).format(at);
    const scratch = tier !== 'static' && reduced !== true;
    return (
        <section className="px-5 py-20 text-center">
            <SectionTitle>{copy('theDate')}</SectionTitle>
            {!print && (
                <Reveal>
                    <p className="mb-8 text-[clamp(1.05rem,4.6cqw,1.35rem)] italic opacity-85">
                        <span aria-hidden className="me-2 text-(--inv-gold)">
                            ✦
                        </span>
                        {copy('scratchDate')}
                        <span aria-hidden className="ms-2 text-(--inv-gold)">
                            ✦
                        </span>
                    </p>
                </Reveal>
            )}
            <Reveal delay={120} className="mx-auto flex max-w-lg gap-[4cqw]">
                <FoilCard value={part({ day: 'numeric' })} label="day" scratch={scratch} />
                <FoilCard value={part({ month: 'long' })} label="month" scratch={scratch} />
                <FoilCard value={part({ year: 'numeric' })} label="year" scratch={scratch} />
            </Reveal>
        </section>
    );
}
