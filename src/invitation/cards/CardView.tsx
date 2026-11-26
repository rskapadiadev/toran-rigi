// The matching cards: save-the-date, the invitation's front and back, one per function, and a story.
// Still pictures at a fixed size, shown on the Cards page and photographed by the server.
import { brand } from '@shared/brand';
import { BLEED, type CardFace, type CardLayer, faceSize, mainEvent } from '@shared/cards';
import { type CultureId, eventLabel, pickText } from '@shared/cultures';
import { mixHex } from '@shared/materials';
import { greetingFits, isSolemn } from '@shared/occasions';
import { photoUrl } from '@shared/photos';
import { propFor } from '@shared/props';
import { placeLine } from '@shared/share';
import { formatEventDate, formatEventTime, zonedToUtc } from '@shared/time';
import { type CSSProperties, useMemo } from 'react';
import { renderSVG } from 'uqr';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { InviteProvider, useInvite } from '../context';
import { DiyaRow, MarigoldRing, MarigoldToran } from '../luxury/darbar/art';
import { foilInk } from '../luxury/materials';
import { CeremonyProp } from '../props';
import { designStyle } from '../tokens';
import type { PublicInvitationData, PublicInvitationEvent } from '../types';
import { ArchFrame, Divider, Fit, Ground, MotifBand, RuledFrame, useTones } from './Frame';

interface CardViewProps {
    data: PublicInvitationData;
    face: CardFace;
    locale?: string;
    // The function an event card is for.
    eventId?: string;
    // Where the printed card's QR code leads.
    link?: string;
    // Only the story's picture, or only its words (for its video).
    layer?: CardLayer;
}

export function CardView({ data, face, locale, eventId, link, layer }: CardViewProps) {
    // Remounted per language: the provider reads its first language once.
    return (
        <InviteProvider key={locale} data={data} initialLocale={locale} tier="static">
            <Card face={face} eventId={eventId} link={link} layer={layer} />
        </InviteProvider>
    );
}

type CardProps = Pick<CardViewProps, 'face' | 'eventId' | 'link' | 'layer'>;

function Card({ face, eventId, link, layer }: CardProps) {
    const { data, dir, locale } = useInvite();
    const box = faceSize[face];
    const style: CSSProperties = {
        ...designStyle(data.invitation.design),
        width: box.width,
        height: box.height,
        // The words alone are photographed on nothing.
        ...(layer === 'words' && { background: 'transparent' }),
    };
    const event = data.events.find((e) => e.id === eventId);
    const darbar = useDarbar() && layer !== 'words';
    return (
        <div className="inv-root overflow-hidden" dir={dir} lang={locale} style={style} data-card>
            {face === 'save' && <SaveCard />}
            {face === 'story' && <StoryCard layer={layer} />}
            {face === 'front' && <FrontCard />}
            {face === 'back' && <BackCard link={link} />}
            {face === 'event' && event && <EventCard event={event} />}
            {darbar && face !== 'story' && <DarbarDress face={face} />}
            {layer !== 'art' && <StudioMark />}
        </div>
    );
}

// Every card carries the studio's name and number at its foot, inside the trim.
function StudioMark() {
    const tones = useTones();
    const mark: CSSProperties = {
        bottom: BLEED + 6,
        color: tones.goldInk,
    };
    return (
        <p
            className="pointer-events-none absolute inset-x-0 mx-auto w-fit rounded-full bg-black/60 px-3.5 py-1 text-center text-[12px] tracking-[0.08em]"
            style={mark}
            dir="ltr"
        >
            Digital invitations by <b>{brand.name}</b> · {brand.phone}
        </p>
    );
}

// ── Darbar ─────────────────────────────────────────────────────────────────

// Invitations on the darbar cover (a jagran's stage) dress their cards to match.
function useDarbar() {
    const { data } = useInvite();
    return data.invitation.sections.some((s) => s.type === 'cover' && s.variant === 'darbar');
}

interface DressProps {
    face: CardFace;
}

// The marigold toran across the top of every card and lit diyas along the foot of the plain ones,
// inside the trim so the printer never cuts them.
function DarbarDress({ face }: DressProps) {
    const box = faceSize[face];
    const toran: CSSProperties = {
        top: BLEED,
        height: 74,
    };
    const lamps: CSSProperties = {
        bottom: BLEED + 26,
        width: box.width * 0.62,
    };
    // The front's foot already carries its motif band.
    const footed = face === 'save' || face === 'back';
    return (
        <>
            <div className="pointer-events-none absolute inset-x-0" style={toran}>
                <MarigoldToran live={false} className="!h-full" />
            </div>
            {footed && (
                <div
                    className="pointer-events-none absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
                    style={lamps}
                >
                    <DiyaRow count={7} lit className="w-full" />
                </div>
            )}
        </>
    );
}

// The hosts' own photo of the deity in a marigold ring, at the head of the printed front.
function DarbarMedallion() {
    const { data } = useInvite();
    const key = data.invitation.content.coverPhotoKey;
    if (!key) return null;
    return (
        <div className="relative mb-2 size-[128px] shrink-0">
            <div className="absolute inset-[11%] overflow-hidden rounded-full ring-2 ring-(--inv-gold)">
                <img src={photoUrl(key)} alt="" className="size-full object-cover object-top" />
            </div>
            <MarigoldRing className="absolute inset-0 size-full" />
        </div>
    );
}

// ── Shared pieces ──────────────────────────────────────────────────────────

function useFoil(): CSSProperties {
    const { data } = useInvite();
    const tones = useTones();
    const { gold } = data.invitation.design.palette;
    if (tones.dark) return foilInk(gold);
    // On pale paper the foil's bright band would wipe letters out, so it stays in the deeper golds.
    const deep = mixHex(gold, '#3a2503', 0.62);
    return {
        ...foilInk(gold),
        backgroundImage: `linear-gradient(115deg, ${deep} 0%, ${tones.goldInk} 34%, ${mixHex(gold, '#3a2503', 0.26)} 52%, ${tones.goldInk} 66%, ${deep} 100%)`,
    };
}

// Long names are set smaller, so each stays on one line.
const nameSize = (name: string, width: number, largest: number) =>
    Math.min(largest, (width * 1.75) / Math.max(5, Array.from(name).length));

interface NamesProps {
    width: number;
    largest: number;
    parents?: boolean;
}

function Names({ width, largest, parents = false }: NamesProps) {
    const { names, data, t, copy } = useInvite();
    const foil = useFoil();
    const tones = useTones();
    const { people } = data.invitation.content;
    const size = Math.min(
        nameSize(names.one, width, largest),
        nameSize(names.two || names.one, width, largest),
    );
    const name = (text: string) => (
        <p
            className="inv-script px-2 leading-[1.15] whitespace-nowrap"
            style={{
                ...foil,
                fontSize: size,
            }}
        >
            {text}
        </p>
    );
    const line = (text: string) =>
        parents && text ? (
            <p
                className="mt-1 max-w-full text-[13px] leading-snug tracking-wide"
                style={{ color: tones.muted }}
            >
                {text}
            </p>
        ) : null;
    return (
        <>
            {names.honorific && (
                <p className="mb-1 text-[13px] tracking-[0.2em]" style={{ color: tones.goldInk }}>
                    {names.honorific}
                </p>
            )}
            {name(names.one)}
            {line(t(people.one.parents))}
            {names.two && (
                <>
                    <p
                        className="inv-display my-1 italic"
                        style={{
                            color: tones.goldInk,
                            fontSize: Math.max(18, size * 0.42),
                        }}
                    >
                        {copy('and')}
                    </p>
                    {name(names.two)}
                    {line(t(people.two?.parents))}
                </>
            )}
            {names.lifeSpan && (
                <p className="mt-2 text-[15px] tracking-[0.15em]" style={{ color: tones.muted }}>
                    {names.lifeSpan}
                </p>
            )}
        </>
    );
}

// The couple's own medallion, their initials at its heart.
function Crest({ size }: { size: number }) {
    const { data, names } = useInvite();
    const foil = useFoil();
    const { design, seed } = data.invitation;
    const frame: CSSProperties = {
        width: size,
        height: size,
    };
    return (
        <div className="relative" style={frame}>
            <GenerativeOrnament
                kind={design.generative.kind}
                seed={seed}
                draw={false}
                className={names.initials.length > 1 ? 'size-full opacity-55' : 'size-full'}
            />
            {names.initials.length > 1 && (
                <span
                    className="inv-display absolute inset-0 flex items-center justify-center font-semibold"
                    style={{
                        ...foil,
                        fontSize: size * 0.3,
                    }}
                    dir="auto"
                >
                    {names.initials.join(' ')}
                </span>
            )}
        </div>
    );
}

function Greeting() {
    const { data, culture, occasion, t, locale } = useInvite();
    const tones = useTones();
    const greeting = culture.greetings.find((g) => g.key === data.invitation.content.greetingKey);
    if (!greeting || !greetingFits(greeting, occasion)) return null;
    return (
        <p
            className="inv-display text-[17px] leading-snug"
            style={{ color: tones.goldInk }}
            lang={greeting.text[locale] ? locale : undefined}
        >
            {t(greeting.text)}
        </p>
    );
}

function useWhen(event: PublicInvitationEvent | undefined) {
    const { locale } = useInvite();
    if (!event)
        return {
            date: '',
            time: '',
        };
    const start = zonedToUtc(event.startsAt, event.timezone);
    const from = formatEventTime(start, event.timezone, locale);
    const to = event.endsAt
        ? formatEventTime(zonedToUtc(event.endsAt, event.timezone), event.timezone, locale)
        : '';
    return {
        date: formatEventDate(start, event.timezone, locale),
        time: to ? `${from} – ${to}` : from,
    };
}

function useTitle() {
    const { data, t, locale } = useInvite();
    return (event: PublicInvitationEvent) =>
        t(event.title) || eventLabel(data.invitation.culture, event.kind, locale);
}

// ── Save the date ──────────────────────────────────────────────────────────

function Announcement({ width, largest }: Pick<NamesProps, 'width' | 'largest'>) {
    const { data, copy } = useInvite();
    const tones = useTones();
    const main = mainEvent(data.events);
    const { date } = useWhen(main);
    const place = placeLine(data.events);
    return (
        <>
            <p className="inv-display mb-3 text-[21px] italic" style={{ color: tones.goldInk }}>
                {copy('saveTheDate')}
            </p>
            <Names width={width} largest={largest} />
            <div className="my-4">
                <Divider />
            </div>
            <p className="inv-display text-[23px] leading-snug">{date}</p>
            {place && (
                <p
                    className="mt-1.5 text-[15px] tracking-[0.22em] uppercase"
                    style={{ color: tones.muted }}
                >
                    {place}
                </p>
            )}
            <p className="mt-4 text-[15px] italic" style={{ color: tones.muted }}>
                {copy('invitationToFollow')}
            </p>
        </>
    );
}

function SaveCard() {
    const box = faceSize.save;
    return (
        <>
            <Ground {...box} />
            <RuledFrame {...box} inset={24} />
            <Fit className="inset-x-[64px] inset-y-[52px]">
                <Crest size={132} />
                <div className="mt-3 flex w-full flex-col items-center">
                    <Announcement width={400} largest={66} />
                </div>
            </Fit>
        </>
    );
}

// ── Story ──────────────────────────────────────────────────────────────────

function StoryCard({ layer }: Pick<CardProps, 'layer'>) {
    const { data } = useInvite();
    // Both layers are laid out in full, so each piece stays exactly where the still has it.
    const art = layer === 'words' ? 'invisible' : '';
    const words = layer === 'art' ? 'invisible' : '';
    const tones = useTones();
    const box = faceSize.story;
    const { content, design } = data.invitation;
    const picture =
        content.coverPhotoKey ?? design.film?.last ?? design.film?.first ?? design.art?.venue;
    if (!picture)
        return (
            <>
                <div className={`absolute inset-0 ${art}`}>
                    <Ground {...box} />
                    <ArchFrame {...box} left={58} top={96} right={482} />
                    <MotifBand {...box} y={box.height - 78} />
                </div>
                <Fit className={`inset-x-[92px] top-[250px] bottom-[150px] ${words}`}>
                    <Crest size={170} />
                    <div className="mt-6 flex w-full flex-col items-center">
                        <Announcement width={350} largest={62} />
                    </div>
                </Fit>
            </>
        );
    const fade = `linear-gradient(to bottom, transparent 62%, ${tones.bg} 98%)`;
    return (
        <>
            <div className={`absolute inset-0 ${art}`}>
                <Ground {...box} />
                <div className="absolute inset-x-0 top-0 h-[530px]">
                    <img
                        src={photoUrl(picture)}
                        alt=""
                        className="size-full object-cover object-[50%_42%]"
                    />
                    <div className="absolute inset-0" style={{ background: fade }} />
                </div>
            </div>
            {/* Instagram's own controls cover the top and foot of a story. */}
            <Fit className={`inset-x-[56px] top-[478px] bottom-[92px] ${words}`}>
                <Announcement width={428} largest={64} />
            </Fit>
        </>
    );
}

// ── One function ───────────────────────────────────────────────────────────

function Painting({ event }: { event: PublicInvitationEvent }) {
    const { data, culture } = useInvite();
    const painted = data.invitation.design.art?.pavilions?.[event.kind];
    if (painted)
        return <img src={photoUrl(painted)} alt="" className="h-[190px] w-auto object-contain" />;
    return <CeremonyProp kind={propFor(event.kind, culture.id)} className="h-[168px] w-auto" />;
}

function EventCard({ event }: { event: PublicInvitationEvent }) {
    const { data, t, locale, names, copy } = useInvite();
    const tones = useTones();
    const foil = useFoil();
    const title = useTitle()(event);
    const { date, time } = useWhen(event);
    const box = faceSize.event;
    // The name in the family's other language, the way elders say it.
    const other = data.invitation.locales.find((l) => l !== locale);
    const second = other
        ? pickText(
              Object.fromEntries(Object.entries(event.title).filter(([l]) => l === other)),
              other,
          ) || eventLabel(data.invitation.culture, event.kind, other)
        : '';
    const wear = event.dressCode;
    const words = wear ? t(wear.note) || t(wear.title) : '';
    return (
        <>
            <Ground {...box} />
            <RuledFrame {...box} inset={24} />
            <Fit className="inset-x-[60px] inset-y-[50px]">
                <Painting event={event} />
                <p
                    className="mt-5 text-[15px] tracking-[0.2em] uppercase"
                    style={{ color: tones.muted }}
                >
                    {date}
                </p>
                <p
                    className="inv-script mt-1 px-3 leading-[1.2] whitespace-nowrap"
                    style={{
                        ...foil,
                        fontSize: nameSize(title, 400, 72),
                    }}
                >
                    {title}
                </p>
                {second && second !== title && second !== event.kind && (
                    <p
                        className="inv-display text-[21px]"
                        lang={other}
                        style={{ color: tones.goldInk }}
                    >
                        {second}
                    </p>
                )}
                <p className="inv-display mt-3 text-[22px]">{time}</p>
                <p className="mt-0.5 text-[18px] italic">{event.venue}</p>
                {event.address && (
                    <p className="mt-0.5 text-[14px]" style={{ color: tones.muted }}>
                        {event.address}
                    </p>
                )}
                {wear && (words || wear.swatches.length > 0) && (
                    <div className="mt-3 flex max-w-full items-center justify-center gap-2.5">
                        <span className="flex shrink-0 gap-1">
                            {wear.swatches.slice(0, 3).map((c) => (
                                <span
                                    key={c}
                                    className="size-5 rounded-full border border-(--inv-gold)/70"
                                    style={{ background: c }}
                                />
                            ))}
                        </span>
                        <span className="text-start text-[15px] leading-snug italic">
                            {words || copy('dressCode')}
                        </span>
                    </div>
                )}
                <p className="inv-script mt-4 text-[26px]" style={{ color: tones.goldInk }}>
                    {names.title}
                </p>
            </Fit>
        </>
    );
}

// ── The invitation: front and back ─────────────────────────────────────────

// Where each tradition's archway is wide enough for words.
const archRoom: Record<CultureId, string> = {
    hindu: 'top-[168px]',
    jain: 'top-[168px]',
    islamic: 'top-[178px]',
    sikh: 'top-[196px]',
    christian: 'top-[150px]',
    jewish: 'top-[160px]',
    universal: 'top-[120px]',
};

function FrontCard() {
    const { data, t, culture, occasion } = useInvite();
    const darbar = useDarbar();
    const tones = useTones();
    const box = faceSize.front;
    const headline = t(data.invitation.content.headline);
    // "…invite you to celebrate their wedding" follows the names; a notice comes before its name.
    const leads = isSolemn(occasion);
    const line = headline && (
        <p
            className="my-2.5 max-w-[300px] text-[15.5px] leading-snug italic"
            style={{ color: tones.muted }}
        >
            {headline}
        </p>
    );
    const main = mainEvent(data.events);
    const { date, time } = useWhen(main);
    return (
        <>
            <Ground {...box} />
            <ArchFrame {...box} left={BLEED + 34} top={BLEED + 20} right={box.width - BLEED - 34} />
            <Fit className={`inset-x-[92px] bottom-[100px] ${archRoom[culture.id]}`}>
                {darbar && <DarbarMedallion />}
                <Greeting />
                <div className="h-3" />
                {leads && line}
                <Names width={300} largest={50} parents />
                {!leads && line}
                <div className="my-2">
                    <Divider width={150} />
                </div>
                <p className="inv-display text-[18px] leading-snug">{date}</p>
                <p className="text-[16px]">{time}</p>
                {main && (
                    <p className="mt-1.5 text-[15.5px] leading-snug italic">
                        {main.venue}
                        {main.address && (
                            <span className="block text-[13px]" style={{ color: tones.muted }}>
                                {main.address}
                            </span>
                        )}
                    </p>
                )}
            </Fit>
            <MotifBand {...box} y={box.height - BLEED - 62} />
        </>
    );
}

function BackCard({ link }: { link?: string }) {
    const { data, copy, names } = useInvite();
    const tones = useTones();
    const title = useTitle();
    const box = faceSize.back;
    // One or two functions have the whole card to themselves.
    const roomy = data.events.length < 3;
    const qr = useMemo(
        () =>
            link
                ? renderSVG(link, {
                      border: 1,
                      whiteColor: '#ffffff',
                      blackColor: '#1d1416',
                  })
                : '',
        [link],
    );
    return (
        <>
            <Ground {...box} />
            <RuledFrame {...box} inset={BLEED + 18} />
            <Fit className="inset-x-[72px] inset-y-[66px]">
                <p className="inv-script text-[38px]" style={{ color: tones.goldInk }}>
                    {copy('celebrations')}
                </p>
                <Divider width={140} />
                <div className="mt-3 w-full space-y-4" style={{ fontSize: roomy ? 18.5 : 15 }}>
                    {data.events.map((e) => (
                        <BackLine key={e.id} event={e} title={title(e)} />
                    ))}
                </div>
                <ArtistLine />
                <ContactLine />
                {qr && (
                    <div className="mt-6 flex items-center gap-4 text-start">
                        <div
                            className="size-[92px] shrink-0 overflow-hidden rounded-md bg-white p-1"
                            // Drawn here from the invitation's own link.
                            dangerouslySetInnerHTML={{ __html: qr }}
                        />
                        <div>
                            <p className="text-[15px] italic">{copy('openInvitation')}</p>
                            <p className="inv-display mt-0.5 text-[17px]">{names.title}</p>
                        </div>
                    </div>
                )}
            </Fit>
        </>
    );
}

// Tonight's singer, when the invitation introduces one (the story's "Singer spotlight").
function ArtistLine() {
    const { data, t, copy } = useInvite();
    const tones = useTones();
    const { content, sections } = data.invitation;
    const shown = sections.some((x) => x.type === 'story' && x.enabled && x.variant === 'artist');
    const [name = '', ...about] = t(content.story)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    if (!shown || !name) return null;
    const photo = content.photoSlots?.['story.artist'];
    return (
        <div className="mt-6 flex items-center gap-4 text-start">
            {photo && (
                <div className="relative size-[84px] shrink-0">
                    <div className="absolute inset-[11%] overflow-hidden rounded-full ring-2 ring-(--inv-gold)">
                        <img src={photoUrl(photo)} alt="" className="size-full object-cover" />
                    </div>
                    <MarigoldRing className="absolute inset-0 size-full" />
                </div>
            )}
            <div>
                <p className="text-[13px] italic" style={{ color: tones.muted }}>
                    {copy('ourStory')}
                </p>
                <p
                    className="inv-display text-[22px] leading-tight"
                    style={{ color: tones.goldInk }}
                >
                    {name}
                </p>
                {about.length > 0 && <p className="text-[15px]">{about.join(' ')}</p>}
            </div>
        </div>
    );
}

// The numbers guests can call, under the programme.
function ContactLine() {
    const { data, copy } = useInvite();
    const tones = useTones();
    const contacts = (data.invitation.extras.contacts ?? []).filter((c) => c.phone.trim());
    if (contacts.length === 0) return null;
    return (
        <div className="mt-5">
            <p className="text-[14px] italic" style={{ color: tones.muted }}>
                {copy('contactUs')}
            </p>
            {contacts.map((c, i) => (
                <p key={i} className="inv-display text-[19px]" dir="ltr">
                    {c.name ? `${c.name}: ` : ''}
                    {c.phone}
                </p>
            ))}
        </div>
    );
}

interface BackLineProps {
    event: PublicInvitationEvent;
    title: string;
}

function BackLine({ event, title }: BackLineProps) {
    const tones = useTones();
    const { date, time } = useWhen(event);
    return (
        <div>
            <p
                className="inv-display text-[1.3em] leading-tight font-semibold"
                style={{ color: tones.goldInk }}
            >
                {title}
            </p>
            <p className="text-[0.97em] leading-snug">
                {date} · <span className="whitespace-nowrap">{time}</span>
            </p>
            <p className="text-[0.9em] leading-snug italic" style={{ color: tones.muted }}>
                {[event.venue, event.address].filter(Boolean).join(', ')}
            </p>
        </div>
    );
}
