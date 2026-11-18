import { timelineOf } from '@shared/film';
import { localeNames } from '@shared/locales';
import { cappedMotion, occasionOf } from '@shared/occasions';
import { titleOf } from '@shared/people';
import { isEmptyStyle, type TextStyle } from '@shared/text-style';
import type { SectionType } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    CalendarHeart,
    Check,
    ExternalLink,
    Eye,
    EyeOff,
    Gift,
    Images,
    Layers,
    LayoutTemplate,
    Loader2,
    Minus,
    Monitor,
    MousePointerClick,
    Palette,
    Play,
    Plus,
    Redo2,
    Rocket,
    Save,
    Smartphone,
    Tablet,
    Type,
    Undo2,
    Users,
    X,
} from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { type Affiliate, affiliatesQuery } from '@/admin/affiliates';
import { AutoTranslateProvider, useAutoTranslate } from '@/admin/composer/autoTranslate';
import {
    type Draft,
    draftToPreview,
    type EditableInvitation,
    toDraft,
} from '@/admin/composer/draft';
import {
    ContentPanel,
    DesignPanel,
    EventsPanel,
    ExtrasPanel,
    sectionNames,
} from '@/admin/composer/panels';
import { BlockEditor } from '@/admin/composer/SectionsPanel';
import { applyText } from '@/admin/editor/apply-text';
import { useDraftHistory } from '@/admin/editor/history';
import { LanguagesSheet } from '@/admin/editor/LanguagesSheet';
import { LayersPanel } from '@/admin/editor/LayersPanel';
import { PublishPanel } from '@/admin/editor/PublishPanel';
import { AllPhotos, SectionPanel } from '@/admin/editor/SectionPanel';
import { TextStylePanel } from '@/admin/editor/TextStylePanel';
import { DesktopOnly } from '@/admin/kit/desktop-only';
import { InvitationStatusBadge } from '@/admin/kit/status';
import { applyAdminTheme, readAdminTheme } from '@/admin/shell/theme';
import { TemplatePublishPanel } from '@/admin/templates/TemplatePublishPanel';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EditContext, type EditSettings, type TextPath } from '@/invitation/editing';
import { InvitationView } from '@/invitation/InvitationView';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

type Device = 'phone' | 'tablet' | 'desktop';
const deviceWidth: Record<Device, number | null> = {
    phone: 390,
    tablet: 820,
    desktop: null,
};

// 'section' is the selected section's own fields; it has no button of its own.
type LeftTab = 'section' | 'sections' | 'photos' | 'design' | 'details' | 'ceremonies' | 'extras';
const leftTabs: {
    id: Exclude<LeftTab, 'section'>;
    label: string;
    icon: ReactNode;
}[] = [
    // The opening (entry screen) is picked under Design, so it has no tab of its own.
    {
        id: 'design',
        label: 'Design',
        icon: <Palette className="size-4" />,
    },
    {
        id: 'sections',
        label: 'Sections',
        icon: <Layers className="size-4" />,
    },
    {
        id: 'details',
        label: 'Details',
        icon: <Type className="size-4" />,
    },
    {
        id: 'ceremonies',
        label: 'Events',
        icon: <CalendarHeart className="size-4" />,
    },
    {
        id: 'photos',
        label: 'Photos',
        icon: <Images className="size-4" />,
    },
    {
        id: 'extras',
        label: 'Extras',
        icon: <Gift className="size-4" />,
    },
];

const shortName = (type: SectionType) => sectionNames[type].replace(/\s*\(.*\)$/, '');
// Shown on the canvas where a section is hidden because it has nothing to show yet.
const emptyHints: Partial<Record<SectionType, string>> = {
    shagun: 'Shagun / gifts is hidden until a UPI ID is added (Extras tab).',
    gallery: 'Gallery is hidden until photos are added.',
    travel: 'Travel & stay is hidden until travel details are added.',
    live: 'Live stream is hidden until a YouTube live link is added (Extras tab).',
    countdown: 'Countdown is hidden: it needs an upcoming ceremony date (Events tab).',
    wishes: 'Wishes wall is turned off (Extras tab).',
    rsvp: 'RSVP is turned off (Extras tab).',
    events: 'No ceremonies yet: add one in the Events tab.',
};
const emptyHint = (type: SectionType) =>
    emptyHints[type] ?? `${shortName(type)} has nothing to show yet.`;

const ZOOMS = [0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25];

// Typing in a field must never trigger editor shortcuts.
const typing = () => {
    const el = document.activeElement;
    return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
    );
};

interface IconButtonProps {
    label: string;
    shortcut?: string;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
}

function IconButton({ label, shortcut, disabled, onClick, children }: IconButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={label}
                    disabled={disabled}
                    onClick={onClick}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {label} {shortcut && <Kbd className="ms-1">{shortcut}</Kbd>}
            </TooltipContent>
        </Tooltip>
    );
}

// Full-screen visual editor: the invitation is the canvas. Click a section to select it,
// click text to type on it; everything you can add sits on the left, settings on the right.
// Desktop-only: phones and tablets get an explanation (and a link to view the invitation) instead.
export function EditorGate({ id }: { id: string }) {
    const { data } = useQuery({
        queryKey: ['invitation', id],
        queryFn: () => api<EditableInvitation>(`/admin/invitations/${id}`),
    });
    const previewUrl = data
        ? `${window.location.origin}/p/${data.invitation.previewToken}`
        : undefined;
    return (
        <DesktopOnly tool="The visual editor" previewUrl={previewUrl}>
            <EditorPage id={id} />
        </DesktopOnly>
    );
}

function EditorPage({ id }: { id: string }) {
    const client = useQueryClient();
    const { data } = useQuery({
        queryKey: ['invitation', id],
        queryFn: () => api<EditableInvitation>(`/admin/invitations/${id}`),
    });
    const base = useMemo(() => (data ? toDraft(data) : null), [data]);
    const history = useDraftHistory(base);
    const { draft, set, undo: undoDraft, redo: redoDraft } = history;
    const translator = useAutoTranslate({
        draft,
        set,
    });
    const { skipNext } = translator;
    const undo = useCallback(() => {
        skipNext();
        undoDraft();
    }, [skipNext, undoDraft]);
    const redo = useCallback(() => {
        skipNext();
        redoDraft();
    }, [skipNext, redoDraft]);
    const [selected, setSelected] = useState<SectionType | null>(null);
    const [device, setDevice] = useState<Device>('phone');
    const [zoom, setZoom] = useState(1);
    const [tab, setTab] = useState<LeftTab>('design');
    const [focusEvent, setFocusEvent] = useState<number | undefined>(undefined);
    const [photoFirst, setPhotoFirst] = useState(false);
    const [focusSlot, setFocusSlot] = useState<string | undefined>(undefined);
    const [selectedText, setSelectedText] = useState<TextPath | null>(null);
    const [picked, setLocale] = useState<string | null>(null);
    const [opening, setOpening] = useState(false);
    const [replay, setReplay] = useState(0);
    // Changing the entry screen (from any panel) plays it on the canvas straight away.
    const chosenOpening = draft?.design.opening;
    const [shownOpening, setShownOpening] = useState(chosenOpening);
    if (chosenOpening !== shownOpening) {
        setShownOpening(chosenOpening);
        if (shownOpening !== undefined) {
            setOpening(true);
            setReplay((r) => r + 1);
        }
    }
    const frame = useRef<HTMLDivElement>(null);
    const locale =
        draft && picked && draft.locales.includes(picked) ? picked : (draft?.locales[0] ?? 'en');

    // The editor wears the admin's dark theme (portals included) so the invitation is the brightest thing.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('dark');
        return () => {
            // Hand back to the admin's own light/dark preference.
            applyAdminTheme(readAdminTheme());
        };
    }, []);

    const save = useMutation({
        mutationFn: (body: Draft) =>
            api(`/admin/invitations/${id}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            }),
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: ['invitation', id] });
            history.markSaved();
            toast.success('Saved');
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not save'),
    });

    const { mutate: saveDraft } = save;
    const { dirty } = history;

    // One text's style; an all-default style is removed rather than stored.
    const setTextStyle = (path: TextPath, style: TextStyle) => {
        set((d) => {
            const rest = Object.fromEntries(
                Object.entries(d.content.textStyles ?? {}).filter(([p]) => p !== path),
            );
            return {
                ...d,
                content: {
                    ...d.content,
                    textStyles: isEmptyStyle(style)
                        ? rest
                        : {
                              ...rest,
                              [path]: style,
                          },
                },
            };
        });
    };

    // Nothing selected: the section view falls back to the list of sections.
    const deselect = () => {
        setSelected(null);
        setSelectedText(null);
        setTab((t) => (t === 'section' ? 'sections' : t));
    };

    const select = (type: SectionType, scroll = false) => {
        setSelected(type);
        if (!scroll) return;
        // Selected from the panel: bring it into view on the canvas.
        requestAnimationFrame(() => {
            frame.current?.querySelector(`[data-block^="${type}:"]`)?.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
            });
        });
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const mod = e.metaKey || e.ctrlKey;
            if (mod && e.key.toLowerCase() === 's') {
                e.preventDefault();
                if (draft && dirty) saveDraft(draft);
                return;
            }
            if (typing()) return;
            if (mod && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            } else if (mod && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            } else if (e.key === 'Escape') {
                setSelected(null);
                setSelectedText(null);
                setTab((t) => (t === 'section' ? 'sections' : t));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
        };
    }, [draft, dirty, saveDraft, undo, redo]);

    const editing = useMemo<EditSettings>(
        () => ({
            selected,
            selectedText,
            // Clicking a section on the canvas shows just that section's fields on the left.
            select: (type, detail) => {
                setSelected(type);
                setTab('section');
                setFocusEvent(detail?.event);
                setPhotoFirst(detail?.photo ?? false);
                setFocusSlot(detail?.slot);
                setSelectedText(detail?.text ?? null);
            },
            label: shortName,
            hint: emptyHint,
            editText: (path, value) => {
                set((d) => applyText(d, path, value, locale));
            },
        }),
        [selected, selectedText, set, locale],
    );

    const { data: affiliates } = useQuery({
        ...affiliatesQuery,
        queryFn: () => api<Affiliate[]>('/admin/affiliates'),
    });
    const preview = useMemo(() => {
        if (!draft || !data) return null;
        // The chosen affiliate's logo shows in the footer as it will for guests.
        const chosen = affiliates?.find((a) => a.id === draft.extras.branding?.affiliateId);
        return {
            ...draftToPreview(draft, data),
            affiliate: chosen?.isActive
                ? {
                      name: chosen.name,
                      logoKey: chosen.logoKey,
                      website: chosen.website,
                  }
                : null,
        };
    }, [draft, data, affiliates]);

    if (!data || !draft || !preview)
        return (
            <div className="dark flex h-svh flex-col bg-background">
                <div className="h-12 border-b" />
                <div className="flex flex-1 gap-4 p-4">
                    <Skeleton className="w-72" />
                    <Skeleton className="flex-1" />
                    <Skeleton className="w-80" />
                </div>
            </div>
        );

    const index = selected ? draft.sections.findIndex((s) => s.type === selected) : -1;
    const section = index >= 0 ? draft.sections[index] : undefined;
    const occasion = occasionOf(draft.occasion);
    const calm = cappedMotion(draft.design.motion, occasion) === 'calm';
    const width = deviceWidth[device];
    const title = titleOf(draft.content, locale) || 'Untitled invitation';
    const previewUrl = `${window.location.origin}/p/${data.invitation.previewToken}`;
    // A template's sample invitation: it is published to the catalogue, never to guests.
    const template = data.template;

    const patchSection = (patch: Partial<NonNullable<typeof section>>) => {
        set((d) => ({
            ...d,
            sections: d.sections.map((s, k) =>
                k === index
                    ? {
                          ...s,
                          ...patch,
                      }
                    : s,
            ),
        }));
    };
    const moveSection = (dir: -1 | 1) => {
        set((d) => {
            const sections = [...d.sections];
            const to = index + dir;
            if (to < 0 || to >= sections.length) return d;
            const [item] = sections.splice(index, 1);
            if (item) sections.splice(to, 0, item);
            return {
                ...d,
                sections,
            };
        });
    };

    return (
        <AutoTranslateProvider value={translator.status}>
            <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
                {/* Top bar */}
                <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={template ? 'Back to templates' : 'Back to invitations'}
                        asChild
                    >
                        <Link to={template ? '/admin/templates' : '/admin/invitations'}>
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex min-w-0 items-center gap-2 rounded-md border px-3 py-1">
                        {template && <LayoutTemplate className="size-4 shrink-0 text-gold" />}
                        <span className="truncate text-sm font-medium">
                            {template ? template.name : title}
                        </span>
                        <InvitationStatusBadge
                            status={template ? template.status : data.invitation.status}
                        />
                    </div>
                    {history.dirty ? (
                        <span className="text-xs text-amber-400">Unsaved changes</span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Check className="size-3.5" /> Saved
                        </span>
                    )}

                    <div className="mx-auto flex items-center gap-2">
                        <ToggleGroup
                            type="single"
                            size="sm"
                            variant="outline"
                            aria-label="Device"
                            value={device}
                            onValueChange={(v) => {
                                if (v === 'phone' || v === 'tablet' || v === 'desktop')
                                    setDevice(v);
                            }}
                        >
                            <ToggleGroupItem value="phone" aria-label="Phone">
                                <Smartphone />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="tablet" aria-label="Tablet">
                                <Tablet />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="desktop" aria-label="Desktop">
                                <Monitor />
                            </ToggleGroupItem>
                        </ToggleGroup>
                        {draft.locales.length > 1 && (
                            <Select value={locale} onValueChange={setLocale}>
                                <SelectTrigger
                                    size="sm"
                                    className="h-8 w-32"
                                    aria-label="Editing language"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {draft.locales.map((l) => (
                                        <SelectItem key={l} value={l}>
                                            {localeNames[l as keyof typeof localeNames]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <IconButton
                        label="Undo"
                        shortcut="⌘Z"
                        disabled={!history.canUndo}
                        onClick={undo}
                    >
                        <Undo2 />
                    </IconButton>
                    <IconButton
                        label="Redo"
                        shortcut="⇧⌘Z"
                        disabled={!history.canRedo}
                        onClick={redo}
                    >
                        <Redo2 />
                    </IconButton>
                    <div className="flex items-center">
                        <IconButton
                            label="Zoom out"
                            disabled={zoom <= (ZOOMS[0] ?? 0.5)}
                            onClick={() => {
                                setZoom(ZOOMS.findLast((z) => z < zoom) ?? zoom);
                            }}
                        >
                            <Minus />
                        </IconButton>
                        <span className="w-11 text-center text-xs tabular-nums">
                            {String(Math.round(zoom * 100))}%
                        </span>
                        <IconButton
                            label="Zoom in"
                            disabled={zoom >= (ZOOMS.at(-1) ?? 1.25)}
                            onClick={() => {
                                setZoom(ZOOMS.find((z) => z > zoom) ?? zoom);
                            }}
                        >
                            <Plus />
                        </IconButton>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setOpening(true);
                            setReplay((r) => r + 1);
                        }}
                    >
                        <Play /> Play opening
                    </Button>
                    {!template && (
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/admin/invitations/$id/guests" params={{ id }}>
                                <Users /> Guests
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                        <a href={previewUrl} target="_blank" rel="noreferrer">
                            <ExternalLink /> Preview
                        </a>
                    </Button>
                    <Button
                        size="sm"
                        disabled={!history.dirty || save.isPending}
                        onClick={() => {
                            save.mutate(draft);
                        }}
                    >
                        {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                        Save
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button size="sm" variant="gold">
                                <Rocket /> Publish
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-96">
                            {template ? (
                                <TemplatePublishPanel
                                    template={template}
                                    invitationId={id}
                                    dirty={history.dirty}
                                />
                            ) : (
                                <PublishPanel id={id} data={data} dirty={history.dirty} />
                            )}
                        </PopoverContent>
                    </Popover>
                </header>

                <div className="flex min-h-0 flex-1">
                    {/* Left: everything you can add or change */}
                    <aside className="flex w-[340px] shrink-0 flex-col border-e">
                        <nav className="grid grid-cols-7 border-b p-1" aria-label="Editor panels">
                            {leftTabs.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    aria-pressed={tab === t.id}
                                    onClick={() => {
                                        setTab(t.id);
                                    }}
                                    className={cn(
                                        'flex flex-col items-center gap-1 rounded-md py-1.5 text-[10px] font-medium whitespace-nowrap transition',
                                        tab === t.id
                                            ? 'bg-primary/15 text-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    {t.icon}
                                    {t.label}
                                </button>
                            ))}
                        </nav>
                        <ScrollArea className="min-h-0 flex-1">
                            {/* Panels size their grids to this column, not to the (wide) screen. */}
                            <div className="@container p-3">
                                {tab === 'section' && selected && (
                                    <SectionPanel
                                        type={selected}
                                        name={shortName(selected)}
                                        draft={draft}
                                        set={set}
                                        invitationId={id}
                                        photoLimit={data.order?.limits.photos}
                                        eventLimit={data.order?.limits.events}
                                        focusEvent={focusEvent}
                                        photoFirst={photoFirst}
                                        focusSlot={focusSlot}
                                        onBack={() => {
                                            setTab('sections');
                                        }}
                                    />
                                )}
                                {(tab === 'sections' || (tab === 'section' && !selected)) && (
                                    <LayersPanel
                                        draft={draft}
                                        set={set}
                                        selected={selected}
                                        onSelect={(type) => {
                                            select(type, true);
                                        }}
                                    />
                                )}
                                {tab === 'photos' && (
                                    <AllPhotos
                                        invitationId={id}
                                        draft={draft}
                                        set={set}
                                        photoLimit={data.order?.limits.photos}
                                    />
                                )}
                                {tab === 'design' && (
                                    <DesignPanel draft={draft} set={set} invitationId={id} />
                                )}
                                {tab === 'details' && <ContentPanel draft={draft} set={set} />}
                                {tab === 'ceremonies' && (
                                    <EventsPanel
                                        // Remount on a new focus so the clicked ceremony opens and scrolls into view.
                                        key={`events-${String(focusEvent ?? 'none')}`}
                                        draft={draft}
                                        set={set}
                                        focus={focusEvent}
                                        limit={data.order?.limits.events}
                                    />
                                )}
                                {tab === 'extras' && (
                                    <ExtrasPanel draft={draft} set={set} invitationId={id} />
                                )}
                            </div>
                        </ScrollArea>
                    </aside>

                    {/* Canvas: the real invitation, edited in place */}
                    <main
                        className="relative min-w-0 flex-1 overflow-hidden bg-[radial-gradient(circle,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:18px_18px]"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) deselect();
                        }}
                        onKeyDown={undefined}
                        role="presentation"
                    >
                        <div
                            className={cn(
                                'mx-auto h-full overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-[width]',
                                width ? 'my-0 rounded-none' : '',
                            )}
                            style={{
                                width: width ? `${String(width)}px` : '100%',
                                maxWidth: `${String(100 / zoom)}%`,
                                height: `${String(100 / zoom)}%`,
                                zoom,
                            }}
                        >
                            <EditContext value={editing}>
                                <div
                                    ref={frame}
                                    className="inv-editing relative h-full [transform:translateZ(0)] overflow-y-auto overscroll-contain"
                                    // Links (maps, calendar) must not navigate away while editing.
                                    onClickCapture={(e) => {
                                        if ((e.target as HTMLElement).closest('a'))
                                            e.preventDefault();
                                    }}
                                >
                                    <InvitationView
                                        key={`${locale}-${String(replay)}`}
                                        data={preview}
                                        initialLocale={locale}
                                        embedded
                                        skipOpening={!opening}
                                    />
                                </div>
                            </EditContext>
                        </div>
                        {/* The clicked text in every language, docked at the foot of the canvas. */}
                        {selectedText && (
                            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
                                <LanguagesSheet
                                    key={selectedText}
                                    draft={draft}
                                    path={selectedText}
                                    locale={locale}
                                    set={set}
                                    onClose={() => {
                                        setSelectedText(null);
                                    }}
                                />
                            </div>
                        )}
                    </main>

                    {/* Right: settings for whatever is selected */}
                    <aside className="w-[320px] shrink-0 border-s">
                        <ScrollArea className="h-full">
                            <div className="space-y-5 p-4">
                                {selectedText && (
                                    <div className="border-b pb-5">
                                        <TextStylePanel
                                            path={selectedText}
                                            style={draft.content.textStyles?.[selectedText] ?? {}}
                                            palette={draft.design.palette}
                                            onChange={(style) => {
                                                setTextStyle(selectedText, style);
                                            }}
                                            onReset={() => {
                                                setTextStyle(selectedText, {});
                                            }}
                                        />
                                    </div>
                                )}
                                {section ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                                                    Section
                                                </p>
                                                <h2 className="text-base font-semibold">
                                                    {shortName(section.type)}
                                                </h2>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label="Deselect"
                                                onClick={() => {
                                                    deselect();
                                                }}
                                            >
                                                <X />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={index <= 0}
                                                onClick={() => {
                                                    moveSection(-1);
                                                }}
                                            >
                                                <ArrowUp /> Up
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={index >= draft.sections.length - 1}
                                                onClick={() => {
                                                    moveSection(1);
                                                }}
                                            >
                                                <ArrowDown /> Down
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    patchSection({ enabled: !section.enabled });
                                                }}
                                            >
                                                {section.enabled ? <EyeOff /> : <Eye />}
                                                {section.enabled ? 'Hide' : 'Show'}
                                            </Button>
                                        </div>
                                        <BlockEditor
                                            section={section}
                                            previousScene={undefined}
                                            calm={calm}
                                            film={
                                                draft.design.film?.behind
                                                    ? timelineOf(draft.design.film)
                                                    : undefined
                                            }
                                            update={patchSection}
                                        />
                                    </>
                                ) : (
                                    <div className="space-y-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2 text-foreground">
                                            <MousePointerClick className="size-4" />
                                            <span className="font-medium">
                                                Click anything to edit it
                                            </span>
                                        </div>
                                        <ul className="list-disc space-y-1.5 ps-5 leading-relaxed">
                                            <li>
                                                Click a section on the page to choose its layout,
                                                entrance, backdrop and edge here.
                                            </li>
                                            <li>
                                                Click any text (names, messages, ceremony names,
                                                venues) and type straight on it. Press Enter or
                                                click away to keep it.
                                            </li>
                                            <li>
                                                Drag sections in the left panel to reorder them; the
                                                eye hides one.
                                            </li>
                                            <li>
                                                Opening, Design, Details, Events and Extras are on
                                                the left.
                                            </li>
                                        </ul>
                                        <div className="space-y-1.5 rounded-lg border p-3 text-xs">
                                            <p className="flex justify-between">
                                                Save <Kbd>⌘S</Kbd>
                                            </p>
                                            <p className="flex justify-between">
                                                Undo / Redo{' '}
                                                <span>
                                                    <Kbd>⌘Z</Kbd> <Kbd>⇧⌘Z</Kbd>
                                                </span>
                                            </p>
                                            <p className="flex justify-between">
                                                Deselect <Kbd>Esc</Kbd>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </aside>
                </div>
            </div>
        </AutoTranslateProvider>
    );
}
