// The portraits as the entry: the two of them greet the guest, unveiled from opposite ends with their
// names and families. A tap parts the halves like doors onto the two of them together, the couple
// are introduced, and the invitation takes over. The same scene as the "Two portraits" story and
// cover, driven by a timeline instead of the scroll.
import { animate, domAnimation, LazyMotion, useMotionValue } from 'motion/react';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { useInvite } from '../../context';
import { useFinish } from '../../openings/gesture';
import type { OpeningProps } from '../../openings/types';
import { PortraitsStage } from '../hero/Portraits';
import { StagePrompt } from './stage';

// Where the scene rests while it waits (portraits and names in), and where it ends (introduced).
const WAIT = 0.3;
const END = 0.8;

export function PortraitsOpening({ onBegin, onOpened }: OpeningProps) {
    const { tier, copy } = useInvite();
    const still = tier === 'static';
    const p = useMotionValue(still ? WAIT : 0);
    const finish = useFinish(onOpened);
    const [ready, setReady] = useState(still);
    const opening = useRef(false);
    const [tapped, setTapped] = useState(false);

    // The welcome plays by itself: the portraits unveil and the names arrive.
    useEffect(() => {
        if (still) return;
        const controls = animate(p, WAIT, {
            duration: 2.4,
            ease: [0.22, 1, 0.36, 1],
            onComplete: () => {
                setReady(true);
            },
        });
        return () => {
            controls.stop();
        };
    }, [p, still]);

    const open = () => {
        if (opening.current) return;
        opening.current = true;
        setTapped(true);
        onBegin();
        if (still) {
            finish(250);
            return;
        }
        // The doors part and the couple are introduced; then the invitation takes over.
        animate(p, END, {
            duration: 3,
            ease: [0.65, 0, 0.35, 1],
        });
        finish(3900);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        open();
    };

    return (
        <div
            className="inv-root fixed inset-0 z-50 touch-manipulation overflow-hidden select-none [-webkit-tap-highlight-color:transparent]"
            data-opening
        >
            <LazyMotion features={domAnimation} strict>
                <PortraitsStage p={p} mode="cover" />
            </LazyMotion>
            <div
                role="button"
                tabIndex={0}
                aria-label={copy('tapToOpen')}
                className="absolute inset-0 z-30 cursor-pointer outline-none"
                onClick={open}
                onKeyDown={onKeyDown}
            />
            <StagePrompt visible={ready && !tapped} at="middle">
                {copy('tapToOpen')}
            </StagePrompt>
        </div>
    );
}
