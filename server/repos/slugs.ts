// Link slugs and starter content shared by invitations and templates.
import { reservedSlugList } from '@shared/catalog';
import type { CulturePack } from '@shared/cultures';
import { newToken } from '@shared/ids';
import { greetingsFor, isCouple, type OccasionPack } from '@shared/occasions';
import type { InvitationContent } from '@shared/types';
import { and, eq, ne } from 'drizzle-orm';

import { invitations, reservedSlugs } from '../db/schema';
import { getPlatform } from '../platform/context';

export const slugify = (text: string) =>
    text
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);

export async function isSlugFree(slug: string, exceptId?: string) {
    const { db } = getPlatform();
    if (reservedSlugList.includes(slug)) return false;
    const [reserved, taken] = await Promise.all([
        db.select().from(reservedSlugs).where(eq(reservedSlugs.slug, slug)).get(),
        db
            .select({ id: invitations.id })
            .from(invitations)
            .where(
                exceptId
                    ? and(eq(invitations.slug, slug), ne(invitations.id, exceptId))
                    : eq(invitations.slug, slug),
            )
            .get(),
    ]);
    return !reserved && !taken;
}

export async function uniqueSlug(base: string) {
    const root = slugify(base) || 'celebration';
    for (let i = 0; i < 50; i++) {
        const candidate = i === 0 ? root : `${root}-${i + 1}`;
        if (await isSlugFree(candidate)) return candidate;
    }
    return `${root}-${newToken().slice(0, 6).toLowerCase()}`;
}

// Placeholder names ("Bride", "Groom", "Baby"…) plus the occasion's starter text.
export function starterContent(occasion: OccasionPack, culture: CulturePack): InvitationContent {
    return {
        people: {
            one: { name: { en: occasion.people.one.label } },
            ...(isCouple(occasion) && occasion.people.two
                ? { two: { name: { en: occasion.people.two.label } } }
                : {}),
        },
        greetingKey: greetingsFor(culture, occasion)[0]?.key,
        ...occasion.starter,
        gallery: [],
    };
}
