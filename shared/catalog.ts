// Approved package ladder (2026-11-11). Seeded into packages/package_prices; admin can edit afterwards.
import type { Currency } from './money';
import type { PackageLimits } from './types';

export interface PackageDefinition {
    code: string;
    name: string;
    tagline: string;
    isAtelier: boolean;
    limits: PackageLimits;
    prices: Record<Currency, number>;
    isFrom?: boolean;
    highlights: string[];
}

export const packageCatalog: PackageDefinition[] = [
    {
        code: 'signature',
        name: 'Signature',
        tagline: 'Your colours, your generative artwork — delivered in 48 hours.',
        isAtelier: false,
        limits: {
            events: 2,
            photos: 15,
            languages: 1,
            revisions: 1,
            hostingMonths: 6,
            deliveryHours: 48,
            guestLinks: false,
            qrCard: false,
            customOpening: false,
            photoWallQuota: 0,
        },
        prices: {
            INR: 79900,
            AED: 14900,
        },
        highlights: [
            '2 ceremonies',
            '15 photos',
            'RSVP + Google Sheets',
            'Countdown, map & music',
            '6 months hosting',
        ],
    },
    {
        code: 'essential',
        name: 'Essential',
        tagline: 'Personal links for every family, plus a printable QR card.',
        isAtelier: false,
        limits: {
            events: 4,
            photos: 30,
            languages: 1,
            revisions: 2,
            hostingMonths: 12,
            deliveryHours: 72,
            guestLinks: true,
            qrCard: true,
            customOpening: false,
            photoWallQuota: 0,
        },
        prices: {
            INR: 199900,
            AED: 34900,
        },
        highlights: [
            '4 ceremonies',
            '30 photos',
            'Per-guest personal links',
            'QR card for print',
            '12 months hosting',
        ],
    },
    {
        code: 'premium',
        name: 'Premium',
        tagline: 'A signature opening ritual, three languages and a live guest photo wall.',
        isAtelier: false,
        limits: {
            events: 8,
            photos: 60,
            languages: 3,
            revisions: 3,
            hostingMonths: 12,
            deliveryHours: 120,
            guestLinks: true,
            qrCard: true,
            customOpening: true,
            photoWallQuota: 200,
        },
        prices: {
            INR: 499900,
            AED: 79900,
        },
        highlights: [
            '8 ceremonies',
            '60 photos',
            'Custom opening ritual',
            '3 languages',
            'Guest photo wall',
        ],
    },
    {
        code: 'luxury',
        name: 'Luxury',
        tagline: 'Custom art direction and illustration by Toran Atelier.',
        isAtelier: true,
        limits: {
            events: 99,
            photos: 100,
            languages: 3,
            revisions: 4,
            hostingMonths: 18,
            deliveryHours: 240,
            guestLinks: true,
            qrCard: true,
            customOpening: true,
            photoWallQuota: 500,
        },
        prices: {
            INR: 999900,
            AED: 149900,
        },
        highlights: [
            'Unlimited ceremonies',
            'Custom illustrations',
            'Travel & stay guide',
            'Priority support',
            '18 months hosting',
        ],
    },
    {
        code: 'bespoke',
        name: 'Bespoke',
        tagline: 'A fully bespoke celebration experience, crafted with you.',
        isAtelier: true,
        isFrom: true,
        limits: {
            events: 99,
            photos: 200,
            languages: 5,
            revisions: 5,
            hostingMonths: 24,
            deliveryHours: 336,
            guestLinks: true,
            qrCard: true,
            customOpening: true,
            photoWallQuota: 1000,
        },
        prices: {
            INR: 1999900,
            AED: 299900,
        },
        highlights: [
            'Dedicated art director',
            'Bespoke motion & illustration',
            'Custom domain',
            'Any languages',
            '24 months hosting',
        ],
    },
];

export interface AddonDefinition {
    code: string;
    name: string;
    description: string;
    prices: Record<Currency, number>;
}

export const addonCatalog: AddonDefinition[] = [
    {
        code: 'guest_links',
        name: 'Personal guest links',
        description: 'A personal link for every family, with a WhatsApp send list.',
        prices: {
            INR: 49900,
            AED: 3900,
        },
    },
    {
        code: 'qr_card',
        name: 'Printable QR card',
        description: 'A print-ready card with a QR code to your invitation.',
        prices: {
            INR: 29900,
            AED: 2500,
        },
    },
    {
        code: 'photo_wall',
        name: 'Guest photo wall',
        description: 'Guests scan a QR at the venue and share photos into one album.',
        prices: {
            INR: 99900,
            AED: 7900,
        },
    },
    {
        code: 'live_mode',
        name: 'Wedding-day live mode',
        description: 'Happening-now highlights and a YouTube live stream.',
        prices: {
            INR: 49900,
            AED: 3900,
        },
    },
    {
        code: 'express',
        name: 'Express 24-hour delivery',
        description: 'Delivered within 24 hours of complete content.',
        prices: {
            INR: 100000,
            AED: 7900,
        },
    },
    {
        code: 'extra_event',
        name: 'Extra ceremony',
        description: 'Add one more function to your invitation.',
        prices: {
            INR: 30000,
            AED: 2500,
        },
    },
    {
        code: 'extra_language',
        name: 'Extra language',
        description: 'Add one more language to your invitation.',
        prices: {
            INR: 50000,
            AED: 3900,
        },
    },
    {
        code: 'extra_revision',
        name: 'Extra revision round',
        description: 'One more round of changes.',
        prices: {
            INR: 50000,
            AED: 3900,
        },
    },
    {
        code: 'custom_illustration',
        name: 'Custom illustration',
        description: 'A hand-made illustration by Toran Atelier.',
        prices: {
            INR: 150000,
            AED: 9900,
        },
    },
    {
        code: 'video_invite',
        name: 'Animated video invite',
        description: 'An MP4 of your opening for Instagram and WhatsApp Status.',
        prices: {
            INR: 199900,
            AED: 14900,
        },
    },
    {
        code: 'memories',
        name: 'Memories mode (1 year)',
        description: 'Turn your invitation into a memories site after the wedding.',
        prices: {
            INR: 49900,
            AED: 3900,
        },
    },
    {
        code: 'hosting_extension',
        name: 'Hosting extension (1 year)',
        description: 'Keep your invitation online for another year.',
        prices: {
            INR: 49900,
            AED: 3900,
        },
    },
    {
        code: 'season_slot',
        name: 'Season slot reservation',
        description: 'Hold a peak-season delivery slot; adjusted against your order.',
        prices: {
            INR: 29900,
            AED: 2500,
        },
    },
];

export interface CapacityRule {
    perDay?: number;
    perWeek?: number;
    perMonth?: number;
}

export const capacityDefaults: Record<string, CapacityRule> = {
    signature: { perDay: 3 },
    essential: { perWeek: 10 },
    premium: { perWeek: 6 },
    luxury: { perWeek: 3 },
    bespoke: { perMonth: 2 },
};

export const reservedSlugList = [
    'admin',
    'api',
    'app',
    'portal',
    'p',
    'g',
    'i',
    'media',
    'static',
    'assets',
    'themes',
    'pricing',
    'signature',
    'portfolio',
    'about',
    'contact',
    'faq',
    'how-it-works',
    'legal',
    'terms',
    'privacy',
    'refund',
    'login',
    'logout',
    'couple',
    'quote',
    'review',
    'lab',
    'checkout',
    'pay',
    'en',
    'hi',
    'gu',
    'ar',
    'ur',
    'he',
    'pa',
    'www',
    'mail',
    'help',
    'support',
    'blog',
    'sitemap.xml',
    'robots.txt',
];
