import { convertUsd, type RateSnapshot } from '@shared/fx';
import { formatMoney } from '@shared/money';
import { occasionOf } from '@shared/occasions';
import { can } from '@shared/permissions';
import { photoUrl } from '@shared/photos';
import { DEFAULT_TEMPLATE_PRICE, type PriceMap, shopPrice } from '@shared/pricing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Globe, Loader2, RefreshCw, Tag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { PanelCard } from '@/admin/kit/card';
import { DataTable, inFilter, SortHeader } from '@/admin/kit/data-table';
import { EmptyState, PageSkeleton, ToneBadge } from '@/admin/kit/page';
import { fromDraft, MoneyInputs, toDraft } from '@/admin/pricing/MoneyInput';
import { type TemplateRow, templatesQuery } from '@/admin/templates/types';
import { useMe } from '@/admin/useMe';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { api, ApiError, patch, post } from '@/lib/api';

export const Route = createFileRoute('/admin/pricing')({ component: PricingPage });

// Fixed copy, so the heading does not change as the rows land.
const TITLE = 'Pricing';
const SUBTITLE =
    'What each design costs: ₹ for India, $ for everyone else (shown in their own currency).';

const failure = (e: unknown) => (e instanceof ApiError ? e.message : 'Something went wrong');

// "₹799 · $50"; a missing currency takes the fallback (the default price), or is left out.
function money(map: PriceMap | null, fallback: PriceMap | null) {
    const inr = map?.INR ?? fallback?.INR;
    const usd = map?.USD ?? fallback?.USD;
    const parts = [
        inr === undefined ? null : formatMoney(inr, 'INR'),
        usd === undefined ? null : formatMoney(usd, 'USD'),
    ];
    return parts.filter(Boolean).join(' · ');
}

interface PriceRow extends TemplateRow {
    occasion: string;
    sale: 'sale' | 'full';
    off: number | null;
    // The ₹ price, for sorting.
    inr: number;
}

function toRow(t: TemplateRow): PriceRow {
    const shop = shopPrice(t.prices, t.comparePrices, 'INR');
    return {
        ...t,
        occasion: occasionOf(t.eventKind).name.en ?? t.eventKind,
        sale: shop?.compare ? 'sale' : 'full',
        off: shop?.off ?? null,
        inr: shop?.price ?? 0,
    };
}

const statusLabel: Record<TemplateRow['status'], string> = {
    published: 'In the shop',
    draft: 'Draft',
    archived: 'Archived',
};

const columns: ColumnDef<PriceRow>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <SortHeader column={column} title="Design" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <span className="h-10 w-6 shrink-0 overflow-hidden rounded-sm bg-muted ring-1 ring-border">
                    {row.original.posterKey && (
                        <img
                            src={photoUrl(row.original.posterKey)}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover object-top"
                        />
                    )}
                </span>
                <span className="font-medium">{row.original.name}</span>
            </div>
        ),
    },
    {
        accessorKey: 'occasion',
        header: ({ column }) => <SortHeader column={column} title="Occasion" />,
        filterFn: inFilter,
    },
    {
        accessorKey: 'inr',
        header: ({ column }) => <SortHeader column={column} title="Price" />,
        enableGlobalFilter: false,
        cell: ({ row }) => (
            <span className="tabular-nums">
                {money(row.original.prices, DEFAULT_TEMPLATE_PRICE)}
            </span>
        ),
    },
    {
        id: 'was',
        header: 'Was',
        enableGlobalFilter: false,
        cell: ({ row }) => {
            const was = money(row.original.comparePrices, null);
            return was ? (
                <s className="text-muted-foreground tabular-nums">{was}</s>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
    },
    {
        accessorKey: 'sale',
        header: 'Sale',
        filterFn: inFilter,
        enableGlobalFilter: false,
        cell: ({ row }) =>
            row.original.off ? (
                <ToneBadge tone="success">{row.original.off}% off</ToneBadge>
            ) : (
                <ToneBadge tone="muted">Full price</ToneBadge>
            ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        filterFn: inFilter,
        enableGlobalFilter: false,
        cell: ({ row }) => (
            <ToneBadge tone={row.original.status === 'published' ? 'success' : 'muted'}>
                {statusLabel[row.original.status]}
            </ToneBadge>
        ),
    },
];

function PricingPage() {
    const me = useMe();
    const canManage = can(me.data?.role, 'catalog.manage');
    const [editing, setEditing] = useState<TemplateRow | null>(null);
    const [ratesOpen, setRatesOpen] = useState(false);
    const { data, isPending } = useQuery({
        ...templatesQuery,
        queryFn: () => api<TemplateRow[]>('/admin/templates'),
    });
    const rows = (data ?? []).map(toRow);
    const occasions = [...new Set(rows.map((r) => r.occasion))].sort();
    const ratesButton = (
        <Button
            variant="outline"
            size="sm"
            onClick={() => {
                setRatesOpen(true);
            }}
        >
            <Globe /> Exchange rates
        </Button>
    );

    return (
        <>
            {isPending || rows.length === 0 ? (
                <PanelCard
                    fill
                    contentClassName="flex min-h-[60svh] flex-col lg:min-h-0"
                    title={TITLE}
                    subtitle={SUBTITLE}
                >
                    {isPending ? (
                        <PageSkeleton />
                    ) : (
                        <EmptyState
                            className="flex-1"
                            icon={Tag}
                            title="No designs yet"
                            description="Create a template; it starts at ₹799 / $50."
                        />
                    )}
                </PanelCard>
            ) : (
                <DataTable
                    title={TITLE}
                    subtitle={SUBTITLE}
                    noun="designs"
                    columns={columns}
                    data={rows}
                    actions={ratesButton}
                    searchPlaceholder="Search designs…"
                    initialSorting={[
                        {
                            id: 'name',
                            desc: false,
                        },
                    ]}
                    facets={[
                        {
                            columnId: 'occasion',
                            title: 'Occasion',
                            options: occasions.map((o) => ({
                                value: o,
                                label: o,
                            })),
                        },
                        {
                            columnId: 'sale',
                            title: 'Sale',
                            options: [
                                {
                                    value: 'sale',
                                    label: 'On sale',
                                },
                                {
                                    value: 'full',
                                    label: 'Full price',
                                },
                            ],
                        },
                        {
                            columnId: 'status',
                            title: 'Status',
                            options: (['published', 'draft', 'archived'] as const).map((s) => ({
                                value: s,
                                label: statusLabel[s],
                            })),
                        },
                    ]}
                    rowLabel={(r) => `Edit ${r.name} price`}
                    onRowClick={(r) => {
                        setEditing(r);
                    }}
                />
            )}
            <PriceSheet
                template={editing}
                canManage={canManage}
                onClose={() => {
                    setEditing(null);
                }}
            />
            <RatesSheet
                open={ratesOpen}
                canManage={canManage}
                onClose={() => {
                    setRatesOpen(false);
                }}
            />
        </>
    );
}

interface PriceSheetProps {
    template: TemplateRow | null;
    canManage: boolean;
    onClose: () => void;
}

// A row's edit panel, like a customer's or a template's details.
function PriceSheet({ template, canManage, onClose }: PriceSheetProps) {
    return (
        <Sheet
            open={template !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <SheetContent className="w-full sm:max-w-md">
                {template && (
                    <PriceForm
                        key={template.id}
                        template={template}
                        canManage={canManage}
                        onClose={onClose}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}

interface PriceFormProps {
    template: TemplateRow;
    canManage: boolean;
    onClose: () => void;
}

function PriceForm({ template, canManage, onClose }: PriceFormProps) {
    const client = useQueryClient();
    const [price, setPrice] = useState(() => toDraft(template.prices));
    const [was, setWas] = useState(() => toDraft(template.comparePrices));
    const save = useMutation({
        mutationFn: () =>
            patch(`/admin/templates/${template.id}`, {
                prices: fromDraft(price),
                comparePrices: fromDraft(was),
            }),
        onSuccess: async () => {
            toast.success(`${template.name} price saved`);
            await client.invalidateQueries(templatesQuery);
            onClose();
        },
        onError: (e) => toast.error(failure(e)),
    });
    return (
        <form
            className="flex h-full flex-col"
            onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
            }}
        >
            <SheetHeader className="border-b">
                <SheetTitle>{template.name}</SheetTitle>
                <SheetDescription>
                    {occasionOf(template.eventKind).name.en} · India pays the ₹ price; everyone else
                    pays the $ price in their own currency.
                </SheetDescription>
            </SheetHeader>
            <fieldset disabled={!canManage} className="flex-1 space-y-5 overflow-y-auto p-4">
                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/80">Price</p>
                    <MoneyInputs
                        label="Price"
                        value={price}
                        onChange={setPrice}
                        placeholders={DEFAULT_TEMPLATE_PRICE}
                    />
                    <p className="text-xs text-muted-foreground">
                        Empty means the default (shown greyed).
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/80">
                        Was price <span className="text-muted-foreground">(optional)</span>
                    </p>
                    <MoneyInputs label="Was price" value={was} onChange={setWas} />
                    <p className="text-xs text-muted-foreground">
                        Shown struck through with the saving, e.g. “₹999 ₹799 · 20% off”. Only shows
                        when higher than the price.
                    </p>
                </div>
            </fieldset>
            {canManage && (
                <SheetFooter className="border-t">
                    <Button type="submit" disabled={save.isPending}>
                        {save.isPending ? 'Saving…' : 'Save'}
                    </Button>
                </SheetFooter>
            )}
        </form>
    );
}

interface RatesSheetProps {
    open: boolean;
    canManage: boolean;
    onClose: () => void;
}

const sampleCurrencies = ['AED', 'GBP', 'EUR', 'CAD', 'AUD', 'SGD', 'SAR', 'NZD', 'JPY', 'BRL'];

// Outside India the $ price is shown in the visitor's currency at this snapshot, rounded clean.
function RatesSheet({ open, canManage, onClose }: RatesSheetProps) {
    const client = useQueryClient();
    const rates = useQuery({
        queryKey: ['fx'],
        queryFn: () => api<RateSnapshot | null>('/admin/fx'),
        enabled: open,
    });
    const refresh = useMutation({
        mutationFn: () => post<RateSnapshot>('/admin/fx/refresh', {}),
        onSuccess: async () => {
            toast.success('Exchange rates updated');
            await client.invalidateQueries({ queryKey: ['fx'] });
        },
        onError: (e) => toast.error(failure(e)),
    });
    const snapshot = rates.data ?? null;
    const updated = snapshot
        ? new Date(snapshot.updatedAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
          })
        : null;
    return (
        <Sheet
            open={open}
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
        >
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader className="border-b">
                    <SheetTitle>Exchange rates</SheetTitle>
                    <SheetDescription>
                        From open.er-api.com.{' '}
                        {updated
                            ? `Last updated ${updated}.`
                            : 'Not loaded yet: visitors outside India see US dollars.'}
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    <p className="text-sm">
                        {formatMoney(DEFAULT_TEMPLATE_PRICE.USD, 'USD')} is shown as
                    </p>
                    <ul className="grid grid-cols-2 gap-2">
                        {sampleCurrencies.map((c) => {
                            const local = convertUsd(DEFAULT_TEMPLATE_PRICE.USD, c, snapshot);
                            return (
                                <li
                                    key={c}
                                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm tabular-nums"
                                >
                                    <span className="text-xs text-muted-foreground">{c}</span>
                                    {local === null ? '—' : formatMoney(local, c)}
                                </li>
                            );
                        })}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                        Rates are fetched only when you refresh (and once, the first time a visitor
                        outside India needs a price), never per visitor. Prices are rounded so they
                        never move by a few cents. India always pays the ₹ price.
                    </p>
                </div>
                {canManage && (
                    <SheetFooter className="border-t">
                        <Button
                            disabled={refresh.isPending}
                            onClick={() => {
                                refresh.mutate();
                            }}
                        >
                            {refresh.isPending ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <RefreshCw />
                            )}
                            Refresh rates
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
