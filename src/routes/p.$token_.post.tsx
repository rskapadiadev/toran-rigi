import { gridSizes, postFaces, postLooks, postSize } from '@shared/posts';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { z } from 'zod';

import { PostView } from '../invitation/cards/PostView';
import { fetchPost } from '../server-fns/invitations';

// One post on its own, at its own size: what the server photographs. Behind the private preview
// token like the cards.
export const Route = createFileRoute('/p/$token_/post')({
    validateSearch: z.object({
        face: z.enum(postFaces).catch('count'),
        look: z.enum(postLooks).optional(),
        day: z.coerce.number().int().min(0).max(400).optional(),
        lang: z.string().max(5).optional(),
        who: z.enum(['one', 'two']).optional(),
        event: z.string().max(64).optional(),
        tiles: z.coerce
            .number()
            .pipe(z.union(gridSizes.map((n) => z.literal(n))))
            .optional(),
    }),
    loaderDeps: ({ search: { who } }) => ({ who }),
    loader: async ({ params, deps }) => {
        const post = await fetchPost({
            data: {
                token: params.token,
                ...deps,
            },
        });
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's notFound() idiom
        if (!post) throw notFound();
        return post;
    },
    head: () => ({
        meta: [
            { title: 'Post · Toran' },
            {
                name: 'robots',
                content: 'noindex, nofollow',
            },
        ],
    }),
    component: PostPage,
});

function PostPage() {
    const data = Route.useLoaderData();
    const { face, look, day, lang, event, tiles } = Route.useSearch();
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
        <div ref={root} style={postSize(face, tiles)}>
            <PostView
                data={data}
                face={face}
                locale={lang}
                look={look}
                day={day}
                eventId={event}
                tiles={tiles}
            />
        </div>
    );
}
