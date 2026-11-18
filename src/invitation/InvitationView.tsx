import {
    blockKey,
    isRendered,
    type RenderedSection,
    resolveBlock,
    type ResolvedBlock,
} from '@shared/blocks';
import { chaptersOf } from '@shared/film';
import { localeNames } from '@shared/locales';
import { creditLine } from '@shared/stock';
import Lenis from 'lenis';
import { domAnimation, LazyMotion } from 'motion/react';
import {
    type ComponentType,
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';

import { useMotionTier } from '../motion/capability';
import { StageContext } from '../motion/Reveal';
import { Branding } from './Branding';
import { InviteProvider, useInvite } from './context';
import { FilmStage } from './film/FilmStage';
import { FilmTravel } from './film/FilmTravel';
import { BlessingArch } from './luxury/night/BlessingArch';
import { DressCode } from './luxury/night/DressCode';
import { ScratchDate } from './luxury/night/ScratchDate';
import { Venue } from './luxury/night/Venue';
import { createPlayer, type MusicPlan, type MusicPlayer } from './music/player';
import { Opening } from './openings/Opening';
import { PrintContext, usePrintFit } from './print';
import { PrintClosing } from './PrintClosing';
import { Scene } from './scenes';
import { findScrollParent, ReplayOpeningContext, ScrollRootContext } from './scroll';
import { Countdown } from './sections/Countdown';
import { Events } from './sections/Events';
import { Gallery, Live, Shagun, Travel, Wishes } from './sections/Extras';
import { Hero } from './sections/Hero';
import { InvitationCard } from './sections/InvitationCard';
import { Rsvp } from './sections/Rsvp';
import { Closing, Family, Story, Welcome } from './sections/TextSections';
import { StudioPreviewContext } from './studio';
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
    blessing: BlessingArch,
    date: ScratchDate,
    countdown: Countdown,
    welcome: Welcome,
    story: Story,
    family: Family,
    events: Events,
    venue: Venue,
    dressCode: DressCode,
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
        <footer className="px-6 pt-4 text-center text-[11px] leading-relaxed opacity-60">
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

interface ChromeProps {
    player: MusicPlayer | null;
    // The invitation's PDF, when the couple has the PDF add-on and it is published.
    pdfHref?: string;
}

function Chrome({ player, pdfHref }: ChromeProps) {
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
            {pdfHref && (
                <a
                    href={pdfHref}
                    download
                    aria-label="Download the invitation as a PDF"
                    className="inv-card flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium tracking-wide"
                >
                    <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="none">
                        <path
                            d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    PDF
                </a>
            )}
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
                    <span
                        className={`relative flex h-4 items-end gap-0.5 ${playing ? '' : 'opacity-60'}`}
                    >
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
                        {/* Off: the bars are struck through, so silence reads at a glance. */}
                        {!playing && (
                            <span
                                aria-hidden
                                className="absolute start-1/2 top-1/2 h-[2px] w-[22px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current shadow-[0_0_0_1.5px_var(--inv-surface)] rtl:translate-x-1/2"
                            />
                        )}
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
    // Set for the PDF: the living invitation's link, for the QR on the last page.
    print?: string;
}

// Sections that only make sense live (forms, a ticking countdown, a stream) stay out of the PDF;
// its last page points guests back to the living invitation instead.
const liveOnly: readonly string[] = ['rsvp', 'wishes', 'countdown', 'live', 'shagun'];

function Experience({ embedded, skipOpening, print }: ExperienceProps) {
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
            if (print !== undefined && liveOnly.includes(section.type)) continue;
            list.push(resolveBlock(section, list.at(-1)?.scene));
        }
        return list;
    }, [invitation.sections, print]);

    // A film behind the whole invitation: chapters of sections hold on its moments, and travel
    // spacers between them move it. The PDF prints the sections alone.
    const film = invitation.design.film;
    const frames = film?.behind && print === undefined ? film.frames : undefined;
    const chapters = useMemo(
        () =>
            frames
                ? chaptersOf(
                      blocks.map((b) => b.filmAt),
                      film?.namesAt ?? 0,
                  )
                : [],
        [frames, blocks, film?.namesAt],
    );
    // Under the cover's names the film stays bright; behind other chapters' words it dims.
    const veilOf = (start: number) => (blocks[start]?.type === 'cover' ? 0 : 1);
    const travels = new Map(
        chapters.slice(1).map((c, order) => [
            c.start,
            {
                ...c,
                order,
            },
        ]),
    );

    // In the composer preview, bring the block that was just edited into view so its new look plays at once.
    const rootRef = useRef<HTMLDivElement>(null);
    usePrintFit(rootRef, print !== undefined);
    // What scrolls this invitation: the window live, the canvas frame in the editor.
    const scrollRoot = useRef<HTMLElement | null>(null);

    // Inside a preview frame the "screen" is the frame, not the browser window: full-screen scenes
    // size themselves from --inv-screen, so measure the frame and keep it current.
    useEffect(() => {
        const frame = scrollRoot.current;
        const root = rootRef.current;
        if (!embedded || !frame || !root) return;
        const measure = () => {
            root.style.setProperty('--inv-screen', `${String(frame.clientHeight)}px`);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(frame);
        return () => {
            observer.disconnect();
        };
    }, [embedded]);

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

    const page = (
        <>
            {!opened && (
                <StudioPreviewContext value={embedded}>
                    <Opening
                        kind={invitation.design.opening}
                        onBegin={begin}
                        onOpened={() => {
                            setOpened(true);
                            if (!embedded) window.scrollTo({ top: 0 });
                        }}
                    />
                </StudioPreviewContext>
            )}
            <main
                aria-hidden={!opened}
                // While the opening covers the page, its CSS animations (stitched medallions, stars,
                // processions) hold their first frame and resume together when it lifts.
                data-staging={opened ? undefined : ''}
                // Over a film the opening hands straight to the cover's names: no fade, so the hand-off is invisible.
                className={
                    frames
                        ? opened
                            ? 'relative'
                            : 'relative opacity-0'
                        : opened
                          ? 'animate-[fade-in_1.2s_var(--ease-silk)]'
                          : ''
                }
            >
                <PrintContext value={print !== undefined}>
                    <ScrollRootContext value={embedded ? scrollRoot : null}>
                        <ReplayOpeningContext value={replayOpening}>
                            <StageContext value={opened}>
                                <LazyMotion features={domAnimation} strict>
                                    {blocks.map((block, i) => {
                                        if (!isRendered(block.type)) return null;
                                        const Section = sectionRegistry[block.type];
                                        const travel = travels.get(i);
                                        return (
                                            <Fragment key={blockKey(block)}>
                                                {travel && (
                                                    <FilmTravel
                                                        from={travel.from}
                                                        to={travel.at}
                                                        veil={veilOf(i)}
                                                        order={travel.order}
                                                    />
                                                )}
                                                <Scene block={block} index={i}>
                                                    <Section variant={block.variant} />
                                                </Scene>
                                            </Fragment>
                                        );
                                    })}
                                </LazyMotion>
                                <Credits />
                                {print !== undefined ? <PrintClosing url={print} /> : <Branding />}
                            </StageContext>
                        </ReplayOpeningContext>
                    </ScrollRootContext>
                </PrintContext>
            </main>
        </>
    );

    return (
        <div
            ref={(el) => {
                rootRef.current = el;
                // Set during commit, before children's effects subscribe to scroll.
                scrollRoot.current = embedded ? findScrollParent(el) : null;
            }}
            className={`inv-root texture-${invitation.design.texture} min-h-svh`}
            data-print={print === undefined ? undefined : ''}
            style={designStyle(invitation.design)}
            dir={dir}
            lang={locale}
        >
            {frames ? (
                <FilmStage
                    frames={frames}
                    poster={film?.first}
                    first={chapters[0]?.at ?? 0}
                    firstVeil={veilOf(0)}
                    opened={opened}
                    scrollRoot={embedded ? scrollRoot : null}
                    still={tier === 'static'}
                >
                    {page}
                </FilmStage>
            ) : (
                page
            )}
            {opened && print === undefined && (
                <Chrome
                    player={player}
                    pdfHref={
                        !embedded &&
                        invitation.status === 'published' &&
                        invitation.extras.pdf?.enabled
                            ? `/api/i/${encodeURIComponent(invitation.slug)}/pdf`
                            : undefined
                    }
                />
            )}
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
    // The still, page-by-page edition the PDF is made from; the value is the live link for its QR.
    print?: string;
}

export function InvitationView({
    data,
    initialLocale,
    guest,
    embedded = false,
    skipOpening = false,
    print,
}: InvitationViewProps) {
    const tier = useMotionTier();
    return (
        <InviteProvider data={data} initialLocale={initialLocale} tier={tier} guest={guest}>
            <Experience
                embedded={embedded}
                skipOpening={skipOpening || Boolean(print)}
                print={print}
            />
        </InviteProvider>
    );
}
