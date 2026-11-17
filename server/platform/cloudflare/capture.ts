// Cloudflare Browser Rendering: a headless Chrome next to the Worker (binding BROWSER).
import puppeteer from '@cloudflare/puppeteer';

import {
    capturePages,
    findPagesInDocument,
    JPEG_QUALITY,
    PAGE_H,
    PAGE_W,
    SCALE,
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
                        },
                        findPages: () => page.evaluate(findPagesInDocument),
                        shoot: async (clip) =>
                            new Uint8Array(
                                await page.screenshot({
                                    type: 'jpeg',
                                    quality: JPEG_QUALITY,
                                    clip,
                                    captureBeyondViewport: true,
                                }),
                            ),
                    },
                    url,
                );
            } finally {
                await browser.close();
            }
        },
    };
}
