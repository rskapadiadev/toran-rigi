// Canvas plumbing shared by the particle openings (scratch, fireworks, warp).

export interface Stage {
    ctx: CanvasRenderingContext2D;
    w: number;
    h: number;
}

// Sizes the canvas to its box (not the window): openings also run inside the Composer's phone frame.
export function fitCanvas(canvas: HTMLCanvasElement): Stage | null {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return {
        ctx,
        w: rect.width,
        h: rect.height,
    };
}

// requestAnimationFrame loop with delta time in seconds; return false from `step` to stop.
export function loop(step: (dt: number, elapsed: number) => boolean | undefined): () => void {
    let raf = 0;
    let last = performance.now();
    const start = last;
    const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (step(dt, (now - start) / 1000) === false) return;
        raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
        cancelAnimationFrame(raf);
    };
}

export function rgba(hex: string, alpha: number): string {
    const n = Number.parseInt(hex.replace('#', '').slice(0, 6), 16);
    return `rgba(${String((n >> 16) & 255)}, ${String((n >> 8) & 255)}, ${String(n & 255)}, ${String(alpha)})`;
}
