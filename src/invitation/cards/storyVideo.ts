// The story as a short video: the picture drifts closer, the words arrive line by line, a little
// falls through the air, and it rests on exactly the still story.
import type { StoryEffect } from '@shared/cards';

import { canEncode, encodeVideo } from '../film/encode';
import { drawEffect } from '../film/layers';

export const STORY_SECONDS = 7;
const FPS = 30;
// When the first line arrives, how far apart the lines are, and how long each takes.
const FIRST = 0.9;
const LAST = 3.6;
const ARRIVE = 0.9;

interface StoryParts {
    // The story without its words, and its words on nothing: both the whole frame.
    art: Blob;
    words: Blob;
    bg: string;
    effect: StoryEffect | null;
}

export interface Band {
    top: number;
    bottom: number;
}

// Rows of writing: stretches of the words' picture with ink, parted by empty rows.
export function bandsOf(inked: readonly boolean[], gap: number): Band[] {
    const bands: Band[] = [];
    let empty = gap;
    for (const [y, ink] of inked.entries()) {
        if (!ink) {
            empty++;
            continue;
        }
        const last = bands.at(-1);
        if (last && empty < gap) last.bottom = y + 1;
        else
            bands.push({
                top: y,
                bottom: y + 1,
            });
        empty = 0;
    }
    return bands;
}

function inkedRows(words: ImageBitmap): boolean[] {
    const canvas = document.createElement('canvas');
    canvas.width = words.width;
    canvas.height = words.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];
    ctx.drawImage(words, 0, 0);
    const { data } = ctx.getImageData(0, 0, words.width, words.height);
    return Array.from({ length: words.height }, (_, y) => {
        for (let x = 0; x < words.width; x += 2)
            if ((data[(y * words.width + x) * 4 + 3] ?? 0) > 12) return true;
        return false;
    });
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => 1 - (1 - clamp(v)) ** 3;

const sizes = [
    {
        width: 1080,
        height: 1920,
        bitrate: 8_000_000,
    },
    // Older phones encode only up to 720p.
    {
        width: 720,
        height: 1280,
        bitrate: 4_000_000,
    },
];

export async function makeStoryVideo(
    parts: StoryParts,
    onProgress: (share: number) => void,
    signal?: AbortSignal,
): Promise<Blob> {
    let size: (typeof sizes)[number] | undefined;
    for (const s of sizes)
        if (
            !size &&
            (await canEncode({
                ...s,
                fps: FPS,
            }))
        )
            size = s;
    if (!size) throw new Error('This device can’t make videos yet.');
    const { width, height } = size;
    const [art, words] = await Promise.all([
        createImageBitmap(parts.art),
        createImageBitmap(parts.words),
    ]);
    const scale = height / words.height;
    const bands = bandsOf(inkedRows(words), Math.round(words.height * 0.004));
    const apart = bands.length > 1 ? Math.min(0.4, (LAST - FIRST) / (bands.length - 1)) : 0;
    try {
        return await encodeVideo({
            ...size,
            fps: FPS,
            seconds: STORY_SECONDS,
            onProgress,
            signal,
            draw: (ctx, t) => {
                ctx.globalAlpha = 1;
                ctx.fillStyle = parts.bg;
                ctx.fillRect(0, 0, width, height);
                // It comes closer and settles, so the last second is the still itself.
                const zoom = 1 + 0.07 * (1 - ease(t / 5.2));
                const w = width * zoom;
                const h = height * zoom;
                // There from the first frame, which chats and galleries show as the thumbnail.
                ctx.drawImage(art, (width - w) / 2, (height - h) * 0.42, w, h);
                if (parts.effect) {
                    const air = clamp((t - 0.4) / 1.2) * (1 - clamp((t - 5.4) / 1.2));
                    drawEffect(ctx, parts.effect, t + 4, width, height, air * 0.85);
                }
                for (const [i, band] of bands.entries()) {
                    const a = ease((t - FIRST - i * apart) / ARRIVE);
                    if (a <= 0) continue;
                    const tall = band.bottom - band.top;
                    ctx.globalAlpha = a;
                    ctx.drawImage(
                        words,
                        0,
                        band.top,
                        words.width,
                        tall,
                        0,
                        band.top * scale + (1 - a) * height * 0.014,
                        width,
                        tall * scale,
                    );
                }
            },
        });
    } finally {
        art.close();
        words.close();
    }
}
