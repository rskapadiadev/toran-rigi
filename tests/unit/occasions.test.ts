import { cultures } from '@shared/cultures';
import { demoInvitations } from '@shared/demo';
import {
    allowedSection,
    cappedMotion,
    defaultSectionsFor,
    eventVocabFor,
    greetingsFor,
    occasionCategories,
    occasionCopyKeys,
    occasionIds,
    occasions,
} from '@shared/occasions';
import { contentSchema } from '@shared/schemas/invitation';
import { themeCatalog, themeLayouts } from '@shared/themes';
import { describe, expect, it } from 'vitest';

import { s } from '../../src/invitation/strings';

const remembrance = occasionIds.map((id) => occasions[id]).filter((o) => o.tone === 'solemn');

describe('occasions', () => {
    it('only re-words strings that exist', () => {
        for (const key of occasionCopyKeys) expect(s(key, 'en'), key).not.toBe('');
    });

    it('keeps every remembrance occasion calm, silent and free of festive sections', () => {
        expect(remembrance.length).toBeGreaterThanOrEqual(3);
        for (const o of remembrance) {
            expect(o.motion).toMatchObject({
                ceiling: 'calm',
                burst: false,
                music: 'off',
            });
            for (const banned of ['countdown', 'shagun'] as const)
                expect(allowedSection(o, banned), `${o.id} ${banned}`).toBe(false);
            for (const culture of Object.values(cultures))
                for (const type of defaultSectionsFor(o, culture))
                    expect(allowedSection(o, type), `${o.id} default ${type}`).toBe(true);
            expect(cappedMotion('cinematic', o)).toBe('calm');
        }
    });

    it('never heads a condolence notice with an auspicious invocation', () => {
        const hindu = greetingsFor(cultures.hindu, occasions.prayer_meet).map((g) => g.key);
        expect(hindu).toContain('om-shanti');
        expect(hindu).not.toContain('shree-ganeshay-namah');
        expect(hindu).not.toContain('shubh-vivah');
        const wedding = greetingsFor(cultures.hindu, occasions.wedding).map((g) => g.key);
        expect(wedding).toContain('shree-ganeshay-namah');
        expect(wedding).not.toContain('om-shanti');
        // Wedding-only greetings stay at weddings.
        expect(greetingsFor(cultures.hindu, occasions.naming).map((g) => g.key)).not.toContain(
            'shubh-vivah',
        );
    });

    it('offers the culture’s own ceremony names first', () => {
        const kinds = eventVocabFor(occasions.prayer_meet, cultures.hindu).map((e) => e.kind);
        expect(kinds.slice(0, 2)).toEqual(['besnu', 'uthamna']);
        expect(eventVocabFor(occasions.naming, cultures.islamic)[0]?.kind).toBe('aqiqah');
        expect(eventVocabFor(occasions.wedding, cultures.hindu)).toBe(cultures.hindu.events);
    });

    it('has at least one design, with a full layout, for every occasion family', () => {
        for (const category of occasionCategories)
            expect(
                themeCatalog.some((t) => t.suits.includes(category)),
                category,
            ).toBe(true);
        for (const theme of themeCatalog)
            expect(themeLayouts[theme.slug], theme.slug).toBeDefined();
    });

    it('ships demos whose content parses and whose sections the occasion allows', () => {
        for (const demo of demoInvitations) {
            const occasion = occasions[demo.occasion];
            expect(contentSchema.safeParse(demo.content).success, demo.slug).toBe(true);
            for (const section of demo.sections)
                expect(allowedSection(occasion, section.type), `${demo.slug} ${section.type}`).toBe(
                    true,
                );
            const theme = themeCatalog.find((t) => t.slug === demo.themeSlug);
            expect(theme?.suits, demo.slug).toContain(occasion.category);
        }
    });

    it('reads invitations saved before couple became people', () => {
        const parsed = contentSchema.parse({
            couple: {
                one: { name: { en: 'Riya' } },
                two: { name: { en: 'Kabir' } },
            },
            headline: { en: 'h' },
            welcome: { en: 'w' },
            closing: { en: 'c' },
        });
        expect(parsed.people.two?.name.en).toBe('Kabir');
        expect('couple' in parsed).toBe(false);
    });
});
