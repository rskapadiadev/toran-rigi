import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { getPlatform } from '../../server/platform/context';
import { findGuest } from '../../server/repos/guests';
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
        const invitation = await getPublishedInvitation(data.slug);
        if (!invitation) return null;
        const guest = await findGuest(invitation.invitation.id, data.guestToken);
        return {
            invitation,
            origin: shareOrigin(),
            guest: guest
                ? {
                      name: guest.displayName,
                      token: guest.token,
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
