export const locales = ['en', 'hi', 'gu', 'ar', 'ur'] as const;
export type Locale = (typeof locales)[number];

// Invitation content can also carry scripts the studio UI is not translated into.
export const contentLocales = [...locales, 'he', 'pa'] as const;
export type ContentLocale = (typeof contentLocales)[number];

export const rtlLocales: readonly string[] = ['ar', 'ur', 'he'];
export const isRtl = (locale: string) => rtlLocales.includes(locale);

export const localeNames: Record<ContentLocale, string> = {
    en: 'English',
    hi: 'हिन्दी',
    gu: 'ગુજરાતી',
    ar: 'العربية',
    ur: 'اردو',
    he: 'עברית',
    pa: 'ਪੰਜਾਬੀ',
};
