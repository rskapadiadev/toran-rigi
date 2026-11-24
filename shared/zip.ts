// A plain zip of files that are already compressed (pictures, PDFs): stored, not deflated.

export interface ZipFile {
    name: string;
    data: Uint8Array;
}

const table = Uint32Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});

export function crc32(data: Uint8Array): number {
    let c = 0xffffffff;
    for (const byte of data) c = (table[(c ^ byte) & 0xff] ?? 0) ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

// Two files with one name would overwrite each other when unpacked.
function uniqueNames(files: readonly ZipFile[]): string[] {
    const seen = new Map<string, number>();
    return files.map(({ name }) => {
        const n = (seen.get(name) ?? 0) + 1;
        seen.set(name, n);
        return n === 1 ? name : name.replace(/(\.[^.]+)?$/, `-${String(n)}$1`);
    });
}

export function zipStore(files: readonly ZipFile[]): Uint8Array<ArrayBuffer> {
    const encoder = new TextEncoder();
    const names = uniqueNames(files).map((n) => encoder.encode(n));
    const parts = files.map((f, i) => ({
        name: names[i] ?? new Uint8Array(),
        data: f.data,
        crc: crc32(f.data),
    }));
    const size =
        parts.reduce((sum, p) => sum + 30 + 46 + p.name.length * 2 + p.data.length, 0) + 22;
    const out = new Uint8Array(size);
    const view = new DataView(out.buffer);
    let at = 0;
    const u16 = (v: number) => {
        view.setUint16(at, v, true);
        at += 2;
    };
    const u32 = (v: number) => {
        view.setUint32(at, v, true);
        at += 4;
    };
    const bytes = (b: Uint8Array) => {
        out.set(b, at);
        at += b.length;
    };
    // Version, UTF-8 names, stored, no date, then the checksum and sizes both headers share.
    const common = (p: (typeof parts)[number]) => {
        u16(20);
        u16(0x0800);
        u16(0);
        u16(0);
        u16(0x21);
        u32(p.crc);
        u32(p.data.length);
        u32(p.data.length);
        u16(p.name.length);
        u16(0);
    };
    const offsets: number[] = [];
    for (const p of parts) {
        offsets.push(at);
        u32(0x04034b50);
        common(p);
        bytes(p.name);
        bytes(p.data);
    }
    const directory = at;
    for (const [i, p] of parts.entries()) {
        u32(0x02014b50);
        u16(20);
        common(p);
        u16(0);
        u16(0);
        u16(0);
        u32(0);
        u32(offsets[i] ?? 0);
        bytes(p.name);
    }
    const length = at - directory;
    u32(0x06054b50);
    u16(0);
    u16(0);
    u16(parts.length);
    u16(parts.length);
    u32(length);
    u32(directory);
    u16(0);
    return out;
}
