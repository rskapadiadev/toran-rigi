// The whole wording library. Import it on the server only (the browser gets what it needs through a
// page's loader or /api/wording); types and helpers for the browser are in ./types.
import type { CultureId } from '../cultures';
import type { OccasionId } from '../occasions';
import { wordingMessages } from './messages';
import { occasionWordings } from './occasions';
import { remembranceWordings } from './remembrance';
import type { Wording, WordingMessage } from './types';
import { weddingWordings } from './weddings';

export { wordingMessages };
export const wordings: Wording[] = [
    ...weddingWordings,
    ...occasionWordings,
    ...remembranceWordings,
];

interface Fit {
    occasion: OccasionId;
    culture?: CultureId;
    variant?: string;
}

// How closely words fit a celebration: their own community first, then the tradition, then words for
// everyone. 0 means they belong to someone else's.
function closeness(of: Fit, to: Fit): number {
    if (of.occasion !== to.occasion) return 0;
    if (!of.culture) return 1;
    if (of.culture !== to.culture) return 0;
    if (!of.variant) return 2;
    return of.variant === to.variant ? 3 : 0;
}

function best<T extends Fit>(all: readonly T[], to: Fit): T[] {
    return all
        .map((item) => ({
            item,
            rank: closeness(item, to),
        }))
        .filter((row) => row.rank > 0)
        .sort((a, b) => b.rank - a.rank)
        .map((row) => row.item);
}

export const wordingsFor = (to: Fit): Wording[] => best(wordings, to);
export const messagesFor = (to: Fit): WordingMessage[] => best(wordingMessages, to);
// A guide's words: a wedding's own tradition, or everything there is for any other occasion.
export const guideWordings = (guide: Fit): Wording[] =>
    guide.occasion === 'wedding' || guide.culture
        ? wordingsFor(guide)
        : wordings.filter((w) => w.occasion === guide.occasion);

export const wordingById = (id: string): Wording | undefined => wordings.find((w) => w.id === id);
