import { brandingHref, type BrandingStyle, DEFAULT_BRANDING } from '@shared/branding';
import type { ReactNode } from 'react';

import { ToranSeal } from '../components/brand/toran-seal';
import { cn } from '../lib/utils';
import { BrandingToran } from './BrandingToran';
import { useInvite } from './context';

interface MarkProps {
    style: BrandingStyle;
    href: string;
}

// The Toran seal turning slowly at partial strength, like the studio login's watermark.
function Seal({ className }: { className?: string }) {
    return (
        <ToranSeal
            title=""
            className={cn(
                'animate-[spin_24s_linear_infinite] text-(--inv-gold) opacity-60 motion-reduce:animate-none',
                className,
            )}
        />
    );
}

// The wordmark in Cinzel: engraved capitals that stay crisp at small sizes on any backdrop.
const wordmark = { fontFamily: "Cinzel, 'Cormorant Garamond Variable', serif" };

function Wordmark({ className }: { className?: string }) {
    return (
        <b className={cn('font-bold tracking-[0.16em]', className)} style={wordmark}>
            TORAN
        </b>
    );
}

const base =
    'inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase no-underline transition-opacity hover:opacity-100';

// One look of the mark. Kept small on purpose: a credit, never a banner.
export function BrandingMark({ style, href }: MarkProps) {
    const link = (children: ReactNode, className?: string) => (
        <a
            href={href}
            target="_blank"
            rel="noopener"
            aria-label="Created with Toran by TheRigi — make your own invitation"
            className={cn(base, className)}
        >
            {children}
        </a>
    );
    switch (style) {
        case 'seal':
            return link(
                <>
                    <Seal className="size-7" />
                    <span>
                        Created with <Wordmark /> · by TheRigi
                    </span>
                </>,
                'opacity-70',
            );
        case 'pill':
            return link(
                <>
                    <Seal className="size-5" />
                    <span>
                        Made with <Wordmark />
                    </span>
                    <span className="opacity-60">by TheRigi</span>
                </>,
                'rounded-full bg-(--inv-surface)/70 px-4 py-2 opacity-85 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.35)] ring-1 ring-(--inv-gold)/30 backdrop-blur',
            );
        case 'signature':
            return link(
                <span className="flex flex-col items-center gap-0.5 tracking-normal normal-case">
                    <Seal className="mb-1 size-8" />
                    <span className="text-[9px] tracking-[0.3em] uppercase opacity-70">
                        Created with
                    </span>
                    <Wordmark className="text-xl leading-none text-(--inv-gold)" />
                    <span className="text-[9px] tracking-[0.3em] uppercase opacity-70">
                        by TheRigi
                    </span>
                </span>,
                'opacity-80',
            );
        case 'stamp':
            return link(
                <span className="relative flex size-16 items-center justify-center rounded-full border border-current/40 text-[7px] leading-tight tracking-[0.22em] shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)]">
                    <Seal className="absolute inset-0 size-full opacity-25" />
                    <span className="text-center">
                        Made with
                        <br />
                        <Wordmark className="text-[10px]" />
                        <br />
                        TheRigi
                    </span>
                </span>,
                'opacity-60',
            );
        case 'line':
            return link(
                <>
                    <Seal className="size-6" />
                    <span>
                        Created with <Wordmark /> · by TheRigi
                    </span>
                </>,
                'opacity-60',
            );
    }
}

// The foot of every invitation: a small credit linking to the studio, in the style chosen for it.
export function Branding() {
    const { data } = useInvite();
    const style = data.invitation.extras.branding?.style ?? DEFAULT_BRANDING;
    const dark = data.invitation.extras.branding?.dark ?? false;
    return (
        // Template previews keep a booking bar at the foot of the screen; leave room above it.
        <footer
            className={cn(
                'flex justify-center',
                dark && 'bg-[#120b0d] text-[#f4ece0] [--inv-gold:#e2c27a]',
                data.invitation.isDemo ? 'pb-28' : 'pb-10',
            )}
            data-branding
        >
            <div className="flex w-full flex-col items-center gap-3">
                <BrandingToran />
                <div className="px-6">
                    <BrandingMark style={style} href={brandingHref(data.invitation.slug)} />
                </div>
            </div>
        </footer>
    );
}
