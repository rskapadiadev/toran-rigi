// The couple's mood board: one per function, private to them and the studio, for the decorator,
// make-up artist and photographer. Guests never see it.
export const BOARD_LIMITS = {
    palette: 6,
    words: 16,
    pins: 12,
};

// Laid out at 1200 × 1500 (4:5, how WhatsApp and Instagram show a tall picture) and photographed
// at twice that.
export const BOARD_SIZE = {
    width: 1200,
    height: 1500,
};

export const boardPinPrefix = (invitationId: string) => `boards/${invitationId}/`;

// Words to start a stock search from: the function and the board's own words, never anything
// about the couple.
export const boardSearchFor = (kind: string, words: readonly string[]): string =>
    [kind.replace(/-/g, ' '), words[0] ?? 'decor'].join(' ').trim();

export const boardFileName = (slug: string, title: string) =>
    `${[
        slug,
        title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
        'mood-board',
    ]
        .filter(Boolean)
        .join('-')}.png`;
