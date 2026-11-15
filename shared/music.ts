// Background music for an invitation: a licensed studio track, the customer's own song, or music
// generated in the browser from the invitation's seed. Shared by the Composer, the API and the player.
import type { CultureId } from './cultures';

export const musicSources = ['none', 'library', 'upload', 'generated'] as const;
export type MusicSource = (typeof musicSources)[number];

export const musicStyles = ['shehnai', 'santoor', 'bells', 'piano', 'oud', 'ambient'] as const;
export type MusicStyle = (typeof musicStyles)[number];

export interface MusicStyleInfo {
    label: string;
    hint: string;
    /** Traditions it suits first; the Composer lists these at the top. */
    suits: CultureId[];
    /** Quiet enough for remembrance and prayer occasions. */
    gentle: boolean;
}

export const musicStyleInfo: Record<MusicStyle, MusicStyleInfo> = {
    shehnai: {
        label: 'Shehnai',
        hint: 'A reed melody over a tanpura drone, in Raag Yaman',
        suits: ['hindu', 'jain', 'sikh'],
        gentle: false,
    },
    santoor: {
        label: 'Santoor',
        hint: 'Hammered-string ripples in Raag Bhupali',
        suits: ['hindu', 'jain', 'sikh', 'universal'],
        gentle: true,
    },
    bells: {
        label: 'Temple bells',
        hint: 'Soft bells and a drone, for puja and katha',
        suits: ['hindu', 'jain'],
        gentle: true,
    },
    piano: {
        label: 'Soft piano',
        hint: 'Gentle piano over a warm pad',
        suits: ['christian', 'jewish', 'universal'],
        gentle: true,
    },
    oud: {
        label: 'Oud',
        hint: 'A plucked melody in maqam Hijaz',
        suits: ['islamic'],
        gentle: false,
    },
    ambient: {
        label: 'Remembrance',
        hint: 'A slow, peaceful pad with distant bells',
        suits: ['hindu', 'jain', 'sikh', 'christian', 'jewish', 'islamic', 'universal'],
        gentle: true,
    },
};

/** Audio the studio library and custom uploads accept, and the largest file. */
export const musicMimes = [
    'audio/mpeg',
    'audio/mp4',
    'audio/aac',
    'audio/ogg',
    'audio/wav',
    'audio/x-wav',
    'audio/webm',
] as const;
export const MUSIC_MAX_BYTES = 15 * 1024 * 1024;

export const musicExtension = (mime: string): string =>
    ({
        'audio/mpeg': 'mp3',
        'audio/mp4': 'm4a',
        'audio/aac': 'aac',
        'audio/ogg': 'ogg',
        'audio/wav': 'wav',
        'audio/x-wav': 'wav',
        'audio/webm': 'webm',
    })[mime] ?? 'bin';

/** Where each kind of music file lives; the /media route serves only `public/…`. */
export const libraryMusicKey = (id: string, mime: string) =>
    `public/music/library/${id}.${musicExtension(mime)}`;
export const uploadMusicPrefix = (invitationId: string) => `public/music/uploads/${invitationId}/`;
