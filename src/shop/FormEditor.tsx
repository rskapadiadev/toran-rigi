// The customer's editor: a plain form on the left (names, photos, ceremonies, story), the real
// invitation on the right updating as they type. No design controls: the studio's design stays.
import { isRendered } from '@shared/blocks';
import type { SectionType } from '@shared/types';
import { Eye, Monitor, PenLine, RotateCcw, Smartphone } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

import {
    type Draft,
    draftToPreview,
    type EditableInvitation,
    type OrderLimits,
} from '@/admin/composer/draft';
import { ContentPanel, type ContentPart, EventsPanel } from '@/admin/composer/panels';
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
}: FormEditorProps) {
    const [view, setView] = useState<'phone' | 'full'>('phone');
    // Phones show one pane at a time.
    const [pane, setPane] = useState<'edit' | 'preview'>('edit');
    const [replay, setReplay] = useState(0);
    const preview = useMemo(() => draftToPreview(draft, base), [draft, base]);

    const present = new Set(
        draft.sections.filter((s) => s.enabled && isRendered(s.type)).map((s) => s.type),
    );
    const names: ContentPart[] = [
        'people',
        'greeting',
        'headline',
        ...parts(present, [['welcome', ['welcome']]]),
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
    ];

    return (
        <UploaderContext value={uploader}>
            <div className="flex h-dvh flex-col">
                <div className="shrink-0 border-b border-black/5 bg-ivory/90 backdrop-blur">
                    {bar}
                </div>
                <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(380px,520px)_1fr]">
                    {/* Form */}
                    <div
                        className={cn(
                            '@container min-h-0 overflow-y-auto border-e border-black/5 pb-24 lg:pb-8',
                            pane === 'preview' && 'hidden lg:block',
                        )}
                    >
                        {notice && (
                            <div className="border-b border-gold/30 bg-champagne/40 px-4 py-2.5 text-xs text-ink/80">
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
                                        className="rounded-2xl border bg-card px-4 last:border-b"
                                    >
                                        <AccordionTrigger className="py-4 hover:no-underline">
                                            <span className="text-start">
                                                <span className="block font-display text-xl text-ink">
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
                            'relative min-h-0 flex-col bg-[radial-gradient(circle_at_50%_0%,#f3ebdd,#e9dcc6)] lg:flex',
                            pane === 'edit' ? 'hidden' : 'flex',
                        )}
                    >
                        <div className="flex shrink-0 items-center justify-between px-4 py-3">
                            <p className="text-xs tracking-[0.2em] text-gold-deep uppercase">
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
                                        view === 'phone'
                                            ? 'bg-ink text-ivory'
                                            : 'text-ink/80 hover:bg-black/5',
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
                                        view === 'full'
                                            ? 'bg-ink text-ivory'
                                            : 'text-ink/80 hover:bg-black/5',
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
                    <div className="flex gap-1 rounded-full bg-ink p-1 shadow-xl">
                        <button
                            type="button"
                            aria-pressed={pane === 'edit'}
                            onClick={() => {
                                setPane('edit');
                            }}
                            className={cn(
                                'flex items-center gap-1.5 rounded-full px-5 py-2 text-sm',
                                pane === 'edit' ? 'bg-ivory text-ink' : 'text-ivory',
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
                                pane === 'preview' ? 'bg-ivory text-ink' : 'text-ivory',
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
