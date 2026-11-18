// Light rays: soft shafts of warm light falling through a dark room, with dust drifting in them.
// Pure CSS keyframes (transform + opacity only); no blur or blend modes on the big layers.
import { rng } from '@shared/generative';
import { mixHex } from '@shared/materials';
import { type CSSProperties, useMemo } from 'react';

import { useInvite } from '../../context';
import { usePrint } from '../../print';

interface Shaft {
    x: number;
    width: number;
    angle: number;
    alpha: number;
    breathe: number;
    delay: number;
}

interface Mote {
    x: number;
    y: number;
    size: number;
    drift: number;
    glint: number;
    delay: number;
    dx: number;
    dy: number;
}

const SHAFTS = 4;
const MOTES = 22;

function layout(seed: number) {
    const r = rng(seed + 5150);
    const shafts: Shaft[] = Array.from({ length: SHAFTS }, (_, i) => ({
        x: 4 + i * 17 + r.range(-3, 3),
        width: i === 1 ? r.range(30, 38) : r.range(12, 24),
        angle: r.range(-30, -22),
        alpha: i === 1 ? 0.46 : r.range(0.24, 0.32),
        breathe: r.range(9, 15),
        delay: -r.range(0, 12),
    }));
    const motes: Mote[] = Array.from({ length: MOTES }, () => ({
        x: r.range(2, 90),
        y: r.range(4, 90),
        size: r.range(3, 7),
        drift: r.range(14, 26),
        glint: r.range(3.5, 7),
        delay: -r.range(0, 20),
        dx: r.range(-40, 40),
        dy: r.range(-60, -20),
    }));
    return {
        shafts,
        motes,
    };
}

export function LightRays() {
    const { data, tier, dir } = useInvite();
    const print = usePrint();
    const p = data.invitation.design.palette;
    const live = tier !== 'static' && !print;
    const { shafts, motes } = useMemo(() => layout(data.invitation.seed), [data.invitation.seed]);
    const light = mixHex(p.gold, '#ffe4b8', 0.55);
    const dust = mixHex(p.gold, '#fff4dc', 0.7);
    // Light falls from the reading side's top corner.
    const sign = dir === 'rtl' ? -1 : 1;
    const moteFill = `radial-gradient(circle, ${dust} 0%, ${dust}aa 30%, transparent 70%)`;
    return (
        <div aria-hidden className="fx-rays pointer-events-none absolute inset-0 overflow-hidden">
            {shafts.map((shaft, i) => {
                const a = shaft.alpha;
                const style = {
                    insetInlineStart: `${shaft.x.toFixed(1)}%`,
                    width: `${shaft.width.toFixed(1)}%`,
                    background: `radial-gradient(50% 100% at 50% 0%, ${light}${hex(a)} 0%, ${light}${hex(a * 0.55)} 40%, ${light}00 100%)`,
                    '--ray-a': `${(shaft.angle * sign).toFixed(1)}deg`,
                    '--ray-o': (0.55 + a).toFixed(2),
                    '--breathe': `${shaft.breathe.toFixed(1)}s`,
                    '--delay': `${shaft.delay.toFixed(1)}s`,
                } as CSSProperties;
                return (
                    <div key={i} className={`fx-ray ${live ? 'fx-ray-live' : ''}`} style={style} />
                );
            })}
            {motes.map((mote, i) => {
                const style = {
                    insetInlineStart: `${mote.x.toFixed(1)}%`,
                    top: `${mote.y.toFixed(1)}%`,
                    width: `${mote.size.toFixed(1)}px`,
                    height: `${mote.size.toFixed(1)}px`,
                    background: moteFill,
                    '--drift': `${mote.drift.toFixed(1)}s`,
                    '--glint': `${mote.glint.toFixed(1)}s`,
                    '--delay': `${mote.delay.toFixed(1)}s`,
                    '--dx': `${(mote.dx * sign).toFixed(0)}px`,
                    '--dy': `${mote.dy.toFixed(0)}px`,
                } as CSSProperties;
                return (
                    <span
                        key={i}
                        className={`fx-mote ${live ? 'fx-mote-live' : ''}`}
                        style={style}
                    />
                );
            })}
        </div>
    );
}

// Alpha (0–1) as a two-digit hex suffix for a 6-digit colour.
function hex(alpha: number) {
    return Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
        .toString(16)
        .padStart(2, '0');
}
