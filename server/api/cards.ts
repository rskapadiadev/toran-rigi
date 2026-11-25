// The matching cards of an invitation, for the couple and for the studio: what there is, each file,
// and everything in one zip. Each caller brings its own check.
import { cardFileName, cardLayers, storyLayer } from '@shared/cards';
import { isSide } from '@shared/guests';
import { namesOf } from '@shared/people';
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
import type { CallerOf } from './guest-list';

interface Checks<E extends Env> {
    see: (c: CallerOf<E>, invitationId: string) => Promise<unknown>;
    // Files are part of what was bought, so the couple's are ready once it's paid for.
    download: (c: CallerOf<E>, invitationId: string) => Promise<unknown>;
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

export function cardsApi<E extends AppEnv>({ see, download }: Checks<E>) {
    const app = new Hono<E>();
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
            return file(
                bytes,
                cardFileName(source.full.invitation.slug, card, suffix(v, source)),
                card.ext === 'pdf' ? 'application/pdf' : 'image/png',
            );
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
            return file(bytes, `${name}.pdf`, 'application/pdf');
        } catch (error) {
            return failed(c, error);
        }
    });

    return app;
}
