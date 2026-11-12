import {
    applyLayout,
    blockVariants,
    openingChoiceFor,
    openingChoices,
    resolveBlock,
} from '@shared/blocks';
import { openingKinds, sectionConfigSchema } from '@shared/schemas/invitation';
import { themeCatalog, themeLayouts } from '@shared/themes';
import { describe, expect, it } from 'vitest';

describe('blocks', () => {
    it('falls back to section defaults and rejects unknown variants', () => {
        const block = resolveBlock({
            type: 'cover',
            enabled: true,
            variant: 'nope',
        });
        expect(block.variant).toBe('spotlight');
        expect(block.enter).toBe('rise');
        expect(block.edge).toBe('none');
    });

    it('sews a seam only where the backdrop changes', () => {
        const events = {
            type: 'events' as const,
            enabled: true,
        };
        expect(resolveBlock(events, 'paper').edge).toBe('seam');
        expect(resolveBlock(events, 'blush').edge).toBe('none');
    });

    it('every theme layout uses real variants and valid block options', () => {
        for (const theme of themeCatalog) {
            const layout = themeLayouts[theme.slug];
            expect(layout, theme.slug).toBeDefined();
            for (const [type, preset] of Object.entries(layout ?? {})) {
                const parsed = sectionConfigSchema.parse({
                    type,
                    enabled: true,
                    ...preset,
                });
                if (preset.variant)
                    expect(
                        blockVariants[parsed.type]?.some((v) => v.id === preset.variant),
                        `${theme.slug}.${type}`,
                    ).toBe(true);
            }
        }
    });

    it('applyLayout keeps order and visibility', () => {
        const sections = applyLayout(
            [
                {
                    type: 'closing',
                    enabled: false,
                },
                {
                    type: 'cover',
                    enabled: true,
                },
            ],
            themeLayouts.rajwada,
        );
        expect(sections.map((s) => s.type)).toEqual(['closing', 'cover']);
        expect(sections[0]?.enabled).toBe(false);
        expect(sections[1]?.variant).toBe('arch');
    });
});

describe('openings', () => {
    it('offers every opening kind as a card (or as its bloom alias) and some gentle ones', () => {
        const ids = openingChoices.map((c) => c.id);
        for (const kind of openingKinds) expect(ids, kind).toContain(openingChoiceFor(kind));
        expect(new Set(ids).size).toBe(ids.length);
        expect(openingChoices.filter((c) => c.gentle).length).toBeGreaterThanOrEqual(4);
    });
});
