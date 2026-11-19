// The couple's invitation as a short video to send on WhatsApp or post as a status: their film with
// their names, its words and an end card with their link. It's made on their own device.
import { timelineOf } from '@shared/film';
import { fontStack } from '@shared/fonts';
import { Clapperboard, Download, Loader2, Share2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { EditableInvitation } from '@/admin/composer/draft';
import { draftToPreview, toDraft } from '@/admin/composer/draft';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { InviteProvider, useInvite } from '@/invitation/context';
import { canMakeVideo, makeFilmVideo, videoSeconds, type VideoText } from '@/invitation/film/video';
import { useCoverFacts } from '@/invitation/sections/covers';

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
                    <VideoMaker base={base} />
                </InviteProvider>
            </DialogContent>
        </Dialog>
    );
}

interface Ready {
    step: 'ready';
}
interface Making {
    step: 'making';
    share: number;
}
interface Done {
    step: 'done';
    url: string;
    file: File;
}
interface Failed {
    step: 'failed';
    message: string;
}
type State = Ready | Making | Done | Failed;

function VideoMaker({ base }: Props) {
    const { data, copy, t, locale, dir, occasion } = useInvite();
    const facts = useCoverFacts();
    const design = data.invitation.design;
    const film = design.film;
    const scenes = useMemo(() => (film ? timelineOf(film) : []), [film]);
    const seconds = Math.round(videoSeconds(scenes));
    const [state, setState] = useState<State>({ step: 'ready' });
    const stop = useRef<AbortController | null>(null);
    const slug = base.invitation.slug;
    const link = `${window.location.host}/${slug}`;

    // Let go of the video file, and stop making one, when the window closes.
    const done = state.step === 'done' ? state.url : null;
    useEffect(
        () => () => {
            if (done) URL.revokeObjectURL(done);
        },
        [done],
    );
    useEffect(
        () => () => {
            stop.current?.abort();
        },
        [],
    );

    const make = async () => {
        const controller = new AbortController();
        stop.current = controller;
        setState({
            step: 'making',
            share: 0,
        });
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
        try {
            const blob = await makeFilmVideo(
                scenes,
                text,
                fonts,
                (share) => {
                    setState({
                        step: 'making',
                        share,
                    });
                },
                controller.signal,
            );
            const file = new File([blob], `${slug}-invitation.mp4`, { type: 'video/mp4' });
            setState({
                step: 'done',
                url: URL.createObjectURL(blob),
                file,
            });
        } catch (e) {
            if (controller.signal.aborted) return;
            setState({
                step: 'failed',
                message: e instanceof Error ? e.message : 'Something went wrong',
            });
        }
    };

    const share = async (file: File) => {
        try {
            await navigator.share({
                files: [file],
                text: `${window.location.protocol}//${link}`,
            });
        } catch (e) {
            if (!(e instanceof DOMException && e.name === 'AbortError'))
                toast.error('Sharing didn’t work here. Download the video instead.');
        }
    };
    const download = (url: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}-invitation.mp4`;
        a.click();
    };

    const supported = canMakeVideo();
    return (
        <div className="space-y-4" lang={locale}>
            <DialogHeader>
                <DialogTitle>Your invitation as a video</DialogTitle>
                <DialogDescription>
                    Your film with your names and date, about {String(seconds)} seconds long, to
                    send on WhatsApp or post as a status. It’s made right here on your device, so
                    keep this window open while it’s made.
                </DialogDescription>
            </DialogHeader>
            {!supported && (
                <p className="text-sm text-muted-foreground">
                    This browser can’t make videos yet. Try the latest Chrome, or Safari on an
                    iPhone with iOS 17 or newer.
                </p>
            )}
            {supported && state.step === 'ready' && (
                <div className="flex justify-center">
                    <Button
                        onClick={() => {
                            void make();
                        }}
                    >
                        <Clapperboard /> Make my video
                    </Button>
                </div>
            )}
            {state.step === 'making' && (
                <div className="space-y-2" data-video-progress>
                    <Progress value={Math.round(state.share * 100)} />
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Making your video… {String(Math.round(state.share * 100))}%
                    </p>
                </div>
            )}
            {state.step === 'done' && (
                <div className="space-y-3">
                    <video
                        src={state.url}
                        controls
                        playsInline
                        muted
                        loop
                        className="mx-auto aspect-[9/16] h-80 rounded-md bg-black"
                        data-video-result
                    />
                    <div className="flex justify-center gap-2">
                        {typeof navigator.canShare === 'function' &&
                            navigator.canShare({ files: [state.file] }) && (
                                <Button
                                    onClick={() => {
                                        void share(state.file);
                                    }}
                                >
                                    <Share2 /> Share
                                </Button>
                            )}
                        <Button
                            variant="outline"
                            onClick={() => {
                                download(state.url);
                            }}
                        >
                            <Download /> Download
                        </Button>
                    </div>
                </div>
            )}
            {state.step === 'failed' && (
                <div className="space-y-3 text-center">
                    <p className="text-sm text-destructive">{state.message}</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            void make();
                        }}
                    >
                        Try again
                    </Button>
                </div>
            )}
        </div>
    );
}
