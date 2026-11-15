// Auto-translation of invitation text with Cloudflare Workers AI (m2m100), called over the REST API
// so it behaves the same in local dev and on Workers. Free plan: a daily allowance, no card, no bill.
// Each (text, from, to) is cached for a month, so retyping or reopening never spends it twice.
import type { TranslateItem, TranslateResult } from '@shared/schemas/translate';

import { sha256 } from '../lib/crypto';
import { getPlatform } from '../platform/context';

export class TranslateError extends Error {}

const MONTH = 60 * 60 * 24 * 30;
const MODEL = '@cf/meta/m2m100-1.2b';
// One text per call; a few in flight at once keeps a whole invitation quick without hammering the API.
const PARALLEL = 4;

interface WorkersAiResponse {
    success?: boolean;
    result?: { translated_text?: string };
    errors?: { code?: number;
message?: string }[];
}

export const translationConfigured = () => {
    const { config } = getPlatform();
    return Boolean(config.CLOUDFLARE_ACCOUNT_ID && config.CLOUDFLARE_AI_TOKEN);
};

const OFF = 'Auto-translate is off: add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_TOKEN';

const cacheKey = async (from: string, to: string, text: string) =>
    `tr:cf:${await sha256(JSON.stringify([from, to, text]))}`;

async function workersAiTranslate(text: string, from: string, to: string): Promise<string> {
    const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_AI_TOKEN: token } = getPlatform().config;
    if (!account || !token) throw new TranslateError(OFF);
    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/ai/run/${MODEL}`,
        {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                text,
                source_lang: from,
                target_lang: to,
            }),
        },
    );
    const body = (await res.json().catch(() => ({}))) as WorkersAiResponse;
    if (!res.ok || body.success === false) {
        const message = body.errors?.map((e) => e.message).join('; ') ?? '';
        console.error('[translate] workers-ai', res.status, message);
        if (res.status === 401 || res.status === 403)
            throw new TranslateError(
                'Cloudflare refused the request: check the account ID and that the token has Workers AI access',
            );
        if (res.status === 429 || /neuron|limit|quota/i.test(message))
            throw new TranslateError(
                'Today’s free translation allowance is used up; it resets daily (00:00 UTC)',
            );
        throw new Error(`Workers AI ${String(res.status)}`);
    }
    return (body.result?.translated_text ?? '').trim();
}

// Runs tasks with at most `limit` in flight, keeping their order.
async function pool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
    const out: T[] = [];
    let next = 0;
    const worker = async () => {
        while (next < tasks.length) {
            const i = next++;
            const task = tasks[i];
            if (task) out[i] = await task();
        }
    };
    await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
    return out;
}

export async function translate(items: TranslateItem[]): Promise<TranslateResult[]> {
    if (!translationConfigured()) throw new TranslateError(OFF);
    const { cache } = getPlatform();
    const results = new Map<string, Record<string, string>>();
    const tasks: (() => Promise<void>)[] = [];

    for (const item of items) {
        const done: Record<string, string> = {};
        results.set(item.id, done);
        // Clearing a line clears its translations too.
        if (!item.text.trim()) {
            for (const to of item.to) done[to] = '';
            continue;
        }
        for (const to of item.to) {
            tasks.push(async () => {
                const key = await cacheKey(item.from, to, item.text);
                const hit = await cache.get<string>(key);
                if (hit !== null) {
                    done[to] = hit;
                    return;
                }
                const text = await workersAiTranslate(item.text, item.from, to);
                if (!text) return;
                done[to] = text;
                await cache.set(key, text, MONTH);
            });
        }
    }

    await pool(tasks, PARALLEL);
    return [...results].map(([id, translations]) => ({
        id,
        translations,
    }));
}
