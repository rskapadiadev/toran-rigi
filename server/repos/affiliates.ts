// Affiliates: the studio's referral partners. Stored in `partners` (also used by orders and
// customers), with a logo shown beside Toran's on the invitations they refer.
import { newId } from '@shared/ids';
import { photoExtension, type PhotoMime } from '@shared/photos';
import type { AffiliateInput } from '@shared/schemas/affiliates';
import { desc, eq, sql } from 'drizzle-orm';

import { invitations, partners } from '../db/schema';
import { getPlatform } from '../platform/context';
import { OrderError } from './orders';
import { slugify } from './slugs';

export interface PublicAffiliate {
    name: string;
    logoKey: string | null;
    website: string | null;
}

const fields = (input: AffiliateInput) => ({
    name: input.name,
    details: input.details || null,
    website: input.website || null,
    email: input.email || null,
    phone: input.phone || null,
    commissionBps: Math.round(input.commission * 100),
    isActive: input.isActive,
});

export async function listAffiliates() {
    const { db } = getPlatform();
    return db
        .select({
            id: partners.id,
            name: partners.name,
            code: partners.code,
            details: partners.details,
            website: partners.website,
            email: partners.email,
            phone: partners.phone,
            commissionBps: partners.commissionBps,
            isActive: partners.isActive,
            logoKey: partners.logoKey,
            createdAt: partners.createdAt,
            // Invitations that name this affiliate in their branding.
            invitations: sql<number>`(select count(*) from ${invitations} where json_extract(${invitations.extras}, '$.branding.affiliateId') = ${partners.id})`,
        })
        .from(partners)
        .orderBy(desc(partners.createdAt));
}

export type AffiliateRow = Awaited<ReturnType<typeof listAffiliates>>[number];

// A unique referral code from the name ("Shaadi Squad" → SHAADI-SQUAD, then -2, -3…).
async function uniqueCode(name: string) {
    const { db } = getPlatform();
    const root = (slugify(name) || 'affiliate').toUpperCase().slice(0, 24);
    for (let i = 0; i < 50; i++) {
        const code = i === 0 ? root : `${root}-${String(i + 1)}`;
        const taken = await db
            .select({ id: partners.id })
            .from(partners)
            .where(eq(partners.code, code))
            .get();
        if (!taken) return code;
    }
    return `${root}-${newId().slice(0, 4).toUpperCase()}`;
}

export async function createAffiliate(input: AffiliateInput) {
    const { db } = getPlatform();
    const [row] = await db
        .insert(partners)
        .values({
            ...fields(input),
            code: await uniqueCode(input.name),
        })
        .returning({ id: partners.id });
    if (!row) throw new OrderError('Could not create the affiliate');
    return row;
}

export async function updateAffiliate(id: string, input: AffiliateInput) {
    const { db } = getPlatform();
    const done = await db
        .update(partners)
        .set(fields(input))
        .where(eq(partners.id, id))
        .returning({ id: partners.id });
    if (done.length === 0) throw new OrderError('Affiliate not found');
}

// Replaces the logo (and removes the old file).
export async function setAffiliateLogo(id: string, mime: PhotoMime, body: ArrayBuffer) {
    const { db, blob } = getPlatform();
    const current = await db
        .select({ logoKey: partners.logoKey })
        .from(partners)
        .where(eq(partners.id, id))
        .get();
    if (!current) throw new OrderError('Affiliate not found');
    const key = `public/affiliates/${id}/${newId()}.${photoExtension(mime)}`;
    await blob.put(key, body, {
        contentType: mime,
        cacheControl: 'public, max-age=31536000, immutable',
    });
    await db.update(partners).set({ logoKey: key }).where(eq(partners.id, id));
    if (current.logoKey) await blob.delete(current.logoKey);
    return key;
}

// What a guest's page needs: only active affiliates are shown.
export async function publicAffiliate(id: string | undefined): Promise<PublicAffiliate | null> {
    if (!id) return null;
    const { db } = getPlatform();
    const row = await db
        .select({
            name: partners.name,
            logoKey: partners.logoKey,
            website: partners.website,
            isActive: partners.isActive,
        })
        .from(partners)
        .where(eq(partners.id, id))
        .get();
    if (!row?.isActive) return null;
    return {
        name: row.name,
        logoKey: row.logoKey,
        website: row.website,
    };
}
