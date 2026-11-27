// The matching cards of an invitation, for the couple and for the studio: what there is, each file,
// and everything in one zip. Each caller brings its own check.
import { cardFileName, cardLayers, storyLayer } from '@shared/cards';
import { isSide } from '@shared/guests';
import { namesOf } from '@shared/people';
import { postById, postFileName, postLooks, postPhoto } from '@shared/posts';
import { zipStore } from '@shared/zip';
import type { Context, Env } from 'hono';
import { Hono } from 'hono';

import type { AppEnv } from '../app';
import { fail } from '../lib/http';
import { type CardSource, cardSource } from '../repos/invitations';
import {
    cardData,
    cardLink,
    cardList,
    cardsZip,
    CardUnavailable,
    type CardVersion,
    renderCards,
} from '../services/cards';
import { invitationPdf } from '../services/pdf';
import { postData, postList, renderPosts } from '../services/posts';
import type { CallerOf } from './guest-list';

interface Checks<E extends Env> {
    see: (c: CallerOf<E>, invitationId: string) => Promise<unknown>;
    // Files are part of what was bought, so the couple's are ready once it's paid for.
    download: (c: CallerOf<E>, invitationId: string) => Promise<unknown>;
    // A file has been handed over, and whether taking the first one ends a refund. The couple's only.
    downloaded?: (invitationId: string) => Promise<unknown>;
    refundable?: (invitationId: string) => Promise<boolean>;
}

const versionOf = (c: Context, source: CardSource): CardVersion => {
    const who = c.req.query('who');
    const lang = c.req.query('lang');
    const { locales, content } = source.full.invitation;
    return {
        who: isSide(who) && content.people.two ? who : null,
        lang: lang && locales.includes(lang) ? lang : (locales[0] ?? 'en'),
    };
};

const file = (bytes: Uint8Array, name: string, type: string) =>
    new Response(new Blob([new Uint8Array(bytes)], { type }), {
        headers: {
            'content-type': type,
            'content-disposition': `attachment; filename="${name}"`,
            'cache-control': 'private, max-age=0',
        },
    });

const suffix = (v: CardVersion, source: CardSource) =>
    [
        v.who === 'one' ? 'family-1' : v.who === 'two' ? 'family-2' : '',
        source.full.invitation.locales.length > 1 ? v.lang : '',
    ]
        .filter(Boolean)
        .join('-');

export function cardsApi<E extends AppEnv>({ see, download, downloaded, refundable }: Checks<E>) {
    const app = new Hono<E>();
    // Never worth failing a download for.
    const taken = async (id: string) => {
        await downloaded?.(id).catch((error: unknown) => {
            console.error('[cards] note download', error);
        });
    };
    const failed = (c: Context, error: unknown) => {
        console.error('[cards]', error);
        return fail(
            c,
            409,
            error instanceof CardUnavailable
                ? error.message
                : 'The card couldn’t be made just now. Please try again in a minute.',
        );
    };

    app.get('/:id/cards', async (c) => {
        await see(c, c.req.param('id'));
        const source = await cardSource({ id: c.req.param('id') });
        if (!source) return fail(c, 404, 'Invitation not found');
        const v = versionOf(c, source);
        const ready = await download(c, c.req.param('id')).then(
            () => true,
            () => false,
        );
        return c.json({
            version: v,
            ready,
            refundable: ready && ((await refundable?.(c.req.param('id'))) ?? false),
            names: namesOf(source.full.invitation.content, v.lang),
            locales: source.full.invitation.locales,
            cards: cardList(source.full, v.who, v.lang),
            data: cardData(source.full, v.who),
            // Every function, so private ones' cards can be drawn too.
            functions: source.full.events.map((e) => ({
                id: e.id,
                private: Boolean(e.audience?.length),
                data: cardData(source.full, v.who, e.id).events[0],
            })),
            link: await cardLink(source.full, v.who),
        });
    });

    app.get('/:id/cards/all.zip', async (c) => {
        const id = c.req.param('id');
        await download(c, id);
        const source = await cardSource({ id });
        if (!source) return fail(c, 404, 'Invitation not found');
        if (!(await c.env.rateLimit.limit(`cards:${id}`)).success)
            return fail(c, 429, 'Give it a minute, then try again');
        const v = versionOf(c, source);
        try {
            const zip = await cardsZip(source, v, new URL(c.req.url).origin);
            const name = [source.full.invitation.slug, 'cards', suffix(v, source)]
                .filter(Boolean)
                .join('-');
            await taken(id);
            return file(zip, `${name}.zip`, 'application/zip');
        } catch (error) {
            return failed(c, error);
        }
    });

    app.get('/:id/cards/:card', async (c) => {
        const id = c.req.param('id');
        await download(c, id);
        const source = await cardSource({ id });
        if (!source) return fail(c, 404, 'Invitation not found');
        const v = versionOf(c, source);
        const list = cardList(source.full, v.who, v.lang);
        // The story's layers come with the story, for its video.
        const layers = list.some((x) => x.kind === 'story') ? cardLayers.map(storyLayer) : [];
        const card = [...list, ...layers].find((x) => x.id === c.req.param('card'));
        if (!card) return fail(c, 404, 'That card isn’t part of this invitation');
        if (!(await c.env.rateLimit.limit(`cards:${id}`)).success)
            return fail(c, 429, 'Give it a minute, then try again');
        try {
            const [bytes] = await renderCards(source, [card], v, new URL(c.req.url).origin);
            if (!bytes) throw new CardUnavailable('That card couldn’t be made');
            await taken(id);
            return file(
                bytes,
                cardFileName(source.full.invitation.slug, card, suffix(v, source)),
                card.ext === 'pdf' ? 'application/pdf' : 'image/png',
            );
        } catch (error) {
            return failed(c, error);
        }
    });

    // Posts for status, stories and the profile grid.
    app.get('/:id/posts', async (c) => {
        const id = c.req.param('id');
        await see(c, id);
        const source = await cardSource({ id });
        if (!source) return fail(c, 404, 'Invitation not found');
        const v = versionOf(c, source);
        const ready = await download(c, id).then(
            () => true,
            () => false,
        );
        const data = postData(source.full, v.who);
        return c.json({
            version: v,
            ready,
            refundable: ready && ((await refundable?.(id)) ?? false),
            locales: source.full.invitation.locales,
            names: namesOf(source.full.invitation.content, v.lang),
            posts: postList(source.full, v.who, v.lang),
            photo: postPhoto(data.invitation) !== undefined,
            data,
        });
    });

    // One post's picture; a grid comes as a zip of its tiles, numbered in the order to post them.
    app.get('/:id/posts/:post', async (c) => {
        const id = c.req.param('id');
        await download(c, id);
        const source = await cardSource({ id });
        if (!source) return fail(c, 404, 'Invitation not found');
        const v = versionOf(c, source);
        const post = postById(postList(source.full, v.who, v.lang), c.req.param('post'));
        if (!post) return fail(c, 404, 'That post isn’t part of this invitation');
        const asked = postLooks.find((l) => l === c.req.query('look')) ?? 'number';
        // No photo to frame: the number stands in, as the page offers.
        const look =
            asked === 'photo' && !postPhoto(postData(source.full, v.who).invitation)
                ? 'number'
                : asked;
        if (!(await c.env.rateLimit.limit(`cards:${id}`)).success)
            return fail(c, 429, 'Give it a minute, then try again');
        const slug = source.full.invitation.slug;
        const variant = suffix(v, source);
        try {
            if (post.tiles) {
                const tiles = Array.from({ length: post.tiles }, (_, i) => i + 1);
                const images = await renderPosts(
                    source,
                    tiles.map((tile) => ({
                        post,
                        look,
                        tile,
                    })),
                    v,
                    new URL(c.req.url).origin,
                );
                await taken(id);
                const zip = zipStore(
                    images.map((data, i) => ({
                        name: postFileName(slug, post, variant, i + 1),
                        data,
                    })),
                );
                return file(
                    zip,
                    `${postFileName(slug, post, variant).replace('.png', '')}.zip`,
                    'application/zip',
                );
            }
            const [bytes] = await renderPosts(
                source,
                [
                    {
                        post,
                        look,
                    },
                ],
                v,
                new URL(c.req.url).origin,
            );
            if (!bytes) throw new CardUnavailable('That post couldn’t be made');
            await taken(id);
            const named = post.kind === 'countdown' ? `${look}-${variant}` : variant;
            return file(bytes, postFileName(slug, post, named.replace(/-$/, '')), 'image/png');
        } catch (error) {
            return failed(c, error);
        }
    });

    // The whole invitation as a PDF, one per family and language.
    app.get('/:id/pdf', async (c) => {
        const id = c.req.param('id');
        await download(c, id);
        const source = await cardSource({ id });
        if (!source) return fail(c, 404, 'Invitation not found');
        if (!(await c.env.rateLimit.limit(`cards:${id}`)).success)
            return fail(c, 429, 'Give it a minute, then try again');
        const v = versionOf(c, source);
        try {
            const bytes = await invitationPdf(source, v, new URL(c.req.url).origin);
            const name = [source.full.invitation.slug, 'invitation', suffix(v, source)]
                .filter(Boolean)
                .join('-');
            await taken(id);
            return file(bytes, `${name}.pdf`, 'application/pdf');
        } catch (error) {
            return failed(c, error);
        }
    });

    return app;
}
