import { can } from '@shared/permissions';
import { photoUrl } from '@shared/photos';
import type { AffiliateInput } from '@shared/schemas/affiliates';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Handshake, ImageUp, Loader2, Plus } from 'lucide-react';
import { type SyntheticEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

import { type Affiliate, affiliatesQuery } from '@/admin/affiliates';
import { PanelCard } from '@/admin/kit/card';
import { DataTable, inFilter, SortHeader } from '@/admin/kit/data-table';
import { FormField } from '@/admin/kit/form';
import { EmptyState, PageSkeleton, ToneBadge } from '@/admin/kit/page';
import { useMe } from '@/admin/useMe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { api, ApiError, patch, post, upload } from '@/lib/api';
import { formString } from '@/motion/hooks';

export const Route = createFileRoute('/admin/affiliates')({ component: AffiliatesPage });

// Fixed copy, so the heading does not change as the rows land.
const TITLE = 'Affiliates';
const SUBTITLE =
    'Planners, photographers and partners who refer couples. Their logo sits beside Toran’s on the invitations they refer.';

const failure = (e: unknown) => (e instanceof ApiError ? e.message : 'Something went wrong');

interface Row extends Affiliate {
    status: 'active' | 'paused';
}

interface LogoProps {
    affiliate: Affiliate;
    size: string;
}

function Logo({ affiliate, size }: LogoProps) {
    return (
        <span
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted ring-1 ring-border ${size}`}
        >
            {affiliate.logoKey ? (
                <img
                    src={photoUrl(affiliate.logoKey)}
                    alt=""
                    className="size-full object-contain p-1"
                />
            ) : (
                <Handshake className="size-4 text-muted-foreground" />
            )}
        </span>
    );
}

const columns: ColumnDef<Row>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <SortHeader column={column} title="Affiliate" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Logo affiliate={row.original} size="size-9" />
                <div className="min-w-0">
                    <p className="truncate font-medium">{row.original.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                        {row.original.code}
                    </p>
                </div>
            </div>
        ),
    },
    {
        id: 'contact',
        accessorFn: (a) => `${a.phone ?? ''} ${a.email ?? ''}`,
        header: 'Contact',
        cell: ({ row }) => (
            <div className="text-sm">
                {row.original.phone && <div dir="ltr">{row.original.phone}</div>}
                {row.original.email && (
                    <div className="text-xs text-muted-foreground">{row.original.email}</div>
                )}
                {!row.original.phone && !row.original.email && (
                    <span className="text-muted-foreground">—</span>
                )}
            </div>
        ),
    },
    {
        accessorKey: 'invitations',
        header: ({ column }) => <SortHeader column={column} title="Invitations" />,
        enableGlobalFilter: false,
        cell: ({ row }) => <span className="tabular-nums">{row.original.invitations}</span>,
    },
    {
        accessorKey: 'commissionBps',
        header: ({ column }) => <SortHeader column={column} title="Commission" />,
        enableGlobalFilter: false,
        cell: ({ row }) => (
            <span className="tabular-nums">{row.original.commissionBps / 100}%</span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        filterFn: inFilter,
        enableGlobalFilter: false,
        cell: ({ row }) =>
            row.original.status === 'active' ? (
                <ToneBadge tone="success">Active</ToneBadge>
            ) : (
                <ToneBadge tone="muted">Paused</ToneBadge>
            ),
    },
];

function AffiliatesPage() {
    const me = useMe();
    const canManage = can(me.data?.role, 'catalog.manage');
    // null: closed · 'new': adding · an affiliate: editing it.
    const [editing, setEditing] = useState<Affiliate | 'new' | null>(null);
    const { data, isPending } = useQuery({
        ...affiliatesQuery,
        queryFn: () => api<Affiliate[]>('/admin/affiliates'),
    });
    const rows: Row[] = (data ?? []).map((a) => ({
        ...a,
        status: a.isActive ? 'active' : 'paused',
    }));
    const addButton = canManage && (
        <Button
            size="sm"
            onClick={() => {
                setEditing('new');
            }}
        >
            <Plus /> Add affiliate
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
                    actions={addButton}
                >
                    {isPending ? (
                        <PageSkeleton />
                    ) : (
                        <EmptyState
                            className="flex-1"
                            icon={Handshake}
                            title="No affiliates yet"
                            description="Add a planner or photographer, then pick them on an invitation under Design → Branding."
                        />
                    )}
                </PanelCard>
            ) : (
                <DataTable
                    title={TITLE}
                    subtitle={SUBTITLE}
                    noun="affiliates"
                    columns={columns}
                    data={rows}
                    actions={addButton}
                    searchPlaceholder="Search name, code or contact…"
                    initialSorting={[
                        {
                            id: 'name',
                            desc: false,
                        },
                    ]}
                    facets={[
                        {
                            columnId: 'status',
                            title: 'Status',
                            options: [
                                {
                                    value: 'active',
                                    label: 'Active',
                                },
                                {
                                    value: 'paused',
                                    label: 'Paused',
                                },
                            ],
                        },
                    ]}
                    rowLabel={(a) => `Edit ${a.name}`}
                    onRowClick={(a) => {
                        setEditing(a);
                    }}
                />
            )}
            <Sheet
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) setEditing(null);
                }}
            >
                <SheetContent className="w-full sm:max-w-md">
                    {editing !== null && (
                        <AffiliateForm
                            key={editing === 'new' ? 'new' : editing.id}
                            affiliate={editing === 'new' ? null : editing}
                            canManage={canManage}
                            onClose={() => {
                                setEditing(null);
                            }}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

interface FormProps {
    affiliate: Affiliate | null;
    canManage: boolean;
    onClose: () => void;
}

function AffiliateForm({ affiliate, canManage, onClose }: FormProps) {
    const client = useQueryClient();
    const [active, setActive] = useState(affiliate?.isActive ?? true);
    // A logo picked before the affiliate exists is uploaded right after it is created.
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        affiliate?.logoKey ? photoUrl(affiliate.logoKey) : null,
    );
    const fileInput = useRef<HTMLInputElement>(null);

    const save = useMutation({
        mutationFn: async (body: AffiliateInput) => {
            const id = affiliate
                ? (await patch(`/admin/affiliates/${affiliate.id}`, body), affiliate.id)
                : (await post<{ id: string }>('/admin/affiliates', body)).id;
            if (logo) {
                const form = new FormData();
                form.append('file', logo);
                await upload(`/admin/affiliates/${id}/logo`, form);
            }
        },
        onSuccess: async () => {
            toast.success(affiliate ? 'Affiliate saved' : 'Affiliate added');
            await client.invalidateQueries(affiliatesQuery);
            onClose();
        },
        onError: (e) => toast.error(failure(e)),
    });

    const submit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        save.mutate({
            name: formString(f, 'name'),
            details: formString(f, 'details'),
            website: formString(f, 'website'),
            email: formString(f, 'email'),
            phone: formString(f, 'phone'),
            commission: Number(formString(f, 'commission') || '0'),
            isActive: active,
        });
    };

    return (
        <form onSubmit={submit} className="flex h-full flex-col">
            <SheetHeader className="border-b">
                <SheetTitle>{affiliate ? affiliate.name : 'Add affiliate'}</SheetTitle>
                <SheetDescription>
                    {affiliate
                        ? `Referral code ${affiliate.code} · on ${String(affiliate.invitations)} invitation${affiliate.invitations === 1 ? '' : 's'}`
                        : 'A referral code is made from the name.'}
                </SheetDescription>
            </SheetHeader>
            <fieldset disabled={!canManage} className="flex-1 space-y-4 overflow-y-auto p-4">
                <div className="flex items-center gap-4">
                    <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                        {logoPreview ? (
                            <img
                                src={logoPreview}
                                alt=""
                                className="size-full object-contain p-2"
                            />
                        ) : (
                            <Handshake className="size-6 text-muted-foreground" />
                        )}
                    </span>
                    <div className="space-y-1.5">
                        <input
                            ref={fileInput}
                            type="file"
                            accept="image/png,image/webp,image/jpeg,image/avif"
                            hidden
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setLogo(file);
                                    setLogoPreview(URL.createObjectURL(file));
                                }
                                e.target.value = '';
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInput.current?.click()}
                        >
                            <ImageUp /> {logoPreview ? 'Change logo' : 'Upload logo'}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            A transparent PNG looks best. Shown about 40px tall.
                        </p>
                    </div>
                </div>
                <FormField label="Name">
                    {(id) => (
                        <Input
                            id={id}
                            name="name"
                            required
                            minLength={2}
                            maxLength={120}
                            defaultValue={affiliate?.name}
                        />
                    )}
                </FormField>
                <FormField label="Details" description="What they do, city, notes for the studio.">
                    {(id) => (
                        <Textarea
                            id={id}
                            name="details"
                            rows={3}
                            maxLength={600}
                            defaultValue={affiliate?.details ?? ''}
                        />
                    )}
                </FormField>
                <FormField label="Website" description="Their logo links here on invitations.">
                    {(id) => (
                        <Input
                            id={id}
                            name="website"
                            type="url"
                            dir="ltr"
                            placeholder="https://…"
                            defaultValue={affiliate?.website ?? ''}
                        />
                    )}
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                    <FormField label="Phone">
                        {(id) => (
                            <Input
                                id={id}
                                name="phone"
                                type="tel"
                                dir="ltr"
                                defaultValue={affiliate?.phone ?? ''}
                            />
                        )}
                    </FormField>
                    <FormField label="Commission %">
                        {(id) => (
                            <Input
                                id={id}
                                name="commission"
                                type="number"
                                min={0}
                                max={100}
                                step={0.5}
                                defaultValue={(affiliate?.commissionBps ?? 1000) / 100}
                            />
                        )}
                    </FormField>
                </div>
                <FormField label="Email">
                    {(id) => (
                        <Input
                            id={id}
                            name="email"
                            type="email"
                            defaultValue={affiliate?.email ?? ''}
                        />
                    )}
                </FormField>
                <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <label htmlFor="affiliate-active">
                        <span className="block text-sm font-medium">Active</span>
                        <span className="block text-xs text-muted-foreground">
                            Paused affiliates disappear from invitations.
                        </span>
                    </label>
                    <Switch id="affiliate-active" checked={active} onCheckedChange={setActive} />
                </div>
            </fieldset>
            {canManage && (
                <SheetFooter className="border-t">
                    <Button type="submit" disabled={save.isPending}>
                        {save.isPending && <Loader2 className="animate-spin" />}
                        {affiliate ? 'Save' : 'Add affiliate'}
                    </Button>
                </SheetFooter>
            )}
        </form>
    );
}
