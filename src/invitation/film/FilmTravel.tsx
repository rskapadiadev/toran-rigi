// An empty stretch of page between two chapters: scrolling through it moves the film from one moment
// to the next while the screen shows only the film.
import { travelScreens } from '@shared/film';
import { useEffect, useRef } from 'react';

import { useFilmStage } from './FilmStage';

interface TravelProps {
    from: number;
    to: number;
    veil: number;
    order: number;
}

export function FilmTravel({ from, to, veil, order }: TravelProps) {
    const stage = useFilmStage();
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!stage || !el) return;
        return stage.register({
            el,
            from,
            to,
            veil,
            order,
        });
    }, [stage, from, to, veil, order]);
    // One screen for the last chapter's words to leave, plus the film's own travel.
    const screens = String(1 + travelScreens(to - from));
    const tall = { height: `calc(var(--inv-screen, 100svh) * ${screens})` };
    // Its film times, so the studio's film editor can turn a second into a scroll position.
    return (
        <div
            ref={ref}
            aria-hidden
            style={tall}
            data-film-travel
            data-film-from={from}
            data-film-to={to}
        />
    );
}
