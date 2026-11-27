// Posts for status, stories and the profile grid, drawn like the cards from the invitation's own
// colours, lettering and art: a countdown in three looks, a ceremony on its day, a thank-you, a
// square save-the-date and a grid that reads as one picture.
import { mainEvent } from '@shared/cards';
import { photoUrl } from '@shared/photos';
import { type GridSize, type PostFace, type PostLook, postPhoto, postSize } from '@shared/posts';
import { placeLine } from '@shared/share';
import { zonedToUtc } from '@shared/time';
import type { CSSProperties, ReactNode } from 'react';

import { InviteProvider, useInvite } from '../context';
import { designStyle } from '../tokens';
import type { PublicInvitationData } from '../types';
import {
    Announcement,
    Crest,
    Names,
    nameSize,
    Painting,
    StudioMark,
    useFoil,
    useTitle,
    useWhen,
} from './CardView';
import { ArchFrame, Divider, Fit, Ground, Motif, MotifBand, RuledFrame, useTones } from './Frame';

// The studio's strip at the foot, as on every card.
const STRIP = 30;

interface PostViewProps {
    data: PublicInvitationData;
    face: PostFace;
    locale?: string;
    look?: PostLook;
    // Days left, for a countdown.
    day?: number;
    eventId?: string;
    tiles?: GridSize;
}

export function PostView({ data, face, locale, look, day, eventId, tiles }: PostViewProps) {
    return (
        <InviteProvider key={locale} data={data} initialLocale={locale} tier="static">
            <Post
                face={face}
                look={look ?? 'number'}
                day={day ?? 0}
                eventId={eventId}
                tiles={tiles}
            />
        </InviteProvider>
    );
}

interface PostProps {
    face: PostFace;
    look: PostLook;
    day: number;
    eventId?: string;
    tiles?: GridSize;
}

function Post({ face, look, day, eventId, tiles }: PostProps) {
    const { data, dir, locale } = useInvite();
    const size = postSize(face, tiles);
    const style: CSSProperties = {
        ...designStyle(data.invitation.design),
        ...size,
    };
    const area = {
        width: size.width,
        height: size.height - STRIP,
    };
    const areaStyle: CSSProperties = { height: area.height };
    const event = data.events.find((e) => e.id === eventId);
    return (
        <div className="inv-root overflow-hidden" dir={dir} lang={locale} style={style} data-card>
            <div className="absolute inset-x-0 top-0 overflow-hidden" style={areaStyle}>
                <Ground {...area} />
                {face === 'count' && look === 'number' && <NumberLook box={area} day={day} />}
                {face === 'count' && look === 'calendar' && <CalendarLook box={area} day={day} />}
                {face === 'count' && look === 'photo' && <PhotoLook day={day} />}
                {face === 'ceremony' && event && <CeremonyPost box={area} event={event} />}
                {face === 'thanks' && <ThanksPost box={area} />}
                {face === 'square' && <SquarePost box={area} />}
                {face === 'grid' && <GridPost box={area} rows={(tiles ?? 6) / 3} />}
            </div>
            <StudioMark face="story" />
        </div>
    );
}

interface Box {
    width: number;
    height: number;
}

interface LookProps {
    box: Box;
    day: number;
}

// The photo a post can use, the same one the server expects.
function usePhoto(): string | undefined {
    const { data } = useInvite();
    return postPhoto(data.invitation);
}

// "12" over "days to go"; the last two days are words, not numbers.
interface CountProps {
    day: number;
    size: number;
}

function Count({ day, size }: CountProps) {
    const { copy } = useInvite();
    const foil = useFoil();
    const tones = useTones();
    if (day <= 1)
        return (
            <p
                className="inv-script leading-[1.1]"
                style={{
                    ...foil,
                    fontSize: size * 0.46,
                }}
            >
                {copy(day === 1 ? 'tomorrow' : 'today')}
            </p>
        );
    return (
        <>
            <p
                className="inv-display leading-[0.9] font-semibold"
                style={{
                    ...foil,
                    fontSize: size,
                }}
                dir="ltr"
            >
                {day}
            </p>
            <p
                className="inv-script mt-1"
                style={{
                    color: tones.goldInk,
                    fontSize: size * 0.2,
                }}
            >
                {copy('daysToGo')}
            </p>
        </>
    );
}

function When() {
    const { data } = useInvite();
    const tones = useTones();
    const main = mainEvent(data.events);
    const { date } = useWhen(main);
    const place = placeLine(data.events);
    return (
        <>
            <p className="inv-display text-[22px] leading-snug">{date}</p>
            {place && (
                <p
                    className="mt-1 text-[14px] tracking-[0.22em] uppercase"
                    style={{ color: tones.muted }}
                >
                    {place}
                </p>
            )}
        </>
    );
}

function NumberLook({ box, day }: LookProps) {
    return (
        <>
            <ArchFrame {...box} left={46} top={70} right={box.width - 46} />
            <Fit className="inset-x-[84px] top-[190px] bottom-[120px]">
                <Crest size={96} />
                <div className="mt-4">
                    <Count day={day} size={210} />
                </div>
                <div className="my-4">
                    <Divider width={150} />
                </div>
                <Names width={360} largest={52} />
                <div className="mt-4">
                    <When />
                </div>
            </Fit>
            <MotifBand {...box} y={box.height - 74} />
        </>
    );
}

// A calendar leaf for the month of the day, the day itself ringed in gold.
function Month() {
    const { data, locale } = useInvite();
    const tones = useTones();
    const main = mainEvent(data.events);
    if (!main) return null;
    const at = zonedToUtc(main.startsAt, main.timezone);
    const [y = 2000, m = 1, d = 1] = main.startsAt.slice(0, 10).split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const month = new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
        timeZone: main.timezone,
    }).format(at);
    const weekday = new Intl.DateTimeFormat(locale, {
        weekday: 'narrow',
        timeZone: 'UTC',
    });
    // A week from Sunday, as Indian and most calendars print it.
    const heads = Array.from({ length: 7 }, (_, i) =>
        weekday.format(new Date(Date.UTC(2023, 0, 1 + i))),
    );
    const blanks = first.getUTCDay();
    const cells = [
        ...Array.from({ length: blanks }, () => 0),
        ...Array.from({ length: days }, (_, i) => i + 1),
    ];
    const leaf: CSSProperties = {
        background: `color-mix(in oklab, var(--inv-surface, ${tones.bg}) 88%, white)`,
        borderColor: tones.goldInk,
    };
    const ring: CSSProperties = {
        background: tones.frame,
        color: tones.onFrame,
        boxShadow: `0 0 0 3px ${tones.goldInk}`,
    };
    return (
        <div className="relative w-[420px] rounded-[22px] border-2 px-6 pt-9 pb-6" style={leaf}>
            <div className="absolute inset-x-0 -top-3 flex justify-center gap-24" aria-hidden>
                {[0, 1].map((i) => (
                    <span
                        key={i}
                        className="h-7 w-3 rounded-full border-2"
                        style={{
                            borderColor: tones.goldInk,
                            background: tones.bg,
                        }}
                    />
                ))}
            </div>
            <p
                className="inv-display text-[26px] tracking-[0.12em] uppercase"
                style={{ color: tones.goldInk }}
            >
                {month}
            </p>
            <div
                className="mt-4 grid grid-cols-7 gap-y-1.5 text-[17px]"
                style={{ color: tones.ink }}
                dir="ltr"
            >
                {heads.map((h, i) => (
                    <span
                        key={`h${String(i)}`}
                        className="text-[13px] font-semibold"
                        style={{ color: tones.muted }}
                    >
                        {h}
                    </span>
                ))}
                {cells.map((n, i) => (
                    <span key={i} className="flex h-9 items-center justify-center">
                        {n > 0 &&
                            (n === d ? (
                                <span
                                    className="inv-display flex size-9 items-center justify-center rounded-full text-[19px] font-semibold"
                                    style={ring}
                                >
                                    {n}
                                </span>
                            ) : (
                                n
                            ))}
                    </span>
                ))}
            </div>
        </div>
    );
}

function CalendarLook({ box, day }: LookProps) {
    return (
        <>
            <RuledFrame {...box} inset={24} />
            <Fit className="inset-x-[48px] top-[80px] bottom-[70px]">
                <Count day={day} size={150} />
                <div className="mt-6">
                    <Month />
                </div>
                <div className="mt-6">
                    <Names width={380} largest={50} />
                </div>
            </Fit>
        </>
    );
}

function PhotoLook({ day }: Pick<LookProps, 'day'>) {
    const tones = useTones();
    const photo = usePhoto();
    const frame: CSSProperties = {
        borderColor: tones.goldInk,
        boxShadow: '0 24px 50px -24px rgba(0,0,0,0.55)',
    };
    const badge: CSSProperties = {
        background: tones.frame,
        color: tones.onFrame,
        boxShadow: `0 0 0 4px ${tones.goldInk}, 0 12px 30px -10px rgba(0,0,0,0.5)`,
    };
    return (
        <>
            <div
                className="absolute start-1/2 top-[64px] h-[470px] w-[392px] -translate-x-1/2 overflow-hidden rounded-t-[196px] border-[5px] rtl:translate-x-1/2"
                style={frame}
            >
                {photo && (
                    <img
                        src={photoUrl(photo)}
                        alt=""
                        className="size-full object-cover object-[50%_35%]"
                    />
                )}
            </div>
            {day > 1 && (
                <div
                    className="absolute start-1/2 top-[470px] flex size-[132px] -translate-x-1/2 flex-col items-center justify-center rounded-full rtl:translate-x-1/2"
                    style={badge}
                    dir="ltr"
                >
                    <span className="inv-display text-[60px] leading-none font-semibold">
                        {day}
                    </span>
                </div>
            )}
            <Fit
                className={`inset-x-[60px] bottom-[64px] ${day > 1 ? 'top-[606px]' : 'top-[556px]'}`}
            >
                {day > 1 ? <DaysWords /> : <Count day={day} size={190} />}
                <div className="mt-3">
                    <Names width={400} largest={48} />
                </div>
                <div className="mt-3">
                    <When />
                </div>
            </Fit>
        </>
    );
}

function DaysWords() {
    const { copy } = useInvite();
    const tones = useTones();
    return (
        <p className="inv-script text-[42px] leading-none" style={{ color: tones.goldInk }}>
            {copy('daysToGo')}
        </p>
    );
}

interface CeremonyProps {
    box: Box;
    event: PublicInvitationData['events'][number];
}

function CeremonyPost({ box, event }: CeremonyProps) {
    const { copy, names } = useInvite();
    const tones = useTones();
    const foil = useFoil();
    const title = useTitle()(event);
    const { time } = useWhen(event);
    return (
        <>
            <ArchFrame {...box} left={46} top={70} right={box.width - 46} />
            <Fit className="inset-x-[84px] top-[180px] bottom-[120px]">
                <p
                    className="text-[19px] tracking-[0.4em] uppercase"
                    style={{ color: tones.goldInk }}
                >
                    {copy('today')}
                </p>
                <div className="mt-5">
                    <Painting event={event} />
                </div>
                <p
                    className="inv-script mt-4 px-3 leading-[1.15] whitespace-nowrap"
                    style={{
                        ...foil,
                        fontSize: nameSize(title, 360, 86),
                    }}
                >
                    {title}
                </p>
                <div className="my-4">
                    <Divider width={150} />
                </div>
                <p className="inv-display text-[24px]">{time}</p>
                <p className="mt-1 text-[19px] italic">{event.venue}</p>
                <p className="inv-script mt-5 text-[32px]" style={{ color: tones.goldInk }}>
                    {names.title}
                </p>
            </Fit>
            <MotifBand {...box} y={box.height - 74} />
        </>
    );
}

function ThanksPost({ box }: { box: Box }) {
    const { copy } = useInvite();
    const tones = useTones();
    const foil = useFoil();
    const photo = usePhoto();
    const fade = `linear-gradient(to bottom, transparent 55%, ${tones.bg} 98%)`;
    const words = (
        <>
            <p
                className="inv-script leading-[1.1]"
                style={{
                    ...foil,
                    fontSize: 96,
                }}
            >
                {copy('thankYou')}
            </p>
            <p className="mt-1 text-[21px] italic" style={{ color: tones.muted }}>
                {copy('thankYouLine')}
            </p>
            <div className="my-5">
                <Divider width={150} />
            </div>
            <Names width={380} largest={50} />
        </>
    );
    if (!photo)
        return (
            <>
                <RuledFrame {...box} inset={24} />
                <Fit className="inset-x-[64px] inset-y-[90px]">
                    <Crest size={130} />
                    <div className="mt-6 flex flex-col items-center">{words}</div>
                </Fit>
            </>
        );
    return (
        <>
            <div className="absolute inset-x-0 top-0 h-[520px]">
                <img
                    src={photoUrl(photo)}
                    alt=""
                    className="size-full object-cover object-[50%_40%]"
                />
                <div className="absolute inset-0" style={{ background: fade }} />
            </div>
            <Fit className="inset-x-[56px] top-[470px] bottom-[80px]">{words}</Fit>
        </>
    );
}

function SquarePost({ box }: { box: Box }) {
    return (
        <>
            <RuledFrame {...box} inset={18} />
            <Fit className="inset-x-[52px] inset-y-[34px]">
                <Crest size={84} />
                <div className="mt-2 flex w-full flex-col items-center">
                    <Announcement width={390} largest={50} />
                </div>
            </Fit>
        </>
    );
}

interface GridProps {
    box: Box;
    rows: number;
}

interface CellProps {
    row: number;
    column: number;
    children: ReactNode;
}

// One post of the grid: its piece is centred in its own tile, so it reads on its own too.
function Cell({ row, column, children }: CellProps) {
    const place: CSSProperties = {
        top: row * 720,
        insetInlineStart: column * 540,
    };
    return (
        <div
            className="absolute flex h-[720px] w-[540px] flex-col items-center justify-center px-14 text-center"
            style={place}
        >
            {children}
        </div>
    );
}

// One picture across the whole grid, set tile by tile so every post has its part: the day, the
// names, where. With a photo, it fills the top row.
function GridPost({ box, rows }: GridProps) {
    const { copy, data, locale, names } = useInvite();
    const tones = useTones();
    const foil = useFoil();
    const photo = usePhoto();
    const pictured = photo !== undefined && rows > 1;
    const fade = `linear-gradient(to bottom, transparent 60%, ${tones.bg} 100%)`;
    const main = mainEvent(data.events);
    const at = main ? zonedToUtc(main.startsAt, main.timezone) : null;
    const part = (options: Intl.DateTimeFormatOptions) =>
        at && main
            ? new Intl.DateTimeFormat(locale, {
                  ...options,
                  timeZone: main.timezone,
              }).format(at)
            : '';
    const place = placeLine(data.events);
    const gold = (size: number): CSSProperties => ({
        ...foil,
        fontSize: size,
    });
    const weekday = (
        <p className="text-[28px] tracking-[0.3em] uppercase" style={{ color: tones.goldInk }}>
            {part({ weekday: 'long' })}
        </p>
    );
    const day = (
        <p
            className="inv-display leading-none font-semibold"
            style={gold(rows === 1 ? 170 : 250)}
            dir="ltr"
        >
            {part({ day: 'numeric' })}
        </p>
    );
    const month = (
        <p className="inv-display text-[44px] leading-tight">
            {part({
                month: 'long',
                year: 'numeric',
            })}
        </p>
    );
    const save = (
        <p className="inv-script leading-tight" style={gold(rows === 1 ? 60 : 84)}>
            {copy('saveTheDate')}
        </p>
    );
    const where = place && (
        <p
            className="text-[26px] leading-snug tracking-[0.22em] uppercase"
            style={{ color: tones.muted }}
        >
            {place}
        </p>
    );
    const follow = (
        <p className="text-[26px] italic" style={{ color: tones.muted }}>
            {copy('invitationToFollow')}
        </p>
    );
    const couple = <Names width={430} largest={rows === 1 ? 84 : 112} />;
    const rule = (
        <div className="my-5">
            <Divider width={220} />
        </div>
    );
    // The row where the names sit: under the photo, or the middle of three.
    const mid = pictured ? 1 : rows === 3 ? 1 : rows - 1;
    return (
        <>
            {pictured && (
                <div className="absolute inset-x-0 top-0 h-[760px]">
                    <img
                        src={photoUrl(photo)}
                        alt=""
                        className="size-full object-cover object-[50%_40%]"
                    />
                    <div className="absolute inset-0" style={{ background: fade }} />
                </div>
            )}
            <RuledFrame {...box} inset={30} />
            {rows === 1 ? (
                <>
                    <Cell row={0} column={0}>
                        {weekday}
                        {day}
                        {month}
                    </Cell>
                    <Cell row={0} column={1}>
                        {couple}
                    </Cell>
                    <Cell row={0} column={2}>
                        {save}
                        {rule}
                        {where}
                    </Cell>
                </>
            ) : (
                <>
                    {!pictured && (
                        <>
                            <Cell row={0} column={0}>
                                {weekday}
                                {day}
                            </Cell>
                            <Cell row={0} column={1}>
                                <Crest size={300} />
                            </Cell>
                            <Cell row={0} column={2}>
                                {save}
                            </Cell>
                        </>
                    )}
                    <Cell row={mid} column={0}>
                        {pictured ? (
                            <>
                                {weekday}
                                {day}
                                {month}
                            </>
                        ) : (
                            month
                        )}
                    </Cell>
                    <Cell row={mid} column={1}>
                        {couple}
                    </Cell>
                    <Cell row={mid} column={2}>
                        {pictured && save}
                        {pictured && rule}
                        {where}
                        {!pictured && rule}
                        {!pictured && follow}
                    </Cell>
                    {rows === 3 && (
                        <>
                            <Cell row={2} column={0}>
                                <MotifMark />
                            </Cell>
                            <Cell row={2} column={1}>
                                {pictured ? (
                                    <Crest size={260} />
                                ) : (
                                    <p
                                        className="inv-script text-[64px]"
                                        style={{ color: tones.goldInk }}
                                    >
                                        {names.title}
                                    </p>
                                )}
                            </Cell>
                            <Cell row={2} column={2}>
                                {pictured ? follow : <MotifMark />}
                            </Cell>
                        </>
                    )}
                </>
            )}
        </>
    );
}

// The family's motif, large and quiet, for a tile with no words of its own.
function MotifMark() {
    const tones = useTones();
    return (
        <svg viewBox="0 0 200 200" className="size-[260px]" aria-hidden>
            <Motif x={100} y={100} size={180} fill={tones.goldInk} opacity={0.55} />
        </svg>
    );
}
