import { z } from 'zod';

import { BOARD_LIMITS } from '../board';

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);

// A stock photo's licence, shown small on the board as Creative Commons asks.
const credit = z.object({
    title: z.string().max(200).optional(),
    author: z.string().max(200).optional(),
    license: z.string().max(80),
    url: z.url().max(600).optional(),
});

export const boardPin = z.object({
    // Their own upload (private, under boards/) or an imported stock photo (public/stock/).
    key: z
        .string()
        .max(300)
        .regex(/^(boards|public\/stock)\/[\w./-]+$/),
    credit: credit.optional(),
});
export type BoardPin = z.infer<typeof boardPin>;

export const boardInput = z.object({
    theme: z.string().trim().max(80).default(''),
    palette: z.array(hex).max(BOARD_LIMITS.palette).default([]),
    // Flowers, fabrics, lights, food: short words a decorator can act on.
    words: z.array(z.string().trim().min(1).max(40)).max(BOARD_LIMITS.words).default([]),
    notes: z.string().trim().max(1500).default(''),
    pins: z.array(boardPin).max(BOARD_LIMITS.pins).default([]),
});
export type BoardInput = z.infer<typeof boardInput>;
