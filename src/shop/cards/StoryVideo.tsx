import { storyEffect } from '@shared/cards';
import { isDark } from '@shared/materials';
import { occasionOf } from '@shared/occasions';
import { Clapperboard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { VideoMaker } from '@/shop/VideoMaker';

import { type CardsSet, fetchFile } from './model';

interface StoryVideoProps {
    base: string;
    set: CardsSet;
    // The family and language, as the cards' address has them.
    query: string;
    disabled: boolean;
    buttonClass: string;
}

// The story, moving: made here from the same picture and words as the still.
export function StoryVideo({ base, set, query, disabled, buttonClass }: StoryVideoProps) {
    const { invitation } = set.data;
    const { palette } = invitation.design;
    const make = async (onProgress: (share: number) => void, signal: AbortSignal) => {
        const layer = async (id: string) =>
            (await fetchFile(`${base}/cards/${id}${query}`, signal)).blob();
        // One after the other: the second then finds the first's browser free.
        const art = await layer('story.art');
        const words = await layer('story.words');
        const { makeStoryVideo } = await import('@/invitation/cards/storyVideo');
        return makeStoryVideo(
            {
                art,
                words,
                bg: palette.bg,
                effect: storyEffect({
                    culture: invitation.culture,
                    tone: occasionOf(invitation.eventKind).tone,
                    dark: isDark(palette.bg),
                }),
            },
            onProgress,
            signal,
        );
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={cn('shrink-0', buttonClass)}
                    aria-label="Make the story a video"
                    disabled={disabled}
                >
                    <Clapperboard />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <VideoMaker
                    title="Your story as a video"
                    description="Seven seconds for Instagram stories and WhatsApp status. It’s made right here on your device, so keep this window open while it’s made."
                    fileName={`${invitation.slug}-story${set.version.who ? `-family-${set.version.who === 'one' ? '1' : '2'}` : ''}${set.locales.length > 1 ? `-${set.version.lang}` : ''}.mp4`}
                    make={make}
                />
            </DialogContent>
        </Dialog>
    );
}
