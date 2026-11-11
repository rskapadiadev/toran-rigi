import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => undefined;

// true only after hydration; avoids SSR/client mismatches without setState-in-effect.
export const useHydrated = () =>
    useSyncExternalStore(
        noopSubscribe,
        () => true,
        () => false,
    );

function tickingStore(intervalMs: number) {
    let now = Date.now();
    return {
        subscribe: (notify: () => void) => {
            const id = window.setInterval(() => {
                now = Date.now();
                notify();
            }, intervalMs);
            return () => {
                window.clearInterval(id);
            };
        },
        snapshot: () => now,
    };
}

const stores = new Map<number, ReturnType<typeof tickingStore>>();

// Current time that re-renders every `intervalMs`; null during SSR so markup stays deterministic.
export function useNow(intervalMs = 1000): number | null {
    let store = stores.get(intervalMs);
    if (!store) {
        store = tickingStore(intervalMs);
        stores.set(intervalMs, store);
    }
    return useSyncExternalStore(store.subscribe, store.snapshot, () => null);
}

const guestZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const useGuestTimeZone = (): string | null =>
    useSyncExternalStore(noopSubscribe, guestZone, () => null);

export const formString = (form: FormData, key: string): string => {
    const value = form.get(key);
    return typeof value === 'string' ? value.trim() : '';
};
