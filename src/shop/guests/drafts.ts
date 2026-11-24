// The guest list's editing state, shared by the couple's Guests page and the studio's.
import {
    countsOf,
    EVERYONE,
    inviteLink,
    inviteMessage,
    type Side,
    whatsappLink,
} from '@shared/guests';
import { useState } from 'react';

import { useGuestAction } from './actions';
import {
    type FamilyReplySettings,
    type GuestList,
    inviteWords,
    type ListEvent,
    type ListGuest,
    type ListReply,
    reminderWords,
    type ReplySettings,
} from './model';

const keysOf = (audience: string[] | null | undefined) =>
    audience && audience.length > 0 ? audience : [EVERYONE];

const sameKeys = (a: string[], b: string[]) => [...a].sort().join() === [...b].sort().join();

export function useAudienceDraft(list: GuestList, base: string) {
    const act = useGuestAction(base);
    const [picked, setPicked] = useState<Record<string, string[]>>(() =>
        Object.fromEntries(list.events.map((e) => [e.id, keysOf(e.audience)])),
    );
    const [busy, setBusy] = useState(false);
    const changed = list.events.filter((e) => !sameKeys(keysOf(e.audience), keysOf(picked[e.id])));

    // Everyone stands alone; picking a family or a group narrows the function to them.
    const toggle = (eventId: string, key: string) => {
        setPicked((all) => {
            const now = keysOf(all[eventId]);
            let next: string[];
            if (key === EVERYONE) next = [EVERYONE];
            else if (now.includes(key)) next = now.filter((k) => k !== key);
            else next = [...now.filter((k) => k !== EVERYONE), key];
            return {
                ...all,
                [eventId]: keysOf(next),
            };
        });
    };

    // Only what changed here is sent: someone else may have just narrowed another function.
    const save = async () => {
        setBusy(true);
        const audience = Object.fromEntries(
            changed.map((e) => [e.id, keysOf(picked[e.id]).filter((k) => k !== EVERYONE)]),
        );
        await act(
            {
                path: '/audience',
                method: 'PUT',
                body: { audience },
            },
            list.live ? 'Saved. Guests see it now' : 'Saved',
        );
        setBusy(false);
    };

    return {
        keys: (eventId: string) => keysOf(picked[eventId]),
        toggle,
        save,
        busy,
        dirty: changed.length > 0,
    };
}

export function useReplyDraft(list: GuestList, base: string) {
    const act = useGuestAction(base);
    const [form, setForm] = useState<ReplySettings>(list.replies);
    const [busy, setBusy] = useState(false);
    const set = (patch: Partial<ReplySettings>) => {
        setForm((f) => ({
            ...f,
            ...patch,
        }));
    };
    const setSide = (side: Side, own: FamilyReplySettings) => {
        set({
            sides: {
                ...form.sides,
                [side]: own,
            },
        });
    };
    const save = async () => {
        setBusy(true);
        await act(
            {
                path: '/replies',
                method: 'PUT',
                body: form,
            },
            'Saved',
        );
        setBusy(false);
    };
    return {
        form,
        set,
        setSide,
        save,
        busy,
        dirty: JSON.stringify(form) !== JSON.stringify(list.replies),
        // What the Sharma family would receive.
        example: inviteMessage(form.message || list.defaults.message, {
            name: 'Sharma family',
            link: `…/${list.slug}?g=…`,
        }),
    };
}

// Sent or opened but not answered: the same button asks again, in gentler words.
export const asksAgain = (list: GuestList, g: ListGuest) =>
    list.replies.enabled && g.rsvped === 0 && Boolean(g.sentAt ?? g.openedAt);

export function useSend(list: GuestList, base: string, origin: string) {
    const act = useGuestAction(base);
    return (g: ListGuest) => {
        const again = asksAgain(list, g);
        const words = inviteMessage(again ? reminderWords(list) : inviteWords(list), {
            name: g.displayName,
            link: inviteLink(origin, list.slug, g.token),
        });
        const text = g.note && !again ? `${g.note}\n\n${words}` : words;
        window.open(whatsappLink(g.phone, text), '_blank', 'noopener');
        void act({
            path: `/families/${g.id}/sent`,
            method: 'POST',
        });
    };
}

// "Mehndi 4 · Reception 2"; empty when they can't come.
export function answerOf(events: readonly ListEvent[], reply: ListReply): string {
    const per = countsOf(reply);
    return events
        .filter((e) => (per[e.id] ?? 0) > 0)
        .map((e) => `${e.title} ${String(per[e.id])}`)
        .join(' · ');
}

// Replies arrive newest first, so a family's first one is its answer now.
export function answersByFamily(list: GuestList): Map<string, ListReply> {
    const latest = new Map<string, ListReply>();
    for (const r of list.rsvps) if (r.guestId && !latest.has(r.guestId)) latest.set(r.guestId, r);
    return latest;
}
