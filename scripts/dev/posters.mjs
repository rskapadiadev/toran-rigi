// Captures each published template's cover (the opening screen guests first see) as a still poster
// and uploads it, so the shop shows pictures instead of running every invitation live.
// Usage: npm run dev, then `node scripts/dev/posters.mjs [base-url] [admin-email]`.
// Re-run after changing a template's look; `--all` also redoes templates that already have one.
// Production: `node scripts/dev/posters.mjs https://toran.therigi.workers.dev you@example.com`
// asks for the sign-in code from your email (there is no dev inbox there).
import { createInterface } from 'node:readline/promises';

import { chromium } from '@playwright/test';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const base = args[0] ?? 'http://localhost:5173';
const email = args[1] ?? 'admin@therigi.co';
const redoAll = process.argv.includes('--all');

const browser = await chromium.launch();
const ctx = await browser.newContext({
    viewport: {
        width: 390,
        height: 800,
    },
    deviceScaleFactor: 1.5,
    reducedMotion: 'no-preference',
});
const page = await ctx.newPage();

// Sign in as an admin: locally the code comes from the dev inbox; anywhere else, from your email.
const local = /localhost|127\.0\.0\.1/.test(base);
if (!local && !args[1]) throw new Error('Pass the admin email for a live site.');
await page.request.post(`${base}/api/auth/request-code`, { data: { email } });
let code;
if (local) {
    const mails = await (await fetch(`${base}/api/dev/mail`)).json();
    code = mails.find((m) => m.to === email)?.subject.slice(0, 6);
} else {
    const prompt = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    code = (await prompt.question(`Enter the 6-digit code sent to ${email}: `)).trim();
    prompt.close();
}
if (!code) throw new Error(`No sign-in code for ${email}. Is the dev server running?`);
const signedIn = await page.request.post(`${base}/api/auth/verify`, {
    data: {
        email,
        code,
    },
});
if (!signedIn.ok()) throw new Error('Sign-in failed');

const templates = await (await page.request.get(`${base}/api/admin/templates`)).json();
const todo = templates.filter((t) => t.status === 'published' && (redoAll || !t.posterKey));
console.log(`${String(todo.length)} of ${String(templates.length)} templates need a poster`);

for (const t of todo) {
    await page.goto(`${base}/${t.sampleSlug}?embed=1`, { waitUntil: 'load' });
    // Let the opening settle: fonts, the cover photo and its entrance.
    await page.waitForTimeout(3000);
    const image = await page.screenshot({
        type: 'jpeg',
        quality: 80,
    });
    const res = await page.request.post(`${base}/api/admin/templates/${t.id}/poster`, {
        multipart: {
            file: {
                name: `${t.slug}.jpg`,
                mimeType: 'image/jpeg',
                buffer: image,
            },
        },
    });
    console.log(
        `${res.ok() ? '✓' : '✗'} ${t.name} (${String(Math.round(image.length / 1024))} KB)`,
    );
}

await browser.close();
