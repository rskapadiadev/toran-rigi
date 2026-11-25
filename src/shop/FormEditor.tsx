// The customer's editor: a plain form on the left (names, photos, ceremonies, story), the real
// invitation on the right updating as they type. No design controls: the studio's design stays.
import { isRendered } from '@shared/blocks';
import { familyContent, familyTexts } from '@shared/families';
import type { Side } from '@shared/guests';
import { isCouple, occasionOf } from '@shared/occasions';
import type { SectionType } from '@shared/types';
import { Eye, Monitor, PenLine, RotateCcw, Smartphone } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

import {
    type Draft,
    draftToPreview,
    type EditableInvitation,
    type OrderLimits,
} from '@/admin/composer/draft';
import {
    ContentPanel,
    type ContentPart,
    EventsPanel,
    type ExtraPart,
    ExtrasPanel,
} from '@/admin/composer/panels';
import { AllPhotos } from '@/admin/editor/SectionPanel';
import { type Uploader, UploaderContext } from '@/admin/editor/uploader';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { InvitationView } from '@/invitation/InvitationView';
import { cn } from '@/lib/utils';

import { FamilyVersions } from './FamilyVersions';
import { SectionsList } from './SectionsList';

interface FormSection {
    id: string;
    title: string;
    hint: string;
    body: ReactNode;
}

interface FormEditorProps {
    base: EditableInvitation;
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
    uploader: Uploader;
    limits?: OrderLimits;
    // The top bar: back link, name, price and the main action.
    bar: ReactNode;
    // A line under the bar ("You're trying this template…").
    notice?: ReactNode;
    locked?: boolean;
    // Their own invitation, paid for: every part of it but the look is theirs to change, in the
    // portal's dress. While trying, only words, photos and ceremonies.
    owned?: boolean;
}

const parts = (present: Set<SectionType>, wanted: [SectionType, ContentPart[]][]): ContentPart[] =>
    wanted.filter(([type]) => present.has(type)).flatMap(([, p]) => p);

export function FormEditor({
    base,
    draft,
    set,
    uploader,
    limits,
    bar,
    notice,
    locked = false,
    owned = false,
}: FormEditorProps) {
    const [view, setView] = useState<'phone' | 'full'>('phone');
    // Phones show one pane at a time.
    const [pane, setPane] = useState<'edit' | 'preview'>('edit');
    const [replay, setReplay] = useState(0);
    const [family, setFamily] = useState<Side | null>(null);
    const preview = useMemo(() => {
        const data = draftToPreview(draft, base);
        const content = familyContent(data.invitation.content, family);
        return {
            ...data,
            invitation: {
                ...data.invitation,
                content,
            },
        };
    }, [draft, base, family]);

    const present = new Set(
        draft.sections.filter((s) => s.enabled && isRendered(s.type)).map((s) => s.type),
    );
    const names: ContentPart[] = [
        'people',
        'greeting',
        'headline',
        ...parts(present, [['welcome', ['welcome']]]),
        ...(owned ? (['languages'] as const) : []),
    ];
    // Off and on again, each of these has settings of its own.
    const extras: ExtraPart[] = [
        'music',
        'rsvp',
        'wishes',
        ...(present.has('shagun') ? (['gifts'] as const) : []),
        ...(present.has('live') ? (['live'] as const) : []),
        ...(present.has('travel') ? (['travel'] as const) : []),
        'pdf',
    ];
    const story = parts(present, [
        ['story', ['story']],
        ['family', ['family']],
        ['closing', ['closing', 'hashtag']],
    ]);
    const sections: FormSection[] = [
        {
            id: 'names',
            title: 'Names & invitation words',
            hint: 'Who is celebrating and how you invite your guests',
            body: <ContentPanel draft={draft} set={set} only={names} />,
        },
        {
            id: 'photos',
            title: 'Photos',
            hint: 'Each frame in the design, then your gallery',
            body: (
                <AllPhotos
                    draft={draft}
                    set={set}
                    invitationId={base.invitation.id}
                    photoLimit={limits?.photos}
                />
            ),
        },
        ...(present.has('events') || present.has('countdown')
            ? [
                  {
                      id: 'events',
                      title: 'Ceremonies',
                      hint: 'Dates, times and venues. Guests can add them to their calendar',
                      body: <EventsPanel draft={draft} set={set} limit={limits?.events} />,
                  },
              ]
            : []),
        ...(story.length > 0
            ? [
                  {
                      id: 'story',
                      title: 'Your story & family',
                      hint: 'The words that make it personal',
                      body: <ContentPanel draft={draft} set={set} only={story} />,
                  },
              ]
            : []),
        ...(owned
            ? [
                  {
                      id: 'sections',
                      title: 'Sections',
                      hint: 'Show, hide or reorder the parts of your invitation',
                      body: <SectionsList draft={draft} set={set} />,
                  },
                  {
                      id: 'extras',
                      title: 'Music & guests',
                      hint: 'Your song, replies, wishes and gifts',
                      body: (
                          <ExtrasPanel
                              draft={draft}
                              set={set}
                              invitationId={base.invitation.id}
                              only={extras}
                              music={{
                                  tracks: '/store/me/music',
                                  upload: `/store/me/invitations/${base.invitation.id}/music`,
                                  studio: false,
                              }}
                          />
                      ),
                  },
              ]
            : []),
        ...(owned && isCouple(occasionOf(draft.occasion)) && draft.content.people.two
            ? [
                  {
                      id: 'families',
                      title: 'A version for each family',
                      hint: 'Their own name first, in their own words',
                      body: (
                          <FamilyVersions
                              draft={draft}
                              set={set}
                              side={family}
                              onSide={setFamily}
                              texts={familyTexts.filter((key) => present.has(key))}
                          />
                      ),
                  },
              ]
            : []),
    ];

    // The portal's icons follow its own colours, which would vanish on ink.
    const onPill = owned ? 'bg-primary text-primary-foreground' : 'bg-ink text-ivory';
    const paneTab = (on: boolean) => {
        if (owned) return on ? 'bg-primary text-primary-foreground' : 'text-foreground';
        return on ? 'bg-ivory text-ink' : 'text-ivory';
    };

    return (
        <UploaderContext value={uploader}>
            <div className={cn('flex h-dvh flex-col', owned && 'bg-background')}>
                <div
                    className={cn(
                        'shrink-0 border-b',
                        owned ? 'bg-card' : 'border-black/5 bg-ivory/90 backdrop-blur',
                    )}
                >
                    {bar}
                </div>
                <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(380px,520px)_1fr]">
                    {/* Form */}
                    <div
                        className={cn(
                            '@container min-h-0 overflow-y-auto border-e pb-24 lg:pb-8',
                            !owned && 'border-black/5',
                            pane === 'preview' && 'hidden lg:block',
                        )}
                    >
                        {notice && (
                            <div
                                className={cn(
                                    'border-b px-4 py-2.5 text-xs',
                                    owned
                                        ? 'bg-muted/50 text-muted-foreground'
                                        : 'border-gold/30 bg-champagne/40 text-ink/80',
                                )}
                            >
                                {notice}
                            </div>
                        )}
                        <fieldset disabled={locked} className="min-w-0 p-3 sm:p-4">
                            <Accordion
                                type="multiple"
                                defaultValue={['names', 'photos']}
                                className="space-y-3"
                            >
                                {sections.map((s) => (
                                    <AccordionItem
                                        key={s.id}
                                        value={s.id}
                                        className={cn(
                                            'bg-card px-4',
                                            owned
                                                ? 'rounded-xl border-0 ring-1 ring-foreground/10'
                                                : 'rounded-2xl border last:border-b',
                                        )}
                                    >
                                        <AccordionTrigger className="py-4 hover:no-underline">
                                            <span className="text-start">
                                                <span
                                                    className={cn(
                                                        'block',
                                                        owned
                                                            ? 'text-base font-medium'
                                                            : 'font-display text-xl text-ink',
                                                    )}
                                                >
                                                    {s.title}
                                                </span>
                                                <span className="block text-xs font-normal text-muted-foreground">
                                                    {s.hint}
                                                </span>
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-5">
                                            {s.body}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </fieldset>
                    </div>

                    {/* Live preview */}
                    <div
                        className={cn(
                            'relative min-h-0 flex-col lg:flex',
                            owned
                                ? 'bg-muted/60'
                                : 'bg-[radial-gradient(circle_at_50%_0%,#f3ebdd,#e9dcc6)]',
                            pane === 'edit' ? 'hidden' : 'flex',
                        )}
                    >
                        <div className="flex shrink-0 items-center justify-between px-4 py-3">
                            <p
                                className={cn(
                                    'uppercase',
                                    owned
                                        ? 'text-[11px] font-medium tracking-wider text-muted-foreground'
                                        : 'text-xs tracking-[0.2em] text-gold-deep',
                                )}
                            >
                                Live preview
                            </p>
                            <div className="flex items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReplay((r) => r + 1);
                                    }}
                                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-ink/80 hover:bg-black/5"
                                >
                                    <RotateCcw className="size-3.5" /> Replay
                                </button>
                                <button
                                    type="button"
                                    aria-pressed={view === 'phone'}
                                    onClick={() => {
                                        setView('phone');
                                    }}
                                    className={cn(
                                        'flex items-center gap-1 rounded-full px-3 py-1 text-xs',
                                        view === 'phone' ? onPill : 'text-ink/80 hover:bg-black/5',
                                    )}
                                >
                                    <Smartphone className="size-3.5" /> Phone
                                </button>
                                <button
                                    type="button"
                                    aria-pressed={view === 'full'}
                                    onClick={() => {
                                        setView('full');
                                    }}
                                    className={cn(
                                        'hidden items-center gap-1 rounded-full px-3 py-1 text-xs sm:flex',
                                        view === 'full' ? onPill : 'text-ink/80 hover:bg-black/5',
                                    )}
                                >
                                    <Monitor className="size-3.5" /> Full width
                                </button>
                            </div>
                        </div>
                        <div className="flex min-h-0 flex-1 justify-center px-4 pb-24 lg:pb-6">
                            <div
                                className={cn(
                                    'h-full overflow-hidden bg-white transition-[width]',
                                    view === 'phone'
                                        ? 'w-full max-w-[400px] rounded-[36px] border-[7px] border-night shadow-[0_30px_80px_-30px_rgba(74,15,31,0.55)]'
                                        : 'w-full rounded-xl shadow-lg',
                                )}
                            >
                                <div
                                    className="relative h-full [transform:translateZ(0)] overflow-y-auto overscroll-contain"
                                    // Maps and calendar links would leave the editor.
                                    onClickCapture={(e) => {
                                        if ((e.target as HTMLElement).closest('a'))
                                            e.preventDefault();
                                    }}
                                >
                                    <InvitationView key={replay} data={preview} embedded />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phone: switch between the form and the preview */}
                <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center lg:hidden">
                    <div
                        className={cn(
                            'flex gap-1 rounded-full p-1 shadow-xl',
                            owned ? 'bg-card ring-1 ring-foreground/10' : 'bg-ink',
                        )}
                    >
                        <button
                            type="button"
                            aria-pressed={pane === 'edit'}
                            onClick={() => {
                                setPane('edit');
                            }}
                            className={cn(
                                'flex items-center gap-1.5 rounded-full px-5 py-2 text-sm',
                                paneTab(pane === 'edit'),
                            )}
                        >
                            <PenLine className="size-4" /> Edit
                        </button>
                        <button
                            type="button"
                            aria-pressed={pane === 'preview'}
                            onClick={() => {
                                setPane('preview');
                            }}
                            className={cn(
                                'flex items-center gap-1.5 rounded-full px-5 py-2 text-sm',
                                paneTab(pane === 'preview'),
                            )}
                        >
                            <Eye className="size-4" /> Preview
                        </button>
                    </div>
                </div>
            </div>
        </UploaderContext>
    );
}
