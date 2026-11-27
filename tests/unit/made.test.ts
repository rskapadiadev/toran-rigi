import {
    canPublishMade,
    isMade,
    MADE_CODE,
    madePrice,
    madeStage,
    roundsLeft,
    studioHasIt,
} from '@shared/made';
import { emptyBrief, missingFromBrief } from '@shared/schemas/made';
import { orderStatuses } from '@shared/types';
import { describe, expect, it } from 'vitest';

import { briefUpload } from '../../server/lib/brief-files';

describe('done-for-you', () => {
    it('costs ₹1,999 in India and $69 elsewhere', () => {
        expect(madePrice('INR')).toBe(199900);
        expect(madePrice('USD')).toBe(6900);
        expect(isMade(['photo_wall', MADE_CODE])).toBe(true);
        expect(isMade([])).toBe(false);
    });

    it('never lets the customer and the studio edit at once', () => {
        for (const status of orderStatuses) {
            const stage = madeStage(status);
            // Whoever has it, nobody publishes before the customer has seen it.
            if (studioHasIt(stage)) expect(canPublishMade(stage)).toBe(false);
        }
        expect(madeStage('ready_to_start')).toBe('making');
        expect(madeStage('revision_requested')).toBe('changes');
        expect(madeStage('preview_shared')).toBe('look');
        expect(madeStage('payment_received')).toBe('details');
        expect(canPublishMade('details')).toBe(false);
        expect(canPublishMade('look')).toBe(true);
    });

    it('counts two rounds of changes, and never below none', () => {
        expect(roundsLeft(0)).toBe(2);
        expect(roundsLeft(2)).toBe(0);
        expect(roundsLeft(5)).toBe(0);
    });

    it('needs the names, and the ceremonies or a file that shows them', () => {
        expect(missingFromBrief(emptyBrief, 3)).toMatch(/names/);
        const named = {
            ...emptyBrief,
            names: 'Riya & Kabir',
        };
        expect(missingFromBrief(named, 0)).toMatch(/ceremonies/);
        expect(missingFromBrief(named, 1)).toBeNull();
        expect(
            missingFromBrief(
                {
                    ...named,
                    functions: 'Wedding, 23 Jan, Udaipur',
                },
                0,
            ),
        ).toBeNull();
    });

    it('takes photos, PDFs and songs, and nothing that could run as a page', async () => {
        const photo = await briefUpload(new File(['x'], 'card.jpg', { type: 'image/jpeg' }));
        expect(typeof photo).toBe('object');
        const iphone = await briefUpload(new File(['x'], 'IMG_1.HEIC', { type: '' }));
        expect(typeof iphone === 'object' && iphone.mime).toBe('image/heic');
        for (const [name, type] of [
            ['page.html', 'text/html'],
            ['logo.svg', 'image/svg+xml'],
            ['run.js', 'text/javascript'],
        ] as const)
            expect(typeof (await briefUpload(new File(['x'], name, { type })))).toBe('string');
        expect(await briefUpload(new File([], 'empty.pdf', { type: 'application/pdf' }))).toMatch(
            /empty/,
        );
        const odd = await briefUpload(
            new File(['x'], '../../etc/<script>.pdf', { type: 'application/pdf' }),
        );
        expect(typeof odd === 'object' && odd.name).not.toMatch(/[/<>]/);
    });
});
