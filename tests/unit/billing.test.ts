import { describe, expect, it } from 'vitest';

import { advanceFor, ageingBucket, computeInvoice } from '../../shared/billing';

const base = {
    paid: 0,
    credited: 0,
    taxBps: 0,
    taxInclusive: true,
    dueDate: '2026-11-20',
    today: '2026-11-11',
};

describe('computeInvoice', () => {
    it('sums package and add-ons in minor units', () => {
        const r = computeInvoice({
            ...base,
            items: [
                {
                    kind: 'package',
                    qty: 1,
                    unitPrice: 199900,
                },
                {
                    kind: 'addon',
                    qty: 1,
                    unitPrice: 29900,
                },
                {
                    kind: 'addon',
                    qty: 1,
                    unitPrice: 100000,
                },
            ],
        });
        expect(r.total).toBe(329800);
        expect(r.balanceDue).toBe(329800);
        expect(r.status).toBe('issued');
    });

    it('tracks partial payment then paid', () => {
        const items = [
            {
                kind: 'package' as const,
                qty: 1,
                unitPrice: 79900,
            },
        ];
        expect(
            computeInvoice({
                ...base,
                items,
                paid: 40000,
            }).status,
        ).toBe('partially_paid');
        const paid = computeInvoice({
            ...base,
            items,
            paid: 79900,
        });
        expect(paid.status).toBe('paid');
        expect(paid.balanceDue).toBe(0);
    });

    it('applies discounts and never goes negative', () => {
        const r = computeInvoice({
            ...base,
            items: [
                {
                    kind: 'package',
                    qty: 1,
                    unitPrice: 50000,
                },
                {
                    kind: 'discount',
                    qty: 1,
                    unitPrice: 90000,
                },
            ],
        });
        expect(r.discount).toBe(50000);
        expect(r.total).toBe(0);
    });

    it('carves inclusive GST out of the price and adds exclusive GST on top', () => {
        const items = [
            {
                kind: 'package' as const,
                qty: 1,
                unitPrice: 118000,
            },
        ];
        const inclusive = computeInvoice({
            ...base,
            items,
            taxBps: 1800,
        });
        expect(inclusive.total).toBe(118000);
        expect(inclusive.taxAmount).toBe(18000);
        const exclusive = computeInvoice({
            ...base,
            items,
            taxBps: 1800,
            taxInclusive: false,
        });
        expect(exclusive.total).toBe(139240);
    });

    it('marks unpaid invoices overdue after the due date, and refunds/credits reduce balance', () => {
        const items = [
            {
                kind: 'package' as const,
                qty: 1,
                unitPrice: 100000,
            },
        ];
        expect(
            computeInvoice({
                ...base,
                items,
                today: '2026-11-21',
            }).status,
        ).toBe('overdue');
        expect(
            computeInvoice({
                ...base,
                items,
                paid: 60000,
                credited: 40000,
            }).status,
        ).toBe('paid');
    });
});

describe('advance and ageing', () => {
    it('Signature pays 100% upfront, others 50% (rounded up)', () => {
        expect(advanceFor('signature', 79900)).toBe(79900);
        expect(advanceFor('premium', 499901)).toBe(249951);
    });

    it('buckets overdue days', () => {
        expect(ageingBucket('2026-11-20', '2026-11-11')).toBe('current');
        expect(ageingBucket('2026-11-01', '2026-11-05')).toBe('0-7');
        expect(ageingBucket('2026-10-15', '2026-11-05')).toBe('8-30');
        expect(ageingBucket('2026-09-01', '2026-11-05')).toBe('30+');
    });
});
