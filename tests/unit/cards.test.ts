import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { cardFileName, cardsFor, mainEvent } from '@shared/cards';
import { formatEventDate } from '@shared/time';
import { crc32, zipStore } from '@shared/zip';
import { describe, expect, it } from 'vitest';

const haldi = {
    id: 'h1',
    title: 'Haldi',
};
const wedding = {
    id: 'w1',
    title: 'Pheras',
};

describe('which cards an invitation gets', () => {
    it('gives a wedding the whole set, with a card for private functions too', () => {
        const ids = cardsFor({
            shown: [wedding],
            all: [haldi, wedding],
            solemn: false,
        }).map((c) => c.id);
        expect(ids).toEqual(['save', 'invite', 'print', 'event:h1', 'event:w1', 'story']);
    });

    it('never asks anyone to save the date of a prayer meet', () => {
        const ids = cardsFor({
            shown: [wedding],
            all: [wedding],
            solemn: true,
        }).map((c) => c.id);
        expect(ids).toEqual(['invite', 'print', 'event:w1']);
    });

    it('makes no dated card when this version shows no function', () => {
        const ids = cardsFor({
            shown: [],
            all: [haldi],
            solemn: false,
        }).map((c) => c.id);
        expect(ids).toEqual(['event:h1']);
    });
});

describe('details', () => {
    it('dates the save-the-date by the wedding, not the first function', () => {
        expect(mainEvent([{ kind: 'haldi' }, { kind: 'pheras' }])?.kind).toBe('pheras');
        expect(mainEvent([{ kind: 'mehndi' }])?.kind).toBe('mehndi');
    });

    it('names files in plain Latin, whatever the function is called', () => {
        const [card] = cardsFor({
            shown: [],
            all: [
                {
                    id: 'abcdef',
                    title: 'हल्दी',
                },
            ],
            solemn: false,
        });
        expect(card && cardFileName('tanya-vikram', card, 'hi')).toBe(
            'tanya-vikram-function-abcd-hi.png',
        );
    });
});

describe('the zip', () => {
    it('matches the standard checksum', () => {
        expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
    });

    it('unpacks with an ordinary unzip, keeping same-named files apart', () => {
        const dir = mkdtempSync(join(tmpdir(), 'toran-zip-'));
        const data = new TextEncoder().encode('hello');
        const name = 'card.png';
        const zip = zipStore([
            {
                name,
                data,
            },
            {
                name,
                data: new Uint8Array(70_000).fill(7),
            },
        ]);
        writeFileSync(join(dir, 'a.zip'), zip);
        execFileSync('unzip', ['-q', join(dir, 'a.zip'), '-d', dir]);
        expect(readFileSync(join(dir, 'card.png'), 'utf8')).toBe('hello');
        expect(readFileSync(join(dir, 'card-2.png')).length).toBe(70_000);
    });
});

describe('dates on cards', () => {
    it('are written one way whichever browser draws them', () => {
        const at = new Date('2027-01-22T05:00:00Z');
        expect(formatEventDate(at, 'Asia/Kolkata', 'en')).toBe('Friday, 22 January 2027');
    });
});
