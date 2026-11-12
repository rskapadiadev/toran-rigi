// Original motif library (100×100 viewBox), drawn for Toran. Used as embroidery, jacquard and print.
import type { CultureId } from './cultures';
import type { motifIds } from './schemas/invitation';

export type MotifId = (typeof motifIds)[number];

const round = (n: number) => Math.round(n * 100) / 100;

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [round(cx + r * Math.cos(rad)), round(cy + r * Math.sin(rad))];
}

function star(cx: number, cy: number, outer: number, inner: number, points: number, rotate = 0) {
    const pts = Array.from({ length: points * 2 }, (_, i) =>
        polar(cx, cy, i % 2 ? inner : outer, rotate + (180 / points) * i),
    );
    return `M${pts.map((p) => p.join(' ')).join(' L')} Z`;
}

function petalRing(
    cx: number,
    cy: number,
    r0: number,
    r1: number,
    count: number,
    width: number,
    offset = 0,
) {
    return Array.from({ length: count }, (_, i) => {
        const a = offset + (360 / count) * i;
        const [x0, y0] = polar(cx, cy, r0, a);
        const [x1, y1] = polar(cx, cy, r1, a);
        const [l1, l2] = polar(cx, cy, (r0 + r1) / 2, a - width);
        const [r1x, r1y] = polar(cx, cy, (r0 + r1) / 2, a + width);
        return `M${x0} ${y0} Q${l1} ${l2} ${x1} ${y1} Q${r1x} ${r1y} ${x0} ${y0} Z`;
    }).join(' ');
}

const circle = (cx: number, cy: number, r: number) =>
    `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`;

// Each motif is a list of filled shapes (evenodd), so it reads as thread, wax or print alike.
export const motifs: Record<MotifId, string[]> = {
    paisley: [
        // Outer buta with a hollow band, curled tip, petal fringe, inner teardrop and a small flower.
        'M50 90 C30 90 19 74 22 56 C25 39 41 28 55 20 C61 16 66 11 68 6 C72 15 70 25 64 32 C76 40 82 54 79 67 C76 81 65 90 50 90 Z M50 83 C35 83 28 71 30 58 C32 46 44 37 56 31 C67 38 72 50 70 61 C68 73 60 83 50 83 Z',
        'M51 74 C42 74 38 66 40 58 C42 51 49 46 56 43 C62 48 64 56 62 63 C60 70 56 74 51 74 Z',
        'M27.8 88 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M17.8 78 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M11.8 64 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M11.8 50 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M16.8 37 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M25.8 27 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M36.8 19 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M48.8 12 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M59.8 6 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M74.8 40 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M82.8 52 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M83.8 66 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M77.8 80 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M67.8 89 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M54.8 94 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M40.8 94 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z',
        'M66 6 C70 2 74 2 76 5 C73 5 70 7 68 10 Z',
    ],
    lotus: [
        'M50 14 C61 34 61 58 50 78 C39 58 39 34 50 14 Z',
        'M50 78 C38 62 26 46 14 40 C17 60 30 74 50 78 Z M50 78 C62 62 74 46 86 40 C83 60 70 74 50 78 Z',
        'M50 80 C30 72 16 66 4 66 C14 80 32 86 50 80 Z M50 80 C70 72 84 66 96 66 C86 80 68 86 50 80 Z',
        'M30 88 Q50 80 70 88 Q50 94 30 88 Z',
    ],
    girih: [star(50, 50, 46, 26, 8), star(50, 50, 22, 12, 8, 22.5), circle(50, 50, 5)],
    rose: [
        petalRing(50, 50, 6, 30, 5, 30),
        petalRing(50, 50, 4, 18, 5, 26, 36),
        circle(50, 50, 5),
        'M50 80 Q46 88 40 96 L44 96 Q50 90 52 80 Z M44 88 C34 84 28 86 24 92 C32 94 38 92 44 88 Z',
    ],
    phulkari: [
        'M50 4 L96 50 L50 96 L4 50 Z M50 18 L82 50 L50 82 L18 50 Z',
        'M50 30 L70 50 L50 70 L30 50 Z',
        'M50 42 L58 50 L50 58 L42 50 Z',
    ],
    pomegranate: [
        'M50 26 C72 26 84 44 82 62 C80 80 66 92 50 92 C34 92 20 80 18 62 C16 44 28 26 50 26 Z',
        'M40 26 L44 12 L50 22 L56 12 L60 26 Z',
        'M30 54 Q50 40 70 54 Q50 66 30 54 Z',
    ],
    marigold: [
        petalRing(50, 50, 10, 44, 16, 9),
        petalRing(50, 50, 6, 30, 12, 12, 15),
        circle(50, 50, 8),
    ],
    arabesque: [
        'M50 6 C70 22 70 42 50 50 C30 42 30 22 50 6 Z M50 94 C30 78 30 58 50 50 C70 58 70 78 50 94 Z',
        'M6 50 C22 30 42 30 50 50 C42 70 22 70 6 50 Z M94 50 C78 70 58 70 50 50 C58 30 78 30 94 50 Z',
        circle(50, 50, 6),
    ],
    olive: [
        'M50 96 C48 70 50 40 56 6 L58 6 C52 40 50 70 52 96 Z',
        ...[14, 30, 46, 62].map((y, i) => {
            const side = i % 2 ? -1 : 1;
            const x = 54 - (y / 96) * 4;
            return `M${x} ${y + 6} C${x + side * 18} ${y - 4} ${x + side * 26} ${y + 6} ${x + side * 24} ${y + 12} C${x + side * 14} ${y + 16} ${x + side * 4} ${y + 12} ${x} ${y + 6} Z`;
        }),
    ],
    // Occasion motifs: remembrance (diya, leaf), new beginnings (moon, kalash), milestones, corporate.
    diya: [
        // Flame with a hollow core, the bowl, and its small stand.
        'M50 6 C63 24 65 40 50 54 C35 40 37 24 50 6 Z M50 26 C55 34 55 42 50 47 C45 42 45 34 50 26 Z',
        'M8 58 L92 58 Q86 84 50 88 Q14 84 8 58 Z M20 64 L80 64 Q74 78 50 81 Q26 78 20 64 Z',
        'M40 88 L60 88 L66 96 L34 96 Z',
    ],
    moon: [
        'M62 8 A42 42 0 1 0 62 92 A34 34 0 1 1 62 8 Z',
        star(78, 28, 10, 4, 5),
        star(86, 62, 6, 2.5, 5, 18),
        circle(70, 84, 2.4),
    ],
    leaf: [
        // Peepal leaf with its long drip tip; the midrib is cut out so it reads as a vein.
        'M50 96 C46 86 40 82 30 74 C14 62 10 42 22 26 C32 14 44 10 50 4 C56 10 68 14 78 26 C90 42 86 62 70 74 C60 82 54 86 50 96 Z M49 18 L51 18 L51 88 L49 88 Z',
        'M50 40 L30 30 L31 28 L50 37 Z M50 40 L70 30 L69 28 L50 37 Z M50 58 L26 48 L27 46 L50 55 Z M50 58 L74 48 L73 46 L50 55 Z',
    ],
    kalash: [
        circle(50, 26, 10),
        'M50 36 C40 28 26 30 16 40 C28 44 40 44 50 36 Z M50 36 C60 28 74 30 84 40 C72 44 60 44 50 36 Z',
        'M34 42 L66 42 L70 50 L30 50 Z',
        'M30 50 C16 60 18 86 40 94 L60 94 C82 86 84 60 70 50 Z M36 66 L64 66 L64 70 L36 70 Z',
    ],
    confetti: [
        star(24, 22, 9, 3.5, 4, 10),
        star(74, 18, 7, 2.6, 4, 30),
        star(58, 56, 11, 4, 4),
        star(20, 74, 6, 2.4, 4, 20),
        star(84, 80, 8, 3, 4, 40),
        circle(44, 34, 3),
        circle(86, 44, 2.6),
        circle(38, 88, 2.8),
        'M8 46 L18 40 L20 44 L10 50 Z M62 84 L72 92 L69 95 L59 87 Z',
    ],
    spark: [star(50, 50, 46, 7, 4), star(50, 50, 22, 5, 4, 45), circle(50, 50, 4)],
};

export const cultureMotifs: Record<CultureId, MotifId[]> = {
    hindu: ['paisley', 'marigold', 'lotus'],
    islamic: ['girih', 'arabesque'],
    jain: ['lotus', 'marigold'],
    sikh: ['phulkari', 'marigold'],
    christian: ['rose', 'olive'],
    jewish: ['pomegranate', 'olive'],
    universal: ['rose', 'paisley'],
};
