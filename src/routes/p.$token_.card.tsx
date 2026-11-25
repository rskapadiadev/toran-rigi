import { cardFaces, cardLayers, faceSize } from '@shared/cards';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { z } from 'zod';

import { CardView } from '../invitation/cards/CardView';
import { fetchCard } from '../server-fns/invitations';

// One card on its own, at its own size: what the server photographs. Behind the private preview
// token, because a function's card may be for a few guests only.
export const Route = createFileRoute('/p/$token_/card')({
    validateSearch: z.object({
        face: z.enum(cardFaces).catch('save'),
        lang: z.string().max(5).optional(),
        who: z.enum(['one', 'two']).optional(),
        event: z.string().max(64).optional(),
        layer: z.enum(cardLayers).optional(),
    }),
    loaderDeps: ({ search: { who, event } }) => ({
        who,
        event,
    }),
    loader: async ({ params, deps }) => {
        const card = await fetchCard({
            data: {
                token: params.token,
                ...deps,
            },
        });
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's notFound() idiom
        if (!card) throw notFound();
        return card;
    },
    head: () => ({
        meta: [
            { title: 'Card · Toran' },
            {
                name: 'robots',
                content: 'noindex, nofollow',
            },
        ],
    }),
    component: CardPage,
});

function CardPage() {
    const { data, link } = Route.useLoaderData();
    const { face, lang, event, layer } = Route.useSearch();
    const root = useRef<HTMLDivElement>(null);
    // Says so once every letter and picture is in, and the words have been fitted.
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
    return (
        <div ref={root} style={faceSize[face]}>
            {layer === 'words' && (
                <style>{'html, body { background: transparent !important; }'}</style>
            )}
            <CardView
                data={data}
                face={face}
                locale={lang}
                eventId={event}
                link={link}
                layer={layer}
            />
        </div>
    );
}
