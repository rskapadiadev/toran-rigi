import { blockKey, resolveBlock, type ResolvedBlock } from '@shared/blocks';
import { localeNames } from '@shared/locales';
import type { SectionType } from '@shared/types';
import { domAnimation, LazyMotion } from 'motion/react';
import { type ComponentType, useEffect, useMemo, useRef, useState } from 'react';

import { useMotionTier } from '../motion/capability';
import { InviteProvider, useInvite } from './context';
import { Opening } from './openings/Opening';
import { Scene } from './scenes';
import { Countdown } from './sections/Countdown';
import { Events } from './sections/Events';
import { Gallery, Live, Shagun, Travel, Wishes } from './sections/Extras';
import { Hero } from './sections/Hero';
import { InvitationCard } from './sections/InvitationCard';
import { Rsvp } from './sections/Rsvp';
import { Closing, Family, Story, Welcome } from './sections/TextSections';
import { designStyle } from './tokens';
import type { GuestIdentity, PublicInvitationData } from './types';

function scrollParent(el: HTMLElement): HTMLElement | null {
    for (let p = el.parentElement; p; p = p.parentElement) {
        const { overflowY } = getComputedStyle(p);
        if (overflowY === 'auto' || overflowY === 'scroll') return p;
    }
    return null;
}

interface BlockProps {
    variant: string;
}

// Section type → component; each component renders the variant it is handed.
const sectionRegistry: Partial<Record<SectionType, ComponentType<BlockProps>>> = {
    cover: Hero,
    card: InvitationCard,
    countdown: Countdown,
    welcome: Welcome,
    story: Story,
    family: Family,
    events: Events,
    gallery: Gallery,
    travel: Travel,
    live: Live,
    rsvp: Rsvp,
    wishes: Wishes,
    shagun: Shagun,
    closing: Closing,
};

function Chrome({ audio }: { audio: HTMLAudioElement | null }) {
    const { data, locale, setLocale, copy } = useInvite();
    const [playing, setPlaying] = useState(false);
    const locales = data.invitation.locales;
    useEffect(() => {
        if (!audio) return;
        const on = () => {
            setPlaying(true);
        };
        const off = () => {
            setPlaying(false);
        };
        audio.addEventListener('play', on);
        audio.addEventListener('pause', off);
        return () => {
            audio.removeEventListener('play', on);
            audio.removeEventListener('pause', off);
        };
    }, [audio]);
    return (
        <div className="fixed end-4 top-4 z-40 flex items-center gap-2">
            {locales.length > 1 && (
                <div className="inv-card flex rounded-full p-1 text-xs">
                    {locales.map((l) => (
                        <button
                            key={l}
                            type="button"
                            onClick={() => {
                                setLocale(l);
                            }}
                            aria-pressed={locale === l}
                            className={`rounded-full px-3 py-1.5 transition ${locale === l ? 'bg-(--inv-primary) text-(--inv-bg)' : ''}`}
                        >
                            {localeNames[l as keyof typeof localeNames]}
                        </button>
                    ))}
                </div>
            )}
            {audio && (
                <button
                    type="button"
                    aria-label={copy('music')}
                    aria-pressed={playing}
                    onClick={() => {
                        if (playing) audio.pause();
                        else void audio.play();
                    }}
                    className="inv-card flex size-10 items-center justify-center rounded-full"
                >
                    <span className={`flex h-4 items-end gap-0.5 ${playing ? '' : 'opacity-50'}`}>
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className={`w-0.5 rounded bg-current ${playing ? 'animate-pulse' : ''}`}
                                style={{
                                    height: `${6 + i * 4}px`,
                                    animationDelay: `${i * 0.2}s`,
                                }}
                            />
                        ))}
                    </span>
                </button>
            )}
        </div>
    );
}

interface ExperienceProps {
    embedded: boolean;
    skipOpening: boolean;
}

function Experience({ embedded, skipOpening }: ExperienceProps) {
    const { data, dir, locale, culture, occasion } = useInvite();
    const { invitation } = data;
    const [opened, setOpened] = useState(skipOpening);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (embedded) return;
        document.documentElement.style.overflow = opened ? '' : 'hidden';
        return () => {
            document.documentElement.style.overflow = '';
        };
    }, [opened, embedded]);

    const begin = () => {
        // The tap that opens the invitation is the user gesture browsers require for audio.
        if (
            audioRef.current &&
            culture.sensitivity.musicDefault === 'on' &&
            occasion.motion.music !== 'off'
        )
            void audioRef.current.play().catch(() => undefined);
    };

    const blocks = useMemo(() => {
        const list: ResolvedBlock[] = [];
        for (const section of invitation.sections) {
            if (!section.enabled || !sectionRegistry[section.type]) continue;
            list.push(resolveBlock(section, list.at(-1)?.scene));
        }
        return list;
    }, [invitation.sections]);

    // In the composer preview, bring the block that was just edited into view so its new look plays at once.
    const rootRef = useRef<HTMLDivElement>(null);
    const seenKeys = useRef<string[] | null>(null);
    useEffect(() => {
        const keys = blocks.map(blockKey);
        const previous = seenKeys.current;
        seenKeys.current = keys;
        if (!embedded || !previous) return;
        const changed = keys.findIndex((k) => !previous.includes(k));
        if (changed < 0) return;
        const el = rootRef.current?.querySelector<HTMLElement>(
            `[data-block-key="${CSS.escape(keys[changed] ?? '')}"]`,
        );
        const scroller = el && scrollParent(el);
        if (!el || !scroller) return;
        scroller.scrollTo({
            top:
                el.getBoundingClientRect().top -
                scroller.getBoundingClientRect().top +
                scroller.scrollTop,
            behavior: 'smooth',
        });
    }, [blocks, embedded]);

    return (
        <div
            ref={rootRef}
            className={`inv-root texture-${invitation.design.texture} min-h-svh`}
            style={designStyle(invitation.design)}
            dir={dir}
            lang={locale}
        >
            {!opened && (
                <Opening
                    kind={invitation.design.opening}
                    onBegin={begin}
                    onOpened={() => {
                        setOpened(true);
                        if (!embedded) window.scrollTo({ top: 0 });
                    }}
                />
            )}
            <main
                aria-hidden={!opened}
                className={opened ? 'animate-[fade-in_1.2s_var(--ease-silk)]' : ''}
            >
                <LazyMotion features={domAnimation} strict>
                    {blocks.map((block, i) => {
                        const Section = sectionRegistry[block.type];
                        if (!Section) return null;
                        return (
                            <Scene key={blockKey(block)} block={block} index={i}>
                                <Section variant={block.variant} />
                            </Scene>
                        );
                    })}
                </LazyMotion>
            </main>
            {invitation.musicBlobKey && (
                // Instrumental background music only; there is no speech to caption.
                // eslint-disable-next-line jsx-a11y-x/media-has-caption
                <audio
                    ref={(el) => {
                        audioRef.current = el;
                        setAudio(el);
                    }}
                    src={`/media/${invitation.musicBlobKey}`}
                    loop
                    preload="none"
                />
            )}
            {opened && <Chrome audio={audio} />}
        </div>
    );
}

interface InvitationViewProps {
    data: PublicInvitationData;
    initialLocale?: string;
    guest?: GuestIdentity;
    // Composer preview: renders inside a phone frame without touching page scroll.
    embedded?: boolean;
    skipOpening?: boolean;
}

export function InvitationView({
    data,
    initialLocale,
    guest,
    embedded = false,
    skipOpening = false,
}: InvitationViewProps) {
    const tier = useMotionTier();
    return (
        <InviteProvider data={data} initialLocale={initialLocale} tier={tier} guest={guest}>
            <Experience embedded={embedded} skipOpening={skipOpening} />
        </InviteProvider>
    );
}
