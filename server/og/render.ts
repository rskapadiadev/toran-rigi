// Rasterises the preview card with resvg (WASM): same pixels on Workers and Node, no headless browser.
import { loadOgAssets } from '@og-assets';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import type { CardFacts } from '@shared/share';

import { buildCardSvg, type Measure, SERIF_FAMILY } from './card';

let ready: Promise<Uint8Array[]> | undefined;

// initWasm may run only once per isolate; later calls reuse the same fonts.
function boot(): Promise<Uint8Array[]> {
    ready ??= loadOgAssets()
        .then(async ({ wasm, fonts }) => {
            await initWasm(wasm);
            return fonts;
        })
        .catch((error: unknown) => {
            ready = undefined;
            throw error;
        });
    return ready;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${String(c.codePointAt(0))};`);

export async function renderCard(facts: CardFacts): Promise<Uint8Array<ArrayBuffer>> {
    const fontBuffers = await boot();
    const font = {
        fontBuffers,
        defaultFontFamily: SERIF_FAMILY,
    };

    // Layout pass: measure each candidate line with the real fonts, so long names shrink instead of clipping.
    const measure: Measure = (text, style) => {
        const probe = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="400"><text x="0" y="200" font-family="${esc(style.family)}" font-size="${String(style.size)}"${style.letterSpacing ? ` letter-spacing="${String(style.letterSpacing)}"` : ''}${style.italic ? ' font-style="italic"' : ''}>${esc(text)}</text></svg>`;
        const resvg = new Resvg(probe, { font });
        try {
            return resvg.getBBox()?.width ?? 0;
        } finally {
            resvg.free();
        }
    };

    const svg = buildCardSvg(facts, measure);
    const resvg = new Resvg(svg, {
        font,
        fitTo: { mode: 'original' },
        shapeRendering: 2,
        textRendering: 1,
    });
    try {
        const image = resvg.render();
        try {
            return new Uint8Array(image.asPng());
        } finally {
            image.free();
        }
    } finally {
        resvg.free();
    }
}
