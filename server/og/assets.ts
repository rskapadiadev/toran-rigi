// Contract for the build-time `@og-assets` alias (vite.config.ts picks the platform's implementation).
export interface OgAssets {
    wasm: WebAssembly.Module | Uint8Array;
    fonts: Uint8Array[];
}
