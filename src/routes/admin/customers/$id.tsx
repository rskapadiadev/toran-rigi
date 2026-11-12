import { formatMoney } from '@shared/money';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { BookOpen, Mail, MessageCircle, Phone, Scale } from 'lucide-react';

import { InvoicePanel } from '@/admin/InvoicePanel';
import { PageHeader, PageSkeleton, Panel, StatCard, ToneBadge } from '@/admin/kit/page';
import { initials } from '@/admin/shell/nav';
import type { Invoice } from '@/admin/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface LedgerEntry {
    date: string;
    kind: 'invoice' | 'payment' | 'credit';
    ref: string;
    currency: string;
    debit: number;
    credit: number;
    balance: number;
}

interface Ledger {
    customer: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        country: string;
    };
    invoices: Invoice[];
    ledger: LedgerEntry[];
    remaining: Record<string, number>;
}

export const Route = createFileRoute('/admin/customers/$id')({ component: CustomerPage });

const kindTone = {
    invoice: 'info',
    payment: 'success',
    credit: 'violet',
} as const;

function CustomerPage() {
    const { id } = Route.useParams();
    const { data } = useQuery({
        queryKey: ['customer', id],
        queryFn: () => api<Ledger>(`/admin/customers/${id}`),
    });
    if (!data) return <PageSkeleton />;
    const { customer } = data;
    return (
        <>
            <PageHeader
                title={
                    <span className="flex items-center gap-3">
                        <Avatar className="size-10">
                            <AvatarFallback className="bg-primary/8 text-sm font-semibold text-primary">
                                {initials(customer.name)}
                            </AvatarFallback>
                        </Avatar>
                        {customer.name}
                    </span>
                }
                description={
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {customer.phone && (
                            <span className="inline-flex items-center gap-1.5" dir="ltr">
                                <Phone className="size-3.5" /> {customer.phone}
                            </span>
                        )}
                        {customer.email && (
                            <span className="inline-flex items-center gap-1.5">
                                <Mail className="size-3.5" /> {customer.email}
                            </span>
                        )}
                        <span>{customer.country}</span>
                    </span>
                }
                actions={
                    customer.phone && (
                        <Button variant="outline" asChild>
                            <a
                                href={`https://wa.me/${customer.phone.replace(/[^\d]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle className="text-success" /> WhatsApp
                            </a>
                        </Button>
                    )
                }
            />
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Object.entries(data.remaining).map(([currency, amount]) => (
                    <StatCard
                        key={currency}
                        label={`Remaining · ${currency}`}
                        value={formatMoney(amount, currency)}
                        icon={Scale}
                        accent={amount > 0 ? 'danger' : 'success'}
                        hint={amount > 0 ? 'Still to be paid' : 'Fully settled'}
                    />
                ))}
                <StatCard label="Invoices" value={data.invoices.length} icon={BookOpen} />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                <Panel
                    title="Ledger"
                    icon={BookOpen}
                    description="Every invoice, payment and credit in order."
                    contentClassName="p-0"
                >
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                {['Date', 'Entry', 'Billed', 'Paid', 'Running balance'].map((h) => (
                                    <TableHead
                                        key={h}
                                        className="px-4 text-xs text-muted-foreground first:ps-5 last:pe-5 last:text-end"
                                    >
                                        {h}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.ledger.map((e, i) => (
                                <TableRow key={`${e.ref}-${String(i)}`}>
                                    <TableCell className="px-4 ps-5 text-muted-foreground">
                                        {e.date}
                                    </TableCell>
                                    <TableCell className="px-4">
                                        <span className="flex items-center gap-2">
                                            <ToneBadge
                                                tone={kindTone[e.kind]}
                                                className="capitalize"
                                            >
                                                {e.kind}
                                            </ToneBadge>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {e.ref}
                                            </span>
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 tabular-nums">
                                        {e.debit ? formatMoney(e.debit, e.currency) : ''}
                                    </TableCell>
                                    <TableCell className="px-4 text-success tabular-nums">
                                        {e.credit ? formatMoney(e.credit, e.currency) : ''}
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            'px-4 pe-5 text-end font-medium tabular-nums',
                                            e.balance > 0 ? 'text-destructive' : 'text-success',
                                        )}
                                    >
                                        {formatMoney(e.balance, e.currency)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
                <div className="space-y-4">
                    {data.invoices.map((inv) => (
                        <InvoicePanel
                            key={inv.id}
                            invoiceId={inv.id}
                            customerName={customer.name}
                            customerPhone={customer.phone}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
