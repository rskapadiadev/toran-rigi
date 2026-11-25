// The couple's invitation as a short video to send on WhatsApp or post as a status: their film with
// their names, its words and an end card with their link. It's made on their own device.
import { timelineOf } from '@shared/film';
import { fontStack } from '@shared/fonts';
import { Clapperboard } from 'lucide-react';
import { useMemo } from 'react';

import type { EditableInvitation } from '@/admin/composer/draft';
import { draftToPreview, toDraft } from '@/admin/composer/draft';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { InviteProvider, useInvite } from '@/invitation/context';
import { makeFilmVideo, videoSeconds, type VideoText } from '@/invitation/film/video';
import { useCoverFacts } from '@/invitation/sections/covers';
import { VideoMaker } from '@/shop/VideoMaker';

interface Props {
    base: EditableInvitation;
}

// Only for invitations whose film plays behind the page (it's that film the video walks through).
export const hasVideo = (base: EditableInvitation) =>
    base.invitation.design.film?.behind === true &&
    base.invitation.design.film.frames !== undefined;

export function ShareVideo({ base }: Props) {
    const preview = useMemo(() => draftToPreview(toDraft(base), base), [base]);
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Share video">
                    <Clapperboard />
                    {/* Phones keep the bar's title readable: the icon alone, its name said aloud. */}
                    <span className="hidden sm:inline">Share video</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <InviteProvider data={preview} tier="full">
                    <FilmVideo base={base} />
                </InviteProvider>
            </DialogContent>
        </Dialog>
    );
}

function FilmVideo({ base }: Props) {
    const { data, copy, t, dir, occasion } = useInvite();
    const facts = useCoverFacts();
    const design = data.invitation.design;
    const film = design.film;
    const scenes = useMemo(() => (film ? timelineOf(film) : []), [film]);
    const seconds = Math.round(videoSeconds(scenes));
    const slug = base.invitation.slug;
    const link = `${window.location.host}/${slug}`;

    const make = (onProgress: (share: number) => void, signal: AbortSignal) => {
        const text: VideoText = {
            kicker: occasion.id === 'wedding' ? copy('theWeddingOf') : copy('saveTheDate'),
            one: facts.one,
            and: facts.and,
            two: facts.two,
            date: facts.dateText,
            venue: data.events[0]?.venue ?? '',
            invite: copy('openInvitation'),
            link,
            credit: copy('madeWith'),
            namesAt: film?.namesAt ?? 0,
            words: (film?.moments ?? []).map((m) => ({
                text: t(m.text),
                from: m.from,
                to: m.to,
                zone: m.zone,
                style: m.style ?? 'line',
            })),
            layers: film?.layers ?? [],
            dir,
        };
        const fonts = {
            display: fontStack(design.fonts.display),
            script: fontStack(design.fonts.script ?? design.fonts.display),
            body: fontStack(design.fonts.body),
        };
        return makeFilmVideo(scenes, text, fonts, onProgress, signal);
    };

    return (
        <VideoMaker
            title="Your invitation as a video"
            description={`Your film with your names and date, about ${String(seconds)} seconds long, to send on WhatsApp or post as a status. It’s made right here on your device, so keep this window open while it’s made.`}
            fileName={`${slug}-invitation.mp4`}
            shareText={`${window.location.protocol}//${link}`}
            make={make}
        />
    );
}
