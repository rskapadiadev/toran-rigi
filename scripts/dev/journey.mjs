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
// Orders start from a design: its own price is charged and the invitation is made from it.
await page.getByPlaceholder('Search designs or occasions…').fill('rajwada');
await page.getByRole('radio', { name: /Rajwada/ }).first().click();
await page.getByRole('button', { name: /Create order/ }).click();
await page.waitForURL(/\/admin\/orders\/[a-z0-9]+$/);
step('order created from the New order form');
await page.getByRole('link', { name: /Open editor/ }).first().click();
// Invitations open straight into the full-screen visual editor.
await page.waitForSelector('nav[aria-label="Editor panels"]');
step('editor opened');

const panelTab = (name) =>
    page.locator('nav[aria-label="Editor panels"]').getByRole('button', {
 name,
exact: true 
});
await panelTab('Details').click();
await page.getByLabel('Partner one', { exact: true }).fill('Riya');
await page.getByLabel('Partner two', { exact: true }).fill('Kabir');
await page.getByRole('button', {
 name: 'Save',
exact: true 
}).click();
// Exact match: "Saved" is also inside "Unsaved changes".
await page.locator('header').getByText('Saved', { exact: true }).waitFor();
step('names saved');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/editor.png` });

const publish = async () => {
    await page.getByRole('button', {
 name: 'Publish',
exact: true 
}).click();
    await page.getByRole('button', { name: 'Publish invitation' }).click();
};
await publish();
await page.waitForSelector('text=Balance outstanding');
step('publish blocked while balance due');

const editorUrl = page.url();
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

await page.goto(editorUrl);
await page.waitForSelector('nav[aria-label="Editor panels"]');
await publish();
await page.waitForSelector('text=Open live invitation');
step('published');
await page.keyboard.press('Escape');

await page.getByRole('link', {
 name: 'Guests',
exact: true 
}).click();
await page.waitForURL(/\/guests$/);
await page.getByRole('button', { name: 'Paste a list' }).click();
await page.getByLabel('One family per line').fill('Shah Parivar, +919800000002, 4\nKhan Family, +971500000001, 2');
await page.getByRole('button', { name: 'Add 2 families' }).click();
await page.waitForSelector('text=Khan Family');
const link = await page.locator('[data-guest-link]').first().getAttribute('data-guest-link');
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
