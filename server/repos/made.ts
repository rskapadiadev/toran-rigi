// Done-for-you invitations: what the customer sends, the studio's first look, and rounds of changes.
// Everything hangs on the order; its status says whose turn it is.
import { newId } from '@shared/ids';
import {
    BRIEF_FILES_MAX,
    briefFileKind,
    type BriefFileMime,
    briefFilePrefix,
    isMade,
    MADE_CODE,
    MADE_HOURS,
    MADE_NAME,
    madeStage,
    roundsLeft,
} from '@shared/made';
import { photoPrefix } from '@shared/photos';
import { type Brief, emptyBrief, type MadeView, missingFromBrief } from '@shared/schemas/made';
import type { OrderStatus } from '@shared/types';
import { and, asc, eq, inArray, ne } from 'drizzle-orm';

import {
    customers,
    invitations,
    invoiceItems,
    invoices,
    orderAssets,
    orderEvents,
    orders,
} from '../db/schema';
import { getPlatform } from '../platform/context';
import { createInvoice, invoicesForOrder } from './billing';
import { addToGallery } from './composer';
import { OrderError } from './orders';

type Order = typeof orders.$inferSelect;

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

async function orderRow(orderId: string): Promise<Order> {
    const order = await getPlatform().db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) throw new OrderError('Order not found');
    return order;
}

async function madeOrder(orderId: string): Promise<Order> {
    const order = await orderRow(orderId);
    if (!isMade(order.addons)) throw new OrderError('This invitation isn’t done-for-you');
    return order;
}

const addonBills = (orderId: string) =>
    getPlatform()
        .db.select({
            paid: invoices.amountPaid,
            total: invoices.total,
        })
        .from(invoiceItems)
        .innerJoin(invoices, eq(invoices.id, invoiceItems.invoiceId))
        .where(
            and(
                eq(invoices.orderId, orderId),
                ne(invoices.status, 'void'),
                eq(invoiceItems.kind, 'addon'),
                eq(invoiceItems.description, MADE_NAME),
            ),
        );

// The bill the add-on is on has had something paid towards it.
const addonPaid = async (orderId: string) =>
    (await addonBills(orderId)).some((b) => b.paid > 0 || b.total === 0);

const filesOf = (orderId: string) =>
    getPlatform()
        .db.select()
        .from(orderAssets)
        .where(eq(orderAssets.orderId, orderId))
        .orderBy(asc(orderAssets.createdAt));

export async function orderOfInvitation(invitationId: string): Promise<string> {
    const row = await getPlatform()
        .db.select({ orderId: invitations.orderId })
        .from(invitations)
        .where(eq(invitations.id, invitationId))
        .get();
    if (!row?.orderId) throw new OrderError('Invitation not found');
    return row.orderId;
}

export async function madeView(orderId: string): Promise<MadeView> {
    const { db } = getPlatform();
    const order = await orderRow(orderId);
    const [files, events, invitation, bills, paid] = await Promise.all([
        filesOf(orderId),
        // Only the conversation: the studio's own notes stay in the studio.
        db
            .select()
            .from(orderEvents)
            .where(and(eq(orderEvents.orderId, orderId), eq(orderEvents.kind, 'revision')))
            .orderBy(asc(orderEvents.createdAt)),
        db
            .select({
                slug: invitations.slug,
                status: invitations.status,
                previewToken: invitations.previewToken,
            })
            .from(invitations)
            .where(eq(invitations.orderId, orderId))
            .get(),
        invoicesForOrder(orderId),
        addonPaid(orderId),
    ]);
    const stage = madeStage(order.status);
    return {
        orderId,
        made: isMade(order.addons),
        paid,
        stage,
        brief: order.brief ?? emptyBrief,
        files: files.map((f) => ({
            id: f.id,
            name: f.name ?? 'File',
            kind: f.kind,
            mime: f.mime,
            size: f.size,
            inInvitation: f.photoKey !== null,
        })),
        messages: events.map((e) => ({
            id: e.id,
            from: e.userId ? 'studio' : 'customer',
            text: e.body ?? '',
            at: e.createdAt,
        })),
        dueAt: order.deliveryDueAt,
        roundsLeft: roundsLeft(order.revisionCount),
        balance: bills.filter((i) => i.status !== 'void').reduce((sum, i) => sum + i.balanceDue, 0),
        currency: order.currency,
        previewToken: invitation?.previewToken ?? null,
        slug: invitation?.slug ?? null,
        live: invitation?.status === 'published',
    };
}

// ── The customer ────────────────────────────────────────────────────────────

// Their details can change until they send them, and again whenever the studio asks for more.
async function openBrief(orderId: string): Promise<Order> {
    const order = await madeOrder(orderId);
    if (!(await addonPaid(orderId)))
        throw new OrderError('Complete payment first, then send us your details');
    if (madeStage(order.status) !== 'details')
        throw new OrderError('Our studio already has your details');
    return order;
}

export async function saveBrief(orderId: string, brief: Brief) {
    await openBrief(orderId);
    await getPlatform().db.update(orders).set({ brief }).where(eq(orders.id, orderId));
}

interface NewFile {
    name: string;
    mime: BriefFileMime;
    bytes: ArrayBuffer;
}

export async function addBriefFile(orderId: string, file: NewFile) {
    await openBrief(orderId);
    const { blob, db } = getPlatform();
    if ((await filesOf(orderId)).length >= BRIEF_FILES_MAX)
        throw new OrderError(`Send up to ${String(BRIEF_FILES_MAX)} files`);
    const blobKey = `${briefFilePrefix(orderId)}${newId()}`;
    await blob.put(blobKey, file.bytes, { contentType: file.mime });
    const [row] = await db
        .insert(orderAssets)
        .values({
            orderId,
            blobKey,
            kind: briefFileKind(file.mime),
            name: file.name,
            mime: file.mime,
            size: file.bytes.byteLength,
        })
        .returning({ id: orderAssets.id });
    if (!row) throw new OrderError('That file couldn’t be kept');
    return row.id;
}

export async function removeBriefFile(orderId: string, fileId: string) {
    await openBrief(orderId);
    const { blob, db } = getPlatform();
    const [row] = await db
        .delete(orderAssets)
        .where(and(eq(orderAssets.id, fileId), eq(orderAssets.orderId, orderId)))
        .returning({ blobKey: orderAssets.blobKey });
    if (row) await blob.delete(row.blobKey);
}

export async function briefFile(orderId: string, fileId: string) {
    const { blob, db } = getPlatform();
    const row = await db
        .select()
        .from(orderAssets)
        .where(and(eq(orderAssets.id, fileId), eq(orderAssets.orderId, orderId)))
        .get();
    const object = row ? await blob.get(row.blobKey) : null;
    return row && object
        ? {
              name: row.name ?? 'file',
              mime: row.mime,
              body: object.body,
          }
        : null;
}

interface Move {
    to: OrderStatus;
    note: string;
    userId: string | null;
    // What the other side reads.
    message?: string;
    patch?: Partial<typeof orders.$inferInsert>;
}

async function move(order: Order, { to, note, userId, message, patch }: Move) {
    const { db } = getPlatform();
    // Only from where it was read: a second tap, or the other side moving first, changes nothing.
    const moved = await db
        .update(orders)
        .set({
            ...patch,
            status: to,
            updatedAt: new Date().toISOString(),
        })
        .where(and(eq(orders.id, order.id), eq(orders.status, order.status)))
        .returning({ id: orders.id });
    if (moved.length === 0) throw new OrderError('This has just changed. Reload to see it');
    await db.insert(orderEvents).values([
        {
            orderId: order.id,
            kind: 'status',
            fromStatus: order.status,
            toStatus: to,
            body: note,
            userId,
        },
        ...(message
            ? [
                  {
                      orderId: order.id,
                      kind: 'revision' as const,
                      body: message,
                      userId,
                  },
              ]
            : []),
    ]);
}

// Everything is in: the clock for the first look starts now.
export async function sendBrief(orderId: string) {
    const order = await openBrief(orderId);
    const missing = missingFromBrief(order.brief ?? emptyBrief, (await filesOf(orderId)).length);
    if (missing) throw new OrderError(missing);
    await move(order, {
        to: 'ready_to_start',
        note: 'Details sent by the customer',
        userId: null,
        patch: {
            contentCompletedAt: new Date().toISOString(),
            deliveryDueAt: hoursFromNow(MADE_HOURS),
        },
    });
}

export async function askForChanges(orderId: string, text: string) {
    const order = await madeOrder(orderId);
    if (madeStage(order.status) !== 'look')
        throw new OrderError('You can ask for changes once your first look is ready');
    if (roundsLeft(order.revisionCount) === 0)
        throw new OrderError(
            'Your rounds of changes are used. Message us and we’ll tell you the price',
        );
    await move(order, {
        to: 'revision_requested',
        note: 'Changes asked for by the customer',
        userId: null,
        message: text,
        patch: {
            revisionCount: order.revisionCount + 1,
            deliveryDueAt: hoursFromNow(MADE_HOURS),
        },
    });
}

// ── The studio ──────────────────────────────────────────────────────────────

export async function askForDetails(orderId: string, text: string, userId: string) {
    const order = await madeOrder(orderId);
    if (madeStage(order.status) !== 'making')
        throw new OrderError('You can ask for details while you’re making it');
    if (!text) throw new OrderError('Say what is missing');
    await move(order, {
        to: 'details_pending',
        note: 'Asked the customer for more details; the clock has stopped',
        userId,
        message: text,
        patch: {
            contentCompletedAt: null,
            deliveryDueAt: null,
        },
    });
}

export async function shareLook(orderId: string, text: string, userId: string) {
    const order = await madeOrder(orderId);
    const stage = madeStage(order.status);
    if (stage !== 'making' && stage !== 'changes')
        throw new OrderError('There is nothing to share at this point');
    const invitation = await getPlatform()
        .db.select({ id: invitations.id })
        .from(invitations)
        .where(eq(invitations.orderId, orderId))
        .get();
    if (!invitation) throw new OrderError('Create the invitation first');
    await move(order, {
        to: 'preview_shared',
        note: stage === 'changes' ? 'Changes shared with the customer' : 'First look shared',
        userId,
        message: text || undefined,
        patch: { deliveryDueAt: null },
    });
    return stage;
}

// A photo they sent, now in the invitation: its gallery has it, and the file remembers it.
export async function placePhoto(orderId: string, fileId: string, key: string) {
    const { db } = getPlatform();
    const [file, invitation] = await Promise.all([
        db
            .select()
            .from(orderAssets)
            .where(and(eq(orderAssets.id, fileId), eq(orderAssets.orderId, orderId)))
            .get(),
        db
            .select({ id: invitations.id })
            .from(invitations)
            .where(eq(invitations.orderId, orderId))
            .get(),
    ]);
    if (file?.kind !== 'photo') throw new OrderError('That isn’t one of their photos');
    if (!invitation) throw new OrderError('Create the invitation first');
    if (file.photoKey) return;
    // Only a photo stored under this invitation: never someone else's, never a path of our own.
    if (!key.startsWith(photoPrefix(invitation.id)) || key.includes('..'))
        throw new OrderError('That photo belongs to another invitation');
    await addToGallery(invitation.id, key);
    await db.update(orderAssets).set({ photoKey: key }).where(eq(orderAssets.id, fileId));
}

// Statuses in which the customer still has to send something.
const beforeWork: OrderStatus[] = [
    'new_inquiry',
    'quotation_sent',
    'awaiting_advance',
    'payment_received',
    'details_pending',
];

// Adds it to an order that began without it, on a bill of its own. Safe to repeat: whichever half
// is missing is made.
export async function addMade(orderId: string, amount: number, userId: string | null) {
    const { db } = getPlatform();
    const order = await orderRow(orderId);
    if (!(await addonBills(orderId)).length)
        await createInvoice({
            orderId,
            customerId: order.customerId,
            currency: order.currency,
            items: [
                {
                    kind: 'addon',
                    description: MADE_NAME,
                    qty: 1,
                    unitPrice: amount,
                },
            ],
        });
    if (isMade(order.addons)) return;
    const status = order.status === 'payment_received' ? 'details_pending' : order.status;
    await db.batch([
        db
            .update(orders)
            .set({
                addons: [...order.addons, MADE_CODE],
                totalMinor: order.totalMinor + amount,
                status,
            })
            .where(eq(orders.id, orderId)),
        db.insert(orderEvents).values({
            orderId,
            kind: 'status',
            fromStatus: order.status,
            toStatus: status,
            body: 'Done-for-you added',
            userId,
        }),
    ]);
}

// Only while nobody has seen it: once it is live, changes would show to guests as they are made.
export async function canAddMade(orderId: string): Promise<boolean> {
    const order = await orderRow(orderId);
    if (isMade(order.addons) || !beforeWork.includes(order.status)) return false;
    const live = await getPlatform()
        .db.select({ id: invitations.id })
        .from(invitations)
        .where(
            and(
                eq(invitations.orderId, orderId),
                inArray(invitations.status, ['published', 'archived']),
            ),
        )
        .get();
    return !live;
}

// Who to write to about it.
export async function madeContact(orderId: string) {
    return getPlatform()
        .db.select({
            email: customers.email,
            number: orders.number,
            invitationId: invitations.id,
        })
        .from(orders)
        .innerJoin(customers, eq(customers.id, orders.customerId))
        .leftJoin(invitations, eq(invitations.orderId, orders.id))
        .where(eq(orders.id, orderId))
        .get();
}
