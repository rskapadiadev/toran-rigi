// Seeded generative ornaments: the same names + date always produce the same unique artwork.
// Pure functions returning SVG path data, so they render identically in the browser, SSR and OG images.
import type { generativeKinds } from './schemas/invitation';

export type GenerativeKind = (typeof generativeKinds)[number];
export type StrokeRole = 'gold' | 'primary' | 'accent' | 'ink';

export interface OrnamentPath {
    d: string;
    role: StrokeRole;
    width: number;
    fill?: boolean;
    layer: number;
}

export interface Ornament {
    size: number;
    paths: OrnamentPath[];
    layers: number;
}

export function seedFrom(...parts: string[]): number {
    let h = 2166136261;
    for (const ch of parts.join('|').normalize('NFC')) {
        h ^= ch.codePointAt(0) ?? 0;
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

// mulberry32: tiny, fast, deterministic.
export function rng(seed: number) {
    let a = seed >>> 0;
    const next = () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
        next,
        range: (lo: number, hi: number) => lo + next() * (hi - lo),
        int: (lo: number, hi: number) => Math.floor(lo + next() * (hi - lo + 1)),
        pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T,
    };
}

const SIZE = 400;
const C = SIZE / 2;
const f = (n: number) => Math.round(n * 100) / 100;

function polar(r: number, deg: number): [number, number] {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [f(C + r * Math.cos(rad)), f(C + r * Math.sin(rad))];
}

const circle = (r: number) =>
    `M ${f(C - r)} ${C} a ${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a ${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0`;

function dot(x: number, y: number, r: number) {
    return `M ${f(x - r)} ${y} a ${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a ${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0`;
}

function petal(
    inner: number,
    outer: number,
    angle: number,
    spread: number,
    bulge: number,
    pointed: boolean,
) {
    const [x0, y0] = polar(inner, angle);
    const [x1, y1] = polar(outer, angle);
    const [c1x, c1y] = polar(inner + (outer - inner) * bulge, angle - spread);
    const [c2x, c2y] = polar(inner + (outer - inner) * bulge, angle + spread);
    return pointed
        ? `M ${x0} ${y0} Q ${c1x} ${c1y} ${x1} ${y1} Q ${c2x} ${c2y} ${x0} ${y0} Z`
        : `M ${x0} ${y0} C ${c1x} ${c1y} ${polar(outer, angle - spread / 2).join(' ')} ${x1} ${y1} C ${polar(outer, angle + spread / 2).join(' ')} ${c2x} ${c2y} ${x0} ${y0} Z`;
}

function ringOfDots(
    paths: OrnamentPath[],
    r: number,
    count: number,
    size: number,
    role: StrokeRole,
    layer: number,
    offset = 0,
) {
    const d = Array.from({ length: count }, (_, i) => {
        const [x, y] = polar(r, offset + (360 / count) * i);
        return dot(x, y, size);
    }).join(' ');
    paths.push({
        d,
        role,
        width: 0,
        fill: true,
        layer,
    });
}

function mandala(seed: number, pointed: boolean): Ornament {
    const r = rng(seed);
    const paths: OrnamentPath[] = [];
    const layers = r.int(4, 6);
    const folds = r.pick([8, 12, 16] as const);
    let radius = r.range(18, 28);
    paths.push({
        d: circle(radius * 0.55),
        role: 'gold',
        width: 1.2,
        layer: 0,
    });
    for (let layer = 1; layer <= layers; layer++) {
        const outer = radius + r.range(22, 34);
        const count = folds * (layer > 2 && r.next() > 0.5 ? 2 : 1);
        const spread = (360 / count) * r.range(0.35, 0.6);
        const bulge = r.range(0.35, 0.75);
        const offset = layer % 2 ? 0 : 180 / count;
        const d = Array.from({ length: count }, (_, i) =>
            petal(radius, outer, offset + (360 / count) * i, spread, bulge, pointed),
        ).join(' ');
        paths.push({
            d,
            role: layer % 2 ? 'primary' : 'gold',
            width: 1.4,
            layer,
        });
        if (r.next() > 0.45)
            ringOfDots(paths, outer + 6, count, r.range(1.4, 2.6), 'gold', layer, offset);
        if (r.next() > 0.6) {
            paths.push({
                d: circle(outer + 12),
                role: 'accent',
                width: 0.8,
                layer,
            });
        }
        radius = outer + r.range(4, 10);
        if (radius > C - 20) break;
    }
    return {
        size: SIZE,
        paths,
        layers,
    };
}

function girih(seed: number): Ornament {
    const r = rng(seed);
    const paths: OrnamentPath[] = [];
    const n = r.pick([8, 10, 12] as const);
    const rings = r.int(3, 4);
    for (let ring = 0; ring < rings; ring++) {
        const R = 40 + ring * r.range(38, 48);
        const step = r.pick([2, 3] as const);
        const offset = ring % 2 ? 180 / n : 0;
        const pts = Array.from({ length: n }, (_, i) => polar(R, offset + (360 / n) * i));
        // Star polygon {n/step} — the backbone of Islamic geometric rosettes.
        const star = pts
            .map((_, i) => {
                const a = pts[i] ?? [C, C];
                const b = pts[(i + step) % n] ?? [C, C];
                return `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`;
            })
            .join(' ');
        paths.push({
            d: star,
            role: ring % 2 ? 'gold' : 'primary',
            width: 1.3,
            layer: ring,
        });
        const kite = pts
            .map((p, i) => {
                const mid = polar(R * r.range(0.72, 0.84), offset + (360 / n) * (i + 0.5));
                const nextP = pts[(i + 1) % n] ?? p;
                return `M ${p[0]} ${p[1]} L ${mid[0]} ${mid[1]} L ${nextP[0]} ${nextP[1]}`;
            })
            .join(' ');
        paths.push({
            d: kite,
            role: 'accent',
            width: 0.9,
            layer: ring,
        });
        paths.push({
            d: circle(R + 8),
            role: 'gold',
            width: 0.6,
            layer: ring,
        });
    }
    ringOfDots(paths, 22, n, 2.2, 'gold', 0);
    return {
        size: SIZE,
        paths,
        layers: rings,
    };
}

function bandhani(seed: number): Ornament {
    const r = rng(seed);
    const paths: OrnamentPath[] = [];
    const rings = r.int(6, 9);
    for (let i = 0; i < rings; i++) {
        const radius = 18 + i * r.range(18, 22);
        const count = 6 + i * r.pick([6, 8] as const);
        ringOfDots(
            paths,
            radius,
            count,
            r.range(2, 4.2),
            i % 3 === 0 ? 'gold' : i % 3 === 1 ? 'primary' : 'accent',
            i,
            i % 2 ? 180 / count : 0,
        );
        if (i % 2 === 0 && r.next() > 0.4) {
            const d = Array.from({ length: count / 2 }, (_, k) => {
                const [x, y] = polar(radius + 9, (720 / count) * k);
                return `M ${f(x - 2.5)} ${f(y - 2.5)} h 5 v 5 h -5 Z`;
            }).join(' ');
            paths.push({
                d,
                role: 'ink',
                width: 0.6,
                layer: i,
            });
        }
    }
    return {
        size: SIZE,
        paths,
        layers: rings,
    };
}

function phulkari(seed: number): Ornament {
    const r = rng(seed);
    const paths: OrnamentPath[] = [];
    const folds = r.pick([8, 12] as const);
    const rings = r.int(3, 5);
    for (let ring = 0; ring < rings; ring++) {
        const R = 30 + ring * 36;
        const s = r.range(10, 16);
        const d = Array.from({ length: folds }, (_, i) => {
            const a = (360 / folds) * i + (ring % 2 ? 180 / folds : 0);
            const [x, y] = polar(R, a);
            const nested = [s, s * 0.6, s * 0.25]
                .map(
                    (k) =>
                        `M ${f(x)} ${f(y - k)} L ${f(x + k)} ${f(y)} L ${f(x)} ${f(y + k)} L ${f(x - k)} ${f(y)} Z`,
                )
                .join(' ');
            return nested;
        }).join(' ');
        paths.push({
            d,
            role: ring % 2 ? 'gold' : 'primary',
            width: 1.2,
            layer: ring,
        });
    }
    return {
        size: SIZE,
        paths,
        layers: rings,
    };
}

function botanical(seed: number): Ornament {
    const r = rng(seed);
    const paths: OrnamentPath[] = [];
    const arms = r.pick([5, 6, 8] as const);
    for (let i = 0; i < arms; i++) {
        const base = (360 / arms) * i;
        const sweep = r.range(50, 80) * (i % 2 ? -1 : 1);
        const pts = Array.from({ length: 7 }, (_, k) => polar(30 + k * 24, base + (sweep * k) / 6));
        const stem = `M ${pts.map((p) => p.join(' ')).join(' L ')}`;
        paths.push({
            d: stem,
            role: 'gold',
            width: 1.4,
            layer: 1,
        });
        const leaves = pts
            .slice(1)
            .map((p, k) => {
                const angle = base + (sweep * (k + 1)) / 6 + (k % 2 ? 50 : -50);
                const [lx, ly] = [
                    p[0] + 16 * Math.cos(((angle - 90) * Math.PI) / 180),
                    p[1] + 16 * Math.sin(((angle - 90) * Math.PI) / 180),
                ];
                return `M ${p[0]} ${p[1]} Q ${f((p[0] + lx) / 2 + 6)} ${f((p[1] + ly) / 2 - 6)} ${f(lx)} ${f(ly)} Q ${f((p[0] + lx) / 2 - 6)} ${f((p[1] + ly) / 2 + 6)} ${p[0]} ${p[1]} Z`;
            })
            .join(' ');
        paths.push({
            d: leaves,
            role: 'primary',
            width: 1,
            layer: 2,
        });
        const bloom = pts[pts.length - 1] ?? [C, C];
        paths.push({
            d: dot(bloom[0], bloom[1], r.range(4, 7)),
            role: 'accent',
            width: 0,
            fill: true,
            layer: 3,
        });
    }
    paths.push({
        d: circle(22),
        role: 'gold',
        width: 1.2,
        layer: 0,
    });
    return {
        size: SIZE,
        paths,
        layers: 4,
    };
}

function ketubah(seed: number): Ornament {
    const r = rng(seed);
    const paths: OrnamentPath[] = [];
    const arches = r.pick([8, 10, 12] as const);
    const R = r.range(120, 140);
    const d = Array.from({ length: arches }, (_, i) => {
        const a0 = (360 / arches) * i;
        const a1 = (360 / arches) * (i + 1);
        const [x0, y0] = polar(R, a0);
        const [x1, y1] = polar(R, a1);
        const [cx, cy] = polar(R + r.range(28, 40), (a0 + a1) / 2);
        return `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`;
    }).join(' ');
    paths.push({
        d,
        role: 'gold',
        width: 1.6,
        layer: 1,
    });
    paths.push({
        d: circle(R),
        role: 'primary',
        width: 1,
        layer: 0,
    });
    // Pomegranates — a classic ketubah symbol of abundance.
    const pomegranates = Array.from({ length: arches }, (_, i) => {
        const [x, y] = polar(R + 20, (360 / arches) * (i + 0.5));
        return `${dot(x, y + 3, 6)} M ${f(x - 3)} ${f(y - 3)} l 3 -5 l 3 5`;
    }).join(' ');
    paths.push({
        d: pomegranates,
        role: 'accent',
        width: 1,
        layer: 2,
    });
    const inner = mandala(seed ^ 0x9e3779b9, true);
    for (const p of inner.paths.slice(0, 4))
        paths.push({
            ...p,
            layer: p.layer + 2,
        });
    return {
        size: SIZE,
        paths,
        layers: 6,
    };
}

export function generateOrnament(kind: GenerativeKind, seed: number): Ornament {
    switch (kind) {
        case 'mandala':
            return mandala(seed, false);
        case 'lotus':
            return mandala(seed, true);
        case 'girih':
            return girih(seed);
        case 'bandhani':
            return bandhani(seed);
        case 'phulkari':
            return phulkari(seed);
        case 'botanical':
            return botanical(seed);
        case 'ketubah':
            return ketubah(seed);
    }
}
