import { addDays, gridTile, postFileName, postsFor, postSize } from '@shared/posts';
import { describe, expect, it } from 'vitest';

const wedding = {
    id: 'w',
    title: 'Wedding',
    date: '2027-01-21',
};
const haldi = {
    id: 'h',
    title: 'Haldi',
    date: '2027-01-20',
};

const posts = (today: string, solemn = false) =>
    postsFor({
        events: [haldi, wedding],
        mainId: 'w',
        solemn,
        today,
    });

describe('posts', () => {
    it('counts down from 100 and 60 days, then every day of the last month', () => {
        const days = posts('2026-11-01')
            .filter((p) => p.kind === 'countdown')
            .map((p) => p.day);
        expect(days.slice(0, 3)).toEqual([60, 30, 29]);
        expect(days.at(-1)).toBe(0);
        expect(days).toHaveLength(32);
        const early = posts('2026-09-01').filter((p) => p.kind === 'countdown');
        expect(early[0]?.day).toBe(100);
        expect(early[0]?.on).toBe('2026-10-13');
    });

    it('never offers a post for a day gone by', () => {
        const left = posts('2027-01-19');
        expect(left.filter((p) => p.kind === 'countdown').map((p) => p.title)).toEqual([
            '2 days to go',
            'Tomorrow',
            'The day',
        ]);
        expect(left.filter((p) => p.kind === 'ceremony').map((p) => p.on)).toEqual([
            '2027-01-20',
            '2027-01-21',
        ]);
    });

    it('thanks everyone the day after the last ceremony', () => {
        expect(posts('2027-01-19').find((p) => p.kind === 'thanks')?.on).toBe('2027-01-22');
        expect(addDays('2027-02-28', 1)).toBe('2027-03-01');
    });

    it('makes nothing for a prayer meet', () => {
        expect(posts('2027-01-19', true)).toEqual([]);
    });

    it('cuts the grid so the first post goes bottom right and the last top left', () => {
        expect(postSize('grid', 6)).toEqual({
            width: 1620,
            height: 1440,
        });
        expect(gridTile(6, 1)).toMatchObject({
            x: 1080,
            y: 720,
        });
        expect(gridTile(6, 6)).toMatchObject({
            x: 0,
            y: 0,
        });
        const all = Array.from({ length: 9 }, (_, i) => gridTile(9, i + 1));
        expect(new Set(all.map((t) => `${String(t.x)},${String(t.y)}`)).size).toBe(9);
    });

    it('names files plainly, in posting order', () => {
        const grid = posts('2027-01-19').find((p) => p.id === 'grid:6');
        expect(grid && postFileName('riya-kabir', grid, '', 2)).toBe(
            'riya-kabir-profile-grid-6-posts-post-2.png',
        );
        const haldiDay = posts('2027-01-19').find((p) => p.id === 'ceremony:h');
        expect(haldiDay && postFileName('riya-kabir', haldiDay)).toBe('riya-kabir-haldi-today.png');
    });
});
