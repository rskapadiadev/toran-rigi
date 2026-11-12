import { describe, expect, it } from 'vitest';

import { generateOrnament, seedFrom } from '../../shared/generative';
import { contrastRatio, generatePalette } from '../../shared/palette';
import { zonedToUtc } from '../../shared/time';

describe('generatePalette', () => {
    it('produces readable palettes from any couple colours', () => {
        for (const colors of [
            ['#ffd700'],
            ['#b8324f', '#2f6f5e'],
            ['#f5f5f5', '#eeeeee'],
            ['#0b1530'],
        ]) {
            for (const mode of ['light', 'dark'] as const) {
                const p = generatePalette(colors, { mode });
                expect(contrastRatio(p.ink, p.bg)).toBeGreaterThanOrEqual(7);
                expect(contrastRatio(p.primary, p.bg)).toBeGreaterThanOrEqual(3);
            }
        }
    });
});

describe('generative ornaments', () => {
    it('is deterministic per couple and different across couples', () => {
        const a = generateOrnament('mandala', seedFrom('Aarav', 'Diya', '2027-01-22'));
        const b = generateOrnament('mandala', seedFrom('Aarav', 'Diya', '2027-01-22'));
        const c = generateOrnament('mandala', seedFrom('Omar', 'Layla', '2027-04-15'));
        expect(a).toEqual(b);
        expect(a.paths.map((p) => p.d).join()).not.toEqual(c.paths.map((p) => p.d).join());
    });
});

describe('zonedToUtc', () => {
    it('converts wall-clock times in IANA zones', () => {
        expect(zonedToUtc('2027-01-22T10:30', 'Asia/Kolkata').toISOString()).toBe(
            '2027-01-22T05:00:00.000Z',
        );
        expect(zonedToUtc('2027-04-15T17:00', 'Asia/Dubai').toISOString()).toBe(
            '2027-04-15T13:00:00.000Z',
        );
        expect(zonedToUtc('2027-07-01T12:00', 'Europe/London').toISOString()).toBe(
            '2027-07-01T11:00:00.000Z',
        );
    });
});
