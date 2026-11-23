import fs from 'node:fs';

import { kitAvif } from '@shared/kit-avif';
import { photoUrl } from '@shared/photos';
import { describe, expect, it } from 'vitest';

describe('photoUrl', () => {
    it('serves kit artwork as AVIF when an AVIF copy ships', () => {
        expect(photoUrl('/kits/phoolwari/shanti-stage.webp')).toBe(
            '/kits/phoolwari/shanti-stage.avif',
        );
    });

    it('keeps WebP for artwork without a copy and for film stills', () => {
        expect(photoUrl('/kits/phoolwari/meadow.webp')).toBe('/kits/phoolwari/meadow.webp');
        expect(photoUrl('/kits/deepmala/film-last.webp')).toBe('/kits/deepmala/film-last.webp');
    });

    it('leaves uploaded photos and picked-but-unsaved photos alone', () => {
        expect(photoUrl('public/invitations/x/photos/a.webp')).toBe(
            '/media/public/invitations/x/photos/a.webp',
        );
        expect(photoUrl('blob:abc')).toBe('blob:abc');
    });

    it('lists only AVIF copies that exist, each beside its WebP fallback', () => {
        for (const key of kitAvif) {
            expect(fs.existsSync(`public${key}`)).toBe(true);
            expect(fs.existsSync(`public${key.replace(/\.webp$/, '.avif')}`)).toBe(true);
        }
    });
});
