// The wording library's shapes and pure helpers. No words live here, so the browser can import this
// file without downloading the whole library (the server sends only what a page or editor needs).
import type { CultureId } from '../cultures';
import type { OccasionId } from '../occasions';
import type { InvitationContent, LocalizedText } from '../types';

export const wordingStyles = [
    'traditional',
    'formal',
    'warm',
    'modern',
    'playful',
    'quiet',
] as const;
export type WordingStyle = (typeof wordingStyles)[number];

export const wordingStyleLabel: Record<WordingStyle, string> = {
    traditional: 'Traditional',
    formal: 'Formal',
    warm: 'Warm',
    modern: 'Modern',
    playful: 'Playful',
    quiet: 'Quiet',
};

export interface WordingText {
    headline: LocalizedText;
    welcome: LocalizedText;
    closing: LocalizedText;
}

export interface Wording extends WordingText {
    // Never reused or renamed: it travels in links (/try/rajwada?words=…).
    id: string;
    occasion: OccasionId;
    // Absent: fits every tradition.
    culture?: CultureId;
    variant?: string;
    style: WordingStyle;
    name: string;
}

// A message to send with the link. {name} is the guest and {link} the invitation.
export interface WordingMessage {
    id: string;
    occasion: OccasionId;
    culture?: CultureId;
    name: string;
    text: LocalizedText;
}

const textKeys = ['headline', 'welcome', 'closing'] as const;
const languages = ['en', 'hi', 'gu', 'ar', 'ur', 'he', 'pa'];

// Languages these words are written in throughout, so a reader never meets a half-translated set.
export const wordingLocales = (w: WordingText): string[] =>
    languages.filter((l) => textKeys.every((key) => w[key][l]));

// The invitation's text with these words in the languages they cover; other languages keep theirs.
export function applyWording(
    content: InvitationContent,
    words: WordingText,
    locales: readonly string[],
): InvitationContent {
    const covered = wordingLocales(words).filter((l) => locales.includes(l));
    const merge = (key: (typeof textKeys)[number]): LocalizedText => ({
        ...content[key],
        ...Object.fromEntries(covered.map((l) => [l, words[key][l] ?? ''])),
    });
    return {
        ...content,
        headline: merge('headline'),
        welcome: merge('welcome'),
        closing: merge('closing'),
    };
}
