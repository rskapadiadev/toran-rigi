import { formatMoney, toMinor } from '@shared/money';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Plus, Receipt, Wallet } from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from '@/components/ui/input-group';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { api, ApiError, post } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formString } from '@/motion/hooks';

import { FormField } from './kit/form';
import { InvoiceStatusBadge } from './kit/status';
import type { Invoice } from './types';

interface InvoiceItem {
    id: string;
    kind: string;
    description: string;
    qty: number;
    unitPrice: number;
    amount: number;
}

interface InvoicePayment {
    id: string;
    amount: number;
    method: string;
    reference: string | null;
    paidAt: string | null;
}

interface InvoiceDetail {
    invoice: Invoice;
    items: InvoiceItem[];
    payments: InvoicePayment[];
}

interface InvoicePanelProps {
    invoiceId: string;
    customerName?: string;
    customerPhone?: string | null;
    className?: string;
}

const whatsappDigits = (phone: string) => phone.replace(/[^\d]/g, '');
const failure = (error: unknown) =>
    error instanceof ApiError ? error.message : 'Something went wrong';

const methodLabel: Record<string, string> = {
    upi: 'UPI',
    cash: 'Cash',
    bank: 'Bank transfer',
    card: 'Card',
    online: 'Online',
};

export function InvoicePanel({
    invoiceId,
    customerName,
    customerPhone,
    className,
}: InvoicePanelProps) {
    const client = useQueryClient();
    const { data } = useQuery({
        queryKey: ['invoice', invoiceId],
        queryFn: () => api<InvoiceDetail>(`/admin/invoices/${invoiceId}`),
    });
    const [dialog, setDialog] = useState<'none' | 'payment' | 'item'>('none');
    const [itemKind, setItemKind] = useState<'extra' | 'discount'>('extra');
    const refresh = () => client.invalidateQueries();
    const pay = useMutation({
        mutationFn: (body: unknown) => post(`/admin/invoices/${invoiceId}/payments`, body),
        onSuccess: () => {
            setDialog('none');
            toast.success('Payment recorded');
            void refresh();
        },
        onError: (e) => toast.error(failure(e)),
    });
    const addItem = useMutation({
        mutationFn: (body: unknown) => post(`/admin/invoices/${invoiceId}/items`, body),
        onSuccess: () => {
            setDialog('none');
            toast.success(itemKind === 'discount' ? 'Discount applied' : 'Extra added');
            void refresh();
        },
        onError: (e) => toast.error(failure(e)),
    });

    if (!data)
        return (
            <Card className={className}>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        );
    const { invoice } = data;
    const money = (minor: number) => formatMoney(minor, invoice.currency);
    const paidPct = invoice.total ? Math.min(100, (invoice.amountPaid / invoice.total) * 100) : 0;
    const reminder = customerPhone
        ? `https://wa.me/${whatsappDigits(customerPhone)}?text=${encodeURIComponent(`Namaste ${customerName ?? ''}! A gentle reminder from Toran: ${money(invoice.balanceDue)} is remaining on invoice ${invoice.number}. Thank you ✦`)}`
        : null;

    const submitPayment = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        pay.mutate({
            amount: toMinor(Number(formString(f, 'amount'))),
            method: formString(f, 'method') || 'upi',
            reference: formString(f, 'reference') || undefined,
        });
    };
    const submitItem = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        addItem.mutate({
            kind: itemKind,
            description: formString(f, 'description'),
            qty: 1,
            unitPrice: toMinor(Number(formString(f, 'amount'))),
        });
    };
    const openChange = (open: boolean) => {
        if (!open) setDialog('none');
    };

    return (
        <Card className={cn('gap-5', className)}>
            <CardHeader>
                <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Receipt className="size-3.5" /> Invoice{' '}
                    <span className="font-mono">{invoice.number}</span>
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tracking-tight">
                    {money(invoice.balanceDue)}
                    <span className="ms-2 text-sm font-normal text-muted-foreground">
                        remaining
                    </span>
                </CardTitle>
                <CardAction>
                    <InvoiceStatusBadge status={invoice.status} />
                </CardAction>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Progress
                        value={paidPct}
                        aria-label="Paid so far"
                        className="h-1.5 [&>[data-slot=progress-indicator]]:bg-success"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                            {money(invoice.amountPaid)} of {money(invoice.total)} paid
                        </span>
                        <span>Due {invoice.dueDate}</span>
                    </div>
                </div>
                <div className="rounded-lg border bg-muted/30 text-sm">
                    <ul className="divide-y">
                        {data.items.map((item) => (
                            <li key={item.id} className="flex justify-between gap-3 px-3 py-2">
                                <span className="min-w-0 truncate">{item.description}</span>
                                <span
                                    className={cn(
                                        'shrink-0 tabular-nums',
                                        item.kind === 'discount' && 'text-success',
                                    )}
                                >
                                    {money(item.amount)}
                                </span>
                            </li>
                        ))}
                        {invoice.taxAmount > 0 && (
                            <li className="flex justify-between px-3 py-2 text-muted-foreground">
                                <span>Tax (included)</span>
                                <span className="tabular-nums">{money(invoice.taxAmount)}</span>
                            </li>
                        )}
                        <li className="flex justify-between px-3 py-2 font-medium">
                            <span>Total</span>
                            <span className="tabular-nums">{money(invoice.total)}</span>
                        </li>
                    </ul>
                </div>
                {data.payments.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Payments</p>
                        <ul className="space-y-1.5">
                            {data.payments.map((p) => (
                                <li key={p.id} className="flex items-center gap-3 text-sm">
                                    <span className="flex size-7 items-center justify-center rounded-full bg-success/10 text-success">
                                        <Wallet className="size-3.5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate">
                                            {methodLabel[p.method] ?? p.method}
                                            {p.reference ? ` · ${p.reference}` : ''}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {p.paidAt?.slice(0, 10)}
                                        </span>
                                    </span>
                                    <span className="font-medium text-success tabular-nums">
                                        −{money(p.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
            <Separator />
            <CardFooter className="flex-wrap gap-2">
                {invoice.balanceDue > 0 && (
                    <Button
                        size="sm"
                        onClick={() => {
                            setDialog('payment');
                        }}
                    >
                        <Wallet /> Record payment
                    </Button>
                )}
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        setItemKind('extra');
                        setDialog('item');
                    }}
                >
                    <Plus /> Extra or discount
                </Button>
                {reminder && invoice.balanceDue > 0 && (
                    <Button size="sm" variant="ghost" asChild>
                        <a href={reminder} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="text-success" /> Remind
                        </a>
                    </Button>
                )}
            </CardFooter>

            <Dialog open={dialog === 'payment'} onOpenChange={openChange}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={submitPayment} className="grid gap-6">
                        <DialogHeader>
                            <DialogTitle>Record payment</DialogTitle>
                            <DialogDescription>
                                {invoice.number} · {money(invoice.balanceDue)} remaining
                                {customerName ? ` for ${customerName}` : ''}.
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup className="gap-4">
                            <FormField label="Amount">
                                {(id) => (
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <InputGroupText>{invoice.currency}</InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            id={id}
                                            name="amount"
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            required
                                            className="tabular-nums"
                                            defaultValue={(invoice.balanceDue / 100).toString()}
                                        />
                                    </InputGroup>
                                )}
                            </FormField>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField label="Method">
                                    {(id) => (
                                        <Select name="method" defaultValue="upi">
                                            <SelectTrigger id={id} className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['upi', 'cash', 'bank', 'card'].map((m) => (
                                                    <SelectItem key={m} value={m}>
                                                        {methodLabel[m]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </FormField>
                                <FormField label="Reference">
                                    {(id) => (
                                        <Input
                                            id={id}
                                            name="reference"
                                            placeholder="UTR / receipt no."
                                        />
                                    )}
                                </FormField>
                            </div>
                        </FieldGroup>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={pay.isPending}>
                                {pay.isPending ? 'Saving…' : 'Save payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={dialog === 'item'} onOpenChange={openChange}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={submitItem} className="grid gap-6">
                        <DialogHeader>
                            <DialogTitle>Add to invoice</DialogTitle>
                            <DialogDescription>
                                Extras increase the total; discounts reduce it. The balance updates
                                instantly.
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup className="gap-4">
                            <ToggleGroup
                                type="single"
                                variant="outline"
                                value={itemKind}
                                aria-label="Line type"
                                className="w-full"
                                onValueChange={(v) => {
                                    if (v === 'extra' || v === 'discount') setItemKind(v);
                                }}
                            >
                                <ToggleGroupItem value="extra" className="flex-1">
                                    Extra (adds)
                                </ToggleGroupItem>
                                <ToggleGroupItem value="discount" className="flex-1">
                                    Discount (reduces)
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <FormField label="Description">
                                {(id) => (
                                    <Input
                                        id={id}
                                        name="description"
                                        required
                                        placeholder={
                                            itemKind === 'extra'
                                                ? 'Extra revision round'
                                                : 'Loyalty discount'
                                        }
                                    />
                                )}
                            </FormField>
                            <FormField label="Amount">
                                {(id) => (
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <InputGroupText>{invoice.currency}</InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            id={id}
                                            name="amount"
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            required
                                        />
                                    </InputGroup>
                                )}
                            </FormField>
                        </FieldGroup>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={addItem.isPending}>
                                Add to invoice
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
