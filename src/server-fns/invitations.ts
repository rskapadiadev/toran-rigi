import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { findGuest } from '../../server/repos/guests';
import {
    getInvitationByPreviewToken,
    getPublishedInvitation,
    listDemoInvitations,
} from '../../server/repos/invitations';

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
    .handler(({ data }) => getInvitationByPreviewToken(data.token));

export const fetchDemos = createServerFn({ method: 'GET' }).handler(() => listDemoInvitations());
