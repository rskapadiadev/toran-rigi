import { Link } from '@tanstack/react-router';
import { ArrowLeft, ExternalLink, Monitor } from 'lucide-react';
import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';

import { ToranSeal } from '@/components/brand/toran-seal';
import { Button } from '@/components/ui/button';

// A mouse/trackpad and room for three panels. Pointer matters: an iPad Pro in landscape is wide
// enough, but it is still a touch device and the editors need precise clicking and dragging.
const DESKTOP = '(pointer: fine) and (min-width: 1100px)';

function subscribe(onChange: () => void) {
    const mq = window.matchMedia(DESKTOP);
    mq.addEventListener('change', onChange);
    return () => {
        mq.removeEventListener('change', onChange);
    };
}

export function useIsDesktop(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(DESKTOP).matches,
        () => true,
    );
}

interface DesktopOnlyProps {
    // e.g. "The visual editor", "The Composer".
    tool: string;
    previewUrl?: string;
    children: ReactNode;
}

// Wraps a desktop-only workspace; on phones and tablets it explains why and offers a way out.
export function DesktopOnly({ tool, previewUrl, children }: DesktopOnlyProps) {
    const desktop = useIsDesktop();
    if (desktop) return <>{children}</>;
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-12 text-center">
            <ToranSeal className="size-20 text-primary" />
            <div className="mt-8 flex size-12 items-center justify-center rounded-full bg-muted">
                <Monitor className="size-6 text-muted-foreground" />
            </div>
            <h1 className="mt-5 text-xl font-semibold tracking-tight">
                {tool} opens on a desktop only
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                It can’t open on this device. Designing an invitation needs a larger screen and a
                mouse or trackpad, so please switch to a laptop or desktop computer.
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" asChild>
                    <Link to="/admin/invitations">
                        <ArrowLeft /> Back to invitations
                    </Link>
                </Button>
                {previewUrl && (
                    <Button asChild>
                        <a href={previewUrl} target="_blank" rel="noreferrer">
                            <ExternalLink /> View the invitation
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}
