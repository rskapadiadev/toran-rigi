// Small key/value settings (exchange-rate snapshot, studio switches) stored as JSON.
import { eq } from 'drizzle-orm';

import { settings } from '../db/schema';
import { getPlatform } from '../platform/context';

export async function getSetting<T>(key: string): Promise<T | undefined> {
    const { db } = getPlatform();
    const row = await db.select().from(settings).where(eq(settings.key, key)).get();
    return row?.value as T | undefined;
}

export async function setSetting(key: string, value: unknown) {
    const { db } = getPlatform();
    await db
        .insert(settings)
        .values({
            key,
            value,
        })
        .onConflictDoUpdate({
            target: settings.key,
            set: { value },
        });
}
