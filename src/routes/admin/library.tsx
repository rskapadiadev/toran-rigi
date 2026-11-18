import {
    applyLayout,
    blockVariants,
    dividerInfo,
    edgeInfo,
    enterInfo,
    openingChoices,
    sceneInfo,
} from '@shared/blocks';
import { brandingInfo, type BrandingStyle, brandingStyles } from '@shared/branding';
import { generateOrnament, generativeInfo, seedFrom, type StrokeRole } from '@shared/generative';
import { motifLabel, motifs } from '@shared/motifs';
import { categoryInfo } from '@shared/occasions';
import { ceremonyProps } from '@shared/props';
import { generativeKinds, motifIds } from '@shared/schemas/invitation';
import { themeCatalog, themeLayouts } from '@shared/themes';
import type {
    DividerKind,
    EdgeKind,
    EnterPreset,
    SceneKind,
    SectionConfig,
    SectionType,
} from '@shared/types';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
    BadgeCheck,
    Brush,
    Dices,
    DoorOpen,
    Gem,
    Layers,
    LayoutTemplate,
    type LucideIcon,
    Minus,
    Palette,
    Play,
    Scissors,
    Search,
    Sparkles,
    Wand2,
    X,
} from 'lucide-react';
import { Fragment, type ReactNode, useState } from 'react';
import { z } from 'zod';

import { draftToPreview, type EditableInvitation, toDraft } from '@/admin/composer/draft';
import { sectionNames } from '@/admin/composer/panels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { InvitationView } from '@/invitation/InvitationView';
import { LazyCeremonyProp } from '@/invitation/LazyCeremonyProp';
import type { PublicInvitationData } from '@/invitation/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const categoryIds = [
    'openings',
    'sections',
    'entrances',
    'backdrops',
    'edges',
    'motifs',
    'generative',
    'themes',
    'branding',
    'props',
    'dividers',
] as const;
type CategoryId = (typeof categoryIds)[number];

export const Route = createFileRoute('/admin/library')({
    validateSearch: z.object({
        c: z.enum(categoryIds).optional(),
        i: z.string().max(60).optional(),
        // Sub-group within a category (e.g. "Cover" inside Section layouts).
        g: z.string().max(40).optional(),
        s: z.string().max(40).optional(),
        // Section edges: play their animation in the preview.
        a: z.boolean().optional(),
        // Generative art: a shuffled seed, so a design worth keeping can be shared by link.
        r: z.number().int().nonnegative().optional(),
    }),
    component: LibraryPage,
});

interface Item {
    key: string;
    label: string;
    hint: string;
    group?: string;
    badge?: string;
    thumb?: ReactNode;
}

interface Category {
    id: CategoryId;
    label: string;
    hint: string;
    icon: LucideIcon;
    items: Item[];
}

// Every swatch the preview can be judged against: one invitation per family of occasion.
const samples = [
    {
        slug: 'rajwada',
        label: 'Wedding · Rajwada',
    },
    {
        slug: 'noor',
        label: 'Wedding · Noor (Islamic)',
    },
    {
        slug: 'editorial',
        label: 'Wedding · Editorial',
    },
    {
        slug: 'chandni',
        label: 'Naming ceremony · Chandni',
    },
    {
        slug: 'utsav',
        label: 'Birthday · Utsav',
    },
    {
        slug: 'shanti',
        label: 'Prayer meet · Shanti',
    },
    {
        slug: 'summit',
        label: 'Corporate · Summit',
    },
];

const roleColor: Record<StrokeRole, string> = {
    gold: 'var(--color-gold-deep)',
    primary: 'var(--primary)',
    accent: 'var(--color-gold)',
    ink: 'var(--foreground)',
};

// The same seeded ornament the invitation draws, in admin colours; follows the shuffled seed.
function GenerativeThumb({ kind }: { kind: (typeof generativeKinds)[number] }) {
    const { r } = Route.useSearch();
    const ornament = generateOrnament(kind, r ?? DEFAULT_SEED);
    return (
        <svg
            viewBox={`0 0 ${String(ornament.size)} ${String(ornament.size)}`}
            className="size-16"
            aria-hidden
        >
            {ornament.paths.map((p, i) => (
                <path
                    key={i}
                    d={p.d}
                    fill={p.fill ? roleColor[p.role] : 'none'}
                    stroke={p.fill ? 'none' : roleColor[p.role]}
                    strokeWidth={p.width * 2.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ))}
        </svg>
    );
}

const DEFAULT_SEED = 1021;

// The section types that are only words, and what the Library shows when a sample has none.
const textFields: Partial<Record<SectionType, 'welcome' | 'story' | 'family'>> = {
    welcome: 'welcome',
    story: 'story',
    family: 'family',
};
const sampleWords = {
    welcome:
        'With joy in our hearts and the blessings of our elders, we invite you to share this day with us.',
    story: 'We met at a friend’s wedding and argued about the music all night. Five years and a thousand cups of chai later, here we are.',
    family: 'With the blessings of Smt. Meera & Shri Rajesh Malhotra and Smt. Nisha & Shri Vikram Kapoor',
};

// The portraits opening borrows illustrated figures when previewed, like the portraits layouts.
const portraitSamples = {
    'story.one': '/kits/phoolwari/haldi-1.webp',
    'story.two': '/kits/phoolwari/sangeet-2.webp',
    'story.together': '/kits/phoolwari/wedding-couples.webp',
};

// A story in chapters, and blessings for the wishes wall, when the sample invitation has none.
const sampleChapters = [
    'We met at a friend’s wedding in Udaipur and argued about the music all night.',
    'Two years of long calls between Mumbai and London, and one very expensive bouquet.',
    'He proposed on the same terrace where we first argued. She said yes before he finished.',
    'And now, with our families beside us, we begin our next chapter. Come and be part of it.',
].join('\n\n');
const sampleWishes = [
    ['Priya Mehta', 'So happy for you both! Can’t wait to dance at the sangeet.'],
    ['Nani & Nanaji', 'May your home always be full of laughter and good food.'],
    ['The Shah family', 'Wishing you a lifetime of love, patience and adventure.'],
    ['Rohan', 'Finally! Save me a seat next to the dessert counter.'],
    ['Aunty Meera', 'Blessings to you both. You were made for each other.'],
    ['Kabir & Zoya', 'Here’s to the best love story we know.'],
].map(([name = '', message = ''], i) => ({
    id: `sample-${String(i)}`,
    name,
    message,
    createdAt: '2026-11-01T10:00:00.000Z',
}));

// Gallery layouts are empty without pictures, so the preview borrows illustrated scenes when the
// sample invitation has none of its own.
const SAMPLE_PHOTOS = [
    'wedding-stage',
    'wedding-couples',
    'sangeet-stage',
    'haldi-stage',
    'wedding-florals',
    'shanti-stage',
].map((name) => `/kits/phoolwari/${name}.webp`);

function MotifThumb({ id }: { id: (typeof motifIds)[number] }) {
    return (
        <svg viewBox="0 0 100 100" className="size-9 text-gold-deep" aria-hidden>
            {motifs[id].map((d, i) => (
                <path key={i} d={d} fill="currentColor" fillRule="evenodd" />
            ))}
        </svg>
    );
}

function Swatches({ colors }: { colors: string[] }) {
    return (
        <span className="flex h-9 w-full overflow-hidden rounded-md ring-1 ring-black/5">
            {colors.map((c, i) => (
                <span key={`${c}-${String(i)}`} className="flex-1" style={{ background: c }} />
            ))}
        </span>
    );
}

const variantTypes = Object.keys(blockVariants) as SectionType[];

const catalogue: Category[] = [
    {
        id: 'openings',
        label: 'Opening entries',
        hint: 'The entry screen guests see before the invitation',
        icon: DoorOpen,
        items: openingChoices.map((o) => ({
            key: o.id,
            label: o.label,
            hint: o.hint,
            badge: o.gentle ? 'Gentle' : o.gesture,
        })),
    },
    {
        id: 'sections',
        label: 'Section layouts',
        hint: 'Every layout of every section',
        icon: LayoutTemplate,
        items: variantTypes.flatMap((type) =>
            (blockVariants[type] ?? []).map((v) => ({
                key: `${type}:${v.id}`,
                label: v.label,
                hint: v.hint,
                group: sectionNames[type],
                badge: type === 'gallery' ? 'Sample photos' : undefined,
            })),
        ),
    },
    {
        id: 'entrances',
        label: 'Entrance animations',
        hint: 'How a section animates in as guests scroll',
        icon: Wand2,
        items: (Object.keys(enterInfo) as EnterPreset[]).map((id) => ({
            key: id,
            label: enterInfo[id].label,
            hint: enterInfo[id].hint,
        })),
    },
    {
        id: 'backdrops',
        label: 'Backdrops',
        hint: 'Fabric, paper and sky behind each section',
        icon: Palette,
        items: (Object.keys(sceneInfo) as SceneKind[]).map((id) => ({
            key: id,
            label: sceneInfo[id].label,
            hint: sceneInfo[id].hint,
        })),
    },
    {
        id: 'edges',
        label: 'Section edges',
        hint: 'Where one section meets the next',
        icon: Scissors,
        items: (Object.keys(edgeInfo) as EdgeKind[])
            .filter((id) => id !== 'none')
            .map((id) => ({
                key: id,
                label: edgeInfo[id].label,
                hint: edgeInfo[id].hint,
            })),
    },
    {
        id: 'motifs',
        label: 'Motifs',
        hint: 'Woven into backdrops, seals and borders',
        icon: Brush,
        items: motifIds.map((id) => ({
            key: id,
            label: motifLabel(id),
            hint: 'Tap to see it woven into a backdrop',
            thumb: <MotifThumb id={id} />,
        })),
    },
    {
        id: 'generative',
        label: 'Generative art',
        hint: 'One-of-a-kind ornaments seeded from each couple — shuffle for new ones',
        icon: Dices,
        items: generativeKinds.map((kind) => ({
            key: kind,
            label: generativeInfo[kind].label,
            hint: generativeInfo[kind].hint,
            group: generativeInfo[kind].modern ? 'Modern' : 'Traditional',
            thumb: <GenerativeThumb kind={kind} />,
        })),
    },
    {
        id: 'themes',
        label: 'Themes',
        hint: 'Complete designs: palette, type, opening and layout',
        icon: Layers,
        items: themeCatalog.map((t) => ({
            key: t.slug,
            label: t.name,
            hint: t.description,
            group: categoryInfo[t.suits[0] ?? 'general'].label,
            thumb: (
                <Swatches
                    colors={[
                        t.design.palette.bg,
                        t.design.palette.primary,
                        t.design.palette.accent,
                        t.design.palette.gold,
                    ]}
                />
            ),
        })),
    },
];

const brandingCategory: Category = {
    id: 'branding',
    label: 'Branding',
    hint: 'The small “Created with Toran” mark at the foot of every invitation',
    icon: BadgeCheck,
    items: brandingStyles.map((style) => ({
        key: style,
        label: brandingInfo[style].label,
        hint: brandingInfo[style].hint,
    })),
};
catalogue.push(brandingCategory);

// Ceremony props: the object each stacked-arch card carries. Add one in shared/props.ts and
// src/invitation/props.tsx and it appears here.
const propsCategory: Category = {
    id: 'props',
    label: 'Ceremony props',
    hint: 'The object each ceremony card carries in Stacked arches, chosen from the ceremony',
    icon: Gem,
    items: ceremonyProps.map((prop) => ({
        key: prop.id,
        label: prop.label,
        hint:
            prop.match.length > 0
                ? `${prop.hint}. For: ${prop.match.slice(0, 4).join(', ')}`
                : prop.hint,
        thumb: <LazyCeremonyProp kind={prop.id} className="mb-1 h-14 w-auto" />,
    })),
};
catalogue.push(propsCategory);

// Section dividers: the ornament between a chapter's title and its words, chosen per section.
const dividersCategory: Category = {
    id: 'dividers',
    label: 'Dividers',
    hint: 'The ornament between a chapter’s title and its words, chosen per section',
    icon: Minus,
    items: (Object.keys(dividerInfo) as DividerKind[]).map((id) => ({
        key: id,
        label: dividerInfo[id].label,
        hint: dividerInfo[id].hint,
    })),
};
catalogue.push(dividersCategory);

const section = (type: SectionType, patch: Partial<SectionConfig> = {}): SectionConfig => ({
    type,
    enabled: true,
    ...patch,
});

interface Preview {
    data: PublicInvitationData;
    opening: boolean;
}

// Turns the sample invitation into a focused demo of one library item.
const sampleLooks = [
    ['#f2c230', '#fff4d6', '#e8892b'],
    ['#4f7d3a', '#e8a3b0', '#f5ead2'],
    ['#3d2a6b', '#a3163a', '#c9a24a'],
];

// Sample content for the sections that hide themselves when an invitation has none of it.
function sampleExtras(type: SectionType, data: PublicInvitationData): PublicInvitationData | null {
    const extras = data.invitation.extras;
    const withExtras = (more: Partial<typeof extras>) => ({
        ...data,
        invitation: {
            ...data.invitation,
            extras: {
                ...extras,
                ...more,
            },
        },
    });
    if (type === 'dressCode' && !data.events.some((e) => e.dressCode))
        return {
            ...data,
            events: data.events.map((e, i) => ({
                ...e,
                dressCode: {
                    note: { en: 'Jewel tones and soft pastels' },
                    swatches: sampleLooks[i % sampleLooks.length] ?? [],
                },
            })),
        };
    if (type === 'travel' && !extras.travel?.length)
        return withExtras({
            travel: [
                {
                    title: { en: 'Arriving' },
                    body: { en: 'The airport is 30 minutes away. We’ll meet every flight.' },
                },
                {
                    title: { en: 'Where to stay' },
                    body: { en: 'Rooms are held for family at the venue for three nights.' },
                },
            ],
        });
    // A sample stream: the play card stands in, and nothing loads from YouTube unless tapped.
    if (type === 'live' && !extras.live)
        return withExtras({ live: { youtubeUrl: 'https://www.youtube.com/watch?v=sampleLive0' } });
    if (type === 'shagun' && !extras.shagun)
        return withExtras({
            shagun: {
                upiId: 'sample@upi',
                payeeName: 'The couple',
            },
        });
    return null;
}

function previewFor(
    base: PublicInvitationData,
    category: CategoryId,
    key: string,
    animate = false,
    seed = DEFAULT_SEED,
): Preview {
    const invitation = base.invitation;
    const withSections = (sections: SectionConfig[]): Preview => ({
        data: {
            ...base,
            invitation: {
                ...invitation,
                sections,
            },
        },
        opening: false,
    });
    switch (category) {
        case 'openings':
            return {
                data: {
                    ...base,
                    invitation: {
                        ...invitation,
                        content:
                            key === 'portraits'
                                ? {
                                      ...invitation.content,
                                      photoSlots: {
                                          ...portraitSamples,
                                          ...invitation.content.photoSlots,
                                      },
                                  }
                                : invitation.content,
                        design: {
                            ...invitation.design,
                            opening: key as typeof invitation.design.opening,
                        },
                    },
                },
                opening: true,
            };
        case 'sections': {
            const [type, variant] = key.split(':') as [SectionType, string];
            const preview = withSections([section(type, { variant })]);
            // Memory chapters need a story told in several paragraphs, and photos to pair with them.
            if (type === 'story' && variant === 'chapters')
                return {
                    ...preview,
                    data: {
                        ...preview.data,
                        invitation: {
                            ...preview.data.invitation,
                            content: {
                                ...invitation.content,
                                story: { en: sampleChapters },
                                gallery:
                                    invitation.content.gallery.length > 0
                                        ? invitation.content.gallery
                                        : SAMPLE_PHOTOS,
                            },
                        },
                    },
                };
            // Dress code, travel, live and shagun stay hidden until there is something to show.
            const sample = sampleExtras(type, preview.data);
            if (sample)
                return {
                    ...preview,
                    data: sample,
                };
            // The wishes wall needs blessings on it.
            if (type === 'wishes' && preview.data.wishes.length === 0)
                return {
                    ...preview,
                    data: {
                        ...preview.data,
                        wishes: sampleWishes,
                    },
                };
            // Text sections hide themselves when empty; preview them with sample words instead.
            const field = textFields[type];
            if (field && !Object.values(invitation.content[field] ?? {}).some(Boolean))
                return {
                    ...preview,
                    data: {
                        ...preview.data,
                        invitation: {
                            ...preview.data.invitation,
                            content: {
                                ...invitation.content,
                                [field]: { en: sampleWords[field] },
                            },
                        },
                    },
                };
            // Two portraits borrow illustrated figures and a scene for the sample.
            if ((type === 'story' || type === 'cover') && variant === 'portraits')
                return {
                    ...preview,
                    data: {
                        ...preview.data,
                        invitation: {
                            ...preview.data.invitation,
                            content: {
                                ...invitation.content,
                                photoSlots: {
                                    'story.one': '/kits/phoolwari/haldi-1.webp',
                                    'story.two': '/kits/phoolwari/sangeet-2.webp',
                                    'story.together': '/kits/phoolwari/wedding-couples.webp',
                                    ...invitation.content.photoSlots,
                                },
                            },
                        },
                    },
                };
            // Photo-led covers borrow an illustrated scene when the sample has no photo of its own.
            if (type === 'cover' && variant === 'premiere' && !invitation.content.coverPhotoKey)
                return {
                    ...preview,
                    data: {
                        ...preview.data,
                        invitation: {
                            ...preview.data.invitation,
                            content: {
                                ...invitation.content,
                                coverPhotoKey: SAMPLE_PHOTOS[0],
                            },
                        },
                    },
                };
            if (type !== 'gallery' || invitation.content.gallery.length > 0) return preview;
            return {
                ...preview,
                data: {
                    ...preview.data,
                    invitation: {
                        ...preview.data.invitation,
                        content: {
                            ...invitation.content,
                            gallery: SAMPLE_PHOTOS,
                        },
                    },
                },
            };
        }
        case 'entrances': {
            const enter = key as EnterPreset;
            return withSections(
                (['cover', 'welcome', 'events'] as const).map((type) => section(type, { enter })),
            );
        }
        case 'backdrops':
            return withSections([
                section('welcome', {
                    scene: key as SceneKind,
                    enter: 'none',
                }),
                section('events', {
                    scene: key as SceneKind,
                    edge: 'none',
                }),
            ]);
        case 'edges':
            return withSections([
                section('welcome', {
                    scene: 'paper',
                    enter: 'none',
                }),
                section('events', {
                    scene: 'velvet',
                    edge: key as EdgeKind,
                    edgeMotion: animate,
                    enter: 'none',
                }),
            ]);
        case 'motifs':
            return withSections([
                section('welcome', {
                    scene: 'jacquard',
                    motif: key as SectionConfig['motif'],
                    enter: 'none',
                }),
                section('events', {
                    scene: 'silk',
                    motif: key as SectionConfig['motif'],
                    edge: 'seam',
                }),
            ]);
        case 'generative':
            return {
                data: {
                    ...base,
                    invitation: {
                        ...invitation,
                        seed,
                        design: {
                            ...invitation.design,
                            generative: {
                                ...invitation.design.generative,
                                kind: key as (typeof generativeKinds)[number],
                            },
                        },
                        // The arch cover draws the ornament full strength in its doorway.
                        sections: [
                            section('cover', {
                                variant: 'arch',
                                enter: 'none',
                            }),
                            section('events', { edge: 'none' }),
                        ],
                    },
                },
                opening: false,
            };
        // The page's last section, then the mark beneath it.
        case 'branding':
            return {
                data: {
                    ...base,
                    invitation: {
                        ...invitation,
                        extras: {
                            ...invitation.extras,
                            branding: { style: key as BrandingStyle },
                        },
                        sections: [section('closing', { enter: 'none' })],
                    },
                },
                opening: false,
            };
        // A welcome in the centred layout, then the illuminated page, both with this divider.
        case 'dividers':
            return withSections([
                section('welcome', {
                    variant: 'centered',
                    divider: key as DividerKind,
                }),
                section('story', {
                    variant: 'illuminated',
                    divider: key as DividerKind,
                }),
            ]);
        // Every ceremony of the sample becomes one that calls for this prop, on stacked arches.
        case 'props': {
            const prop = ceremonyProps.find((p) => p.id === key);
            const kind = prop?.match[0] ?? 'gathering';
            const dharmic =
                'cultures' in (prop ?? {}) && !/^(hindu|jain|sikh)/.test(invitation.culture);
            return {
                data: {
                    ...base,
                    events: base.events.map((e) => ({
                        ...e,
                        kind,
                    })),
                    invitation: {
                        ...invitation,
                        culture: dharmic ? 'hindu' : invitation.culture,
                        sections: [section('events', { variant: 'stack' })],
                    },
                },
                opening: false,
            };
        }
        case 'themes': {
            const theme = themeCatalog.find((t) => t.slug === key);
            if (!theme) return withSections(invitation.sections);
            return {
                data: {
                    ...base,
                    invitation: {
                        ...invitation,
                        design: theme.design,
                        sections: applyLayout(invitation.sections, themeLayouts[theme.slug]),
                    },
                },
                opening: true,
            };
        }
    }
}

function useSample(slug: string) {
    return useQuery({
        queryKey: ['invitation', `inv_demo-${slug}`],
        queryFn: () => api<EditableInvitation>(`/admin/invitations/inv_demo-${slug}`),
        select: (data) => draftToPreview(toDraft(data), data),
    });
}

interface ItemCardProps {
    item: Item;
    on: boolean;
    onPick: () => void;
}

function ItemCard({ item, on, onPick }: ItemCardProps) {
    return (
        <button
            type="button"
            aria-pressed={on}
            onClick={onPick}
            className={cn(
                'flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 text-start text-xs transition outline-none hover:border-gold/60 hover:bg-card focus-visible:ring-2 focus-visible:ring-ring',
                on && 'border-primary bg-primary/5 ring-1 ring-primary',
            )}
        >
            {item.thumb}
            <span className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-medium">{item.label}</span>
                {on && <Play className="mt-0.5 size-3.5 shrink-0 fill-primary text-primary" />}
            </span>
            <span className="line-clamp-2 text-muted-foreground">{item.hint}</span>
            {item.badge && (
                <Badge variant="outline" className="w-fit font-normal">
                    {item.badge}
                </Badge>
            )}
        </button>
    );
}

// The small label above each column of the library card.
const columnHead =
    'shrink-0 border-b px-4 py-2.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase';

function LibraryPage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const category = catalogue.find((c) => c.id === search.c) ?? catalogue[0];
    const sampleSlug = search.s ?? 'rajwada';
    const sample = useSample(category?.id === 'themes' ? (search.i ?? sampleSlug) : sampleSlug);
    const [replay, setReplay] = useState(0);
    const [query, setQuery] = useState('');
    if (!category) return null;
    const visible = category.items.filter((i) => !search.g || (i.group ?? '') === search.g);
    const active = visible.find((i) => i.key === search.i) ?? visible[0] ?? category.items[0];
    const go = (patch: Partial<typeof search>) => {
        void navigate({
            search: (prev) => ({
                ...prev,
                ...patch,
            }),
            replace: true,
        });
    };
    const allGroups = [...new Set(category.items.map((i) => i.group ?? ''))];
    const group = search.g && allGroups.includes(search.g) ? search.g : undefined;
    const groups = group ? [group] : allGroups;
    const animate = search.a ?? false;
    const preview =
        sample.data && active
            ? previewFor(sample.data, category.id, active.key, animate, search.r ?? DEFAULT_SEED)
            : null;

    // Search runs across every category at once, so "ghodi" finds the edge and "lotus" finds the
    // opening, the edge, the motif and the generative art together.
    const q = query.trim().toLowerCase();
    const results = q
        ? catalogue
              .map((c) => ({
                  category: c,
                  items: c.items.filter((i) =>
                      `${i.label} ${i.hint} ${i.group ?? ''} ${c.label}`.toLowerCase().includes(q),
                  ),
              }))
              .filter((r) => r.items.length > 0)
        : [];
    const found = results.reduce((n, r) => n + r.items.length, 0);
    const searchBox = (
        <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                }}
                placeholder="Search openings, edges, motifs…"
                aria-label="Search the library"
                className="h-8 bg-card ps-8 pe-8"
            />
            {query && (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                        setQuery('');
                    }}
                    className="absolute end-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* One card: the library's header, then three columns — components, the chosen
                component's options, the live phone. */}
            <div className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-card text-sm ring-1 ring-foreground/10 xl:h-[calc(100svh-6rem)]">
                <header className="flex shrink-0 flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Library
                        </p>
                        <h1 className="text-xl leading-tight font-semibold">
                            Every component, live
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Pick a category and a template; it plays on the phone exactly as guests
                            will see it.
                        </p>
                    </div>
                    {searchBox}
                </header>
                <div className="flex min-w-0 flex-col lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_420px]">
                    <div className="flex shrink-0 flex-col border-b lg:min-h-0 lg:border-e lg:border-b-0">
                        <p className={columnHead}>Components</p>
                        <nav
                            aria-label="Component categories"
                            className="flex gap-1.5 overflow-x-auto p-3 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto"
                        >
                            {catalogue.map((c) => {
                                const Icon = c.icon;
                                const on = c.id === category.id;
                                // Section layouts list their sections (Cover, Welcome…) as sub-entries.
                                const subGroups =
                                    c.id === 'sections'
                                        ? [...new Set(c.items.map((i) => i.group ?? ''))]
                                        : [];
                                return (
                                    <Fragment key={c.id}>
                                        <button
                                            key={c.id}
                                            type="button"
                                            aria-current={on ? 'page' : undefined}
                                            onClick={() => {
                                                go({
                                                    c: c.id,
                                                    i: undefined,
                                                    g: undefined,
                                                });
                                            }}
                                            className={cn(
                                                'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition',
                                                on
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-foreground/80 hover:bg-muted',
                                            )}
                                        >
                                            <Icon className="size-4 shrink-0" />
                                            <span className="flex-1 whitespace-nowrap">
                                                {c.label}
                                            </span>
                                            <span
                                                className={cn(
                                                    'rounded-full px-1.5 text-[11px] tabular-nums',
                                                    on
                                                        ? 'bg-white/15'
                                                        : 'bg-muted text-muted-foreground',
                                                )}
                                            >
                                                {c.items.length}
                                            </span>
                                        </button>
                                        {subGroups.length > 0 && (
                                            <div
                                                className={cn(
                                                    'flex shrink-0 gap-1 lg:ms-6 lg:flex-col lg:border-s lg:ps-2',
                                                    !on && 'hidden lg:flex',
                                                )}
                                            >
                                                {subGroups.map((name) => {
                                                    const subOn = on && group === name;
                                                    const first = c.items.find(
                                                        (i) => i.group === name,
                                                    );
                                                    return (
                                                        <button
                                                            key={name}
                                                            type="button"
                                                            aria-current={
                                                                subOn ? 'page' : undefined
                                                            }
                                                            onClick={() => {
                                                                go({
                                                                    c: c.id,
                                                                    g: name,
                                                                    i: first?.key,
                                                                });
                                                                setReplay((r) => r + 1);
                                                            }}
                                                            className={cn(
                                                                'flex shrink-0 items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-start text-[13px] transition',
                                                                subOn
                                                                    ? 'bg-primary/10 font-medium text-primary'
                                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                            )}
                                                        >
                                                            {/* Drop admin-only qualifiers like "(stacked stationery)". */}
                                                            <span className="truncate">
                                                                {name.replace(/\s*\(.*\)$/, '')}
                                                            </span>
                                                            <span className="text-[11px] tabular-nums opacity-70">
                                                                {
                                                                    c.items.filter(
                                                                        (i) => i.group === name,
                                                                    ).length
                                                                }
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </nav>
                    </div>
                    <section
                        aria-label={q ? 'Search results' : category.label}
                        className="flex min-w-0 shrink-0 flex-col lg:min-h-0"
                    >
                        <header className="shrink-0 border-b px-4 py-3">
                            <h2 className="text-[15px] font-semibold">
                                {q ? 'Search results' : category.label}
                            </h2>
                            <p className="mt-0.5 text-[13px] text-muted-foreground">
                                <span aria-live="polite">
                                    {q
                                        ? found > 0
                                            ? `${String(found)} ${found === 1 ? 'match' : 'matches'} for “${query.trim()}”`
                                            : `Nothing in the library matches “${query.trim()}”.`
                                        : category.hint}
                                </span>
                            </p>
                        </header>

                        <ScrollArea className="lg:min-h-0 lg:flex-1">
                            <div className="p-4">
                                {results.map(({ category: c, items }) => (
                                    <div key={c.id} className="mb-5">
                                        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            {c.label}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {items.map((item) => (
                                                <ItemCard
                                                    key={item.key}
                                                    item={item}
                                                    on={
                                                        c.id === category.id &&
                                                        item.key === active?.key
                                                    }
                                                    onPick={() => {
                                                        go({
                                                            c: c.id,
                                                            i: item.key,
                                                            g: undefined,
                                                        });
                                                        setReplay((r) => r + 1);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {!q &&
                                    groups.map((group) => (
                                        <div key={group} className="mb-5">
                                            {group && (
                                                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    {group}
                                                </p>
                                            )}
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {category.items
                                                    .filter((i) => (i.group ?? '') === group)
                                                    .map((item) => (
                                                        <ItemCard
                                                            key={item.key}
                                                            item={item}
                                                            on={item.key === active?.key}
                                                            onPick={() => {
                                                                go({ i: item.key });
                                                                setReplay((r) => r + 1);
                                                            }}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </ScrollArea>
                    </section>
                    <aside className="flex min-w-0 shrink-0 flex-col border-t bg-muted/30 lg:col-span-2 xl:col-span-1 xl:min-h-0 xl:border-s xl:border-t-0">
                        <p className={columnHead}>Live view</p>
                        <div className="flex min-h-0 flex-1 flex-col p-4">
                            <div className="mb-3 flex items-center gap-2">
                                {category.id !== 'themes' && (
                                    <Select
                                        value={sampleSlug}
                                        onValueChange={(s) => {
                                            go({ s });
                                        }}
                                    >
                                        <SelectTrigger
                                            className="h-8 flex-1 bg-card text-xs"
                                            aria-label="Preview with"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {samples.map((s) => (
                                                <SelectItem key={s.slug} value={s.slug}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {category.id === 'generative' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="shrink-0"
                                        onClick={() => {
                                            const r = seedFrom(
                                                String(Date.now()),
                                                String(Math.random()),
                                            );
                                            go({ r });
                                        }}
                                    >
                                        <Dices /> Shuffle
                                    </Button>
                                )}
                                {category.id === 'edges' && (
                                    <Label className="flex shrink-0 items-center gap-2 text-sm font-normal">
                                        <Checkbox
                                            checked={animate}
                                            onCheckedChange={(checked) => {
                                                go({ a: checked === true ? true : undefined });
                                            }}
                                        />
                                        Animate
                                    </Label>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="ms-auto"
                                    onClick={() => {
                                        setReplay((r) => r + 1);
                                    }}
                                >
                                    <Sparkles /> Replay
                                </Button>
                            </div>
                            <div className="mx-auto w-[min(100%,390px)] rounded-[2.75rem] bg-night p-2.5 shadow-[0_30px_80px_-30px_rgba(29,20,22,0.55)] ring-1 ring-black/10">
                                {/* transform keeps the invitation's fixed layers inside the phone frame */}
                                <div className="relative h-[min(760px,calc(100svh-19rem))] min-h-[520px] [transform:translateZ(0)] overflow-y-auto overscroll-contain rounded-[2.2rem] bg-background">
                                    {preview ? (
                                        <InvitationView
                                            key={`${category.id}-${active?.key ?? ''}-${sampleSlug}-${String(animate)}-${String(search.r ?? '')}-${String(replay)}`}
                                            data={preview.data}
                                            embedded
                                            skipOpening={!preview.opening}
                                        />
                                    ) : (
                                        <Skeleton className="size-full" />
                                    )}
                                </div>
                            </div>
                            {active && (
                                <p className="mt-3 text-center text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {active.label}
                                    </span>{' '}
                                    · {category.label.toLowerCase()}
                                </p>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
