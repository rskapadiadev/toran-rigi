// Cloudflare Browser Rendering: a headless Chrome next to the Worker (binding BROWSER).
import puppeteer from '@cloudflare/puppeteer';

import {
    captureCards,
    capturePages,
    CARD_QUALITY,
    JPEG_QUALITY,
    NAME_SHIM,
    PAGE_H,
    PAGE_W,
    preparePage,
    SCALE,
    wholeCard,
} from '../shared/capture';
import type { PageCapturer } from '../types';

export function cloudflareCapturer(binding: Fetcher): PageCapturer {
    return {
        async capture(url) {
            const browser = await puppeteer.launch(binding);
            try {
                const page = await browser.newPage();
                await page.setViewport({
                    width: PAGE_W,
                    height: PAGE_H,
                    deviceScaleFactor: SCALE,
                });
                // The still layout: every scene settled, nothing mid-animation.
                await page.emulateMediaFeatures([
                    {
                        name: 'prefers-reduced-motion',
                        value: 'reduce',
                    },
                ]);
                return await capturePages(
                    {
                        goto: async (target) => {
                            await page.goto(target, {
                                waitUntil: 'networkidle0',
                                timeout: 45_000,
                            });
                        },
                        waitForReady: async () => {
                            await page.waitForSelector('[data-print-ready]', { timeout: 30_000 });
                            await page.evaluate(NAME_SHIM);
                        },
                        prepare: (n) => page.evaluate(preparePage, n),
                        shoot: async (clip) => {
                            // Puppeteer clips from the top of the document, not of the window.
                            const scrolled = await page.evaluate(() => window.scrollY);
                            return new Uint8Array(
                                await page.screenshot({
                                    type: 'jpeg',
                                    quality: JPEG_QUALITY,
                                    clip: {
                                        ...clip,
                                        y: clip.y + scrolled,
                                    },
                                    captureBeyondViewport: false,
                                }),
                            );
                        },
                    },
                    url,
                );
            } finally {
                await browser.close();
            }
        },
        async cards(shots) {
            const browser = await puppeteer.launch(binding);
            try {
                const page = await browser.newPage();
                return await captureCards(
                    {
                        open: async (shot) => {
                            await page.setViewport({
                                width: shot.width,
                                height: shot.height,
                                deviceScaleFactor: shot.scale,
                            });
                            await page.goto(shot.url, {
                                waitUntil: 'networkidle0',
                                timeout: 45_000,
                            });
                            await page.waitForSelector('[data-card-ready]', { timeout: 30_000 });
                        },
                        shoot: async (shot) =>
                            new Uint8Array(
                                await page.screenshot({
                                    type: shot.type,
                                    ...(shot.type === 'jpeg' && { quality: CARD_QUALITY }),
                                    clip: shot.clip ?? wholeCard(shot),
                                    captureBeyondViewport: false,
                                }),
                            ),
                    },
                    shots,
                );
            } finally {
                await browser.close();
            }
        },
    };
}
