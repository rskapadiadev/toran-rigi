/* global window, document */
// Dev helper: film an invitation's opening frame-by-frame, then scroll its scenes.
// Usage: node scripts/dev/film.mjs out-dir slug
import { chromium, devices } from '@playwright/test';

const [out, slug] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['Pixel 7'] });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`http://localhost:5173/${slug}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/${slug}-0-cover.png` });
await page.locator('[data-opening] button').last().click({ force: true });
const frames = [350, 900, 1500, 2300, 3200];
let last = 0;
for (const t of frames) {
    await page.waitForTimeout(t - last);
    last = t;
    await page.screenshot({ path: `${out}/${slug}-1-t${t}.png` });
}
await page.waitForTimeout(2200);
const height = await page.evaluate(() => document.documentElement.scrollHeight);
for (let i = 0; i < 9; i++) {
    await page.evaluate((y) => {
        window.scrollTo(0, y);
    }, i * 800);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/${slug}-2-s${i}.png` });
}
console.log(
    `height ${height}`,
    errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors',
);
await browser.close();
