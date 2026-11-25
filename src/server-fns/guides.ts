import { cultureOf } from '@shared/cultures';
import { type Guide, guideBySlug, guideDesigns, guides, relatedGuides } from '@shared/guides';
import { categoryInfo, eventVocabFor, greetingsFor, isSolemn, occasionOf } from '@shared/occasions';
import { guideWordings, messagesFor } from '@shared/wording';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { shopWhereabouts } from '../../server/lib/whereabouts';
import { getPlatform } from '../../server/platform/context';
import { listStoreTemplates } from '../../server/repos/store';

interface GuideLink {
    slug: string;
    name: string;
}

const link = ({ slug, name }: Guide): GuideLink => ({
    slug,
    name,
});

async function shop() {
    const { currency, rates } = await shopWhereabouts();
    return {
        currency,
        templates: await listStoreTemplates(currency, rates),
    };
}

const slugInput = z.object({ slug: z.string().min(1).max(60) });

// One occasion's designs page; null when the shop has no design for it yet.
export const fetchDesignGuide = createServerFn({ method: 'GET' })
    .validator(slugInput)
    .handler(async ({ data }) => {
        const guide = guideBySlug(data.slug);
        if (!guide) return null;
        const { currency, templates } = await shop();
        const { own, more } = guideDesigns(guide, templates);
        if (own.length === 0) return null;
        const occasion = occasionOf(guide.occasion);
        const culture = cultureOf(guide.culture ?? 'universal');
        return {
            origin: getPlatform().config.APP_ORIGIN,
            currency,
            guide: link(guide),
            solemn: isSolemn(occasion),
            page: guide.designs,
            own,
            more,
            ceremonies: guide.culture
                ? eventVocabFor(occasion, culture).map((e) => e.label.en ?? e.kind)
                : [],
            sample: guide.sample,
            words: guideWordings(guide).slice(0, 3),
            related: relatedGuides(guide)
                .filter((g) => guideDesigns(g, templates).own.length > 0)
                .map(link),
        };
    });

// One occasion's words, with the designs to try them on.
export const fetchWordingGuide = createServerFn({ method: 'GET' })
    .validator(slugInput)
    .handler(async ({ data }) => {
        const guide = guideBySlug(data.slug);
        if (!guide) return null;
        const { templates } = await shop();
        const { own, more } = guideDesigns(guide, templates);
        const occasion = occasionOf(guide.occasion);
        const greeting = guide.culture
            ? greetingsFor(cultureOf(guide.culture), occasion)[0]
            : undefined;
        return {
            origin: getPlatform().config.APP_ORIGIN,
            guide: link(guide),
            solemn: isSolemn(occasion),
            page: guide.words,
            sample: guide.sample,
            // Vetted, and only where the tradition is known.
            greeting: greeting?.text ?? null,
            wordings: guideWordings(guide),
            messages: messagesFor(guide),
            designs: (own.length > 0 ? own : more).map(({ slug, name }) => ({
                slug,
                name,
            })),
            hasDesigns: own.length > 0,
            related: relatedGuides(guide).map(link),
        };
    });

// Both index pages: every guide by kind of occasion, with how much each one holds.
export const fetchGuides = createServerFn({ method: 'GET' }).handler(async () => {
    const { templates } = await shop();
    const rows = guides.map((g) => ({
        ...link(g),
        category: occasionOf(g.occasion).category,
        lead: g.words.lead,
        designs: guideDesigns(g, templates).own.length,
        words: guideWordings(g).length,
    }));
    const groups = [...new Set(rows.map((r) => r.category))].map((category) => ({
        category,
        label: categoryInfo[category].label,
        guides: rows.filter((r) => r.category === category),
    }));
    return {
        origin: getPlatform().config.APP_ORIGIN,
        groups,
    };
});
