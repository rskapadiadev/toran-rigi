import { openingSheets } from '@shared/film';
import { inviteLink } from '@shared/guests';
import { photoUrl } from '@shared/photos';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { type LinkHTMLAttributes, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { InvitationView } from '../invitation/InvitationView';
import { applyTrial, PreviewBar, type Trial } from '../invitation/PreviewBar';
import { shareMeta } from '../lib/share-meta';
import { fetchInvitation } from '../server-fns/invitations';

const search = z.object({
    lang: z.string().max(5).optional(),
    g: z.string().max(64).optional(),
    // Set by the shop's template cards, which show the page in a small frame with no try bar.
    embed: z.coerce.string().max(4).optional(),
    // The still edition the PDF is rendered from (see server/services/pdf.ts).
    print: z.coerce.string().max(4).optional(),
});

export const Route = createFileRoute('/$slug')({
    validateSearch: search,
    loaderDeps: ({ search: { g } }) => ({ g }),
    loader: async ({ params, deps }) => {
        const result = await fetchInvitation({
            data: {
                slug: params.slug,
                guestToken: deps.g,
            },
        });
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's notFound() idiom
        if (!result) throw notFound();
        return result;
    },
    head: ({ loaderData, params, match }) => {
        if (!loaderData) return {};
        const { invitation, origin, guest, link } = loaderData;
        const g = link ? `&g=${encodeURIComponent(link)}` : '';
        // A film behind the invitation: the opening's frames start downloading with the page, not
        // after its code (the stage's fetch() picks these same requests up; the poster is already
        // preloaded with the page).
        const film = invitation.invitation.design.film;
        const frames = film?.behind && match.search.print === undefined ? film.frames : undefined;
        const links: LinkHTMLAttributes<HTMLLinkElement>[] = [];
        if (frames)
            for (const sheet of openingSheets(frames, film?.namesAt ?? 0))
                links.push({
                    rel: 'preload',
                    as: 'fetch',
                    href: photoUrl(sheet),
                    crossOrigin: 'anonymous',
                    // After the page's code and fonts, which a slow line would otherwise starve.
                    fetchPriority: 'low',
                });
        return {
            links,
            meta: shareMeta({
                source: invitation,
                origin,
                path: `/${params.slug}`,
                image: `/og/${params.slug}.png?v=${String(invitation.invitation.version)}${g}`,
                guestName: guest?.name,
                lang: match.search.lang,
            }),
        };
    },
    component: InvitationPage,
});

function InvitationPage() {
    const { invitation, guest, origin, link } = Route.useLoaderData();
    const { lang, embed, print } = Route.useSearch();
    // The PDF's QR code opens the same link the PDF was made from.
    const printUrl =
        print === undefined ? undefined : inviteLink(origin, invitation.invitation.slug, link);
    // Demos are template previews: visitors can try their own names and start an order.
    const [trial, setTrial] = useState<Trial | null>(null);
    const data = useMemo(() => applyTrial(invitation, trial), [invitation, trial]);
    const slug = invitation.invitation.slug;
    const token = guest?.token;
    // The couple sees who has opened their link; the PDF's own render doesn't count.
    useEffect(() => {
        if (!token || print !== undefined) return;
        const body = JSON.stringify({ token });
        void fetch(`/api/i/${slug}/opened`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body,
            keepalive: true,
        }).catch(() => undefined);
    }, [slug, token, print]);
    return (
        <>
            <InvitationView data={data} initialLocale={lang} guest={guest} print={printUrl} />
            {invitation.invitation.isDemo && embed === undefined && print === undefined && (
                <PreviewBar data={invitation} trial={trial} onTrial={setTrial} />
            )}
        </>
    );
}
