import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';

// The visitor's country for the login crown's ordering, from Cloudflare's cf-ipcountry stamp.
// Returned to the page only, never stored. Without it (local dev, other hosts) the page falls back
// to the device's time zone.
export const fetchRegion = createServerFn({ method: 'GET' }).handler(() => {
    const ip = getRequestHeader('cf-ipcountry') ?? getRequestHeader('x-country');
    // Cloudflare uses XX for unknown and T1 for Tor.
    return { country: ip && ip !== 'XX' && ip !== 'T1' ? ip : null };
});
