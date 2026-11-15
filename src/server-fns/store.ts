import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';

import { listStoreTemplates } from '../../server/repos/store';

// The shop's catalogue, rendered on the server so the landing and collections pages are indexable.
export const fetchCatalogue = createServerFn({ method: 'GET' }).handler(async () => {
    const currency = getRequestHeader('cf-ipcountry') === 'AE' ? 'AED' : 'INR';
    return {
        currency,
        templates: await listStoreTemplates(currency),
    };
});
