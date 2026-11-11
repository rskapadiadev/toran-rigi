// Couple colours → harmonious, accessible invitation palette (OKLCH math, no dependencies).
import type { Palette } from './types';

interface Oklch {
    l: number;
    c: number;
    h: number;
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.replace(/./g, '$&$&') : clean;
    const n = Number.parseInt(full, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToOklch(hex: string): Oklch {
    const [r, g, b] = hexToRgb(hex).map(toLinear) as [number, number, number];
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const h = (Math.atan2(B, A) * 180) / Math.PI;
    return {
        l: L,
        c: Math.hypot(A, B),
        h: h < 0 ? h + 360 : h,
    };
}

export function oklchToHex({ l, c, h }: Oklch): string {
    // Reduce chroma until the colour fits sRGB so generated colours never clip.
    for (let chroma = c; chroma >= 0; chroma -= 0.005) {
        const rad = (h * Math.PI) / 180;
        const A = chroma * Math.cos(rad);
        const B = chroma * Math.sin(rad);
        const l1 = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
        const m1 = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
        const s1 = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
        const rgb = [
            4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1,
            -1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1,
            -0.0041960863 * l1 - 0.7034186147 * m1 + 1.707614701 * s1,
        ].map(fromLinear);
        if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) {
            return `#${rgb
                .map((v) =>
                    Math.round(clamp(v) * 255)
                        .toString(16)
                        .padStart(2, '0'),
                )
                .join('')}`;
        }
    }
    return '#000000';
}

function luminance(hex: string): number {
    const [r, g, b] = hexToRgb(hex).map(toLinear) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (hi + 0.05) / (lo + 0.05);
}

const hueDistance = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

export interface PaletteOptions {
    mode?: 'light' | 'dark';
}

// Up to three couple colours: [primary, accent?, extra?]. Missing ones are derived harmonically.
export function generatePalette(
    colors: string[],
    { mode = 'light' }: PaletteOptions = {},
): Palette {
    const [first = '#9c2f4b', second, third] = colors;
    const primary = hexToOklch(first);
    const accentSeed = second
        ? hexToOklch(second)
        : {
              l: 0.62,
              c: Math.max(0.08, primary.c * 0.8),
              h: (primary.h + 150) % 360,
          };
    // Gold is the Toran signature; nudge it away from the primary hue when they collide.
    const goldSeed = third
        ? hexToOklch(third)
        : {
              l: 0.74,
              c: 0.12,
              h: 82,
          };
    const goldHue = hueDistance(goldSeed.h, primary.h) < 20 ? (goldSeed.h + 25) % 360 : goldSeed.h;

    const dark = mode === 'dark';
    const bg = oklchToHex({
        l: dark ? 0.17 : 0.975,
        c: dark ? 0.035 : 0.012,
        h: primary.h,
    });
    const surface = oklchToHex({
        l: dark ? 0.23 : 0.945,
        c: dark ? 0.04 : 0.02,
        h: primary.h,
    });
    let ink = oklchToHex({
        l: dark ? 0.95 : 0.22,
        c: 0.03,
        h: primary.h,
    });
    const muted = oklchToHex({
        l: dark ? 0.75 : 0.45,
        c: 0.03,
        h: primary.h,
    });
    let primaryHex = oklchToHex({
        ...primary,
        l: dark ? clamp(primary.l, 0.62, 0.82) : clamp(primary.l, 0.32, 0.55),
    });
    const accent = oklchToHex({
        ...accentSeed,
        l: dark ? clamp(accentSeed.l, 0.6, 0.8) : clamp(accentSeed.l, 0.4, 0.65),
    });
    const gold = oklchToHex({
        l: dark ? 0.8 : 0.7,
        c: clamp(goldSeed.c, 0.08, 0.14),
        h: goldHue,
    });

    // Guarantee readability: body text AAA-ish, brand colour usable for large text and icons.
    if (contrastRatio(ink, bg) < 7) ink = dark ? '#ffffff' : '#141014';
    for (let step = 0; contrastRatio(primaryHex, bg) < 3 && step < 12; step++) {
        const p = hexToOklch(primaryHex);
        primaryHex = oklchToHex({
            ...p,
            l: p.l + (dark ? 0.04 : -0.04),
        });
    }

    return {
        bg,
        surface,
        ink,
        muted,
        primary: primaryHex,
        accent,
        gold,
    };
}

// Turns a palette into CSS custom properties consumed by every invitation section.
export function paletteToCssVars(palette: Palette): Record<string, string> {
    return Object.fromEntries(
        Object.entries(palette).map(([key, value]) => [`--inv-${key}`, value]),
    );
}
