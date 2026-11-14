import { localeNames } from '@shared/locales';
import { cappedMotion, isSolemn, occasionOf } from '@shared/occasions';
import { titleOf } from '@shared/people';
import type { SectionType } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    CalendarHeart,
    Check,
    DoorOpen,
    ExternalLink,
    Eye,
    EyeOff,
    Gift,
    Layers,
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
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

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
    OpeningPicker,
    sectionNames,
} from '@/admin/composer/panels';
import { BlockEditor } from '@/admin/composer/SectionsPanel';
import { applyText } from '@/admin/editor/apply-text';
import { useDraftHistory } from '@/admin/editor/history';
import { LayersPanel } from '@/admin/editor/LayersPanel';
import { PublishPanel } from '@/admin/editor/PublishPanel';
import { DesktopOnly } from '@/admin/kit/desktop-only';
import { InvitationStatusBadge } from '@/admin/kit/status';
import { applyAdminTheme, readAdminTheme } from '@/admin/shell/theme';
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
import { EditContext, type EditSettings } from '@/invitation/editing';
import { InvitationView } from '@/invitation/InvitationView';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/invitations/$id/')({ component: EditorGate });

type Device = 'phone' | 'tablet' | 'desktop';
const deviceWidth: Record<Device, number | null> = {
    phone: 390,
    tablet: 820,
    desktop: null,
};

type LeftTab = 'sections' | 'opening' | 'design' | 'details' | 'ceremonies' | 'extras';
const leftTabs: {
    id: LeftTab;
    label: string;
    icon: ReactNode;
}[] = [
    {
        id: 'sections',
        label: 'Sections',
        icon: <Layers className="size-4" />,
    },
    {
        id: 'opening',
        label: 'Opening',
        icon: <DoorOpen className="size-4" />,
    },
    {
        id: 'design',
        label: 'Design',
        icon: <Palette className="size-4" />,
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
// Clicking a section on the canvas opens the panel that holds its information.
const detailsTab: Partial<Record<SectionType, LeftTab>> = {
    cover: 'details',
    card: 'details',
    welcome: 'details',
    story: 'details',
    family: 'details',
    closing: 'details',
    events: 'ceremonies',
    countdown: 'ceremonies',
    shagun: 'extras',
    rsvp: 'extras',
    wishes: 'extras',
    live: 'extras',
    travel: 'extras',
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
function EditorGate() {
    const { id } = Route.useParams();
    const { data } = useQuery({
        queryKey: ['invitation', id],
        queryFn: () => api<EditableInvitation>(`/admin/invitations/${id}`),
    });
    const previewUrl = data
        ? `${window.location.origin}/p/${data.invitation.previewToken}`
        : undefined;
    return (
        <DesktopOnly tool="The visual editor" previewUrl={previewUrl}>
            <EditorPage />
        </DesktopOnly>
    );
}

function EditorPage() {
    const { id } = Route.useParams();
    const client = useQueryClient();
    const { data } = useQuery({
        queryKey: ['invitation', id],
        queryFn: () => api<EditableInvitation>(`/admin/invitations/${id}`),
    });
    const base = useMemo(() => (data ? toDraft(data) : null), [data]);
    const history = useDraftHistory(base);
    const { draft, set, undo, redo } = history;
    const [selected, setSelected] = useState<SectionType | null>(null);
    const [device, setDevice] = useState<Device>('phone');
    const [zoom, setZoom] = useState(1);
    const [tab, setTab] = useState<LeftTab>('sections');
    const [focusEvent, setFocusEvent] = useState<number | undefined>(undefined);
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
            select: (type, detail) => {
                setSelected(type);
                const target = detailsTab[type];
                if (target) setTab(target);
                setFocusEvent(detail?.event);
            },
            label: shortName,
            hint: emptyHint,
            editText: (path, value) => {
                set((d) => applyText(d, path, value, locale));
            },
        }),
        [selected, set, locale],
    );

    const preview = useMemo(
        () => (draft && data ? draftToPreview(draft, data) : null),
        [draft, data],
    );

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
        <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
            {/* Top bar */}
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2">
                <Button variant="ghost" size="icon-sm" aria-label="Back to invitations" asChild>
                    <Link to="/admin/invitations">
                        <ArrowLeft />
                    </Link>
                </Button>
                <div className="flex min-w-0 items-center gap-2 rounded-md border px-3 py-1">
                    <span className="truncate text-sm font-medium">{title}</span>
                    <InvitationStatusBadge status={data.invitation.status} />
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
                            if (v === 'phone' || v === 'tablet' || v === 'desktop') setDevice(v);
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

                <IconButton label="Undo" shortcut="⌘Z" disabled={!history.canUndo} onClick={undo}>
                    <Undo2 />
                </IconButton>
                <IconButton label="Redo" shortcut="⇧⌘Z" disabled={!history.canRedo} onClick={redo}>
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
                <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/invitations/$id/guests" params={{ id }}>
                        <Users /> Guests
                    </Link>
                </Button>
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
                        <PublishPanel id={id} data={data} dirty={history.dirty} />
                    </PopoverContent>
                </Popover>
            </header>

            <div className="flex min-h-0 flex-1">
                {/* Left: everything you can add or change */}
                <aside className="flex w-[340px] shrink-0 flex-col border-e">
                    <nav className="grid grid-cols-6 border-b p-1" aria-label="Editor panels">
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
                            {tab === 'sections' && (
                                <LayersPanel
                                    draft={draft}
                                    set={set}
                                    selected={selected}
                                    onSelect={(type) => {
                                        select(type, true);
                                    }}
                                />
                            )}
                            {tab === 'opening' && (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        The entry screen guests see first. Pick one and it plays on
                                        the canvas.
                                    </p>
                                    <OpeningPicker
                                        value={draft.design.opening}
                                        gentleOnly={isSolemn(occasionOf(draft.occasion))}
                                        onChange={(next) => {
                                            set((d) => ({
                                                ...d,
                                                design: {
                                                    ...d.design,
                                                    opening: next,
                                                },
                                            }));
                                        }}
                                    />
                                </div>
                            )}
                            {tab === 'design' && <DesignPanel draft={draft} set={set} />}
                            {tab === 'details' && <ContentPanel draft={draft} set={set} />}
                            {tab === 'ceremonies' && (
                                <EventsPanel
                                    // Remount on a new focus so the clicked ceremony opens and scrolls into view.
                                    key={`events-${String(focusEvent ?? 'none')}`}
                                    draft={draft}
                                    set={set}
                                    focus={focusEvent}
                                />
                            )}
                            {tab === 'extras' && <ExtrasPanel draft={draft} set={set} />}
                        </div>
                    </ScrollArea>
                </aside>

                {/* Canvas: the real invitation, edited in place */}
                <main
                    className="relative min-w-0 flex-1 overflow-hidden bg-[radial-gradient(circle,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:18px_18px]"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setSelected(null);
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
                                    if ((e.target as HTMLElement).closest('a')) e.preventDefault();
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
                </main>

                {/* Right: settings for whatever is selected */}
                <aside className="w-[320px] shrink-0 border-s">
                    <ScrollArea className="h-full">
                        <div className="space-y-5 p-4">
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
                                                setSelected(null);
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
                                            Click any text (names, messages, ceremony names, venues)
                                            and type straight on it. Press Enter or click away to
                                            keep it.
                                        </li>
                                        <li>
                                            Drag sections in the left panel to reorder them; the eye
                                            hides one.
                                        </li>
                                        <li>
                                            Opening, Design, Details, Events and Extras are on the
                                            left.
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
    );
}
