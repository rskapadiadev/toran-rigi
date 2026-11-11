import { fileURLToPath } from 'node:url';

import { cloudflare } from '@cloudflare/vite-plugin';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// PLATFORM picks the runtime adapter at build time; app code never branches on it.
const platform = process.env.PLATFORM === 'node' ? 'node' : 'cloudflare';
const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
        dedupe: ['react', 'react-dom'],
        alias: { '@platform-entry': here(`./server/entries/${platform}.ts`) },
    },
    plugins: [
        ...(platform === 'cloudflare' ? [cloudflare({ viteEnvironment: { name: 'ssr' } })] : []),
        paraglideVitePlugin({
            project: './project.inlang',
            outdir: './src/paraglide',
            strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
        }),
        tailwindcss(),
        tanstackStart(),
        viteReact(),
    ],
});
