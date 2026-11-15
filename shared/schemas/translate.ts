import { contentLocales } from '@shared/locales';
import { z } from 'zod';

const locale = z.enum(contentLocales);

// One piece of invitation text to put into other languages.
export const translateItem = z.object({
    id: z.string().min(1).max(200),
    from: locale,
    to: z.array(locale).min(1).max(contentLocales.length),
    text: z.string().max(4000),
});

export const translateInput = z.object({items: z.array(translateItem).min(1).max(60),});

export type TranslateItem = z.infer<typeof translateItem>;
export type TranslateInput = z.input<typeof translateInput>;

export interface TranslateResult {
    id: string;
    translations: Record<string, string>;
}
