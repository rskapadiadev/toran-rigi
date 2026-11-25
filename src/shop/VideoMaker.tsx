// Makes a video on this device, shows how far along it is, then plays it, shares it or saves it.
import { Clapperboard, Download, Loader2, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { canMakeVideo } from '@/invitation/film/encode';

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

interface VideoMakerProps {
    title: string;
    description: string;
    fileName: string;
    // Sent along with the video when it is shared.
    shareText?: string;
    make: (onProgress: (share: number) => void, signal: AbortSignal) => Promise<Blob>;
}

export function VideoMaker({ title, description, fileName, shareText, make }: VideoMakerProps) {
    const [state, setState] = useState<State>({ step: 'ready' });
    const stop = useRef<AbortController | null>(null);

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

    const start = async () => {
        const controller = new AbortController();
        stop.current = controller;
        const progress = (share: number) => {
            setState({
                step: 'making',
                share,
            });
        };
        progress(0);
        try {
            const blob = await make(progress, controller.signal);
            const file = new File([blob], fileName, { type: 'video/mp4' });
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
                ...(shareText && { text: shareText }),
            });
        } catch (e) {
            if (!(e instanceof DOMException && e.name === 'AbortError'))
                toast.error('Sharing didn’t work here. Download the video instead.');
        }
    };
    const download = (url: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
    };

    const supported = canMakeVideo();
    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
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
                            void start();
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
                            void start();
                        }}
                    >
                        Try again
                    </Button>
                </div>
            )}
        </div>
    );
}
