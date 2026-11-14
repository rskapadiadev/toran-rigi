// Workers forbid compiling WASM fetched at runtime, so the module and fonts ship inside the bundle
// (`.wasm?module` → WebAssembly.Module, `.bin` → ArrayBuffer; see @cloudflare/vite-plugin module rules).
import wasm from '@resvg/resvg-wasm/index_bg.wasm?module';

import type { OgAssets } from './assets';
import cinzel from './fonts/cinzel-latin-500-normal.bin';
import cormorantItalic from './fonts/cormorant-garamond-latin-500-italic.bin';
import cormorant from './fonts/cormorant-garamond-latin-500-normal.bin';
import cormorantExt from './fonts/cormorant-garamond-latin-ext-500-normal.bin';
import marcellus from './fonts/marcellus-latin-400-normal.bin';
import devanagari from './fonts/noto-serif-devanagari-devanagari-500-normal.bin';
import gujarati from './fonts/noto-serif-gujarati-gujarati-500-normal.bin';
import pinyon from './fonts/pinyon-script-latin-400-normal.bin';

export function loadOgAssets(): Promise<OgAssets> {
    return Promise.resolve({
        wasm,
        fonts: [
            cormorant,
            cormorantExt,
            cormorantItalic,
            pinyon,
            cinzel,
            marcellus,
            gujarati,
            devanagari,
        ].map((buffer) => new Uint8Array(buffer)),
    });
}
