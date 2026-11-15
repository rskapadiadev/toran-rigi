// One player for every kind of background music, so the music button, the first-tap start and the
// autoplay rules treat a studio track, an uploaded song and generated music the same way.
import type { MusicStyle } from '@shared/music';

export interface MusicPlayer {
    play(): Promise<void>;
    pause(): void;
    readonly playing: boolean;
    /** Called whenever playing starts or stops; returns an unsubscribe. */
    subscribe(fn: () => void): () => void;
    dispose(): void;
}

interface FilePlan {
    kind: 'file';
    src: string;
}

interface GeneratedPlan {
    kind: 'generated';
    style: MusicStyle;
    seed: number;
}

/** What the invitation should play, worked out from its saved settings. */
export type MusicPlan = FilePlan | GeneratedPlan | null;

export function filePlayer(src: string): MusicPlayer {
    const audio = new Audio();
    audio.src = src;
    audio.loop = true;
    audio.preload = 'none';
    const listeners = new Set<() => void>();
    const notify = () => {
        for (const fn of listeners) fn();
    };
    audio.addEventListener('play', notify);
    audio.addEventListener('pause', notify);
    return {
        play: () => audio.play(),
        pause: () => {
            audio.pause();
        },
        get playing() {
            return !audio.paused;
        },
        subscribe: (fn) => {
            listeners.add(fn);
            return () => {
                listeners.delete(fn);
            };
        },
        dispose: () => {
            audio.pause();
            audio.removeAttribute('src');
            listeners.clear();
        },
    };
}

/** Builds the right player in the browser; generated music loads its engine only when needed. */
export async function createPlayer(plan: NonNullable<MusicPlan>): Promise<MusicPlayer> {
    if (plan.kind === 'file') return onlyWhileVisible(filePlayer(plan.src));
    const { generatedPlayer } = await import('./generated');
    return onlyWhileVisible(generatedPlayer(plan.style, plan.seed));
}

/**
 * Music plays only while its tab is on screen, on the invitation and in the admin alike: switching
 * tabs, minimising or locking the phone pauses it, and coming back resumes it — but only if it was
 * the tab that paused it. Music the guest paused themselves stays paused.
 */
export function onlyWhileVisible(player: MusicPlayer): MusicPlayer {
    if (typeof document === 'undefined') return player;
    let pausedByTab = false;
    const onChange = () => {
        if (document.hidden) {
            if (player.playing) {
                pausedByTab = true;
                player.pause();
            }
        } else if (pausedByTab) {
            pausedByTab = false;
            void player.play().catch(() => undefined);
        }
    };
    document.addEventListener('visibilitychange', onChange);
    // Leaving the page (or the browser putting it in the back-forward cache) stops it too.
    window.addEventListener('pagehide', onChange);
    return {
        play: () => {
            pausedByTab = false;
            // A tab opened in the background never starts music until it is looked at.
            if (document.hidden) {
                pausedByTab = true;
                return Promise.resolve();
            }
            return player.play();
        },
        pause: () => {
            pausedByTab = false;
            player.pause();
        },
        get playing() {
            return player.playing;
        },
        subscribe: (fn) => player.subscribe(fn),
        dispose: () => {
            document.removeEventListener('visibilitychange', onChange);
            window.removeEventListener('pagehide', onChange);
            player.dispose();
        },
    };
}
