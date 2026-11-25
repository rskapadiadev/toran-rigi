// Frames drawn on a canvas, encoded to an MP4 on the guest's or couple's own device (WebCodecs);
// nothing is uploaded.
import { mp4, type Mp4Sample } from './mp4';

export const canMakeVideo = () =>
    typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window;

interface Shape {
    width: number;
    height: number;
    fps: number;
    bitrate: number;
}

// The best H.264 setting this device can encode, at the video's size.
async function encoderConfig({
    width,
    height,
    fps,
    bitrate,
}: Shape): Promise<VideoEncoderConfig | null> {
    for (const codec of ['avc1.640028', 'avc1.4d0028', 'avc1.42e028', 'avc1.42e01f']) {
        const config: VideoEncoderConfig = {
            codec,
            width,
            height,
            bitrate,
            framerate: fps,
            avc: { format: 'avc' },
        };
        const support = await VideoEncoder.isConfigSupported(config).catch(() => null);
        if (support?.supported) return config;
    }
    return null;
}

export const canEncode = async (shape: Shape) => Boolean(await encoderConfig(shape));

interface Encoded {
    samples: Mp4Sample[];
    avcC: Uint8Array | null;
    error: Error | null;
}

// A copy of the encoder's decoder configuration, whichever kind of buffer it arrives in.
const bytesOf = (source: AllowSharedBufferSource) =>
    ArrayBuffer.isView(source)
        ? new Uint8Array(source.buffer, source.byteOffset, source.byteLength).slice()
        : new Uint8Array(source).slice();

const CANT = 'This device can’t make videos yet.';

interface Job extends Shape {
    seconds: number;
    // Draws the picture at t seconds.
    draw: (ctx: CanvasRenderingContext2D, t: number) => void | Promise<void>;
    onProgress: (share: number) => void;
    signal?: AbortSignal;
}

export async function encodeVideo(job: Job): Promise<Blob> {
    const { width, height, fps, seconds, draw, onProgress, signal } = job;
    const config = await encoderConfig(job);
    if (!config) throw new Error(CANT);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error(CANT);
    const out: Encoded = {
        samples: [],
        avcC: null,
        error: null,
    };
    const encoder = new VideoEncoder({
        output: (chunk, meta) => {
            const data = new Uint8Array(chunk.byteLength);
            chunk.copyTo(data);
            out.samples.push({
                data,
                key: chunk.type === 'key',
            });
            const description = meta?.decoderConfig?.description;
            if (description && !out.avcC) out.avcC = bytesOf(description);
        },
        error: (e) => {
            out.error = e;
        },
    });
    encoder.configure(config);
    const total = Math.round(seconds * fps);
    try {
        for (let i = 0; i < total; i++) {
            if (signal?.aborted) throw new DOMException('Stopped', 'AbortError');
            if (out.error) throw out.error;
            await draw(ctx, i / fps);
            const frame = new VideoFrame(canvas, {
                timestamp: Math.round((i * 1e6) / fps),
                duration: Math.round(1e6 / fps),
            });
            encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
            frame.close();
            // Don't run ahead of the encoder: phones have little memory for waiting frames.
            while (encoder.encodeQueueSize > 4)
                await new Promise((r) => {
                    setTimeout(r, 4);
                });
            if (i % 6 === 0) onProgress(i / total);
        }
        await encoder.flush();
    } finally {
        if (encoder.state !== 'closed') encoder.close();
    }
    if (out.error) throw out.error;
    if (!out.avcC) throw new Error('The video couldn’t be finished. Please try again.');
    onProgress(1);
    const file = mp4({
        width,
        height,
        fps,
        avcC: out.avcC,
        samples: out.samples,
    });
    return new Blob([file.buffer as ArrayBuffer], { type: 'video/mp4' });
}
