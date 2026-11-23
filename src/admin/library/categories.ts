// The library's categories: shared by its route (the ?c= link) and its page.
export const categoryIds = [
    'openings',
    'sections',
    'entrances',
    'backdrops',
    'films',
    'edges',
    'motifs',
    'generative',
    'themes',
    'branding',
    'props',
    'dividers',
] as const;
export type CategoryId = (typeof categoryIds)[number];
