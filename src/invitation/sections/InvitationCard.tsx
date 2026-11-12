import { eventLabel } from '@shared/cultures';
import { materialBackground, mixHex } from '@shared/materials';
import { formatEventDate, formatEventTime, zonedToUtc, zoneLabel } from '@shared/time';
import { type CSSProperties, type ReactNode, useMemo } from 'react';

import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';

function PhotoCorner({ className }: { className: string }) {
    return (
        <svg viewBox="0 0 40 40" className={`absolute size-9 drop-shadow ${className}`} aria-hidden>
            <defs>
                <linearGradient id="corner-gold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f6e1a3" />
                    <stop offset="0.5" stopColor="var(--inv-gold)" />
                    <stop offset="1" stopColor="#8a6424" />
                </linearGradient>
            </defs>
            <path d="M0 0 H40 L0 40 Z" fill="url(#corner-gold)" />
            <path
                d="M4 4 H30 L4 30 Z"
                fill="none"
                stroke="#fff6d8"
                strokeWidth="0.8"
                opacity="0.7"
            />
        </svg>
    );
}

interface PaperCardProps {
    children: ReactNode;
    tilt: number;
    corners?: boolean;
}

// Cotton-paper card with a foil double border; sticky so the next card slides over it like real stationery.
function PaperCard({ children, tilt, corners = false }: PaperCardProps) {
    const { data } = useInvite();
    const gold = data.invitation.design.palette.gold;
    const paper = useMemo(
        () =>
            materialBackground({
                kind: 'paper',
                base: '#fbf6ec',
                seed: data.invitation.seed + 11,
            }),
        [data.invitation.seed],
    );
    const style: CSSProperties = {
        backgroundImage: paper,
        transform: `rotate(${tilt}deg)`,
        boxShadow: '0 30px 60px -20px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.15)',
        '--inv-ink': '#2b1d18',
        '--inv-muted': '#6f5e54',
        color: '#2b1d18',
    } as CSSProperties;
    return (
        <div
            className="relative mx-auto w-[min(88%,460px)] p-[clamp(1.4rem,6cqw,2.6rem)]"
            style={style}
        >
            <div
                className="pointer-events-none absolute inset-2.5 border"
                style={{ borderColor: mixHex(gold, '#ffffff', 0.15) }}
            />
            <div
                className="pointer-events-none absolute inset-4 border-2"
                style={{ borderColor: gold }}
            />
            {corners && (
                <>
                    <PhotoCorner className="-start-2 -top-2" />
                    <PhotoCorner className="-end-2 -top-2 rotate-90" />
                </>
            )}
            <div className="relative px-3 py-6 text-center">{children}</div>
        </div>
    );
}

export function InvitationCard({ variant }: { variant: string }) {
    const { data, t, locale, copy, names } = useInvite();
    const { content } = data.invitation;
    const first = data.events[0];
    const start = first ? zonedToUtc(first.startsAt, first.timezone) : undefined;
    const gold = data.invitation.design.palette.gold;
    const buttonBg = mixHex(data.invitation.design.palette.primary, '#000000', 0.1);

    const details = (
        <>
            <p className="text-[0.95rem] opacity-80">{t(content.headline)}</p>
            <p className="inv-script my-4 text-[clamp(2.6rem,12cqw,4rem)] leading-none">
                {names.one}
            </p>
            {names.two && (
                <>
                    <p className="inv-script text-3xl" style={{ color: gold }}>
                        {copy('and')}
                    </p>
                    <p className="inv-script my-4 text-[clamp(2.6rem,12cqw,4rem)] leading-none">
                        {names.two}
                    </p>
                </>
            )}
            <div className="mx-auto my-6 h-px w-24" style={{ background: gold }} />
            {first && start && (
                <div className="space-y-1.5 text-sm tracking-[0.2em] uppercase">
                    <p>{formatEventDate(start, first.timezone, locale)}</p>
                    <p>
                        {formatEventTime(start, first.timezone, locale)} ·{' '}
                        {zoneLabel(first.timezone)}
                    </p>
                    <p className="pt-3 font-semibold">{first.venue}</p>
                    {first.address && (
                        <p className="text-xs normal-case opacity-70">{first.address}</p>
                    )}
                </div>
            )}
            {first?.mapsUrl && (
                <a
                    href={first.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-block text-xs tracking-[0.3em] uppercase underline underline-offset-4"
                    style={{ color: gold }}
                >
                    {copy('directions')}
                </a>
            )}
        </>
    );
    const celebrations = (
        <>
            <p className="inv-script text-[clamp(2.4rem,11cqw,3.6rem)]">{copy('celebrations')}</p>
            <ul className="mt-6 space-y-5">
                {data.events.map((ev) => {
                    const at = zonedToUtc(ev.startsAt, ev.timezone);
                    return (
                        <li key={ev.id}>
                            <p
                                className="text-[11px] tracking-[0.35em] uppercase"
                                style={{ color: gold }}
                            >
                                {t(ev.title) ||
                                    eventLabel(data.invitation.culture, ev.kind, locale)}
                            </p>
                            <p className="mt-1 text-base">
                                {formatEventDate(at, ev.timezone, locale)} ·{' '}
                                {formatEventTime(at, ev.timezone, locale)}
                            </p>
                            <p className="text-sm opacity-75">{ev.venue}</p>
                        </li>
                    );
                })}
            </ul>
            {data.invitation.rsvpEnabled && (
                <a
                    href="#rsvp"
                    className="mt-8 inline-block rounded-full px-7 py-3 text-xs tracking-[0.3em] text-white uppercase"
                    style={{ background: buttonBg }}
                >
                    {copy('rsvpTitle')}
                </a>
            )}
        </>
    );

    if (variant === 'single')
        return (
            <section className="relative py-[10svh]">
                <Reveal>
                    <PaperCard tilt={-0.6} corners>
                        {details}
                        <div className="mx-auto my-8 h-px w-24" style={{ background: gold }} />
                        {celebrations}
                    </PaperCard>
                </Reveal>
            </section>
        );

    return (
        <section className="relative py-[12svh]">
            <div className="sticky top-[8svh] z-0">
                <Reveal>
                    <PaperCard tilt={-1.2}>{details}</PaperCard>
                </Reveal>
            </div>
            <div className="relative z-10 mt-[30svh]">
                <Reveal>
                    <PaperCard tilt={0.8} corners>
                        {celebrations}
                    </PaperCard>
                </Reveal>
            </div>
        </section>
    );
}
