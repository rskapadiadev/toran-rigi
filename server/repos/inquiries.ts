// Leads from the public site and demo invitations; the CRM works from these.
import type { InquiryInput } from '@shared/schemas/inquiry';

import { inquiries } from '../db/schema';
import { getPlatform } from '../platform/context';

export async function createInquiry(input: InquiryInput, source: string, country?: string) {
    const { db } = getPlatform();
    await db.insert(inquiries).values({
        name: input.name,
        phone: input.phone || null,
        email: input.email || null,
        weddingDate: input.date || null,
        message:
            [input.theme && `Design: ${input.theme}`, input.message].filter(Boolean).join('\n') ||
            null,
        source,
        country: country ?? null,
    });
}
