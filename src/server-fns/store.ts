import { createServerFn } from '@tanstack/react-start';

import { shopWhereabouts } from '../../server/lib/whereabouts';
import { getPlatform } from '../../server/platform/context';
import { listStoreTemplates } from '../../server/repos/store';

// The shop's catalogue, rendered on the server so the landing and collections pages are indexable.
// Priced in the visitor's currency (country from Cloudflare, or the switcher's choice).
export const fetchCatalogue = createServerFn({ method: 'GET' }).handler(async () => {
    const { currency, rates } = await shopWhereabouts();
    return {
        currency,
        // Link previews need full addresses.
        origin: getPlatform().config.APP_ORIGIN,
        templates: await listStoreTemplates(currency, rates),
    };
});

// For the canonical link and preview card of pages with nothing else to load.
export const fetchOrigin = createServerFn({ method: 'GET' }).handler(() => {
    const { APP_ORIGIN } = getPlatform().config;
    return { origin: APP_ORIGIN };
});
