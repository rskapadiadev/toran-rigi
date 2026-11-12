import type { ReactNode } from 'react';

import { useInvite } from '../context';
import type { StringKey } from '../strings';

interface OpeningShellProps {
    children: ReactNode;
    onTap?: () => void;
    prompt?: StringKey;
    busy?: boolean;
    hidePrompt?: boolean;
    footer?: ReactNode;
    hideTitle?: boolean;
}

// Full-screen stage shared by every opening ritual; the scene itself is the child.
export function OpeningShell({
    children,
    onTap,
    prompt = 'tapToOpen',
    busy = false,
    hidePrompt = false,
    footer,
    hideTitle = false,
}: OpeningShellProps) {
    const { guest, copy, names } = useInvite();
    return (
        <div className="inv-root fixed inset-0 z-50 overflow-hidden" data-opening>
            {children}
            {!hideTitle && (
                <div
                    className="pointer-events-none absolute inset-x-0 top-[9svh] z-20 flex flex-col items-center px-6 text-center"
                    data-opening-title
                >
                    {/* A soft veil keeps the name legible over busy scenes (carved doors, letter curtains). */}
                    <div className="max-w-full rounded-3xl bg-(--inv-bg)/70 px-6 py-4 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md">
                        {guest && (
                            <p className="mb-3 text-sm tracking-[0.3em] uppercase opacity-80">
                                {copy('dearGuest')} {guest.name}
                            </p>
                        )}
                        <h1 className="inv-display text-[clamp(2.2rem,8cqw,4.5rem)] leading-none">
                            <span className="foil-text">{names.one}</span>
                            {names.two && (
                                <>
                                    <span className="inv-script mx-3 text-[0.9em] opacity-90">
                                        {copy('and')}
                                    </span>
                                    <span className="foil-text">{names.two}</span>
                                </>
                            )}
                        </h1>
                    </div>
                </div>
            )}
            {!hidePrompt && onTap && (
                <button
                    type="button"
                    onClick={onTap}
                    disabled={busy}
                    className="absolute inset-x-0 bottom-[8svh] z-30 mx-auto flex w-fit flex-col items-center gap-3 rounded-3xl bg-(--inv-bg)/70 px-8 py-4 text-sm tracking-[0.25em] uppercase shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md transition-opacity disabled:opacity-0"
                >
                    <span className="relative flex size-14 items-center justify-center rounded-full border border-(--inv-gold)">
                        <span className="absolute inset-0 animate-ping rounded-full border border-(--inv-gold) opacity-40" />
                        <span className="size-2.5 rounded-full bg-(--inv-gold)" />
                    </span>
                    {copy(prompt)}
                </button>
            )}
            {footer}
        </div>
    );
}
