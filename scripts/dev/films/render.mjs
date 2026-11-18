/* global window, document */
// Renders an illustrated opening film from its scene page into public/kits/<name>/:
// film.mp4 plus the first and last frames as stills, ready for a template's design.film.
// Usage: node scripts/dev/films/render.mjs deepmala [--stills]   (needs ffmpeg: brew install ffmpeg)
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const name = process.argv[2] ?? 'deepmala';
const FPS = 30;
const SECONDS = 9;
const here = dirname(fileURLToPath(import.meta.url));
const scene = resolve(here, name, 'scene.html');
const out = resolve(here, '../../../public/kits', name);
const frames = mkdtempSync(join(tmpdir(), `film-${name}-`));
mkdirSync(out, { recursive: true });

// Frames are independent (render(t) is deterministic), so several pages draw them side by side.
const workers = Math.max(2, Math.min(8, availableParallelism() - 2));
const browser = await chromium.launch();
const openPage = async () => {
    const p = await (
        await browser.newContext({
            viewport: {
                width: 1080,
                height: 1920,
            },
        })
    ).newPage();
    await p.goto(`file://${scene}`);
    return p;
};
const page = await openPage();
const total = FPS * SECONDS;
// The first and last frames become the stills: encoded as WebP by the browser (ffmpeg builds often
// lack a WebP encoder).
const still = async (t, file) => {
    const data = await page.evaluate((at) => {
        window.render(at);
        return document.querySelector('canvas').toDataURL('image/webp', 0.82);
    }, t);
    writeFileSync(join(out, file), Buffer.from(data.split(',')[1], 'base64'));
};
await still(0, 'film-first.webp');
await still((total - 1) / FPS, 'film-last.webp');
if (process.argv.includes('--stills')) {
    await browser.close();
    process.exit(0);
}
// --frames: sprite sheets for the film behind the invitation (scrolled frame by frame), not an mp4.
if (process.argv.includes('--frames')) {
    const SHEET_FPS = 15;
    const W = 540;
    const H = 960;
    const GRID = 3;
    const count = Math.floor(SHEET_FPS * SECONDS);
    const per = GRID * GRID;
    const sheets = Math.ceil(count / per);
    const dir = join(out, 'frames');
    rmSync(dir, {
        recursive: true,
        force: true,
    });
    mkdirSync(dir, { recursive: true });
    const pages = [page, ...(await Promise.all(Array.from({ length: workers - 1 }, openPage)))];
    let nextSheet = 0;
    const sheetWork = async (p) => {
        while (nextSheet < sheets) {
            const s = nextSheet++;
            const times = Array.from(
                { length: Math.min(per, count - s * per) },
                (_, k) => (s * per + k) / SHEET_FPS,
            );
            const data = await p.evaluate(
                ({ list, w, h, grid }) => {
                    const sheet = document.createElement('canvas');
                    sheet.width = w * grid;
                    sheet.height = h * grid;
                    const g = sheet.getContext('2d');
                    const film = document.querySelector('canvas');
                    list.forEach((t, k) => {
                        window.render(t);
                        g.drawImage(film, (k % grid) * w, Math.floor(k / grid) * h, w, h);
                    });
                    return sheet.toDataURL('image/webp', 0.8);
                },
                {
                    list: times,
                    w: W,
                    h: H,
                    grid: GRID,
                },
            );
            const file = `sheet-${String(s).padStart(3, '0')}.webp`;
            writeFileSync(join(dir, file), Buffer.from(data.split(',')[1], 'base64'));
        }
    };
    await Promise.all(pages.map(sheetWork));
    await browser.close();
    const files = Array.from(
        { length: sheets },
        (_, s) => `/kits/${name}/frames/sheet-${String(s).padStart(3, '0')}.webp`,
    );
    const bytes = files.reduce((sum, f) => sum + statSync(join(out, '..', '..', f)).size, 0);
    const manifest = {
        sheets: files,
        fps: SHEET_FPS,
        count,
        cols: GRID,
        rows: GRID,
        width: W,
        height: H,
    };
    writeFileSync(join(dir, 'frames.json'), `${JSON.stringify(manifest, null, 4)}\n`);
    console.log(`${String(sheets)} sheets, ${(bytes / 1e6).toFixed(2)} MB → ${dir}`);
    process.exit(0);
}
const started = Date.now();
let next = 0;
let done = 0;
const work = async (p) => {
    while (next < total) {
        const i = next++;
        // JPEG frames at high quality: far quicker than PNG, and x264 re-encodes them anyway.
        const data = await p.evaluate((t) => {
            window.render(t);
            return document.querySelector('canvas').toDataURL('image/jpeg', 0.95);
        }, i / FPS);
        writeFileSync(
            join(frames, `${String(i).padStart(4, '0')}.jpg`),
            Buffer.from(data.split(',')[1], 'base64'),
        );
        done++;
        if (done % 30 === 0) {
            const secs = Math.round((Date.now() - started) / 1000);
            console.log(`frame ${String(done)}/${String(total)} (${String(secs)} s)`);
        }
    }
};
const pages = [page, ...(await Promise.all(Array.from({ length: workers - 1 }, openPage)))];
console.log(`rendering ${String(total)} frames on ${String(workers)} pages`);
await Promise.all(pages.map(work));
await browser.close();

const ff = (...args) =>
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const film = join(out, 'film.mp4');
ff(
    '-framerate',
    String(FPS),
    '-i',
    join(frames, '%04d.jpg'),
    '-an',
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '24',
    '-preset',
    'slow',
    '-movflags',
    '+faststart',
    film,
);
rmSync(frames, {
    recursive: true,
    force: true,
});
console.log(`${film}: ${(statSync(film).size / 1e6).toFixed(2)} MB`);
