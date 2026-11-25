// What the server says about an invitation's cards (server/api/cards.ts).
import type { CardInfo } from '@shared/cards';
import type { Side } from '@shared/guests';
import { useQuery } from '@tanstack/react-query';

import type { PublicInvitationData, PublicInvitationEvent } from '@/invitation/types';
import { api } from '@/lib/api';

export interface CardsVersion {
    who: Side | null;
    lang: string;
}

export interface CardsSet {
    version: CardsVersion;
    // Files can be downloaded (the invitation is paid for).
    ready: boolean;
    names: {
        one: string;
        two: string;
    };
    locales: string[];
    cards: CardInfo[];
    data: PublicInvitationData;
    functions: {
        id: string;
        // Only some guests are invited to it.
        private: boolean;
        data?: PublicInvitationEvent;
    }[];
    link: string;
}

export interface CardsChoice {
    who: Side | null;
    lang?: string;
}

export function cardsQuery({ who, lang }: CardsChoice): string {
    const query = new URLSearchParams({
        ...(who && { who }),
        ...(lang && { lang }),
    }).toString();
    return query ? `?${query}` : '';
}

// `base` is the invitation's API root: the couple's (/store/me/…) or the studio's (/admin/…).
export const useCards = (base: string, choice: CardsChoice) =>
    useQuery({
        queryKey: ['cards', base, choice],
        queryFn: () => api<CardsSet>(`${base}/cards${cardsQuery(choice)}`),
        // Switching family or language keeps the last set on screen until the next arrives.
        placeholderData: (previous: CardsSet | undefined) => previous,
    });

export async function fetchFile(path: string, signal?: AbortSignal): Promise<Response> {
    const res = await fetch(`/api${path}`, {
        credentials: 'same-origin',
        signal,
    });
    if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'That couldn’t be made just now');
    }
    return res;
}

// Saves a file the server makes, under the name it gives; the first one takes a few seconds.
export async function saveFile(path: string): Promise<void> {
    const res = await fetchFile(path);
    const named = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') ?? '');
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = named?.[1] ?? 'toran-card';
    a.click();
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 30_000);
}
