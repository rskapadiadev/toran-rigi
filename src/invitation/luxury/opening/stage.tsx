// The pieces every luxury opening shares: the couple's names in foil above the object, the quiet
// gesture prompt at the foot, and the veil that hands over to the invitation's own colour.
import type { Ref } from 'react';

import { useInvite } from '../../context';
import { useCoverFacts } from '../../sections/covers';

interface TitleProps {
    // The opening fades this as its object takes over.
    titleRef?: Ref<HTMLDivElement>;
}

export function StageTitle({ titleRef }: TitleProps) {
    const { copy, names } = useInvite();
    const facts = useCoverFacts();
    return (
        <div
            ref={titleRef}
            className="pointer-events-none absolute inset-x-0 top-[11svh] z-20 flex flex-col items-center px-6 text-center text-[#f4ead6]"
        >
            {facts.guest && (
                <p className="mb-3 text-[11px] tracking-[0.4em] uppercase opacity-70">
                    {copy('dearGuest')} {facts.guest.name}
                </p>
            )}
            <h1 className="inv-display text-[clamp(2rem,7.5cqw,3.6rem)] leading-none">
                <span className="foil-text">{names.one}</span>
                {names.two && (
                    <>
                        <span className="inv-script mx-3 text-[0.8em] opacity-80">
                            {copy('and')}
                        </span>
                        <span className="foil-text">{names.two}</span>
                    </>
                )}
            </h1>
            {facts.dateText && (
                <p className="mt-4 text-[11px] tracking-[0.45em] uppercase opacity-60">
                    {facts.dateText}
                </p>
            )}
        </div>
    );
}

interface PromptProps {
    children: string;
    visible: boolean;
}

// A hairline that breathes above a whispered instruction; never a button, the object is the control.
export function StagePrompt({ children, visible }: PromptProps) {
    return (
        <p
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-[9svh] z-30 mx-auto flex w-fit flex-col items-center gap-2 text-[11px] tracking-[0.4em] text-[#f4ead6]/80 uppercase transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
            <span className="h-8 w-px animate-pulse bg-gradient-to-t from-transparent to-[#f4ead6]/80 motion-reduce:animate-none" />
            {children}
        </p>
    );
}

interface VeilProps {
    veilRef: Ref<HTMLDivElement>;
}

// The camera ends on the invitation's own colour, so the hand-off is seamless.
export function HandoffVeil({ veilRef }: VeilProps) {
    return (
        <div
            ref={veilRef}
            className="pointer-events-none absolute inset-0 z-40 bg-(--inv-bg) opacity-0"
        />
    );
}
