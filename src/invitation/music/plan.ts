// What an invitation plays: generated music from its seed, or the stored file the server resolved.
import { cultureOf } from '@shared/cultures';
import { musicUrl } from '@shared/music';
import { occasionOf } from '@shared/occasions';

import type { MusicCredit, PublicInvitationData } from '../types';
import type { MusicPlan } from './player';

type Invitation = PublicInvitationData['invitation'];

export function musicPlan(invitation: Invitation): MusicPlan {
    const music = invitation.extras.music;
    if (music?.source === 'generated' && music.style)
        return {
            kind: 'generated',
            style: music.style,
            seed: invitation.seed,
        };
    if (music?.source === 'none') return null;
    return invitation.musicBlobKey
        ? {
              kind: 'file',
              src: musicUrl(invitation.musicBlobKey),
          }
        : null;
}

// Music may start by itself only where the tradition and the occasion allow it.
export const musicStartsItself = (invitation: Invitation) =>
    cultureOf(invitation.culture).sensitivity.musicDefault === 'on' &&
    occasionOf(invitation.eventKind).motion.music !== 'off';

// "♪ Sunset Raga – Nimisha Shankar, CC BY 4.0", where the licence asks for it.
export const soundCredit = (credit: MusicCredit | null | undefined): string =>
    credit
        ? `♪ ${[credit.title, credit.artist].filter(Boolean).join(' – ')}${credit.license ? `, ${credit.license}` : ''}`
        : '';
