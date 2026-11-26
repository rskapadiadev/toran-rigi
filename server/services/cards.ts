// The matching cards as files: each is photographed from its own private page and kept per version
// of the invitation, so a changed date gives new cards and nothing is drawn twice.
import {
    BLEED,
    type CardFace,
    cardFileName,
    type CardInfo,
    cardsFor,
    faceSize,
    mainEvent,
    UNITS_PER_INCH,
} from '@shared/cards';
import { eventLabel, pickText } from '@shared/cultures';
import { forViewer } from '@shared/families';
import { inviteLink, type Side, visibleEvents } from '@shared/guests';
import { newToken } from '@shared/ids';
import { isSolemn, occasionOf } from '@shared/occasions';
import { showsSection } from '@shared/sections';
import { zipStore } from '@shared/zip';
import { PDFDocument, rgb } from 'pdf-lib';

import { getPlatform } from '../platform/context';
import type { CardShot } from '../platform/types';
import { ensureSideLinks, listGroups } from '../repos/guests';
import type { CardSource, PublicInvitation } from '../repos/invitations';

// Bump when the cards are redrawn, so stored pictures are made again.
const DESIGN = 'c5';

export class CardUnavailable extends Error {}

export interface CardVersion {
    // Whose: one family's version, or the main one.
    who: Side | null;
    lang: string;
}

// What one version's cards are drawn from. A function's own card is drawn even when the function is
// private, because the couple send it to the people it is for; every other card shows only what
// this version's guests may see.
export function cardData(full: PublicInvitation, who: Side | null, eventId?: string) {
    const version = forViewer(full, who ? { side: who } : undefined);
    if (!eventId) {
        if (showsSection(full.invitation.sections, 'events')) return version;
        // Ceremonies are switched off: the cards keep the day itself and list no functions.
        const main = mainEvent(version.events);
        return {
            ...version,
            events: main ? [main] : [],
        };
    }
    const open = full.events.map((e) => ({
        ...e,
        audience: null,
    }));
    const only = forViewer(
        {
            ...full,
            events: open.filter((e) => e.id === eventId),
        },
        undefined,
    );
    return {
        ...version,
        events: only.events,
    };
}

// The printed card's QR code opens the same version it was printed for.
export async function cardLink(full: PublicInvitation, who: Side | null): Promise<string> {
    const origin = getPlatform().config.APP_ORIGIN.replace(/\/$/, '');
    const { id, slug } = full.invitation;
    if (!who) return inviteLink(origin, slug);
    await ensureSideLinks(id, () => newToken().slice(0, 12));
    const side = (await listGroups(id)).find((g) => g.kind === 'side' && g.side === who);
    return inviteLink(origin, slug, side?.token);
}

export function cardList(full: PublicInvitation, who: Side | null, lang: string): CardInfo[] {
    const named = full.events.map((e) => ({
        ...e,
        title: pickText(e.title, lang) || eventLabel(full.invitation.culture, e.kind, lang),
    }));
    return cardsFor({
        shown: visibleEvents(named, who ? { side: who } : undefined),
        all: named,
        solemn: isSolemn(occasionOf(full.invitation.eventKind)),
        functions: showsSection(full.invitation.sections, 'events'),
    });
}

const PRINT_SCALE = 6;

function shotOf(
    source: CardSource,
    origin: string,
    card: CardInfo,
    face: CardFace,
    v: CardVersion,
) {
    const query = new URLSearchParams({
        face,
        lang: v.lang,
        ...(v.who && { who: v.who }),
        ...(card.eventId && { event: card.eventId }),
        ...(card.layer && { layer: card.layer }),
    });
    const shot: CardShot = {
        url: `${origin}/p/${source.previewToken}/card?${query.toString()}`,
        ...faceSize[face],
        scale: 2,
        type: 'png',
        transparent: card.layer === 'words',
    };
    if (card.kind === 'print')
        return {
            ...shot,
            // 600 dots to the inch, so small print stays crisp.
            scale: PRINT_SCALE,
            type: 'jpeg' as const,
        };
    if (card.kind === 'invite')
        return {
            ...shot,
            scale: 1080 / (shot.width - BLEED * 2),
            // The picture to send has no bleed.
            clip: {
                x: BLEED,
                y: BLEED,
                width: shot.width - BLEED * 2,
                height: shot.height - BLEED * 2,
            },
        };
    return shot;
}

// Print shops need the bleed past the cut, crop marks outside it, and boxes that say which is which.
export async function printPdf(sides: Uint8Array[], title: string): Promise<Uint8Array> {
    const points = (units: number) => (units / UNITS_PER_INCH) * 72;
    const { width, height } = faceSize.front;
    const art = {
        width: points(width),
        height: points(height),
    };
    const bleed = points(BLEED);
    const slug = 18;
    const pdf = await PDFDocument.create();
    pdf.setTitle(title);
    pdf.setCreator('Toran by TheRigi');
    for (const side of sides) {
        const page = pdf.addPage([art.width + slug * 2, art.height + slug * 2]);
        const trim = slug + bleed;
        const trimW = art.width - bleed * 2;
        const trimH = art.height - bleed * 2;
        page.drawImage(await pdf.embedJpg(side), {
            x: slug,
            y: slug,
            ...art,
        });
        page.setBleedBox(slug, slug, art.width, art.height);
        page.setTrimBox(trim, trim, trimW, trimH);
        const mark = (x1: number, y1: number, x2: number, y2: number) => {
            page.drawLine({
                start: {
                    x: x1,
                    y: y1,
                },
                end: {
                    x: x2,
                    y: y2,
                },
                thickness: 0.4,
                color: rgb(0, 0, 0),
            });
        };
        for (const x of [trim, trim + trimW]) {
            mark(x, 2, x, slug - 4);
            mark(x, slug * 2 + art.height - 2, x, slug + art.height + 4);
        }
        for (const y of [trim, trim + trimH]) {
            mark(2, y, slug - 4, y);
            mark(slug * 2 + art.width - 2, y, slug + art.width + 4, y);
        }
    }
    return pdf.save();
}

const prefixOf = (source: CardSource) =>
    `cards/${source.full.invitation.id}/${source.full.invitation.status === 'published' ? 'live' : 'draft'}-v${String(source.full.invitation.version)}-${source.updatedAt.replace(/[^0-9]/g, '')}/`;

const keyOf = (source: CardSource, card: CardInfo, v: CardVersion) =>
    `${prefixOf(source)}${DESIGN}-${card.id.replace(':', '-')}-${v.lang}-${v.who ?? 'main'}.${card.ext}`;

// Earlier versions' pictures are never served again.
async function forgetOld(source: CardSource) {
    const { blob } = getPlatform();
    const all = await blob.list(`cards/${source.full.invitation.id}/`);
    for (const key of all) if (!key.startsWith(prefixOf(source))) await blob.delete(key);
}

async function read(key: string): Promise<Uint8Array | null> {
    const stored = await getPlatform().blob.get(key);
    return stored ? new Uint8Array(await new Response(stored.body).arrayBuffer()) : null;
}

// Every card asked for, the missing ones made in one sitting of the browser.
export async function renderCards(
    source: CardSource,
    cards: readonly CardInfo[],
    v: CardVersion,
    origin: string,
): Promise<Uint8Array[]> {
    const platform = getPlatform();
    const { blob, capturer } = platform;
    const found = await Promise.all(cards.map((card) => read(keyOf(source, card, v))));
    const missing = cards.filter((_, i) => !found[i]);
    if (missing.length === 0) return found.filter((f) => f !== null);
    if (!capturer) throw new CardUnavailable('Cards can’t be made on this server');
    const jobs = missing.map((card) => ({
        card,
        shots: (card.kind === 'print' ? (['front', 'back'] as const) : [card.face]).map((face) =>
            shotOf(source, origin, card, face, v),
        ),
    }));
    const images = await capturer.cards(jobs.flatMap((j) => j.shots));
    const made = new Map<string, Uint8Array>();
    let at = 0;
    for (const { card, shots } of jobs) {
        const own = images.slice(at, at + shots.length);
        at += shots.length;
        const bytes =
            card.kind === 'print' ? await printPdf(own, source.full.invitation.slug) : own[0];
        if (!bytes) throw new CardUnavailable('That card couldn’t be made');
        made.set(card.id, bytes);
        await blob.put(keyOf(source, card, v), bytes, {
            contentType: card.ext === 'pdf' ? 'application/pdf' : 'image/png',
            cacheControl: 'private, max-age=0',
        });
    }
    platform.background(forgetOld(source));
    return cards.flatMap((card, i) => found[i] ?? made.get(card.id) ?? []);
}

export async function cardsZip(
    source: CardSource,
    v: CardVersion,
    origin: string,
): Promise<Uint8Array<ArrayBuffer>> {
    const cards = cardList(source.full, v.who, v.lang);
    const files = await renderCards(source, cards, v, origin);
    return zipStore(
        files.flatMap((data, i) => {
            const card = cards[i];
            return card
                ? [
                      {
                          name: cardFileName(source.full.invitation.slug, card),
                          data,
                      },
                  ]
                : [];
        }),
    );
}
