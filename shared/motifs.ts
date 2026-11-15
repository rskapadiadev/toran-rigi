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

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
    `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;

// A straight stroke drawn as a thin filled quad, so it survives the evenodd fill like any shape.
function bar(x1: number, y1: number, x2: number, y2: number, width: number) {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = (-(y2 - y1) / len) * (width / 2);
    const ny = ((x2 - x1) / len) * (width / 2);
    const p = (x: number, y: number) => `${round(x)} ${round(y)}`;
    return `M${p(x1 + nx, y1 + ny)} L${p(x2 + nx, y2 + ny)} L${p(x2 - nx, y2 - ny)} L${p(x1 - nx, y1 - ny)} Z`;
}

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
        // The inner arc's radius must exceed half the 84-unit chord, or it is enlarged to match the
        // outer one and the crescent has no area.
        'M62 8 A42 42 0 1 0 62 92 A52 52 0 0 1 62 8 Z',
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
    // ── Added: festive, faith and milestone motifs ──
    peacock: [
        // Mor pankh: an outer eye ring, the inner eye with its pupil cut out, the quill and its barbs.
        'M50 6 C68 18 75 40 71 57 C67 71 59 78 50 78 C41 78 33 71 29 57 C25 40 32 18 50 6 Z M50 20 C62 30 65 45 62 56 C59 65 55 69 50 69 C45 69 41 65 38 56 C35 45 38 30 50 20 Z',
        'M50 33 C58 40 59 50 56 57 C54 61 52 62 50 62 C48 62 46 61 44 57 C41 50 42 40 50 33 Z' +
            circle(50, 53, 4),
        bar(50, 78, 50, 98, 2.2),
        [80, 85, 90, 95]
            .map((y) => `${bar(50, y, 38, y - 7, 1.4)} ${bar(50, y, 62, y - 7, 1.4)}`)
            .join(' '),
    ],
    elephant: [
        // Haathi with a raised-curl trunk; the saddle cloth and ear are cut out, then refilled smaller.
        'M14 50 C14 36 26 28 42 28 C54 28 62 31 67 36 C71 30 81 30 85 38 C88 45 87 54 84 60 C86 68 88 76 94 80 C96 81 96 84 93 84 C85 82 80 74 78 66 L76 66 L76 88 L66 88 L66 70 L34 70 L34 88 L24 88 L24 68 C17 64 14 58 14 50 Z M30 32 L54 31 L54 54 Q48 58 42 54 Q36 58 30 54 Z M60 40 C66 38 72 42 72 50 C72 57 66 61 62 59 C58 55 57 45 60 40 Z' +
            circle(79, 43, 1.6),
        'M33 35 L51 34 L51 51 Q47 54 42 51 Q37 54 33 51 Z',
        'M62 43 C66 42 69 45 69 50 C69 54 66 56 63 55 C61 52 60 46 62 43 Z',
        'M14 48 C10 52 8 58 9 64 L11 64 C11 58 12 54 15 51 Z',
    ],
    bell: [
        // Ghanti: hanging loop, neck, body with a cut band, lip and clapper.
        circle(50, 10, 5.5) + circle(50, 10, 2.8),
        'M46 15 L54 15 L54 22 L46 22 Z',
        'M50 22 C36 22 30 34 30 50 C30 62 26 70 20 76 L80 76 C74 70 70 62 70 50 C70 34 64 22 50 22 Z M31 63 L69 63 L69 67 L31 67 Z',
        'M14 76 L86 76 L86 81 L14 81 Z',
        circle(50, 88, 6),
    ],
    kite: [
        // Patang with its spine and cross-spar cut out, and a little tail.
        'M50 4 L84 42 L50 88 L16 42 Z M49 9 L51 9 L51 84 L49 84 Z M21 41 L79 41 L79 43.4 L21 43.4 Z',
        'M43 98 L57 98 L50 89 Z',
    ],
    tulip: [
        'M50 70 C34 66 26 52 28 30 L38 40 L44 22 L50 36 L56 22 L62 40 L72 30 C74 52 66 66 50 70 Z',
        'M48.5 69 L51.5 69 L51.5 96 L48.5 96 Z',
        'M50 92 C40 90 30 80 28 64 C38 68 46 78 50 92 Z M50 92 C60 90 70 80 72 64 C62 68 54 78 50 92 Z',
    ],
    hexagram: [
        // Magen David: two triangles in one path, so their overlap opens a hexagon at the centre.
        'M50 6 L89 73 L11 73 Z M50 94 L11 27 L89 27 Z',
        circle(50, 50, 6),
    ],
    hamsa: [
        // Symmetric hand with both thumbs out; the eye in the palm is cut, its pupil refilled.
        'M30 90 C24 82 22 72 24 62 L17 49 C15 43 21 39 25 44 L33 55 L33 26 C33 20 41 20 41 26 L43 48 L46 16 C46 10 54 10 54 16 L57 48 L59 26 C59 20 67 20 67 26 L67 55 L75 44 C79 39 85 43 83 49 L76 62 C78 72 76 82 70 90 Z M36 70 Q50 60 64 70 Q50 80 36 70 Z',
        circle(50, 70, 3.4),
    ],
    dove: [
        // Flying dove with raised wings, carrying an olive sprig.
        'M10 70 L22 62 C30 52 44 49 56 50 L66 44 C70 40 76 40 80 44 L88 46 L80 49 C80 56 74 64 62 66 C50 70 36 70 24 66 Z' +
            circle(74, 45, 1.4),
        'M40 51 C35 35 39 20 50 11 C52 25 56 38 58 50 Z',
        'M50 51 C52 37 59 27 72 22 C68 34 65 44 61 52 Z',
        `${bar(88, 47, 95, 60, 1.4)} ${ellipse(93, 51, 2.4, 4.4)} ${ellipse(96, 57, 2.4, 4.4)}`,
    ],
    heart: [
        'M50 88 C22 68 8 52 10 33 C12 19 24 11 36 13 C43 14 48 19 50 25 C52 19 57 14 64 13 C76 11 88 19 90 33 C92 52 78 68 50 88 Z M50 76 C30 62 20 50 21 36 C22 27 29 22 36 23 C42 24 47 29 50 36 C53 29 58 24 64 23 C71 22 78 27 79 36 C80 50 70 62 50 76 Z',
        'M50 64 C40 57 34 50 35 42 C36 37 40 34 44 35 C47 36 49 38 50 41 C51 38 53 36 56 35 C60 34 64 37 65 42 C66 50 60 57 50 64 Z',
    ],
    rings: [
        // Two wedding bands in one path: where they cross, the evenodd fill weaves them together.
        circle(38, 58, 25) + circle(38, 58, 19) + circle(62, 58, 25) + circle(62, 58, 19),
        'M62 18 L69 26 L62 33 L55 26 Z',
    ],
    butterfly: [
        // Four wings, each with a spot cut out; body and antennae between them.
        'M50 50 C40 30 22 18 12 24 C4 30 10 46 24 50 C30 52 40 52 50 50 Z' + circle(25, 35, 5),
        'M50 50 C60 30 78 18 88 24 C96 30 90 46 76 50 C70 52 60 52 50 50 Z' + circle(75, 35, 5),
        'M50 53 C40 56 26 60 22 72 C20 82 32 86 40 78 C46 72 48 62 50 53 Z' + circle(33, 72, 3.5),
        'M50 53 C60 56 74 60 78 72 C80 82 68 86 60 78 C54 72 52 62 50 53 Z' + circle(67, 72, 3.5),
        'M48 36 C48 32 52 32 52 36 L52 74 C52 78 48 78 48 74 Z',
        `${bar(49, 34, 40, 16, 1.4)} ${bar(51, 34, 60, 16, 1.4)} ${circle(40, 16, 2)} ${circle(60, 16, 2)}`,
    ],
    balloons: [
        // Three balloons, each with a cut highlight and a knot; strings gather at one point.
        ellipse(32, 32, 16, 20) + ellipse(26, 24, 3, 5),
        ellipse(66, 28, 15, 19) + ellipse(60, 20, 3, 5),
        ellipse(50, 48, 14, 18) + ellipse(45, 41, 2.6, 4.4),
        'M30 52 L34 52 L32 56 Z M64 47 L68 47 L66 51 Z M48 66 L52 66 L50 70 Z',
        `${bar(32, 56, 50, 96, 1.1)} ${bar(66, 51, 50, 96, 1.1)} ${bar(50, 70, 50, 96, 1.1)}`,
    ],
};

// Display names, where the id alone would read oddly.
const motifNames: Partial<Record<MotifId, string>> = {
    peacock: 'Peacock feather',
    bell: 'Temple bell',
    hexagram: 'Star of David',
    dove: 'Dove & olive',
    rings: 'Wedding rings',
};

export const motifLabel = (id: MotifId) =>
    motifNames[id] ?? id.charAt(0).toUpperCase() + id.slice(1);

export const cultureMotifs: Record<CultureId, MotifId[]> = {
    hindu: ['paisley', 'marigold', 'lotus'],
    islamic: ['girih', 'arabesque'],
    jain: ['lotus', 'marigold'],
    sikh: ['phulkari', 'marigold'],
    christian: ['rose', 'olive'],
    jewish: ['pomegranate', 'olive'],
    universal: ['rose', 'paisley'],
};
