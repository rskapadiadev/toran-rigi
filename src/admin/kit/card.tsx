// PayD's PDACard + PDACardHeading: a page is ONE card — heading, tabs and actions in its header,
// the content in its body, pagination or totals in a tinted footer that never scrolls away.
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PanelCardProps {
    /** Custom header content. Prefer `title` / `subtitle` / `actions`. */
    header?: ReactNode;
    title?: ReactNode;
    /** A muted prefix, so "Billing | Invoices" emphasises the view. */
    section?: string;
    subtitle?: ReactNode;
    /** Right side of the header: search, Filter, a switcher, the primary button — in that order. */
    actions?: ReactNode;
    /** Pagination, totals, or anything else that should not scroll away. */
    footer?: ReactNode;
    children: ReactNode;
    /** Off for a table, so it runs edge to edge under the header. */
    padded?: boolean;
    /** Fill the parent's remaining height; the body scrolls. Long tables only. */
    fill?: boolean;
    tone?: 'default' | 'destructive';
    className?: string;
    contentClassName?: string;
}

export function PanelCard({
    header,
    title,
    section,
    subtitle,
    actions,
    footer,
    children,
    padded = true,
    fill = false,
    tone = 'default',
    className,
    contentClassName,
}: PanelCardProps) {
    const heading =
        header ??
        (title === undefined ? undefined : (
            <CardHeading title={title} section={section} subtitle={subtitle} actions={actions} />
        ));
    return (
        <section
            data-slot="panel-card"
            className={cn(
                // A hairline ring, not a border and shadow. min-w-0: never widens its row.
                // shrink-0: inside a flex column page, overflow-hidden would otherwise let the card be
                // squashed to the viewport, clipping its last rows and its footer.
                'group/card flex min-w-0 shrink-0 flex-col overflow-hidden rounded-xl text-sm text-card-foreground ring-1',
                tone === 'destructive'
                    ? 'bg-destructive/5 ring-destructive/30'
                    : 'bg-card ring-foreground/10',
                // The PARENT's remaining height (desktop); never shorter than a usable table.
                fill && 'lg:min-h-80 lg:flex-1 lg:shrink',
                className,
            )}
        >
            {heading && (
                <header
                    className={cn(
                        // Stacks on a phone; a wrapping row from sm, one row from xl.
                        'flex shrink-0 flex-col flex-wrap gap-3 rounded-t-xl border-b p-4 sm:flex-row sm:items-start sm:justify-between',
                        'xl:flex-nowrap',
                    )}
                >
                    {heading}
                </header>
            )}
            <div
                className={cn(
                    'min-w-0 flex-1',
                    fill ? 'lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden' : 'overflow-visible',
                    padded && 'p-4',
                    contentClassName,
                )}
            >
                {children}
            </div>
            {footer && (
                // py-2 keeps a pagination row compact.
                <footer className="shrink-0 rounded-b-xl border-t bg-muted/50 px-4 py-2">
                    {footer}
                </footer>
            )}
        </section>
    );
}

interface CardHeadingProps {
    title: ReactNode;
    section?: string;
    subtitle?: ReactNode;
    actions?: ReactNode;
    leading?: ReactNode;
}

// Every table page wants the same three things: title, a line of context, its controls.
export function CardHeading({ title, section, subtitle, actions, leading }: CardHeadingProps) {
    return (
        <>
            <div className="flex min-w-0 items-start gap-3 xl:flex-1">
                {leading}
                <div className="grid min-w-0 gap-0.5">
                    <h2 data-slot="card-title" className="text-base leading-snug font-medium">
                        {section && (
                            <>
                                <span className="font-normal text-muted-foreground">{section}</span>
                                <span
                                    aria-hidden
                                    className="mx-1.5 font-normal text-muted-foreground/60"
                                >
                                    |
                                </span>
                            </>
                        )}
                        {title}
                    </h2>
                    {subtitle && (
                        <p
                            data-slot="card-description"
                            className="line-clamp-2 text-sm text-muted-foreground"
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </>
    );
}

interface PagePanelProps {
    title: ReactNode;
    subtitle?: ReactNode;
    /** Beside the heading: back, ⋯, a primary action. */
    actions?: ReactNode;
    /** Save, pagination — anything that must stay reachable. Pinned. */
    footer?: ReactNode;
    children: ReactNode;
}

// PayD's PagePanel: the ONE card a detail or form page lives in — pinned heading, a softly tinted
// scrolling body holding the section cards, an optional pinned footer.
export function PagePanel({ title, subtitle, actions, footer, children }: PagePanelProps) {
    return (
        <PanelCard
            fill
            title={title}
            subtitle={subtitle}
            actions={actions}
            footer={footer}
            padded={false}
            className="overflow-clip"
            contentClassName="lg:overflow-clip"
        >
            <div className="overscroll-none bg-background/50 p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                {children}
            </div>
        </PanelCard>
    );
}
