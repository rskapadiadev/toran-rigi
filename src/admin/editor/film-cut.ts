// Cuts a film into the frame sheets the film behind the invitation is drawn from, in the browser
// (the server never decodes video), and uploads them beside the invitation's photos.
import { type FilmFrames, FRAME_WIDTH, FRAMES_FPS, FRAMES_GRID } from '@shared/film';

import { ApiError } from '@/lib/api';

interface UploadResult {
    key: string;
}

export async function send(endpoint: string, file: Blob, name: string) {
    const body = new FormData();
    body.append('file', file, name);
    const res = await fetch(endpoint, {
        method: 'POST',
        body,
        credentials: 'include',
    });
    if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new ApiError(err.error ?? 'Upload failed', res.status);
    }
    return (await res.json<UploadResult>()).key;
}

export function seek(video: HTMLVideoElement, time: number) {
    return new Promise<void>((resolve, reject) => {
        video.onseeked = () => {
            resolve();
        };
        video.onerror = () => {
            reject(new Error('This browser cannot read the film'));
        };
        video.currentTime = time;
    });
}

export function loadVideo(src: string) {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = src;
    return new Promise<HTMLVideoElement>((resolve, reject) => {
        video.onloadeddata = () => {
            resolve(video);
        };
        video.onerror = () => {
            reject(new Error('This browser cannot play the film; try an H.264 MP4'));
        };
    });
}

const toWebp = (canvas: HTMLCanvasElement) =>
    new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Could not draw the frames'));
            },
            'image/webp',
            0.8,
        );
    });

interface CutFrames {
    sheets: Blob[];
    count: number;
    height: number;
}

// Cuts the film into frames (15 a second, 540 wide) packed 3×3 per sheet, for the film behind the
// invitation: guests scroll through pictures, which every phone handles smoothly.
async function framesOf(src: string, progress: (done: number, total: number) => void) {
    const video = await loadVideo(src);
    const count = Math.max(1, Math.floor(video.duration * FRAMES_FPS));
    const height = Math.round((FRAME_WIDTH * video.videoHeight) / video.videoWidth);
    const per = FRAMES_GRID * FRAMES_GRID;
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_WIDTH * FRAMES_GRID;
    canvas.height = height * FRAMES_GRID;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not draw the frames');
    const sheets: Blob[] = [];
    for (let s = 0; s * per < count; s++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let k = 0; k < per && s * per + k < count; k++) {
            const i = s * per + k;
            await seek(video, i / FRAMES_FPS);
            ctx.drawImage(
                video,
                (k % FRAMES_GRID) * FRAME_WIDTH,
                Math.floor(k / FRAMES_GRID) * height,
                FRAME_WIDTH,
                height,
            );
            progress(i + 1, count);
        }
        sheets.push(await toWebp(canvas));
    }
    const cut: CutFrames = {
        sheets,
        count,
        height,
    };
    return cut;
}

// Cuts the film at `src` and uploads its sheets: the frames, ready for a film scene.
export async function cutFrames(
    invitationId: string,
    src: string,
    progress: (label: string) => void,
): Promise<FilmFrames> {
    const cut = await framesOf(src, (done, total) => {
        progress(`Cutting frames ${String(done)} of ${String(total)}`);
    });
    progress('Uploading frames');
    const sheets: string[] = [];
    for (const [i, blob] of cut.sheets.entries())
        sheets.push(
            await send(`/api/admin/photos/${invitationId}`, blob, `frames-${String(i)}.webp`),
        );
    return {
        sheets,
        fps: FRAMES_FPS,
        count: cut.count,
        cols: FRAMES_GRID,
        rows: FRAMES_GRID,
        width: FRAME_WIDTH,
        height: cut.height,
    };
}
