import {
    chaptersOf,
    type FilmFrames,
    filmLength,
    frameAt,
    frameCell,
    travelScreens,
} from '@shared/film';
import { describe, expect, it } from 'vitest';

const frames: FilmFrames = {
    sheets: Array.from({ length: 15 }, (_, i) => `s${String(i)}`),
    fps: 15,
    count: 135,
    cols: 3,
    rows: 3,
    width: 540,
    height: 960,
};

describe('film frames', () => {
    it('finds the frame and the crossfade towards the next', () => {
        expect(frameAt(frames, 0)).toEqual({
            index: 0,
            next: 1,
            mix: 0,
        });
        const half = frameAt(frames, 1.5 / 15);
        expect(half.index).toBe(1);
        expect(half.mix).toBeCloseTo(0.5);
    });

    it('clamps to the last frame', () => {
        expect(frameAt(frames, 99)).toEqual({
            index: 134,
            next: 134,
            mix: 0,
        });
        expect(filmLength(frames)).toBeCloseTo(134 / 15);
    });

    it('places a frame in its sheet, row by row', () => {
        expect(frameCell(frames, 0)).toEqual({
            sheet: 0,
            col: 0,
            row: 0,
        });
        expect(frameCell(frames, 13)).toEqual({
            sheet: 1,
            col: 1,
            row: 1,
        });
        expect(frameCell(frames, 134)).toEqual({
            sheet: 14,
            col: 2,
            row: 2,
        });
    });
});

describe('film chapters', () => {
    it('groups sections on one moment and keeps the moment when unset', () => {
        const chapters = chaptersOf([4.6, 6.1, 7.3, undefined, 8.9, undefined], 4.6);
        expect(chapters).toEqual([
            {
                start: 0,
                at: 4.6,
                from: 0,
            },
            {
                start: 1,
                at: 6.1,
                from: 4.6,
            },
            {
                start: 2,
                at: 7.3,
                from: 6.1,
            },
            {
                start: 4,
                at: 8.9,
                from: 7.3,
            },
        ]);
    });

    it('starts on the names moment when the first section has none', () => {
        expect(chaptersOf([undefined, undefined], 4.6)).toEqual([
            {
                start: 0,
                at: 4.6,
                from: 0,
            },
        ]);
    });

    it('gives longer stretches of film more scrolling, within limits', () => {
        expect(travelScreens(1.5)).toBeCloseTo(0.9);
        expect(travelScreens(0.1)).toBe(0.5);
        expect(travelScreens(20)).toBe(2.4);
    });
});
