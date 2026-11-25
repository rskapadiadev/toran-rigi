import { cultureIds } from '@shared/cultures';
import { demoInvitations } from '@shared/demo';
import { defaultMusicStyle, musicStyleInfo } from '@shared/music';
import { isSolemn, occasionOf } from '@shared/occasions';
import { describe, expect, it } from 'vitest';

describe('music on every design', () => {
    it.each(demoInvitations.map((d) => [d.slug, d] as const))('%s has its own', (_slug, demo) => {
        const { music } = demo.extras;
        expect(music?.source).toBe('generated');
        const info = music?.style && musicStyleInfo[music.style];
        expect(info).toBeDefined();
        if (isSolemn(occasionOf(demo.occasion))) expect(info?.gentle).toBe(true);
    });

    it('starts every tradition on a sound that suits it', () => {
        for (const culture of cultureIds)
            for (const tone of ['festive', 'joyful', 'serene', 'solemn', 'formal']) {
                const style = defaultMusicStyle({
                    culture,
                    tone,
                    category: 'celebrations',
                });
                expect(musicStyleInfo[style].suits, `${culture} ${tone}`).toContain(culture);
            }
    });

    it('never gives a solemn gathering anything but the quietest', () => {
        const fit = {
            tone: 'solemn',
            category: 'remembrance',
        };
        for (const culture of ['hindu', 'islamic.arab', 'christian', 'universal'])
            expect(
                defaultMusicStyle({
                    ...fit,
                    culture,
                }),
            ).toBe('ambient');
    });
});
