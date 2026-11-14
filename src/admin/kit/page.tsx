import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { Tone } from '../labels';

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    eyebrow?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

// PayD's PDAPageHeader: a title block on the page's grey ground, actions on the right.
export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
    return (
        <div
            className={cn(
                'page-header mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0">
                {eyebrow && (
                    <div className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                        {eyebrow}
                    </div>
                )}
                <h1 className="truncate text-xl leading-tight font-semibold text-foreground">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export interface Trend {
    /** Relative change, e.g. 0.12 for +12 %. */
    delta: number;
    label: string;
}

interface StatCardProps {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    icon?: ComponentType<{ className?: string }>;
    trend?: Trend | null;
    accent?: 'primary' | 'gold' | 'success' | 'danger' | 'muted';
    className?: string;
}

const accentClass = {
    primary: 'bg-primary/8 text-primary',
    gold: 'bg-gold/12 text-gold-deep',
    success: 'bg-success/10 text-success',
    danger: 'bg-destructive/10 text-destructive',
    muted: 'bg-muted text-muted-foreground',
} as const;

export function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    trend,
    accent = 'muted',
    className,
}: StatCardProps) {
    const up = trend ? trend.delta >= 0 : false;
    return (
        <Card className={cn('gap-0 py-0', className)}>
            <CardContent className="flex flex-col gap-1 p-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">{label}</span>
                    {Icon && (
                        <span
                            className={cn(
                                'flex size-8 items-center justify-center rounded-control',
                                accentClass[accent],
                            )}
                        >
                            <Icon className="size-4" />
                        </span>
                    )}
                </div>
                <div className="text-2xl leading-tight font-semibold text-foreground tabular-nums">
                    {value}
                </div>
                <div className="flex min-h-5 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {trend && Number.isFinite(trend.delta) && (
                        <Badge variant={up ? 'success' : 'danger'} className="gap-0.5 px-1.5">
                            {up ? <TrendingUp /> : <TrendingDown />}
                            {up ? '+' : ''}
                            {Math.round(trend.delta * 100)}%
                        </Badge>
                    )}
                    {trend && <span>{trend.label}</span>}
                    {hint && <span>{hint}</span>}
                </div>
            </CardContent>
        </Card>
    );
}

interface PanelProps {
    title: ReactNode;
    description?: ReactNode;
    icon?: ComponentType<{ className?: string }>;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

/** A titled card section used across detail pages. */
export function Panel({
    title,
    description,
    icon: Icon,
    action,
    children,
    className,
    contentClassName,
}: PanelProps) {
    return (
        // PayD's section card: p-4 header with a rule, text-base medium title, p-4 body.
        <Card className={cn('gap-0 py-0', className)}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 border-b p-4 [.border-b]:pb-4">
                <div className="grid min-w-0 gap-0.5">
                    <CardTitle className="flex items-center gap-2 text-base leading-snug font-medium">
                        {Icon && <Icon className="size-4" />}
                        {title}
                    </CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                {action}
            </CardHeader>
            <CardContent className={cn('p-4', contentClassName)}>{children}</CardContent>
        </Card>
    );
}

interface EmptyStateProps {
    icon?: ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    children?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    children,
    className,
}: EmptyStateProps) {
    return (
        <Empty className={cn('border border-dashed py-10', className)}>
            <EmptyHeader>
                {Icon && (
                    <EmptyMedia variant="icon">
                        <Icon />
                    </EmptyMedia>
                )}
                <EmptyTitle className="text-base">{title}</EmptyTitle>
                {description && <EmptyDescription>{description}</EmptyDescription>}
            </EmptyHeader>
            {children}
        </Empty>
    );
}

export function PageSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="Loading">
            <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-80" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-80 rounded-xl" />
        </div>
    );
}

interface ToneBadgeProps {
    tone: Tone | undefined;
    children: ReactNode;
    className?: string;
    dot?: boolean;
}

const dotClass: Record<Tone, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    info: 'bg-info',
    danger: 'bg-destructive',
    violet: 'bg-violet-600',
    muted: 'bg-muted-foreground/60',
};

export function ToneBadge({ tone = 'muted', children, className, dot = true }: ToneBadgeProps) {
    return (
        <Badge variant={tone} className={cn('gap-1.5 font-medium', className)}>
            {dot && <span className={cn('size-1.5 rounded-full', dotClass[tone])} />}
            {children}
        </Badge>
    );
}
