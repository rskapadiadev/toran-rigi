import type { FilmLayer } from '@shared/types';
import { describe, expect, it } from 'vitest';

import { poseAt, withKey } from '../../src/invitation/film/layers';

const layer: FilmLayer = {
    kind: 'photo',
    from: 10,
    to: 14,
    zone: {
        x: 0.5,
        y: 0.4,
        w: 0.5,
    },
};
const key = (at: number, x: number, opacity = 1) => ({
    at,
    x,
    y: 0.4,
    w: 0.5,
    opacity,
    rotate: 0,
});

describe('layer keyframes', () => {
    it('stays at its zone without keyframes', () => {
        expect(poseAt(layer, 12)).toEqual({
            x: 0.5,
            y: 0.4,
            w: 0.5,
            opacity: 1,
            rotate: 0,
        });
    });

    it('holds before the first keyframe and after the last', () => {
        const moving = {
            ...layer,
            keys: [key(11, 0.2), key(13, 0.8)],
        };
        expect(poseAt(moving, 10).x).toBeCloseTo(0.2);
        expect(poseAt(moving, 14).x).toBeCloseTo(0.8);
    });

    it('eases between keyframes: halfway is halfway, the start is gentle', () => {
        const moving = {
            ...layer,
            keys: [key(13, 0.8, 0), key(11, 0.2, 1)],
        };
        expect(poseAt(moving, 12).x).toBeCloseTo(0.5);
        expect(poseAt(moving, 12).opacity).toBeCloseTo(0.5);
        expect(poseAt(moving, 11.2).x - 0.2).toBeLessThan(0.6 * 0.1);
    });

    it('adds a keyframe where the layer already is, or changes the one at that second', () => {
        const added = withKey(layer, 12, { x: 0.3 });
        expect(added).toEqual([key(12, 0.3)]);
        const moving = {
            ...layer,
            keys: [key(11, 0.2), key(13, 0.8)],
        };
        const between = withKey(moving, 12, { y: 0.6 });
        expect(between.map((k) => k.at)).toEqual([11, 12, 13]);
        expect(between[1]?.x).toBeCloseTo(0.5);
        expect(between[1]?.y).toBe(0.6);
        expect(withKey(moving, 13.02, { opacity: 0.5 })).toHaveLength(2);
    });
});
