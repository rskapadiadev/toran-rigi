import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import appCss from '../styles/app.css?url';

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1, viewport-fit=cover',
            },
            { title: 'Toran — The doorway to every celebration' },
        ],
        links: [
            {
                rel: 'stylesheet',
                href: appCss,
            },
            {
                rel: 'icon',
                type: 'image/svg+xml',
                href: '/favicon.svg',
            },
        ],
    }),
    component: () => <Outlet />,
    shellComponent: RootDocument,
});

// Runs before any picture loads: a browser that can't show AVIF (iOS 15 and older) gets the WebP
// that always sits beside it. Error events don't bubble, so this listens while they travel down.
const avifFallback = String.raw`document.addEventListener('error',function(e){var t=e.target,s=t&&t.tagName==='IMG'&&t.getAttribute('src');if(s&&/^\/kits\/.+\.avif$/.test(s))t.setAttribute('src',s.slice(0,-5)+'.webp')},true)`;
const fallbackScript = { __html: avifFallback };

function RootDocument({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <script dangerouslySetInnerHTML={fallbackScript} />
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}
