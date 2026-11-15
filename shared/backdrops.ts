// More backdrops: seamless SVG tiles (or pure CSS) seeded per invitation and coloured from its palette.
// Each returns a CSS background-image value; scenes.tsx pairs it with ink colours that read on it.
import { rng } from './generative';
import { svgDataUrl } from './materials';

const svg = (size: number, body: string, defs = '') =>
    svgDataUrl(
        `<svg xmlns='http://www.w3.org/2000/svg' width='${String(size)}' height='${String(size)}' viewBox='0 0 ${String(size)} ${String(size)}'><defs>${defs}</defs>${body}</svg>`,
    );

const n = (v: number) => v.toFixed(1);

// Draws `shape` at (x, y) and again one tile over wherever it would cross an edge, so tiles join.
function wrapped(
    size: number,
    x: number,
    y: number,
    reach: number,
    shape: (x: number, y: number) => string,
) {
    const out = [shape(x, y)];
    const xs = [x, ...(x < reach ? [x + size] : []), ...(x > size - reach ? [x - size] : [])];
    const ys = [y, ...(y < reach ? [y + size] : []), ...(y > size - reach ? [y - size] : [])];
    for (const ax of xs) for (const ay of ys) if (ax !== x || ay !== y) out.push(shape(ax, ay));
    return out.join('');
}

// Fine grain for any surface, so flat colour never looks digital.
const grain = (id: string, alpha: number, seed: number) =>
    `<filter id='${id}' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' seed='${String(seed)}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${String(alpha)} 0'/></filter>`;

/** Terrazzo: seeded stone chips in the palette on a speckled base. */
export function terrazzo(base: string, chips: string[], seed: number): string {
    const size = 240;
    const r = rng(seed);
    const shapes: string[] = [];
    for (let i = 0; i < 46; i++) {
        const fill = r.pick(chips);
        const radius = r.range(2.2, 9);
        const sides = r.int(4, 7);
        const turn = r.range(0, Math.PI * 2);
        const pts = Array.from({ length: sides }, (_, k) => {
            const a = turn + (k / sides) * Math.PI * 2;
            const rr = radius * r.range(0.55, 1.15);
            return [Math.cos(a) * rr, Math.sin(a) * rr] as const;
        });
        shapes.push(
            wrapped(
                size,
                r.range(0, size),
                r.range(0, size),
                12,
                (x, y) =>
                    `<path d='M${pts.map(([px, py]) => `${n(x + px)} ${n(y + py)}`).join(' L')} Z' fill='${fill}'/>`,
            ),
        );
    }
    const body = `<rect width='${String(size)}' height='${String(size)}' fill='${base}'/>${shapes.join('')}<rect width='${String(size)}' height='${String(size)}' filter='url(#g)'/>`;
    return svg(size, body, grain('g', 0.09, seed));
}

/** Watercolour: soft, uneven blooms of palette colour bleeding into paper. */
export function watercolor(base: string, washes: string[], seed: number): string {
    const size = 560;
    const reach = 230;
    const r = rng(seed);
    const blooms: string[] = [];
    for (let i = 0; i < 8; i++) {
        const fill = washes[i % washes.length] ?? '#cccccc';
        const cx = r.range(0, size);
        const cy = r.range(0, size);
        // A cluster of overlapping washes gives the blotchy edge pigment leaves on paper.
        for (let k = 0; k < 5; k++) {
            const dx = r.range(-60, 60);
            const dy = r.range(-50, 50);
            const rx = r.range(45, 110);
            const ry = rx * r.range(0.55, 1);
            const opacity = r.range(0.07, 0.14).toFixed(2);
            blooms.push(
                wrapped(
                    size,
                    cx + dx,
                    cy + dy,
                    reach,
                    (x, y) =>
                        `<ellipse cx='${n(x)}' cy='${n(y)}' rx='${n(rx)}' ry='${n(ry)}' fill='${fill}' opacity='${opacity}'/>`,
                ),
            );
        }
    }
    // The blur reaches past the tile into the wrapped copies, so the bleed matches at every seam.
    const defs = `<filter id='wash' filterUnits='userSpaceOnUse' x='-${String(reach)}' y='-${String(reach)}' width='${String(size + reach * 2)}' height='${String(size + reach * 2)}'><feGaussianBlur stdDeviation='16'/></filter>${grain('g', 0.07, seed)}`;
    const body = `<rect width='${String(size)}' height='${String(size)}' fill='${base}'/><g filter='url(#wash)'>${blooms.join('')}</g><rect width='${String(size)}' height='${String(size)}' filter='url(#g)'/>`;
    return svg(size, body, defs);
}

/** Leheriya: Rajasthani tie-dye — diagonal wave stripes with soft, bled edges. */
export function leheriya(base: string, bands: string[], seed: number): string {
    const size = 170;
    // At 45°, moving one tile across shifts a stripe by size/√2 sideways and along: both must be whole
    // multiples of the stripe pitch and the wave length, or the repeat would show a seam.
    const diag = size / Math.SQRT2;
    const pitch = diag / 8;
    const wave = diag / 4;
    const amp = pitch * 0.22;
    const span = size * 1.2;
    const edge = (y: number, dir: 1 | -1) => {
        const pts: string[] = [];
        for (let x = -span; x <= span + 0.01; x += wave / 8) {
            const px = dir === 1 ? x : span - (x + span);
            pts.push(`${n(px)} ${n(y + amp * Math.sin((2 * Math.PI * px) / wave))}`);
        }
        return pts.join(' L');
    };
    const stripes: string[] = [];
    for (let i = -20; i <= 20; i++) {
        const fill = bands[((i % bands.length) + bands.length) % bands.length] ?? base;
        stripes.push(
            `<path d='M${edge(i * pitch, 1)} L${edge((i + 1) * pitch, -1)} Z' fill='${fill}'/>`,
        );
    }
    const c = size / 2;
    const defs = `<filter id='dye' filterUnits='userSpaceOnUse' x='-20' y='-20' width='${String(size + 40)}' height='${String(size + 40)}'><feGaussianBlur stdDeviation='1.6'/></filter>${grain('g', 0.06, seed)}`;
    const body = `<rect width='${String(size)}' height='${String(size)}' fill='${base}'/><g filter='url(#dye)'><g transform='translate(${n(c)} ${n(c)}) rotate(-45)'>${stripes.join('')}</g></g><rect width='${String(size)}' height='${String(size)}' filter='url(#g)'/>`;
    return svg(size, body, defs);
}

/** Aurora: a smooth mesh gradient of palette glows on a deep ground (pure CSS, no tile). */
export function aurora(glows: string[], seed: number): string {
    const r = rng(seed);
    return glows
        .map((c) => {
            const x = r.range(5, 95).toFixed(0);
            const y = r.range(0, 100).toFixed(0);
            const spread = r.range(38, 60).toFixed(0);
            return `radial-gradient(ellipse at ${x}% ${y}%, ${c}aa 0%, ${c}00 ${spread}%)`;
        })
        .join(', ');
}

/** Confetti: dots, squiggles, triangles and strips scattered in the palette. */
export function confetti(base: string, colors: string[], seed: number): string {
    const size = 220;
    const r = rng(seed);
    const bits: string[] = [];
    for (let i = 0; i < 34; i++) {
        const fill = r.pick(colors);
        const kind = r.int(0, 3);
        const rot = r.range(0, 360).toFixed(0);
        bits.push(
            wrapped(size, r.range(0, size), r.range(0, size), 10, (x, y) => {
                const t = `transform='rotate(${rot} ${n(x)} ${n(y)})'`;
                if (kind === 0) return `<circle cx='${n(x)}' cy='${n(y)}' r='3' fill='${fill}'/>`;
                if (kind === 1)
                    return `<rect x='${n(x - 5)}' y='${n(y - 1.6)}' width='10' height='3.2' rx='1' fill='${fill}' ${t}/>`;
                if (kind === 2)
                    return `<path d='M${n(x)} ${n(y - 4)} L${n(x + 4)} ${n(y + 3)} L${n(x - 4)} ${n(y + 3)} Z' fill='${fill}' ${t}/>`;
                return `<path d='M${n(x - 7)} ${n(y)} q3.5 -5 7 0 t7 0' fill='none' stroke='${fill}' stroke-width='1.8' stroke-linecap='round' ${t}/>`;
            }),
        );
    }
    return svg(
        size,
        `<rect width='${String(size)}' height='${String(size)}' fill='${base}'/>${bits.join('')}`,
    );
}
