import {
    blockKey,
    isRendered,
    type RenderedSection,
    resolveBlock,
    type ResolvedBlock,
} from '@shared/blocks';
import { localeNames } from '@shared/locales';
import { creditLine } from '@shared/stock';
import Lenis from 'lenis';
import { domAnimation, LazyMotion } from 'motion/react';
import {
    type ComponentType,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';

import { useMotionTier } from '../motion/capability';
import { StageContext } from '../motion/Reveal';
import { InviteProvider, useInvite } from './context';
import { createPlayer, type MusicPlan, type MusicPlayer } from './music/player';
import { Opening } from './openings/Opening';
import { Scene } from './scenes';
import { findScrollParent, ReplayOpeningContext, ScrollRootContext } from './scroll';
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
// Exhaustive over renderedSections: adding one to that list without a component fails to compile.
const sectionRegistry: Record<RenderedSection, ComponentType<BlockProps>> = {
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

// Stock media credits, required by Creative Commons licences; quiet, at the very foot of the page.
function Credits() {
    const { data } = useInvite();
    const credits = data.invitation.extras.credits ?? [];
    if (credits.length === 0) return null;
    return (
        <footer className="px-6 pt-4 pb-24 text-center text-[11px] leading-relaxed opacity-60">
            {credits.map((c) => (
                <p key={c.blobKey}>
                    <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-2 hover:underline"
                    >
                        {creditLine(c)}
                    </a>
                    {c.provider === 'openverse' && (
                        <>
                            {' · '}
                            <a
                                href={c.licenseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline-offset-2 hover:underline"
                            >
                                licence
                            </a>
                        </>
                    )}
                </p>
            ))}
        </footer>
    );
}

function Chrome({ player }: { player: MusicPlayer | null }) {
    const { data, locale, setLocale, copy } = useInvite();
    // Read straight from the player: music usually starts on the opening tap, before this mounts.
    const subscribe = useCallback(
        (fn: () => void) => (player ? player.subscribe(fn) : () => undefined),
        [player],
    );
    const playing = useSyncExternalStore(
        subscribe,
        () => player?.playing ?? false,
        () => false,
    );
    const locales = data.invitation.locales;
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
            {player && (
                <button
                    type="button"
                    aria-label={copy('music')}
                    aria-pressed={playing}
                    onClick={() => {
                        if (playing) player.pause();
                        else void player.play().catch(() => undefined);
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

// What to play: generated music from the seed, or the stored file the server resolved.
function musicPlan(invitation: PublicInvitationData['invitation']): MusicPlan {
    const music = invitation.extras.music;
    if (music?.source === 'generated' && music.style)
        return {
            kind: 'generated',
            style: music.style,
            seed: invitation.seed,
        };
    if (music?.source === 'none') return null;
    return invitation.musicBlobKey
        ? {
              kind: 'file',
              src: `/media/${invitation.musicBlobKey}`,
          }
        : null;
}

interface ExperienceProps {
    embedded: boolean;
    skipOpening: boolean;
}

function Experience({ embedded, skipOpening }: ExperienceProps) {
    const { data, dir, locale, culture, occasion, tier } = useInvite();
    const { invitation } = data;
    const [opened, setOpened] = useState(skipOpening);
    const plan = musicPlan(invitation);
    const planKey = plan ? JSON.stringify(plan) : '';
    const [player, setPlayer] = useState<MusicPlayer | null>(null);
    // Built when the page mounts, not on the tap: iPhones only let audio start inside the tap itself.
    useEffect(() => {
        if (!planKey) return;
        let live = true;
        let made: MusicPlayer | null = null;
        void createPlayer(JSON.parse(planKey) as NonNullable<MusicPlan>).then((p) => {
            if (!live) {
                p.dispose();
                return;
            }
            made = p;
            setPlayer(p);
        });
        return () => {
            live = false;
            made?.dispose();
            setPlayer(null);
        };
    }, [planKey]);

    useEffect(() => {
        if (embedded) return;
        document.documentElement.style.overflow = opened ? '' : 'hidden';
        return () => {
            document.documentElement.style.overflow = '';
        };
    }, [opened, embedded]);

    const begin = () => {
        // The tap that opens the invitation is the user gesture browsers require for audio.
        if (player && culture.sensitivity.musicDefault === 'on' && occasion.motion.music !== 'off')
            void player.play().catch(() => undefined);
    };

    const blocks = useMemo(() => {
        const list: ResolvedBlock[] = [];
        for (const section of invitation.sections) {
            if (!section.enabled || !isRendered(section.type)) continue;
            list.push(resolveBlock(section, list.at(-1)?.scene));
        }
        return list;
    }, [invitation.sections]);

    // In the composer preview, bring the block that was just edited into view so its new look plays at once.
    const rootRef = useRef<HTMLDivElement>(null);
    // What scrolls this invitation: the window live, the canvas frame in the editor.
    const scrollRoot = useRef<HTMLElement | null>(null);

    // Inertia ("buttery") scrolling on the live page once the invitation is open; never in the editor.
    useEffect(() => {
        if (embedded || !opened || tier !== 'full') return;
        const lenis = new Lenis({ autoRaf: true });
        return () => {
            lenis.destroy();
        };
    }, [embedded, opened, tier]);

    const replayOpening = () => {
        setOpened(false);
        if (embedded) scrollRoot.current?.scrollTo({ top: 0 });
        else window.scrollTo({ top: 0 });
    };
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
            ref={(el) => {
                rootRef.current = el;
                // Set during commit, before children's effects subscribe to scroll.
                scrollRoot.current = embedded ? findScrollParent(el) : null;
            }}
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
                // While the opening covers the page, its CSS animations (stitched medallions, stars,
                // processions) hold their first frame and resume together when it lifts.
                data-staging={opened ? undefined : ''}
                className={opened ? 'animate-[fade-in_1.2s_var(--ease-silk)]' : ''}
            >
                <ScrollRootContext value={embedded ? scrollRoot : null}>
                    <ReplayOpeningContext value={replayOpening}>
                        <StageContext value={opened}>
                            <LazyMotion features={domAnimation} strict>
                                {blocks.map((block, i) => {
                                    if (!isRendered(block.type)) return null;
                                    const Section = sectionRegistry[block.type];
                                    return (
                                        <Scene key={blockKey(block)} block={block} index={i}>
                                            <Section variant={block.variant} />
                                        </Scene>
                                    );
                                })}
                            </LazyMotion>
                            <Credits />
                        </StageContext>
                    </ReplayOpeningContext>
                </ScrollRootContext>
            </main>
            {opened && <Chrome player={player} />}
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
