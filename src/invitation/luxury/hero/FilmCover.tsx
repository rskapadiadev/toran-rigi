// Cover: the film opening's last frame, full screen, with the names where the film left them, so
// guests who watched it see the film simply settle into the page. Without a film it shows the
// couple's cover photo the same way, and with neither, the arch cover.
import { COVER_SLOT, photoUrl } from '@shared/photos';
import type { CSSProperties } from 'react';

import { useInvite } from '../../context';
import { ArchCover } from '../../sections/covers';
import { FilmFoot, FilmFrame, FilmNames } from '../opening/FilmOpening';

const screen: CSSProperties = { height: 'var(--inv-screen, 100svh)' };

export function FilmCover() {
    const { data } = useInvite();
    const { design, content } = data.invitation;
    const key = design.film?.last ?? design.film?.first ?? content.coverPhotoKey;
    if (!key) return <ArchCover />;
    const still = photoUrl(key);
    return (
        <section className="relative overflow-hidden" style={screen}>
            <FilmFrame fill={still}>
                <img
                    src={still}
                    alt=""
                    data-photo-slot={COVER_SLOT}
                    className="size-full object-cover"
                />
                <FilmNames shown instant />
                <FilmFoot shown />
            </FilmFrame>
        </section>
    );
}
