// Node reads the same WASM and fonts from disk (paths are relative to the project root).
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import type { OgAssets } from './assets';

const fontDir = () => join(process.cwd(), 'server/og/fonts');

export async function loadOgAssets(): Promise<OgAssets> {
    const require = createRequire(import.meta.url);
    const dir = fontDir();
    const files = (await readdir(dir)).filter((f) => f.endsWith('.bin')).sort();
    const [wasm, ...fonts] = await Promise.all([
        readFile(require.resolve('@resvg/resvg-wasm/index_bg.wasm')),
        ...files.map((f) => readFile(join(dir, f))),
    ]);
    return {
        wasm: new Uint8Array(wasm),
        fonts: fonts.map((f) => new Uint8Array(f)),
    };
}
