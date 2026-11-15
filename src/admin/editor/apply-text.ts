import type { LocalizedText } from '@shared/types';

import type { TextPath } from '../../invitation/editing';
import type { Draft } from '../composer/draft';

const put = (text: LocalizedText | undefined, locale: string, value: string): LocalizedText => ({
    ...(text ?? {}),
    [locale]: value,
});

// Writes text typed on the canvas back into the draft, in the language being edited.
export function applyText(d: Draft, path: TextPath, value: string, locale: string): Draft {
    const c = d.content;
    switch (path) {
        case 'headline':
        case 'welcome':
        case 'closing':
            return {
                ...d,
                content: {
                    ...c,
                    [path]: put(c[path], locale, value),
                },
            };
        case 'story':
        case 'family':
            return {
                ...d,
                content: {
                    ...c,
                    [path]: put(c[path], locale, value),
                },
            };
        case 'people.one.name':
        case 'people.two.name': {
            const slot = path === 'people.one.name' ? 'one' : 'two';
            const person = c.people[slot] ?? { name: {} };
            return {
                ...d,
                content: {
                    ...c,
                    people: {
                        ...c.people,
                        [slot]: {
                            ...person,
                            name: put(person.name, locale, value),
                        },
                    },
                },
            };
        }
    }
    const [, index, field] = path.split('.');
    const i = Number(index);
    return {
        ...d,
        events: d.events.map((e, k) => {
            if (k !== i) return e;
            if (field === 'title')
                return {
                    ...e,
                    title: put(e.title, locale, value),
                };
            if (field === 'venue')
                return {
                    ...e,
                    venue: value,
                };
            return {
                ...e,
                address: value,
            };
        }),
    };
}

// The same path in the draft's own terms, as auto-translate and content.handWritten key it.
export const draftPath = (path: TextPath): string =>
    path.startsWith('events.') ? path : `content.${path}`;

// Venue and address are one plain string for every language.
export const isLocalized = (path: TextPath) => !/\.(venue|address)$/.test(path);

// A text's value: every language of it, or the single shared string for venue/address.
export function readText(d: Draft, path: TextPath): LocalizedText | string | undefined {
    const c = d.content;
    switch (path) {
        case 'headline':
        case 'welcome':
        case 'closing':
        case 'story':
        case 'family':
            return c[path];
        case 'people.one.name':
            return c.people.one.name;
        case 'people.two.name':
            return c.people.two?.name;
    }
    const [, index, field] = path.split('.');
    const event = d.events[Number(index)];
    if (!event) return undefined;
    if (field === 'title') return event.title;
    if (field === 'venue') return event.venue;
    return event.address ?? '';
}
