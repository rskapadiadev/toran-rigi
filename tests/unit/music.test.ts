import { existsSync, readFileSync } from 'node:fs';

import { cultureIds } from '@shared/cultures';
import { demoInvitations } from '@shared/demo';
import { defaultMusicStyle, musicStyleInfo, musicUrl } from '@shared/music';
import { shippedTracks, trackForDesign } from '@shared/tracks';
import { describe, expect, it } from 'vitest';

describe('music on every design', () => {
    it.each(demoInvitations.map((d) => [d.slug, d] as const))(
        '%s plays a real recording',
        (_slug, demo) => {
            const { music } = demo.extras;
            expect(music?.source).toBe('library');
            const track = shippedTracks.find((t) => t.id === music?.trackId);
            expect(track?.blobKey).toBe(music?.blobKey);
            // Islamic designs never open with another tradition's music, nor the other way round.
            const islamic = demo.culture.startsWith('islamic');
            if (track?.culture) expect(track.culture.startsWith('islamic')).toBe(islamic);
        },
    );

    it('gives a notice of passing the sad piano', () => {
        expect(trackForDesign('smriti')?.title).toBe('Sad Music');
    });

    it.each(shippedTracks.map((t) => [t.id, t] as const))(
        '%s is shipped and free to use',
        (_id, t) => {
            expect(existsSync(`public${t.blobKey}`)).toBe(true);
            // Never NC (it is sold), ND (it is trimmed) or SA (it goes in videos).
            expect(t.license).toMatch(/^(CC0|CC BY \d\.0)$/);
            expect(t.sourceUrl).toMatch(/^https:/);
            // The database row and the code must not drift apart.
            expect(readFileSync('migrations/0017_real_music.sql', 'utf8')).toContain(
                `('${t.id}','${t.title}','${t.artist}'`,
            );
            expect(musicUrl(t.blobKey)).toBe(`/media${t.blobKey}`);
        },
    );

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
