// Couple and family photos for one invitation, kept in blob storage under the invitation's prefix.
import { filmExtension, type FilmMime, filmPrefix } from '@shared/film';
import { newId } from '@shared/ids';
import { photoExtension, type PhotoMime, photoPrefix } from '@shared/photos';
import type { InvitationDesign } from '@shared/types';
import { sql } from 'drizzle-orm';

import { invitations, themes } from '../db/schema';
import { getPlatform } from '../platform/context';

export async function storePhoto(invitationId: string, mime: PhotoMime, body: ArrayBuffer) {
    const { blob } = getPlatform();
    const key = `${photoPrefix(invitationId)}${newId()}.${photoExtension(mime)}`;
    await blob.put(key, body, {
        contentType: mime,
        cacheControl: 'public, max-age=31536000, immutable',
    });
    return key;
}

// Only keys under this invitation's own prefix can be removed through it.
export async function deletePhoto(invitationId: string, key: string) {
    if (!key.startsWith(photoPrefix(invitationId)) || key.includes('..')) return false;
    await getPlatform().blob.delete(key);
    return true;
}

// A film opening's clip, stored beside the invitation's photos.
export async function storeFilm(invitationId: string, mime: FilmMime, body: ArrayBuffer) {
    const { blob } = getPlatform();
    const key = `${filmPrefix(invitationId)}${newId()}.${filmExtension(mime)}`;
    await blob.put(key, body, {
        contentType: mime,
        cacheControl: 'public, max-age=31536000, immutable',
    });
    return key;
}

type Film = NonNullable<InvitationDesign['film']>;

// The clip, its stills and the frame sheets cut from it for the film behind the invitation.
const filmKeys = (film: Film | undefined) =>
    film
        ? [
              film.src,
              film.first,
              film.last,
              ...(film.frames?.sheets ?? []),
              ...(film.scenes ?? []).flatMap((scene) => [
                  scene.image,
                  ...(scene.frames?.sheets ?? []),
              ]),
          ].filter((k): k is string => Boolean(k))
        : [];

// Still used by some design? Customer copies and the template itself can share one film's keys.
async function inUse(key: string) {
    const { db } = getPlatform();
    // The file's random name is unique on its own; D1 rejects LIKE patterns over ~50 bytes.
    const like = `%${key.split('/').at(-1) ?? key}%`;
    const hits = await db
        .select({ n: sql<number>`count(*)` })
        .from(invitations)
        .where(sql`${invitations.design} LIKE ${like}`)
        .get();
    if ((hits?.n ?? 0) > 0) return true;
    const themeHits = await db
        .select({ n: sql<number>`count(*)` })
        .from(themes)
        .where(sql`${themes.config} LIKE ${like}`)
        .get();
    return (themeHits?.n ?? 0) > 0;
}

// After a save: delete the film and stills the design let go of, once nothing else points at them.
// Only this invitation's own keys, so a customer's save can never remove a template's film.
export async function pruneFilm(invitationId: string, before?: Film, after?: Film) {
    const kept = new Set(filmKeys(after));
    const own = [filmPrefix(invitationId), photoPrefix(invitationId)];
    const dropped = filmKeys(before).filter(
        (k) => !kept.has(k) && !k.includes('..') && own.some((p) => k.startsWith(p)),
    );
    const removed: string[] = [];
    for (const key of dropped) {
        if (await inUse(key)) continue;
        await getPlatform().blob.delete(key);
        removed.push(key);
    }
    return removed;
}
