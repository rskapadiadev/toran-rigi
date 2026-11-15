import { type CSSProperties, useState } from 'react';

import { useInvite } from '../context';
import { coverPage } from '../kits/phoolwari';
import { GardenMonogram, Meadow } from '../sections/phoolwari';
import { OpeningShell } from './OpeningShell';
import type { OpeningProps } from './types';

// Bloom → monogram rises → petals burst → the scene flies forward into the invitation.
const OPEN_MS = 3100;

// Lotus petals by their angle when open. The back row is larger and paler, the front row deeper.
const back = [-64, -32, 0, 32, 64];
const front = [-46, -16, 16, 46];

const burst = Array.from({ length: 26 }, (_, i) => {
    const angle = (i / 26) * Math.PI * 2 + (i % 3) * 0.2;
    const reach = 32 + ((i * 17) % 28);
    return {
        dx: `${String(Math.round(Math.cos(angle) * reach))}cqw`,
        dy: `${String(Math.round(Math.sin(angle) * reach * 1.4))}svh`,
        rot: `${String((i * 47) % 360)}deg`,
        delay: `${String(0.95 + ((i * 13) % 10) / 40)}s`,
        size: 10 + ((i * 7) % 12),
    };
});

interface PetalProps {
    angle: number;
    row: 'back' | 'front';
    index: number;
}

// One petal, rotating out from the base of the flower when the bud blooms.
function Petal({ angle, row, index }: PetalProps) {
    const style = {
        '--a': `${String(angle)}deg`,
        '--closed': `${String(angle * 0.12)}deg`,
        transitionDelay: `${String(index * 0.09 + (row === 'front' ? 0.25 : 0))}s`,
    } as CSSProperties;
    const d =
        row === 'back'
            ? 'M150 205 C 112 160 112 78 150 18 C 188 78 188 160 150 205 Z'
            : 'M150 205 C 122 168 124 104 150 58 C 176 104 178 168 150 205 Z';
    return (
        <path
            d={d}
            className={`pw-petal pw-petal-${row}`}
            fill={`url(#pw-petal-${row})`}
            stroke="#e48aa6"
            strokeOpacity="0.5"
            strokeWidth="1"
            style={style}
        />
    );
}

// Phoolwari: a closed lotus bud breathes on a pastel sky. On the tap it blooms petal by petal, the
// gold monogram rises from its heart, petals burst outward and we fly through into the garden.
export function GardenOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, names, guest, copy, data, t } = useInvite();
    const [bloomed, setBloomed] = useState(false);
    const headline = t(data.invitation.content.headline);

    const open = () => {
        if (bloomed) return;
        onBegin();
        if (tier === 'static') {
            onOpened();
            return;
        }
        setBloomed(true);
        window.setTimeout(onOpened, OPEN_MS);
    };

    return (
        <OpeningShell onTap={open} busy={bloomed} hideTitle hidePrompt>
            <div
                className={`pw-lotus-stage pw-hero-sky absolute inset-0 overflow-hidden ${bloomed ? 'is-bloomed' : ''}`}
                aria-hidden
            >
                <div className="pw-lotus-light absolute inset-0" />
                <img
                    src={coverPage.ganesha}
                    alt=""
                    className="pw-in pw-glow absolute inset-x-0 top-[7svh] mx-auto w-[min(15cqw,72px)]"
                    draggable={false}
                />
                <div className="pw-lotus-intro absolute inset-x-0 top-[18svh] px-6 text-center text-[#a3164f]">
                    {guest && (
                        <p className="pw-in text-[11px] tracking-[0.3em] uppercase opacity-80">
                            {copy('dearGuest')} {guest.name}
                        </p>
                    )}
                    <p
                        className="pw-in inv-display mt-3 text-[clamp(1.6rem,8cqw,2.6rem)] leading-none tracking-[0.05em] uppercase"
                        style={{ animationDelay: '0.4s' }}
                    >
                        {names.title}
                    </p>
                    {headline && (
                        <p
                            className="pw-in mt-3 text-[11px] tracking-[0.4em] uppercase opacity-75"
                            style={{ animationDelay: '0.7s' }}
                        >
                            {headline}
                        </p>
                    )}
                </div>

                {/* The flower, its monogram and the burst share one centre. */}
                <div className="pw-lotus absolute inset-x-0 top-[50svh] mx-auto w-[min(74cqw,360px)]">
                    <div className="pw-lotus-monogram absolute inset-x-0 bottom-[66%] mx-auto flex justify-center">
                        <GardenMonogram className="h-[24svh] max-h-[250px] w-auto" />
                    </div>
                    <svg viewBox="0 0 300 230" className="pw-lotus-flower relative w-full">
                        <defs>
                            <linearGradient id="pw-petal-back" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0" stopColor="#ffe3ec" />
                                <stop offset="1" stopColor="#f3a3bb" />
                            </linearGradient>
                            <linearGradient id="pw-petal-front" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0" stopColor="#ffc4d6" />
                                <stop offset="1" stopColor="#e2678f" />
                            </linearGradient>
                            <radialGradient id="pw-lotus-heart">
                                <stop offset="0" stopColor="#fff2b8" />
                                <stop offset="1" stopColor="#fff2b8" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <circle
                            cx="150"
                            cy="190"
                            r="70"
                            fill="url(#pw-lotus-heart)"
                            className="pw-lotus-heart"
                        />
                        {back.map((a, i) => (
                            <Petal key={`b${String(a)}`} angle={a} row="back" index={i} />
                        ))}
                        {front.map((a, i) => (
                            <Petal key={`f${String(a)}`} angle={a} row="front" index={i} />
                        ))}
                        <ellipse cx="150" cy="212" rx="78" ry="9" fill="#7fa36b" opacity="0.35" />
                    </svg>
                    <div className="pointer-events-none absolute start-1/2 top-[55%]">
                        {burst.map((b, i) => {
                            const style = {
                                '--dx': b.dx,
                                '--dy': b.dy,
                                '--rot': b.rot,
                                width: b.size,
                                height: b.size * 1.5,
                                animationDelay: b.delay,
                            } as CSSProperties;
                            return <span key={i} className="pw-burst" style={style} />;
                        })}
                    </div>
                </div>

                <Meadow className="pw-lotus-meadow absolute inset-x-0 bottom-0 h-[24svh]" />
                <p className="pw-lotus-hint absolute inset-x-0 bottom-[8svh] mx-auto w-fit rounded-full bg-white/60 px-5 py-2 text-center text-[11px] tracking-[0.45em] text-[#a3164f] uppercase backdrop-blur">
                    Tap the lotus
                </p>
            </div>
        </OpeningShell>
    );
}
