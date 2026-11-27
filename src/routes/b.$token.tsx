import { BOARD_SIZE } from '@shared/board';
import { photoUrl } from '@shared/photos';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { fetchBoardShot } from '../server-fns/boards';
import { BoardView } from '../shop/board/BoardView';

// A mood board on its own, at its own size: what our browser photographs. Behind the board's own
// private token, which no one is ever shown.
export const Route = createFileRoute('/b/$token')({
    loader: async ({ params }) => {
        const shot = await fetchBoardShot({ data: { token: params.token } });
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's notFound() idiom
        if (!shot) throw notFound();
        return shot;
    },
    head: () => ({
        meta: [
            { title: 'Mood board · Toran' },
            {
                name: 'robots',
                content: 'noindex, nofollow',
            },
        ],
    }),
    component: BoardShot,
});

function BoardShot() {
    const shot = Route.useLoaderData();
    const root = useRef<HTMLDivElement>(null);
    // Says so once every letter and picture is in.
    useEffect(() => {
        const el = root.current;
        if (!el) return;
        let live = true;
        const pictures = Array.from(el.querySelectorAll('img')).map((img) =>
            img.decode().catch(() => undefined),
        );
        void Promise.all([document.fonts.ready, ...pictures]).then(() => {
            window.setTimeout(() => {
                if (live) el.setAttribute('data-card-ready', '');
            }, 250);
        });
        return () => {
            live = false;
        };
    }, []);
    const pinSrc = (key: string) =>
        key.startsWith('public/')
            ? photoUrl(key)
            : `/api/board-shots/${shot.token}/pin?key=${encodeURIComponent(key)}`;
    return (
        <div ref={root} style={BOARD_SIZE}>
            <BoardView {...shot} pinSrc={pinSrc} />
        </div>
    );
}
