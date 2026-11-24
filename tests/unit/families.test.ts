import { familyContent, familyReplies, forViewer } from '@shared/families';
import type { InvitationContent, InvitationExtras } from '@shared/types';
import { describe, expect, it } from 'vitest';

const content: InvitationContent = {
    people: {
        one: {
            name: { en: 'Tanya' },
            photoKey: 'tanya.jpg',
        },
        two: { name: { en: 'Vikram' } },
    },
    headline: { en: 'are getting married' },
    welcome: {
        en: 'Welcome',
        hi: 'स्वागत',
    },
    closing: { en: 'With love' },
    family: { en: 'Both families' },
    gallery: [],
    photoSlots: {
        'story.one': 'a.jpg',
        'story.two': 'b.jpg',
        'story.together': 'c.jpg',
    },
    families: {
        enabled: true,
        one: { closing: { en: 'The Sharmas' } },
        two: {
            welcome: {
                en: 'The Mehras welcome you',
                hi: '  ',
            },
        },
    },
};

describe('a version for each family', () => {
    it('puts the second family’s person, and their portrait, first', () => {
        const two = familyContent(content, 'two');
        expect(two.people.one.name.en).toBe('Vikram');
        expect(two.people.two?.photoKey).toBe('tanya.jpg');
        expect(two.photoSlots).toEqual({
            'story.one': 'b.jpg',
            'story.two': 'a.jpg',
            'story.together': 'c.jpg',
        });
    });

    it('uses a family’s own words, and the shared ones where it wrote none', () => {
        const two = familyContent(content, 'two');
        expect(two.welcome).toEqual({
            en: 'The Mehras welcome you',
            hi: 'स्वागत',
        });
        expect(two.closing.en).toBe('With love');
        expect(familyContent(content, 'one').closing.en).toBe('The Sharmas');
    });

    it('leaves the main link alone, and every link when switched off', () => {
        const main = familyContent(content, null);
        expect(main.people.one.name.en).toBe('Tanya');
        const off = familyContent(
            {
                ...content,
                families: { enabled: false },
            },
            'two',
        );
        expect(off.people.one.name.en).toBe('Tanya');
    });
});

const extras: InvitationExtras = {
    replies: {
        whatsapp: '+91111',
        message: 'private words',
        sides: {
            one: { enabled: false },
            two: { whatsapp: '+92222' },
        },
    },
};

describe('replies for each family', () => {
    it('follows the shared number until a family has its own', () => {
        expect(familyReplies(extras, true, null).whatsapp).toBe('+91111');
        expect(familyReplies(extras, true, 'two').whatsapp).toBe('+92222');
    });

    it('lets one family take none, but never turns on what is off for all', () => {
        expect(familyReplies(extras, true, 'one').enabled).toBe(false);
        expect(familyReplies(extras, false, 'two').enabled).toBe(false);
    });
});

describe('what leaves the server for a guest', () => {
    it('holds only their functions, their words and their number', () => {
        const page = forViewer(
            {
                invitation: {
                    content,
                    extras,
                    rsvpEnabled: true,
                },
                events: [
                    {
                        id: 'haldi',
                        audience: ['one'],
                    },
                    {
                        id: 'wedding',
                        audience: null,
                    },
                ],
            },
            { side: 'two' },
        );
        expect(page.events).toEqual([{ id: 'wedding' }]);
        const sent = JSON.stringify(page);
        for (const secret of ['haldi', 'The Sharmas', '+91111', 'private words', 'audience'])
            expect(sent).not.toContain(secret);
    });
});
