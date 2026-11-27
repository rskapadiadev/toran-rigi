import { describe, expect, it } from 'vitest';

import { boardSearchFor } from '../../shared/board';
import { asKeepsake, hasEnded } from '../../shared/keepsake';
import { colourList, colourName, outfitsFor, suggestedPalette } from '../../shared/looks';
import { postsFor } from '../../shared/posts';
import { boardInput, boardPin } from '../../shared/schemas/board';
import { eventInput } from '../../shared/schemas/composer';

describe('look book', () => {
    it('names colours by how they look', () => {
        expect(colourName('#f4b41a')).toBe('Marigold');
        expect(colourName('#fefefe')).toBe('White');
        expect(colourName('#0e1f4b')).toBe('Navy');
        expect(colourName('red')).toBe('Colour');
        expect(colourList(['#f4b41a', '#e8892b', '#fff4d6'])).toBe('Marigold, saffron and cream');
    });

    it('picks outfits that suit the tradition when none are chosen', () => {
        expect(outfitsFor(undefined, 'hindu.gujarati')).toEqual(['lehenga', 'kurta']);
        expect(outfitsFor([], 'christian')).toEqual(['gown', 'suit']);
        expect(outfitsFor(['sari', 'nonsense', 'sherwani'], 'hindu')).toEqual(['sari', 'sherwani']);
    });

    it('suggests a colour story for the function', () => {
        expect(suggestedPalette('haldi').id).toBe('marigold');
        expect(suggestedPalette('mehndi').id).toBe('mehndi');
        expect(suggestedPalette('something-new').id).toBe('pastel');
    });

    it('keeps the dress code within its limits', () => {
        const base = {
            kind: 'haldi',
            title: { en: 'Haldi' },
            startsAt: '2027-01-01T10:00',
            timezone: 'Asia/Kolkata',
            venue: 'Home',
        };
        const ok = eventInput.safeParse({
            ...base,
            dressCode: {
                swatches: ['#f4b41a'],
                avoid: ['#d62e4b'],
                outfits: ['sari', 'kurta'],
                turban: true,
            },
        });
        expect(ok.success).toBe(true);
        const bad = eventInput.safeParse({
            ...base,
            dressCode: {
                swatches: [],
                outfits: ['tuxedo'],
            },
        });
        expect(bad.success).toBe(false);
    });

    it('offers a what-to-wear post per dressed function, private ones marked', () => {
        const posts = postsFor({
            events: [
                {
                    id: 'w',
                    title: 'Wedding',
                    date: '2027-02-10',
                },
            ],
            mainId: 'w',
            solemn: false,
            today: '2027-01-01',
            looks: [
                {
                    id: 'h',
                    title: 'Haldi',
                    date: '2027-02-09',
                    private: true,
                },
                {
                    id: 'old',
                    title: 'Roka',
                    date: '2026-12-01',
                    private: false,
                },
            ],
        });
        const wear = posts.filter((p) => p.kind === 'look');
        expect(wear.map((p) => p.id)).toEqual(['look:h']);
        expect(wear[0]?.private).toBe(true);
        expect(wear[0]?.title).toBe('Haldi: what to wear');
    });
});

describe('mood board', () => {
    it('only pins their own uploads or our stock copies', () => {
        expect(boardPin.safeParse({ key: 'boards/inv1/abc.webp' }).success).toBe(true);
        expect(boardPin.safeParse({ key: 'public/stock/pixabay/photo/1.jpg' }).success).toBe(true);
        expect(boardPin.safeParse({ key: 'orders/o1/brief.pdf' }).success).toBe(false);
        expect(boardPin.safeParse({ key: 'https://example.com/x.jpg' }).success).toBe(false);
    });

    it('fills in an empty board and caps its photos', () => {
        expect(boardInput.parse({})).toEqual({
            theme: '',
            palette: [],
            words: [],
            notes: '',
            pins: [],
        });
        const many = Array.from({ length: 13 }, (_, i) => ({ key: `boards/i/${String(i)}.webp` }));
        expect(boardInput.safeParse({ pins: many }).success).toBe(false);
    });

    it('searches stock with the function and its words only', () => {
        expect(boardSearchFor('griha-pravesh', ['marigold'])).toBe('griha pravesh marigold');
        expect(boardSearchFor('haldi', [])).toBe('haldi decor');
    });
});

describe('keepsake after hosting ends', () => {
    it('ends at its expiry', () => {
        const now = new Date('2027-06-01T00:00:00Z');
        expect(hasEnded('2027-05-31T00:00:00.000Z', now)).toBe(true);
        expect(hasEnded('2027-07-01T00:00:00.000Z', now)).toBe(false);
        expect(hasEnded(null, now)).toBe(false);
    });

    it('keeps names, story and photos but no replies, venues or gifts', () => {
        const kept = asKeepsake({
            invitation: {
                rsvpEnabled: true,
                sections: [
                    {
                        type: 'cover' as const,
                        enabled: true,
                    },
                    {
                        type: 'rsvp' as const,
                        enabled: true,
                    },
                    {
                        type: 'gallery' as const,
                        enabled: true,
                    },
                    {
                        type: 'venue' as const,
                        enabled: true,
                    },
                ],
                extras: {
                    shagun: { upi: 'x@y' },
                    contacts: [],
                    pdf: { enabled: true },
                },
            },
            events: [
                {
                    venue: 'Taj',
                    address: 'Mumbai',
                    mapsUrl: 'https://maps.google.com',
                    description: null,
                    dressCode: null,
                },
            ],
        });
        expect(kept.invitation.rsvpEnabled).toBe(false);
        expect(kept.invitation.sections.map((s) => s.type)).toEqual(['cover', 'gallery']);
        expect(Object.keys(kept.invitation.extras).sort()).toEqual(['pdf', 'wishes']);
        expect(kept.events[0]?.venue).toBe('');
        expect(kept.events[0]?.mapsUrl).toBeNull();
    });
});
