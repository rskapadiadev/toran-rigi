import { eventLabel, pickText } from '@shared/cultures';
import { namesOf } from '@shared/people';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { boardByToken } from '../../server/repos/boards';
import { cardSource } from '../../server/repos/invitations';

// One mood board for our own browser to photograph: opened only by the board's private token.
export const fetchBoardShot = createServerFn({ method: 'GET' })
    .validator(z.object({ token: z.string().min(16).max(64) }))
    .handler(async ({ data }) => {
        const board = await boardByToken(data.token);
        if (!board) return null;
        const source = await cardSource({ id: board.invitationId });
        const event = source?.full.events.find((e) => e.id === board.eventId);
        if (!source || !event) return null;
        const { invitation } = source.full;
        const lang = invitation.locales[0] ?? 'en';
        const names = namesOf(invitation.content, lang);
        return {
            token: data.token,
            board: board.data,
            culture: invitation.culture,
            names: [names.one, names.two].filter(Boolean).join(' & '),
            title: pickText(event.title, lang) || eventLabel(invitation.culture, event.kind, lang),
            startsAt: event.startsAt,
            venue: event.venue,
            dressCode: event.dressCode,
        };
    });
