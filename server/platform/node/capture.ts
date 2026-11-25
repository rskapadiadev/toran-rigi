// Local Chrome via Playwright for the Node build (and anywhere Browser Rendering isn't available).
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
                            await page.evaluate(NAME_SHIM);
                        },
                        prepare: (n) => page.evaluate(preparePage, n),
                        shoot: async (clip) =>
                            new Uint8Array(
                                await page.screenshot({
                                    type: 'jpeg',
                                    quality: JPEG_QUALITY,
                                    clip,
                                }),
                            ),
                    },
                    url,
                );
            } finally {
                await browser.close();
            }
        },
        async cards(shots) {
            const { chromium } = await import('@playwright/test');
            const browser = await chromium.launch();
            let close = () => Promise.resolve();
            try {
                let page = await browser.newPage();
                return await captureCards(
                    {
                        // The pixel ratio is fixed when a page opens, so each card gets its own.
                        open: async (shot) => {
                            await close();
                            const frame = {
                                width: shot.width,
                                height: shot.height,
                            };
                            page = await browser.newPage({
                                viewport: frame,
                                deviceScaleFactor: shot.scale,
                            });
                            close = () => page.close();
                            await page.goto(shot.url, {
                                waitUntil: 'networkidle',
                                timeout: 45_000,
                            });
                            await page.waitForSelector('[data-card-ready]', { timeout: 30_000 });
                        },
                        shoot: async (shot) =>
                            new Uint8Array(
                                await page.screenshot({
                                    type: shot.type,
                                    ...(shot.type === 'jpeg' && { quality: CARD_QUALITY }),
                                    omitBackground: shot.transparent ?? false,
                                    clip: shot.clip ?? wholeCard(shot),
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
