import {
    canSee,
    countsOf,
    groupKey,
    headcounts,
    inviteMessage,
    latestReplies,
    type ReplyLike,
    visibleEvents,
    whatsappLink,
} from '@shared/guests';
import { describe, expect, it } from 'vitest';

const reply = (over: Partial<ReplyLike>): ReplyLike => ({
    guestId: null,
    name: 'Sharma family',
    attending: true,
    guestCount: 1,
    eventIds: [],
    counts: null,
    createdAt: '2027-01-01T00:00:00Z',
    ...over,
});

describe('who sees a function', () => {
    const events = [
        {
            id: 'haldi',
            audience: [groupKey('close')],
        },
        {
            id: 'mehndi',
            audience: ['one'],
        },
        {
            id: 'wedding',
            audience: null,
        },
        {
            id: 'reception',
            audience: ['all'],
        },
    ];

    it('shows functions for everyone on the bare link, and nothing more', () => {
        expect(visibleEvents(events).map((e) => e.id)).toEqual(['wedding', 'reception']);
    });

    it('adds a side’s functions on that side’s links only', () => {
        expect(visibleEvents(events, { side: 'one' }).map((e) => e.id)).toEqual([
            'mehndi',
            'wedding',
            'reception',
        ]);
        expect(canSee(['one'], { side: 'two' }, 'mehndi')).toBe(false);
    });

    it('adds a group’s functions for its families and its own link', () => {
        const family = {
            side: 'two' as const,
            groupId: 'close',
        };
        expect(visibleEvents(events, family).map((e) => e.id)).toEqual([
            'haldi',
            'wedding',
            'reception',
        ]);
        expect(canSee([groupKey('close')], { groupId: 'office' }, 'haldi')).toBe(false);
    });

    it('keeps the studio’s per-guest list as an outer limit', () => {
        expect(canSee(null, { eventIds: ['wedding'] }, 'reception')).toBe(false);
        expect(canSee(null, { eventIds: ['wedding'] }, 'wedding')).toBe(true);
    });
});

describe('replies and headcounts', () => {
    it('reads old single-number replies as that number at each function', () => {
        expect(
            countsOf(
                reply({
                    guestCount: 3,
                    eventIds: ['a', 'b'],
                }),
            ),
        ).toEqual({
            a: 3,
            b: 3,
        });
        expect(
            countsOf(
                reply({
                    attending: false,
                    counts: { a: 2 },
                }),
            ),
        ).toEqual({});
    });

    it('counts only a family’s latest reply', () => {
        const rows = [
            reply({
                guestId: 'g1',
                counts: { a: 2 },
                createdAt: '2027-01-01T00:00:00Z',
            }),
            reply({
                guestId: 'g1',
                counts: { a: 5 },
                createdAt: '2027-01-02T00:00:00Z',
            }),
            reply({
                name: ' Mehra ',
                counts: { a: 1 },
            }),
            reply({
                name: 'mehra',
                counts: { a: 4 },
                createdAt: '2027-01-03T00:00:00Z',
            }),
        ];
        expect(latestReplies(rows).map((r) => r.counts)).toEqual([{ a: 5 }, { a: 4 }]);
    });

    it('keeps two guests with the same name apart by their phone', () => {
        const a = reply({
            name: 'Rahul',
            phone: '+91 90000 00001',
        });
        const b = reply({
            name: 'rahul',
            phone: '+91 90000 00002',
        });
        expect(latestReplies([a, b])).toHaveLength(2);
        expect(latestReplies([a, { ...a }])).toHaveLength(1);
    });

    it('adds up each function and who is still to reply', () => {
        const events = [
            {
                id: 'haldi',
                audience: [groupKey('close')],
            },
            {
                id: 'wedding',
                audience: null,
            },
        ];
        const guests = [
            {
                id: 'g1',
                side: 'one' as const,
                groupId: 'close',
                allowedEventIds: null,
            },
            {
                id: 'g2',
                side: 'two' as const,
                groupId: null,
                allowedEventIds: null,
            },
            {
                id: 'g3',
                side: 'two' as const,
                groupId: null,
                allowedEventIds: null,
            },
        ];
        const replies = [
            reply({
                guestId: 'g1',
                counts: {
                    haldi: 4,
                    wedding: 6,
                },
            }),
            reply({
                guestId: 'g2',
                attending: false,
            }),
            reply({
                name: 'A friend',
                counts: { wedding: 2 },
            }),
        ];
        expect(headcounts(events, guests, replies)).toEqual([
            {
                eventId: 'haldi',
                coming: 4,
                replied: 1,
                waiting: 0,
            },
            {
                eventId: 'wedding',
                coming: 8,
                replied: 2,
                waiting: 1,
            },
        ]);
    });
});

describe('sending', () => {
    it('fills the family’s name and link into the couple’s words', () => {
        expect(
            inviteMessage('Hi {name}, see {link}', {
                name: 'Mama ji',
                link: 'x.in/a',
            }),
        ).toBe('Hi Mama ji, see x.in/a');
    });

    it('reads naturally without a name, for a group’s link', () => {
        expect(
            inviteMessage('Namaste {name}! See {link}', {
                name: '',
                link: 'x.in/a',
            }),
        ).toBe('Namaste! See x.in/a');
        expect(
            inviteMessage('Dear {name}, come', {
                name: '',
                link: 'x',
            }),
        ).toBe('Dear, come\nx');
    });

    it('never leaves the link out', () => {
        expect(
            inviteMessage('Come!', {
                name: 'A',
                link: 'x.in/a',
            }),
        ).toBe('Come!\nx.in/a');
        expect(
            inviteMessage('  ', {
                name: 'A',
                link: 'x.in/a',
            }),
        ).toContain('x.in/a');
    });

    it('builds a WhatsApp link with the number’s digits', () => {
        expect(whatsappLink('+91 98765-43210', 'hi there')).toBe(
            'https://wa.me/919876543210?text=hi%20there',
        );
        expect(whatsappLink(null, 'x')).toBe('https://wa.me/?text=x');
    });
});
