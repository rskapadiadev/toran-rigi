// Dev helper: full studio journey in a real browser. Usage: node scripts/dev/journey.mjs out-dir
import { chromium, devices } from '@playwright/test';

const out = process.argv[2];
const base = 'http://localhost:5173';
const browser = await chromium.launch();
const ctx = await browser.newContext({
    viewport: {
        width: 1440,
        height: 1000,
    },
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const step = (msg) => console.log(`✓ ${msg}`);

await page.goto(`${base}/admin/login`);
await page.fill('input[name=email]', 'admin@therigi.co');
await page.click('button[type=submit]');
await page.waitForSelector('input[name=code]');
const mails = await (await fetch(`${base}/api/dev/mail`)).json();
// The code boxes sign in on their own once the sixth digit lands.
await page.fill('input[name=code]', /\d{6}/.exec(mails[0].subject)[0]);
await page.waitForURL(`${base}/admin`);
step('signed in');

const stamp = Date.now().toString().slice(-6);
await page.goto(`${base}/admin/orders/new`);
await page.fill('input[name=name]', `Riya Shah ${stamp}`);
await page.fill('input[name=phone]', `+9198${stamp}0`);
await page.getByRole('radio', { name: /Essential/ }).click();
await page.getByRole('button', { name: /Create order/ }).click();
await page.waitForURL(/\/admin\/orders\/[a-z0-9]+$/);
step('order created from the New order form');
await page.waitForSelector('button:has-text("Create invitation")');
await page.getByRole('button', { name: /Create invitation/ }).click();
await page.waitForSelector('text=Live preview');
step('composer opened');

await page
    .getByRole('tab', {
        name: 'Words',
        exact: true,
    })
    .click();
await page.getByLabel('Partner one', { exact: true }).fill('Riya');
await page.getByLabel('Partner two', { exact: true }).fill('Kabir');
await page
    .getByRole('tab', {
        name: 'Ceremonies',
        exact: true,
    })
    .click();
await page.getByRole('button', { name: /Add ceremony/ }).click();
await page.getByRole('button', { name: /Save changes/ }).click();
await page.waitForSelector('button:has-text("Saved")');
step('names + ceremony saved');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/composer.png` });

await page
    .getByRole('tab', {
        name: 'Publish',
        exact: true,
    })
    .click();
await page.getByRole('button', { name: 'Publish invitation' }).click();
await page.waitForSelector('text=Balance outstanding');
step('publish blocked while balance due');

const orderUrl = page.url();
await page.goto(`${base}/admin/billing`);
await page
    .locator('tbody tr')
    .filter({ hasText: `Riya Shah ${stamp}` })
    .first()
    .click();
await page.getByRole('button', { name: 'Record payment' }).click();
await page.getByRole('button', { name: 'Save payment' }).click();
await page.waitForSelector('text=Payment recorded', { timeout: 5000 });
step('balance collected');

await page.goto(orderUrl);
await page
    .getByRole('tab', {
        name: 'Publish',
        exact: true,
    })
    .click();
await page.getByRole('button', { name: 'Publish invitation' }).click();
await page.waitForSelector('text=Open live invitation');
step('published');

await page.getByRole('link', { name: /Guests & RSVPs/ }).click();
await page.waitForURL(/\/guests$/);
await page.waitForSelector('text=Personal guest links');
await page.fill('textarea', 'Shah Parivar, +919800000002, 4\nKhan Family, +971500000001, 2');
await page.getByRole('button', { name: 'Add guests' }).click();
await page.waitForSelector('text=Khan Family');
const link = (await page.locator('[data-guest-link]').first().textContent()).trim();
step(`guest links created (${link})`);

const guestPage = await browser.newPage({ ...devices['Pixel 7'] });
await guestPage.goto(link);
await guestPage.waitForTimeout(800);
await guestPage.screenshot({ path: `${out}/guest-opening.png` });
const skip = guestPage.locator('[data-skip-opening]');
await (
    (await skip.count()) ? skip.first() : guestPage.locator('[data-opening] button').last()
).click({ force: true });
await guestPage.waitForTimeout(2800);
await guestPage.locator('#rsvp').scrollIntoViewIfNeeded();
await guestPage.getByRole('button', { name: 'Send RSVP' }).click();
await guestPage.waitForSelector('text=lights shining for');
await guestPage.screenshot({ path: `${out}/guest-rsvp-done.png` });
step('guest RSVP’d via personal link');

await page.reload();
await page.getByText('Replied', { exact: true }).first().waitFor();
await page.screenshot({
    path: `${out}/guests-admin.png`,
    fullPage: true,
});
step('admin sees the reply');
console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
