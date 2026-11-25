// An invitation's own music, cut to a video's length and encoded beside its pictures.
import type { MusicPlan } from '../music/player';
import { AAC_FRAME, type Mp4Sound } from './mp4';

const RATE = 48_000;
const CHANNELS = 2;
const FADE_IN = 0.5;
const FADE_OUT = 1.4;

const aac: AudioEncoderConfig = {
    codec: 'mp4a.40.2',
    sampleRate: RATE,
    numberOfChannels: CHANNELS,
    bitrate: 128_000,
};

export async function canAddSound(): Promise<boolean> {
    if (typeof window === 'undefined' || !('AudioEncoder' in window)) return false;
    const support = await AudioEncoder.isConfigSupported(aac).catch(() => null);
    return support?.supported === true;
}

const LOUD = 0.5;

function lift(buffer: AudioBuffer) {
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) =>
        buffer.getChannelData(i),
    );
    let peak = 0;
    for (const data of channels) for (const v of data) peak = Math.max(peak, Math.abs(v));
    if (peak === 0 || peak >= LOUD) return;
    for (const data of channels)
        for (let i = 0; i < data.length; i++) data[i] = ((data[i] ?? 0) * LOUD) / peak;
}

// The music for `seconds`, rising at the start and falling away at the end.
export async function renderSound(
    plan: NonNullable<MusicPlan>,
    seconds: number,
    signal?: AbortSignal,
): Promise<AudioBuffer> {
    const ctx = new OfflineAudioContext(CHANNELS, Math.ceil(seconds * RATE), RATE);
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, 0);
    out.gain.linearRampToValueAtTime(1, FADE_IN);
    out.gain.setValueAtTime(1, Math.max(FADE_IN, seconds - FADE_OUT));
    out.gain.linearRampToValueAtTime(0, seconds);
    out.connect(ctx.destination);
    if (plan.kind === 'file') {
        const res = await fetch(plan.src, { signal });
        if (!res.ok) throw new Error('The music couldn’t be loaded. Try without it.');
        const source = ctx.createBufferSource();
        source.buffer = await ctx.decodeAudioData(await res.arrayBuffer());
        source.loop = true;
        source.connect(out);
        source.start(0);
    } else {
        const { scheduleGenerated } = await import('../music/generated');
        scheduleGenerated(ctx, out, plan.style, plan.seed, seconds);
    }
    const buffer = await ctx.startRendering();
    // Recordings arrive levelled; generated music is soft, for under a page, so a video lifts it.
    if (plan.kind === 'generated') lift(buffer);
    return buffer;
}

const bytesOf = (source: AllowSharedBufferSource) =>
    ArrayBuffer.isView(source)
        ? new Uint8Array(source.buffer, source.byteOffset, source.byteLength).slice()
        : new Uint8Array(source).slice();

interface Output {
    samples: Uint8Array[];
    config: Uint8Array | null;
    failed: Error | null;
}

export async function encodeSound(buffer: AudioBuffer): Promise<Mp4Sound> {
    const out: Output = {
        samples: [],
        config: null,
        failed: null,
    };
    const encoder = new AudioEncoder({
        output: (chunk, meta) => {
            const data = new Uint8Array(chunk.byteLength);
            chunk.copyTo(data);
            out.samples.push(data);
            const description = meta?.decoderConfig?.description;
            if (description) out.config ??= bytesOf(description);
        },
        error: (e) => {
            out.failed = e;
        },
    });
    encoder.configure(aac);
    const block = 4096;
    for (let at = 0; at < buffer.length; at += block) {
        const frames = Math.min(block, buffer.length - at);
        const planes = new Float32Array(frames * CHANNELS);
        for (let ch = 0; ch < CHANNELS; ch++)
            planes.set(
                buffer
                    .getChannelData(Math.min(ch, buffer.numberOfChannels - 1))
                    .subarray(at, at + frames),
                ch * frames,
            );
        const data = new AudioData({
            format: 'f32-planar',
            sampleRate: RATE,
            numberOfFrames: frames,
            numberOfChannels: CHANNELS,
            timestamp: Math.round((at * 1e6) / RATE),
            data: planes,
        });
        encoder.encode(data);
        data.close();
    }
    await encoder.flush();
    encoder.close();
    if (out.failed) throw out.failed;
    if (!out.config) throw new Error('The sound couldn’t be finished. Try without it.');
    return {
        sampleRate: RATE,
        channels: CHANNELS,
        config: out.config,
        // The encoder pads its ends; the sound stops with the pictures.
        samples: out.samples.slice(0, Math.floor(buffer.length / AAC_FRAME)),
    };
}
