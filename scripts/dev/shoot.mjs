// Dev helper: screenshot pages on a phone viewport. Usage: node scripts/dev/shoot.mjs out-dir path [path...]
import { chromium, devices } from '@playwright/test';

const [out, ...paths] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['Pixel 7'] });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
for (const p of paths) {
    await page.goto(`http://localhost:5173${p}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3500);
    const name = p.replace(/\W+/g, '_') || 'home';
    await page.screenshot({ path: `${out}/${name}-opening.png` });
    const tap = page.locator('[data-opening] button').last();
    if (await tap.count()) {
        await tap.click({ force: true }).catch(() => undefined);
        await page.waitForTimeout(3200);
        await page.screenshot({ path: `${out}/${name}-open.png` });
        await page.mouse.wheel(0, 2600);
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${out}/${name}-events.png` });
    }
}
console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
