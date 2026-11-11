// Portable schema: text/integer/real only, JSON stored as text, ISO-8601 timestamps,
// booleans as 0/1 and money as integer minor units. Keep server/db/schema.pg.ts in sync.
import { newId } from '@shared/ids';
import type {
    EventKind,
    InvitationContent,
    InvitationDesign,
    InvitationExtras,
    LocalizedText,
    OrderStatus,
    PackageLimits,
    SectionConfig,
} from '@shared/types';
import { sql } from 'drizzle-orm';
import {
    index,
    integer,
    primaryKey,
    real,
    sqliteTable,
    text,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const invoiceStatuses = ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void'] as const;

interface DressCode {
    note?: LocalizedText;
    swatches: string[];
}

const id = () =>
    text('id')
        .primaryKey()
        .$defaultFn(() => newId());
const now = () => sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;
const createdAt = () => text('created_at').notNull().default(now());
const updatedAt = () => text('updated_at').notNull().default(now());
const bool = (name: string) => integer(name, { mode: 'boolean' });
const json = <T>(name: string) => text(name, { mode: 'json' }).$type<T>();

// ── Identity ────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
    id: id(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    role: text('role', { enum: ['super_admin', 'owner', 'designer'] }).notNull(),
    hourlyRateMinor: integer('hourly_rate_minor').notNull().default(0),
    isActive: bool('is_active').notNull().default(true),
    lastLoginAt: text('last_login_at'),
    createdAt: createdAt(),
});

export const authCodes = sqliteTable(
    'auth_codes',
    {
        id: id(),
        email: text('email').notNull(),
        codeHash: text('code_hash').notNull(),
        attempts: integer('attempts').notNull().default(0),
        expiresAt: text('expires_at').notNull(),
        usedAt: text('used_at'),
        createdAt: createdAt(),
    },
    (t) => [index('auth_codes_email_idx').on(t.email)],
);

export const sessions = sqliteTable(
    'sessions',
    {
        id: text('id').primaryKey(),
        kind: text('kind', { enum: ['admin', 'customer', 'couple'] }).notNull(),
        subjectId: text('subject_id').notNull(),
        expiresAt: text('expires_at').notNull(),
        createdAt: createdAt(),
    },
    (t) => [index('sessions_subject_idx').on(t.kind, t.subjectId)],
);

// ── CRM ─────────────────────────────────────────────────────────────────────
export const partners = sqliteTable('partners', {
    id: id(),
    name: text('name').notNull(),
    code: text('code').notNull().unique(),
    email: text('email'),
    phone: text('phone'),
    commissionBps: integer('commission_bps').notNull().default(1000),
    isActive: bool('is_active').notNull().default(true),
    createdAt: createdAt(),
});

export const customers = sqliteTable(
    'customers',
    {
        id: id(),
        name: text('name').notNull(),
        email: text('email'),
        phone: text('phone'),
        country: text('country').notNull().default('IN'),
        locale: text('locale').notNull().default('en'),
        city: text('city'),
        source: text('source'),
        partnerId: text('partner_id').references(() => partners.id),
        notes: text('notes'),
        createdAt: createdAt(),
    },
    (t) => [index('customers_email_idx').on(t.email), index('customers_phone_idx').on(t.phone)],
);

export const inquiries = sqliteTable(
    'inquiries',
    {
        id: id(),
        name: text('name').notNull(),
        email: text('email'),
        phone: text('phone'),
        country: text('country'),
        culture: text('culture'),
        packageCode: text('package_code'),
        weddingDate: text('wedding_date'),
        message: text('message'),
        source: text('source').notNull().default('organic'),
        utm: json<Record<string, string>>('utm'),
        stage: text('stage', { enum: ['new', 'contacted', 'quoted', 'won', 'lost'] })
            .notNull()
            .default('new'),
        followUpAt: text('follow_up_at'),
        ownerUserId: text('owner_user_id').references(() => users.id),
        lostReason: text('lost_reason'),
        customerId: text('customer_id').references(() => customers.id),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (t) => [
        index('inquiries_stage_idx').on(t.stage),
        index('inquiries_follow_idx').on(t.followUpAt),
    ],
);

// ── Catalogue ───────────────────────────────────────────────────────────────
export const packages = sqliteTable('packages', {
    code: text('code').primaryKey(),
    name: text('name').notNull(),
    tagline: text('tagline'),
    limits: json<PackageLimits>('limits').notNull(),
    isAtelier: bool('is_atelier').notNull().default(false),
    isActive: bool('is_active').notNull().default(true),
    sort: integer('sort').notNull().default(0),
});

export const packagePrices = sqliteTable(
    'package_prices',
    {
        id: id(),
        packageCode: text('package_code')
            .notNull()
            .references(() => packages.code),
        currency: text('currency').notNull(),
        amountMinor: integer('amount_minor').notNull(),
        isFrom: bool('is_from').notNull().default(false),
    },
    (t) => [uniqueIndex('package_prices_uq').on(t.packageCode, t.currency)],
);

export const addons = sqliteTable('addons', {
    code: text('code').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    isActive: bool('is_active').notNull().default(true),
    sort: integer('sort').notNull().default(0),
});

export const addonPrices = sqliteTable(
    'addon_prices',
    {
        id: id(),
        addonCode: text('addon_code')
            .notNull()
            .references(() => addons.code),
        currency: text('currency').notNull(),
        amountMinor: integer('amount_minor').notNull(),
    },
    (t) => [uniqueIndex('addon_prices_uq').on(t.addonCode, t.currency)],
);

export const capacityRules = sqliteTable('capacity_rules', {
    packageCode: text('package_code')
        .primaryKey()
        .references(() => packages.code),
    perDay: integer('per_day'),
    perWeek: integer('per_week'),
    perMonth: integer('per_month'),
});

export const themes = sqliteTable('themes', {
    id: id(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    culture: text('culture').notNull(),
    category: text('category').notNull(),
    description: text('description').notNull(),
    previewMedia: json<string[]>('preview_media').notNull().default([]),
    config: json<Partial<InvitationDesign>>('config').notNull(),
    fromPackage: text('from_package').notNull().default('signature'),
    isActive: bool('is_active').notNull().default(true),
    isFeatured: bool('is_featured').notNull().default(false),
    sort: integer('sort').notNull().default(0),
    createdAt: createdAt(),
});

export const musicTracks = sqliteTable('music_tracks', {
    id: id(),
    title: text('title').notNull(),
    artist: text('artist'),
    culture: text('culture'),
    blobKey: text('blob_key').notNull(),
    licenseUrl: text('license_url').notNull(),
    durationSec: integer('duration_sec'),
    isActive: bool('is_active').notNull().default(true),
});

// ── Orders ──────────────────────────────────────────────────────────────────
export const orders = sqliteTable(
    'orders',
    {
        id: id(),
        number: text('number').notNull().unique(),
        customerId: text('customer_id')
            .notNull()
            .references(() => customers.id),
        packageCode: text('package_code')
            .notNull()
            .references(() => packages.code),
        currency: text('currency').notNull(),
        addons: json<string[]>('addons').notNull().default([]),
        totalMinor: integer('total_minor').notNull(),
        status: text('status').$type<OrderStatus>().notNull().default('new_inquiry'),
        eventKind: text('event_kind').notNull().default('wedding'),
        culture: text('culture').notNull().default('universal'),
        weddingDate: text('wedding_date'),
        contentCompletedAt: text('content_completed_at'),
        deliveryDueAt: text('delivery_due_at'),
        assignedUserId: text('assigned_user_id').references(() => users.id),
        revisionCount: integer('revision_count').notNull().default(0),
        partnerId: text('partner_id').references(() => partners.id),
        couponCode: text('coupon_code'),
        portalToken: text('portal_token').notNull().unique(),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (t) => [
        index('orders_status_idx').on(t.status),
        index('orders_due_idx').on(t.deliveryDueAt),
        index('orders_customer_idx').on(t.customerId),
    ],
);

export const orderEvents = sqliteTable(
    'order_events',
    {
        id: id(),
        orderId: text('order_id')
            .notNull()
            .references(() => orders.id),
        kind: text('kind', { enum: ['status', 'note', 'revision', 'system'] }).notNull(),
        fromStatus: text('from_status'),
        toStatus: text('to_status'),
        body: text('body'),
        userId: text('user_id').references(() => users.id),
        createdAt: createdAt(),
    },
    (t) => [index('order_events_order_idx').on(t.orderId)],
);

export const orderAssets = sqliteTable(
    'order_assets',
    {
        id: id(),
        orderId: text('order_id')
            .notNull()
            .references(() => orders.id),
        blobKey: text('blob_key').notNull(),
        kind: text('kind', { enum: ['photo', 'artwork', 'music', 'document', 'other'] }).notNull(),
        mime: text('mime').notNull(),
        size: integer('size').notNull(),
        createdAt: createdAt(),
    },
    (t) => [index('order_assets_order_idx').on(t.orderId)],
);

export const capacitySlots = sqliteTable(
    'capacity_slots',
    {
        id: id(),
        packageCode: text('package_code')
            .notNull()
            .references(() => packages.code),
        date: text('date').notNull(),
        orderId: text('order_id').references(() => orders.id),
        depositPaid: bool('deposit_paid').notNull().default(false),
        createdAt: createdAt(),
    },
    (t) => [index('capacity_slots_date_idx').on(t.packageCode, t.date)],
);

export const timeEntries = sqliteTable(
    'time_entries',
    {
        id: id(),
        orderId: text('order_id')
            .notNull()
            .references(() => orders.id),
        userId: text('user_id')
            .notNull()
            .references(() => users.id),
        activity: text('activity', { enum: ['design', 'dev', 'comms', 'revision'] }).notNull(),
        startedAt: text('started_at').notNull(),
        minutes: integer('minutes'),
        createdAt: createdAt(),
    },
    (t) => [index('time_entries_order_idx').on(t.orderId)],
);

// ── Billing (all amounts integer minor units in the row's currency) ────────
export const counters = sqliteTable('counters', {
    key: text('key').primaryKey(),
    value: integer('value').notNull().default(0),
});

export const invoices = sqliteTable(
    'invoices',
    {
        id: id(),
        number: text('number').notNull().unique(),
        orderId: text('order_id').references(() => orders.id),
        customerId: text('customer_id')
            .notNull()
            .references(() => customers.id),
        type: text('type', { enum: ['proforma', 'tax'] })
            .notNull()
            .default('proforma'),
        currency: text('currency').notNull(),
        issueDate: text('issue_date').notNull(),
        dueDate: text('due_date').notNull(),
        subtotal: integer('subtotal').notNull().default(0),
        discount: integer('discount').notNull().default(0),
        taxBps: integer('tax_bps').notNull().default(0),
        taxAmount: integer('tax_amount').notNull().default(0),
        total: integer('total').notNull().default(0),
        amountPaid: integer('amount_paid').notNull().default(0),
        amountCredited: integer('amount_credited').notNull().default(0),
        balanceDue: integer('balance_due').notNull().default(0),
        status: text('status', { enum: invoiceStatuses }).notNull().default('draft'),
        notes: text('notes'),
        createdAt: createdAt(),
    },
    (t) => [
        index('invoices_customer_idx').on(t.customerId),
        index('invoices_status_idx').on(t.status),
        index('invoices_order_idx').on(t.orderId),
    ],
);

export const invoiceItems = sqliteTable(
    'invoice_items',
    {
        id: id(),
        invoiceId: text('invoice_id')
            .notNull()
            .references(() => invoices.id),
        kind: text('kind', { enum: ['package', 'addon', 'extra', 'discount'] }).notNull(),
        description: text('description').notNull(),
        qty: integer('qty').notNull().default(1),
        unitPrice: integer('unit_price').notNull(),
        amount: integer('amount').notNull(),
        sort: integer('sort').notNull().default(0),
    },
    (t) => [index('invoice_items_invoice_idx').on(t.invoiceId)],
);

export const payments = sqliteTable(
    'payments',
    {
        id: id(),
        invoiceId: text('invoice_id')
            .notNull()
            .references(() => invoices.id),
        orderId: text('order_id').references(() => orders.id),
        currency: text('currency').notNull(),
        amount: integer('amount').notNull(),
        method: text('method', { enum: ['online', 'upi', 'cash', 'bank', 'card'] }).notNull(),
        provider: text('provider'),
        providerRef: text('provider_ref'),
        reference: text('reference'),
        status: text('status', { enum: ['pending', 'captured', 'failed'] }).notNull(),
        paidAt: text('paid_at'),
        recordedBy: text('recorded_by').references(() => users.id),
        createdAt: createdAt(),
    },
    (t) => [
        index('payments_invoice_idx').on(t.invoiceId),
        uniqueIndex('payments_provider_ref_uq').on(t.provider, t.providerRef),
    ],
);

export const creditNotes = sqliteTable('credit_notes', {
    id: id(),
    invoiceId: text('invoice_id')
        .notNull()
        .references(() => invoices.id),
    kind: text('kind', { enum: ['credit', 'refund'] }).notNull(),
    amount: integer('amount').notNull(),
    reason: text('reason').notNull(),
    userId: text('user_id').references(() => users.id),
    createdAt: createdAt(),
});

export const paymentReminders = sqliteTable('payment_reminders', {
    id: id(),
    invoiceId: text('invoice_id')
        .notNull()
        .references(() => invoices.id),
    channel: text('channel', { enum: ['whatsapp', 'email'] }).notNull(),
    sentAt: text('sent_at').notNull().default(now()),
});

export const coupons = sqliteTable('coupons', {
    id: id(),
    code: text('code').notNull().unique(),
    kind: text('kind', { enum: ['percent', 'flat'] }).notNull(),
    value: integer('value').notNull(),
    currency: text('currency'),
    minAmount: integer('min_amount'),
    validFrom: text('valid_from'),
    validTo: text('valid_to'),
    maxUses: integer('max_uses'),
    perCustomer: integer('per_customer').notNull().default(1),
    packageCodes: json<string[]>('package_codes'),
    usedCount: integer('used_count').notNull().default(0),
    isActive: bool('is_active').notNull().default(true),
    createdAt: createdAt(),
});

export const couponRedemptions = sqliteTable('coupon_redemptions', {
    id: id(),
    couponId: text('coupon_id')
        .notNull()
        .references(() => coupons.id),
    orderId: text('order_id')
        .notNull()
        .references(() => orders.id),
    customerId: text('customer_id')
        .notNull()
        .references(() => customers.id),
    amount: integer('amount').notNull(),
    createdAt: createdAt(),
});

export const quotes = sqliteTable('quotes', {
    id: id(),
    number: text('number').notNull().unique(),
    customerId: text('customer_id')
        .notNull()
        .references(() => customers.id),
    inquiryId: text('inquiry_id').references(() => inquiries.id),
    packageCode: text('package_code').references(() => packages.code),
    currency: text('currency').notNull(),
    validUntil: text('valid_until').notNull(),
    status: text('status', { enum: ['draft', 'sent', 'accepted', 'expired', 'declined'] })
        .notNull()
        .default('draft'),
    notes: text('notes'),
    total: integer('total').notNull().default(0),
    token: text('token').notNull().unique(),
    orderId: text('order_id').references(() => orders.id),
    createdAt: createdAt(),
});

export const quoteItems = sqliteTable('quote_items', {
    id: id(),
    quoteId: text('quote_id')
        .notNull()
        .references(() => quotes.id),
    description: text('description').notNull(),
    qty: integer('qty').notNull().default(1),
    unitPrice: integer('unit_price').notNull(),
    amount: integer('amount').notNull(),
    sort: integer('sort').notNull().default(0),
});

// ── Invitations ─────────────────────────────────────────────────────────────
export const invitations = sqliteTable(
    'invitations',
    {
        id: id(),
        orderId: text('order_id').references(() => orders.id),
        slug: text('slug').notNull().unique(),
        themeId: text('theme_id').references(() => themes.id),
        culture: text('culture').notNull().default('universal'),
        eventKind: text('event_kind').$type<EventKind>().notNull().default('wedding'),
        locales: json<string[]>('locales').notNull().default(['en']),
        calendars: json<string[]>('calendars').notNull().default([]),
        seed: integer('seed').notNull().default(1),
        design: json<InvitationDesign>('design').notNull(),
        content: json<InvitationContent>('content').notNull(),
        sections: json<SectionConfig[]>('sections').notNull(),
        extras: json<InvitationExtras>('extras').notNull().default({}),
        musicTrackId: text('music_track_id').references(() => musicTracks.id),
        musicBlobKey: text('music_blob_key'),
        rsvpEnabled: bool('rsvp_enabled').notNull().default(true),
        sheetId: text('sheet_id'),
        status: text('status', { enum: ['draft', 'preview', 'published', 'archived'] })
            .notNull()
            .default('draft'),
        isDemo: bool('is_demo').notNull().default(false),
        version: integer('version').notNull().default(1),
        previewToken: text('preview_token').notNull().unique(),
        publishedAt: text('published_at'),
        expiresAt: text('expires_at'),
        ogImageKey: text('og_image_key'),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (t) => [
        index('invitations_expires_idx').on(t.expiresAt),
        index('invitations_status_idx').on(t.status),
    ],
);

export const invitationEvents = sqliteTable(
    'invitation_events',
    {
        id: id(),
        invitationId: text('invitation_id')
            .notNull()
            .references(() => invitations.id),
        kind: text('kind').notNull(),
        title: json<LocalizedText>('title').notNull(),
        startsAt: text('starts_at').notNull(),
        endsAt: text('ends_at'),
        timezone: text('timezone').notNull().default('Asia/Kolkata'),
        venue: text('venue').notNull(),
        address: text('address'),
        mapsUrl: text('maps_url'),
        description: json<LocalizedText>('description'),
        dressCode: json<DressCode>('dress_code'),
        imageKey: text('image_key'),
        sort: integer('sort').notNull().default(0),
    },
    (t) => [index('invitation_events_inv_idx').on(t.invitationId)],
);

export const guests = sqliteTable(
    'guests',
    {
        id: id(),
        invitationId: text('invitation_id')
            .notNull()
            .references(() => invitations.id),
        displayName: text('display_name').notNull(),
        token: text('token').notNull().unique(),
        phone: text('phone'),
        email: text('email'),
        allowedEventIds: json<string[]>('allowed_event_ids'),
        maxGuests: integer('max_guests'),
        openedAt: text('opened_at'),
        createdAt: createdAt(),
    },
    (t) => [index('guests_inv_idx').on(t.invitationId)],
);

export const rsvps = sqliteTable(
    'rsvps',
    {
        id: id(),
        invitationId: text('invitation_id')
            .notNull()
            .references(() => invitations.id),
        guestId: text('guest_id').references(() => guests.id),
        name: text('name').notNull(),
        phone: text('phone'),
        attending: bool('attending').notNull(),
        guestCount: integer('guest_count').notNull().default(1),
        eventIds: json<string[]>('event_ids').notNull().default([]),
        dietary: text('dietary'),
        message: text('message'),
        sheetSyncStatus: text('sheet_sync_status', { enum: ['off', 'pending', 'synced', 'failed'] })
            .notNull()
            .default('off'),
        sheetSyncAttempts: integer('sheet_sync_attempts').notNull().default(0),
        createdAt: createdAt(),
    },
    (t) => [
        index('rsvps_inv_idx').on(t.invitationId),
        index('rsvps_sync_idx').on(t.sheetSyncStatus),
    ],
);

export const wishes = sqliteTable(
    'wishes',
    {
        id: id(),
        invitationId: text('invitation_id')
            .notNull()
            .references(() => invitations.id),
        guestId: text('guest_id').references(() => guests.id),
        name: text('name').notNull(),
        message: text('message').notNull(),
        photoKey: text('photo_key'),
        status: text('status', { enum: ['pending', 'approved', 'hidden'] })
            .notNull()
            .default('pending'),
        createdAt: createdAt(),
    },
    (t) => [index('wishes_inv_idx').on(t.invitationId, t.status)],
);

export const guestPhotos = sqliteTable(
    'guest_photos',
    {
        id: id(),
        invitationId: text('invitation_id')
            .notNull()
            .references(() => invitations.id),
        uploaderName: text('uploader_name'),
        blobKey: text('blob_key').notNull(),
        size: integer('size').notNull(),
        status: text('status', { enum: ['pending', 'approved', 'hidden'] })
            .notNull()
            .default('pending'),
        createdAt: createdAt(),
    },
    (t) => [index('guest_photos_inv_idx').on(t.invitationId, t.status)],
);

export const inviteViewsDaily = sqliteTable(
    'invite_views_daily',
    {
        invitationId: text('invitation_id')
            .notNull()
            .references(() => invitations.id),
        date: text('date').notNull(),
        views: integer('views').notNull().default(0),
        uniqueGuests: integer('unique_guests').notNull().default(0),
        fromWhatsapp: integer('from_whatsapp').notNull().default(0),
        rsvpOpens: integer('rsvp_opens').notNull().default(0),
    },
    (t) => [primaryKey({ columns: [t.invitationId, t.date] })],
);

export const inviteVisitors = sqliteTable(
    'invite_visitors',
    {
        invitationId: text('invitation_id').notNull(),
        date: text('date').notNull(),
        visitorHash: text('visitor_hash').notNull(),
    },
    (t) => [primaryKey({ columns: [t.invitationId, t.date, t.visitorHash] })],
);

export const coupleAccess = sqliteTable(
    'couple_access',
    {
        id: id(),
        invitationId: text('invitation_id')
            .notNull()
            .references(() => invitations.id),
        email: text('email'),
        phone: text('phone'),
        createdAt: createdAt(),
    },
    (t) => [index('couple_access_email_idx').on(t.email)],
);

export const reviewRequests = sqliteTable('review_requests', {
    id: id(),
    orderId: text('order_id')
        .notNull()
        .references(() => orders.id),
    token: text('token').notNull().unique(),
    channel: text('channel', { enum: ['whatsapp', 'email'] }).notNull(),
    sentAt: text('sent_at').notNull().default(now()),
    googleClicked: bool('google_clicked').notNull().default(false),
    rating: integer('rating'),
    testimonial: text('testimonial'),
    portfolioConsent: bool('portfolio_consent').notNull().default(false),
    isFeatured: bool('is_featured').notNull().default(false),
    respondedAt: text('responded_at'),
});

// ── System ──────────────────────────────────────────────────────────────────
export const reservedSlugs = sqliteTable('reserved_slugs', {
    slug: text('slug').primaryKey(),
    reason: text('reason').notNull().default('system'),
});

export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: json<unknown>('value').notNull(),
});

export const aiUsage = sqliteTable('ai_usage', {
    id: id(),
    orderId: text('order_id').references(() => orders.id),
    userId: text('user_id').references(() => users.id),
    inputTokens: integer('input_tokens').notNull(),
    outputTokens: integer('output_tokens').notNull(),
    costUsd: real('cost_usd').notNull().default(0),
    createdAt: createdAt(),
});

export const auditLog = sqliteTable(
    'audit_log',
    {
        id: id(),
        userId: text('user_id'),
        action: text('action').notNull(),
        entity: text('entity').notNull(),
        entityId: text('entity_id'),
        data: json<unknown>('data'),
        createdAt: createdAt(),
    },
    (t) => [index('audit_entity_idx').on(t.entity, t.entityId)],
);
