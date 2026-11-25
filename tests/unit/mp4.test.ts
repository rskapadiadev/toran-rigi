import { describe, expect, it } from 'vitest';

import { mp4 } from '../../src/invitation/film/mp4';

interface Box {
    type: string;
    start: number;
    size: number;
}

const view = (b: Uint8Array) => new DataView(b.buffer, b.byteOffset, b.byteLength);
const name = (b: Uint8Array, at: number) => String.fromCharCode(...b.subarray(at + 4, at + 8));

// The boxes directly inside a span of the file.
function boxes(b: Uint8Array, from: number, to: number): Box[] {
    const out: Box[] = [];
    for (let at = from; at < to;) {
        const size = view(b).getUint32(at);
        out.push({
            type: name(b, at),
            start: at,
            size,
        });
        if (size < 8) break;
        at += size;
    }
    return out;
}

// Finds a box by its path, e.g. ['moov', 'trak', 'mdia'] (full boxes skip their 4-byte header).
const fullBoxes = new Set(['stsd', 'dref']);
const skip: Record<string, number> = {
    avc1: 78,
    stsd: 8,
    dref: 8,
};
function find(b: Uint8Array, path: string[]): Box | undefined {
    let span = {
        from: 0,
        to: b.length,
    };
    let found: Box | undefined;
    for (const type of path) {
        found = boxes(b, span.from, span.to).find((x) => x.type === type);
        if (!found) return undefined;
        const header = 8 + (skip[type] ?? (fullBoxes.has(type) ? 4 : 0));
        span = {
            from: found.start + header,
            to: found.start + found.size,
        };
    }
    return found;
}

const sample = (n: number, fill: number) => new Uint8Array(n).fill(fill);
const track = {
    width: 720,
    height: 1280,
    fps: 30,
    avcC: new Uint8Array([1, 0x64, 0, 0x28, 0xff, 0xe1, 0, 0]),
    samples: [
        {
            data: sample(100, 1),
            key: true,
        },
        {
            data: sample(40, 2),
            key: false,
        },
        {
            data: sample(60, 3),
            key: false,
        },
    ],
};

describe('mp4', () => {
    const file = mp4(track);

    it('writes ftyp, then the index, then the frames', () => {
        expect(boxes(file, 0, file.length).map((x) => x.type)).toEqual(['ftyp', 'moov', 'mdat']);
    });

    it('points the index at the first frame and lists every frame', () => {
        const stbl = ['moov', 'trak', 'mdia', 'minf', 'stbl'];
        const stco = find(file, [...stbl, 'stco']);
        const stsz = find(file, [...stbl, 'stsz']);
        if (!stco || !stsz) throw new Error('missing index');
        const offset = view(file).getUint32(stco.start + 16);
        expect(Array.from(file.subarray(offset, offset + 100))).toEqual(Array(100).fill(1));
        expect(file[offset + 100]).toBe(2);
        expect(file[offset + 140]).toBe(3);
        expect(view(file).getUint32(stsz.start + 16)).toBe(3);
        expect(view(file).getUint32(stsz.start + 20)).toBe(100);
    });

    it('marks only key frames as sync samples', () => {
        const stss = find(file, ['moov', 'trak', 'mdia', 'minf', 'stbl', 'stss']);
        if (!stss) throw new Error('missing stss');
        expect(view(file).getUint32(stss.start + 12)).toBe(1);
        expect(view(file).getUint32(stss.start + 16)).toBe(1);
    });

    it('carries the decoder configuration and the frame size', () => {
        const avcC = find(file, ['moov', 'trak', 'mdia', 'minf', 'stbl', 'stsd', 'avc1', 'avcC']);
        if (!avcC) throw new Error('missing avcC');
        expect(Array.from(file.subarray(avcC.start + 8, avcC.start + avcC.size))).toEqual(
            Array.from(track.avcC),
        );
        const tkhd = find(file, ['moov', 'trak', 'tkhd']);
        if (!tkhd) throw new Error('missing tkhd');
        expect(view(file).getUint32(tkhd.start + 84) / 65536).toBe(720);
        expect(view(file).getUint32(tkhd.start + 88) / 65536).toBe(1280);
    });

    it('lasts as long as its frames: 3 frames at 30 fps is 100 ms', () => {
        const mvhd = find(file, ['moov', 'mvhd']);
        if (!mvhd) throw new Error('missing mvhd');
        expect(view(file).getUint32(mvhd.start + 24)).toBe(100);
    });
});

describe('mp4 with sound', () => {
    const sound = {
        sampleRate: 48_000,
        channels: 2,
        config: new Uint8Array([0x11, 0x90]),
        samples: [sample(30, 7), sample(20, 8)],
    };
    const file = mp4({
        ...track,
        sound,
    });
    const moov = find(file, ['moov']);
    if (!moov) throw new Error('missing index');
    const traks = boxes(file, moov.start + 8, moov.start + moov.size).filter(
        (x) => x.type === 'trak',
    );
    const trak = traks[1];
    if (!trak) throw new Error('missing sound');
    const inner = file.subarray(trak.start, trak.start + trak.size);
    const stbl = ['trak', 'mdia', 'minf', 'stbl'];

    it('adds a second track, and only when there is sound', () => {
        expect(traks).toHaveLength(2);
        expect(find(inner, ['trak', 'mdia', 'minf', 'smhd'])).toBeDefined();
        expect(Array.from(mp4(track)).join()).not.toContain(
            Array.from(new TextEncoder().encode('mp4a')).join(),
        );
    });

    it('points at the sound after the pictures', () => {
        const stco = find(inner, [...stbl, 'stco']);
        if (!stco) throw new Error('missing index');
        const at = view(inner).getUint32(stco.start + 16);
        expect(Array.from(file.subarray(at, at + 30))).toEqual(Array(30).fill(7));
        expect(file.length).toBe(at + 50);
    });

    it('carries the decoder its configuration', () => {
        // The specific-info descriptor: tag 5, two bytes, the configuration.
        expect(Array.from(inner).join()).toContain([5, 2, 0x11, 0x90].join());
    });

    it('lasts as long as its frames', () => {
        const mdhd = find(inner, ['trak', 'mdia', 'mdhd']);
        if (!mdhd) throw new Error('missing header');
        expect(view(inner).getUint32(mdhd.start + 20)).toBe(48_000);
        expect(view(inner).getUint32(mdhd.start + 24)).toBe(2048);
    });
});
