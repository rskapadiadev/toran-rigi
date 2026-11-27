// AI pre-wedding portraits: the couple's own photos and a scene go to the image model, and one
// picture comes back. The one place customer photos leave us (CLAUDE.md rule 6): only their photos
// and the scene's words are sent, never a name, email or anything else, and nothing is kept here.
import {
    PORTRAIT_SIZE,
    portraitPrompt,
    type PortraitProvider,
    type PortraitScene,
    providerInfo,
} from '@shared/portraits';

import { getPlatform } from '../platform/context';

export class PortraitError extends Error {}

export interface ReferencePhoto {
    mime: string;
    bytes: Uint8Array;
}

export interface Portrait {
    bytes: Uint8Array;
    mime: string;
    ms: number;
}

// Generic client name only, as for every outside call.
const USER_AGENT = 'ToranInvitations/1.0 (+portraits)';

export const portraitsConfigured = (): Record<PortraitProvider, boolean> => {
    const { config } = getPlatform();
    return {
        flux: Boolean(config.CLOUDFLARE_ACCOUNT_ID && config.CLOUDFLARE_AI_TOKEN),
        gemini: Boolean(config.GEMINI_API_KEY),
    };
};

const fromBase64 = (data: string) => Uint8Array.from(atob(data), (c) => c.charCodeAt(0));

const toBase64 = (bytes: Uint8Array) => {
    let out = '';
    for (let i = 0; i < bytes.length; i += 0x8000)
        out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(out);
};

async function failure(res: Response, who: string): Promise<never> {
    const text = await res.text().catch(() => '');
    console.error(`[portraits] ${who} ${String(res.status)}`, text.slice(0, 500));
    if (res.status === 429)
        throw new PortraitError('The photo model is busy — try again in a minute');
    throw new PortraitError(`The photo model didn’t make this one (${String(res.status)})`);
}

interface FluxAnswer {
    result?: { image?: string } | string;
    success?: boolean;
}

async function viaFlux(prompt: string, photos: readonly ReferencePhoto[]): Promise<Uint8Array> {
    const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_AI_TOKEN: token } = getPlatform().config;
    if (!account || !token) throw new PortraitError('Cloudflare AI isn’t set up on this server');
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('width', String(PORTRAIT_SIZE.width));
    form.append('height', String(PORTRAIT_SIZE.height));
    form.append('steps', '28');
    photos.slice(0, 4).forEach((p, i) => {
        form.append(
            `input_image_${String(i)}`,
            new Blob([new Uint8Array(p.bytes)], { type: p.mime }),
        );
    });
    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/ai/run/${providerInfo.flux.model}`,
        {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'user-agent': USER_AGENT,
            },
            body: form,
        },
    );
    if (!res.ok) return failure(res, 'flux');
    const answer: FluxAnswer = await res.json();
    const image = typeof answer.result === 'string' ? answer.result : answer.result?.image;
    if (!image) throw new PortraitError('The photo model sent nothing back');
    return fromBase64(image);
}

interface GeminiBlock {
    type?: string;
    data?: string;
    mime_type?: string;
}

interface GeminiStep {
    type?: string;
    content?: GeminiBlock[];
}

interface GeminiAnswer {
    steps?: GeminiStep[];
    output_image?: GeminiBlock;
}

async function viaGemini(prompt: string, photos: readonly ReferencePhoto[]): Promise<Uint8Array> {
    const key = getPlatform().config.GEMINI_API_KEY;
    if (!key) throw new PortraitError('Gemini isn’t set up on this server');
    const body = {
        model: providerInfo.gemini.model,
        input: [
            {
                type: 'text',
                text: prompt,
            },
            ...photos.slice(0, 4).map((p) => ({
                type: 'image',
                mime_type: p.mime,
                data: toBase64(p.bytes),
            })),
        ],
        response_format: {
            type: 'image',
            aspect_ratio: '4:5',
            image_size: '2K',
            mime_type: 'image/jpeg',
        },
    };
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: {
            'x-goog-api-key': key,
            'content-type': 'application/json',
            'user-agent': USER_AGENT,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) return failure(res, 'gemini');
    const answer: GeminiAnswer = await res.json();
    const blocks = (answer.steps ?? [])
        .filter((s) => s.type === 'model_output')
        .flatMap((s) => s.content ?? [])
        .filter((b) => b.type === 'image' && b.data);
    const image = blocks.at(-1)?.data ?? answer.output_image?.data;
    if (!image) throw new PortraitError('The photo model sent nothing back');
    return fromBase64(image);
}

export async function makePortrait(
    provider: PortraitProvider,
    scene: PortraitScene,
    photos: readonly ReferencePhoto[],
): Promise<Portrait> {
    if (photos.length === 0) throw new PortraitError('Add a photo of each of you');
    const prompt = portraitPrompt(scene);
    const started = Date.now();
    const bytes =
        provider === 'flux' ? await viaFlux(prompt, photos) : await viaGemini(prompt, photos);
    // The first bytes say what came back: JPEG starts FF D8, PNG 89 50.
    const mime = bytes[0] === 0xff && bytes[1] === 0xd8 ? 'image/jpeg' : 'image/png';
    return {
        bytes,
        mime,
        ms: Date.now() - started,
    };
}
