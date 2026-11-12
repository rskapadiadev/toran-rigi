// Dev helper: signs into /admin via the dev mailbox and screenshots key pages. Usage: node scripts/dev/shoot-admin.mjs out-dir
import { chromium } from '@playwright/test';

const out = process.argv[2];
const base = 'http://localhost:5173';
const browser = await chromium.launch();
const page = await browser.newPage({
    viewport: {
        width: 1440,
        height: 1000,
    },
});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const shot = async (name, fullPage = false) => {
    await page.waitForTimeout(900);
    await page.screenshot({
        path: `${out}/${name}.png`,
        fullPage,
    });
    console.log(`✓ ${name}`);
};

await page.goto(`${base}/admin/login`);
await shot('admin-login');
await page.fill('input[name=email]', 'admin@therigi.co');
await page.click('button[type=submit]');
await page.waitForSelector('input[name=code]');
const mails = await (await fetch(`${base}/api/dev/mail`)).json();
const code = /\d{6}/.exec(mails[0].subject)[0];
// The code boxes sign in on their own once the sixth digit lands.
await page.fill('input[name=code]', code);
await page.waitForURL(`${base}/admin`);
await shot('admin-dashboard', true);

await page.keyboard.press('Meta+k');
await page.keyboard.type('ord');
await shot('admin-command');
await page.keyboard.press('Escape');

await page.goto(`${base}/admin/orders`);
await shot('admin-orders-board');
await page.goto(`${base}/admin/orders?view=table`);
await shot('admin-orders');
await page.locator('tbody tr').first().click();
await page.waitForURL(/\/admin\/orders\/[a-z0-9]+$/);
await shot('admin-order', true);

const composer = page.getByRole('link', { name: 'Open Composer' });
if (await composer.count()) {
    await composer.click();
    await page.waitForSelector('text=Live preview');
    await page.waitForTimeout(1500);
    await shot('admin-composer');
    await page
        .getByRole('tab', {
            name: 'Words',
            exact: true,
        })
        .click();
    await shot('admin-composer-words');
    await page
        .getByRole('tab', {
            name: 'Sections',
            exact: true,
        })
        .click();
    await page.waitForTimeout(400);
    const trigger = page.locator('[role=tabpanel] [data-slot=accordion-trigger]').first();
    if ((await trigger.count()) && (await trigger.getAttribute('data-state')) !== 'open')
        await trigger.click();
    await shot('admin-composer-sections');
    await page
        .getByRole('tab', {
            name: 'Publish',
            exact: true,
        })
        .click();
    await shot('admin-composer-publish');
    await page.getByRole('link', { name: /Guests & RSVPs/ }).click();
    await page.waitForURL(/\/guests$/);
    await shot('admin-guests', true);
}

await page.goto(`${base}/admin/billing?status=all`);
await page.waitForSelector('tbody tr');
await page.locator('tbody tr').first().click();
await shot('admin-billing');

await page.goto(`${base}/admin/customers`);
await shot('admin-customers');
await page.goto(`${base}/admin/invitations`);
await shot('admin-invitations');
await page.goto(`${base}/admin/orders/new`);
await shot('admin-new-order', true);

await page.goto(`${base}/admin`);
await page.locator('[data-sidebar=trigger]').click();
await page.waitForTimeout(2000);
await shot('admin-dashboard-collapsed');
await page.locator('[data-sidebar=trigger]').click();

await page.setViewportSize({
    width: 390,
    height: 844,
});
await page.goto(`${base}/admin`);
await shot('admin-mobile-dashboard');
console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
