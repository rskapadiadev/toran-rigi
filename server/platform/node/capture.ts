// Local Chrome via Playwright for the Node build (and anywhere Browser Rendering isn't available).
import {
    capturePages,
    findPagesInDocument,
    JPEG_QUALITY,
    PAGE_H,
    PAGE_W,
    SCALE,
} from '../shared/capture';
import type { PageCapturer } from '../types';

export function nodeCapturer(): PageCapturer {
    return {
        async capture(url) {
            const { chromium } = await import('@playwright/test');
            const browser = await chromium.launch();
            try {
                const page = await browser.newPage({
                    viewport: {
                        width: PAGE_W,
                        height: PAGE_H,
                    },
                    deviceScaleFactor: SCALE,
                    reducedMotion: 'reduce',
                });
                return await capturePages(
                    {
                        goto: async (target) => {
                            await page.goto(target, {
                                waitUntil: 'networkidle',
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
                                    fullPage: true,
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
