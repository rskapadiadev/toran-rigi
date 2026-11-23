// Cover: the film opening's last frame, full screen, with the names where the film left them, so
// guests who watched it see the film simply settle into the page. Without a film it shows the
// couple's cover photo the same way, and with neither, the arch cover.
import { COVER_SLOT, photoUrl } from '@shared/photos';
import type { CSSProperties } from 'react';

import { useInvite } from '../../context';
import { useFilmStage } from '../../film/FilmStage';
import { ArchCover } from '../../sections/covers';
import { FilmColumn, FilmFoot, FilmFrame, FilmNames } from '../opening/FilmOpening';

const screen: CSSProperties = { height: 'var(--inv-screen, 100svh)' };

export function FilmCover() {
    const { data } = useInvite();
    const { design, content } = data.invitation;
    // Over a film playing behind the page, the cover is just the names on the film's held frame.
    const behind = useFilmStage() !== null;
    if (behind)
        return (
            <section className="relative" style={screen}>
                <FilmColumn>
                    <FilmNames shown instant />
                </FilmColumn>
            </section>
        );
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
                    // Hidden under the opening at first: the opening's own still comes first.
                    fetchPriority="low"
                    decoding="async"
                    className="size-full object-cover"
                />
                <FilmNames shown instant />
                <FilmFoot shown />
            </FilmFrame>
        </section>
    );
}
