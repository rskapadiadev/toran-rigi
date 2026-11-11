import { useSyncExternalStore } from 'react';

// full = WebGL, physics, audio · lite = CSS/SVG + GSAP · static = elegant, no motion.
export type MotionTier = 'full' | 'lite' | 'static';

interface ConnectionHints {
    saveData?: boolean;
    effectiveType?: string;
}

interface NavigatorHints {
    deviceMemory?: number;
    connection?: ConnectionHints;
}

export function detectTier(): MotionTier {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'static';
    const nav = navigator as Navigator & NavigatorHints;
    if (nav.connection?.saveData) return 'lite';
    const lowMemory = (nav.deviceMemory ?? 8) <= 2;
    const slowNet = ['slow-2g', '2g'].includes(nav.connection?.effectiveType ?? '');
    if (lowMemory || slowNet) return 'lite';
    try {
        const canvas = document.createElement('canvas');
        if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) return 'lite';
    } catch {
        return 'lite';
    }
    return 'full';
}

// Drops a tier if the device can't keep ~45 fps during a short probe.
export function probeFps(durationMs = 600): Promise<number> {
    return new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        const tick = (now: number) => {
            frames++;
            if (now - start < durationMs) requestAnimationFrame(tick);
            else resolve((frames * 1000) / (now - start));
        };
        requestAnimationFrame(tick);
    });
}

let tier: MotionTier | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    if (tier === undefined) {
        tier = detectTier();
        if (tier === 'full') {
            void probeFps().then((fps) => {
                if (fps < 45) {
                    tier = 'lite';
                    listeners.forEach((l) => {
                        l();
                    });
                }
            });
        }
    }
    return () => {
        listeners.delete(listener);
    };
}

export const useMotionTier = (): MotionTier =>
    useSyncExternalStore(
        subscribe,
        () => tier ?? detectTier(),
        () => 'lite',
    );
