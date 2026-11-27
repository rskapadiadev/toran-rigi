import { MADE_CODE, MADE_HOURS, MADE_NAME, madePrice } from '@shared/made';
import { formatMoney } from '@shared/money';
import { occasionOf } from '@shared/occasions';
import { photoUrl } from '@shared/photos';
import { shopPrice } from '@shared/pricing';
import type { CreateOrderInput } from '@shared/schemas/admin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LayoutTemplate, UserRound } from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';
import { toast } from 'sonner';

import { PagePanel } from '@/admin/kit/card';
import { FormField } from '@/admin/kit/form';
import { Panel } from '@/admin/kit/page';
import { type TemplateRow, templatesQuery } from '@/admin/templates/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { api, ApiError, post } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formString } from '@/motion/hooks';

export const Route = createFileRoute('/admin/orders/new')({ component: NewOrder });

type OrderCurrency = 'INR' | 'USD';

function NewOrder() {
    const navigate = useNavigate();
    const client = useQueryClient();
    const { data: templates } = useQuery({
        ...templatesQuery,
        queryFn: () => api<TemplateRow[]>('/admin/templates'),
    });
    const [currency, setCurrency] = useState<OrderCurrency>('INR');
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [made, setMade] = useState(false);
    const madeAmount = madePrice(currency) ?? 0;
    const create = useMutation({
        mutationFn: (body: CreateOrderInput) => post<{ id: string }>('/admin/orders', body),
        onSuccess: async ({ id }) => {
            toast.success('Order, invoice and invitation created');
            await client.invalidateQueries();
            await navigate({
                to: '/admin/orders/$id',
                params: { id },
            });
        },
        onError: (e) =>
            toast.error(e instanceof ApiError ? e.message : 'Could not create the order'),
    });

    const live = (templates ?? []).filter((t) => t.status !== 'archived');
    const shown = live.filter((t) =>
        `${t.name} ${occasionOf(t.eventKind).name.en ?? ''}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
    );
    const picked = live.find((t) => t.id === templateId);
    const priceOf = (t: TemplateRow) => shopPrice(t.prices, t.comparePrices, currency);
    const design = picked ? (priceOf(picked)?.price ?? 0) : 0;
    const total = design + (made ? madeAmount : 0);

    const submit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!picked) {
            toast.error('Pick a design for this order');
            return;
        }
        const f = new FormData(e.currentTarget);
        create.mutate({
            customer: {
                name: formString(f, 'name'),
                email: formString(f, 'email'),
                phone: formString(f, 'phone') || undefined,
                country: currency === 'INR' ? 'IN' : 'US',
                city: formString(f, 'city') || undefined,
            },
            templateId: picked.id,
            packageCode: picked.fromPackage,
            addons: made ? [MADE_CODE] : [],
            currency,
            occasion: occasionOf(picked.eventKind).id,
            culture: (picked.culture.split('.')[0] ?? 'hindu') as CreateOrderInput['culture'],
            weddingDate: formString(f, 'weddingDate'),
            notes: formString(f, 'notes') || undefined,
        });
    };

    return (
        <PagePanel
            title="New order"
            subtitle="Creates the customer (if new), the order, its invoice and the invitation from the chosen design."
        >
            <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0 space-y-4">
                    <Panel
                        title="Customer"
                        icon={UserRound}
                        description="We match existing customers by email or phone."
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Name">
                                {(id) => (
                                    <Input
                                        id={id}
                                        name="name"
                                        required
                                        maxLength={120}
                                        autoComplete="off"
                                    />
                                )}
                            </FormField>
                            <FormField label="WhatsApp / phone">
                                {(id) => (
                                    <Input
                                        id={id}
                                        name="phone"
                                        type="tel"
                                        dir="ltr"
                                        placeholder="+91 98…"
                                    />
                                )}
                            </FormField>
                            <FormField label="Email">
                                {(id) => <Input id={id} name="email" type="email" />}
                            </FormField>
                            <FormField label="City">
                                {(id) => <Input id={id} name="city" />}
                            </FormField>
                            <FormField label="Event date">
                                {(id) => <Input id={id} name="weddingDate" type="date" />}
                            </FormField>
                            <div className="space-y-2">
                                <p className="text-[13px] font-medium text-foreground/80">
                                    Currency
                                </p>
                                <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={currency}
                                    aria-label="Currency"
                                    className="w-full"
                                    onValueChange={(v) => {
                                        if (v === 'INR' || v === 'USD') setCurrency(v);
                                    }}
                                >
                                    <ToggleGroupItem value="INR" className="flex-1">
                                        ₹ India
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="USD" className="flex-1">
                                        $ Outside India
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                    </Panel>
                    <Panel
                        title="Design"
                        icon={LayoutTemplate}
                        description="The occasion and tradition follow the design. Its own price is charged."
                    >
                        <Input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                            }}
                            placeholder="Search designs or occasions…"
                            aria-label="Search designs"
                            className="mb-3"
                        />
                        {!templates ? (
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[0, 1, 2].map((i) => (
                                    <Skeleton key={i} className="h-40 rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <RadioGroup
                                value={templateId ?? ''}
                                onValueChange={setTemplateId}
                                aria-label="Design"
                                className="grid max-h-[520px] grid-cols-2 gap-3 overflow-y-auto pe-1 sm:grid-cols-3 xl:grid-cols-4"
                            >
                                {shown.map((t) => {
                                    const price = priceOf(t);
                                    return (
                                        <Label
                                            key={t.id}
                                            htmlFor={`tpl-${t.id}`}
                                            className={cn(
                                                'relative flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-2 font-normal transition-all hover:border-gold/60',
                                                templateId === t.id &&
                                                    'border-primary bg-primary/[0.03] ring-1 ring-primary',
                                            )}
                                        >
                                            <RadioGroupItem
                                                id={`tpl-${t.id}`}
                                                value={t.id}
                                                className="absolute end-3 top-3 bg-card"
                                            />
                                            <span className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                                                {t.posterKey && (
                                                    <img
                                                        src={photoUrl(t.posterKey)}
                                                        alt=""
                                                        loading="lazy"
                                                        className="size-full object-cover object-top"
                                                    />
                                                )}
                                            </span>
                                            <span className="px-1">
                                                <span className="block truncate text-sm font-medium">
                                                    {t.name}
                                                </span>
                                                <span className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
                                                    <span className="truncate">
                                                        {occasionOf(t.eventKind).name.en}
                                                    </span>
                                                    {price && (
                                                        <span className="font-medium text-gold-deep tabular-nums">
                                                            {formatMoney(price.price, currency)}
                                                        </span>
                                                    )}
                                                </span>
                                            </span>
                                        </Label>
                                    );
                                })}
                            </RadioGroup>
                        )}
                    </Panel>
                </div>
                <div className="lg:sticky lg:top-0 lg:self-start">
                    <Card className="gap-4">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Summary</CardTitle>
                            <CardDescription>Invoice preview in {currency}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <p className="flex justify-between gap-3">
                                <span>
                                    {picked ? `${picked.name} invitation` : 'No design picked yet'}
                                </span>
                                <span className="tabular-nums">
                                    {formatMoney(design, currency)}
                                </span>
                            </p>
                            {made && (
                                <p className="flex justify-between gap-3">
                                    <span>{MADE_NAME}</span>
                                    <span className="tabular-nums">
                                        {formatMoney(madeAmount, currency)}
                                    </span>
                                </p>
                            )}
                            <div className="flex items-start gap-3 rounded-lg border border-dashed px-3 py-2.5">
                                <Switch id="made" checked={made} onCheckedChange={setMade} />
                                <Label htmlFor="made" className="grid gap-0.5 font-normal">
                                    <span className="text-sm font-medium">Done-for-you</span>
                                    <span className="text-xs text-muted-foreground">
                                        We make it from their details: first look in{' '}
                                        {String(MADE_HOURS)} hours. Needs their email.
                                    </span>
                                </Label>
                            </div>
                            <Separator />
                            <p className="flex items-baseline justify-between">
                                <span className="font-medium">Total</span>
                                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                                    {formatMoney(total, currency)}
                                </span>
                            </p>
                            <FormField label="Internal note">
                                {(id) => (
                                    <Textarea
                                        id={id}
                                        name="notes"
                                        rows={3}
                                        className="resize-none"
                                    />
                                )}
                            </FormField>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={create.isPending || !picked}
                            >
                                {create.isPending ? 'Creating…' : 'Create order & invoice'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </PagePanel>
    );
}
