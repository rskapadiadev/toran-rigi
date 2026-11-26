// "Singer spotlight": tonight's singer introduced as on the jagran stage. A spotlight opens from above
// onto a round portrait in a marigold garland, the name set in foil beneath it and a line about them.
// The first line of the story is the name; everything after it is the line about them.
import { photoUrl, slotPhoto } from '@shared/photos';
import { type CSSProperties, useRef } from 'react';

import { Reveal } from '../../../motion/Reveal';
import { useEntrance } from '../../../motion/stage';
import { useInvite } from '../../context';
import { Editable, useEditing } from '../../editing';
import { usePrint } from '../../print';
import { MarigoldRing } from '../darbar/art';
import { SectionTitle } from '../typography/SectionTitle';

const SLOT = 'story.artist';

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter((w) => w && !/^(shri|sri|shree|smt|श्री|श्रीमती)\.?$/i.test(w))
        .slice(0, 2)
        .map((w) => Array.from(w)[0] ?? '')
        .join('');

export function ArtistSpotlight() {
    const { data, t, copy, tier } = useInvite();
    const editing = useEditing();
    const print = usePrint();
    const stage = useRef<HTMLDivElement>(null);
    const on = useEntrance(stage) || tier === 'static' || print;
    const raw = t(data.invitation.content.story);
    const key = slotPhoto(data.invitation.content, SLOT);
    // Empty for guests vanishes; in the editor it stays, so there is somewhere to type.
    if (!raw && !editing && !key) return null;
    const [name = '', ...about] = raw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    const cone: CSSProperties = {
        clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)',
        background:
            'linear-gradient(180deg, rgba(255,231,170,0.42) 0%, rgba(255,214,140,0.16) 55%, transparent 100%)',
        opacity: on ? 1 : 0,
        transition: 'opacity 1.4s ease 0.2s',
    };
    const portrait: CSSProperties = {
        width: 'min(50cqw, 240px)',
        transform: on ? 'scale(1)' : 'scale(0.92)',
        opacity: on ? 1 : 0,
        transition: 'transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s, opacity 1.1s ease 0.5s',
    };
    return (
        <section className="relative overflow-hidden px-6 pt-16 pb-20 text-center">
            <SectionTitle>{copy('ourStory')}</SectionTitle>
            <div ref={stage} className="relative mx-auto mt-6 flex flex-col items-center">
                <div
                    aria-hidden
                    className="pointer-events-none absolute start-1/2 -top-16 h-[calc(100%+4rem)] w-[min(120cqw,640px)] -translate-x-1/2 rtl:translate-x-1/2"
                    style={cone}
                />
                <div className="relative aspect-square" style={portrait} data-photo-slot={SLOT}>
                    <div className="absolute inset-[9%] overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_35%,color-mix(in_oklab,var(--inv-primary)_55%,black),#12040a)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] ring-2 ring-(--inv-gold)">
                        {key ? (
                            <img
                                src={photoUrl(key)}
                                alt={name}
                                loading="lazy"
                                decoding="async"
                                className="size-full object-cover"
                            />
                        ) : (
                            <span className="inv-display flex size-full items-center justify-center text-[clamp(2.2rem,12cqw,4rem)] text-(--inv-gold)">
                                {initials(name)}
                            </span>
                        )}
                    </div>
                    <MarigoldRing className="absolute inset-0 size-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
                </div>
                <Reveal className="relative mt-8 max-w-xl" delay={300}>
                    {name && (
                        <h3 className="inv-display text-[clamp(1.8rem,8cqw,3rem)] leading-tight">
                            <span className="foil-text">{name}</span>
                        </h3>
                    )}
                    {editing ? (
                        <p className="mt-3 text-lg leading-relaxed whitespace-pre-line opacity-90">
                            <Editable path="story" multiline>
                                {raw}
                            </Editable>
                        </p>
                    ) : (
                        about.length > 0 && (
                            <p className="mt-3 text-[clamp(1rem,4cqw,1.25rem)] leading-relaxed opacity-90">
                                {about.join(' ')}
                            </p>
                        )
                    )}
                </Reveal>
            </div>
        </section>
    );
}
