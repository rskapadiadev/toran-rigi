// Small helpers for writing the library: one text in English, then Hindi, then Gujarati.
import type { CultureId } from '../cultures';
import type { OccasionId } from '../occasions';
import type { LocalizedText } from '../types';
import type { Wording, WordingStyle } from './types';

export function t(en: string, hi?: string, gu?: string): LocalizedText {
    return {
        en,
        ...(hi ? { hi } : {}),
        ...(gu ? { gu } : {}),
    };
}

type Entry = [
    id: string,
    style: WordingStyle,
    name: string,
    headline: LocalizedText,
    welcome: LocalizedText,
    closing: LocalizedText,
];

interface Pack {
    occasion: OccasionId;
    culture?: CultureId;
    variant?: string;
}

export const pack = (of: Pack, entries: Entry[]): Wording[] =>
    entries.map(([id, style, name, headline, welcome, closing]) => ({
        ...of,
        id,
        style,
        name,
        headline,
        welcome,
        closing,
    }));
