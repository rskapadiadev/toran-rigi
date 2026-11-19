// Layers on the film: how each enters, the shape a photo sits in, and the effects drawn over the
// picture. Effects are drawn from a clock alone, so the invitation (real time) and the couple's video
// (video time) draw the same petals and fireworks.
import type { FilmLayer, LayerKey } from '@shared/types';

type Effect = NonNullable<FilmLayer['effect']>;
type Enter = NonNullable<FilmLayer['enter']>;
type Shape = NonNullable<FilmLayer['shape']>;

// Width over height of a photo's frame.
export const shapeAspect: Record<Shape, number> = {
    arch: 3 / 4,
    circle: 1,
    frame: 4 / 5,
};

// The entrance as it plays: a = 0 (not yet in) to 1 (fully in).
export function enterLook(enter: Enter, a: number) {
    const k = 1 - a;
    return {
        transform:
            enter === 'rise'
                ? `translateY(${String(k * 28)}px)`
                : enter === 'zoom'
                  ? `scale(${String(0.82 + 0.18 * a)})`
                  : '',
        filter: enter === 'blur' ? `blur(${String(k * 10)}px)` : '',
        lift: enter === 'rise' ? k * 28 : 0,
        scale: enter === 'zoom' ? 0.82 + 0.18 * a : 1,
        blur: enter === 'blur' ? k * 10 : 0,
    };
}

// Where a layer is at second t: its keyframes eased one into the next (held before the first and
// after the last), or its zone when it has none.
export type Pose = Omit<LayerKey, 'at'>;

const ease = (p: number) => p * p * (3 - 2 * p);

export function poseAt(layer: FilmLayer, t: number): Pose {
    const keys = [...(layer.keys ?? [])].sort((a, b) => a.at - b.at);
    const still: Pose = {
        x: layer.zone.x,
        y: layer.zone.y,
        w: layer.zone.w,
        opacity: 1,
        rotate: 0,
    };
    const first = keys[0];
    const last = keys.at(-1);
    if (!first || !last) return still;
    const pick = ({ at: _, ...pose }: LayerKey): Pose => pose;
    if (t <= first.at) return pick(first);
    if (t >= last.at) return pick(last);
    const k = keys.findIndex((key) => key.at > t);
    const a = keys[k - 1] ?? first;
    const b = keys[k] ?? last;
    const p = ease((t - a.at) / Math.max(1e-6, b.at - a.at));
    const mix = (u: number, v: number) => u + (v - u) * p;
    return {
        x: mix(a.x, b.x),
        y: mix(a.y, b.y),
        w: mix(a.w, b.w),
        opacity: mix(a.opacity, b.opacity),
        rotate: mix(a.rotate, b.rotate),
    };
}

// Sets the pose at second `at`: changes the keyframe there (within a frame's width) or adds one,
// starting from where the layer already is at that moment.
export function withKey(layer: FilmLayer, at: number, change: Partial<Pose>): LayerKey[] {
    const keys = layer.keys ?? [];
    const near = keys.findIndex((k) => Math.abs(k.at - at) < 0.05);
    if (near >= 0)
        return keys.map((k, i) =>
            i === near
                ? {
                      ...k,
                      ...change,
                  }
                : k,
        );
    return [
        ...keys,
        {
            at,
            ...poseAt(layer, at),
            ...change,
        },
    ].sort((a, b) => a.at - b.at);
}

export const initialsOf = (one: string, two: string) => {
    const first = (name: string) => Array.from(name.trim())[0] ?? '';
    return two ? `${first(one)} & ${first(two)}` : first(one);
};

function rng(seed: number) {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

interface Particle {
    x: number;
    y: number;
    v: number;
    ph: number;
    s: number;
    c: string;
}

const palettes: Record<Effect, string[]> = {
    petals: ['#e8506e', '#f6a0b4', '#fff4ec', '#d8465a'],
    marigold: ['#f29a2e', '#f6c23e', '#e0562a'],
    sparkles: ['#fff6dc', '#ffe2a0'],
    fireworks: ['255,210,120', '255,140,170', '255,244,220', '150,230,220'],
    lanterns: ['#ffb35a'],
};

// The same particles every time for an effect (made once).
const made = new Map<Effect, Particle[]>();
function particles(effect: Effect) {
    const known = made.get(effect);
    if (known) return known;
    const r = rng(effect.length * 97 + 13);
    const count = effect === 'sparkles' ? 64 : effect === 'lanterns' ? 18 : 46;
    const colors = palettes[effect];
    const list = Array.from({ length: count }, (_, i) => ({
        x: r(),
        y: r(),
        v: 0.6 + r() * 0.8,
        ph: r() * 40,
        s: 0.6 + r() * 0.8,
        c: colors[i % colors.length] ?? '#fff',
    }));
    made.set(effect, list);
    return list;
}

const wrap = (v: number) => v - Math.floor(v);

// Draws an effect over a w × h picture at `clock` seconds, at strength `alpha`.
export function drawEffect(
    ctx: CanvasRenderingContext2D,
    effect: Effect,
    clock: number,
    w: number,
    h: number,
    alpha: number,
) {
    if (alpha <= 0) return;
    ctx.save();
    if (effect === 'petals' || effect === 'marigold') {
        for (const p of particles(effect)) {
            // Falling at their own pace, swaying, turning; round again from the top.
            const y = (wrap(p.y + (clock * 0.11 * p.v) / 1.3) * 1.3 - 0.15) * h;
            const x = p.x * w + Math.sin(clock * 1.2 + p.ph) * 0.04 * w;
            const size = (effect === 'petals' ? 0.016 : 0.013) * w * p.s;
            ctx.globalAlpha = alpha * 0.92;
            ctx.fillStyle = p.c;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(clock * 1.6 * p.v + p.ph);
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * (effect === 'petals' ? 0.6 : 0.85), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    } else if (effect === 'sparkles') {
        ctx.globalCompositeOperation = 'lighter';
        for (const p of particles(effect)) {
            const b = Math.max(0, Math.sin(clock * 2.2 * p.v + p.ph)) ** 4;
            if (b < 0.04) continue;
            const x = p.x * w;
            const y = p.y * 0.75 * h;
            const r = 0.014 * w * p.s * b;
            ctx.globalAlpha = alpha * b;
            ctx.fillStyle = p.c;
            ctx.fillRect(x - r, y - 0.6, r * 2, 1.2);
            ctx.fillRect(x - 0.6, y - r, 1.2, r * 2);
            ctx.beginPath();
            ctx.arc(x, y, Math.max(0.8, r * 0.18), 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (effect === 'lanterns') {
        for (const p of particles(effect)) {
            // Rising slowly from below the picture, drifting a little.
            const y = (1.1 - wrap(p.y + (clock * 0.05 * p.v) / 1.3) * 1.3) * h;
            const x = p.x * w + Math.sin(clock * 0.6 + p.ph) * 0.03 * w;
            const s = 0.018 * w * p.s;
            ctx.globalCompositeOperation = 'lighter';
            const glow = ctx.createRadialGradient(x, y, 0, x, y, s * 3.5);
            glow.addColorStop(0, `rgba(255,150,60,${String(0.45 * alpha)})`);
            glow.addColorStop(1, 'rgba(255,150,60,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(x - s * 3.5, y - s * 3.5, s * 7, s * 7);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.c;
            ctx.beginPath();
            ctx.moveTo(x - s, y - s * 1.3);
            ctx.lineTo(x + s, y - s * 1.3);
            ctx.lineTo(x + s * 0.7, y + s * 1.1);
            ctx.lineTo(x - s * 0.7, y + s * 1.1);
            ctx.closePath();
            ctx.fill();
        }
    } else {
        // Fireworks: a burst every 0.8 s across the sky, each blooming and falling over 1.8 s.
        ctx.globalCompositeOperation = 'lighter';
        const period = 0.8;
        const now = Math.floor(clock / period);
        for (let k = now - 2; k <= now; k++) {
            const age = clock - k * period;
            if (age < 0 || age > 1.8) continue;
            const r = rng(k * 7919 + 17);
            const cx = (0.15 + r() * 0.7) * w;
            const cy = (0.08 + r() * 0.3) * h;
            const color = palettes.fireworks[Math.floor(r() * 4)] ?? '255,244,220';
            const fade = Math.max(0, 1 - age / 1.8) ** 1.4;
            const radius = (0.16 + r() * 0.08) * w * (1 - Math.exp(-age * 3.2));
            const drop = 0.03 * h * age * age;
            ctx.globalAlpha = alpha * fade;
            ctx.strokeStyle = `rgba(${color},1)`;
            ctx.lineWidth = Math.max(1, 0.004 * w);
            for (let i = 0; i < 48; i++) {
                const a = (i / 48) * Math.PI * 2;
                const x = cx + Math.cos(a) * radius;
                const y = cy + Math.sin(a) * radius + drop;
                ctx.beginPath();
                ctx.moveTo(x - Math.cos(a) * radius * 0.12, y - Math.sin(a) * radius * 0.12);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }
    }
    ctx.restore();
}
