// Templates: ready-made invitations (design + sample text + sections + ceremonies) an order starts from.
// The template row is the catalogue entry; its sample invitation (is_demo = 1) holds everything else.
import { applyLayout } from '@shared/blocks';
import { cultureOf } from '@shared/cultures';
import { seedFrom } from '@shared/generative';
import { newToken } from '@shared/ids';
import { defaultSectionsFor, occasionOf } from '@shared/occasions';
import type { PhotoMime } from '@shared/photos';
import { cleanPrices, DEFAULT_TEMPLATE_PRICE, DEFAULT_TEMPLATE_WAS_PRICE } from '@shared/pricing';
import type { CreateTemplateInput, UpdateTemplateInput } from '@shared/schemas/templates';
import { themeBySlug, themeLayouts } from '@shared/themes';
import type { InvitationExtras } from '@shared/types';
import { and, asc, desc, eq, ne } from 'drizzle-orm';

import { invitationEvents, invitations, templates, themes } from '../db/schema';
import { getPlatform } from '../platform/context';
import { invalidateInvitationCache } from './invitations';
import { resolveMusic } from './music';
import { OrderError } from './orders';
import { deletePhoto, storePhoto } from './photos';
import { slugify, starterContent, uniqueSlug } from './slugs';

export async function listTemplates() {
    const { db } = getPlatform();
    return db
        .select({
            id: templates.id,
            slug: templates.slug,
            name: templates.name,
            description: templates.description,
            eventKind: templates.eventKind,
            culture: templates.culture,
            fromPackage: templates.fromPackage,
            posterKey: templates.posterKey,
            prices: templates.prices,
            comparePrices: templates.comparePrices,
            status: templates.status,
            isFeatured: templates.isFeatured,
            sort: templates.sort,
            updatedAt: templates.updatedAt,
            invitationId: templates.invitationId,
            themeSlug: themes.slug,
            themeName: themes.name,
            design: invitations.design,
            previewToken: invitations.previewToken,
            sampleSlug: invitations.slug,
        })
        .from(templates)
        .innerJoin(invitations, eq(invitations.id, templates.invitationId))
        .leftJoin(themes, eq(themes.id, templates.themeId))
        .orderBy(desc(templates.isFeatured), asc(templates.sort), asc(templates.name));
}

export type TemplateRow = Awaited<ReturnType<typeof listTemplates>>[number];

export async function getTemplate(id: string) {
    const { db } = getPlatform();
    return db.select().from(templates).where(eq(templates.id, id)).get();
}

export async function templateForInvitation(invitationId: string) {
    const { db } = getPlatform();
    return db
        .select({
            id: templates.id,
            name: templates.name,
            status: templates.status,
            isFeatured: templates.isFeatured,
        })
        .from(templates)
        .where(eq(templates.invitationId, invitationId))
        .get();
}

async function uniqueTemplateSlug(name: string, exceptId?: string) {
    const { db } = getPlatform();
    const root = slugify(name) || 'template';
    for (let i = 0; i < 50; i++) {
        const candidate = i === 0 ? root : `${root}-${i + 1}`;
        const taken = await db
            .select({ id: templates.id })
            .from(templates)
            .where(
                exceptId
                    ? and(eq(templates.slug, candidate), ne(templates.id, exceptId))
                    : eq(templates.slug, candidate),
            )
            .get();
        if (!taken) return candidate;
    }
    return `${root}-${newToken().slice(0, 6).toLowerCase()}`;
}

async function themeIdOf(slug: string | undefined) {
    if (!slug) return undefined;
    const { db } = getPlatform();
    const row = await db.select({ id: themes.id }).from(themes).where(eq(themes.slug, slug)).get();
    return row?.id;
}

// The sample invitation mirrors the template: only a published template has a live sample page.
const sampleStatus = (status: 'draft' | 'published' | 'archived') =>
    status === 'published' ? 'published' : status === 'archived' ? 'archived' : 'draft';

// A blank template for an occasion: the theme's look and layout over the occasion's sections.
export async function createTemplate(input: CreateTemplateInput) {
    const { db } = getPlatform();
    const theme = themeBySlug(input.themeSlug) ?? themeBySlug('editorial');
    if (!theme) throw new OrderError('Theme not found');
    const occasion = occasionOf(input.occasion);
    const culture = cultureOf(input.culture);
    const slug = await uniqueTemplateSlug(input.name);
    const themeId = await themeIdOf(theme.slug);
    const [sample] = await db
        .insert(invitations)
        .values({
            slug: await uniqueSlug(`demo-${slug}`),
            themeId,
            culture: input.culture,
            eventKind: occasion.id,
            locales: ['en'],
            calendars: culture.calendars.filter((c) => c !== 'gregorian'),
            seed: seedFrom(input.name, slug),
            design: theme.design,
            content: starterContent(occasion, culture),
            rsvpEnabled: !occasion.sections.forbidden.includes('rsvp'),
            sections: applyLayout(
                defaultSectionsFor(occasion, culture).map((type) => ({
                    type,
                    enabled: true,
                })),
                themeLayouts[theme.slug],
            ),
            extras: { wishes: { enabled: true } },
            previewToken: newToken(),
            status: 'draft',
            isDemo: true,
        })
        .returning({ id: invitations.id });
    if (!sample) throw new OrderError('Could not create the template');
    const [row] = await db
        .insert(templates)
        .values({
            slug,
            name: input.name,
            description: input.description ?? '',
            eventKind: occasion.id,
            culture: input.culture,
            themeId,
            invitationId: sample.id,
            fromPackage: theme.fromPackage,
            prices: { ...DEFAULT_TEMPLATE_PRICE },
            comparePrices: { ...DEFAULT_TEMPLATE_WAS_PRICE },
            status: 'draft',
        })
        .returning({
            id: templates.id,
            invitationId: templates.invitationId,
        });
    if (!row) throw new OrderError('Could not create the template');
    return row;
}

interface CopyOptions {
    // Fields the copy changes; everything else (design, sections, extras, ceremonies) is carried over.
    overrides: Partial<typeof invitations.$inferInsert>;
    keepPeople: boolean;
}

// Copies a sample invitation and its ceremonies into a new invitation row. Shared by "duplicate
// template" and "start an order from a template".
export async function copyInvitation(sourceId: string, options: CopyOptions) {
    const { db } = getPlatform();
    const source = await db.select().from(invitations).where(eq(invitations.id, sourceId)).get();
    if (!source) throw new OrderError('Template not found');
    const events = await db
        .select()
        .from(invitationEvents)
        .where(eq(invitationEvents.invitationId, sourceId))
        .orderBy(asc(invitationEvents.sort));
    const occasion = occasionOf(source.eventKind);
    const culture = cultureOf(source.culture);
    // A customer's own uploaded song belongs to that invitation only; never copy it.
    const music = source.extras.music?.source === 'upload' ? undefined : source.extras.music;
    const extras: InvitationExtras = {
        ...source.extras,
        music,
    };
    const content = options.keepPeople
        ? source.content
        : {
              ...source.content,
              people: starterContent(occasion, culture).people,
              gallery: [],
          };
    const [row] = await db
        .insert(invitations)
        .values({
            themeId: source.themeId,
            culture: source.culture,
            eventKind: source.eventKind,
            locales: source.locales,
            calendars: source.calendars,
            seed: source.seed,
            design: source.design,
            content,
            sections: source.sections,
            extras,
            rsvpEnabled: source.rsvpEnabled,
            previewToken: newToken(),
            status: 'draft',
            slug: options.overrides.slug ?? (await uniqueSlug('celebration')),
            ...options.overrides,
        })
        .returning({ id: invitations.id });
    if (!row) throw new OrderError('Could not copy the template');
    const resolved = await resolveMusic(row.id, music);
    await db.batch([
        db.update(invitations).set(resolved).where(eq(invitations.id, row.id)),
        ...events.map(({ id: _id, invitationId: _inv, ...event }) =>
            db.insert(invitationEvents).values({
                ...event,
                invitationId: row.id,
            }),
        ),
    ]);
    return row.id;
}

export async function duplicateTemplate(id: string) {
    const { db } = getPlatform();
    const template = await getTemplate(id);
    if (!template) throw new OrderError('Template not found');
    const name = `${template.name} copy`;
    const slug = await uniqueTemplateSlug(name);
    const invitationId = await copyInvitation(template.invitationId, {
        keepPeople: true,
        overrides: {
            slug: await uniqueSlug(`demo-${slug}`),
            isDemo: true,
        },
    });
    const [row] = await db
        .insert(templates)
        .values({
            slug,
            name,
            description: template.description,
            eventKind: template.eventKind,
            culture: template.culture,
            themeId: template.themeId,
            invitationId,
            fromPackage: template.fromPackage,
            prices: template.prices,
            comparePrices: template.comparePrices,
            status: 'draft',
            sort: template.sort + 1,
        })
        .returning({
            id: templates.id,
            invitationId: templates.invitationId,
        });
    if (!row) throw new OrderError('Could not duplicate the template');
    return row;
}

export async function updateTemplate(id: string, input: UpdateTemplateInput) {
    const { db } = getPlatform();
    const template = await getTemplate(id);
    if (!template) throw new OrderError('Template not found');
    const sample = await db
        .select({
            slug: invitations.slug,
            version: invitations.version,
            status: invitations.status,
            publishedAt: invitations.publishedAt,
        })
        .from(invitations)
        .where(eq(invitations.id, template.invitationId))
        .get();
    const now = new Date().toISOString();
    // Empty price maps are stored as null ("use the package price", "no was price").
    const priceChanges: Partial<typeof templates.$inferInsert> = {};
    if (input.prices !== undefined) priceChanges.prices = cleanPrices(input.prices);
    if (input.comparePrices !== undefined)
        priceChanges.comparePrices = cleanPrices(input.comparePrices);
    await db
        .update(templates)
        .set({
            ...input,
            ...priceChanges,
            slug: input.name ? await uniqueTemplateSlug(input.name, id) : template.slug,
            updatedAt: now,
        })
        .where(eq(templates.id, id));
    if (input.status && sample && sampleStatus(input.status) !== sample.status) {
        await db
            .update(invitations)
            .set({
                status: sampleStatus(input.status),
                version: sample.version + 1,
                publishedAt:
                    input.status === 'published' ? (sample.publishedAt ?? now) : sample.publishedAt,
            })
            .where(eq(invitations.id, template.invitationId));
        await invalidateInvitationCache(sample.slug, sample.version);
    }
}

// Keeps the catalogue entry in step with the sample when the editor changes its occasion or theme.
export async function syncTemplateFromInvitation(invitationId: string) {
    const { db } = getPlatform();
    const sample = await db
        .select({
            eventKind: invitations.eventKind,
            culture: invitations.culture,
            themeId: invitations.themeId,
        })
        .from(invitations)
        .where(eq(invitations.id, invitationId))
        .get();
    if (!sample) return;
    await db
        .update(templates)
        .set({
            ...sample,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(templates.invitationId, invitationId));
}

// The shop shows this picture instead of running the design live. Replaces (and removes) the old one.
export async function setTemplatePoster(id: string, mime: PhotoMime, body: ArrayBuffer) {
    const { db } = getPlatform();
    const template = await getTemplate(id);
    if (!template) throw new OrderError('Template not found');
    const key = await storePhoto(template.invitationId, mime, body);
    await db
        .update(templates)
        .set({
            posterKey: key,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(templates.id, id));
    if (template.posterKey) await deletePhoto(template.invitationId, template.posterKey);
    return key;
}
