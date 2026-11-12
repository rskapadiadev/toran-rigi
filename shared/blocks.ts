// Block catalog: the menu of layouts, entrances, backdrops and edges every section can mix.
// Pure data so the admin Composer, the seed and the renderer all read the same source.
import type {
    EdgeKind,
    EnterPreset,
    InvitationDesign,
    SceneKind,
    SectionConfig,
    SectionType,
} from './types';

type OpeningKind = InvitationDesign['opening'];

export interface VariantInfo {
    id: string;
    label: string;
    hint: string;
}

export interface BlockDefaults {
    variant: string;
    enter: EnterPreset;
    scene: SceneKind;
}

const textVariants: VariantInfo[] = [
    {
        id: 'centered',
        label: 'Centred',
        hint: 'Calm centred verse with a drawn ornament',
    },
    {
        id: 'framed',
        label: 'Framed',
        hint: 'Words inside a foil-bordered panel',
    },
    {
        id: 'editorial',
        label: 'Editorial',
        hint: 'Magazine layout, drop cap and side rule',
    },
];

export const blockVariants: Partial<Record<SectionType, VariantInfo[]>> = {
    cover: [
        {
            id: 'spotlight',
            label: 'Spotlight',
            hint: 'Foil names pooled in light over embroidery',
        },
        {
            id: 'arch',
            label: 'Arch window',
            hint: 'Names framed in a culture arch: jharokha, mihrab, gothic, gurdwara',
        },
        {
            id: 'monogram',
            label: 'Monogram',
            hint: 'A gold-ring monogram with names beneath',
        },
        {
            id: 'editorial',
            label: 'Editorial',
            hint: 'Huge stacked type, date on the spine',
        },
    ],
    card: [
        {
            id: 'stack',
            label: 'Stacked cards',
            hint: 'Two paper cards; the second slides over the first',
        },
        {
            id: 'single',
            label: 'Single card',
            hint: 'One deckle-edge card with every detail',
        },
    ],
    countdown: [
        {
            id: 'flip',
            label: 'Split-flap',
            hint: 'Hotel-board digits that flip',
        },
        {
            id: 'rings',
            label: 'Rings',
            hint: 'Gold progress rings for each unit',
        },
        {
            id: 'line',
            label: 'One line',
            hint: '“128 days to go” in display type',
        },
    ],
    welcome: textVariants,
    story: textVariants,
    family: textVariants,
    events: [
        {
            id: 'arches',
            label: 'Pop-up arches',
            hint: 'Each ceremony unfolds like a paper diorama',
        },
        {
            id: 'timeline',
            label: 'Thread timeline',
            hint: 'A golden thread stitches through the day',
        },
        {
            id: 'tickets',
            label: 'Tickets',
            hint: 'Swipeable admit-one tickets',
        },
    ],
    gallery: [
        {
            id: 'grid',
            label: 'Mosaic',
            hint: 'Tidy photo mosaic',
        },
        {
            id: 'polaroid',
            label: 'Polaroids',
            hint: 'Scattered instant photos with tape',
        },
        {
            id: 'film',
            label: 'Film strip',
            hint: 'A sideways-scrolling film reel',
        },
    ],
    closing: [
        {
            id: 'blessing',
            label: 'Blessing',
            hint: 'Closing words and share button',
        },
        {
            id: 'monogram',
            label: 'Monogram seal',
            hint: 'Ends on the couple’s wax-seal monogram',
        },
    ],
};

// The entry screen guests see before the invitation. Bandhani/phulkari/stitch share the bloom
// ritual with lotus (the pattern comes from the generative art), so the picker shows one card.
export interface OpeningInfo extends VariantInfo {
    id: OpeningKind;
    gesture: string;
    // Quiet enough for remembrance and prayer occasions.
    gentle: boolean;
}

export const openingChoices: OpeningInfo[] = [
    {
        id: 'scratch',
        label: 'Gold-foil scratch card',
        hint: 'Guests scratch the foil away to uncover the names',
        gesture: 'Scratch',
        gentle: false,
    },
    {
        id: 'liquid-gold',
        label: 'Liquid gold',
        hint: 'Molten drops fuse and flood the screen in gold',
        gesture: 'Tap',
        gentle: false,
    },
    {
        id: 'ink',
        label: 'Ink bloom',
        hint: 'Watercolour ink washes across the paper',
        gesture: 'Tap',
        gentle: true,
    },
    {
        id: 'origami',
        label: 'Origami unfold',
        hint: 'A folded paper square opens flap by flap in 3D',
        gesture: 'Tap',
        gentle: true,
    },
    {
        id: 'warp',
        label: 'Starfield warp',
        hint: 'Stars streak into hyperspace, then a flash of names',
        gesture: 'Tap',
        gentle: false,
    },
    {
        id: 'fireworks',
        label: 'Fireworks',
        hint: 'A volley of fireworks whose sparks spell the initials',
        gesture: 'Tap',
        gentle: false,
    },
    {
        id: 'doors',
        label: 'Palace doors',
        hint: 'Carved doors swing open in 3D',
        gesture: 'Tap',
        gentle: false,
    },
    {
        id: 'mashrabiya',
        label: 'Lattice doors',
        hint: 'Mashrabiya screens slide apart as light filters in',
        gesture: 'Tap',
        gentle: false,
    },
    {
        id: 'garden-arch',
        label: 'Garden arch',
        hint: 'Doors of climbing roses part',
        gesture: 'Tap',
        gentle: false,
    },
    {
        id: 'envelope',
        label: 'Wax-seal envelope',
        hint: 'The seal cracks, flaps fold and the card rises',
        gesture: 'Tap the seal',
        gentle: true,
    },
    {
        id: 'curtain',
        label: 'Letter curtain',
        hint: 'Rows of giant letters slide away like a theatre curtain',
        gesture: 'Tap',
        gentle: true,
    },
    {
        id: 'lotus',
        label: 'Pattern bloom',
        hint: 'Your generative art blooms open from the centre',
        gesture: 'Tap',
        gentle: true,
    },
    {
        id: 'lantern',
        label: 'Lanterns',
        hint: 'Guests light each hanging lantern',
        gesture: 'Tap each lantern',
        gentle: false,
    },
    {
        id: 'chuppah',
        label: 'Chuppah canopy',
        hint: 'A canopy unfolds over the names',
        gesture: 'Tap',
        gentle: false,
    },
    {
        id: 'diya',
        label: 'Light the diya',
        hint: 'Guests blow (or hold) to light a lamp',
        gesture: 'Blow or hold',
        gentle: true,
    },
];

// bandhani → the lotus card, so a saved alias still shows as selected.
export const openingChoiceFor = (kind: OpeningKind): OpeningKind =>
    openingChoices.some((c) => c.id === kind) ? kind : 'lotus';

export const enterInfo: Record<EnterPreset, VariantInfo> = {
    rise: {
        id: 'rise',
        label: 'Rise',
        hint: 'Floats up out of a soft blur',
    },
    curtain: {
        id: 'curtain',
        label: 'Curtain',
        hint: 'Opens from the centre like parted drapes',
    },
    unfold: {
        id: 'unfold',
        label: 'Unfold',
        hint: 'Folds down from the top like a letter',
    },
    bloom: {
        id: 'bloom',
        label: 'Bloom',
        hint: 'Springs open like a flower',
    },
    ink: {
        id: 'ink',
        label: 'Ink',
        hint: 'Seeps in like ink on paper',
    },
    wipe: {
        id: 'wipe',
        label: 'Wipe',
        hint: 'Revealed bottom to top',
    },
    drift: {
        id: 'drift',
        label: 'Drift',
        hint: 'Glides in from the side',
    },
    tilt: {
        id: 'tilt',
        label: 'Card tilt',
        hint: 'Turns towards you in 3D',
    },
    none: {
        id: 'none',
        label: 'Still',
        hint: 'No entrance animation',
    },
};

export const sceneInfo: Record<SceneKind, VariantInfo> = {
    silk: {
        id: 'silk',
        label: 'Embroidered silk',
        hint: 'Raw silk with raised motif embroidery',
    },
    jacquard: {
        id: 'jacquard',
        label: 'Jacquard',
        hint: 'Deep woven fabric, tone-on-tone motif',
    },
    paper: {
        id: 'paper',
        label: 'Cotton paper',
        hint: 'Handmade paper with fibres',
    },
    blush: {
        id: 'blush',
        label: 'Linen & shadows',
        hint: 'Soft linen with drifting leaf shadows',
    },
    velvet: {
        id: 'velvet',
        label: 'Velvet',
        hint: 'Dark crushed velvet',
    },
    night: {
        id: 'night',
        label: 'Night sky',
        hint: 'Midnight with twinkling stars',
    },
    plain: {
        id: 'plain',
        label: 'Plain',
        hint: 'Theme background only',
    },
};

export const edgeInfo: Record<EdgeKind, VariantInfo> = {
    seam: {
        id: 'seam',
        label: 'Brocade seam',
        hint: 'Gold ribbon sewn between fabrics',
    },
    torn: {
        id: 'torn',
        label: 'Torn paper',
        hint: 'Hand-torn deckle edge',
    },
    scallop: {
        id: 'scallop',
        label: 'Scallop',
        hint: 'Lace-like scalloped edge',
    },
    arch: {
        id: 'arch',
        label: 'Arch',
        hint: 'Section rises as a soft arch',
    },
    none: {
        id: 'none',
        label: 'None',
        hint: 'Sections meet directly',
    },
};

const sectionDefaults: Partial<Record<SectionType, BlockDefaults>> = {
    cover: {
        variant: 'spotlight',
        enter: 'rise',
        scene: 'silk',
    },
    card: {
        variant: 'stack',
        enter: 'tilt',
        scene: 'jacquard',
    },
    countdown: {
        variant: 'flip',
        enter: 'rise',
        scene: 'jacquard',
    },
    welcome: {
        variant: 'centered',
        enter: 'ink',
        scene: 'paper',
    },
    story: {
        variant: 'editorial',
        enter: 'rise',
        scene: 'paper',
    },
    family: {
        variant: 'framed',
        enter: 'unfold',
        scene: 'paper',
    },
    events: {
        variant: 'arches',
        enter: 'rise',
        scene: 'blush',
    },
    gallery: {
        variant: 'polaroid',
        enter: 'bloom',
        scene: 'jacquard',
    },
    travel: {
        variant: 'default',
        enter: 'rise',
        scene: 'paper',
    },
    live: {
        variant: 'default',
        enter: 'rise',
        scene: 'velvet',
    },
    rsvp: {
        variant: 'default',
        enter: 'curtain',
        scene: 'velvet',
    },
    wishes: {
        variant: 'default',
        enter: 'rise',
        scene: 'paper',
    },
    shagun: {
        variant: 'default',
        enter: 'bloom',
        scene: 'silk',
    },
    closing: {
        variant: 'blessing',
        enter: 'ink',
        scene: 'silk',
    },
};

const fallback: BlockDefaults = {
    variant: 'default',
    enter: 'rise',
    scene: 'paper',
};

export interface ResolvedBlock {
    type: SectionType;
    variant: string;
    enter: EnterPreset;
    scene: SceneKind;
    edge: EdgeKind;
    motif?: SectionConfig['motif'];
}

// Calm motion keeps only gentle entrances; theatrical ones settle into a soft ink fade.
export const calmEntrances: readonly EnterPreset[] = ['rise', 'ink', 'none'];
export const settleEnter = (preset: EnterPreset, calm: boolean): EnterPreset =>
    calm && !calmEntrances.includes(preset) ? 'ink' : preset;

// Identity of a block's look; the renderer remounts on change so the entrance replays.
export const blockKey = (b: ResolvedBlock) =>
    [b.type, b.variant, b.enter, b.scene, b.edge, b.motif ?? ''].join(':');

export function resolveBlock(config: SectionConfig, previousScene?: SceneKind): ResolvedBlock {
    const defaults = sectionDefaults[config.type] ?? fallback;
    const known = blockVariants[config.type]?.some((v) => v.id === config.variant) ?? false;
    const scene = config.scene ?? defaults.scene;
    return {
        type: config.type,
        variant: known && config.variant ? config.variant : defaults.variant,
        enter: config.enter ?? defaults.enter,
        scene,
        // Edges only make sense where the backdrop changes.
        edge: config.edge ?? (previousScene && previousScene !== scene ? 'seam' : 'none'),
        motif: config.motif,
    };
}

export type BlockPreset = Partial<Record<SectionType, Omit<SectionConfig, 'type' | 'enabled'>>>;

// Apply a theme's layout preset onto a section list without disturbing order or visibility.
export function applyLayout(sections: SectionConfig[], preset: BlockPreset | undefined) {
    if (!preset) return sections;
    return sections.map((section) => ({
        ...section,
        ...preset[section.type],
    }));
}
