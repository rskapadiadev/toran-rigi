// Materials shared by every luxury piece: paper and velvet grain, gold foil, lacquer, the showroom
// spotlight and stationery liners. Pure CSS values built from the invitation's own palette.
import { mixHex } from '@shared/materials';
import type { CSSProperties } from 'react';

const noise = (frequency: number, alpha: number) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${String(frequency)}' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${String(alpha)} 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// Velvet and lacquer grain; a far finer one for paper and card.
export const grain = noise(0.85, 0.5);
export const paperGrain = noise(1.4, 0.09);
// Cotton paper: soft, visible fibres.
export const cottonGrain = noise(1.1, 0.16);

// One absolutely placed face of a 3D object.
export const plane = (style: CSSProperties): CSSProperties => ({
    position: 'absolute',
    backfaceVisibility: 'hidden',
    ...style,
});

// Gold foil: deep shadow, a bright band where the light catches, warm mid-tones.
export const foil = (gold: string) =>
    `linear-gradient(115deg, ${mixHex(gold, '#000000', 0.45)} 0%, ${gold} 28%, ${mixHex(gold, '#ffffff', 0.7)} 48%, ${gold} 62%, ${mixHex(gold, '#000000', 0.4)} 100%)`;

// Text printed in gold foil.
export const foilInk = (gold: string): CSSProperties => ({
    backgroundImage: foil(gold),
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
});

// A dark showroom table under one warm spotlight, tinted by the invitation's main colour.
export const showroom = (primary: string, gold: string) => {
    const table = mixHex(primary, '#0b0706', 0.86);
    return `radial-gradient(ellipse 62% 46% at 50% 58%, ${mixHex(gold, table, 0.82)} 0%, ${table} 62%, #050303 100%)`;
};

// An envelope liner: a fine gold trellis with a dot at every crossing, on the liner colour.
export function linerPattern(gold: string): string {
    const g = encodeURIComponent(gold);
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M14 0 L28 14 L14 28 L0 14 Z' fill='none' stroke='${g}' stroke-opacity='0.55' stroke-width='0.7'/%3E%3Ccircle cx='14' cy='14' r='1.6' fill='${g}' fill-opacity='0.7'/%3E%3Ccircle cx='0' cy='0' r='1.1' fill='${g}' fill-opacity='0.5'/%3E%3Ccircle cx='28' cy='28' r='1.1' fill='${g}' fill-opacity='0.5'/%3E%3C/svg%3E")`;
}

// A deckled (hand-torn) paper edge as a CSS mask: the rectangle's four sides wander by a hair, the
// way handmade cotton paper does. Seeded, so a card keeps its edge between renders.
export function deckleMask(seed: number): string {
    let s = seed % 2147483647 || 1;
    const rand = () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
    const W = 1000;
    const H = 1400;
    const j = () => (rand() * 7).toFixed(1);
    const side = (n: number, at: (i: number) => string) =>
        Array.from({ length: n + 1 }, (_, i) => at(i)).join(' ');
    const top = side(60, (i) => `L${String((W / 60) * i)} ${j()}`);
    const right = side(80, (i) => `L${String(W - Number(j()))} ${String((H / 80) * i)}`);
    const bottom = side(60, (i) => `L${String(W - (W / 60) * i)} ${String(H - Number(j()))}`);
    const left = side(80, (i) => `L${j()} ${String(H - (H / 80) * i)}`);
    const d = `M0 0 ${top} ${right} ${bottom} ${left} Z`;
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${String(W)} ${String(H)}' preserveAspectRatio='none'><path d='${d}'/></svg>`)}")`;
}

// Mask properties for a deckled card; spread into a style object.
export const deckled = (seed: number) => {
    const mask = deckleMask(seed);
    return {
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
    };
};
