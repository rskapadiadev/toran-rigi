// Photos picked while trying a template live only in this tab ("blob:" keys). These helpers drop or
// swap those keys wherever they sit in the invitation's content.

type Json = unknown;

// Walks the value; each "blob:" string is replaced by fn's result, or removed when fn gives undefined.
export function mapLocalPhotos<T>(value: T, fn: (url: string) => string | undefined): T {
    const walk = (v: Json): Json => {
        if (typeof v === 'string') return v.startsWith('blob:') ? fn(v) : v;
        if (Array.isArray(v)) return v.map(walk).filter((x) => x !== undefined);
        if (v && typeof v === 'object')
            return Object.fromEntries(
                Object.entries(v)
                    .map(([k, x]) => [k, walk(x)] as const)
                    .filter(([, x]) => x !== undefined),
            );
        return v;
    };
    return walk(value) as T;
}

export const withoutLocalPhotos = <T>(value: T): T => mapLocalPhotos(value, () => undefined);

export function localPhotos(value: unknown): string[] {
    const found = new Set<string>();
    mapLocalPhotos(value, (url) => {
        found.add(url);
        return url;
    });
    return [...found];
}
