// Audition music in the admin: one preview plays at a time, and starting another stops the last.
import { Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { createPlayer, type MusicPlan, type MusicPlayer } from '@/invitation/music/player';

export function usePreview() {
    const [playing, setPlaying] = useState<string | null>(null);
    const current = useRef<{ key: string;
player: MusicPlayer } | null>(null);

    const stop = useCallback(() => {
        current.current?.player.dispose();
        current.current = null;
        setPlaying(null);
    }, []);

    useEffect(() => stop, [stop]);

    const toggle = useCallback(
        async (key: string, plan: NonNullable<MusicPlan>) => {
            const same = current.current?.key === key;
            stop();
            if (same) return;
            const player = await createPlayer(plan);
            current.current = {
 key,
player 
};
            setPlaying(key);
            await player.play().catch(() => {
                stop();
            });
        },
        [stop],
    );

    return {
 playing,
toggle,
stop 
};
}

export function PreviewButton({
    on,
    onClick,
    label,
}: {
    on: boolean;
    onClick: () => void;
    label: string;
}) {
    return (
        <Button
            type="button"
            variant={on ? 'default' : 'outline'}
            size="icon"
            aria-label={`${on ? 'Stop' : 'Play'} ${label}`}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            {on ? <Pause /> : <Play />}
        </Button>
    );
}
