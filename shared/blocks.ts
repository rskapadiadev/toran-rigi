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
        {
            id: 'photo',
            label: 'Photo story',
            hint: 'Your photo fills the screen, then settles into a torn-paper frame as you scroll',
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
        {
            id: 'envelope',
            label: 'From the envelope',
            hint: 'The card slides out of a silk envelope as guests scroll',
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
    story: [
        ...textVariants,
        {
            id: 'letter',
            label: 'A note from us',
            hint: 'Handwritten letter on torn paper, with polaroids and pressed flowers',
        },
    ],
    family: [
        ...textVariants,
        {
            id: 'blessings',
            label: 'Blessings card',
            hint: '“With the blessings of”, set on gold-cornered stationery',
        },
    ],
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
        {
            id: 'stack',
            label: 'Stacked arches',
            hint: 'Arch cards that stick and stack as guests scroll, each with its own prop',
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
        {
            id: 'rangoli',
            label: 'Rangoli seal',
            hint: 'A marigold rangoli around the wax seal, and “seal the envelope again”',
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
        id: 'book',
        label: 'Storybook',
        hint: 'A leather-bound book: guests turn real curling pages to the names and date',
        gesture: 'Turn pages',
        gentle: true,
    },
    {
        id: 'tribute',
        label: 'Floral tribute',
        hint: 'Guests tap or blow to offer flowers before the photo; the lamp is lit, incense rises',
        gesture: 'Tap or blow',
        gentle: true,
    },
    {
        id: 'light-pull',
        label: 'Pull the light',
        hint: 'A dark room: pull the lamp’s cord — click — warm light floods in',
        gesture: 'Pull down',
        gentle: true,
    },
    {
        id: 'chain',
        label: 'Pull the chain',
        hint: 'Carved doors part as the guest pulls the gold chain between them',
        gesture: 'Pull down',
        gentle: false,
    },
    {
        id: 'zipper',
        label: 'Zip open',
        hint: 'A gold zip down the silk: the halves part and the invitation shows through',
        gesture: 'Drag down',
        gentle: false,
    },
    {
        id: 'ribbon',
        label: 'Untie the ribbon',
        hint: 'Gift-wrapped: the bow unties, ribbons slide off, the paper flies open',
        gesture: 'Pull',
        gentle: false,
    },
    {
        id: 'veil',
        label: 'Lift the veil',
        hint: 'A sheer gota-edged dupatta floats away and the names come into focus',
        gesture: 'Swipe up',
        gentle: false,
    },
    {
        id: 'bell',
        label: 'Temple bell',
        hint: 'Ring the ghanti three times; a golden wave carries guests in',
        gesture: 'Tap ×3',
        gentle: true,
    },
    {
        id: 'polaroid',
        label: 'Develop the polaroid',
        hint: 'A blank instant photo develops into the names in warm sepia',
        gesture: 'Rub or tap',
        gentle: false,
    },
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
        hint: 'The seal glows and lifts; the flap swings open into light',
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
    iris: {
        id: 'iris',
        label: 'Iris',
        hint: 'Opens from the centre as a growing circle',
    },
    sweep: {
        id: 'sweep',
        label: 'Diagonal sweep',
        hint: 'Revealed from the top corner on a diagonal',
    },
    zoom: {
        id: 'zoom',
        label: 'Zoom',
        hint: 'A slow camera push-in',
    },
    flip: {
        id: 'flip',
        label: 'Card flip',
        hint: 'Turns over like a playing card',
    },
    petal: {
        id: 'petal',
        label: 'Petal fall',
        hint: 'Floats down with a little sway',
    },
    stamp: {
        id: 'stamp',
        label: 'Seal stamp',
        hint: 'Pressed down like a wax seal',
    },
    drop: {
        id: 'drop',
        label: 'Drop',
        hint: 'Revealed top to bottom',
    },
    glow: {
        id: 'glow',
        label: 'Diya glow',
        hint: 'Shimmers in like candlelight',
    },
    swing: {
        id: 'swing',
        label: 'Toran swing',
        hint: 'Swings into place from a top hinge',
    },
    pop: {
        id: 'pop',
        label: 'Pop',
        hint: 'A bouncy pop, for birthdays',
    },
    typewriter: {
        id: 'typewriter',
        label: 'Typewriter',
        hint: 'Typed letter by letter, with a blinking caret',
    },
    words: {
        id: 'words',
        label: 'Word by word',
        hint: 'Each word appears in turn, like a letter read aloud',
    },
    quill: {
        id: 'quill',
        label: 'Quill ink',
        hint: 'Written in wet gold ink that dries as it goes',
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
    terrazzo: {
        id: 'terrazzo',
        label: 'Terrazzo',
        hint: 'Stone chips in your palette on a speckled ground',
    },
    watercolor: {
        id: 'watercolor',
        label: 'Watercolour wash',
        hint: 'Soft blooms of colour bleeding into paper',
    },
    leheriya: {
        id: 'leheriya',
        label: 'Leheriya',
        hint: 'Rajasthani tie-dye waves, for mehndi and sangeet',
    },
    aurora: {
        id: 'aurora',
        label: 'Aurora',
        hint: 'Glowing mesh gradient on a deep ground',
    },
    confetti: {
        id: 'confetti',
        label: 'Confetti',
        hint: 'Scattered dots, strips and squiggles',
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
    lace: {
        id: 'lace',
        label: 'Gold lace',
        hint: 'A zari lace ribbon with scalloped, pierced edges',
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
    cusped: {
        id: 'cusped',
        label: 'Jharokha arcade',
        hint: 'A row of cusped Rajasthani arches',
    },
    ogee: {
        id: 'ogee',
        label: 'Mihrab arcade',
        hint: 'Onion-domed arches, as in a courtyard',
    },
    lotus: {
        id: 'lotus',
        label: 'Lotus',
        hint: 'A row of pointed lotus petals',
    },
    swag: {
        id: 'swag',
        label: 'Swag',
        hint: 'Fabric draped between pins, like a mandap valance',
    },
    wave: {
        id: 'wave',
        label: 'Wave',
        hint: 'A soft rolling wave',
    },
    pinking: {
        id: 'pinking',
        label: 'Pinking',
        hint: 'The zigzag cut of pinking shears',
    },
    cloud: {
        id: 'cloud',
        label: 'Clouds',
        hint: 'Billowy clouds, for little ones',
    },
    deco: {
        id: 'deco',
        label: 'Art deco',
        hint: 'Stepped ziggurat, Gatsby-era',
    },
    slant: {
        id: 'slant',
        label: 'Slant',
        hint: 'One clean diagonal across the width',
    },
    doli: {
        id: 'doli',
        label: 'Doli',
        hint: 'The bride’s palanquin carried along the edge by two bearers',
    },
    ghodi: {
        id: 'ghodi',
        label: 'Baraat ghodi',
        hint: 'The groom in sehra and safa trotting along on a decorated mare',
    },
    car: {
        id: 'car',
        label: 'Vidaai car',
        hint: 'A garlanded vintage car along the edge, wheels turning when animated',
    },
    heartbeat: {
        id: 'heartbeat',
        label: 'Heartbeat',
        hint: 'A heart-monitor trace — for anniversaries, love stories, doctors',
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
    edgeMotion: boolean;
    motif?: SectionConfig['motif'];
}

// Calm motion keeps only gentle entrances; theatrical ones settle into a soft ink fade.
export const calmEntrances: readonly EnterPreset[] = ['rise', 'ink', 'glow', 'words', 'none'];
export const settleEnter = (preset: EnterPreset, calm: boolean): EnterPreset =>
    calm && !calmEntrances.includes(preset) ? 'ink' : preset;

// Sections with their own design. Others in the schema (names, venue, dressCode, photoWall) are
// shown inside these: names on the cover, venue and dress code on each ceremony card.
export const renderedSections = [
    'cover',
    'card',
    'countdown',
    'welcome',
    'story',
    'family',
    'events',
    'gallery',
    'travel',
    'live',
    'rsvp',
    'wishes',
    'shagun',
    'closing',
] as const satisfies readonly SectionType[];
export type RenderedSection = (typeof renderedSections)[number];

export const isRendered = (type: SectionType): type is RenderedSection =>
    (renderedSections as readonly SectionType[]).includes(type);

// Identity of a block's look; the renderer remounts on change so the entrance replays.
export const blockKey = (b: ResolvedBlock) =>
    [b.type, b.variant, b.enter, b.scene, b.edge, b.edgeMotion ? 'live' : '', b.motif ?? ''].join(
        ':',
    );

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
        edgeMotion: config.edgeMotion ?? false,
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
