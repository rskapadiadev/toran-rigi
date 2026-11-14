import {
    applyLayout,
    blockVariants,
    edgeInfo,
    enterInfo,
    openingChoices,
    sceneInfo,
} from '@shared/blocks';
import { motifs } from '@shared/motifs';
import { categoryInfo } from '@shared/occasions';
import { motifIds } from '@shared/schemas/invitation';
import { themeCatalog, themeLayouts } from '@shared/themes';
import type { EdgeKind, EnterPreset, SceneKind, SectionConfig, SectionType } from '@shared/types';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
    Brush,
    DoorOpen,
    Layers,
    LayoutTemplate,
    type LucideIcon,
    Palette,
    Play,
    Scissors,
    Sparkles,
    Wand2,
} from 'lucide-react';
import { Fragment, type ReactNode, useState } from 'react';
import { z } from 'zod';

import { draftToPreview, type EditableInvitation, toDraft } from '@/admin/composer/draft';
import { sectionNames } from '@/admin/composer/panels';
import { PageHeader } from '@/admin/kit/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    'themes',
] as const;
type CategoryId = (typeof categoryIds)[number];

export const Route = createFileRoute('/admin/library')({
    validateSearch: z.object({
        c: z.enum(categoryIds).optional(),
        i: z.string().max(60).optional(),
        // Sub-group within a category (e.g. "Cover" inside Section layouts).
        g: z.string().max(40).optional(),
        s: z.string().max(40).optional(),
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
                badge: type === 'gallery' ? 'Needs photos' : undefined,
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
            label: id.charAt(0).toUpperCase() + id.slice(1),
            hint: 'Tap to see it woven into a backdrop',
            thumb: <MotifThumb id={id} />,
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
function previewFor(base: PublicInvitationData, category: CategoryId, key: string): Preview {
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
            return withSections([section(type, { variant })]);
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

function ItemCard({ item, on, onPick }: { item: Item;
on: boolean;
onPick: () => void }) {
    return (
        <button
            type="button"
            aria-pressed={on}
            onClick={onPick}
            className={cn(
                'flex flex-col gap-2 rounded-lg border bg-card p-3 text-start text-xs transition outline-none hover:border-gold/60 focus-visible:ring-2 focus-visible:ring-ring',
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

function LibraryPage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const category = catalogue.find((c) => c.id === search.c) ?? catalogue[0];
    const sampleSlug = search.s ?? 'rajwada';
    const sample = useSample(category?.id === 'themes' ? (search.i ?? sampleSlug) : sampleSlug);
    const [replay, setReplay] = useState(0);
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
    const preview = sample.data && active ? previewFor(sample.data, category.id, active.key) : null;

    return (
        <>
            <PageHeader
                eyebrow="Library"
                title="Every component, live"
                description="Pick a category and a template; it plays on the phone exactly as guests will see it."
            />
            <div className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_400px]">
                <nav
                    aria-label="Component categories"
                    className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
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
                                    <span className="flex-1 whitespace-nowrap">{c.label}</span>
                                    <span
                                        className={cn(
                                            'rounded-full px-1.5 text-[11px] tabular-nums',
                                            on ? 'bg-white/15' : 'bg-muted text-muted-foreground',
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
                                            const first = c.items.find((i) => i.group === name);
                                            return (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    aria-current={subOn ? 'page' : undefined}
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
                                                            c.items.filter((i) => i.group === name)
                                                                .length
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
                <section aria-label={category.label} className="min-w-0">
                    <p className="mb-3 text-sm text-muted-foreground">{category.hint}</p>
                    <ScrollArea className="xl:h-[calc(100svh-15rem)] xl:pe-3">
                        {groups.map((group) => (
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
                    </ScrollArea>
                </section>
                <aside className="lg:col-span-2 xl:sticky xl:top-[5.5rem] xl:col-span-1 xl:self-start">
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
                        <div className="relative h-[min(760px,calc(100svh-12rem))] [transform:translateZ(0)] overflow-y-auto overscroll-contain rounded-[2.2rem] bg-background">
                            {preview ? (
                                <InvitationView
                                    key={`${category.id}-${active?.key ?? ''}-${sampleSlug}-${String(replay)}`}
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
                            <span className="font-medium text-foreground">{active.label}</span> ·{' '}
                            {category.label.toLowerCase()}
                        </p>
                    )}
                </aside>
            </div>
        </>
    );
}
