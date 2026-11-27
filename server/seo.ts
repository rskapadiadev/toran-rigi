// What search engines are told: which pages to list, and where not to look.
import { guideDesigns, guides } from '@shared/guides';
import { policyPages } from '@shared/policies';
import { Hono } from 'hono';

import type { AppEnv } from './app';
import { listStoreTemplates } from './repos/store';

export const seo = new Hono<AppEnv>();

const DAY = 'public, max-age=86400';

seo.get('/robots.txt', (c) => {
    const { APP_ORIGIN, ENVIRONMENT } = c.env.config;
    // Private pages (drafts, customers' invitations, the studio) carry noindex, which a crawler can
    // only read if it may open them.
    const rules =
        ENVIRONMENT === 'production'
            ? `User-agent: *\nDisallow: /api/\n\nSitemap: ${APP_ORIGIN}/sitemap.xml\n`
            : 'User-agent: *\nDisallow: /\n';
    return c.text(rules, 200, { 'cache-control': DAY });
});

seo.get('/sitemap.xml', async (c) => {
    const designs = await listStoreTemplates('INR', null);
    const pages = [
        '/',
        '/collections',
        '/invitations',
        '/wording',
        '/made-for-you',
        '/about',
        '/help',
        ...guides
            .filter((g) => guideDesigns(g, designs).own.length > 0)
            .map((g) => `/invitations/${g.slug}`),
        ...guides.map((g) => `/wording/${g.slug}`),
        ...policyPages.map((p) => p.path),
    ];
    const origin = c.env.config.APP_ORIGIN.replace(/\/$/, '');
    const urls = pages.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n');
    return c.body(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
        200,
        {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': DAY,
        },
    );
});
