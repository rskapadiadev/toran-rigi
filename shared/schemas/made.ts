import { z } from 'zod';

import type { MadeStage } from '../made';

// Everything the studio needs to build an invitation; a photo of the printed card can stand in for
// most of it.
export const briefInput = z.object({
    names: z.string().trim().max(300).default(''),
    families: z.string().trim().max(2000).default(''),
    functions: z.string().trim().max(4000).default(''),
    words: z.string().trim().max(4000).default(''),
    languages: z.string().trim().max(200).default(''),
    notes: z.string().trim().max(4000).default(''),
});
export type Brief = z.infer<typeof briefInput>;

export const emptyBrief: Brief = {
    names: '',
    families: '',
    functions: '',
    words: '',
    languages: '',
    notes: '',
};

// Names, and either the ceremonies or a file that shows them.
export function missingFromBrief(brief: Brief, files: number): string | null {
    if (!brief.names) return 'Add the names as they should be written';
    if (!brief.functions && files === 0)
        return 'Add the ceremonies, or a photo of your printed card';
    return null;
}

const changesText = z.string().trim().min(3, 'Tell us what to change').max(4000);
export const changesInput = z.object({ text: changesText });

// A first look or a question may go without a word of its own.
const studioText = z.string().trim().max(2000).default('');
export const studioMessageInput = z.object({ text: studioText });

export interface BriefFile {
    id: string;
    name: string;
    kind: string;
    mime: string;
    size: number;
}

export interface MadeMessage {
    id: string;
    from: 'customer' | 'studio';
    text: string;
    at: string;
}

export interface MadeView {
    orderId: string;
    made: boolean;
    // The add-on has been paid for, so its work can start.
    paid: boolean;
    stage: MadeStage;
    brief: Brief;
    files: BriefFile[];
    messages: MadeMessage[];
    // When the first look is due, once everything has arrived.
    dueAt: string | null;
    roundsLeft: number;
    balance: number;
    currency: string;
    previewToken: string | null;
    slug: string | null;
    live: boolean;
}

// What the customer's page is told on top: what adding it would cost, and whether they can pay here.
export interface MyMadeView extends MadeView {
    price: number | null;
    payments: 'razorpay' | 'fake' | 'off';
}
