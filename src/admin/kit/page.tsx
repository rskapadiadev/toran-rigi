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

export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
    return (
        <div
            className={cn(
                'mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0 space-y-1">
                {eyebrow && (
                    <div className="text-xs font-medium tracking-wide text-muted-foreground">
                        {eyebrow}
                    </div>
                )}
                <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
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
            <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                    {Icon && (
                        <span
                            className={cn(
                                'flex size-8 items-center justify-center rounded-lg',
                                accentClass[accent],
                            )}
                        >
                            <Icon className="size-4" />
                        </span>
                    )}
                </div>
                <div className="text-[1.75rem] leading-none font-semibold tracking-tight text-foreground">
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
        <Card className={cn('gap-0 py-0', className)}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 border-b px-5 py-4 [.border-b]:pb-4">
                <div className="min-w-0 space-y-1">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        {Icon && <Icon className="size-4 text-muted-foreground" />}
                        {title}
                    </CardTitle>
                    {description && (
                        <CardDescription className="text-xs">{description}</CardDescription>
                    )}
                </div>
                {action}
            </CardHeader>
            <CardContent className={cn('p-5', contentClassName)}>{children}</CardContent>
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
