import type { SectionConfig } from '@shared/types';
import { describe, expect, it } from 'vitest';

import { addAt, retime, sectionTimes } from '../../src/admin/editor/film-sections';

const s = (type: SectionConfig['type'], filmAt?: number, enabled = true): SectionConfig =>
    filmAt === undefined
        ? {
              type,
              enabled,
          }
        : {
              type,
              enabled,
              filmAt,
          };

const page = [
    s('cover', 3.6),
    s('date', 6),
    s('blessing', 9.6),
    s('card'),
    s('welcome', 12.4),
    s('rsvp', 19.8),
];
const order = (list: SectionConfig[]) => list.map((x) => `${x.type}@${String(x.filmAt ?? '-')}`);

describe('film sections', () => {
    it('gives every section the second of its chapter', () => {
        expect(sectionTimes(page, 3.6)).toEqual([3.6, 6, 9.6, 9.6, 12.4, 19.8]);
    });

    it('moves a section to another chapter and keeps the page in film order', () => {
        expect(order(retime(page, 3, 12.4, 3.6))).toEqual([
            'cover@3.6',
            'date@6',
            'blessing@9.6',
            'welcome@12.4',
            'card@-',
            'rsvp@19.8',
        ]);
    });

    it('starts a new chapter when moved to a second of its own', () => {
        expect(order(retime(page, 3, 15, 3.6))).toEqual([
            'cover@3.6',
            'date@6',
            'blessing@9.6',
            'welcome@12.4',
            'card@15',
            'rsvp@19.8',
        ]);
    });

    it('moving a chapter start earlier moves its section before the others', () => {
        expect(order(retime(page, 4, 7, 3.6))).toEqual([
            'cover@3.6',
            'date@6',
            'welcome@7',
            'blessing@9.6',
            'card@-',
            'rsvp@19.8',
        ]);
    });

    it('adds a section at the playhead', () => {
        expect(order(addAt(page, s('gallery'), 9.6, 3.6))).toEqual([
            'cover@3.6',
            'date@6',
            'blessing@9.6',
            'card@-',
            'gallery@-',
            'welcome@12.4',
            'rsvp@19.8',
        ]);
    });
});
