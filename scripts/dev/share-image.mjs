// The shop's link-preview picture (WhatsApp, Instagram, iMessage…): public/share/toran.jpg, 1200×630.
// Usage: node scripts/dev/share-image.mjs [base-url]   (posters come from that site's collections page)
// After a redraw, bump the ?v= in src/routes/index.tsx: chat apps keep the old picture otherwise.
import fs from 'node:fs';
import path from 'node:path';

import { chromium } from '@playwright/test';
import sharp from 'sharp';

const base = process.argv[2] ?? 'https://toran.therigi.shop';
const out = 'public/share/toran.jpg';
// Left, front, right: three traditions, and no deity or sacred art on a shop advertisement.
const designs = ['rajwada', 'palace-walk', 'mashrabiya'];

const html = await (await fetch(`${base}/collections`)).text();
const dataUri = (bytes, mime) => `data:${mime};base64,${Buffer.from(bytes).toString('base64')}`;
const posters = [];
for (const name of designs) {
    const src = new RegExp(
        `/media/public/invitations/inv_demo-${name}/photos/[a-z0-9]+\\.jpg`,
    ).exec(html)?.[0];
    if (!src) throw new Error(`No poster for ${name} on ${base}/collections`);
    const bytes = await (await fetch(base + src)).arrayBuffer();
    posters.push(dataUri(bytes, 'image/jpeg'));
}
const font = (pkg, file) =>
    dataUri(
        fs.readFileSync(`node_modules/@fontsource-variable/${pkg}/files/${file}`),
        'font/woff2',
    );
const serif = font('cormorant-garamond', 'cormorant-garamond-latin-wght-normal.woff2');
const italic = font('cormorant-garamond', 'cormorant-garamond-latin-wght-italic.woff2');
const sans = font('manrope', 'manrope-latin-wght-normal.woff2');
const seal = dataUri(fs.readFileSync('public/favicon.svg'), 'image/svg+xml');

const page = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Cg;src:url(${serif});font-weight:300 700}
@font-face{font-family:Cg;src:url(${italic});font-weight:300 700;font-style:italic}
@font-face{font-family:Mr;src:url(${sans});font-weight:200 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:#120b0d;color:#fbf7f0;font-family:Mr}
.glow{position:absolute;inset:0;background:radial-gradient(circle at 12% 8%,rgba(195,154,78,.26),transparent 42%),radial-gradient(circle at 76% 52%,rgba(132,30,56,.85),transparent 52%),radial-gradient(circle at 76% 105%,rgba(232,196,119,.28),transparent 42%)}
.frame{position:absolute;inset:22px;border:1px solid rgba(195,154,78,.38);border-radius:18px}
.copy{position:absolute;left:76px;top:0;height:630px;width:560px;display:flex;flex-direction:column;justify-content:center}
.brand{display:flex;align-items:center;gap:16px;font-size:19px;letter-spacing:.3em;text-transform:uppercase;color:#e8c477;font-weight:600}
.brand img{width:52px;height:52px}
h1{font-family:Cg;font-weight:500;font-size:86px;line-height:.98;letter-spacing:-.01em;margin-top:30px}
h1 em{color:#e8c477}
p{margin-top:28px;font-size:25px;line-height:1.45;color:rgba(251,247,240,.82)}
.pill{margin-top:32px;align-self:flex-start;background:#e8c477;color:#241408;border-radius:99px;padding:14px 30px;font-size:23px;font-weight:700}
.phone{position:absolute;border-radius:34px;background:#0b0708;padding:7px;box-shadow:0 40px 70px -20px rgba(0,0,0,.9),0 0 0 1.5px rgba(232,196,119,.4)}
.phone img{display:block;width:100%;height:100%;object-fit:cover;object-position:top;border-radius:27px}
.a{left:668px;top:148px;width:204px;height:418px;transform:rotate(-9deg)}
.b{left:778px;top:74px;width:244px;height:500px;z-index:2}
.c{left:928px;top:148px;width:204px;height:418px;transform:rotate(9deg)}
</style><div class="glow"></div><div class="frame"></div>
<div class="copy"><div class="brand"><img src="${seal}">Toran by Rigi</div>
<h1>Invitations that open like a <em>doorway</em></h1>
<p>Weddings, birthdays, pujas and<br>every celebration.</p><div class="pill">Try any design free</div></div>
<div class="phone a"><img src="${posters[0]}"></div><div class="phone c"><img src="${posters[2]}"></div><div class="phone b"><img src="${posters[1]}"></div>`;

const browser = await chromium.launch({ channel: 'chrome' });
const tab = await browser.newPage({
    viewport: {
        width: 1200,
        height: 630,
    },
    deviceScaleFactor: 2,
});
await tab.setContent(page, { waitUntil: 'load' });
await tab.evaluate('document.fonts.ready');
const shot = await tab.screenshot({ type: 'png' });
await browser.close();

fs.mkdirSync(path.dirname(out), { recursive: true });
// WhatsApp drops heavy previews: kept well under 300 KB.
await sharp(shot)
    .resize(1200, 630)
    .jpeg({
        quality: 86,
        mozjpeg: true,
    })
    .toFile(out);
console.log(`${out}: ${String(Math.round(fs.statSync(out).size / 1024))} KB`);
