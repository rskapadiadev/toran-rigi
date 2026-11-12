// Procedural materials: seamless SVG tiles with fibre noise + lit, embossed motifs.
// Rendered by the browser once as a background image — photo-real feel, a few KB, no assets to license.
import { type MotifId, motifs } from './motifs';

export type MaterialKind = 'silk' | 'jacquard' | 'paper' | 'velvet' | 'linen' | 'brocade';

export interface MaterialSpec {
    kind: MaterialKind;
    base: string;
    motif?: MotifId;
    motifColor?: string;
    tile?: number;
    motifScale?: number;
    seed?: number;
}

function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const n = Number.parseInt(clean.length === 3 ? clean.replace(/./g, '$&$&') : clean, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixHex(a: string, b: string, t: number): string {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    const mix = (x: number, y: number) =>
        Math.round(x + (y - x) * t)
            .toString(16)
            .padStart(2, '0');
    return `#${mix(r1, r2)}${mix(g1, g2)}${mix(b1, b2)}`;
}

export function isDark(hex: string): boolean {
    const [r, g, b] = hexToRgb(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 120;
}

// Half-drop repeat: two motifs per tile, the second offset by half — reads as woven, never gridded.
function motifLayer(id: MotifId, tile: number, scale: number, fill: string, filter: string) {
    const size = tile * scale;
    const paths = motifs[id].map((d) => `<path d="${d}" fill-rule="evenodd"/>`).join('');
    const place = (x: number, y: number, rot: number) =>
        `<g transform="translate(${x - size / 2} ${y - size / 2}) rotate(${rot} ${size / 2} ${size / 2}) scale(${size / 100})">${paths}</g>`;
    const half = tile / 2;
    const positions: [number, number, number][] = [
        [half / 2, half / 2, -12],
        [half / 2 + half, half / 2 + half, 12],
        // Edge copies keep the half-drop seamless when motifs cross the tile boundary.
        [half / 2 + half - tile, half / 2 + half, 12],
        [half / 2 + half, half / 2 + half - tile, 12],
        [half / 2 + half - tile, half / 2 + half - tile, 12],
    ];
    return `<g fill="${fill}" filter="url(#${filter})">${positions.map(([x, y, r]) => place(x, y, r)).join('')}</g>`;
}

const emboss = (id: string, surface: number, light: string, azimuth = 225) => `
<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="blur"/>
  <feSpecularLighting in="blur" surfaceScale="${surface}" specularConstant="0.9" specularExponent="16" lighting-color="${light}" result="spec">
    <feDistantLight azimuth="${azimuth}" elevation="48"/>
  </feSpecularLighting>
  <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn"/>
  <feOffset in="SourceAlpha" dx="1.2" dy="1.6" result="off"/>
  <feGaussianBlur in="off" stdDeviation="1.2" result="shadowBlur"/>
  <feColorMatrix in="shadowBlur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" result="shadow"/>
  <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/><feMergeNode in="specIn"/></feMerge>
</filter>`;

function fibre(
    id: string,
    freq: string,
    octaves: number,
    seed: number,
    alpha: number,
    light: boolean,
) {
    const v = light ? 1 : 0;
    return `
<filter id="${id}" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}" stitchTiles="stitch"/>
  <feColorMatrix type="matrix" values="0 0 0 0 ${v}  0 0 0 0 ${v}  0 0 0 0 ${v}  0 0 0 ${alpha} 0"/>
</filter>`;
}

export function materialSvg(spec: MaterialSpec): string {
    const tile = spec.tile ?? 150;
    const seed = spec.seed ?? 7;
    const dark = isDark(spec.base);
    const motifColor = spec.motifColor ?? mixHex(spec.base, dark ? '#ffffff' : '#000000', 0.08);
    const parts: string[] = [];
    const defs: string[] = [];

    parts.push(`<rect width="${tile}" height="${tile}" fill="${spec.base}"/>`);
    switch (spec.kind) {
        case 'silk':
            // Slubbed raw silk: long horizontal streaks, light and dark.
            defs.push(
                fibre('slubL', '0.002 0.32', 2, seed, 0.18, true),
                fibre('slubD', '0.004 0.5', 2, seed + 3, 0.1, false),
            );
            parts.push(
                `<rect width="${tile}" height="${tile}" filter="url(#slubL)"/>`,
                `<rect width="${tile}" height="${tile}" filter="url(#slubD)"/>`,
            );
            break;
        case 'jacquard':
            defs.push(
                fibre('weave', '0.9 0.9', 1, seed, 0.12, !dark),
                fibre('slub', '0.003 0.4', 2, seed + 1, 0.12, true),
            );
            parts.push(
                `<rect width="${tile}" height="${tile}" filter="url(#weave)"/>`,
                `<rect width="${tile}" height="${tile}" filter="url(#slub)"/>`,
            );
            break;
        case 'paper':
            // Handmade cotton paper: soft cloud + fibres + speckles.
            defs.push(
                fibre('cloud', '0.012', 3, seed, 0.12, false),
                fibre('fleck', '0.55', 2, seed + 9, 0.1, false),
            );
            parts.push(
                `<rect width="${tile}" height="${tile}" filter="url(#cloud)"/>`,
                `<rect width="${tile}" height="${tile}" filter="url(#fleck)"/>`,
            );
            break;
        case 'velvet':
            defs.push(
                fibre('pile', '0.7', 2, seed, 0.18, false),
                fibre('crush', '0.008', 2, seed + 2, 0.16, true),
            );
            parts.push(
                `<rect width="${tile}" height="${tile}" filter="url(#pile)"/>`,
                `<rect width="${tile}" height="${tile}" filter="url(#crush)"/>`,
            );
            break;
        case 'linen': {
            defs.push(
                fibre('thread', '0.02 0.9', 2, seed, 0.1, false),
                fibre('thread2', '0.9 0.02', 2, seed + 4, 0.08, true),
            );
            parts.push(
                `<rect width="${tile}" height="${tile}" filter="url(#thread)"/>`,
                `<rect width="${tile}" height="${tile}" filter="url(#thread2)"/>`,
            );
            break;
        }
        case 'brocade':
            defs.push(fibre('metal', '0.004 0.6', 2, seed, 0.25, true));
            parts.push(`<rect width="${tile}" height="${tile}" filter="url(#metal)"/>`);
            break;
    }

    if (spec.motif) {
        const embossed = spec.kind === 'silk' || spec.kind === 'brocade' ? 3.2 : 1.6;
        defs.push(emboss('emb', embossed, dark ? '#fff2cc' : '#fffaf0'));
        parts.push(motifLayer(spec.motif, tile, spec.motifScale ?? 0.34, motifColor, 'emb'));
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${tile} ${tile}"><defs>${defs.join('')}</defs>${parts.join('')}</svg>`;
}

export const svgDataUrl = (svg: string) =>
    `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s{2,}/g, ' '))}")`;

export const materialBackground = (spec: MaterialSpec) => svgDataUrl(materialSvg(spec));
