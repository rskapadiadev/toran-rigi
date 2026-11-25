// The recordings shipped with the app (public/music), one or more for every design. All are CC0 or
// CC BY, checked at their source: trimmed and played in a sold product, so never NC, ND or SA.

export interface ShippedTrack {
    id: string;
    title: string;
    artist: string;
    culture: string | null;
    blobKey: string;
    license: string;
    licenseUrl: string;
    sourceUrl: string;
    durationSec: number;
}

const track = (slug: string, info: Omit<ShippedTrack, 'id' | 'blobKey'>): ShippedTrack => ({
    id: `trk_${slug}`,
    blobKey: `/music/${slug}.m4a`,
    ...info,
});

const BY3 = 'https://creativecommons.org/licenses/by/3.0/';
const BY4 = 'https://creativecommons.org/licenses/by/4.0/';
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';

export const shippedTracks: ShippedTrack[] = [
    track('veena-and-shenai', {
        title: 'Veena and Shenai',
        artist: 'Antti Luode',
        culture: 'hindu',
        license: 'CC BY 3.0',
        licenseUrl: BY3,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=84702103',
        durationSec: 100,
    }),
    track('tablas-and-sitars', {
        title: 'Tablas and Sitars',
        artist: 'Antti Luode',
        culture: 'hindu',
        license: 'CC BY 3.0',
        licenseUrl: BY3,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=84701047',
        durationSec: 100,
    }),
    track('veena-and-sitar', {
        title: 'Veena and Sitar',
        artist: 'Antti Luode',
        culture: 'hindu',
        license: 'CC BY 3.0',
        licenseUrl: BY3,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=84703461',
        durationSec: 66,
    }),
    track('indian-flute', {
        title: 'Indian Flute',
        artist: 'Antti Luode',
        culture: 'hindu',
        license: 'CC BY 3.0',
        licenseUrl: BY3,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=84703374',
        durationSec: 79,
    }),
    track('bamboo-flute-3', {
        title: 'Bamboo Flute 03',
        artist: 'Ananth Pattabi',
        culture: 'hindu',
        license: 'CC BY 4.0',
        licenseUrl: BY4,
        sourceUrl: 'https://freesound.org/people/ananth-pattabi/sounds/44336',
        durationSec: 65,
    }),
    track('bamboo-flute-4', {
        title: 'Bamboo Flute 04',
        artist: 'Ananth Pattabi',
        culture: 'hindu',
        license: 'CC BY 4.0',
        licenseUrl: BY4,
        sourceUrl: 'https://freesound.org/people/ananth-pattabi/sounds/44337',
        durationSec: 98,
    }),
    track('ibn-al-noor', {
        title: 'Ibn Al-Noor',
        artist: 'Kevin MacLeod',
        culture: 'islamic',
        license: 'CC BY 3.0',
        licenseUrl: BY3,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=64740127',
        durationSec: 108,
    }),
    track('desert-city', {
        title: 'Desert City',
        artist: 'Kevin MacLeod',
        culture: 'islamic',
        license: 'CC BY 3.0',
        licenseUrl: BY3,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=64743987',
        durationSec: 88,
    }),
    track('canon-in-d', {
        title: 'Canon in D Major',
        artist: 'Kevin MacLeod',
        culture: 'christian',
        license: 'CC BY 3.0',
        licenseUrl: BY3,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=64751542',
        durationSec: 105,
    }),
    track('hope', {
        title: 'Hope',
        artist: 'Yakov Golman',
        culture: null,
        license: 'CC BY 4.0',
        licenseUrl: BY4,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=89129238',
        durationSec: 107,
    }),
    track('air', {
        title: 'Air',
        artist: 'Yakov Golman',
        culture: null,
        license: 'CC BY 4.0',
        licenseUrl: BY4,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=89129277',
        durationSec: 103,
    }),
    track('joy', {
        title: 'Joy',
        artist: 'Yakov Golman',
        culture: null,
        license: 'CC BY 4.0',
        licenseUrl: BY4,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=89129405',
        durationSec: 101,
    }),
    track('valse-orchestral', {
        title: 'Valse orchestral',
        artist: 'Yakov Golman',
        culture: null,
        license: 'CC BY 4.0',
        licenseUrl: BY4,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=89129544',
        durationSec: 103,
    }),
    track('sunrise', {
        title: 'Sunrise',
        artist: 'Yakov Golman',
        culture: null,
        license: 'CC BY 4.0',
        licenseUrl: BY4,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=89129675',
        durationSec: 101,
    }),
    track('celebration', {
        title: 'Celebration',
        artist: 'Yakov Golman',
        culture: null,
        license: 'CC BY 4.0',
        licenseUrl: BY4,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=89129386',
        durationSec: 101,
    }),
    track('childhood-scene', {
        title: 'Childhood scene',
        artist: 'Komiku',
        culture: null,
        license: 'CC0',
        licenseUrl: CC0,
        sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=90265052',
        durationSec: 110,
    }),
    track('music-box-lullaby', {
        title: 'Music box lullaby',
        artist: 'csnmedia',
        culture: null,
        license: 'CC0',
        licenseUrl: CC0,
        sourceUrl: 'https://freesound.org/people/csnmedia/sounds/381973',
        durationSec: 84,
    }),
    track('sad-music', {
        title: 'Sad Music',
        artist: 'Migfus20',
        culture: null,
        license: 'CC BY 4.0',
        licenseUrl: BY4,
        sourceUrl: 'https://freesound.org/people/Migfus20/sounds/559834',
        durationSec: 89,
    }),
];

// Which recording each design opens with, by its slug.
const designTracks: Record<string, string> = {
    rajwada: 'veena-and-shenai',
    heera: 'veena-and-shenai',
    roshni: 'veena-and-shenai',
    'haveli-walk': 'veena-and-shenai',
    bandhani: 'tablas-and-sitars',
    phulkari: 'tablas-and-sitars',
    zari: 'tablas-and-sitars',
    mehfil: 'tablas-and-sitars',
    'palace-walk': 'veena-and-sitar',
    gulmohar: 'veena-and-sitar',
    deepmala: 'veena-and-sitar',
    deepam: 'veena-and-sitar',
    phoolwari: 'indian-flute',
    sitara: 'indian-flute',
    'deepmala-yatra': 'indian-flute',
    griha: 'indian-flute',
    aarti: 'bamboo-flute-3',
    'himalaya-walk': 'bamboo-flute-3',
    kamal: 'bamboo-flute-3',
    mangal: 'bamboo-flute-3',
    shanti: 'bamboo-flute-4',
    deepanjali: 'bamboo-flute-4',
    noor: 'ibn-al-noor',
    mashrabiya: 'desert-city',
    'cathedral-garden': 'canon-in-d',
    chuppah: 'hope',
    resham: 'hope',
    editorial: 'air',
    kagaz: 'air',
    'garden-walk': 'joy',
    patra: 'valse-orchestral',
    legacy: 'valse-orchestral',
    sona: 'sunrise',
    summit: 'sunrise',
    utsav: 'celebration',
    palna: 'childhood-scene',
    chandni: 'music-box-lullaby',
    smriti: 'sad-music',
};

export const trackForDesign = (slug: string): ShippedTrack | undefined =>
    shippedTracks.find((t) => t.id === `trk_${designTracks[slug] ?? ''}`);
