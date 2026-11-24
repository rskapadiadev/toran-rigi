import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { api } from '@/lib/api';

import type { GuestList } from './model';

// `base` is the guest list's API root: the couple's (/store/me/…) or the studio's (/admin/…).
export const guestListKey = (base: string) => ['guest-list', base];

export const useGuestList = (base: string) =>
    useQuery({
        queryKey: guestListKey(base),
        queryFn: () => api<GuestList>(base),
    });

type Method = 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface GuestCall {
    path: string;
    method: Method;
    body?: unknown;
}

// Every change: call, say so, then reload the list so counts and statuses stay true.
export function useGuestAction(base: string) {
    const client = useQueryClient();
    return useCallback(
        async (call: GuestCall, done?: string) => {
            try {
                await api(`${base}${call.path}`, {
                    method: call.method,
                    body: call.body === undefined ? undefined : JSON.stringify(call.body),
                });
                if (done) toast.success(done);
                await client.invalidateQueries({ queryKey: guestListKey(base) });
                return true;
            } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Something went wrong');
                return false;
            }
        },
        [base, client],
    );
}

export async function copyText(text: string, done = 'Link copied') {
    await navigator.clipboard.writeText(text).then(
        () => toast.success(done),
        () => toast.error('Couldn’t copy. Press and hold the link to copy it'),
    );
}
