// Dev helper: tile screenshots into one contact sheet. Usage: node scripts/dev/sheet.mjs out.png a.png b.png ...
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { chromium } from '@playwright/test';

const [out, ...files] = process.argv.slice(2);
const cells = files
    .map(
        (f) =>
            `<figure><img src="data:image/png;base64,${readFileSync(f).toString('base64')}"><figcaption>${basename(f)}</figcaption></figure>`,
    )
    .join('');
const browser = await chromium.launch();
const page = await browser.newPage({
    viewport: {
        width: 1600,
        height: 900,
    },
});
await page.setContent(
    `<style>body{margin:0;background:#222;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px}img{width:100%;display:block}figcaption{color:#ddd;font:12px sans-serif}figure{margin:0}</style>${cells}`,
);
await page.screenshot({
    path: out,
    fullPage: true,
});
await browser.close();
