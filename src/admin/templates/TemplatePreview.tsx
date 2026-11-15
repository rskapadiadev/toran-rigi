// Live template previews: the real invitation engine, so a card shows the template's own opening
// screen (doors, envelope, veil…) and the preview dialog plays the full entrance.
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ExternalLink, Paintbrush, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { draftToPreview, type EditableInvitation, toDraft } from '@/admin/composer/draft';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { InvitationView } from '@/invitation/InvitationView';
import type { PublicInvitationData } from '@/invitation/types';
import { api } from '@/lib/api';

import { TemplateThumb } from './TemplateThumb';
import type { TemplateRow } from './types';

// The phone the thumbnail is rendered on before it is scaled into the card (3:5, like the card).
const FRAME_W = 390;
const FRAME_H = 650;

interface PreviewOptions {
    // Thumbnails: only the opening screen, never music.
    openingOnly: boolean;
}

function usePreviewData(invitationId: string, enabled: boolean, { openingOnly }: PreviewOptions) {
    return useQuery({
        // Same key as the editor, so opening the editor (or coming back from it) is instant.
        queryKey: ['invitation', invitationId],
        queryFn: () => api<EditableInvitation>(`/admin/invitations/${invitationId}`),
        enabled,
        staleTime: 60_000,
        select: (data): PublicInvitationData => {
            const preview = draftToPreview(toDraft(data), data);
            if (!openingOnly) return preview;
            return {
                ...preview,
                invitation: {
                    ...preview.invitation,
                    // Nothing renders under the opening, and a grid of cards stays silent.
                    sections: [],
                    extras: {
                        ...preview.invitation.extras,
                        music: { source: 'none' },
                    },
                    musicBlobKey: null,
                },
            };
        },
    });
}

// True while the element is on (or near) the screen, so only visible cards run an opening.
function useNearScreen<T extends Element>() {
    const ref = useRef<T>(null);
    const [near, setNear] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                setNear(entry?.isIntersecting ?? false);
            },
            { rootMargin: '300px 0px' },
        );
        io.observe(el);
        return () => {
            io.disconnect();
        };
    }, []);
    return [ref, near] as const;
}

function useWidth<T extends Element>() {
    const ref = useRef<T>(null);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setWidth(entry?.contentRect.width ?? 0);
        });
        ro.observe(el);
        return () => {
            ro.disconnect();
        };
    }, []);
    return [ref, width] as const;
}

interface LiveThumbProps {
    template: TemplateRow;
    className?: string;
}

// The template's real opening screen, scaled into the card. Falls back to a palette card while loading.
export function LiveThumb({ template, className }: LiveThumbProps) {
    const [nearRef, near] = useNearScreen<HTMLDivElement>();
    const [sizeRef, width] = useWidth<HTMLDivElement>();
    const { data } = usePreviewData(template.invitationId, near, { openingOnly: true });
    const scale = width / FRAME_W;
    return (
        <div
            ref={(el) => {
                nearRef.current = el;
                sizeRef.current = el;
            }}
            className={`relative aspect-[3/5] overflow-hidden ${className ?? ''}`}
        >
            <TemplateThumb
                design={template.design}
                name={template.name}
                caption={template.themeName ?? undefined}
                className="absolute inset-0"
            />
            {near && data && scale > 0 && (
                <div
                    // Display only: no taps, focus or screen-reader noise from a grid of invitations.
                    inert
                    aria-hidden
                    className="pointer-events-none absolute start-0 top-0 origin-top-left [&_[data-skip-opening]]:hidden animate-[fade-in_0.6s_ease-out] overflow-hidden"
                    style={{
                        width: FRAME_W,
                        height: FRAME_H,
                        // A transform also contains the opening's fixed-position layers in this box.
                        transform: `scale(${String(scale)})`,
                    }}
                >
                    <InvitationView data={data} embedded />
                </div>
            )}
        </div>
    );
}

interface TemplatePreviewDialogProps {
    template: TemplateRow | null;
    onOpenChange: (open: boolean) => void;
}

// The whole template on a phone: tap through its entrance, scroll the sections, replay.
export function TemplatePreviewDialog({ template, onOpenChange }: TemplatePreviewDialogProps) {
    return (
        <Dialog open={template !== null} onOpenChange={onOpenChange}>
            <DialogContent className="w-fit max-w-[calc(100vw-2rem)] gap-3 p-4 sm:max-w-fit">
                {template && <PreviewBody template={template} />}
            </DialogContent>
        </Dialog>
    );
}

function PreviewBody({ template }: { template: TemplateRow }) {
    const [replay, setReplay] = useState(0);
    const { data } = usePreviewData(template.invitationId, true, { openingOnly: false });
    return (
        <>
            <DialogHeader className="pe-8">
                <DialogTitle>{template.name}</DialogTitle>
                <DialogDescription>
                    {template.themeName && template.themeName !== template.name
                        ? `${template.themeName} theme · `
                        : ''}Tap the screen to play
                    the entrance, then scroll.
                </DialogDescription>
            </DialogHeader>
            <div
                className="relative mx-auto overflow-hidden rounded-[28px] bg-black ring-1 ring-foreground/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
                style={{
                    width: FRAME_W,
                    height: 'min(760px, calc(100svh - 12rem))',
                    // Keeps the opening's fixed layers inside the phone.
                    transform: 'translateZ(0)',
                }}
            >
                {data ? (
                    <div className="h-full overflow-y-auto overscroll-contain">
                        <InvitationView key={replay} data={data} embedded />
                    </div>
                ) : (
                    <TemplateThumb
                        design={template.design}
                        name={template.name}
                        caption="Loading…"
                        className="h-full"
                    />
                )}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setReplay((r) => r + 1);
                    }}
                >
                    <RotateCcw /> Replay entrance
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <a href={`/p/${template.previewToken}`} target="_blank" rel="noreferrer">
                        <ExternalLink /> Full screen
                    </a>
                </Button>
                <Button size="sm" asChild>
                    <Link to="/admin/templates/$id" params={{ id: template.id }}>
                        <Paintbrush /> Edit design
                    </Link>
                </Button>
            </div>
        </>
    );
}
