// Mood boards as files: photographed from a private page only our own browser can open, one
// picture per function, or all of them in one PDF for the decorator.
import { BOARD_SIZE } from '@shared/board';
import { PDFDocument } from 'pdf-lib';

import { getPlatform } from '../platform/context';
import { boardToken, saveBoard } from '../repos/boards';
import { CardUnavailable } from './cards';

// A board that was never saved is drawn empty, so it gets its row (and its private token) first.
async function tokenFor(invitationId: string, eventId: string) {
    const found = await boardToken(invitationId, eventId);
    if (found) return found;
    await saveBoard(invitationId, eventId, {
        theme: '',
        palette: [],
        words: [],
        notes: '',
        pins: [],
    });
    const made = await boardToken(invitationId, eventId);
    if (!made) throw new CardUnavailable('That board couldn’t be made');
    return made;
}

export async function renderBoards(
    invitationId: string,
    eventIds: readonly string[],
    origin: string,
): Promise<Uint8Array[]> {
    const { capturer } = getPlatform();
    if (!capturer) throw new CardUnavailable('Boards can’t be made on this server');
    const tokens = await Promise.all(eventIds.map((e) => tokenFor(invitationId, e)));
    const images = await capturer.cards(
        tokens.map((token) => ({
            url: `${origin}/b/${token}`,
            ...BOARD_SIZE,
            scale: 2,
            type: 'png' as const,
        })),
    );
    if (images.length !== eventIds.length) throw new CardUnavailable('A board couldn’t be made');
    return images;
}

// Every board, a page each, at the board's own shape.
export async function boardsPdf(images: readonly Uint8Array[]): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    pdf.setTitle('Mood boards');
    pdf.setProducer('Toran');
    for (const bytes of images) {
        const png = await pdf.embedPng(bytes);
        const page = pdf.addPage([BOARD_SIZE.width, BOARD_SIZE.height]);
        page.drawImage(png, {
            x: 0,
            y: 0,
            width: BOARD_SIZE.width,
            height: BOARD_SIZE.height,
        });
    }
    return pdf.save();
}
