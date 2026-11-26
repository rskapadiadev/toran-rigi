// "We make it for you": the studio builds the invitation from what the customer sends. A paid extra
// on top of the design, kept on the order's add-ons.
import type { RateSnapshot } from './fx';
import { shopPrice } from './pricing';
import type { OrderStatus } from './types';

export const MADE_CODE = 'made_for_you';
export const MADE_NAME = 'We make it for you';

export const MADE_PRICE = {
    INR: 199900,
    USD: 6900,
} as const;

// The first look comes this soon after everything needed has arrived…
export const MADE_HOURS = 48;
// …and this many rounds of changes are included.
export const MADE_ROUNDS = 2;

export const isMade = (addons: readonly string[]): boolean => addons.includes(MADE_CODE);

export const madePrice = (currency: string, rates: RateSnapshot | null = null): number | null =>
    shopPrice(MADE_PRICE, null, currency, rates)?.price ?? null;

export const roundsLeft = (used: number): number => Math.max(0, MADE_ROUNDS - used);

// Where the work stands, in the customer's terms.
//   details: waiting for what they send   making: the studio has it
//   look: theirs to look at               changes: the studio is changing it
//   done: published or closed
export type MadeStage = 'details' | 'making' | 'look' | 'changes' | 'done';

const stages: Partial<Record<OrderStatus, MadeStage>> = {
    ready_to_start: 'making',
    design_in_progress: 'making',
    preview_shared: 'look',
    awaiting_approval: 'look',
    awaiting_final_payment: 'look',
    revision_requested: 'changes',
    published: 'done',
    completed: 'done',
    cancelled: 'done',
};

export const madeStage = (status: OrderStatus): MadeStage => stages[status] ?? 'details';

// Two people must never edit one invitation at once: while the studio has it, the customer waits.
export const studioHasIt = (stage: MadeStage): boolean => stage === 'making' || stage === 'changes';

// Nothing goes to guests before the customer has seen it.
export const canPublishMade = (stage: MadeStage): boolean => stage === 'look' || stage === 'done';

// ── What the customer sends ─────────────────────────────────────────────────

export const briefFileMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/heic',
    'image/heif',
    'application/pdf',
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a',
] as const;
export type BriefFileMime = (typeof briefFileMimes)[number];

export const BRIEF_FILE_MAX_BYTES = 20 * 1024 * 1024;
export const BRIEF_FILES_MAX = 60;

export const isBriefFileMime = (type: string): type is BriefFileMime =>
    (briefFileMimes as readonly string[]).includes(type);

export const briefFileKind = (mime: BriefFileMime) =>
    mime.startsWith('image/')
        ? ('photo' as const)
        : mime.startsWith('audio/')
          ? ('music' as const)
          : ('document' as const);

// Not under public/: only the customer and the studio can open these.
export const briefFilePrefix = (orderId: string) => `orders/${orderId}/`;

export const madeRequest = (design?: string): string =>
    `Hello, I’d like Toran to make my invitation for me${design ? `, in the ${design} design` : ''}.`;
