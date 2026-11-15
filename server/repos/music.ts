// The studio's licensed music library, and resolving which file an invitation plays.
import { newId } from '@shared/ids';
import { libraryMusicKey, musicExtension, uploadMusicPrefix } from '@shared/music';
import type { StockAsset } from '@shared/stock';
import type { InvitationExtras } from '@shared/types';
import { asc, eq } from 'drizzle-orm';

import { musicTracks } from '../db/schema';
import { getPlatform } from '../platform/context';

export type MusicTrackRow = typeof musicTracks.$inferSelect;

export async function listTracks(activeOnly: boolean) {
    const { db } = getPlatform();
    const query = db.select().from(musicTracks).orderBy(asc(musicTracks.title));
    return activeOnly ? query.where(eq(musicTracks.isActive, true)) : query;
}

export async function getTrack(id: string) {
    const { db } = getPlatform();
    return db.select().from(musicTracks).where(eq(musicTracks.id, id)).get();
}

interface NewTrack {
    title: string;
    artist?: string;
    culture?: string;
    licenseUrl: string;
    durationSec?: number;
    mime: string;
    body: ArrayBuffer;
}

export async function createTrack(input: NewTrack): Promise<MusicTrackRow> {
    const { db, blob } = getPlatform();
    const id = newId();
    const blobKey = libraryMusicKey(id, input.mime);
    await blob.put(blobKey, input.body, {
        contentType: input.mime,
        cacheControl: 'public, max-age=31536000, immutable',
    });
    const row = {
        id,
        title: input.title,
        artist: input.artist ?? null,
        culture: input.culture ?? null,
        blobKey,
        licenseUrl: input.licenseUrl,
        durationSec: input.durationSec ?? null,
        isActive: true,
    };
    await db.insert(musicTracks).values(row);
    return row;
}

export async function updateTrack(
    id: string,
    patch: Partial<Pick<MusicTrackRow, 'title' | 'artist' | 'culture' | 'licenseUrl' | 'isActive'>>,
) {
    const { db } = getPlatform();
    await db.update(musicTracks).set(patch).where(eq(musicTracks.id, id));
}

/** A track imported from free stock (Openverse): its credit becomes the artist and licence. */
export async function trackFromStock(asset: StockAsset): Promise<MusicTrackRow> {
    const { db } = getPlatform();
    // Picking the same song twice reuses the first library entry.
    const existing = await db
        .select()
        .from(musicTracks)
        .where(eq(musicTracks.blobKey, asset.blobKey))
        .get();
    if (existing) {
        if (!existing.isActive) await updateTrack(existing.id, { isActive: true });
        return {
 ...existing,
isActive: true 
};
    }
    const row = {
        id: newId(),
        title: asset.title.slice(0, 120),
        artist: `${asset.creator} · ${asset.license}`.slice(0, 120),
        culture: null,
        blobKey: asset.blobKey,
        licenseUrl: asset.licenseUrl,
        durationSec: asset.durationSec ?? null,
        isActive: true,
    };
    await db.insert(musicTracks).values(row);
    return row;
}

/** Stores a customer's own song for one invitation; the caller has already confirmed the rights. */
export async function storeUpload(invitationId: string, mime: string, body: ArrayBuffer) {
    const { blob } = getPlatform();
    const key = `${uploadMusicPrefix(invitationId)}${newId()}.${musicExtension(mime)}`;
    await blob.put(key, body, {
        contentType: mime,
        cacheControl: 'public, max-age=31536000, immutable',
    });
    return key;
}

/**
 * Which stored file the invitation plays, decided on the server: a library pick uses the track's own
 * file (never a key the browser sent), an upload must live in this invitation's own folder, and
 * generated music needs no file at all.
 */
export async function resolveMusic(
    invitationId: string,
    music: InvitationExtras['music'],
): Promise<{ musicBlobKey: string | null;
musicTrackId: string | null }> {
    const none = {
        musicBlobKey: null,
        musicTrackId: null,
    };
    if (!music?.source || music.source === 'none' || music.source === 'generated') return none;
    if (music.source === 'library') {
        const track = music.trackId ? await getTrack(music.trackId) : undefined;
        // A retired track keeps playing where it was already chosen.
        return track
            ? {
                  musicBlobKey: track.blobKey,
                  musicTrackId: track.id,
              }
            : none;
    }
    const key = music.blobKey ?? '';
    return key.startsWith(uploadMusicPrefix(invitationId)) && !key.includes('..')
        ? {
              musicBlobKey: key,
              musicTrackId: null,
          }
        : none;
}
