import { localeNames } from '@shared/locales';
import type { SectionType } from '@shared/types';
import { type ComponentType, useEffect, useRef, useState } from 'react';

import { useMotionTier } from '../motion/capability';
import { InviteProvider, useInvite } from './context';
import { Opening } from './openings/Opening';
import { Countdown } from './sections/Countdown';
import { Events } from './sections/Events';
import { Gallery, Live, Shagun, Travel, Wishes } from './sections/Extras';
import { Hero } from './sections/Hero';
import { Rsvp } from './sections/Rsvp';
import { Closing, Family, Story, Welcome } from './sections/TextSections';
import { s } from './strings';
import { designStyle } from './tokens';
import type { GuestIdentity, PublicInvitationData } from './types';

const sectionRegistry: Partial<Record<SectionType, ComponentType>> = {
    cover: Hero,
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
    const { data, locale, setLocale } = useInvite();
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
                    aria-label={s('music', locale)}
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

function Experience() {
    const { data, dir, locale, culture } = useInvite();
    const { invitation } = data;
    const [opened, setOpened] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        document.documentElement.style.overflow = opened ? '' : 'hidden';
        return () => {
            document.documentElement.style.overflow = '';
        };
    }, [opened]);

    const begin = () => {
        // The tap that opens the invitation is the user gesture browsers require for audio.
        if (audioRef.current && culture.sensitivity.musicDefault === 'on')
            void audioRef.current.play().catch(() => undefined);
    };

    const sections = invitation.sections.filter(
        (section) => section.enabled && sectionRegistry[section.type],
    );

    return (
        <div
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
                        window.scrollTo({ top: 0 });
                    }}
                />
            )}
            <main
                aria-hidden={!opened}
                className={opened ? 'animate-[fade-in_1.2s_var(--ease-silk)]' : ''}
            >
                {sections.map((section) => {
                    const Section = sectionRegistry[section.type];
                    return Section ? <Section key={section.type} /> : null;
                })}
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
}

export function InvitationView({ data, initialLocale, guest }: InvitationViewProps) {
    const tier = useMotionTier();
    return (
        <InviteProvider data={data} initialLocale={initialLocale} tier={tier} guest={guest}>
            <Experience />
        </InviteProvider>
    );
}
