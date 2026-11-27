import { madePrice } from '@shared/made';
import { createServerFn } from '@tanstack/react-start';

import { shopWhereabouts } from '../../server/lib/whereabouts';
import { getPlatform } from '../../server/platform/context';
import { paymentMode } from '../../server/services/payments';

// The done-for-you page: its price where the visitor is, and whether it can be bought online yet.
export const fetchMadeOffer = createServerFn({ method: 'GET' }).handler(async () => {
    const { currency, rates } = await shopWhereabouts();
    const { config } = getPlatform();
    return {
        origin: config.APP_ORIGIN,
        currency,
        price: madePrice(currency, rates),
        online: paymentMode(config) !== 'off',
    };
});
