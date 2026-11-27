// The couple's mood boards, one per function, and the photos pinned to them. Uploads live under
// boards/<invitation>/, never public/, and are only ever handed to the couple, the studio and our
// own browser photographing the board.
import { boardPinPrefix } from '@shared/board';
import { newId, newToken } from '@shared/ids';
import { photoExtension, type PhotoMime } from '@shared/photos';
import { type BoardInput, boardInput } from '@shared/schemas/board';
import { and, eq } from 'drizzle-orm';

import { moodBoards } from '../db/schema';
import { getPlatform } from '../platform/context';

export interface StoredBoard {
    eventId: string;
    data: BoardInput;
    updatedAt: string;
}

const clean = (data: unknown): BoardInput => boardInput.parse(data ?? {});

export async function listBoards(invitationId: string): Promise<StoredBoard[]> {
    const { db } = getPlatform();
    const rows = await db
        .select({
            eventId: moodBoards.eventId,
            data: moodBoards.data,
            updatedAt: moodBoards.updatedAt,
        })
        .from(moodBoards)
        .where(eq(moodBoards.invitationId, invitationId));
    return rows.map((r) => ({
        ...r,
        data: clean(r.data),
    }));
}

const isUpload = (invitationId: string, key: string) =>
    key.startsWith(boardPinPrefix(invitationId)) && !key.includes('..');

// Saves the board as sent; photos of theirs taken off it leave storage too.
export async function saveBoard(invitationId: string, eventId: string, data: BoardInput) {
    const { db, blob } = getPlatform();
    const [before] = await db
        .select({ data: moodBoards.data })
        .from(moodBoards)
        .where(and(eq(moodBoards.invitationId, invitationId), eq(moodBoards.eventId, eventId)));
    // Only their own uploads or our stock imports can be pinned; anything else is dropped.
    const pins = data.pins.filter(
        (p) => isUpload(invitationId, p.key) || p.key.startsWith('public/stock/'),
    );
    const next = {
        ...data,
        pins,
    };
    const updatedAt = new Date().toISOString();
    await db
        .insert(moodBoards)
        .values({
            invitationId,
            eventId,
            data: next,
            shotToken: newToken(),
        })
        .onConflictDoUpdate({
            target: [moodBoards.invitationId, moodBoards.eventId],
            set: {
                data: next,
                updatedAt,
            },
        });
    const kept = new Set(pins.map((p) => p.key));
    const gone = before ? clean(before.data).pins.filter((p) => !kept.has(p.key)) : [];
    await Promise.all(
        gone.filter((p) => isUpload(invitationId, p.key)).map((p) => blob.delete(p.key)),
    );
    return next;
}

export async function storeBoardPin(invitationId: string, mime: PhotoMime, body: ArrayBuffer) {
    const key = `${boardPinPrefix(invitationId)}${newId()}.${photoExtension(mime)}`;
    await getPlatform().blob.put(key, body, {
        contentType: mime,
        cacheControl: 'private, max-age=31536000, immutable',
    });
    return key;
}

// A pinned photo, only if it belongs to this invitation's boards (or is our own stock copy).
export async function readBoardPin(invitationId: string, key: string) {
    if (!isUpload(invitationId, key) && !key.startsWith('public/stock/')) return null;
    if (key.includes('..')) return null;
    return getPlatform().blob.get(key);
}

// For our own browser photographing a board: which board a private token opens.
export async function boardByToken(token: string) {
    const { db } = getPlatform();
    const [row] = await db
        .select({
            invitationId: moodBoards.invitationId,
            eventId: moodBoards.eventId,
            data: moodBoards.data,
            updatedAt: moodBoards.updatedAt,
        })
        .from(moodBoards)
        .where(eq(moodBoards.shotToken, token));
    return row
        ? {
              ...row,
              data: clean(row.data),
          }
        : null;
}

export async function boardToken(invitationId: string, eventId: string) {
    const { db } = getPlatform();
    const [row] = await db
        .select({ token: moodBoards.shotToken })
        .from(moodBoards)
        .where(and(eq(moodBoards.invitationId, invitationId), eq(moodBoards.eventId, eventId)));
    return row?.token ?? null;
}
