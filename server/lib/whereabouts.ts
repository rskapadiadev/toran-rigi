import { getCookie, getRequestHeader } from '@tanstack/react-start/server';

import { shopCurrency } from '../repos/store';

// Where the visitor of a page is (Cloudflare's country stamp, or the switcher's choice) and the
// currency they see.
export async function shopWhereabouts() {
    const country = getRequestHeader('cf-ipcountry');
    const known = country && country !== 'XX' && country !== 'T1' ? country : null;
    return shopCurrency(known, getCookie('toran_currency'));
}
