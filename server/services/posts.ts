// Posts as files: photographed like the cards from a private page, kept per version of the
// invitation. A profile grid is one page photographed once per tile.
import { mainEvent } from '@shared/cards';
import { eventLabel, pickText } from '@shared/cultures';
import type { Side } from '@shared/guests';
import { isSolemn, occasionOf } from '@shared/occasions';
import { gridTile, type PostInfo, type PostLook, postsFor, postSize } from '@shared/posts';

import { getPlatform } from '../platform/context';
import type { CardShot } from '../platform/types';
import type { CardSource, PublicInvitation } from '../repos/invitations';
import { cardData, CardUnavailable, type CardVersion, prefixOf, read } from './cards';

// Bump when the posts are redrawn, so stored pictures are made again.
const DESIGN = 'p1';

// A status is seen by every contact, so a post only ever shows what everyone is invited to.
export function postData(full: PublicInvitation, who: Side | null) {
    const open = new Set(full.events.filter((e) => !e.audience?.length).map((e) => e.id));
    const version = cardData(full, who);
    return {
        ...version,
        events: version.events.filter((e) => open.has(e.id)),
    };
}

// Today where the celebration is, so a countdown turns over at its own midnight.
const todayIn = (timeZone: string) =>
    new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());

export function postList(full: PublicInvitation, who: Side | null, lang: string): PostInfo[] {
    const { events, invitation } = postData(full, who);
    const main = mainEvent(events);
    return postsFor({
        events: events.map((e) => ({
            id: e.id,
            title: pickText(e.title, lang) || eventLabel(invitation.culture, e.kind, lang),
            date: e.startsAt.slice(0, 10),
        })),
        mainId: main?.id ?? null,
        solemn: isSolemn(occasionOf(invitation.eventKind)),
        today: todayIn(main?.timezone ?? 'Asia/Kolkata'),
    });
}

export interface PostJob {
    post: PostInfo;
    look: PostLook;
    // One tile of a grid, in posting order from 1.
    tile?: number;
}

function shotOf(source: CardSource, origin: string, job: PostJob, v: CardVersion): CardShot {
    const { post, look, tile } = job;
    const query = new URLSearchParams({
        face: post.face,
        lang: v.lang,
        ...(v.who && { who: v.who }),
        ...(post.kind === 'countdown' && { look }),
        ...(post.day !== undefined && { day: String(post.day) }),
        ...(post.eventId && { event: post.eventId }),
        ...(post.tiles && { tiles: String(post.tiles) }),
    });
    return {
        url: `${origin}/p/${source.previewToken}/post?${query.toString()}`,
        ...postSize(post.face, post.tiles),
        scale: 2,
        type: 'png',
        ...(post.tiles && tile !== undefined && { clip: gridTile(post.tiles, tile) }),
    };
}

const keyOf = (source: CardSource, job: PostJob, v: CardVersion) =>
    `${prefixOf(source)}${DESIGN}-${job.post.id.replace(':', '-')}-${job.post.kind === 'countdown' ? job.look : 'one'}-${String(job.tile ?? 0)}-${v.lang}-${v.who ?? 'main'}.png`;

// Every picture asked for, the missing ones made in one sitting of the browser.
export async function renderPosts(
    source: CardSource,
    jobs: readonly PostJob[],
    v: CardVersion,
    origin: string,
): Promise<Uint8Array[]> {
    const { blob, capturer } = getPlatform();
    const found = await Promise.all(jobs.map((job) => read(keyOf(source, job, v))));
    const missing = jobs.filter((_, i) => !found[i]);
    if (missing.length === 0) return found.filter((f) => f !== null);
    if (!capturer) throw new CardUnavailable('Posts can’t be made on this server');
    const images = await capturer.cards(missing.map((job) => shotOf(source, origin, job, v)));
    const made = new Map<PostJob, Uint8Array>();
    for (const [i, job] of missing.entries()) {
        const bytes = images[i];
        if (!bytes) throw new CardUnavailable('That post couldn’t be made');
        made.set(job, bytes);
        await blob.put(keyOf(source, job, v), bytes, {
            contentType: 'image/png',
            cacheControl: 'private, max-age=0',
        });
    }
    return jobs.flatMap((job, i) => found[i] ?? made.get(job) ?? []);
}
