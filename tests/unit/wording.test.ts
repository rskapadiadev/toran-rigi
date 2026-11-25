import { cultureIds } from '@shared/cultures';
import { guideBySlug, guideDesigns, guides, relatedGuides } from '@shared/guides';
import { isSolemn, occasionIds, occasionOf } from '@shared/occasions';
import {
    guideWordings,
    messagesFor,
    wordingMessages,
    wordings,
    wordingsFor,
} from '@shared/wording';
import { applyWording, wordingLocales } from '@shared/wording/types';
import { describe, expect, it } from 'vitest';

// Names of God, invocations and scripture come only from the vetted greetings. Ceremonies and
// festivals named after a deity are the exception, and only as the name of the event.
const sacred =
    /\b(allah|bismillah|inshallah|mashallah|waheguru|jesus|christ|lord|almighty|god|ganeshay?|krishna|shiva|om|amen|hashem|quran|bible|gurbani)\b|ॐ|ૐ|ੴ|श्री गणेशाय|શ્રી ગણેશાય|भगवान|ભગવાન|ईश्वर|ઈશ્વર|प्रभु|પ્રભુ|अल्लाह/i;
const eventNames = ['puja-katha', 'puja-ganesh', 'puja-mata-chowki'];

const all = (w: (typeof wordings)[number]) =>
    [w.headline, w.welcome, w.closing].flatMap((t) => Object.values(t));

describe('wording library', () => {
    it('has words for every occasion it has a page for, each with its own id', () => {
        const ids = [...wordings, ...wordingMessages].map((w) => w.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const guide of guides) {
            expect(guideWordings(guide).length, guide.slug).toBeGreaterThanOrEqual(3);
            expect(messagesFor(guide).length, guide.slug).toBeGreaterThanOrEqual(1);
        }
        for (const id of occasionIds.filter((o) => o !== 'other'))
            expect(
                wordings.some((w) => w.occasion === id),
                id,
            ).toBe(true);
    });

    it('is always whole in a language, and fits the page', () => {
        for (const w of wordings) {
            expect(wordingLocales(w), w.id).toContain('en');
            // A language is in all three texts or in none.
            for (const l of ['hi', 'gu']) {
                const n = [w.headline, w.welcome, w.closing].filter((t) => t[l]).length;
                expect([0, 3], `${w.id} ${l}`).toContain(n);
            }
            for (const text of Object.values(w.headline))
                expect(text.length, w.id).toBeLessThanOrEqual(90);
            for (const text of Object.values(w.welcome))
                expect(text.length, w.id).toBeLessThanOrEqual(200);
            for (const text of all(w)) expect(text, w.id).not.toMatch(/[[\]{}]|—|\s$|^\s/);
        }
    });

    it('holds no sacred text', () => {
        for (const w of wordings.filter((x) => !eventNames.includes(x.id)))
            for (const text of all(w)) expect(text, w.id).not.toMatch(sacred);
        for (const m of wordingMessages)
            for (const text of Object.values(m.text)) expect(text, m.id).not.toMatch(sacred);
    });

    it('stays quiet about a loss', () => {
        for (const w of wordings.filter((x) => isSolemn(occasionOf(x.occasion)))) {
            expect(['quiet', 'traditional', 'warm'], w.id).toContain(w.style);
            for (const text of all(w)) expect(text, w.id).not.toMatch(/!/);
        }
    });

    it('never offers one tradition’s words to another', () => {
        for (const culture of cultureIds)
            for (const w of wordingsFor({
                occasion: 'wedding',
                culture,
            }))
                expect([undefined, culture], w.id).toContain(w.culture);
        const gujarati = wordingsFor({
            occasion: 'wedding',
            culture: 'hindu',
            variant: 'gujarati',
        });
        expect(gujarati[0]?.variant).toBe('gujarati');
        expect(gujarati.some((w) => w.variant === 'bengali')).toBe(false);
    });

    it('carries the link and the guest’s name in every message', () => {
        for (const m of wordingMessages)
            for (const text of Object.values(m.text)) {
                expect(text, m.id).toContain('{link}');
                expect(text, m.id).toContain('{name}');
            }
    });

    it('fills only the languages it covers', () => {
        const words = wordings.find((w) => w.id === 'hindu-wedding-saptapadi');
        if (!words) throw new Error('missing');
        const content = {
            people: { one: { name: { en: 'Riya' } } },
            headline: {
                en: 'old',
                ur: 'پرانا',
            },
            welcome: { en: 'old' },
            closing: { en: 'old' },
            gallery: [],
        };
        const next = applyWording(content, words, ['en', 'ur']);
        expect(next.headline.en).toBe(words.headline.en);
        expect(next.headline.ur).toBe('پرانا');
        // Not one of this invitation's languages.
        expect(next.headline.hi).toBeUndefined();
        expect(next.people).toBe(content.people);
    });
});

describe('guides', () => {
    it('each say something of their own, at a length search results show', () => {
        const slugs = guides.map((g) => g.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
        const texts = guides.flatMap((g) => [
            g.designs.lead,
            g.designs.body,
            g.words.lead,
            g.words.body,
            ...g.designs.faqs.map((f) => f.a),
            ...g.words.faqs.map((f) => f.a),
        ]);
        expect(new Set(texts).size).toBe(texts.length);
        for (const g of guides)
            for (const lead of [g.designs.lead, g.words.lead]) {
                expect(lead.length, g.slug).toBeLessThanOrEqual(160);
                expect(lead.length, g.slug).toBeGreaterThanOrEqual(70);
            }
    });

    it('show a tradition only its own designs', () => {
        const designs = [
            {
                eventKind: 'wedding',
                culture: 'hindu.gujarati',
            },
            {
                eventKind: 'wedding',
                culture: 'hindu',
            },
            {
                eventKind: 'wedding',
                culture: 'islamic.arab',
            },
        ];
        const find = (slug: string) => {
            const guide = guideBySlug(slug);
            if (!guide) throw new Error(slug);
            return guideDesigns(guide, designs);
        };
        expect(find('gujarati-wedding').own).toHaveLength(1);
        expect(find('gujarati-wedding').more.map((d) => d.culture)).toEqual(['hindu']);
        expect(find('bengali-wedding').own).toHaveLength(0);
        expect(find('muslim-wedding').own.map((d) => d.culture)).toEqual(['islamic.arab']);
        expect(find('wedding').own).toHaveLength(3);
    });

    it('never lead from grief to a party', () => {
        for (const g of guides.filter((x) => isSolemn(occasionOf(x.occasion))))
            for (const r of relatedGuides(g))
                expect(isSolemn(occasionOf(r.occasion)), `${g.slug} → ${r.slug}`).toBe(true);
    });
});
