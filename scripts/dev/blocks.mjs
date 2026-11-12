// Dev helper: open an invite, then screenshot each block after its entrance plays.
// Usage: node scripts/dev/blocks.mjs out-dir /demo-slug [/demo-slug...]
import { chromium, devices } from '@playwright/test';

const [out, ...paths] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['Pixel 7'] });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
for (const p of paths) {
    await page.goto(`http://localhost:5173${p}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const skip = page.locator('[data-skip-opening]');
    const tap = page.locator('[data-opening] button').last();
    if (await skip.count()) {
        await skip.evaluate((b) => b.click());
        await page.waitForTimeout(1500);
    } else if (await tap.count()) {
        await tap.click({ force: true }).catch(() => undefined);
        await page.waitForTimeout(4200);
    }
    const name = p.replace(/\W+/g, '_');
    const blocks = await page
        .locator('[data-block]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('data-block')));
    console.log(p, blocks.join(' | '));
    for (let i = 0; i < blocks.length; i++) {
        const el = page.locator('[data-block]').nth(i);
        await el.evaluate((node) => node.scrollIntoView({ block: 'start' }));
        await page.mouse.wheel(0, 1);
        await page.waitForTimeout(1900);
        await page.evaluate(() =>
            globalThis.document.querySelector('vite-error-overlay')?.remove(),
        );
        await page.screenshot({path: `${out}/${name}-${String(i).padStart(2, '0')}-${blocks[i].replace(':', '_')}.png`,});
    }
}
console.log(errors.length ? `PAGE ERRORS:\n${[...new Set(errors)].join('\n')}` : 'no page errors');
await browser.close();
