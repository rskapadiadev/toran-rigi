import { formatMoney } from '@shared/money';
import { can } from '@shared/permissions';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
    AlarmClock,
    ArrowRight,
    CalendarHeart,
    CircleDollarSign,
    Clock,
    Inbox,
    Palette,
    Radio,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { PageHeader, PageSkeleton, Panel, StatCard, ToneBadge, type Trend } from '@/admin/kit/page';
import { OrderStatusBadge, slaFor } from '@/admin/kit/status';
import { boardColumns, cultureLabel } from '@/admin/labels';
import { activeStatuses, type Dashboard, type MoneyRow, type MonthAmount } from '@/admin/types';
import { useMe } from '@/admin/useMe';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { api } from '@/lib/api';
import { useNow } from '@/motion/hooks';

export const Route = createFileRoute('/admin/')({ component: DashboardPage });

const count = (d: Dashboard, statuses: string[]) =>
    d.byStatus.filter((s) => statuses.includes(s.status)).reduce((sum, s) => sum + s.n, 0);

/** The last six calendar months as YYYY-MM keys, oldest first. */
function lastMonths(now: number, n = 6) {
    const d = new Date(now);
    return Array.from({ length: n }, (_, i) => {
        const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - (n - 1 - i), 1));
        return m.toISOString().slice(0, 7);
    });
}

const monthLabel = (key: string) =>
    new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en', {
        month: 'short',
        timeZone: 'UTC',
    });

const sumFor = (rows: MonthAmount[], month: string, currency: string) =>
    rows
        .filter((r) => r.month === month && r.currency === currency)
        .reduce((s, r) => s + r.amount, 0);

const compactMoney = (minor: number, currency: string) =>
    new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-AE', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(minor / 100);

function greeting(now: number) {
    const h = new Date(now).getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function monthTrend(current: number, previous: number): Trend | null {
    if (previous === 0) return null;
    return {
        delta: (current - previous) / previous,
        label: 'vs last month',
    };
}

function DashboardPage() {
    const me = useMe().data;
    const now = useNow(60_000) ?? 0;
    const { data } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => api<Dashboard>('/admin/dashboard'),
    });
    const showMoney = can(me?.role, 'revenue.view') && (data?.money.length ?? 0) > 0;
    const firstName = me?.name.split(' ')[0] ?? '';
    const today = now
        ? new Date(now).toLocaleDateString('en', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
          })
        : '';

    return (
        <>
            <PageHeader
                eyebrow={today}
                title={
                    <>
                        {now ? greeting(now) : 'Welcome'}
                        {firstName ? `, ${firstName}` : ''}
                    </>
                }
                description="Everything happening at the studio, at a glance."
            />
            {!data || !now ? (
                <PageSkeleton />
            ) : (
                <div className="space-y-6">
                    <KpiRow data={data} now={now} showMoney={showMoney} />
                    <div className="grid gap-6 xl:grid-cols-3">
                        <TrendCard data={data} now={now} showMoney={showMoney} />
                        <PipelineCard data={data} />
                    </div>
                    <div className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        <DeliveriesCard data={data} now={now} />
                        <Panel
                            title="Upcoming celebrations"
                            description="Events in the next 60 days"
                            icon={CalendarHeart}
                            contentClassName="p-2"
                        >
                            {data.upcoming.length === 0 ? (
                                <QuietList>No events in the next 60 days.</QuietList>
                            ) : (
                                <ul>
                                    {data.upcoming.map((o) => (
                                        <li key={o.id}>
                                            <Link
                                                to="/admin/orders/$id"
                                                params={{ id: o.id }}
                                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/60"
                                            >
                                                <DateChip iso={o.weddingDate} />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate font-medium">
                                                        {o.customerName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {cultureLabel[o.culture] ?? o.culture} ·{' '}
                                                        {o.number}
                                                    </span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Panel>
                        <Panel
                            title="Recent orders"
                            icon={Inbox}
                            className="lg:col-span-2 xl:col-span-1"
                            contentClassName="p-2"
                            action={
                                <Button variant="ghost" size="xs" asChild>
                                    <Link to="/admin/orders">
                                        View all <ArrowRight className="rtl:rotate-180" />
                                    </Link>
                                </Button>
                            }
                        >
                            {data.recent.length === 0 ? (
                                <QuietList>Your first order will appear here.</QuietList>
                            ) : (
                                <ul>
                                    {data.recent.map((o) => (
                                        <li key={o.id}>
                                            <Link
                                                to="/admin/orders/$id"
                                                params={{ id: o.id }}
                                                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/60"
                                            >
                                                <span className="min-w-0">
                                                    <span className="block truncate font-medium">
                                                        {o.customerName}
                                                    </span>
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        {o.number}
                                                    </span>
                                                </span>
                                                <OrderStatusBadge status={o.status} />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Panel>
                    </div>
                </div>
            )}
        </>
    );
}

interface DashProps {
    data: Dashboard;
    now: number;
    showMoney: boolean;
}

const primaryMoney = (money: MoneyRow[]) =>
    [...money].sort((a, b) => b.collected + b.outstanding - (a.collected + a.outstanding))[0];

function KpiRow({ data, now, showMoney }: DashProps) {
    const active = count(data, activeStatuses);
    const live = count(data, ['published']);
    const money = primaryMoney(data.money);
    if (!showMoney || !money) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="New inquiries"
                    value={count(data, ['new_inquiry', 'quotation_sent'])}
                    icon={Inbox}
                />
                <StatCard label="Active projects" value={active} icon={Palette} accent="gold" />
                <StatCard
                    label="Awaiting payment"
                    value={count(data, ['awaiting_advance', 'awaiting_final_payment'])}
                    icon={Wallet}
                    accent="danger"
                />
                <StatCard label="Live invitations" value={live} icon={Radio} accent="success" />
            </div>
        );
    }
    const [prev, current] = lastMonths(now, 2);
    const trend = data.trend;
    const billedNow = money.billedMonth ?? 0;
    const billedPrev = trend && prev ? sumFor(trend.billed, prev, money.currency) : 0;
    const collectedNow = trend && current ? sumFor(trend.collected, current, money.currency) : 0;
    const collectedPrev = trend && prev ? sumFor(trend.collected, prev, money.currency) : 0;
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                label="Billed this month"
                value={formatMoney(billedNow, money.currency)}
                icon={CircleDollarSign}
                accent="primary"
                trend={monthTrend(billedNow, billedPrev)}
                hint={billedPrev === 0 ? `${money.currency} · first month on record` : undefined}
            />
            <StatCard
                label="Collected"
                value={formatMoney(money.collected, money.currency)}
                icon={Wallet}
                accent="success"
                trend={monthTrend(collectedNow, collectedPrev)}
                hint={
                    collectedPrev === 0
                        ? `${formatMoney(collectedNow, money.currency)} this month`
                        : undefined
                }
            />
            <StatCard
                label="Still to collect"
                value={formatMoney(money.outstanding, money.currency)}
                icon={Clock}
                accent={money.overdue > 0 ? 'danger' : 'gold'}
                hint={
                    money.overdue > 0 ? (
                        <span className="font-medium text-destructive">
                            {formatMoney(money.overdue, money.currency)} overdue
                        </span>
                    ) : (
                        'Nothing overdue'
                    )
                }
            />
            <StatCard
                label="Active projects"
                value={active}
                icon={Palette}
                accent="gold"
                hint={`${String(live)} live invitation${live === 1 ? '' : 's'}`}
            />
        </div>
    );
}

const revenueConfig = {
    billed: {
        label: 'Billed',
        color: 'var(--chart-1)',
    },
    collected: {
        label: 'Collected',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

const ordersConfig = {
    orders: {
        label: 'New orders',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

function TrendCard({ data, now, showMoney }: DashProps) {
    const [metric, setMetric] = useState<'revenue' | 'orders'>(showMoney ? 'revenue' : 'orders');
    const currencies = data.money.map((m) => m.currency);
    const [currency, setCurrency] = useState(primaryMoney(data.money)?.currency ?? 'INR');
    const months = lastMonths(now);
    const trend = data.trend ?? {
        orders: [],
        billed: [],
        collected: [],
    };
    const rows = months.map((m) => ({
        month: monthLabel(m),
        billed: sumFor(trend.billed, m, currency),
        collected: sumFor(trend.collected, m, currency),
        orders: trend.orders.find((o) => o.month === m)?.n ?? 0,
    }));
    const totalOrders = rows.reduce((s, r) => s + r.orders, 0);
    const totalBilled = rows.reduce((s, r) => s + r.billed, 0);
    const showRevenue = metric === 'revenue' && showMoney;

    return (
        <Card className="gap-4 xl:col-span-2">
            <CardHeader>
                <CardTitle className="text-sm font-semibold">
                    {showRevenue ? 'Revenue' : 'Orders'} · last 6 months
                </CardTitle>
                <CardDescription>
                    {showRevenue ? (
                        <>
                            <span className="text-lg font-semibold text-foreground">
                                {formatMoney(totalBilled, currency)}
                            </span>{' '}
                            billed
                        </>
                    ) : (
                        <>
                            <span className="text-lg font-semibold text-foreground">
                                {totalOrders}
                            </span>{' '}
                            new orders
                        </>
                    )}
                </CardDescription>
                <CardAction className="flex items-center gap-2">
                    {showRevenue && currencies.length > 1 && (
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger size="sm" className="w-20" aria-label="Currency">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end">
                                {currencies.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {showMoney && (
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            size="sm"
                            value={metric}
                            onValueChange={(v) => {
                                if (v === 'revenue' || v === 'orders') setMetric(v);
                            }}
                        >
                            <ToggleGroupItem value="revenue" className="px-3 text-xs">
                                Revenue
                            </ToggleGroupItem>
                            <ToggleGroupItem value="orders" className="px-3 text-xs">
                                Orders
                            </ToggleGroupItem>
                        </ToggleGroup>
                    )}
                </CardAction>
            </CardHeader>
            <CardContent className="px-2 sm:px-4">
                {showRevenue ? (
                    <ChartContainer config={revenueConfig} className="aspect-auto h-[260px] w-full">
                        <AreaChart
                            data={rows}
                            margin={{
                                left: 4,
                                right: 8,
                                top: 8,
                            }}
                        >
                            <defs>
                                <linearGradient id="fill-billed" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-billed)"
                                        stopOpacity={0.22}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-billed)"
                                        stopOpacity={0.02}
                                    />
                                </linearGradient>
                                <linearGradient id="fill-collected" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-collected)"
                                        stopOpacity={0.18}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-collected)"
                                        stopOpacity={0.02}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={64}
                                tickFormatter={(v: number) => compactMoney(v, currency)}
                            />
                            <ChartTooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={
                                    <ChartTooltipContent
                                        indicator="line"
                                        formatter={(value, name) => (
                                            <div className="flex w-full items-center justify-between gap-4">
                                                <span className="text-muted-foreground">
                                                    {name === 'billed' ? 'Billed' : 'Collected'}
                                                </span>
                                                <span className="font-mono font-medium text-foreground">
                                                    {formatMoney(Number(value), currency)}
                                                </span>
                                            </div>
                                        )}
                                    />
                                }
                            />
                            <Area
                                dataKey="billed"
                                type="monotone"
                                stroke="var(--color-billed)"
                                strokeWidth={2}
                                fill="url(#fill-billed)"
                                animationDuration={500}
                            />
                            <Area
                                dataKey="collected"
                                type="monotone"
                                stroke="var(--color-collected)"
                                strokeWidth={2}
                                fill="url(#fill-collected)"
                                animationDuration={500}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <ChartContainer config={ordersConfig} className="aspect-auto h-[260px] w-full">
                        <BarChart
                            data={rows}
                            margin={{
                                left: 4,
                                right: 8,
                                top: 8,
                            }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={32}
                                allowDecimals={false}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'var(--muted)' }}
                                content={<ChartTooltipContent />}
                            />
                            <Bar
                                dataKey="orders"
                                fill="var(--color-orders)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}

interface DataProps {
    data: Dashboard;
}

function PipelineCard({ data }: DataProps) {
    const columns = boardColumns.map((c) => ({
        title: c.title,
        n: count(data, c.statuses),
    }));
    const total = columns.reduce((s, c) => s + c.n, 0);
    return (
        <Panel
            title="Pipeline"
            description={`${String(total)} open and live orders by stage`}
            action={
                <Button variant="ghost" size="xs" asChild>
                    <Link to="/admin/orders">
                        Board <ArrowRight className="rtl:rotate-180" />
                    </Link>
                </Button>
            }
        >
            <ul className="space-y-4">
                {columns.map((c) => (
                    <li key={c.title} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground/85">{c.title}</span>
                            <span className="font-medium tabular-nums">{c.n}</span>
                        </div>
                        <Progress
                            value={total ? (c.n / total) * 100 : 0}
                            aria-label={`${c.title}: ${String(c.n)}`}
                            className="h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-primary/80"
                        />
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

interface NowProps {
    data: Dashboard;
    now: number;
}

function DeliveriesCard({ data, now }: NowProps) {
    return (
        <Panel
            title="Delivery deadlines"
            description="Projects due within 24 hours"
            icon={AlarmClock}
            contentClassName="p-2"
            action={
                data.dueSoon.some((o) => o.overdue) ? (
                    <ToneBadge tone="danger">
                        {data.dueSoon.filter((o) => o.overdue).length} late
                    </ToneBadge>
                ) : undefined
            }
        >
            {data.dueSoon.length === 0 ? (
                <QuietList>No deliveries due. Breathe ✦</QuietList>
            ) : (
                <ul>
                    {data.dueSoon.map((o) => {
                        const sla = slaFor(o.deliveryDueAt, now);
                        return (
                            <li key={o.id}>
                                <Link
                                    to="/admin/orders/$id"
                                    params={{ id: o.id }}
                                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/60"
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate font-medium">
                                            {o.customerName}
                                        </span>
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {o.packageCode} · {o.number}
                                        </span>
                                    </span>
                                    {sla && <ToneBadge tone={sla.tone}>{sla.label}</ToneBadge>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Panel>
    );
}

function QuietList({ children }: { children: string }) {
    return <p className="px-3 py-8 text-center text-sm text-muted-foreground">{children}</p>;
}

function DateChip({ iso }: { iso: string | null }) {
    const d = iso ? new Date(`${iso}T00:00:00Z`) : null;
    return (
        <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg border bg-background leading-none">
            <span className="text-[9px] font-semibold tracking-wider text-primary uppercase">
                {d?.toLocaleDateString('en', {
                    month: 'short',
                    timeZone: 'UTC',
                })}
            </span>
            <span className="mt-0.5 text-sm font-semibold">
                {d?.toLocaleDateString('en', {
                    day: 'numeric',
                    timeZone: 'UTC',
                })}
            </span>
        </span>
    );
}
