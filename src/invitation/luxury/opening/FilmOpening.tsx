// A filmed opening: the studio's short clip waits on its first frame; a tap plays it, the couple's
// names rise at the scene's brightest moment, and the clip comes to rest on its last frame, which
// is exactly what the Film still cover shows, so the hand-off to the invitation is invisible.
import { photoUrl } from '@shared/photos';
import { useReducedMotion } from 'motion/react';
import { type CSSProperties, type ReactNode, use, useEffect, useRef, useState } from 'react';

import { useInvite } from '../../context';
import { type FilmStageValue, useFilmStage } from '../../film/FilmStage';
import { DiyaOpening } from '../../openings/DiyaOpening';
import { useFinish } from '../../openings/gesture';
import { OpeningShell } from '../../openings/OpeningShell';
import type { OpeningProps } from '../../openings/types';
import { useCoverFacts } from '../../sections/covers';
import { StudioPreviewContext } from '../../studio';
import { StagePrompt } from './stage';

interface FrameProps {
    children: ReactNode;
    // A still blurred behind the frame, filling wide screens either side of the upright film.
    fill?: string;
}

// The film is upright (9:16): it covers a phone edge to edge and stands centred on wide screens.
export function FilmFrame({ children, fill }: FrameProps) {
    return (
        <div className="absolute inset-0 overflow-hidden bg-black">
            {fill && (
                <img
                    src={fill}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-2xl"
                />
            )}
            <div className="[container-type:size] absolute inset-y-0 start-1/2 aspect-[9/16] h-full -translate-x-1/2 rtl:translate-x-1/2">
                {children}
            </div>
        </div>
    );
}

// The upright 9:16 column the names sit in, matching how the film is fitted on every screen.
export function FilmColumn({ children }: { children: ReactNode }) {
    return (
        <div className="[container-type:size] absolute inset-y-0 start-1/2 aspect-[9/16] h-full -translate-x-1/2 rtl:translate-x-1/2">
            {children}
        </div>
    );
}

interface NamesProps {
    shown: boolean;
    // The cover starts with the names already in place; the opening raises them.
    instant?: boolean;
}

// The names in the film's night sky: a small kicker, the two names in gold script, the date.
// Plain CSS transitions: openings render outside the invitation's Motion feature bundle.
export function FilmNames({ shown, instant = false }: NamesProps) {
    const { copy, occasion } = useInvite();
    const facts = useCoverFacts();
    const kicker = occasion.id === 'wedding' ? copy('theWeddingOf') : copy('saveTheDate');
    const line = (delay: number): CSSProperties => ({
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(18px)',
        transition: instant
            ? 'none'
            : `opacity 1.4s cubic-bezier(0.22,1,0.36,1) ${String(delay)}s, transform 1.4s cubic-bezier(0.22,1,0.36,1) ${String(delay)}s`,
    });
    return (
        <div className="pointer-events-none absolute inset-x-0 top-[5.5%] z-20 flex flex-col items-center px-[14%] text-center text-[#f6ead2]">
            {facts.guest && (
                <p
                    className="mb-2 text-[11px] tracking-[0.4em] uppercase opacity-75"
                    style={line(0)}
                >
                    {copy('dearGuest')} {facts.guest.name}
                </p>
            )}
            <p
                className="text-[clamp(0.6rem,2.3cqh,0.78rem)] tracking-[0.45em] uppercase"
                style={line(0.1)}
            >
                {kicker}
            </p>
            <h1
                className="inv-script mt-[1.6cqh] text-[clamp(2.3rem,6.6cqh,4.2rem)] leading-[1.02] drop-shadow-[0_2px_14px_rgba(255,196,110,0.45)]"
                style={line(0.35)}
            >
                <span className="foil-text block">{facts.one}</span>
                {facts.two && (
                    <>
                        <span className="block text-[0.45em] opacity-85">{facts.and}</span>
                        <span className="foil-text block">{facts.two}</span>
                    </>
                )}
            </h1>
            {facts.dateText && (
                <p
                    className="mt-[1.8cqh] text-[clamp(0.56rem,2cqh,0.7rem)] tracking-[0.42em] uppercase opacity-80"
                    style={line(0.9)}
                >
                    {facts.dateText}
                </p>
            )}
        </div>
    );
}

// The film's foot melts into the invitation's own colour, in the opening and on the cover alike.
export function FilmFoot({ shown }: { shown: boolean }) {
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[16%] bg-gradient-to-b from-transparent to-(--inv-bg) transition-opacity duration-[1600ms] ${shown ? 'opacity-100' : 'opacity-0'}`}
        />
    );
}

const DEFAULT_NAMES_AT = 0.55;
// Milliseconds after which the film starts downloading even if the page is still loading.
const WARM_AFTER = 4000;

interface BehindProps extends OpeningProps {
    stage: FilmStageValue;
    namesAt: number;
    still: boolean;
}

// With the film behind the whole invitation, the opening is only a tap over it: the tap plays the
// film to the first chapter's moment and the names rise on the way, then the page takes over.
function BehindOpening({ onBegin, onOpened, stage, namesAt, still }: BehindProps) {
    const { copy } = useInvite();
    const [phase, setPhase] = useState<'ready' | 'playing' | 'named'>('ready');
    const finish = useFinish(onOpened);
    const raf = useRef(0);
    useEffect(() => {
        stage.time.set(0);
        return () => {
            cancelAnimationFrame(raf.current);
        };
    }, [stage]);
    const begin = () => {
        onBegin();
        const target = stage.first;
        if (still) {
            stage.time.set(target);
            setPhase('named');
            finish(1200);
            return;
        }
        setPhase('playing');
        const start = performance.now();
        let named = false;
        const step = (now: number) => {
            const t = Math.min(target, (now - start) / 1000);
            stage.time.set(t);
            if (!named && t >= Math.min(namesAt, target)) {
                named = true;
                setPhase('named');
            }
            if (t < target) raf.current = requestAnimationFrame(step);
            else finish(1400);
        };
        raf.current = requestAnimationFrame(step);
    };
    return (
        <div
            className="fixed inset-0 z-50 touch-manipulation select-none [-webkit-tap-highlight-color:transparent]"
            data-opening
        >
            <FilmColumn>
                <FilmNames shown={phase === 'named'} />
            </FilmColumn>
            {phase === 'ready' && (
                <button
                    type="button"
                    aria-label={copy('tapToOpen')}
                    className="absolute inset-0 cursor-pointer"
                    onClick={begin}
                />
            )}
            <StagePrompt visible={phase === 'ready'}>{copy('tapToOpen')}</StagePrompt>
        </div>
    );
}

export function FilmOpening({ onBegin, onOpened }: OpeningProps) {
    const { data, tier, copy } = useInvite();
    const film = data.invitation.design.film;
    const reduced = useReducedMotion();
    const video = useRef<HTMLVideoElement>(null);
    const [phase, setPhase] = useState<'ready' | 'playing' | 'named'>('ready');
    const finish = useFinish(onOpened);
    const studio = use(StudioPreviewContext);
    const stage = useFilmStage();
    // The film waits for the page's code, fonts and pictures: fetched alongside them, its 2 MB starves
    // them on a slow line. A tap before then still plays it straight away.
    useEffect(() => {
        const warm = () => {
            if (video.current) video.current.preload = 'auto';
        };
        if (document.readyState === 'complete') warm();
        window.addEventListener('load', warm, { once: true });
        const late = window.setTimeout(warm, WARM_AFTER);
        return () => {
            window.removeEventListener('load', warm);
            window.clearTimeout(late);
        };
    }, []);
    // Guests without a film get the diya; the studio sees where its film will go instead.
    if (!film && studio)
        return (
            <OpeningShell
                hideTitle
                hidePrompt
                onTap={() => {
                    onBegin();
                    finish(0);
                }}
            >
                <FilmFrame>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,#1b2550,#05070f_70%)]" />
                    <FilmNames shown />
                    <div className="absolute inset-x-[12%] top-[52%] flex flex-col items-center gap-3 text-center text-[#f6ead2]">
                        <svg viewBox="0 0 24 24" className="size-9 text-(--inv-gold)" aria-hidden>
                            <path
                                d="M4 9h16v10H4zM4 9l2.5-4.5 2.4 1.4L6.4 10M9.5 6.8l2.4 1.4M14 5.4l2.4 1.4M4 9l16-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <p className="text-[11px] tracking-[0.4em] uppercase">Film opening</p>
                        <p className="max-w-[30ch] text-sm leading-relaxed opacity-75">
                            Your film plays here. Upload it in the editor under Design, Opening,
                            Film. Guests see the diya until then.
                        </p>
                    </div>
                </FilmFrame>
                <StagePrompt visible>{copy('tapToOpen')}</StagePrompt>
            </OpeningShell>
        );
    if (!film) return <DiyaOpening onBegin={onBegin} onOpened={onOpened} />;

    const still = tier === 'static' || reduced === true;
    if (stage)
        return (
            <BehindOpening
                onBegin={onBegin}
                onOpened={onOpened}
                stage={stage}
                namesAt={film.namesAt ?? stage.first}
                still={still}
            />
        );
    const first = film.first ? photoUrl(film.first) : undefined;
    const last = film.last ? photoUrl(film.last) : first;
    const named = phase === 'named' || still;

    const begin = () => {
        onBegin();
        const clip = video.current;
        if (still || !clip) {
            finish(0);
            return;
        }
        setPhase('playing');
        // Low-power mode and some in-app browsers refuse to play: show the names on the still instead.
        clip.play().catch(() => {
            setPhase('named');
            finish(2200);
        });
    };
    const tick = () => {
        const clip = video.current;
        if (!clip || phase !== 'playing') return;
        const at = film.namesAt ?? clip.duration * DEFAULT_NAMES_AT;
        if (clip.currentTime >= at) setPhase('named');
    };

    return (
        <OpeningShell hideTitle hidePrompt onTap={phase === 'ready' ? begin : undefined}>
            <FilmFrame fill={first}>
                {still ? (
                    last && <img src={last} alt="" className="size-full object-cover" />
                ) : (
                    <video
                        ref={video}
                        src={photoUrl(film.src)}
                        poster={first}
                        preload="none"
                        muted
                        playsInline
                        disablePictureInPicture
                        aria-hidden
                        onTimeUpdate={tick}
                        onEnded={() => {
                            setPhase('named');
                            // Rest on the last frame with the names a moment, then become the cover.
                            finish(1600);
                        }}
                        className="size-full object-cover"
                    />
                )}
                <FilmNames shown={named} />
                <FilmFoot shown={named} />
            </FilmFrame>
            <StagePrompt visible={phase === 'ready'}>{copy('tapToOpen')}</StagePrompt>
        </OpeningShell>
    );
}
