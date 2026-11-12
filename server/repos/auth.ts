import type { Role } from '@shared/permissions';
import { and, desc, eq, gt, isNull, lt } from 'drizzle-orm';

import { authCodes, sessions, users } from '../db/schema';
import { getPlatform } from '../platform/context';

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: Role;
}

export async function findActiveUserByEmail(email: string) {
    const { db } = getPlatform();
    return db
        .select()
        .from(users)
        .where(and(eq(users.email, email.toLowerCase()), eq(users.isActive, true)))
        .get();
}

export async function storeCode(email: string, codeHash: string, expiresAt: string) {
    const { db } = getPlatform();
    await db.insert(authCodes).values({
        email: email.toLowerCase(),
        codeHash,
        expiresAt,
    });
}

export async function latestValidCode(email: string) {
    const { db } = getPlatform();
    return db
        .select()
        .from(authCodes)
        .where(
            and(
                eq(authCodes.email, email.toLowerCase()),
                isNull(authCodes.usedAt),
                gt(authCodes.expiresAt, new Date().toISOString()),
            ),
        )
        .orderBy(desc(authCodes.createdAt))
        .get();
}

export async function bumpCodeAttempts(id: string, attempts: number) {
    await getPlatform().db.update(authCodes).set({ attempts }).where(eq(authCodes.id, id));
}

export async function consumeCode(id: string) {
    await getPlatform()
        .db.update(authCodes)
        .set({ usedAt: new Date().toISOString() })
        .where(eq(authCodes.id, id));
}

export async function createSession(tokenHash: string, userId: string, expiresAt: string) {
    const { db } = getPlatform();
    await db.batch([
        db.insert(sessions).values({
            id: tokenHash,
            kind: 'admin',
            subjectId: userId,
            expiresAt,
        }),
        db.update(users).set({ lastLoginAt: new Date().toISOString() }).where(eq(users.id, userId)),
        db.delete(sessions).where(lt(sessions.expiresAt, new Date().toISOString())),
    ]);
}

export async function userForSession(tokenHash: string): Promise<AdminUser | undefined> {
    const { db } = getPlatform();
    const row = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
        })
        .from(sessions)
        .innerJoin(users, eq(users.id, sessions.subjectId))
        .where(
            and(
                eq(sessions.id, tokenHash),
                eq(sessions.kind, 'admin'),
                gt(sessions.expiresAt, new Date().toISOString()),
                eq(users.isActive, true),
            ),
        )
        .get();
    return row;
}

export async function deleteSession(tokenHash: string) {
    await getPlatform().db.delete(sessions).where(eq(sessions.id, tokenHash));
}
