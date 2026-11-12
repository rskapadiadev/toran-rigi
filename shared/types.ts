import type { z } from 'zod';

import type {
    contentSchema,
    designSchema,
    edgeKinds,
    enterPresets,
    eventKinds,
    extrasSchema,
    localizedText,
    packageLimitsSchema,
    paletteSchema,
    sceneKinds,
    sectionConfigSchema,
    sectionTypes,
} from './schemas/invitation';

export type LocalizedText = z.infer<typeof localizedText>;
export type EventKind = (typeof eventKinds)[number];
export type SectionType = (typeof sectionTypes)[number];
export type Palette = z.infer<typeof paletteSchema>;
export type InvitationDesign = z.infer<typeof designSchema>;
export type InvitationContent = z.infer<typeof contentSchema>;
export type SectionConfig = z.infer<typeof sectionConfigSchema>;
export type EnterPreset = (typeof enterPresets)[number];
export type SceneKind = (typeof sceneKinds)[number];
export type EdgeKind = (typeof edgeKinds)[number];
export type InvitationExtras = z.infer<typeof extrasSchema>;
export type PackageLimits = z.infer<typeof packageLimitsSchema>;

export const orderStatuses = [
    'new_inquiry',
    'quotation_sent',
    'awaiting_advance',
    'payment_received',
    'details_pending',
    'ready_to_start',
    'design_in_progress',
    'preview_shared',
    'revision_requested',
    'awaiting_approval',
    'awaiting_final_payment',
    'published',
    'completed',
    'cancelled',
] as const;
export type OrderStatus = (typeof orderStatuses)[number];
