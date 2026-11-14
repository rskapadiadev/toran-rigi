// The link-preview card (1200×630): the family's doorway arch under a hanging toran, their seeded
// medallion in the dome and on both wings, names set inside. Pure SVG string — server/og/render.ts rasterises it.
import { archPath } from '@shared/arches';
import { generateOrnament, type StrokeRole } from '@shared/generative';
import type { CardFacts } from '@shared/share';

export const CARD_W = 1200;
export const CARD_H = 630;

export interface TextStyle {
    family: string;
    size: number;
    letterSpacing?: number;
    italic?: boolean;
}

// Returns the rendered width of `text` in px; the renderer measures with real fonts.
export type Measure = (text: string, style: TextStyle) => number;

const SCRIPT_FALLBACK = "'Noto Serif Gujarati', 'Noto Serif Devanagari'";
// The static Cormorant cut registers its family as "Cormorant Garamond Light" (name table ID 16).
export const SERIF_FAMILY = 'Cormorant Garamond Light';
const SERIF = `'${SERIF_FAMILY}', ${SCRIPT_FALLBACK}`;
const SCRIPT = `'Pinyon Script', ${SERIF}`;
const CAPS = `Cinzel, ${SERIF}`;

const displayFamily = (key: string) =>
    ({
        cinzel: CAPS,
        marcellus: `Marcellus, ${SERIF}`,
        pinyon: SCRIPT,
    })[key] ?? SERIF;

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const color = (value: string, fallback: string) => (HEX.test(value) ? value : fallback);

const esc = (s: string) =>
    s.replace(
        /[&<>"']/g,
        (c) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[c] ?? c,
    );

const r2 = (n: number) => Math.round(n * 100) / 100;

function luminance(hex: string) {
    const full = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, (c) => c + c) : hex;
    const n = Number.parseInt(full.slice(1), 16);
    const lin = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

// Re-maps an absolute-command path from the arches' 300×470 box into any rectangle. Axis-aligned
// arcs stay exact under non-uniform scale, so the doorway can be wider than it is tall.
export function fitPath(d: string, x: number, y: number, sx: number, sy: number): string {
    const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
    const out: string[] = [];
    let cmd = '';
    let i = 0;
    const num = () => Number(tokens[i++]);
    const px = (v: number) => r2(x + v * sx);
    const py = (v: number) => r2(y + v * sy);
    while (i < tokens.length) {
        const token = tokens[i] ?? '';
        if (/[A-Za-z]/.test(token)) {
            cmd = token;
            i++;
            out.push(cmd);
            if (cmd === 'Z' || cmd === 'z') continue;
        }
        switch (cmd) {
            case 'H':
                out.push(String(px(num())));
                break;
            case 'V':
                out.push(String(py(num())));
                break;
            case 'A': {
                const rx = num();
                const ry = num();
                const rot = num();
                const large = num();
                const sweep = num();
                out.push(
                    `${r2(rx * sx)} ${r2(ry * sy)} ${rot} ${large} ${sweep} ${px(num())} ${py(num())}`,
                );
                break;
            }
            default: {
                // M L T C S Q: coordinate pairs.
                out.push(`${px(num())} ${py(num())}`);
            }
        }
    }
    return out.join(' ');
}

interface Line {
    h: number;
    svg: (top: number) => string;
}

interface LineOptions {
    lineHeight?: number;
    ascent?: number;
    opacity?: number;
}

// Indic lines lead with their Noto face: resvg stops falling back once some Latin faces claim a run.
export function scriptFamily(text: string, family: string): string {
    if (/[\u0A80-\u0AFF]/.test(text)) return `'Noto Serif Gujarati', ${family}`;
    // Letters only: the \u0965 dandas framing a romanised greeting stay in the Latin face.
    if (/[\u0900-\u0963\u0966-\u097F]/.test(text)) return `'Noto Serif Devanagari', ${family}`;
    return family;
}

function textLine(text: string, rawStyle: TextStyle, fill: string, opts: LineOptions = {}): Line {
    const { lineHeight = 1.15, ascent = 0.8, opacity = 1 } = opts;
    const style = {
        ...rawStyle,
        family: scriptFamily(text, rawStyle.family),
    };
    return {
        h: style.size * lineHeight,
        svg: (top) =>
            `<text x="600" y="${r2(top + style.size * ascent)}" text-anchor="middle" font-family="${esc(style.family)}" font-size="${r2(style.size)}"${style.letterSpacing ? ` letter-spacing="${style.letterSpacing}"` : ''}${style.italic ? ' font-style="italic"' : ''} fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ''}>${esc(text)}</text>`,
    };
}

const gap = (h: number): Line => ({
    h,
    svg: () => '',
});

// Splits at the space that best balances two lines; ['whole', ''] when there is no space.
export function balance(text: string): [string, string] {
    const words = text.trim().split(/\s+/);
    if (words.length < 2) return [text, ''];
    let best = 1;
    let bestDiff = Infinity;
    for (let k = 1; k < words.length; k++) {
        const diff = Math.abs(words.slice(0, k).join(' ').length - words.slice(k).join(' ').length);
        if (diff < bestDiff) {
            best = k;
            bestDiff = diff;
        }
    }
    return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

// Largest size (≤ max) at which `text` fits in `width`.
function fitSize(
    measure: Measure,
    text: string,
    style: Omit<TextStyle, 'size'>,
    width: number,
    max: number,
) {
    const atMax = measure(text, {
        ...style,
        family: scriptFamily(text, style.family),
        size: max,
    });
    return atMax <= width ? max : Math.floor((max * width) / atMax);
}

function ornamentGroup(
    facts: CardFacts,
    colors: Record<StrokeRole, string>,
    cx: number,
    cy: number,
    size: number,
    opacity: number,
) {
    const ornament = generateOrnament(facts.ornament, facts.seed);
    const scale = size / ornament.size;
    const paths = ornament.paths
        .map((p) =>
            p.fill
                ? `<path d="${p.d}" fill="${colors[p.role]}"/>`
                : `<path d="${p.d}" fill="none" stroke="${colors[p.role]}" stroke-width="${p.width}" stroke-linecap="round" stroke-linejoin="round"/>`,
        )
        .join('');
    return `<g opacity="${opacity}" transform="translate(${r2(cx - size / 2)} ${r2(cy - size / 2)}) scale(${r2(scale)})">${paths}</g>`;
}

// A toran: a gold cord in shallow swags with mango leaves hanging at each knot and a marigold in each swag.
function toran(colors: Record<StrokeRole, string>, leafy: boolean) {
    const period = 75;
    const count = Math.ceil(CARD_W / period);
    let cord = 'M0 8';
    const hangs: string[] = [];
    for (let k = 0; k < count; k++) {
        const x = k * period;
        cord += ` Q${x + period / 2} 34 ${x + period} 8`;
        const leaf = k % 2 ? colors.accent : colors.primary;
        hangs.push(
            leafy
                ? `<path d="M${x} 10 C${x - 10} 22 ${x - 7} 38 ${x} 50 C${x + 7} 38 ${x + 10} 22 ${x} 10 Z" fill="${leaf}"/><path d="M${x} 12 V46" stroke="${colors.gold}" stroke-width="0.8" opacity="0.7"/>`
                : `<path d="M${x} 10 V28" stroke="${colors.gold}" stroke-width="1"/><circle cx="${x}" cy="32" r="3.4" fill="${leaf}"/>`,
            `<circle cx="${x}" cy="9" r="3" fill="${colors.gold}"/>`,
            `<circle cx="${x + period / 2}" cy="21.5" r="5.5" fill="${colors.gold}"/><circle cx="${x + period / 2}" cy="21.5" r="2.4" fill="${colors.accent}" opacity="0.85"/>`,
        );
    }
    return `<g>${hangs.join('')}<path d="${cord}" fill="none" stroke="${colors.gold}" stroke-width="1.6"/></g>`;
}

function divider(gold: string): Line {
    return {
        h: 18,
        svg: (top) => {
            const y = top + 9;
            return `<g stroke="${gold}" fill="none" stroke-width="1"><path d="M${600 - 92} ${y} H${600 - 14} M${600 + 14} ${y} H${600 + 92}"/><path d="M600 ${y - 6} L606 ${y} L600 ${y + 6} L594 ${y} Z" fill="${gold}"/><circle cx="${600 - 100}" cy="${y}" r="1.8" fill="${gold}"/><circle cx="${600 + 100}" cy="${y}" r="1.8" fill="${gold}"/></g>`;
        },
    };
}

// "Omar & Layla" on one line: each name in its own script's face, the joiner in gold italic.
function coupleLine(
    measure: Measure,
    facts: CardFacts,
    family: string,
    ink: string,
    gold: string,
    width: number,
    max: number,
) {
    const probe = 100;
    const jScale = 0.8;
    const w1 = measure(facts.one, {
        family: scriptFamily(facts.one, family),
        size: probe,
    });
    const w2 = measure(facts.two, {
        family: scriptFamily(facts.two, family),
        size: probe,
    });
    const wj = measure(facts.joiner, {
        family: SERIF,
        size: probe * jScale,
        italic: true,
    });
    const space = probe * 0.24;
    const total = w1 + w2 + wj + space * 2;
    const size = Math.min(max, Math.floor((probe * width) / total));
    // Three positioned <text> runs: resvg drops Indic glyphs inside mixed-font <tspan>s.
    const k = size / probe;
    const left = CARD_W / 2 - (total * k) / 2;
    const run = (text: string, x: number, fam: string, extra: string) =>
        `<text x="${r2(x)}" font-family="${esc(scriptFamily(text, fam))}" ${extra}>${esc(text)}</text>`;
    const line: Line = {
        h: size * 1.05,
        svg: (top) => {
            const y = `y="${r2(top + size * 0.8)}"`;
            return [
                run(facts.one, left, family, `${y} font-size="${size}" fill="${ink}"`),
                run(
                    facts.joiner,
                    left + (w1 + space) * k,
                    SERIF,
                    `${y} font-size="${r2(size * jScale)}" font-style="italic" fill="${gold}"`,
                ),
                run(
                    facts.two,
                    left + (w1 + space * 2 + wj) * k,
                    family,
                    `${y} font-size="${size}" fill="${ink}"`,
                ),
            ].join('');
        },
    };
    return {
        size,
        line,
    };
}

// Top of each doorway in the 300×470 arch box, so the dome medallion never crosses the outline.
const apex: Record<CardFacts['culture'], number> = {
    hindu: 45,
    jain: 45,
    islamic: 30,
    christian: 20,
    sikh: 40,
    jewish: 70,
    universal: 50,
};

// Where each doorway's straight sides begin (in the 300×470 arch box): text sits below, the dome above.
const springLine: Record<CardFacts['culture'], number> = {
    hindu: 200,
    jain: 200,
    islamic: 220,
    christian: 210,
    sikh: 230,
    jewish: 70,
    universal: 180,
};

export function buildCardSvg(facts: CardFacts, measure: Measure): string {
    const p = facts.palette;
    const bg = color(p.bg, '#fbf3e4');
    const surface = color(p.surface, bg);
    const ink = color(p.ink, '#2b0f0c');
    const muted = color(p.muted, ink);
    const gold = color(p.gold, '#c18f2f');
    const colors: Record<StrokeRole, string> = {
        gold,
        primary: color(p.primary, gold),
        accent: color(p.accent, gold),
        ink,
    };
    const dark = luminance(bg) < 0.18;

    // Doorway: 540 wide, apex at y=62, running off the bottom edge like a real door standing on the floor.
    const archW = 540;
    const archTop = 62;
    const sx = archW / 300;
    const sy = (CARD_H + 40 - archTop) / 462;
    const ax = (CARD_W - archW) / 2;
    const ay = archTop - 8 * sy;
    const raw = archPath(facts.culture);
    const outer = fitPath(raw, ax, ay, sx, sy);
    const inset = 16;
    const inner = fitPath(raw, ax + inset, ay + inset * 1.2, (archW - inset * 2) / 300, sy * 0.985);
    const spring = ay + springLine[facts.culture] * sy;

    // ── Text stack, centred in the doorway below the dome ──
    const maxW = archW - 110;
    const display = displayFamily(facts.displayFont);
    const lines: Line[] = [];

    if (facts.greeting) {
        const size = fitSize(measure, facts.greeting, { family: SERIF }, maxW - 40, 24);
        const [a, b] = size < 18 ? balance(facts.greeting) : [facts.greeting, ''];
        if (b) {
            const wrapped = Math.min(
                fitSize(measure, a, { family: SERIF }, maxW - 40, 21),
                fitSize(measure, b, { family: SERIF }, maxW - 40, 21),
            );
            lines.push(
                textLine(
                    a,
                    {
                        family: SERIF,
                        size: wrapped,
                    },
                    gold,
                    { lineHeight: 1.1 },
                ),
                textLine(
                    b,
                    {
                        family: SERIF,
                        size: wrapped,
                    },
                    gold,
                    { lineHeight: 1.1 },
                ),
                gap(10),
            );
        } else {
            lines.push(
                textLine(
                    facts.greeting,
                    {
                        family: SERIF,
                        size,
                    },
                    gold,
                ),
                gap(10),
            );
        }
    }
    if (facts.guest) {
        const text = `Dear ${facts.guest},`;
        const size = fitSize(measure, text, { family: SCRIPT }, maxW, 38);
        lines.push(
            textLine(
                text,
                {
                    family: SCRIPT,
                    size,
                },
                gold,
                {
                    lineHeight: 1.2,
                    ascent: 0.85,
                },
            ),
            gap(4),
        );
    }
    const caps = {
        family: CAPS,
        letterSpacing: 4,
    };
    lines.push(
        textLine(
            facts.label.toUpperCase(),
            {
                ...caps,
                size: fitSize(measure, facts.label.toUpperCase(), caps, maxW, 16),
            },
            muted,
        ),
        gap(12),
    );
    if (facts.honorific) {
        lines.push(
            textLine(
                facts.honorific,
                {
                    family: SERIF,
                    size: 26,
                    italic: true,
                },
                muted,
            ),
            gap(2),
        );
    }

    const nameStyle = { family: display };
    const maxName = facts.guest ? 82 : 92;
    if (facts.two) {
        const single = coupleLine(measure, facts, display, ink, gold, maxW, maxName - 6);
        if (single.size >= 66) {
            lines.push(single.line);
        } else {
            const size = Math.min(
                fitSize(measure, facts.one, nameStyle, maxW, maxName),
                fitSize(measure, facts.two, nameStyle, maxW, maxName),
            );
            lines.push(
                textLine(
                    facts.one,
                    {
                        ...nameStyle,
                        size,
                    },
                    ink,
                    { lineHeight: 0.98 },
                ),
                textLine(
                    facts.joiner,
                    {
                        family: SERIF,
                        size: size * 0.66,
                        italic: true,
                    },
                    gold,
                    {
                        lineHeight: 0.9,
                        ascent: 0.8,
                    },
                ),
                textLine(
                    facts.two,
                    {
                        ...nameStyle,
                        size,
                    },
                    ink,
                    { lineHeight: 1.02 },
                ),
            );
        }
    } else {
        const size = fitSize(measure, facts.one, nameStyle, maxW, maxName + 8);
        const [a, b] = balance(facts.one);
        if (size < 52 && b) {
            const s2 = Math.min(
                fitSize(measure, a, nameStyle, maxW, maxName),
                fitSize(measure, b, nameStyle, maxW, maxName),
            );
            lines.push(
                textLine(
                    a,
                    {
                        ...nameStyle,
                        size: s2,
                    },
                    ink,
                    { lineHeight: 1 },
                ),
                textLine(
                    b,
                    {
                        ...nameStyle,
                        size: s2,
                    },
                    ink,
                    { lineHeight: 1.05 },
                ),
            );
        } else {
            lines.push(
                textLine(
                    facts.one,
                    {
                        ...nameStyle,
                        size,
                    },
                    ink,
                    { lineHeight: 1.05 },
                ),
            );
        }
    }
    if (facts.lifeSpan)
        lines.push(
            gap(2),
            textLine(
                facts.lifeSpan,
                {
                    ...caps,
                    size: 17,
                },
                muted,
            ),
        );

    lines.push(gap(18), divider(gold), gap(16));
    if (facts.date) {
        const text = facts.date.toUpperCase();
        const style = {
            family: CAPS,
            letterSpacing: 2.5,
        };
        lines.push(
            textLine(
                text,
                {
                    ...style,
                    size: fitSize(measure, text, style, maxW, 19),
                },
                ink,
            ),
        );
    }
    if (facts.place) {
        const style = {
            family: SERIF,
            italic: true,
        };
        lines.push(
            gap(4),
            textLine(
                facts.place,
                {
                    ...style,
                    size: fitSize(measure, facts.place, style, maxW, 27),
                },
                muted,
            ),
        );
    }

    const zoneTop = Math.max(spring - 34, 150);
    const zoneBottom = CARD_H - 34;
    const total = lines.reduce((sum, l) => sum + l.h, 0);
    let y = zoneTop + Math.max(0, (zoneBottom - zoneTop - total) / 2);
    // If the stack is taller than the zone, let it rise into the dome rather than clip at the bottom.
    if (total > zoneBottom - zoneTop) y = zoneBottom - total;
    const textTop = y;
    const body = lines
        .map((l) => {
            const svg = l.svg(y);
            y += l.h;
            return svg;
        })
        .join('');

    // Medallion crowns the dome when there is room above the text.
    const domeTop = ay + apex[facts.culture] * sy + 22;
    const domeRoom = textTop - domeTop;
    const medallionSize = Math.min(domeRoom - 10, 112);
    const medallion =
        medallionSize > 56
            ? ornamentGroup(
                  facts,
                  colors,
                  600,
                  domeTop + domeRoom / 2 + 4,
                  medallionSize,
                  facts.solemn ? 0.6 : 0.9,
              )
            : '';

    const wingOpacity = facts.solemn ? 0.22 : dark ? 0.5 : 0.42;
    const vignette = dark ? '#000000' : ink;
    const vignetteOpacity = dark ? 0.45 : 0.1;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
<defs>
<radialGradient id="glow" cx="600" cy="360" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${gold}" stop-opacity="${dark ? 0.2 : 0.16}"/><stop offset="1" stop-color="${gold}" stop-opacity="0"/></radialGradient>
<radialGradient id="vignette" cx="600" cy="315" r="760" gradientUnits="userSpaceOnUse"><stop offset="0.55" stop-color="${vignette}" stop-opacity="0"/><stop offset="1" stop-color="${vignette}" stop-opacity="${vignetteOpacity}"/></radialGradient>
<linearGradient id="door" x1="0" y1="${archTop}" x2="0" y2="${CARD_H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${surface}"/><stop offset="1" stop-color="${surface}" stop-opacity="0.92"/></linearGradient>
<clipPath id="card"><rect width="${CARD_W}" height="${CARD_H}"/></clipPath>
</defs>
<g clip-path="url(#card)">
<rect width="${CARD_W}" height="${CARD_H}" fill="${bg}"/>
<rect width="${CARD_W}" height="${CARD_H}" fill="url(#glow)"/>
${ornamentGroup(facts, colors, 40, 340, 600, wingOpacity)}
${ornamentGroup(facts, colors, CARD_W - 40, 340, 600, wingOpacity)}
<rect width="${CARD_W}" height="${CARD_H}" fill="url(#vignette)"/>
<path d="${outer} Z" fill="${bg}" opacity="0.9" transform="translate(0 10)"/>
<path d="${outer} Z" fill="url(#door)"/>
<path d="${outer}" fill="none" stroke="${gold}" stroke-width="2.4"/>
<path d="${inner}" fill="none" stroke="${gold}" stroke-width="0.9" opacity="0.75"/>
${medallion}
${body}
${facts.solemn ? '' : toran(colors, facts.culture !== 'islamic' && facts.culture !== 'jewish' && facts.culture !== 'christian')}
</g>
</svg>`;
}
