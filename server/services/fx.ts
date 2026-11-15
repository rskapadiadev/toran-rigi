// US-dollar exchange rates for the shop, from open.er-api.com (free, no key). A snapshot is stored
// in settings and reused, so prices stay put; it is refreshed when the studio asks, or fetched
// once when none exists yet. Only the currency list is requested: nothing about visitors is sent.
import type { RateSnapshot } from '@shared/fx';

import { getSetting, setSetting } from '../repos/settings';

const KEY = 'fx.usd';
const SOURCE = 'https://open.er-api.com/v6/latest/USD';

interface ErApiResponse {
    result?: string;
    time_last_update_utc?: string;
    rates?: Record<string, number>;
}

export async function refreshUsdRates(): Promise<RateSnapshot> {
    const res = await fetch(SOURCE, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`Exchange rates unavailable (${String(res.status)})`);
    const body: ErApiResponse = await res.json();
    if (body.result !== 'success' || !body.rates) throw new Error('Exchange rates unavailable');
    const snapshot: RateSnapshot = {
        updatedAt: body.time_last_update_utc
            ? new Date(body.time_last_update_utc).toISOString()
            : new Date().toISOString(),
        rates: body.rates,
    };
    await setSetting(KEY, snapshot);
    return snapshot;
}

// The stored snapshot; the first call ever fetches one. Null when offline and nothing is stored,
// in which case visitors outside India simply see US dollars.
export async function usdRates(): Promise<RateSnapshot | null> {
    const stored = await getSetting<RateSnapshot>(KEY);
    if (stored) return stored;
    try {
        return await refreshUsdRates();
    } catch (error) {
        console.error('[fx]', error);
        return null;
    }
}
