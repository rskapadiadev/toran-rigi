// Dev helper: render every demo at phone/tablet/desktop, report overflow, save full-page shots.
// Usage: node scripts/dev/responsive.mjs out-dir [/demo-slug ...]
import { chromium } from '@playwright/test';

const [out, ...given] = process.argv.slice(2);
const slugs = given.length
    ? given
    : [
          'rajwada',
          'bandhani',
          'gulmohar',
          'mashrabiya',
          'noor',
          'kamal',
          'phulkari',
          'cathedral-garden',
          'chuppah',
          'editorial',
          'resham',
      ].map((s) => `/demo-${s}`);
const viewports = [
    {
        name: 'phone',
        width: 390,
        height: 844,
    },
    {
        name: 'tablet',
        width: 820,
        height: 1180,
    },
    {
        name: 'desktop',
        width: 1440,
        height: 900,
    },
];

const browser = await chromium.launch();
const errors = [];
for (const vp of viewports) {
    const page = await browser.newPage({
        viewport: {
            width: vp.width,
            height: vp.height,
        },
    });
    page.on('pageerror', (e) => errors.push(`${vp.name}: ${e.message}`));
    for (const p of slugs) {
        await page.goto(`http://localhost:5173${p}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        const skip = page.locator('[data-skip-opening]');
        const tap = page.locator('[data-opening] button').last();
        if (await skip.count()) await skip.evaluate((b) => b.click());
        else if (await tap.count()) await tap.click({ force: true }).catch(() => undefined);
        await page.waitForTimeout(2500);
        // Walk the page so every whileInView entrance has played before the full-page shot.
        const height = await page.evaluate(() => globalThis.document.body.scrollHeight);
        for (let y = 0; y < height; y += Math.round(vp.height * 0.6)) {
            await page.evaluate((top) => globalThis.scrollTo(0, top), y);
            await page.waitForTimeout(350);
        }
        await page.waitForTimeout(1500);
        const issues = await page.evaluate(() => {
            const doc = globalThis.document;
            const vw = doc.documentElement.clientWidth;
            const found = [];
            if (doc.documentElement.scrollWidth > vw + 1)
                found.push(
                    `page scrolls sideways (${doc.documentElement.scrollWidth}px > ${vw}px)`,
                );
            for (const el of doc.querySelectorAll(
                '.inv-root h1, .inv-root h2, .inv-root h3, .inv-root p, .inv-root a, .inv-root button',
            )) {
                const r = el.getBoundingClientRect();
                if (r.width === 0) continue;
                // Swipe rows (overflow-x scrollers) are meant to extend past the edge.
                if (el.closest('[class*="overflow-x-auto"]')) continue;
                if (r.right > vw + 2 || r.left < -2)
                    found.push(
                        `off-screen <${el.tagName.toLowerCase()}> "${el.textContent.trim().slice(0, 30)}"`,
                    );
                else if (
                    el.scrollWidth > el.clientWidth + 2 &&
                    globalThis.getComputedStyle(el).overflow === 'visible'
                )
                    found.push(
                        `text spills out of <${el.tagName.toLowerCase()}> "${el.textContent.trim().slice(0, 30)}"`,
                    );
            }
            return [...new Set(found)].slice(0, 8);
        });
        const name = `${vp.name}-${p.replace(/\W+/g, '_')}`;
        console.log(name.padEnd(36), issues.length ? issues.join(' · ') : 'ok');
        await page.evaluate(() => globalThis.scrollTo(0, 0));
        await page.screenshot({
            path: `${out}/${name}.png`,
            fullPage: true,
        });
    }
    await page.close();
}
console.log(errors.length ? `PAGE ERRORS:\n${[...new Set(errors)].join('\n')}` : 'no page errors');
await browser.close();
