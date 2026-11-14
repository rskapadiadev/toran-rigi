import { demoInvitations } from '@shared/demo';
import { dateSpan, placeLine, shareFacts, type ShareSource } from '@shared/share';
import { themeBySlug } from '@shared/themes';
import { describe, expect, it } from 'vitest';

import { balance, buildCardSvg, fitPath, type Measure, scriptFamily } from '../../server/og/card';

function sourceFor(slug: string): ShareSource {
    const demo = demoInvitations.find((d) => d.slug === slug);
    const theme = demo && themeBySlug(demo.themeSlug);
    if (!demo || !theme) throw new Error(`missing demo ${slug}`);
    return {
        invitation: {
            culture: demo.culture,
            eventKind: demo.occasion,
            locales: demo.locales,
            seed: demo.seed,
            version: 1,
            content: demo.content,
            design: theme.design,
        },
        events: demo.events.map((e) => ({
            ...e,
            address: e.address,
        })),
    };
}

// Rough Latin advance; the renderer measures with real fonts.
const measure: Measure = (text, style) =>
    Array.from(text).length * style.size * 0.5 +
    Array.from(text).length * (style.letterSpacing ?? 0);

describe('shareFacts', () => {
    it('titles a wedding by the couple and occasion', () => {
        const facts = shareFacts(sourceFor('demo-rajwada'));
        expect(facts.title).toBe('Aarav & Diya · Wedding Invitation');
        expect(facts.description).toContain('21 – 22 January 2027');
        expect(facts.card.label).toBe('The wedding of');
    });

    it('personalises the title for a guest link', () => {
        const facts = shareFacts(sourceFor('demo-rajwada'), 'Mehta Family');
        expect(facts.title).toBe('Mehta Family, you’re invited · Aarav & Diya');
        expect(facts.card.guest).toBe('Mehta Family');
    });

    it('lets a family lead its own headline', () => {
        expect(shareFacts(sourceFor('demo-griha')).description).toMatch(
            /^The Patel family welcome you to our new home/,
        );
    });

    it('never puts a child in the parents’ voice', () => {
        expect(shareFacts(sourceFor('demo-mangal')).description).toMatch(
            /^You’re invited to the janoi/,
        );
    });

    it('keeps remembrance notices solemn', () => {
        const facts = shareFacts(sourceFor('demo-shanti'));
        expect(facts.title).toMatch(/^In loving memory of Late Smt\./);
        expect(facts.card.solemn).toBe(true);
        expect(facts.title).not.toContain('Invitation');
    });

    it('falls back to English names where the card has no font for the script', () => {
        const facts = shareFacts(sourceFor('demo-mashrabiya'));
        expect(facts.title).toContain('عمر');
        expect(facts.card.one).toBe('Omar');
    });
});

describe('dateSpan / placeLine', () => {
    const at = (startsAt: string, address: string | null = null) => ({
        startsAt,
        timezone: 'Asia/Kolkata',
        venue: 'Hall',
        address,
    });

    it('formats one day, a span within a month, and across months', () => {
        expect(dateSpan([at('2027-02-14T18:00')])).toBe('Sunday, 14 February 2027');
        expect(dateSpan([at('2027-01-21T10:00'), at('2027-01-23T19:00')])).toBe(
            '21 – 23 January 2027',
        );
        expect(dateSpan([at('2027-01-30T10:00'), at('2027-02-02T19:00')])).toBe(
            '30 January – 2 February 2027',
        );
    });

    it('lists up to two distinct cities', () => {
        expect(
            placeLine([
                at('2027-01-01T00:00', 'Lal Darwaja, Ahmedabad'),
                at('2027-01-02T00:00', 'Lake Pichola, Udaipur'),
            ]),
        ).toBe('Ahmedabad · Udaipur');
        expect(placeLine([at('2027-01-01T00:00')])).toBe('Hall');
    });
});

describe('card svg', () => {
    it('escapes user text', () => {
        const facts = shareFacts(sourceFor('demo-editorial'), 'Tom <b>&</b> "Jerry"');
        const svg = buildCardSvg(facts.card, measure);
        expect(svg).toContain('Tom &lt;b&gt;&amp;&lt;/b&gt; &quot;Jerry&quot;');
        expect(svg).not.toContain('<b>');
    });

    it('rejects non-hex colours instead of injecting them', () => {
        const facts = shareFacts(sourceFor('demo-editorial'));
        const svg = buildCardSvg(
            {
                ...facts.card,
                palette: {
                    ...facts.card.palette,
                    gold: 'red"/><script>',
                },
            },
            measure,
        );
        expect(svg).not.toContain('<script>');
    });

    it('re-maps arch paths into a wider box, arcs included', () => {
        expect(fitPath('M20 470 V180 A130 130 0 0 1 280 180 V470', 0, 0, 2, 1)).toBe(
            'M 40 470 V 180 A 260 130 0 0 1 560 180 V 470',
        );
    });

    it('leads Indic lines with their own face', () => {
        expect(scriptFamily('ક્રિશ', 'Marcellus')).toMatch(/^'Noto Serif Gujarati'/);
        expect(scriptFamily('दिया', 'Marcellus')).toMatch(/^'Noto Serif Devanagari'/);
        expect(scriptFamily('॥ Shree Ganeshay Namah ॥', 'Marcellus')).toBe('Marcellus');
    });

    it('balances a two-line split', () => {
        expect(balance('Kusumben Harshadbhai Shah')).toEqual(['Kusumben', 'Harshadbhai Shah']);
        expect(balance('Aanya')).toEqual(['Aanya', '']);
    });
});
