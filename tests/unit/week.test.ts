import { weekStart } from '@shared/week';
import { describe, expect, it } from 'vitest';

describe('weekStart', () => {
    it('follows where the wedding is', () => {
        expect(weekStart('Asia/Kolkata')).toBe(0);
        expect(weekStart('America/New_York')).toBe(0);
        expect(weekStart('Asia/Jerusalem')).toBe(0);
        expect(weekStart('Europe/London')).toBe(1);
        expect(weekStart('Asia/Dubai')).toBe(1);
        expect(weekStart('Australia/Sydney')).toBe(1);
        expect(weekStart('America/Argentina/Buenos_Aires')).toBe(1);
        expect(weekStart('Asia/Qatar')).toBe(6);
        expect(weekStart('Africa/Cairo')).toBe(6);
        expect(weekStart(undefined)).toBe(0);
    });
});
