import { ceremonyProps, propFor } from '@shared/props';
import { describe, expect, it } from 'vitest';

describe('propFor', () => {
    it.each([
        ['ring-ceremony', 'hindu', 'rings'],
        ['gathering', 'hindu', 'diya'],
        ['pheras', 'hindu.gujarati', 'agni'],
        ['haldi', 'hindu', 'haldi'],
        ['garba', 'hindu.gujarati', 'dandiya'],
        ['sangeet', 'hindu', 'ghungroo'],
        ['griha-pravesh', 'hindu', 'kalash'],
        ['vastu-shanti', 'hindu', 'kalash'],
        ['naming-ceremony', 'hindu', 'cradle'],
        ['cake-cutting', 'universal', 'cake'],
        ['anand-karaj', 'sikh.punjabi', 'kaleere'],
        ['nikah', 'islamic.arab', 'lantern'],
        ['quran-khwani', 'islamic', 'lily'],
        ['aqiqah', 'islamic', 'cradle'],
        ['ceremony', 'christian.catholic', 'rings'],
        ['ceremony', 'hindu', 'varmala'],
        ['baptism', 'christian', 'dove'],
        ['chuppah', 'jewish.sephardic', 'chuppah'],
        ['keynote', 'universal', 'mic'],
        ['bhandara', 'hindu', 'bhojan'],
        ['jyot', 'hindu', 'diya'],
        ['aarti', 'hindu', 'thali'],
        ['prayer-meet', 'hindu.gujarati', 'lily'],
        ['lunch', 'hindu', 'diya'],
        ['lunch', 'islamic', 'lantern'],
        ['reception', 'hindu.south-indian', 'varmala'],
        ['reception', 'jain', 'varmala'],
        ['reception', 'sikh', 'varmala'],
        ['reception', 'islamic', 'lantern'],
        ['reception', 'christian', 'flutes'],
        ['cocktail', 'universal', 'flutes'],
    ])('%s (%s) → %s', (kind, culture, prop) => {
        expect(propFor(kind, culture)).toBe(prop);
    });

    it('keeps Hindu ritual objects off other traditions', () => {
        expect(propFor('haldi', 'christian')).not.toBe('haldi');
        expect(propFor('pheras', 'islamic')).not.toBe('agni');
    });

    it('has unique ids', () => {
        const ids = ceremonyProps.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});
