// A small MP4 writer for one H.264 video track, with AAC sound if there is any: the file phones and
// WhatsApp play. Every frame is already in memory, so the file is written in one go with its index
// first (it plays at once). Boxes per ISO/IEC 14496-12 (ftyp, moov, mdat) and 14496-15 (avc1, avcC).

export interface Mp4Sample {
    data: Uint8Array;
    key: boolean;
}

export interface Mp4Track {
    width: number;
    height: number;
    fps: number;
    // The encoder's AVC decoder configuration record.
    avcC: Uint8Array;
    samples: Mp4Sample[];
    sound?: Mp4Sound;
}

export interface Mp4Sound {
    sampleRate: number;
    channels: number;
    // An AAC AudioSpecificConfig.
    config: Uint8Array;
    samples: Uint8Array[];
}

const text = new TextEncoder();

// Every AAC frame holds this many samples.
export const AAC_FRAME = 1024;

const u32 = (n: number) => {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, n >>> 0);
    return b;
};
const u16 = (n: number) => {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, n & 0xffff);
    return b;
};
const zeros = (n: number) => new Uint8Array(n);

function concat(parts: Uint8Array[]) {
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let at = 0;
    for (const p of parts) {
        out.set(p, at);
        at += p.length;
    }
    return out;
}

function box(type: string, ...parts: Uint8Array[]) {
    const body = concat(parts);
    return concat([u32(8 + body.length), text.encode(type), body]);
}

const full = (type: string, version: number, flags: number, ...parts: Uint8Array[]) =>
    box(type, u32(((version & 0xff) << 24) | (flags & 0xffffff)), ...parts);

// The identity transform, as the format writes it.
const matrix = concat([0x00010000, 0, 0, 0, 0x00010000, 0, 0, 0, 0x40000000].map(u32));

// MPEG-4 descriptors (14496-1): a tag, a length under 128, a body.
const descriptor = (tag: number, ...parts: Uint8Array[]) => {
    const body = concat(parts);
    return concat([new Uint8Array([tag, body.length]), body]);
};

// The sound's own track, at `offset` in the file.
function soundTrak(sound: Mp4Sound, offset: number, movieDuration: number) {
    const { sampleRate, channels, config, samples } = sound;
    const count = samples.length;
    const bytes = samples.reduce((n, s) => n + s.length, 0);
    const seconds = (count * AAC_FRAME) / sampleRate;
    const bitrate = Math.round((bytes * 8) / Math.max(0.001, seconds));
    const esds = full(
        'esds',
        0,
        0,
        descriptor(
            3,
            u16(2),
            zeros(1),
            descriptor(
                4,
                new Uint8Array([0x40, 0x15]),
                zeros(3),
                u32(bitrate),
                u32(bitrate),
                descriptor(5, config),
            ),
            descriptor(6, new Uint8Array([2])),
        ),
    );
    const mp4a = box(
        'mp4a',
        zeros(6),
        u16(1),
        zeros(8),
        u16(channels),
        u16(16),
        zeros(4),
        u32(sampleRate * 65536),
        esds,
    );
    const stbl = box(
        'stbl',
        full('stsd', 0, 0, u32(1), mp4a),
        full('stts', 0, 0, u32(1), u32(count), u32(AAC_FRAME)),
        full('stsc', 0, 0, u32(1), u32(1), u32(count), u32(1)),
        full('stsz', 0, 0, u32(0), u32(count), ...samples.map((s) => u32(s.length))),
        full('stco', 0, 0, u32(1), u32(offset)),
    );
    const minf = box(
        'minf',
        full('smhd', 0, 0, zeros(4)),
        box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))),
        stbl,
    );
    const mdia = box(
        'mdia',
        full(
            'mdhd',
            0,
            0,
            u32(0),
            u32(0),
            u32(sampleRate),
            u32(count * AAC_FRAME),
            u16(0x55c4),
            u16(0),
        ),
        full('hdlr', 0, 0, u32(0), text.encode('soun'), zeros(12), text.encode('Toran sound\0')),
        minf,
    );
    const tkhd = full(
        'tkhd',
        0,
        3,
        u32(0),
        u32(0),
        u32(2),
        u32(0),
        u32(movieDuration),
        zeros(8),
        u16(0),
        u16(0),
        u16(0x0100),
        u16(0),
        matrix,
        u32(0),
        u32(0),
    );
    return box('trak', tkhd, mdia);
}

function moov(track: Mp4Track, offset: number) {
    const { width, height, fps, avcC, samples, sound } = track;
    const count = samples.length;
    // Media time in thousandths of a frame; the movie's in milliseconds.
    const timescale = Math.round(fps * 1000);
    const delta = 1000;
    const mediaDuration = count * delta;
    const movieDuration = Math.round((count * 1000) / fps);
    const keys = samples.flatMap((s, i) => (s.key ? [i + 1] : []));

    const avc1 = box(
        'avc1',
        zeros(6),
        u16(1),
        zeros(16),
        u16(width),
        u16(height),
        u32(0x00480000),
        u32(0x00480000),
        u32(0),
        u16(1),
        zeros(32),
        u16(0x0018),
        u16(0xffff),
        box('avcC', avcC),
    );
    const stbl = box(
        'stbl',
        full('stsd', 0, 0, u32(1), avc1),
        full('stts', 0, 0, u32(1), u32(count), u32(delta)),
        full('stss', 0, 0, u32(keys.length), ...keys.map(u32)),
        full('stsc', 0, 0, u32(1), u32(1), u32(count), u32(1)),
        full('stsz', 0, 0, u32(0), u32(count), ...samples.map((s) => u32(s.data.length))),
        full('stco', 0, 0, u32(1), u32(offset)),
    );
    const minf = box(
        'minf',
        full('vmhd', 0, 1, zeros(8)),
        box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))),
        stbl,
    );
    const mdia = box(
        'mdia',
        full('mdhd', 0, 0, u32(0), u32(0), u32(timescale), u32(mediaDuration), u16(0x55c4), u16(0)),
        full('hdlr', 0, 0, u32(0), text.encode('vide'), zeros(12), text.encode('Toran video\0')),
        minf,
    );
    const tkhd = full(
        'tkhd',
        0,
        3,
        u32(0),
        u32(0),
        u32(1),
        u32(0),
        u32(movieDuration),
        zeros(8),
        zeros(8),
        matrix,
        u32(width * 65536),
        u32(height * 65536),
    );
    const mvhd = full(
        'mvhd',
        0,
        0,
        u32(0),
        u32(0),
        u32(1000),
        u32(movieDuration),
        u32(0x00010000),
        u16(0x0100),
        zeros(10),
        matrix,
        zeros(24),
        u32(3),
    );
    const pictures = samples.reduce((n, x) => n + x.data.length, 0);
    return box(
        'moov',
        mvhd,
        box('trak', tkhd, mdia),
        ...(sound ? [soundTrak(sound, offset + pictures, movieDuration)] : []),
    );
}

export function mp4(track: Mp4Track): Uint8Array {
    const ftyp = box(
        'ftyp',
        text.encode('isom'),
        u32(512),
        text.encode('isom'),
        text.encode('iso2'),
        text.encode('avc1'),
        text.encode('mp41'),
    );
    // The index's size doesn't depend on where the frames start, so measure it, then place them.
    const offset = ftyp.length + moov(track, 0).length + 8;
    // The pictures, then the sound.
    const frames = concat([...track.samples.map((s) => s.data), ...(track.sound?.samples ?? [])]);
    return concat([ftyp, moov(track, offset), u32(8 + frames.length), text.encode('mdat'), frames]);
}
