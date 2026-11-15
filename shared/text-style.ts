// Per-text styling chosen in the visual editor: weight, slant, font, size, colour or gradient fill,
// a highlight behind the words and an animation. Keyed by the text's path ("headline", "events.2.title").
import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const fillSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal('solid'),
        color: hex,
    }),
    z.object({
        kind: z.literal('gradient'),
        from: hex,
        to: hex,
        angle: z.number().min(0).max(360),
    }),
]);
export type Fill = z.infer<typeof fillSchema>;

export const textAnimations = [
    'none',
    'fade',
    'rise',
    'pop',
    'blur',
    'typewriter',
    'glow',
    'shimmer',
    'float',
] as const;
export type TextAnimation = (typeof textAnimations)[number];

export const textAnimationInfo: Record<
    TextAnimation,
    {
        label: string;
        hint: string;
    }
> = {
    none: {
        label: 'None',
        hint: 'Still',
    },
    fade: {
        label: 'Fade',
        hint: 'Softly appears',
    },
    rise: {
        label: 'Rise',
        hint: 'Floats up into place',
    },
    pop: {
        label: 'Pop',
        hint: 'Springs in from small',
    },
    blur: {
        label: 'Focus',
        hint: 'Blurs into focus',
    },
    typewriter: {
        label: 'Typewriter',
        hint: 'Written out left to right',
    },
    glow: {
        label: 'Glow',
        hint: 'Gently breathes light (loops)',
    },
    shimmer: {
        label: 'Shimmer',
        hint: 'A gold sheen sweeps across (loops)',
    },
    float: {
        label: 'Float',
        hint: 'Bobs softly (loops)',
    },
};

export const textFonts = ['inherit', 'display', 'script', 'body'] as const;
export type TextFont = (typeof textFonts)[number];

export const textStyleSchema = z.object({
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    underline: z.boolean().optional(),
    caps: z.boolean().optional(),
    font: z.enum(textFonts).optional(),
    // Relative to the design's size for this text.
    size: z.number().min(0.5).max(2).optional(),
    // Letter spacing in em.
    tracking: z.number().min(-0.05).max(0.5).optional(),
    color: fillSchema.optional(),
    background: fillSchema.optional(),
    // Highlight corner rounding in em.
    radius: z.number().min(0).max(1).optional(),
    animation: z.enum(textAnimations).optional(),
});
export type TextStyle = z.infer<typeof textStyleSchema>;

export const textStylesSchema = z.record(z.string().max(60), textStyleSchema);

export const fillCss = (fill: Fill) =>
    fill.kind === 'solid'
        ? fill.color
        : `linear-gradient(${String(fill.angle)}deg, ${fill.from}, ${fill.to})`;

// Nothing set (or everything back to default): no style stored.
export const isEmptyStyle = (style: TextStyle) =>
    Object.values(style).every((v: unknown) => v === undefined || v === false || v === 'none');
