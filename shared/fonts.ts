// Font keys referenced by invitation designs; families are self-hosted via @fontsource (src/styles/fonts.css).
export const fonts = {
    cormorant: "'Cormorant Garamond Variable', 'Cormorant Garamond', serif",
    fraunces: "'Fraunces Variable', Fraunces, serif",
    cinzel: 'Cinzel, serif',
    marcellus: 'Marcellus, serif',
    pinyon: "'Pinyon Script', cursive",
    manrope: "'Manrope Variable', Manrope, system-ui, sans-serif",
    devanagari: "'Noto Serif Devanagari Variable', serif",
    gujarati: "'Noto Serif Gujarati Variable', serif",
    amiri: 'Amiri, serif',
    kufi: "'Reem Kufi Variable', 'Reem Kufi', sans-serif",
    ruqaa: "'Aref Ruqaa', serif",
    nastaliq: "'Noto Nastaliq Urdu Variable', serif",
    hebrew: "'Noto Serif Hebrew Variable', serif",
    gurmukhi: "'Noto Sans Gurmukhi Variable', sans-serif",
} as const;

export type FontKey = keyof typeof fonts;

// Script fallbacks so names typed in any language render beautifully inside a Latin display font.
const scriptStack = [
    fonts.devanagari,
    fonts.gujarati,
    fonts.amiri,
    fonts.hebrew,
    fonts.gurmukhi,
].join(', ');

const isFontKey = (key: string): key is FontKey => key in fonts;

export const fontStack = (key: string) =>
    `${isFontKey(key) ? fonts[key] : fonts.cormorant}, ${scriptStack}`;

export const localeFont: Record<string, FontKey> = {
    hi: 'devanagari',
    gu: 'gujarati',
    ar: 'amiri',
    ur: 'nastaliq',
    he: 'hebrew',
    pa: 'gurmukhi',
};
