// What a shared invitation link says about itself: the preview title, description and the facts
// printed on its preview card. Pure, so the page <head> and the server-rendered image never disagree.
import { type CultureId, cultureOf, pickText } from './cultures';
import { greetingFits, isCouple, isSolemn, occasionOf } from './occasions';
import { peopleOf } from './people';
import { zonedToUtc } from './time';
import type { InvitationContent, InvitationDesign, LocalizedText, Palette } from './types';

export interface ShareEvent {
    startsAt: string;
    timezone: string;
    venue: string;
    address: string | null;
}

export interface ShareSource {
    invitation: {
        culture: string;
        eventKind: string;
        locales: string[];
        seed: number;
        version: number;
        content: InvitationContent;
        design: InvitationDesign;
    };
    events: ShareEvent[];
}

export interface CardFacts {
    culture: CultureId;
    palette: Palette;
    displayFont: string;
    ornament: InvitationDesign['generative']['kind'];
    seed: number;
    solemn: boolean;
    greeting: string;
    label: string;
    honorific: string;
    one: string;
    two: string;
    joiner: string;
    lifeSpan: string;
    date: string;
    place: string;
    guest: string;
}

export interface ShareFacts {
    title: string;
    description: string;
    imageAlt: string;
    card: CardFacts;
}

// Scripts the preview card has fonts for (Latin, Devanagari, Gujarati). Anything else falls back to English.
const CARD_SAFE =
    /^[\p{Script=Latin}\p{Script=Devanagari}\p{Script=Gujarati}\p{N}\p{P}\p{Zs}\p{S}̀-ͯ‌‍]*$/u;

const titleCase = (s: string) =>
    s.replace(/(^|\s)(\p{Ll})/gu, (_, gap: string, c: string) => gap + c.toUpperCase());

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const year = (iso?: string) => iso?.slice(0, 4) ?? '';

function cardText(text: LocalizedText | undefined, locale: string): string {
    const preferred = pickText(text, locale);
    if (CARD_SAFE.test(preferred)) return preferred;
    const english = pickText(text, 'en');
    if (english && CARD_SAFE.test(english)) return english;
    return Object.values(text ?? {}).find((v) => CARD_SAFE.test(v)) ?? '';
}

const dayParts = (date: Date, timeZone: string) => {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return {
        weekday: get('weekday'),
        day: get('day'),
        month: get('month'),
        year: get('year'),
    };
};

// "Saturday, 14 February 2027", "21 – 23 January 2027" or "30 January – 2 February 2027".
export function dateSpan(events: ShareSource['events']): string {
    const first = events[0];
    const last = events.at(-1);
    if (!first || !last) return '';
    const a = dayParts(zonedToUtc(first.startsAt, first.timezone), first.timezone);
    const b = dayParts(zonedToUtc(last.startsAt, last.timezone), last.timezone);
    if (a.day === b.day && a.month === b.month && a.year === b.year)
        return `${a.weekday}, ${a.day} ${a.month} ${a.year}`;
    if (a.month === b.month && a.year === b.year) return `${a.day} – ${b.day} ${a.month} ${a.year}`;
    if (a.year === b.year) return `${a.day} ${a.month} – ${b.day} ${b.month} ${b.year}`;
    return `${a.day} ${a.month} ${a.year} – ${b.day} ${b.month} ${b.year}`;
}

// Cities, from the last part of each address ("Lal Darwaja, Ahmedabad" → "Ahmedabad"); at most two.
export function placeLine(events: ShareSource['events']): string {
    const cities = events
        .map((e) => (e.address ?? '').split(',').at(-1)?.trim() ?? '')
        .filter(Boolean);
    const unique = [...new Set(cities)];
    if (unique.length) return unique.slice(0, 2).join(' · ');
    return events[0]?.venue ?? '';
}

export function shareFacts(source: ShareSource, guestName?: string, lang?: string): ShareFacts {
    const { invitation, events } = source;
    const locale =
        lang && invitation.locales.includes(lang) ? lang : (invitation.locales[0] ?? 'en');
    const occasion = occasionOf(invitation.eventKind);
    const culture = cultureOf(invitation.culture);
    const content = invitation.content;
    const people = peopleOf(content);
    const solemn = isSolemn(occasion);
    const couple = isCouple(occasion) || Boolean(people.two);

    const one = cardText(people.one.name, locale);
    const two = couple ? cardText(people.two?.name, locale) : '';
    const occasionName = pickText(occasion.name, 'en');
    const greeting = culture.greetings.find((g) => g.key === content.greetingKey);
    const span = [year(people.one.born), year(people.one.passed)].filter(Boolean);
    const honorific = cardText(people.one.honorific, locale);

    // Meta text stays in the invitation's first language; the card falls back where it lacks fonts.
    const metaOne = pickText(people.one.name, locale);
    const metaTwo = couple ? pickText(people.two?.name, locale) : '';
    const names = metaTwo ? `${metaOne} & ${metaTwo}` : metaOne;
    const date = dateSpan(events);
    const place = placeLine(events);
    const headline = pickText(content.headline, locale);

    let title: string;
    if (solemn)
        title = `In loving memory of ${[pickText(people.one.honorific, locale), metaOne].filter(Boolean).join(' ')}`;
    else if (guestName) title = `${guestName}, you’re invited · ${names}`;
    else if (occasion.id === 'other') title = names;
    else title = `${names} · ${titleCase(occasionName)} Invitation`;

    // Headlines like "welcome you to our new home" continue the names on the invitation; do the same here.
    // A lone honouree only leads when the verb is theirs ("is turning ONE!"), not the parents' ("invite you…").
    const hostsSpeak =
        !metaTwo &&
        !/family$/i.test(metaOne) &&
        /^(invite|request|welcome|cordially|joyfully|together|are)\b/i.test(headline);
    const continues = /^\p{Ll}/u.test(headline);
    let sentence = headline;
    if (continues && !hostsSpeak) sentence = `${names} ${headline}`;
    else if (continues) sentence = capitalise(headline.replace(/^invite you\b/i, 'you’re invited'));
    const description = [solemn ? occasionName : sentence, date, place].filter(Boolean).join(' · ');

    const label = solemn
        ? 'In loving memory'
        : invitation.eventKind === 'wedding' && two
          ? 'The wedding of'
          : occasionName;

    return {
        title,
        description,
        imageAlt: `${occasionName} invitation for ${names}${date ? `, ${date}` : ''}`,
        card: {
            culture: culture.id,
            palette: invitation.design.palette,
            displayFont: invitation.design.fonts.display,
            ornament: invitation.design.generative.kind,
            seed: invitation.seed,
            solemn,
            greeting:
                greeting && greetingFits(greeting, occasion) ? cardText(greeting.text, locale) : '',
            label,
            honorific,
            one,
            two,
            joiner: '&',
            lifeSpan: span.length === 2 ? span.join(' – ') : '',
            date,
            place,
            guest: guestName && CARD_SAFE.test(guestName) ? guestName : '',
        },
    };
}
