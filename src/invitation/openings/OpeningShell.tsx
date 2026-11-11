import type { ReactNode } from 'react';

import { useInvite } from '../context';
import { s, type StringKey } from '../strings';

interface OpeningShellProps {
    children: ReactNode;
    onTap?: () => void;
    prompt?: StringKey;
    busy?: boolean;
    hidePrompt?: boolean;
    footer?: ReactNode;
}

// Full-screen stage shared by every opening ritual; the scene itself is the child.
export function OpeningShell({
    children,
    onTap,
    prompt = 'tapToOpen',
    busy = false,
    hidePrompt = false,
    footer,
}: OpeningShellProps) {
    const { data, t, locale, guest } = useInvite();
    const { couple } = data.invitation.content;
    return (
        <div className="inv-root fixed inset-0 z-50 overflow-hidden" data-opening>
            {children}
            <div
                className="pointer-events-none absolute inset-x-0 top-[9svh] z-20 flex flex-col items-center px-6 text-center"
                data-opening-title
            >
                {guest && (
                    <p className="mb-3 text-sm tracking-[0.3em] uppercase opacity-80">
                        {s('dearGuest', locale)} {guest.name}
                    </p>
                )}
                <h1 className="inv-display text-[clamp(2.2rem,8vw,4.5rem)] leading-none">
                    <span className="foil-text">{t(couple.one.name)}</span>
                    <span className="inv-script mx-3 text-[0.9em] opacity-90">
                        {s('and', locale)}
                    </span>
                    <span className="foil-text">{t(couple.two.name)}</span>
                </h1>
            </div>
            {!hidePrompt && onTap && (
                <button
                    type="button"
                    onClick={onTap}
                    disabled={busy}
                    className="absolute inset-x-0 bottom-[8svh] z-30 mx-auto flex w-fit flex-col items-center gap-3 rounded-full px-8 py-4 text-sm tracking-[0.25em] uppercase transition-opacity disabled:opacity-0"
                >
                    <span className="relative flex size-14 items-center justify-center rounded-full border border-(--inv-gold)">
                        <span className="absolute inset-0 animate-ping rounded-full border border-(--inv-gold) opacity-40" />
                        <span className="size-2.5 rounded-full bg-(--inv-gold)" />
                    </span>
                    {s(prompt, locale)}
                </button>
            )}
            {footer}
        </div>
    );
}
