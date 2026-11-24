// The matching cards that come with an invitation: a save-the-date, the invitation itself (to send
// and to print), a card for every function and a story. Sizes and lists only; src/invitation/cards
// draws them and server/services/cards photographs them.

// The ceremony the date belongs to: the wedding itself where there is one, else the first.
const MAIN = /phera|wedding|vivah|nikah|anand|laavan|chuppah|muhurt|ceremony|church/;
export const mainEvent = <T extends { kind: string }>(events: readonly T[]): T | undefined =>
    events.find((e) => MAIN.test(e.kind)) ?? events[0];

// What is drawn. A printed card has two: its front and its back.
export const cardFaces = ['save', 'event', 'story', 'front', 'back'] as const;
export type CardFace = (typeof cardFaces)[number];

interface FaceSize {
    width: number;
    height: number;
}

// Print is laid out at 100 units to the inch: 5 × 7 in, plus an eighth of an inch of bleed all round.
export const UNITS_PER_INCH = 100;
export const BLEED = 12.5;
export const faceSize: Record<CardFace, FaceSize> = {
    save: {
        width: 540,
        height: 675,
    },
    event: {
        width: 540,
        height: 675,
    },
    story: {
        width: 540,
        height: 960,
    },
    front: {
        width: 525,
        height: 725,
    },
    back: {
        width: 525,
        height: 725,
    },
};

// What is downloaded. `event:<id>` is one function's card.
export type CardKind = 'save' | 'invite' | 'print' | 'story' | 'event';

export interface CardInfo {
    id: string;
    kind: CardKind;
    title: string;
    // Pixels for a picture; the printed card is a PDF.
    size: string;
    ext: 'png' | 'pdf';
    face: CardFace;
    eventId?: string;
}

interface CardEvent {
    id: string;
    title: string;
}

interface CardsInput {
    // The functions on this version of the invitation, and every function there is.
    shown: readonly CardEvent[];
    all: readonly CardEvent[];
    // Nobody is asked to save the date of a prayer meet.
    solemn: boolean;
}

export function cardsFor({ shown, all, solemn }: CardsInput): CardInfo[] {
    const dated = shown.length > 0;
    const announce: CardInfo[] =
        dated && !solemn
            ? [
                  {
                      id: 'save',
                      kind: 'save',
                      title: 'Save the date',
                      size: '1080 × 1350',
                      ext: 'png',
                      face: 'save',
                  },
              ]
            : [];
    const story: CardInfo[] =
        dated && !solemn
            ? [
                  {
                      id: 'story',
                      kind: 'story',
                      title: 'Instagram story',
                      size: '1080 × 1920',
                      ext: 'png',
                      face: 'story',
                  },
              ]
            : [];
    const invitation: CardInfo[] = dated
        ? [
              {
                  id: 'invite',
                  kind: 'invite',
                  title: 'The invitation',
                  size: '1080 × 1512',
                  ext: 'png',
                  face: 'front',
              },
              {
                  id: 'print',
                  kind: 'print',
                  title: 'The printed invitation',
                  size: '5 × 7 in, two sides',
                  ext: 'pdf',
                  face: 'front',
              },
          ]
        : [];
    return [
        ...announce,
        ...invitation,
        ...all.map((e) => ({
            id: `event:${e.id}`,
            kind: 'event' as const,
            title: e.title,
            size: '1080 × 1350',
            ext: 'png' as const,
            face: 'event' as const,
            eventId: e.id,
        })),
        ...story,
    ];
}

const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// "tanya-vikram-haldi.png": plain Latin, so every printer's and phone's file list shows it.
export function cardFileName(slug: string, card: CardInfo, variant = ''): string {
    const part =
        card.kind === 'event'
            ? slugify(card.title) || `function-${(card.eventId ?? '').slice(0, 4)}`
            : slugify(card.title);
    return `${[slug, part, variant].filter(Boolean).join('-')}.${card.ext}`;
}
