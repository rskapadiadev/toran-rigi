import { createServerFn } from '@tanstack/react-start';
import { getCookie, getRequestHeader } from '@tanstack/react-start/server';

import { listStoreTemplates, shopCurrency } from '../../server/repos/store';

// The shop's catalogue, rendered on the server so the landing and collections pages are indexable.
// Priced in the visitor's currency (country from Cloudflare, or the switcher's choice).
export const fetchCatalogue = createServerFn({ method: 'GET' }).handler(async () => {
    const country = getRequestHeader('cf-ipcountry');
    const known = country && country !== 'XX' && country !== 'T1' ? country : null;
    const { currency, rates } = await shopCurrency(known, getCookie('toran_currency'));
    return {
        currency,
        templates: await listStoreTemplates(currency, rates),
    };
});
