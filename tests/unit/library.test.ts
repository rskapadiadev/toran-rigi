import { blockVariants, renderedSections } from '@shared/blocks';
import { describe, expect, it } from 'vitest';

// The Library lists layouts from blockVariants: a section missing there never shows up in it.
describe('library catalogue', () => {
    it('lists every rendered section', () => {
        const missing = renderedSections.filter((type) => !blockVariants[type]?.length);
        expect(missing).toEqual([]);
    });
});
