import { cultureIds } from '@shared/cultures';
import { formatMoney } from '@shared/money';
import {
    categoryInfo,
    occasionCategories,
    type OccasionCategory,
    type OccasionId,
    occasionOf,
    occasionsIn,
} from '@shared/occasions';
import { can } from '@shared/permissions';
import { DEFAULT_TEMPLATE_PRICE, type PriceMap, shopPrice } from '@shared/pricing';
import { themeCatalog } from '@shared/themes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
    Archive,
    Copy,
    ExternalLink,
    ImageUp,
    LayoutTemplate,
    MoreHorizontal,
    Paintbrush,
    Pencil,
    Play,
    Plus,
    Rocket,
    Search,
    Star,
    Undo2,
} from 'lucide-react';
import { type SyntheticEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { PanelCard } from '@/admin/kit/card';
import { FormField } from '@/admin/kit/form';
import { categoryIcon, OccasionSelect } from '@/admin/kit/occasion';
import { EmptyState, PageSkeleton } from '@/admin/kit/page';
import { InvitationStatusBadge } from '@/admin/kit/status';
import { cultureLabel } from '@/admin/labels';
import { fromDraft, MoneyInputs, toDraft } from '@/admin/pricing/MoneyInput';
import { LiveThumb, TemplatePreviewDialog } from '@/admin/templates/TemplatePreview';
import { type TemplateRow, templatesQuery, type TemplateStatus } from '@/admin/templates/types';
import { useMe } from '@/admin/useMe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { api, ApiError, patch, post, upload } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formString } from '@/motion/hooks';

const views = ['active', 'published', 'draft', 'archived'] as const;
type View = (typeof views)[number];

export const Route = createFileRoute('/admin/templates/')({
    validateSearch: z.object({
        // Unknown values in an old or mistyped link fall back to the default view.
        family: z.enum(occasionCategories).optional().catch(undefined),
        view: z.enum(views).optional().catch(undefined),
    }),
    component: TemplatesPage,
});

const viewLabel: Record<View, string> = {
    active: 'Published & drafts',
    published: 'Published',
    draft: 'Drafts',
    archived: 'Archived',
};

const inView = (t: TemplateRow, view: View) =>
    view === 'active' ? t.status !== 'archived' : t.status === view;

const failure = (e: unknown) => (e instanceof ApiError ? e.message : 'Something went wrong');

function TemplatesPage() {
    const navigate = useNavigate({ from: Route.fullPath });
    const { family, view = 'active' } = Route.useSearch();
    const canManage = can(useMe().data?.role, 'catalog.manage');
    const [query, setQuery] = useState('');
    const [creating, setCreating] = useState<OccasionId | null>(null);
    const [editing, setEditing] = useState<TemplateRow | null>(null);
    const [previewing, setPreviewing] = useState<TemplateRow | null>(null);
    const { data, isPending } = useQuery({
        ...templatesQuery,
        queryFn: () => api<TemplateRow[]>('/admin/templates'),
    });

    const all = data ?? [];
    const needle = query.trim().toLowerCase();
    const visible = all.filter(
        (t) =>
            inView(t, view) &&
            (!needle ||
                [t.name, t.description, t.themeName ?? '', occasionOf(t.eventKind).name.en]
                    .join(' ')
                    .toLowerCase()
                    .includes(needle)),
    );
    const familyOf = (t: TemplateRow) => occasionOf(t.eventKind).category;
    const count = (c: OccasionCategory) => visible.filter((t) => familyOf(t) === c).length;
    const shown = family ? visible.filter((t) => familyOf(t) === family) : visible;
    // A family tab lists every occasion in it, so the gaps ("no Birthday template yet") are visible.
    const occasionsShown = (family ? [family] : occasionCategories).flatMap((c) =>
        occasionsIn(c).filter((o) => family || shown.some((t) => t.eventKind === o.id)),
    );

    const actions = (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
                <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                    }}
                    placeholder="Search templates…"
                    aria-label="Search templates"
                    className="h-8 w-52 ps-8"
                />
            </div>
            <Select
                value={view}
                onValueChange={(v) => {
                    void navigate({
                        search: (s) => ({
                            ...s,
                            view: v as View,
                        }),
                    });
                }}
            >
                <SelectTrigger size="sm" className="h-8 w-44" aria-label="Status">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {views.map((v) => (
                        <SelectItem key={v} value={v}>
                            {viewLabel[v]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {canManage && (
                <Button
                    size="sm"
                    onClick={() => {
                        setCreating(occasionsIn(family ?? 'celebrations')[0]?.id ?? 'wedding');
                    }}
                >
                    <Plus /> New template
                </Button>
            )}
        </div>
    );

    return (
        <>
            <PanelCard
                fill
                contentClassName="flex min-h-[60svh] flex-col lg:min-h-0 lg:overflow-y-auto"
                title="Templates"
                subtitle="Ready-made invitations a new order starts from: design, sample text, sections and ceremonies. Add as many as you like for each occasion."
                actions={actions}
            >
                {isPending ? (
                    <PageSkeleton />
                ) : all.length === 0 ? (
                    <EmptyState
                        className="flex-1"
                        icon={LayoutTemplate}
                        title="No templates yet"
                        description="Create the first one: pick an occasion and a theme, then design it in the editor."
                    />
                ) : (
                    <div className="space-y-6">
                        <Tabs
                            value={family ?? 'all'}
                            onValueChange={(v) => {
                                void navigate({
                                    search: (s) => ({
                                        ...s,
                                        family: v === 'all' ? undefined : (v as OccasionCategory),
                                    }),
                                });
                            }}
                        >
                            <TabsList className="h-auto flex-wrap justify-start">
                                <TabsTrigger value="all" className="px-3">
                                    All <Count n={visible.length} />
                                </TabsTrigger>
                                {occasionCategories.map((c) => {
                                    const Icon = categoryIcon[c];
                                    return (
                                        <TabsTrigger key={c} value={c} className="gap-1.5 px-3">
                                            <Icon className="size-3.5" />
                                            {categoryInfo[c].label}
                                            <Count n={count(c)} />
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </Tabs>

                        {occasionsShown.length === 0 && (
                            <EmptyState
                                icon={Search}
                                title="Nothing matches"
                                description="Try another search or status."
                            />
                        )}

                        {occasionsShown.map((occasion) => {
                            const list = shown.filter((t) => t.eventKind === occasion.id);
                            return (
                                <section key={occasion.id} className="space-y-3">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h2 className="text-sm font-semibold">
                                            {occasion.name.en}
                                            <span className="ms-2 font-normal text-muted-foreground">
                                                {list.length === 1
                                                    ? '1 template'
                                                    : `${String(list.length)} templates`}
                                            </span>
                                        </h2>
                                        {canManage && list.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setCreating(occasion.id);
                                                }}
                                            >
                                                <Plus /> Add
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                        {list.map((t) => (
                                            <TemplateCard
                                                key={t.id}
                                                template={t}
                                                canManage={canManage}
                                                onEdit={() => {
                                                    setEditing(t);
                                                }}
                                                onPreview={() => {
                                                    setPreviewing(t);
                                                }}
                                            />
                                        ))}
                                        {list.length === 0 && canManage && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCreating(occasion.id);
                                                }}
                                                className="flex aspect-[3/5] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition hover:border-gold/60 hover:text-foreground"
                                            >
                                                <Plus className="size-5" />
                                                First {occasion.name.en} template
                                            </button>
                                        )}
                                        {list.length === 0 && !canManage && (
                                            <p className="col-span-full text-sm text-muted-foreground">
                                                No template yet.
                                            </p>
                                        )}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </PanelCard>
            <CreateTemplate
                occasion={creating}
                onClose={() => {
                    setCreating(null);
                }}
            />
            <TemplatePreviewDialog
                template={previewing}
                onOpenChange={(open) => {
                    if (!open) setPreviewing(null);
                }}
            />
            <TemplateDetails
                template={editing}
                onClose={() => {
                    setEditing(null);
                }}
            />
        </>
    );
}

function Count({ n }: { n: number }) {
    return <span className="ms-1 text-xs text-muted-foreground tabular-nums">{n}</span>;
}

interface TemplateCardProps {
    template: TemplateRow;
    canManage: boolean;
    onEdit: () => void;
    onPreview: () => void;
}

interface TemplateChange {
    status?: TemplateStatus;
    isFeatured?: boolean;
}

function TemplateCard({ template: t, canManage, onEdit, onPreview }: TemplateCardProps) {
    const client = useQueryClient();
    const navigate = useNavigate();
    const previewUrl = `/p/${t.previewToken}`;
    const refresh = () => client.invalidateQueries(templatesQuery);
    const change = useMutation({
        mutationFn: (body: TemplateChange) => patch(`/admin/templates/${t.id}`, body),
        onSuccess: refresh,
        onError: (e) => toast.error(failure(e)),
    });
    const coverInput = useRef<HTMLInputElement>(null);
    // The still picture the shop's landing and collection show for this design.
    const cover = useMutation({
        mutationFn: (file: File) => {
            const form = new FormData();
            form.append('file', file);
            return upload(`/admin/templates/${t.id}/poster`, form);
        },
        onSuccess: async () => {
            toast.success('Shop cover picture updated');
            await refresh();
        },
        onError: (e) => toast.error(failure(e)),
    });
    const duplicate = useMutation({
        mutationFn: () => post<{ id: string }>(`/admin/templates/${t.id}/duplicate`, {}),
        onSuccess: async ({ id }) => {
            toast.success(`Copied “${t.name}”`);
            await refresh();
            await navigate({
                to: '/admin/templates/$id',
                params: { id },
            });
        },
        onError: (e) => toast.error(failure(e)),
    });

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition hover:ring-gold/50',
                t.status === 'archived' && 'opacity-60',
            )}
        >
            <button
                type="button"
                onClick={onPreview}
                aria-label={`Preview ${t.name}`}
                className="block w-full text-start outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <LiveThumb template={t} />
                <span className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                    {t.isFeatured ? (
                        <Badge className="gap-1 bg-black/55 text-white backdrop-blur">
                            <Star className="size-3 fill-current text-gold" /> Featured
                        </Badge>
                    ) : (
                        <span />
                    )}
                    {t.status !== 'published' && (
                        <InvitationStatusBadge status={t.status} className="backdrop-blur" />
                    )}
                </span>
                <span className="pointer-events-none absolute inset-x-0 bottom-[52px] flex justify-center opacity-0 transition group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs text-white backdrop-blur">
                        <Play className="size-3.5" /> Play entrance
                    </span>
                </span>
            </button>
            <input
                ref={coverInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                hidden
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) cover.mutate(file);
                    e.target.value = '';
                }}
            />
            <div className="flex items-center gap-2 border-t px-3 py-2.5">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                        {cultureLabel[t.culture.split('.')[0] ?? ''] ?? t.culture} ·{' '}
                        <span className="tabular-nums">
                            {formatMoney(
                                shopPrice(t.prices, t.comparePrices, 'INR')?.price ?? 0,
                                'INR',
                            )}
                        </span>
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`${t.name} actions`}>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link to="/admin/templates/$id" params={{ id: t.id }}>
                                <Paintbrush /> Edit design
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={onPreview}>
                            <Play /> Preview entrance
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={previewUrl} target="_blank" rel="noreferrer">
                                <ExternalLink /> Open full screen
                            </a>
                        </DropdownMenuItem>
                        {canManage && (
                            <>
                                <DropdownMenuItem onSelect={onEdit}>
                                    <Pencil /> Name & details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={cover.isPending}
                                    onSelect={() => coverInput.current?.click()}
                                >
                                    <ImageUp /> Shop cover picture
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={duplicate.isPending}
                                    onSelect={() => {
                                        duplicate.mutate();
                                    }}
                                >
                                    <Copy /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() => {
                                        change.mutate({ isFeatured: !t.isFeatured });
                                    }}
                                >
                                    <Star /> {t.isFeatured ? 'Unfeature' : 'Feature'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {t.status !== 'published' && (
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            change.mutate({ status: 'published' });
                                        }}
                                    >
                                        <Rocket /> Publish
                                    </DropdownMenuItem>
                                )}
                                {t.status === 'published' && (
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            change.mutate({ status: 'draft' });
                                        }}
                                    >
                                        <Undo2 /> Move to draft
                                    </DropdownMenuItem>
                                )}
                                {t.status !== 'archived' && (
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            change.mutate({ status: 'archived' });
                                        }}
                                    >
                                        <Archive /> Archive
                                    </DropdownMenuItem>
                                )}
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

interface CreateTemplateProps {
    occasion: OccasionId | null;
    onClose: () => void;
}

function CreateTemplate({ occasion, onClose }: CreateTemplateProps) {
    return (
        <Sheet
            open={occasion !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <SheetContent className="w-full sm:max-w-md">
                {/* Remount per opening so the form starts from the occasion that was clicked. */}
                {occasion && (
                    <CreateTemplateForm key={occasion} initial={occasion} onClose={onClose} />
                )}
            </SheetContent>
        </Sheet>
    );
}

interface CreateTemplateFormProps {
    initial: OccasionId;
    onClose: () => void;
}

function CreateTemplateForm({ initial, onClose }: CreateTemplateFormProps) {
    const client = useQueryClient();
    const navigate = useNavigate();
    const [occasion, setOccasion] = useState<OccasionId>(initial);
    const [culture, setCulture] = useState<string>('hindu');
    const category = occasionOf(occasion).category;
    // Themes made for this family of occasion come first.
    const themes = [
        ...themeCatalog.filter((t) => t.suits.includes(category)),
        ...themeCatalog.filter((t) => !t.suits.includes(category)),
    ];
    const [theme, setTheme] = useState(themes[0]?.slug ?? 'editorial');
    const create = useMutation({
        mutationFn: (body: Record<string, string>) =>
            post<{ id: string }>('/admin/templates', body),
        onSuccess: async ({ id }) => {
            toast.success('Template created: design it now');
            await client.invalidateQueries(templatesQuery);
            onClose();
            await navigate({
                to: '/admin/templates/$id',
                params: { id },
            });
        },
        onError: (e) => toast.error(failure(e)),
    });
    const submit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        create.mutate({
            name: formString(form, 'name'),
            description: formString(form, 'description'),
            occasion,
            culture,
            themeSlug: theme,
        });
    };
    return (
        <form onSubmit={submit} className="flex h-full flex-col">
            <SheetHeader className="border-b">
                <SheetTitle>New template</SheetTitle>
                <SheetDescription>
                    Starts from the theme’s look and the occasion’s sections. You design the rest in
                    the editor.
                </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <FormField
                    label="Name"
                    description="What the studio and customers see, e.g. “Royal Haveli”."
                >
                    {(id) => <Input id={id} name="name" required minLength={2} maxLength={80} />}
                </FormField>
                <FormField label="Occasion">
                    {(id) => <OccasionSelect id={id} value={occasion} onChange={setOccasion} />}
                </FormField>
                <FormField label="Tradition">
                    {(id) => (
                        <Select value={culture} onValueChange={setCulture}>
                            <SelectTrigger id={id} className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {cultureIds.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {cultureLabel[c] ?? c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </FormField>
                <FormField
                    label="Starting theme"
                    description="Colours, fonts, opening and section styles."
                >
                    {(id) => (
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger id={id} className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-80">
                                {themes.map((t) => (
                                    <SelectItem key={t.slug} value={t.slug}>
                                        <span
                                            className="size-3 rounded-full ring-1 ring-black/10"
                                            style={{ background: t.design.palette.primary }}
                                        />
                                        {t.name}
                                        <span className="text-muted-foreground">
                                            {cultureLabel[t.culture]}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </FormField>
                <FormField label="Description" description="Optional. One line on the mood.">
                    {(id) => <Textarea id={id} name="description" rows={3} maxLength={400} />}
                </FormField>
            </div>
            <SheetFooter className="border-t">
                <Button type="submit" disabled={create.isPending}>
                    <Paintbrush /> {create.isPending ? 'Creating…' : 'Create & open editor'}
                </Button>
            </SheetFooter>
        </form>
    );
}

interface TemplateDetailsProps {
    template: TemplateRow | null;
    onClose: () => void;
}

function TemplateDetails({ template, onClose }: TemplateDetailsProps) {
    return (
        <Sheet
            open={template !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <SheetContent className="w-full sm:max-w-md">
                {template && (
                    <TemplateDetailsForm key={template.id} template={template} onClose={onClose} />
                )}
            </SheetContent>
        </Sheet>
    );
}

interface TemplateDetails {
    name: string;
    description: string;
    prices: PriceMap | null;
    comparePrices: PriceMap | null;
}

function TemplateDetailsForm({
    template,
    onClose,
}: {
    template: TemplateRow;
    onClose: () => void;
}) {
    const client = useQueryClient();
    const [own, setOwn] = useState(() => toDraft(template.prices));
    const [was, setWas] = useState(() => toDraft(template.comparePrices));
    const save = useMutation({
        mutationFn: (body: TemplateDetails) => patch(`/admin/templates/${template.id}`, body),
        onSuccess: async () => {
            toast.success('Template updated');
            await client.invalidateQueries(templatesQuery);
            onClose();
        },
        onError: (e) => toast.error(failure(e)),
    });
    const submit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        save.mutate({
            name: formString(form, 'name'),
            description: formString(form, 'description'),
            prices: fromDraft(own),
            comparePrices: fromDraft(was),
        });
    };
    return (
        <form onSubmit={submit} className="flex h-full flex-col">
            <SheetHeader className="border-b">
                <SheetTitle>Name & details</SheetTitle>
                <SheetDescription>
                    {occasionOf(template.eventKind).name.en} · the occasion, tradition and theme
                    follow the design in the editor.
                </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <FormField label="Name">
                    {(id) => (
                        <Input
                            id={id}
                            name="name"
                            required
                            minLength={2}
                            maxLength={80}
                            defaultValue={template.name}
                        />
                    )}
                </FormField>
                <FormField label="Description">
                    {(id) => (
                        <Textarea
                            id={id}
                            name="description"
                            rows={3}
                            maxLength={400}
                            defaultValue={template.description}
                        />
                    )}
                </FormField>
                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/80">Price</p>
                    <MoneyInputs
                        label="Price"
                        value={own}
                        onChange={setOwn}
                        placeholders={DEFAULT_TEMPLATE_PRICE}
                    />
                    <p className="text-xs text-muted-foreground">
                        What customers pay for this design. Empty means the default (shown greyed).
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/80">
                        Was price <span className="text-muted-foreground">(optional)</span>
                    </p>
                    <MoneyInputs label="Was price" value={was} onChange={setWas} />
                    <p className="text-xs text-muted-foreground">
                        Shown struck through with the saving, e.g. “₹1,999 ₹999 · 50% off”. Only
                        shows when it is higher than the price.
                    </p>
                </div>
            </div>
            <SheetFooter className="border-t">
                <Button type="submit" disabled={save.isPending}>
                    {save.isPending ? 'Saving…' : 'Save'}
                </Button>
            </SheetFooter>
        </form>
    );
}
