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

// ── Modern ───────────────────────────────────────────────────────────────────

const pt = ([x, y]: readonly [number, number]) => `${f(x)} ${f(y)}`;

// Squares spiralling inward, each a few degrees turned from the last (Josef Albers, op-art).
function squares(seed: number): Ornament {
    const r = rng(seed);
    const paths: OrnamentPath[] = [];
    const count = r.int(9, 14);
    const turn = r.range(4, 11) * (r.next() > 0.5 ? 1 : -1);
    const shrink = r.range(0.85, 0.9);
    let R = 182;
    for (let i = 0; i < count; i++) {
        const rot = i * turn;
        const corners = [0, 1, 2, 3].map((k) => polar(R, rot + 45 + 90 * k));
        paths.push({
            d: `M ${corners.map(pt).join(' L ')} Z`,
            role: i % 3 === 0 ? 'gold' : i % 3 === 1 ? 'primary' : 'accent',
            width: i === 0 ? 1.8 : 1.2,
            layer: Math.floor(i / 3),
        });
        R *= shrink;
    }
    paths.push({
        d: dot(C, C, 4),
        role: 'gold',
        width: 0,
        fill: true,
        layer: Math.ceil(count / 3),
    });
    return {
        size: SIZE,
        paths,
        layers: Math.ceil(count / 3) + 1,
    };
}

// A Bauhaus tile grid: every square holds a quarter circle, half circle, dot, diagonal or nothing.
function bauhaus(seed: number): Ornament {
    const r = rng(seed);
    const paths: OrnamentPath[] = [];
    const n = r.pick([4, 5] as const);
    const t = 300 / n;
    const x0 = C - 150;
    const roles: StrokeRole[] = ['primary', 'gold', 'accent'];
    const fills: Record<StrokeRole, string[]> = {
        gold: [],
        primary: [],
        accent: [],
        ink: [],
    };
    const lines: string[] = [];
    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            const x = x0 + col * t;
            const y = x0 + row * t;
            const role = r.pick(roles);
            const shape = r.int(0, 5);
            const corner = r.int(0, 3);
            // Corner the quarter circle grows from, and its two neighbours.
            const cs = [
                [x, y],
                [x + t, y],
                [x + t, y + t],
                [x, y + t],
            ] as const;
            const c0 = cs[corner] ?? cs[0];
            const c1 = cs[(corner + 1) % 4] ?? cs[1];
            const c3 = cs[(corner + 3) % 4] ?? cs[3];
            if (shape === 0)
                fills[role].push(`M ${pt(c0)} L ${pt(c1)} A ${f(t)} ${f(t)} 0 0 1 ${pt(c3)} Z`);
            // Half moon on one side, bulging into the tile (sweep 0 curves toward the interior).
            else if (shape === 1)
                fills[role].push(`M ${pt(c0)} A ${f(t / 2)} ${f(t / 2)} 0 0 0 ${pt(c1)} Z`);
            else if (shape === 2) fills[role].push(dot(x + t / 2, y + t / 2, t * 0.3));
            else if (shape === 3) lines.push(`M ${pt(c0)} L ${pt(cs[(corner + 2) % 4] ?? cs[2])}`);
            else if (shape === 4) fills[role].push(`M ${pt(c0)} L ${pt(c1)} L ${pt(c3)} Z`);
        }
    }
    const grid = Array.from({ length: n + 1 }, (_, i) => {
        const v = x0 + i * t;
        return `M ${f(v)} ${f(x0)} V ${f(x0 + 300)} M ${f(x0)} ${f(v)} H ${f(x0 + 300)}`;
    }).join(' ');
    paths.push({
        d: grid,
        role: 'ink',
        width: 1,
        layer: 0,
    });
    roles.forEach((role, i) => {
        if (fills[role].length)
            paths.push({
                d: fills[role].join(' '),
                role,
                width: 0,
                fill: true,
                layer: i + 1,
            });
    });
    if (lines.length)
        paths.push({
            d: lines.join(' '),
            role: 'ink',
            width: 1.6,
            layer: 4,
        });
    return {
        size: SIZE,
        paths,
        layers: 5,
    };
}

// Truchet tiles: two quarter arcs per square, turned at random, so the arcs join into one maze-like line.
function truchet(seed: number): Ornament {
    const r = rng(seed);
    const n = r.pick([6, 7, 8] as const);
    const t = 300 / n;
    const h = t / 2;
    const x0 = C - 150;
    const arcs: string[] = [];
    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            const x = x0 + col * t;
            const y = x0 + row * t;
            if (r.next() > 0.5)
                arcs.push(
                    `M ${f(x + h)} ${f(y)} A ${f(h)} ${f(h)} 0 0 1 ${f(x)} ${f(y + h)}`,
                    `M ${f(x + t)} ${f(y + h)} A ${f(h)} ${f(h)} 0 0 0 ${f(x + h)} ${f(y + t)}`,
                );
            else
                arcs.push(
                    `M ${f(x + h)} ${f(y)} A ${f(h)} ${f(h)} 0 0 0 ${f(x + t)} ${f(y + h)}`,
                    `M ${f(x)} ${f(y + h)} A ${f(h)} ${f(h)} 0 0 1 ${f(x + h)} ${f(y + t)}`,
                );
        }
    }
    const half = Math.ceil(arcs.length / 2);
    return {
        size: SIZE,
        paths: [
            {
                d: `M ${f(x0)} ${f(x0)} h 300 v 300 h -300 Z`,
                role: 'gold',
                width: 1.4,
                layer: 0,
            },
            {
                d: arcs.slice(0, half).join(' '),
                role: 'primary',
                width: 2,
                layer: 1,
            },
            {
                d: arcs.slice(half).join(' '),
                role: 'accent',
                width: 2,
                layer: 2,
            },
        ],
        layers: 3,
    };
}

// Concentric broken rings with planets riding them: a quiet, modern orrery.
function orbits(seed: number): Ornament {
    const r = rng(seed);
    const paths: OrnamentPath[] = [];
    const rings = r.int(5, 8);
    for (let i = 0; i < rings; i++) {
        const R = 34 + i * (150 / rings);
        const start = r.range(0, 360);
        const sweep = r.range(200, 320);
        const a = polar(R, start);
        const b = polar(R, start + sweep);
        const role: StrokeRole = i % 3 === 0 ? 'gold' : i % 3 === 1 ? 'primary' : 'accent';
        paths.push({
            d: `M ${pt(a)} A ${f(R)} ${f(R)} 0 ${sweep > 180 ? 1 : 0} 1 ${pt(b)}`,
            role,
            width: i % 2 ? 1 : 1.8,
            layer: i,
        });
        const planet = polar(R, start + sweep * r.range(0.2, 0.9));
        paths.push({
            d: dot(planet[0], planet[1], r.range(3, 7)),
            role: i % 2 ? 'gold' : 'primary',
            width: 0,
            fill: true,
            layer: i,
        });
    }
    paths.push({
        d: dot(C, C, 12),
        role: 'gold',
        width: 0,
        fill: true,
        layer: 0,
    });
    return {
        size: SIZE,
        paths,
        layers: rings,
    };
}

// Art-deco sunburst: rays of alternating length around a stepped core.
function sunburst(seed: number): Ornament {
    const r = rng(seed);
    const rays = r.pick([36, 48, 60] as const);
    const inner = r.range(40, 56);
    const long = r.range(165, 185);
    const short = long * r.range(0.62, 0.78);
    const longRays: string[] = [];
    const shortRays: string[] = [];
    for (let i = 0; i < rays; i++) {
        const a = (360 / rays) * i;
        const end = i % 2 ? short : long;
        (i % 2 ? shortRays : longRays).push(`M ${pt(polar(inner, a))} L ${pt(polar(end, a))}`);
    }
    return {
        size: SIZE,
        paths: [
            {
                d: circle(inner - 6),
                role: 'gold',
                width: 1.6,
                layer: 0,
            },
            {
                d: circle(inner - 16),
                role: 'primary',
                width: 1,
                layer: 0,
            },
            {
                d: longRays.join(' '),
                role: 'gold',
                width: 1.4,
                layer: 1,
            },
            {
                d: shortRays.join(' '),
                role: 'primary',
                width: 1,
                layer: 2,
            },
            {
                d: circle(short + 10),
                role: 'accent',
                width: 0.7,
                layer: 3,
            },
        ],
        layers: 4,
    };
}

// Spirograph: two hypotrochoids (the drawing toy's loops), closed by choosing whole-number gears.
function spirograph(seed: number): Ornament {
    const r = rng(seed);
    const curve = (big: number, small: number, pen: number) => {
        const k = big - small;
        // The pattern closes after small / gcd(big, small) turns.
        const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
        const turns = small / gcd(big, small);
        const steps = Math.min(1400, Math.round(turns * 120));
        const raw = Array.from({ length: steps + 1 }, (_, i) => {
            const th = (i / steps) * turns * 2 * Math.PI;
            return [
                k * Math.cos(th) + pen * Math.cos((k / small) * th),
                k * Math.sin(th) - pen * Math.sin((k / small) * th),
            ] as const;
        });
        const extent = Math.max(...raw.map(([x, y]) => Math.hypot(x, y)));
        const scale = 172 / extent;
        return `M ${raw.map(([x, y]) => `${f(C + x * scale)} ${f(C + y * scale)}`).join(' L ')}`;
    };
    const big = r.int(9, 15);
    const small = r.int(3, big - 2);
    const big2 = r.int(7, 12);
    const small2 = r.int(2, big2 - 3);
    return {
        size: SIZE,
        paths: [
            {
                d: curve(big, small, small * r.range(0.6, 1.1)),
                role: 'gold',
                width: 0.9,
                layer: 0,
            },
            {
                d: curve(big2, small2, small2 * r.range(0.4, 0.9)),
                role: 'primary',
                width: 0.8,
                layer: 1,
            },
        ],
        layers: 2,
    };
}

// Op-art: parallel lines inside a circle that swell outward over a hidden sphere.
function opart(seed: number): Ornament {
    const r = rng(seed);
    const R = 176;
    const gap = r.range(9, 13);
    const bulge = r.range(18, 30);
    const spread = r.range(70, 110);
    const angle = r.range(-25, 25);
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rows: string[][] = [[], []];
    let row = 0;
    for (let y = -R + gap; y < R; y += gap) {
        const half = Math.sqrt(R * R - y * y);
        const pts = Array.from({ length: 41 }, (_, i) => {
            const x = -half + (2 * half * i) / 40;
            const lift = bulge * Math.exp(-(x * x + y * y) / (spread * spread));
            // Pushed away from the centre line, so the rows part over a sphere.
            const yy = y + lift * (y < 0 ? -1 : 1);
            return [C + x * cos - yy * sin, C + x * sin + yy * cos] as const;
        });
        rows[row % 2]?.push(`M ${pts.map(pt).join(' L ')}`);
        row++;
    }
    return {
        size: SIZE,
        paths: [
            {
                d: rows[0]?.join(' ') ?? '',
                role: 'primary',
                width: 1.4,
                layer: 0,
            },
            {
                d: rows[1]?.join(' ') ?? '',
                role: 'gold',
                width: 1.4,
                layer: 1,
            },
            {
                d: circle(R + 6),
                role: 'gold',
                width: 1,
                layer: 2,
            },
        ],
        layers: 3,
    };
}

// A constellation: seeded stars joined to their nearest neighbours — "the stars aligned".
function constellation(seed: number): Ornament {
    const r = rng(seed);
    const count = r.int(14, 22);
    const stars: [number, number][] = [];
    while (stars.length < count) {
        const [x, y] = polar(r.range(20, 170), r.range(0, 360));
        // Keep stars apart, so the figure reads as points, not a cluster.
        if (stars.every(([sx, sy]) => Math.hypot(sx - x, sy - y) > 34)) stars.push([x, y]);
        if (stars.length === 0) stars.push([x, y]);
    }
    const links = new Set<string>();
    const lines: string[] = [];
    stars.forEach((a, i) => {
        const near = stars
            .map((b, j) => ({
                j,
                d: Math.hypot(a[0] - b[0], a[1] - b[1]),
            }))
            .filter((o) => o.j !== i)
            .sort((p, q) => p.d - q.d)
            .slice(0, r.int(1, 2));
        for (const { j } of near) {
            const key = i < j ? `${String(i)}-${String(j)}` : `${String(j)}-${String(i)}`;
            const b = stars[j];
            if (!links.has(key) && b) {
                links.add(key);
                lines.push(`M ${pt(a)} L ${pt(b)}`);
            }
        }
    });
    const sparkle = (x: number, y: number, s: number) =>
        `M ${f(x)} ${f(y - s)} Q ${f(x)} ${f(y)} ${f(x + s)} ${f(y)} Q ${f(x)} ${f(y)} ${f(x)} ${f(y + s)} Q ${f(x)} ${f(y)} ${f(x - s)} ${f(y)} Q ${f(x)} ${f(y)} ${f(x)} ${f(y - s)} Z`;
    const bright = stars.filter(() => r.next() > 0.7);
    return {
        size: SIZE,
        paths: [
            {
                d: circle(182),
                role: 'gold',
                width: 0.8,
                layer: 0,
            },
            {
                d: lines.join(' '),
                role: 'primary',
                width: 1,
                layer: 1,
            },
            {
                d: stars.map(([x, y]) => dot(x, y, r.range(2.2, 4))).join(' '),
                role: 'gold',
                width: 0,
                fill: true,
                layer: 2,
            },
            {
                d: bright.map(([x, y]) => sparkle(x, y, r.range(9, 14))).join(' '),
                role: 'accent',
                width: 0,
                fill: true,
                layer: 3,
            },
        ],
        layers: 4,
    };
}

/** Names and one-line descriptions, shared by the Composer and the Library. */
export interface GenerativeInfo {
    label: string;
    hint: string;
    modern: boolean;
}

export const generativeInfo: Record<GenerativeKind, GenerativeInfo> = {
    mandala: {
        label: 'Mandala',
        hint: 'Rounded petals in rings, folding 8, 12 or 16 ways',
        modern: false,
    },
    lotus: {
        label: 'Lotus mandala',
        hint: 'Pointed petals opening layer by layer',
        modern: false,
    },
    girih: {
        label: 'Girih star',
        hint: 'Interlaced Islamic star geometry',
        modern: false,
    },
    botanical: {
        label: 'Botanical',
        hint: 'A wreath of seeded leaves and buds',
        modern: false,
    },
    ketubah: {
        label: 'Ketubah',
        hint: 'Papercut-style frame from Jewish marriage contracts',
        modern: false,
    },
    phulkari: {
        label: 'Phulkari',
        hint: 'Punjabi embroidery: stitched geometric blooms',
        modern: false,
    },
    bandhani: {
        label: 'Bandhani',
        hint: 'Tie-dye dots in concentric rings',
        modern: false,
    },
    squares: {
        label: 'Nested squares',
        hint: 'Squares spiralling inward, each turned a little',
        modern: true,
    },
    bauhaus: {
        label: 'Bauhaus grid',
        hint: 'Bold tiles of quarter circles, half moons and dots',
        modern: true,
    },
    truchet: {
        label: 'Truchet maze',
        hint: 'Quarter arcs that join into one flowing line',
        modern: true,
    },
    orbits: {
        label: 'Orbits',
        hint: 'Broken rings with planets riding them',
        modern: true,
    },
    sunburst: {
        label: 'Sunburst',
        hint: 'Art-deco rays of alternating length',
        modern: true,
    },
    spirograph: {
        label: 'Spirograph',
        hint: 'Looping curves, like the drawing toy',
        modern: true,
    },
    opart: {
        label: 'Op-art bulge',
        hint: 'Parallel lines swelling over a hidden sphere',
        modern: true,
    },
    constellation: {
        label: 'Constellation',
        hint: 'Seeded stars joined — the stars aligned',
        modern: true,
    },
};

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
        case 'squares':
            return squares(seed);
        case 'bauhaus':
            return bauhaus(seed);
        case 'truchet':
            return truchet(seed);
        case 'orbits':
            return orbits(seed);
        case 'sunburst':
            return sunburst(seed);
        case 'spirograph':
            return spirograph(seed);
        case 'opart':
            return opart(seed);
        case 'constellation':
            return constellation(seed);
    }
}
