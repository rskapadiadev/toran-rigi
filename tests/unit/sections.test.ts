import { occasions } from '@shared/occasions';
import { customerInput } from '@shared/schemas/composer';
import { chooseSections, missingSections, showsSection } from '@shared/sections';
import type { SectionConfig } from '@shared/types';
import { describe, expect, it } from 'vitest';

const stored: SectionConfig[] = [
    {
        type: 'cover',
        enabled: true,
        variant: 'palace',
    },
    {
        type: 'events',
        enabled: true,
        scene: 'silk',
    },
    {
        type: 'story',
        enabled: false,
    },
];

describe('a customer’s sections', () => {
    it('go on, off and in order, with the studio’s styling kept', () => {
        const next = chooseSections(
            stored,
            [
                {
                    type: 'cover',
                    enabled: true,
                },
                {
                    type: 'story',
                    enabled: true,
                },
                {
                    type: 'events',
                    enabled: false,
                },
            ],
            occasions.wedding,
        );
        expect(next.map((s) => s.type)).toEqual(['cover', 'story', 'events']);
        expect(showsSection(next, 'events')).toBe(false);
        expect(next[2]?.scene).toBe('silk');
        expect(next[0]?.variant).toBe('palace');
    });

    it('always keep the cover first and shown, and whatever was not mentioned', () => {
        const next = chooseSections(
            stored,
            [
                {
                    type: 'events',
                    enabled: true,
                },
                {
                    type: 'cover',
                    enabled: false,
                },
            ],
            occasions.wedding,
        );
        expect(next[0]).toMatchObject({
            type: 'cover',
            enabled: true,
        });
        expect(next.map((s) => s.type)).toContain('story');
        expect(next).toHaveLength(stored.length);
    });

    it('can’t bring in what the occasion forbids', () => {
        const next = chooseSections(
            stored,
            [
                {
                    type: 'countdown',
                    enabled: true,
                },
                {
                    type: 'shagun',
                    enabled: true,
                },
            ],
            occasions.prayer_meet,
        );
        expect(next.map((s) => s.type)).not.toContain('countdown');
        expect(next.map((s) => s.type)).not.toContain('shagun');
        expect(missingSections(stored, occasions.prayer_meet)).not.toContain('countdown');
        expect(missingSections(stored, occasions.wedding)).toContain('travel');
    });

    it('carry no styling, and links are web links', () => {
        const base = {
            content: {
                people: { one: { name: { en: 'Riya' } } },
                headline: { en: 'a' },
                welcome: { en: 'b' },
                closing: { en: 'c' },
            },
            events: [],
        };
        const styled = customerInput.parse({
            ...base,
            design: { palette: {} },
            sections: [
                {
                    type: 'cover',
                    enabled: true,
                    variant: 'mine',
                },
            ],
        });
        expect(styled).not.toHaveProperty('design');
        expect(styled.sections?.[0]).not.toHaveProperty('variant');
        const bad = {
            ...base,
            extras: { live: { youtubeUrl: 'javascript:alert(1)' } },
        };
        expect(customerInput.safeParse(bad).success).toBe(false);
    });
});
