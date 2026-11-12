// Display names for whoever an invitation is about, tolerant of rows saved before `couple` became `people`.
import { pickText } from './cultures';
import type { InvitationContent } from './types';

type People = InvitationContent['people'];

export function peopleOf(content: InvitationContent): People {
    const legacy = (content as { couple?: People }).couple;
    return (content as { people?: People }).people ?? legacy ?? { one: { name: {} } };
}

export function namesOf(content: InvitationContent, locale: string) {
    const people = peopleOf(content);
    return {
        one: pickText(people.one.name, locale),
        two: pickText(people.two?.name, locale),
    };
}

// "Riya & Kabir", or just "Aanya" when the occasion is about one person.
export function titleOf(content: InvitationContent, locale: string, joiner = '&'): string {
    const { one, two } = namesOf(content, locale);
    return two ? `${one} ${joiner} ${two}` : one;
}
