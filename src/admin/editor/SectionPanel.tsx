import { isRendered } from '@shared/blocks';
import { slotsFor } from '@shared/photos';
import type { SectionType } from '@shared/types';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

import type { Draft } from '../composer/draft';
import {
    ContentPanel,
    type ContentPart,
    EventsPanel,
    type ExtraPart,
    ExtrasPanel,
    sectionNames,
} from '../composer/panels';
import { PhotoSlots } from './PhotoSlots';
import { PhotosPanel } from './PhotosPanel';

interface Fields {
    content?: readonly ContentPart[];
    extras?: readonly ExtraPart[];
    events?: boolean;
}

// What each section on the canvas is made of, so clicking it shows exactly those fields.
// Photos come from the section's own frames (photoSlots) or, for the gallery, its own list.
const fieldsFor: Partial<Record<SectionType, Fields>> = {
    cover: { content: ['people', 'headline', 'greeting'] },
    card: { content: ['people', 'headline', 'greeting'] },
    welcome: { content: ['welcome'] },
    story: { content: ['story'] },
    family: { content: ['family'] },
    closing: {
        content: ['closing', 'hashtag'],
        extras: ['contacts'],
    },
    events: { events: true },
    countdown: { events: true },
    shagun: { extras: ['gifts'] },
    rsvp: { extras: ['rsvp'] },
    wishes: { extras: ['wishes'] },
    live: { extras: ['live'] },
    travel: { extras: ['travel'] },
};

interface PhotoProps {
    draft: Draft;
    set: (update: (d: Draft) => Draft) => void;
    invitationId: string;
    photoLimit?: number;
}

interface SectionPanelProps extends PhotoProps {
    type: SectionType;
    name: string;
    eventLimit?: number;
    focusEvent?: number;
    // A photo was clicked: photos go first, its frame highlighted.
    photoFirst: boolean;
    focusSlot?: string;
    onBack: () => void;
}

function SectionPhotos({
    type,
    focusSlot,
    ...props
}: PhotoProps & {
    type: SectionType;
    focusSlot?: string;
}) {
    if (type === 'gallery')
        return (
            <PhotosPanel
                invitationId={props.invitationId}
                draft={props.draft}
                set={props.set}
                limit={props.photoLimit}
            />
        );
    const variant = props.draft.sections.find((s) => s.type === type)?.variant;
    const slots = slotsFor(type, variant);
    if (slots.length === 0) return null;
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">Photos in this section</p>
            <PhotoSlots
                invitationId={props.invitationId}
                draft={props.draft}
                set={props.set}
                slots={slots}
                limit={props.photoLimit}
                focus={focusSlot}
            />
        </div>
    );
}

// The Photos tab: every section's frames, then the gallery, each kept apart.
export function AllPhotos(props: PhotoProps) {
    const withFrames = props.draft.sections.filter(
        (s) => isRendered(s.type) && slotsFor(s.type, s.variant).length > 0,
    );
    return (
        <div className="space-y-5">
            {withFrames.map((s) => (
                <div key={s.type} className="space-y-2">
                    <p className="text-sm font-medium">{sectionNames[s.type]}</p>
                    <PhotoSlots
                        invitationId={props.invitationId}
                        draft={props.draft}
                        set={props.set}
                        slots={slotsFor(s.type, s.variant)}
                        limit={props.photoLimit}
                    />
                </div>
            ))}
            {withFrames.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    No section layout here has its own photo frames. Try the “Photo story” cover or
                    the “A note from us” story.
                </p>
            )}
            <div className="border-t pt-4">
                <PhotosPanel
                    invitationId={props.invitationId}
                    draft={props.draft}
                    set={props.set}
                    limit={props.photoLimit}
                />
            </div>
        </div>
    );
}

// The left column while a section is selected: only that section's content, nothing else.
export function SectionPanel({
    type,
    name,
    draft,
    set,
    invitationId,
    photoLimit,
    eventLimit,
    focusEvent,
    photoFirst,
    focusSlot,
    onBack,
}: SectionPanelProps) {
    const fields = fieldsFor[type] ?? {};
    const photos = (
        <SectionPhotos
            key="photos"
            type={type}
            focusSlot={focusSlot}
            draft={draft}
            set={set}
            invitationId={invitationId}
            photoLimit={photoLimit}
        />
    );
    const hasPhotos =
        type === 'gallery' ||
        slotsFor(type, draft.sections.find((s) => s.type === type)?.variant).length > 0;

    const parts: ReactNode[] = [];
    if (hasPhotos && photoFirst) parts.push(photos);
    if (fields.content)
        parts.push(<ContentPanel key="content" draft={draft} set={set} only={fields.content} />);
    if (fields.events)
        parts.push(
            <EventsPanel
                key={`events-${String(focusEvent ?? 'none')}`}
                draft={draft}
                set={set}
                focus={focusEvent}
                limit={eventLimit}
            />,
        );
    if (fields.extras)
        parts.push(
            <ExtrasPanel
                key="extras"
                draft={draft}
                set={set}
                invitationId={invitationId}
                only={fields.extras}
            />,
        );
    if (hasPhotos && !photoFirst) parts.push(photos);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" aria-label="All sections" onClick={onBack}>
                    <ArrowLeft />
                </Button>
                <div className="min-w-0">
                    <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                        Editing section
                    </p>
                    <h2 className="truncate text-sm font-semibold">{name}</h2>
                </div>
            </div>
            {parts.length > 0 ? (
                parts.map((node, i) => (
                    <div key={i} className={i > 0 ? 'border-t pt-4' : undefined}>
                        {node}
                    </div>
                ))
            ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    This section has no text or photos of its own. Change its layout, entrance and
                    colours on the right.
                </p>
            )}
        </div>
    );
}
