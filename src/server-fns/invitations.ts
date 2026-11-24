import { forViewer } from '@shared/families';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { getPlatform } from '../../server/platform/context';
import { resolveLink } from '../../server/repos/guests';
import {
    getInvitationByPreviewToken,
    getPublishedInvitation,
    listDemoInvitations,
} from '../../server/repos/invitations';

// Absolute origin for share previews: crawlers need full URLs in og:url and og:image.
const shareOrigin = () => getPlatform().config.APP_ORIGIN;

export const fetchInvitation = createServerFn({ method: 'GET' })
    .validator(
        z.object({
            slug: z.string().min(1).max(80),
            guestToken: z.string().max(64).optional(),
        }),
    )
    .handler(async ({ data }) => {
        const cached = await getPublishedInvitation(data.slug);
        if (!cached) return null;
        const { guest, viewer } = await resolveLink(cached.invitation.id, data.guestToken);
        // Each link shows its own functions and family version; the rest never leaves the server.
        const invitation = forViewer(cached, viewer);
        return {
            invitation,
            origin: shareOrigin(),
            // Any working link's token (a family's, a group's or a side's), for its preview image.
            link: viewer ? data.guestToken : undefined,
            guest: guest
                ? {
                      name: guest.displayName,
                      token: guest.token,
                      max: guest.maxGuests ?? undefined,
                  }
                : undefined,
        };
    });

export const fetchPreview = createServerFn({ method: 'GET' })
    .validator(z.object({ token: z.string().min(10).max(64) }))
    .handler(async ({ data }) => {
        const invitation = await getInvitationByPreviewToken(data.token);
        return invitation
            ? {
                  invitation,
                  origin: shareOrigin(),
              }
            : null;
    });

export const fetchDemos = createServerFn({ method: 'GET' }).handler(() => listDemoInvitations());
