import { cultureIds } from '@shared/cultures';
import { currencies, type Currency, formatMoney } from '@shared/money';
import { occasionOf } from '@shared/occasions';
import type { CreateOrderInput } from '@shared/schemas/admin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CalendarHeart, Gift, Package, UserRound } from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';
import { toast } from 'sonner';

import { FormField } from '@/admin/kit/form';
import { OccasionSelect } from '@/admin/kit/occasion';
import { PageHeader, Panel } from '@/admin/kit/page';
import { cultureLabel } from '@/admin/labels';
import type { Catalog } from '@/admin/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { api, ApiError, post } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formString } from '@/motion/hooks';

export const Route = createFileRoute('/admin/orders/new')({ component: NewOrder });

function NewOrder() {
    const navigate = useNavigate();
    const client = useQueryClient();
    const { data: catalog } = useQuery({
        queryKey: ['catalog'],
        queryFn: () => api<Catalog>('/admin/catalog'),
    });
    const [currency, setCurrency] = useState<Currency>('INR');
    const [pkg, setPkg] = useState('signature');
    const [addons, setAddons] = useState<string[]>([]);
    const create = useMutation({
        mutationFn: (body: CreateOrderInput) => post<{ id: string }>('/admin/orders', body),
        onSuccess: async ({ id }) => {
            toast.success('Order and invoice created');
            await client.invalidateQueries();
            await navigate({
                to: '/admin/orders/$id',
                params: { id },
            });
        },
        onError: (e) =>
            toast.error(e instanceof ApiError ? e.message : 'Could not create the order'),
    });

    const pkgInfo = catalog?.packages.find((p) => p.code === pkg);
    const pkgPrice = pkgInfo?.prices[currency] ?? 0;
    const addonPrice = (code: string) =>
        catalog?.addons.find((a) => a.code === code)?.prices[currency] ?? 0;
    const total = pkgPrice + addons.reduce((sum, code) => sum + addonPrice(code), 0);
    const advance = pkg === 'signature' ? total : Math.ceil(total / 2);

    const submit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        create.mutate({
            customer: {
                name: formString(f, 'name'),
                email: formString(f, 'email'),
                phone: formString(f, 'phone') || undefined,
                country: currency === 'AED' ? 'AE' : 'IN',
                city: formString(f, 'city') || undefined,
            },
            packageCode: pkg,
            addons,
            currency,
            occasion: occasionOf(formString(f, 'occasion')).id,
            culture: (formString(f, 'culture') || 'hindu') as CreateOrderInput['culture'],
            weddingDate: formString(f, 'weddingDate'),
            notes: formString(f, 'notes') || undefined,
        });
    };

    return (
        <>
            <PageHeader
                title="New order"
                description="Creates the customer (if new), the order and its invoice in one step."
            />
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0 space-y-6">
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
                        </div>
                    </Panel>
                    <Panel title="Occasion" icon={CalendarHeart}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Occasion">
                                {(id) => (
                                    <OccasionSelect
                                        id={id}
                                        name="occasion"
                                        defaultValue="wedding"
                                    />
                                )}
                            </FormField>
                            <FormField label="Tradition">
                                {(id) => (
                                    <Select name="culture" defaultValue="hindu">
                                        <SelectTrigger id={id} className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cultureIds.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {cultureLabel[c]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
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
                                        const next = currencies.find((c) => c === v);
                                        if (next) setCurrency(next);
                                    }}
                                >
                                    {currencies.map((c) => (
                                        <ToggleGroupItem key={c} value={c} className="flex-1">
                                            {c}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                        </div>
                    </Panel>
                    <Panel title="Package" icon={Package}>
                        {!catalog ? (
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[0, 1, 2].map((i) => (
                                    <Skeleton key={i} className="h-28 rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <RadioGroup
                                value={pkg}
                                onValueChange={setPkg}
                                aria-label="Package"
                                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                            >
                                {catalog.packages.map((p) => (
                                    <Label
                                        key={p.code}
                                        htmlFor={`pkg-${p.code}`}
                                        className={cn(
                                            'relative flex cursor-pointer flex-col items-start gap-1 rounded-xl border bg-card p-4 font-normal transition-all hover:border-gold/60',
                                            pkg === p.code &&
                                                'border-primary bg-primary/[0.03] ring-1 ring-primary',
                                        )}
                                    >
                                        <RadioGroupItem
                                            id={`pkg-${p.code}`}
                                            value={p.code}
                                            className="absolute end-4 top-4"
                                        />
                                        <span className="font-display text-xl font-semibold">
                                            {p.name}
                                        </span>
                                        <span className="text-sm font-medium text-gold-deep tabular-nums">
                                            {formatMoney(p.prices[currency] ?? 0, currency)}
                                        </span>
                                        <span className="text-xs leading-relaxed text-muted-foreground">
                                            {p.tagline}
                                        </span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        )}
                    </Panel>
                    <Panel
                        title="Add-ons"
                        icon={Gift}
                        description="Optional extras, added to the same invoice."
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            {catalog?.addons.map((a) => {
                                const on = addons.includes(a.code);
                                return (
                                    <Label
                                        key={a.code}
                                        htmlFor={`addon-${a.code}`}
                                        className={cn(
                                            'flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3.5 font-normal transition-all hover:border-gold/60',
                                            on && 'border-gold bg-gold/5',
                                        )}
                                    >
                                        <Checkbox
                                            id={`addon-${a.code}`}
                                            checked={on}
                                            className="mt-0.5"
                                            onCheckedChange={(checked) => {
                                                setAddons(
                                                    checked === true
                                                        ? [...addons, a.code]
                                                        : addons.filter((x) => x !== a.code),
                                                );
                                            }}
                                        />
                                        <span className="flex-1 space-y-0.5">
                                            <span className="flex justify-between gap-2 text-sm font-medium">
                                                {a.name}
                                                <span className="text-gold-deep tabular-nums">
                                                    {formatMoney(a.prices[currency] ?? 0, currency)}
                                                </span>
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {a.description}
                                            </span>
                                        </span>
                                    </Label>
                                );
                            })}
                        </div>
                    </Panel>
                </div>
                <div className="lg:sticky lg:top-20 lg:self-start">
                    <Card className="gap-4">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Summary</CardTitle>
                            <CardDescription>Invoice preview in {currency}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <p className="flex justify-between">
                                <span>{pkgInfo?.name ?? pkg}</span>
                                <span className="tabular-nums">
                                    {formatMoney(pkgPrice, currency)}
                                </span>
                            </p>
                            {addons.map((code) => (
                                <p
                                    key={code}
                                    className="flex justify-between text-muted-foreground"
                                >
                                    <span>
                                        {catalog?.addons.find((x) => x.code === code)?.name}
                                    </span>
                                    <span className="tabular-nums">
                                        {formatMoney(addonPrice(code), currency)}
                                    </span>
                                </p>
                            ))}
                            <Separator />
                            <p className="flex items-baseline justify-between">
                                <span className="font-medium">Total</span>
                                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                                    {formatMoney(total, currency)}
                                </span>
                            </p>
                            <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                                Advance due:{' '}
                                <span className="font-medium text-foreground">
                                    {formatMoney(advance, currency)}
                                </span>{' '}
                                ({pkg === 'signature' ? '100%' : '50%'})
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
                                disabled={create.isPending}
                            >
                                {create.isPending ? 'Creating…' : 'Create order & invoice'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </>
    );
}
