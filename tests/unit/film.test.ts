import {
    cameraAt,
    chaptersOf,
    exitAt,
    type FilmFrames,
    filmLength,
    frameAt,
    frameCell,
    momentAlpha,
    sceneAt,
    timelineLength,
    timelineOf,
    travelScreens,
    viewOf,
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

describe('film scenes', () => {
    const scenes = timelineOf({
        scenes: [
            {
                kind: 'film',
                frames,
                exit: 'zoom',
                portal: {
                    x: 0.5,
                    y: 0.5,
                    zoom: 4,
                },
            },
            {
                kind: 'still',
                image: 'courtyard.webp',
                length: 4,
            },
            // A still without a picture is skipped.
            { kind: 'still' },
        ],
    });

    it('lays scenes end to end', () => {
        expect(scenes).toHaveLength(2);
        expect(scenes[1]?.start).toBeCloseTo(134 / 15);
        expect(timelineLength(scenes)).toBeCloseTo(134 / 15 + 4);
    });

    it('treats a film without scenes as one scene', () => {
        expect(timelineOf({ frames })).toHaveLength(1);
        expect(timelineOf(undefined)).toEqual([]);
    });

    it('finds the scene and the time inside it', () => {
        expect(sceneAt(scenes, 2)).toEqual({
            index: 0,
            local: 2,
        });
        const inCourtyard = sceneAt(scenes, 134 / 15 + 1);
        expect(inCourtyard.index).toBe(1);
        expect(inCourtyard.local).toBeCloseTo(1);
    });

    it('runs the exit over the last stretch of a scene', () => {
        const end = 134 / 15;
        expect(exitAt(scenes, sceneAt(scenes, end - 1)).progress).toBeNull();
        expect(exitAt(scenes, sceneAt(scenes, end - 0.35)).progress).toBeCloseTo(0.5);
        // The last scene has nothing to hand over to.
        expect(exitAt(scenes, sceneAt(scenes, end + 3.9)).progress).toBeNull();
    });

    it('moves the camera and keeps its view inside the picture', () => {
        expect(cameraAt('push', 0).zoom).toBe(1);
        expect(cameraAt('push', 1).zoom).toBeCloseTo(1.18);
        expect(cameraAt(undefined, 0.5).zoom).toBe(1);
        const corner = viewOf({
            x: 0,
            y: 1,
            zoom: 4,
        });
        expect(corner).toEqual({
            x: 0,
            y: 0.75,
            w: 0.25,
            h: 0.25,
        });
    });
});

describe('words on the film', () => {
    const moment = {
        from: 2,
        to: 4,
    };

    it('fades in, holds and fades out', () => {
        expect(momentAlpha(moment, 1.9)).toBe(0);
        expect(momentAlpha(moment, 2.15)).toBeCloseTo(0.5);
        expect(momentAlpha(moment, 3)).toBe(1);
        expect(momentAlpha(moment, 3.85)).toBeCloseTo(0.5);
        expect(momentAlpha(moment, 4.1)).toBe(0);
    });

    it('keeps a very short moment visible at its middle', () => {
        expect(
            momentAlpha(
                {
                    from: 1,
                    to: 1.2,
                },
                1.1,
            ),
        ).toBeCloseTo(1);
        expect(
            momentAlpha(
                {
                    from: 2,
                    to: 2,
                },
                2,
            ),
        ).toBe(0);
    });
});
