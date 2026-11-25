import { brand } from '@shared/brand';
import { reservedSlugList } from '@shared/catalog';
import { policyPages, refundOpen } from '@shared/policies';
import { describe, expect, it } from 'vitest';

describe('policy pages', () => {
    it('no invitation can take a policy page’s address', () => {
        for (const { path } of policyPages) expect(reservedSlugList).toContain(path.slice(1));
    });

    it('shows one phone number, whichever way it is written', () => {
        expect(brand.phone.replaceAll(' ', '')).toBe(brand.whatsapp);
        expect(brand.whatsapp).toMatch(/^\+91[6-9]\d{9}$/);
    });
});

describe('refunds', () => {
    const paidAt = '2026-11-20T10:00:00.000Z';
    const facts = {
        paidAt,
        publishedAt: null,
        downloaded: false,
        now: Date.parse('2026-11-24T10:00:00.000Z'),
    };

    it('are open for a week after paying', () => {
        expect(refundOpen(facts)).toBe(true);
        expect(
            refundOpen({
                ...facts,
                now: Date.parse('2026-11-27T09:59:59.000Z'),
            }),
        ).toBe(true);
        expect(
            refundOpen({
                ...facts,
                now: Date.parse('2026-11-27T10:00:00.000Z'),
            }),
        ).toBe(false);
    });

    it('end once something is published or downloaded, and never start unpaid', () => {
        expect(
            refundOpen({
                ...facts,
                publishedAt: paidAt,
            }),
        ).toBe(false);
        expect(
            refundOpen({
                ...facts,
                downloaded: true,
            }),
        ).toBe(false);
        expect(
            refundOpen({
                ...facts,
                paidAt: null,
            }),
        ).toBe(false);
    });
});
