// Film openings: a short upright clip the studio uploads, with stills of its first and last frames.
export const filmMimes = ['video/mp4', 'video/webm'] as const;
export type FilmMime = (typeof filmMimes)[number];

// A 9:16 clip of about 9 s encodes well under this; it stops raw exports, which stall on 4G.
export const FILM_MAX_BYTES = 12 * 1024 * 1024;
// Stills are drawn from the clip in the browser, no wider than this.
export const FILM_STILL_MAX_WIDTH = 1080;

// Under public/ so the /media route serves them, beside the invitation's photos.
export const filmPrefix = (invitationId: string) => `public/invitations/${invitationId}/films/`;

export const filmExtension = (mime: FilmMime) => (mime === 'video/webm' ? 'webm' : 'mp4');
