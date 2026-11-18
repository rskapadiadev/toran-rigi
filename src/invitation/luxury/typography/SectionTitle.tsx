// Every chapter's title, in the invitation's chosen style (design.titles): a small gold kicker, or
// a large gold script title with the section's divider beneath, like a hand-lettered card.
import type { ReactNode } from 'react';

import { Reveal } from '../../../motion/Reveal';
import { useInvite } from '../../context';
import { SectionDivider } from './dividers';

interface Props {
    children: ReactNode;
    // The caller draws the divider itself straight after, so script titles mustn't add another.
    ownDivider?: boolean;
    className?: string;
}

export function useScriptTitles() {
    const { data } = useInvite();
    return data.invitation.design.titles === 'script';
}

export function SectionTitle({ children, ownDivider = false, className = '' }: Props) {
    const script = useScriptTitles();
    if (!script)
        return (
            <Reveal className={className}>
                <p className="text-xs tracking-[0.4em] text-(--inv-gold) uppercase">{children}</p>
            </Reveal>
        );
    return (
        <Reveal className={className}>
            <h2 className="inv-script text-[clamp(2.5rem,12cqw,4.2rem)] leading-[1.1] text-balance text-(--inv-gold)">
                {children}
            </h2>
            {!ownDivider && <SectionDivider />}
        </Reveal>
    );
}
