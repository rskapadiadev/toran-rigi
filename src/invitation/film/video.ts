// The couple's video of their film, to send on WhatsApp: the walk with their names, the film's
// words and an end card with their link, drawn frame by frame and encoded on their own device
// (WebCodecs); nothing is uploaded. The film is drawn by the same code as the invitation page.
import { momentAlpha, type TimedScene, timelineLength } from '@shared/film';
import { type MotifId, motifs } from '@shared/motifs';
import { photoUrl } from '@shared/photos';
import type { FilmLayer, FilmMoment } from '@shared/types';

import { drawEffect, enterLook, initialsOf, poseAt, shapeAspect } from './layers';
import { filmLoader } from './loader';
import { mp4, type Mp4Sample } from './mp4';
import { paintFilm } from './paint';

const W = 720;
const H = 1280;
const FPS = 30;
// As on the invitation, the film holds on the names before walking on; the end card follows it.
const END = 4;
const NAMES_HOLD = 3;

export interface VideoWords {
    text: string;
    from: number;
    to: number;
    zone: FilmMoment['zone'];
    style: NonNullable<FilmMoment['style']>;
}

export interface VideoText {
    kicker: string;
    one: string;
    and: string;
    two: string;
    date: string;
    venue: string;
    invite: string;
    link: string;
    credit: string;
    namesAt: number;
    words: VideoWords[];
    layers: FilmLayer[];
    dir: 'ltr' | 'rtl';
}

export interface VideoFonts {
    display: string;
    script: string;
    body: string;
}

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

export const canMakeVideo = () =>
    typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window;

export const videoSeconds = (scenes: TimedScene[]) => timelineLength(scenes) + NAMES_HOLD + END;

// The film's own time at a moment of the video: still while the names show, then walking on.
const filmTime = (t: number, namesAt: number, length: number) =>
    Math.min(length, t < namesAt ? t : t < namesAt + NAMES_HOLD ? namesAt : t - NAMES_HOLD);

const clamp = (v: number) => Math.max(0, Math.min(1, v));

// Lines that fit a width, breaking between words.
function wrap(ctx: Ctx, text: string, width: number) {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/).filter(Boolean)) {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > width) {
            lines.push(line);
            line = word;
        } else line = next;
    }
    if (line) lines.push(line);
    return lines;
}

function gold(ctx: Ctx, y: number, size: number) {
    const g = ctx.createLinearGradient(0, y - size, 0, y + size * 0.3);
    g.addColorStop(0, '#fbecc0');
    g.addColorStop(0.5, '#e2bd6e');
    g.addColorStop(1, '#b8862f');
    return g;
}

function write(
    ctx: Ctx,
    text: string,
    y: number,
    font: string,
    fill: string | CanvasGradient,
    spacing = '0px',
) {
    ctx.font = font;
    ctx.letterSpacing = spacing;
    ctx.fillStyle = fill;
    ctx.fillText(text, W / 2, y);
}

// The size at which a line fits the frame, shrinking from `size`.
function fit(ctx: Ctx, text: string, family: string, size: number, width: number) {
    ctx.font = `${String(size)}px ${family}`;
    const w = ctx.measureText(text).width;
    return w > width ? Math.floor((size * width) / w) : size;
}

// t is the video's time, at the film's; filmEnd is when the film's part of the video ends.
function drawTitles(
    ctx: Ctx,
    text: VideoText,
    fonts: VideoFonts,
    t: number,
    at: number,
    filmEnd: number,
) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.direction = text.dir;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 2;

    // The names rise into the sky as on the invitation's cover, then leave the walk to the film.
    const names =
        clamp((t - text.namesAt + 0.2) / 0.7) *
        (1 - clamp((t - text.namesAt - NAMES_HOLD + 0.6) / 0.6));
    if (names > 0 && t < filmEnd) {
        ctx.globalAlpha = names;
        const rise = (1 - names) * 18;
        write(ctx, text.kicker.toUpperCase(), 92 + rise, `26px ${fonts.body}`, '#f6ead2', '10px');
        const big = Math.min(
            fit(ctx, text.one, fonts.script, 86, W * 0.84),
            fit(ctx, text.two, fonts.script, 86, W * 0.84),
        );
        write(ctx, text.one, 190 + rise, `${String(big)}px ${fonts.script}`, gold(ctx, 190, big));
        if (text.two) {
            write(ctx, text.and, 236 + rise, `${String(big * 0.42)}px ${fonts.script}`, '#f6ead2');
            write(
                ctx,
                text.two,
                318 + rise,
                `${String(big)}px ${fonts.script}`,
                gold(ctx, 318, big),
            );
        }
        write(ctx, text.date.toUpperCase(), 382 + rise, `22px ${fonts.body}`, '#f6ead2', '6px');
    }

    // The film's words, where and when the invitation shows them.
    if (t < filmEnd)
        for (const w of text.words) {
            const a = momentAlpha(
                {
                    from: w.from,
                    to: w.to,
                },
                at,
            );
            if (a <= 0 || !w.text) continue;
            ctx.globalAlpha = a;
            const looks = {
                kicker: {
                    size: W * 0.034,
                    family: fonts.body,
                    fill: '#e2bd6e',
                    spacing: '9px',
                    upper: true,
                },
                line: {
                    size: W * 0.064,
                    family: fonts.display,
                    fill: '#fff6e2',
                    spacing: '0px',
                    upper: false,
                },
                script: {
                    size: W * 0.12,
                    family: fonts.script,
                    fill: '',
                    spacing: '0px',
                    upper: false,
                },
            } as const;
            const look = looks[w.style];
            ctx.font = `${String(look.size)}px ${look.family}`;
            ctx.letterSpacing = look.spacing;
            const lines = wrap(ctx, look.upper ? w.text.toUpperCase() : w.text, w.zone.w * W);
            const lead = look.size * 1.2;
            const top =
                w.zone.y * H - ((lines.length - 1) * lead) / 2 + look.size * 0.35 + (1 - a) * 14;
            lines.forEach((line, k) => {
                const y = top + k * lead;
                ctx.fillStyle = look.fill || gold(ctx, y, look.size);
                ctx.fillText(line, w.zone.x * W, y);
            });
        }

    // The end card: the names, the day, the place, and where to open the invitation.
    const end = clamp((t - filmEnd) / 0.8);
    if (end > 0) {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.62 * end;
        ctx.fillStyle = '#05061a';
        ctx.fillRect(0, 0, W, H);
        ctx.shadowBlur = 18;
        ctx.globalAlpha = end;
        const pair = text.two ? `${text.one} ${text.and} ${text.two}` : text.one;
        const size = fit(ctx, pair, fonts.script, 92, W * 0.86);
        write(ctx, pair, 520, `${String(size)}px ${fonts.script}`, gold(ctx, 520, size));
        write(ctx, text.date.toUpperCase(), 610, `24px ${fonts.body}`, '#f6ead2', '6px');
        if (text.venue) write(ctx, text.venue, 656, `30px ${fonts.display}`, '#f6ead2');
        ctx.fillStyle = '#e2bd6e';
        ctx.fillRect(W / 2 - 40, 712, 80, 1.5);
        write(ctx, text.invite.toUpperCase(), 780, `22px ${fonts.body}`, '#e2bd6e', '7px');
        const linkSize = fit(ctx, text.link, fonts.display, 34, W * 0.9);
        write(ctx, text.link, 830, `${String(linkSize)}px ${fonts.display}`, '#fff6e2');
        ctx.globalAlpha = end * 0.7;
        write(ctx, text.credit, H - 64, `18px ${fonts.body}`, '#f6ead2', '3px');
    }
    ctx.restore();
}

// The layers' photos, decoded before the first frame is drawn.
async function photosOf(layers: FilmLayer[]) {
    const out = new Map<string, ImageBitmap>();
    const keys = [
        ...new Set(layers.flatMap((l) => (l.kind === 'photo' && l.photo ? [l.photo] : []))),
    ];
    await Promise.all(
        keys.map(async (key) => {
            const bitmap = await fetch(photoUrl(key))
                .then((r) => (r.ok ? r.blob() : null))
                .then((blob) => (blob ? createImageBitmap(blob) : null))
                .catch(() => null);
            if (bitmap) out.set(key, bitmap);
        }),
    );
    return out;
}

const GOLD = '#d9b36a';

// Photos, the monogram and ornaments where the invitation places them, and effects over all.
function drawLayers(
    ctx: Ctx,
    text: VideoText,
    fonts: VideoFonts,
    photos: Map<string, ImageBitmap>,
    at: number,
    clock: number,
) {
    for (const layer of text.layers) {
        const a = momentAlpha(layer, at);
        if (a <= 0) continue;
        if (layer.kind === 'effect') {
            drawEffect(ctx, layer.effect ?? 'petals', clock, W, H, a);
            continue;
        }
        const look = enterLook(layer.enter ?? 'fade', a);
        const pose = poseAt(layer, at);
        const w = pose.w * W;
        const aspect = layer.kind === 'photo' ? shapeAspect[layer.shape ?? 'arch'] : 1;
        const h = w / aspect;
        const cx = pose.x * W;
        const cy = pose.y * H + look.lift;
        ctx.save();
        ctx.globalAlpha = a * pose.opacity;
        if (look.blur > 0) ctx.filter = `blur(${String(look.blur)}px)`;
        ctx.translate(cx, cy);
        ctx.rotate((pose.rotate * Math.PI) / 180);
        ctx.scale(look.scale, look.scale);
        ctx.translate(-w / 2, -h / 2);
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = 24;
        if (layer.kind === 'photo') {
            const shape = layer.shape ?? 'arch';
            const outline = (inset: number) => {
                ctx.beginPath();
                if (shape === 'circle') ctx.arc(w / 2, h / 2, w / 2 - inset, 0, Math.PI * 2);
                else
                    ctx.roundRect(
                        inset,
                        inset,
                        w - inset * 2,
                        h - inset * 2,
                        shape === 'arch' ? [w / 2 - inset, w / 2 - inset, 8, 8] : 8,
                    );
            };
            outline(0);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 3;
            ctx.strokeStyle = GOLD;
            ctx.stroke();
            const picture = layer.photo ? photos.get(layer.photo) : undefined;
            if (picture) {
                const pad = w * 0.03;
                outline(pad);
                ctx.clip();
                // Cover the frame, cropping the photo's longer side.
                const scale = Math.max(
                    (w - pad * 2) / picture.width,
                    (h - pad * 2) / picture.height,
                );
                const pw = picture.width * scale;
                const ph = picture.height * scale;
                ctx.drawImage(picture, (w - pw) / 2, (h - ph) / 2, pw, ph);
            }
        } else if (layer.kind === 'monogram') {
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, w * 0.46, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = GOLD;
            ctx.lineWidth = w * 0.016;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, w * 0.41, 0, Math.PI * 2);
            ctx.lineWidth = w * 0.006;
            ctx.stroke();
            const letters = initialsOf(text.one, text.two);
            ctx.fillStyle = GOLD;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${String(w * (text.two ? 0.24 : 0.4))}px ${fonts.script}`;
            ctx.fillText(letters, w / 2, h / 2);
        } else if (layer.motif && layer.motif in motifs) {
            ctx.scale(w / 100, h / 100);
            ctx.fillStyle = GOLD;
            for (const d of motifs[layer.motif as MotifId]) ctx.fill(new Path2D(d), 'evenodd');
        }
        ctx.restore();
    }
}

// The best H.264 setting this device can encode, at the video's size.
async function encoderConfig(): Promise<VideoEncoderConfig | null> {
    for (const codec of ['avc1.640028', 'avc1.4d0028', 'avc1.42e028', 'avc1.42e01f']) {
        const config: VideoEncoderConfig = {
            codec,
            width: W,
            height: H,
            bitrate: 3_000_000,
            framerate: FPS,
            avc: { format: 'avc' },
        };
        const support = await VideoEncoder.isConfigSupported(config).catch(() => null);
        if (support?.supported) return config;
    }
    return null;
}

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

export async function makeFilmVideo(
    scenes: TimedScene[],
    text: VideoText,
    fonts: VideoFonts,
    onProgress: (share: number) => void,
    signal?: AbortSignal,
): Promise<Blob> {
    const config = await encoderConfig();
    if (!config) throw new Error('This device can’t make videos yet.');
    // The fonts the titles use, ready before the first frame is drawn.
    await Promise.all(
        [`86px ${fonts.script}`, `30px ${fonts.display}`, `24px ${fonts.body}`].map((font) =>
            document.fonts.load(font, `${text.one}${text.two}${text.date}`).catch(() => []),
        ),
    );

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('This device can’t make videos yet.');
    const loader = filmLoader(scenes, () => undefined, 6);
    const photos = await photosOf(text.layers);
    const length = timelineLength(scenes);
    const filmEnd = length + NAMES_HOLD;
    const total = Math.round(videoSeconds(scenes) * FPS);
    const column = {
        x: 0,
        y: 0,
        w: W,
        h: H,
    };

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
    try {
        for (let i = 0; i < total; i++) {
            if (signal?.aborted) throw new DOMException('Stopped', 'AbortError');
            if (out.error) throw out.error;
            const t = i / FPS;
            const at = filmTime(t, text.namesAt, length);
            await loader.ready(at);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            paintFilm(ctx, column, scenes, at, loader.pictures, false);
            if (t < filmEnd) drawLayers(ctx, text, fonts, photos, at, t);
            drawTitles(ctx, text, fonts, t, at, filmEnd);
            const frame = new VideoFrame(canvas, {
                timestamp: Math.round((i * 1e6) / FPS),
                duration: Math.round(1e6 / FPS),
            });
            encoder.encode(frame, { keyFrame: i % (FPS * 2) === 0 });
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
        loader.close();
        for (const bitmap of photos.values()) bitmap.close();
    }
    if (out.error) throw out.error;
    if (!out.avcC) throw new Error('The video couldn’t be finished. Please try again.');
    onProgress(1);
    const file = mp4({
        width: W,
        height: H,
        fps: FPS,
        avcC: out.avcC,
        samples: out.samples,
    });
    return new Blob([file.buffer as ArrayBuffer], { type: 'video/mp4' });
}
