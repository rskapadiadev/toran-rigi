import { BRIEF_FILE_MAX_BYTES, type BriefFileMime, isBriefFileMime } from '@shared/made';

interface Sent {
    name: string;
    mime: BriefFileMime;
    bytes: ArrayBuffer;
}

// Some browsers don't know an iPhone photo's type; its name does.
const byName: Record<string, BriefFileMime> = {
    heic: 'image/heic',
    heif: 'image/heif',
    m4a: 'audio/x-m4a',
};

// Checks one uploaded file; a sentence when it can't be taken.
export async function briefUpload(file: unknown): Promise<Sent | string> {
    if (!(file instanceof File)) return 'Choose a file';
    const extension = file.name.split('.').at(-1)?.toLowerCase() ?? '';
    const mime = file.type || (byName[extension] ?? '');
    if (!isBriefFileMime(mime)) return 'Send photos, PDFs or songs (JPG, PNG, HEIC, PDF, MP3, M4A)';
    if (file.size === 0) return 'That file is empty';
    if (file.size > BRIEF_FILE_MAX_BYTES) return 'Keep each file under 20 MB';
    return {
        name: file.name.replace(/[^\p{L}\p{N}\p{M} ._()-]/gu, '_').slice(0, 120) || 'file',
        mime,
        bytes: await file.arrayBuffer(),
    };
}

interface Stored {
    name: string;
    mime: string;
    body: ReadableStream;
}

// Always as a download and never guessed at, so nothing a customer sent can run as a page here.
export const briefDownload = ({ name, mime, body }: Stored) =>
    new Response(body, {
        headers: {
            'content-type': mime,
            'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
            'x-content-type-options': 'nosniff',
            'cache-control': 'private, max-age=3600',
        },
    });
