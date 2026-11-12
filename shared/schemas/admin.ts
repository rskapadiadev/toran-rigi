import { z } from 'zod';

import { cultureIds } from '../cultures';
import { currencies } from '../money';
import { occasionIds } from '../occasions';
import { orderStatuses } from '../types';

export const emailInput = z.object({ email: z.email().max(200) });
export const verifyInput = z.object({
    email: z.email().max(200),
    code: z.string().regex(/^\d{6}$/),
});

export const createOrderInput = z.object({
    customer: z.object({
        name: z.string().trim().min(1).max(120),
        email: z.email().max(200).optional().or(z.literal('')),
        phone: z.string().trim().max(32).optional(),
        country: z.string().length(2).default('IN'),
        city: z.string().max(80).optional(),
    }),
    packageCode: z.string().min(1).max(40),
    addons: z.array(z.string().max(40)).max(20).default([]),
    currency: z.enum(currencies),
    occasion: z.enum(occasionIds).default('wedding'),
    culture: z.enum(cultureIds),
    // Date of the main event (column kept as wedding_date for compatibility).
    weddingDate: z.iso.date().optional().or(z.literal('')),
    couponCode: z.string().max(40).optional(),
    notes: z.string().max(2000).optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderInput>;

export const updateStatusInput = z.object({
    status: z.enum(orderStatuses),
    note: z.string().max(1000).optional(),
});

export const noteInput = z.object({ body: z.string().trim().min(1).max(4000) });

export const recordPaymentInput = z.object({
    amount: z.number().int().positive(),
    method: z.enum(['upi', 'cash', 'bank', 'card', 'online']),
    reference: z.string().max(120).optional(),
    paidAt: z.iso.date().optional(),
});

export const invoiceItemInput = z.object({
    kind: z.enum(['extra', 'addon', 'discount']),
    description: z.string().trim().min(1).max(200),
    qty: z.number().int().min(1).max(100).default(1),
    unitPrice: z.number().int().positive(),
});
