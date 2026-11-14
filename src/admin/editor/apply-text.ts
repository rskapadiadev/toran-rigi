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
