// The couple's mood boards, for them and for the studio: each function's board, its photos, a stock
// search, and the board as a picture or a PDF. Each caller brings its own check.
import { boardFileName } from '@shared/board';
import { eventLabel, pickText } from '@shared/cultures';
import { namesOf } from '@shared/people';
import { PHOTO_MAX_BYTES, type PhotoMime, photoMimes } from '@shared/photos';
import { boardInput } from '@shared/schemas/board';
import { stockProviders } from '@shared/stock';
import type { Context, Env } from 'hono';
import { Hono } from 'hono';
import { z } from 'zod';

import type { AppEnv } from '../app';
import { fail } from '../lib/http';
import { boardByToken, listBoards, readBoardPin, saveBoard, storeBoardPin } from '../repos/boards';
import { cardSource } from '../repos/invitations';
import { boardsPdf, renderBoards } from '../services/boards';
import { CardUnavailable } from '../services/cards';
import { importStock, pixabayConfigured, searchStock, StockError } from '../services/stock';
import type { CallerOf } from './guest-list';

interface Checks<E extends Env> {
    see: (c: CallerOf<E>, invitationId: string) => Promise<unknown>;
}

const isPhotoMime = (type: string): type is PhotoMime =>
    (photoMimes as readonly string[]).includes(type);

const file = (bytes: Uint8Array, name: string, type: string) =>
    new Response(new Blob([new Uint8Array(bytes)], { type }), {
        headers: {
            'content-type': type,
            'content-disposition': `attachment; filename="${name}"`,
            'cache-control': 'private, max-age=0',
        },
    });

// A pinned photo, shown only to whoever may open the board; never cached by anyone in between.
async function pinResponse(invitationId: string, key: string) {
    const found = await readBoardPin(invitationId, key);
    if (!found) return null;
    return new Response(found.body, {
        headers: {
            'content-type': found.contentType,
            'cache-control': 'private, max-age=3600',
            'x-content-type-options': 'nosniff',
        },
    });
}

const searchInput = z.object({
    provider: z.enum(stockProviders).default('openverse'),
    q: z.string().trim().min(1).max(80),
    page: z.coerce.number().int().min(1).max(10).default(1),
});

const importInput = z.object({
    provider: z.enum(stockProviders),
    id: z.string().trim().min(1).max(64),
});

export function boardsApi<E extends AppEnv>({ see }: Checks<E>) {
    const app = new Hono<E>();
    const failed = (c: Context, error: unknown) => {
        if (error instanceof StockError) return fail(c, 422, error.message);
        console.error('[boards]', error);
        return fail(
            c,
            409,
            error instanceof CardUnavailable
                ? error.message
                : 'The board couldn’t be made just now. Please try again in a minute.',
        );
    };
    const source = async (id: string) => {
        const found = await cardSource({ id });
        if (!found) throw new CardUnavailable('Invitation not found');
        return found;
    };

    app.get('/:id/boards', async (c) => {
        const id = c.req.param('id');
        await see(c, id);
        const { full } = await source(id);
        const lang = full.invitation.locales[0] ?? 'en';
        const saved = new Map((await listBoards(id)).map((b) => [b.eventId, b]));
        return c.json({
            slug: full.invitation.slug,
            culture: full.invitation.culture,
            names: namesOf(full.invitation.content, lang),
            stock: {
                pixabay: pixabayConfigured(),
                openverse: true,
            },
            functions: full.events.map((e) => ({
                id: e.id,
                kind: e.kind,
                title: pickText(e.title, lang) || eventLabel(full.invitation.culture, e.kind, lang),
                startsAt: e.startsAt,
                venue: e.venue,
                dressCode: e.dressCode,
                board: saved.get(e.id)?.data ?? null,
                updatedAt: saved.get(e.id)?.updatedAt ?? null,
            })),
        });
    });

    app.put('/:id/boards/:eventId', async (c) => {
        const id = c.req.param('id');
        await see(c, id);
        const { full } = await source(id);
        const eventId = c.req.param('eventId');
        if (!full.events.some((e) => e.id === eventId))
            return fail(c, 404, 'That function isn’t part of this invitation');
        const parsed = boardInput.safeParse(await c.req.json().catch(() => null));
        if (!parsed.success) return fail(c, 422, 'Check the board and try again');
        return c.json({
            ok: true,
            board: await saveBoard(id, eventId, parsed.data),
        });
    });

    app.post('/:id/boards/pins', async (c) => {
        const id = c.req.param('id');
        await see(c, id);
        if (!(await c.env.rateLimit.limit(`board-pins:${id}`)).success)
            return fail(c, 429, 'That’s a lot of photos at once. Give it a minute');
        const body = (await c.req.parseBody()) as Record<string, unknown>;
        const upload = body.file;
        if (!(upload instanceof File)) return fail(c, 422, 'Choose a photo');
        if (!isPhotoMime(upload.type)) return fail(c, 422, 'Use a JPG, PNG, WebP or AVIF photo');
        if (upload.size > PHOTO_MAX_BYTES) return fail(c, 422, 'Keep each photo under 6 MB');
        const key = await storeBoardPin(id, upload.type, await upload.arrayBuffer());
        return c.json({ key }, 201);
    });

    app.get('/:id/boards/pin', async (c) => {
        const id = c.req.param('id');
        await see(c, id);
        return (await pinResponse(id, c.req.query('key') ?? '')) ?? fail(c, 404, 'Not found');
    });

    // Free photos to pin. Only the words typed into the search go to the library.
    app.get('/:id/boards/stock', async (c) => {
        const id = c.req.param('id');
        await see(c, id);
        const parsed = searchInput.safeParse(c.req.query());
        if (!parsed.success) return fail(c, 422, 'Type what you’re looking for');
        if (!(await c.env.rateLimit.limit(`board-stock:${id}`)).success)
            return fail(c, 429, 'Give it a minute, then search again');
        const { provider, q, page } = parsed.data;
        try {
            return c.json(await searchStock(provider, 'photo', q, page));
        } catch (error) {
            return failed(c, error);
        }
    });

    app.post('/:id/boards/stock', async (c) => {
        const id = c.req.param('id');
        await see(c, id);
        const parsed = importInput.safeParse(await c.req.json().catch(() => null));
        if (!parsed.success) return fail(c, 422, 'Pick a photo');
        if (!(await c.env.rateLimit.limit(`board-pins:${id}`)).success)
            return fail(c, 429, 'That’s a lot of photos at once. Give it a minute');
        try {
            const asset = await importStock(parsed.data.provider, 'photo', parsed.data.id);
            return c.json({
                key: asset.blobKey,
                credit: {
                    title: asset.title.slice(0, 200) || undefined,
                    author: asset.creator.slice(0, 200) || undefined,
                    license: asset.license.slice(0, 80),
                    url: asset.sourceUrl,
                },
            });
        } catch (error) {
            return failed(c, error);
        }
    });

    app.get('/:id/boards/all.pdf', async (c) => {
        const id = c.req.param('id');
        await see(c, id);
        const { full } = await source(id);
        if (!(await c.env.rateLimit.limit(`cards:${id}`)).success)
            return fail(c, 429, 'Give it a minute, then try again');
        try {
            const images = await renderBoards(
                id,
                full.events.map((e) => e.id),
                new URL(c.req.url).origin,
            );
            const name = [full.invitation.slug, 'mood-boards'].filter(Boolean).join('-');
            return file(await boardsPdf(images), `${name}.pdf`, 'application/pdf');
        } catch (error) {
            return failed(c, error);
        }
    });

    app.get('/:id/boards/:eventId/board.png', async (c) => {
        const id = c.req.param('id');
        await see(c, id);
        const { full } = await source(id);
        const event = full.events.find((e) => e.id === c.req.param('eventId'));
        if (!event) return fail(c, 404, 'That function isn’t part of this invitation');
        if (!(await c.env.rateLimit.limit(`cards:${id}`)).success)
            return fail(c, 429, 'Give it a minute, then try again');
        const lang = full.invitation.locales[0] ?? 'en';
        const title =
            pickText(event.title, lang) || eventLabel(full.invitation.culture, event.kind, 'en');
        try {
            const [bytes] = await renderBoards(id, [event.id], new URL(c.req.url).origin);
            if (!bytes) throw new CardUnavailable('That board couldn’t be made');
            return file(bytes, boardFileName(full.invitation.slug, title), 'image/png');
        } catch (error) {
            return failed(c, error);
        }
    });

    return app;
}

// Our own browser photographing a board reaches its photos through the board's private token.
export const boardShotsApi = new Hono<AppEnv>();

boardShotsApi.get('/:token/pin', async (c) => {
    const board = await boardByToken(c.req.param('token'));
    if (!board) return c.notFound();
    return (await pinResponse(board.invitationId, c.req.query('key') ?? '')) ?? c.notFound();
});
