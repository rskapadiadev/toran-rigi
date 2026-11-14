// Module types the Cloudflare Vite plugin bundles for Workers (server/og/assets.cloudflare.ts).
declare module '*.bin' {
    const buffer: ArrayBuffer;
    export default buffer;
}

declare module '*.wasm?module' {
    const module: WebAssembly.Module;
    export default module;
}
